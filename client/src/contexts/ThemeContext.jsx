import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BUILT_IN_THEMES, THEME_CYBERPUNK_DARK } from '../themes/themes';

const ThemeContext = createContext(null);

const resolveAssetUrl = (value) => {
    if (!value) return '';
    return value.startsWith('/uploads') ? `http://localhost:3001${value}` : value;
};

const readStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

const getUserScope = (user) => {
    if (user?.user_id && !user?.isGuest) return `user:${user.user_id}`;
    return 'guest';
};

const getThemeKey = (user) => `game_theme:${getUserScope(user)}`;
const getCustomThemesKey = (user) => `game_custom_themes:${getUserScope(user)}`;

const createEquippedShopTheme = (user) => {
    const itemId = Number(user?.equipped_theme_id || 0);
    const backgroundImage = resolveAssetUrl(user?.theme_asset_url || user?.theme_preview_image || '');
    if (!itemId || !backgroundImage) return null;

    return {
        id: `shop-theme-${itemId}`,
        name: user.theme_name || 'Shop Theme',
        icon: 'Aa',
        category: 'shop',
        description: 'Theme Store',
        backgroundImage,
        colors: {
            '--t-bg': '#fff7fb',
            '--t-bg-soft': '#fff0f6',
            '--t-card': 'rgba(255, 255, 255, 0.82)',
            '--t-card-hover': 'rgba(255, 255, 255, 0.94)',
            '--t-input': 'rgba(255, 255, 255, 0.9)',
            '--t-text': '#4a2338',
            '--t-text-soft': '#85516b',
            '--t-muted': '#b08098',
            '--t-accent': '#ec4899',
            '--t-accent-soft': 'rgba(236, 72, 153, 0.14)',
            '--t-accent-hover': '#db2777',
            '--t-border': 'rgba(236, 72, 153, 0.16)',
        },
    };
};

const readCustomThemes = (user) => {
    try {
        return JSON.parse(localStorage.getItem(getCustomThemesKey(user)) || '[]');
    } catch {
        return [];
    }
};

const getInitialThemeId = (user) => {
    const equippedThemeId = Number(user?.equipped_theme_id || 0);
    if (equippedThemeId) return `shop-theme-${equippedThemeId}`;
    return localStorage.getItem(getThemeKey(user)) || THEME_CYBERPUNK_DARK.id;
};

// =============================================
// THEME PROVIDER
// =============================================
// Manages theme state, applies CSS variables to <html>,
// and provides API for switching/registering themes.
//
// Usage in components:
//   const { theme, setTheme, themes, registerTheme } = useTheme();
//
// Future Theme Shop integration:
//   registerTheme(purchasedThemeObject) — adds a new theme at runtime
//   setTheme('purchased-theme-id') — switches to it
// =============================================

export function ThemeProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => readStoredUser());

    // Load all themes (built-in + any saved custom ones)
    const [themes, setThemes] = useState(() => {
        const user = readStoredUser();
        const equippedTheme = createEquippedShopTheme(user);
        return [...BUILT_IN_THEMES, ...readCustomThemes(user), ...(equippedTheme ? [equippedTheme] : [])];
    });

    // Load active theme ID from localStorage
    const [activeThemeId, setActiveThemeId] = useState(() => {
        return getInitialThemeId(readStoredUser());
    });

    // Get current theme object
    const activeTheme = themes.find(t => t.id === activeThemeId) || THEME_CYBERPUNK_DARK;

    // Apply CSS variables to <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement;

        // Set data-theme attribute (useful for CSS selectors)
        root.setAttribute('data-theme', activeTheme.id);

        // Apply all CSS variables
        Object.entries(activeTheme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        root.style.setProperty(
            '--shop-theme-background',
            activeTheme.backgroundImage ? `url("${activeTheme.backgroundImage}")` : 'none',
        );

        // Save preference for the current user only.
        localStorage.setItem(getThemeKey(currentUser), activeTheme.id);
    }, [activeTheme, currentUser]);

    useEffect(() => {
        const syncFromUser = (nextUser = readStoredUser()) => {
            setCurrentUser(nextUser);
            const equippedTheme = createEquippedShopTheme(nextUser);
            const nextThemes = [...BUILT_IN_THEMES, ...readCustomThemes(nextUser), ...(equippedTheme ? [equippedTheme] : [])];
            setThemes(nextThemes);
            setActiveThemeId(getInitialThemeId(nextUser));
        };

        const onUserUpdated = (event) => syncFromUser(event.detail?.user || readStoredUser());
        const onStorage = (event) => {
            if (event.key === 'user') syncFromUser(readStoredUser());
        };

        window.addEventListener('pysim:user-updated', onUserUpdated);
        window.addEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('pysim:user-updated', onUserUpdated);
            window.removeEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // Switch theme by ID
    const setTheme = useCallback((themeId) => {
        if (themes.find(t => t.id === themeId)) {
            setActiveThemeId(themeId);
        } else {
            console.warn(`Theme "${themeId}" not found`);
        }
    }, [themes]);

    // Register a new theme (for future Theme Shop)
    // Persists to localStorage so it survives page reloads
    const registerTheme = useCallback((themeObj) => {
        if (!themeObj?.id || !themeObj?.colors) {
            console.error('Invalid theme object. Must have id and colors.');
            return false;
        }
        setThemes(prev => {
            // Replace if exists, add if new
            const existing = prev.findIndex(t => t.id === themeObj.id);
            const updated = [...prev];
            if (existing >= 0) {
                updated[existing] = themeObj;
            } else {
                updated.push(themeObj);
            }
            // Persist custom themes
            const customOnly = updated.filter(t => !BUILT_IN_THEMES.find(b => b.id === t.id));
            localStorage.setItem(getCustomThemesKey(currentUser), JSON.stringify(customOnly));
            return updated;
        });
        return true;
    }, [currentUser]);

    // Unregister a custom theme
    const unregisterTheme = useCallback((themeId) => {
        // Can't remove built-in themes
        if (BUILT_IN_THEMES.find(t => t.id === themeId)) return false;

        setThemes(prev => {
            const updated = prev.filter(t => t.id !== themeId);
            const customOnly = updated.filter(t => !BUILT_IN_THEMES.find(b => b.id === t.id));
            localStorage.setItem(getCustomThemesKey(currentUser), JSON.stringify(customOnly));
            return updated;
        });

        // If removing the active theme, switch to default
        if (activeThemeId === themeId) {
            setActiveThemeId(THEME_CYBERPUNK_DARK.id);
        }
        return true;
    }, [activeThemeId, currentUser]);

    const value = {
        theme: activeTheme,           // Current theme object
        themeId: activeTheme.id,      // Current theme ID
        setTheme,                      // Switch theme by ID
        themes,                        // All available themes
        registerTheme,                 // Add a new theme
        unregisterTheme,               // Remove a custom theme
        isDark: activeTheme.id.includes('dark'), // Quick check
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook for consuming theme
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
