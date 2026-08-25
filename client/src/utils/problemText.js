/**
 * Pick the right language for one piece of problem text.
 *
 * Every problem in the bank now carries a Thai and an English title and
 * description. Arcade already chose between them with a bare
 * `lang === 'en' ? source.title_en : source.title_th`, which shows an empty
 * heading for any problem that has not been translated yet - worse for the
 * reader than seeing Thai. So the fallback here is deliberate and goes both
 * ways: ask for a language, get that language when it exists, and get the other
 * one rather than a blank when it does not.
 */
export const pickLocalized = (lang, english, thai) => {
    const en = String(english ?? '').trim();
    const th = String(thai ?? '').trim();
    if (lang === 'en') return en || th;
    return th || en;
};

// The two shapes the API serves. Lesson and mini-game rows spell the English
// columns title_en/description_en; Arcade rows use title_th/title_en with no
// unsuffixed column at all.
export const problemTitle = (lang, row) =>
    pickLocalized(lang, row?.title_en, row?.title ?? row?.title_th);

export const problemDescription = (lang, row) =>
    pickLocalized(lang, row?.description_en ?? row?.desc_en, row?.description ?? row?.desc_th);
