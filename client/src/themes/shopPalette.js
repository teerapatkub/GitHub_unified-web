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

// --- colour arithmetic for shopThemeTokens --------------------------------

const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
};

// t = 0 gives a, t = 1 gives b.
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

const luminance = (rgb) => {
    const [r, g, b] = rgb.map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

// Darkens `fg` toward `ink` until it reads at `min`:1 on `bg`. A theme's accent
// is chosen to look good as a fill; as text it is often just under 4.5:1
// (sakura pink is 3.5:1 on white), and the theme must not cost readability.
const readable = (fg, bg, ink, min = 4.5) => {
    for (let t = 0; t <= 1; t += 0.05) {
        const candidate = mix(fg, ink, t);
        if (contrastRatio(candidate, bg) >= min) return candidate;
    }
    return ink;
};

const channels = (rgb) => rgb.join(' ');
const WHITE = [255, 255, 255];

// What a shop theme writes into the token layer (styles/tokens.css). Only the
// brand, surface, text and accent roles follow a theme; error, success, warning
// and info do not, because green has to keep meaning "passed".
export const shopThemeTokens = (palette) => {
    const bg = hexToRgb(palette.bg);
    const bgSoft = hexToRgb(palette.bgSoft);
    const text = hexToRgb(palette.text);
    const accent = hexToRgb(palette.accent);
    const accentHover = hexToRgb(palette.accentHover);
    const textSoft = readable(hexToRgb(palette.textSoft), bgSoft, text);
    const strong = readable(accentHover, WHITE, text);
    return {
        '--c-primary': channels(strong),
        '--c-primary-container': channels(accent),
        '--c-primary-fixed': channels(mix(accent, WHITE, 0.82)),
        '--c-on-primary-fixed': channels(text),
        '--c-surface': channels(bg),
        '--c-surface-low': channels(bgSoft),
        '--c-surface-container': channels(mix(bgSoft, accent, 0.06)),
        '--c-surface-high': channels(mix(bgSoft, accent, 0.1)),
        '--c-surface-highest': channels(mix(bgSoft, accent, 0.14)),
        '--c-surface-dim': channels(mix(bgSoft, accent, 0.18)),
        '--c-on-surface': channels(text),
        '--c-on-surface-variant': channels(textSoft),
        '--c-outline': channels(readable(mix(textSoft, bgSoft, 0.2), bgSoft, text)),
        '--c-outline-variant': channels(mix(accent, WHITE, 0.72)),
        '--c-label': channels(textSoft),
        '--c-accent': channels(accent),
        '--c-accent-strong': channels(strong),
        '--c-accent-container': channels(mix(accent, WHITE, 0.92)),
        '--c-accent-border': channels(mix(accent, WHITE, 0.7)),
    };
};

// The CSS variables a shop theme sets. Also shared, for the same reason the
// palette is: the two copies of this had already drifted apart on --t-input.
export const shopThemeColors = (palette) => ({
    ...shopThemeTokens(palette),
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
