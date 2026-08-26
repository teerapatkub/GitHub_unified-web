import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BUILT_IN_THEMES, THEME_CYBERPUNK_DARK } from '../themes/themes';
import { getShopThemePalette, shopThemeColors } from '../themes/shopPalette.js';
import { API_BASE, assetUrl } from '../config/api.js';

const ThemeContext = createContext(null);

const resolveAssetUrl = (value) => {
    if (!value) return '';
    return assetUrl(value);
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
    const palette = getShopThemePalette(user);

    return {
        id: `shop-theme-${itemId}`,
        name: user.theme_name || 'Shop Theme',
        icon: 'Aa',
        category: 'shop',
        description: 'Theme Store',
        backgroundImage,
        colors: shopThemeColors(palette),
    };
};

const readCustomThemes = (user) => {
    try {
        return JSON.parse(localStorage.getItem(getCustomThemesKey(user)) || '[]');
    } catch {
        return [];
    }
};

// The theme list, in priority order.
//
// A saved snapshot with the same id as the currently equipped theme is dropped:
// the live one is rebuilt from the user's row and today's palette, the snapshot
// is whatever the shop happened to write the day it was equipped. Keeping both
// meant the stale copy won, because `find` returns the first match - which is
// how a new theme kept coming out in the previous theme's colours.
const composeThemes = (user, equippedTheme) => {
    const cached = readCustomThemes(user)
        .filter((theme) => !equippedTheme || theme.id !== equippedTheme.id);
    return [...BUILT_IN_THEMES, ...cached, ...(equippedTheme ? [equippedTheme] : [])];
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
        return composeThemes(user, equippedTheme);
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
            const nextThemes = composeThemes(nextUser, equippedTheme);
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
