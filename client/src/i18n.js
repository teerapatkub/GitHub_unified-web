// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// The language a player picked is remembered in localStorage (i18nextLng) and
// read back first. This used to pass `lng: 'th'`, which overrides detection,
// so choosing English lasted only until the next refresh (bug U1). The
// detector reads only storage, never the browser's own language: a new visitor
// still starts in Thai, the site's audience.
i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['en', 'th'],
        fallbackLng: 'th',
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
        },
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    });

// Screen readers pick their voice from <html lang>; it said "en" on a Thai
// page (audit P1 #2).
const syncDocumentLanguage = (lng) => {
    if (typeof document !== 'undefined') document.documentElement.lang = String(lng || 'th').startsWith('en') ? 'en' : 'th';
};
syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
