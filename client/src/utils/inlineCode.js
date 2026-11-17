// Splits problem text into plain text and `code` spans (the Markdown
// backtick convention the problem bank and the AI use). A span is a closed
// pair of backticks with at least one character between them on one line;
// anything else, a lone backtick included, stays plain text. Empty plain
// pieces are dropped. Used by components/ui/InlineCodeText.jsx.
export function splitInlineCode(text) {
  const source = String(text ?? '');
  if (!source) return [];
  return source
    .split(/(`[^`\n]+`)/g)
    .filter((part) => part !== '')
    .map((part) => (
      part.length > 2 && part.startsWith('`') && part.endsWith('`')
        ? { code: true, text: part.slice(1, -1) }
        : { code: false, text: part }
    ));
}
