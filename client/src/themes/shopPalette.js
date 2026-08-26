// What colours a shop theme paints the app in.
//
// ONE copy, on purpose. There used to be two - one in ThemeContext.jsx and one
// in ShopPage.jsx - and they drifted the moment a theme was added: the shop
// wrote its own palette into the cached theme it saves at equip time, so a new
// theme came out sakura pink no matter what ThemeContext had been taught about
// it. Nothing errored; the background image was right and only the colours were
// wrong, which is exactly the kind of bug that ships.
//
// Matching is by keyword against the theme's name and asset path rather than by
// id, because the ids are database rows that differ between every installation
// while '/uploads/cyber-theme.svg' is the same everywhere.
//
// Adding a theme: put its artwork in server/uploads with a name containing the
// keyword, add a branch here, and register the set in server/db.js.
export const getShopThemePalette = (source) => {
    const themeText = [
        source?.name,
        source?.assetUrl,
        source?.previewImage,
        source?.theme_asset_url,
        source?.theme_preview_image,
        source?.theme_name,
    ].filter(Boolean).join(' ').toLowerCase();

    if (themeText.includes('ocean')) {
        return {
            bg: '#f1fdff',
            bgSoft: '#e6f9fb',
            text: '#164e63',
            textSoft: '#397281',
            muted: '#6aa3ad',
            accent: '#0891b2',
            accentSoft: 'rgba(8, 145, 178, 0.14)',
            accentHover: '#0e7490',
            border: 'rgba(8, 145, 178, 0.2)',
            surface: 'rgba(241, 253, 255, 0.9)',
            navbarOverlay: 'rgba(241, 253, 255, 0.74)',
            navbarBorder: 'rgba(8, 145, 178, 0.22)',
            navBg: 'rgba(255, 255, 255, 0.78)',
        };
    }

    // Neon magenta on pale cyan. Checked before 'ocean' would be wrong - both
    // are cyan-ish - but the accent is what separates them: cyan for ocean,
    // magenta for cyber, so the two never look like the same theme.
    if (themeText.includes('cyber')) {
        return {
            bg: '#f3feff',
            bgSoft: '#e4fbfd',
            text: '#10303a',
            textSoft: '#2b6474',
            muted: '#62a3b0',
            accent: '#e11d8f',
            accentSoft: 'rgba(225, 29, 143, 0.12)',
            accentHover: '#be1273',
            border: 'rgba(225, 29, 143, 0.18)',
            surface: 'rgba(243, 254, 255, 0.9)',
            navbarOverlay: 'rgba(243, 254, 255, 0.72)',
            navbarBorder: 'rgba(225, 29, 143, 0.2)',
            navBg: 'rgba(255, 255, 255, 0.8)',
        };
    }

    // Grass green, the colour every 8-bit starter level is made of.
    if (themeText.includes('pixel')) {
        return {
            bg: '#f2fbf4',
            bgSoft: '#e8f7ec',
            text: '#234c33',
            textSoft: '#3f6f4f',
            muted: '#7aa389',
            accent: '#16a34a',
            accentSoft: 'rgba(22, 163, 74, 0.13)',
            accentHover: '#15803d',
            border: 'rgba(22, 163, 74, 0.18)',
            surface: 'rgba(242, 251, 244, 0.9)',
            navbarOverlay: 'rgba(242, 251, 244, 0.74)',
            navbarBorder: 'rgba(22, 163, 74, 0.2)',
            navBg: 'rgba(255, 255, 255, 0.8)',
        };
    }

    if (themeText.includes('space')) {
        return {
            bg: '#f7f8ff',
            bgSoft: '#eef1ff',
            text: '#302e63',
            textSoft: '#5b5f94',
            muted: '#858dc3',
            accent: '#7c3aed',
            accentSoft: 'rgba(124, 58, 237, 0.13)',
            accentHover: '#6d28d9',
            border: 'rgba(124, 58, 237, 0.18)',
            surface: 'rgba(247, 248, 255, 0.9)',
            navbarOverlay: 'rgba(247, 248, 255, 0.74)',
            navbarBorder: 'rgba(124, 58, 237, 0.2)',
            navBg: 'rgba(255, 255, 255, 0.8)',
        };
    }

    // Sakura, and the fallback for any theme with no branch of its own.
    return {
        bg: '#fff7fb',
        bgSoft: '#fff0f6',
        text: '#4a2338',
        textSoft: '#85516b',
        muted: '#b08098',
        accent: '#ec4899',
        accentSoft: 'rgba(236, 72, 153, 0.14)',
        accentHover: '#db2777',
        border: 'rgba(236, 72, 153, 0.16)',
        surface: 'rgba(255, 247, 251, 0.88)',
        navbarOverlay: 'rgba(255, 247, 251, 0.72)',
        navbarBorder: 'rgba(236, 72, 153, 0.18)',
        navBg: 'rgba(255, 255, 255, 0.76)',
    };
};

// The CSS variables a shop theme sets. Also shared, for the same reason the
// palette is: the two copies of this had already drifted apart on --t-input.
export const shopThemeColors = (palette) => ({
    '--t-bg': palette.bg,
    '--t-bg-soft': palette.bgSoft,
    '--t-card': 'rgba(255, 255, 255, 0.82)',
    '--t-card-hover': 'rgba(255, 255, 255, 0.94)',
    '--t-input': 'rgba(255, 255, 255, 0.9)',
    '--t-text': palette.text,
    '--t-text-soft': palette.textSoft,
    '--t-muted': palette.muted,
    '--t-accent': palette.accent,
    '--t-accent-soft': palette.accentSoft,
    '--t-accent-hover': palette.accentHover,
    '--t-border': palette.border,
    '--shop-theme-surface': palette.surface,
    '--shop-theme-navbar-overlay': palette.navbarOverlay,
    '--shop-theme-navbar-border': palette.navbarBorder,
    '--shop-theme-nav-bg': palette.navBg,
});
