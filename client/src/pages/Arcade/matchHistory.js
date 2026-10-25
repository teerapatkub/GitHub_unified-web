// Pure helpers for the Arcade match-history views (Spec 0005 ticket 10).

// Server timestamps come back without a zone marker (see parseUtcTimestamp in
// constants.js for the same problem on phase deadlines). Thai readers get the
// Buddhist-era date used everywhere else on the site ("25 ต.ค. 2569 22:02");
// the lobby used to print US format (bug A7).
export function formatMatchDate(raw, lang) {
  if (!raw) return '';
  const iso = String(raw).includes('T') ? String(raw) : String(raw).replace(' ', 'T');
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '';
  const locale = lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}

// "Load more" appends the next page; a match that shows up twice (a match
// finishing between two requests shifts nothing, but a retried request can
// repeat) is kept once, newest first.
export function mergeMatchPages(existing, incoming) {
  const seen = new Set();
  return [...existing, ...incoming]
    .filter(match => (seen.has(match.match_id) ? false : seen.add(match.match_id)))
    .sort((a, b) => b.match_id - a.match_id);
}

export function historyQuery({ limit, before, difficulty, roundDurationMode }) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', String(before));
  if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
  if (roundDurationMode && roundDurationMode !== 'all') params.set('round_duration_mode', roundDurationMode);
  return params.toString();
}
