import { pickLocalized } from './problemText.js';

/**
 * English or Thai for lessons, chapters, cosmetics and achievements (fix list
 * item 16.10). Those rows keep Thai in the plain column (`title`, `name`,
 * `description`) and English beside it (`title_en`, `name_en`,
 * `description_en`, server/migrate-english-names.js). Same rule as problems:
 * ask for a language, get the other one rather than a blank when it is missing.
 *
 * `lang` is i18next's language; anything but 'en' is Thai.
 */
const asLang = (lang) => (String(lang || '').startsWith('en') ? 'en' : 'th');

export const contentTitle = (lang, row) => pickLocalized(asLang(lang), row?.title_en, row?.title);

export const contentName = (lang, row) => pickLocalized(asLang(lang), row?.name_en, row?.name);

export const contentDescription = (lang, row) =>
    pickLocalized(asLang(lang), row?.description_en, row?.description);
