// Splits a lesson "code" slide into its explanation, its runnable code and the
// output the lesson says it prints.
//
// Most code slides in the lesson content are written for people, not for the
// Python runner: a Thai sentence, then `ตัวอย่างโค้ด:`, the code, then
// `ผลลัพธ์:` and the output; or a sentence followed by a ```python fence.
// The slide used to hand the whole text to Pyodide, so 106 of the 125 code
// slides stopped at a SyntaxError on the first Thai line.

const THAI = /[฀-๿]/;
const FENCE = /```[a-zA-Z]*\n([\s\S]*?)```/g;
const OUTPUT_LABEL = /^ผลลัพธ์[^:]{0,30}:\s*$/;
const EXAMPLE_LABEL = /^ตัวอย่างโค้ด\s*:?\s*$/;

// Drops blank lines at both ends but keeps the first line's indentation.
const trimBlankLines = (text) => text.replace(/^(?:[ \t]*\n)+/, '').replace(/(?:\n[ \t]*)+$/, '').replace(/^[ \t]+$/, '');

// A line is prose when it has Thai outside string literals and comments.
const isProse = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return false;
  const withoutStrings = trimmed
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/#.*$/, '');
  return THAI.test(withoutStrings);
};

const splitOutput = (lines) => {
  const at = lines.findIndex((line) => OUTPUT_LABEL.test(line.trim()));
  if (at === -1) return { body: lines, output: '' };
  return { body: lines.slice(0, at), output: trimBlankLines(lines.slice(at + 1).join('\n')) };
};

const splitFenced = (text) => {
  const blocks = [...text.matchAll(FENCE)];
  const first = blocks[0];
  const last = blocks[blocks.length - 1];
  const before = text.slice(0, first.index);
  const after = text.slice(last.index + last[0].length);
  const { body: afterBody, output } = splitOutput(after.split('\n'));
  const intro = [trimBlankLines(before), trimBlankLines(afterBody.join('\n'))].filter(Boolean).join('\n\n');
  return {
    intro,
    code: blocks.map((block) => trimBlankLines(block[1])).join('\n\n'),
    output,
  };
};

export const splitCodeSlide = (content) => {
  const text = String(content ?? '').replace(/\r\n?/g, '\n');
  if (!text.trim()) return { intro: '', code: '', output: '' };
  if (/```[a-zA-Z]*\n[\s\S]*?```/.test(text)) return splitFenced(text);

  const { body, output } = splitOutput(text.split('\n'));
  const firstCode = body.findIndex((line) => line.trim() && !isProse(line));
  if (firstCode === -1) {
    return { intro: trimBlankLines(body.join('\n')), code: '', output };
  }

  const introLines = body.slice(0, firstCode);
  while (introLines.length && !introLines[introLines.length - 1].trim()) introLines.pop();
  if (introLines.length && EXAMPLE_LABEL.test(introLines[introLines.length - 1].trim())) introLines.pop();

  const codeLines = body.slice(firstCode).map((line) => (isProse(line) ? `# ${line.trim()}` : line));
  return {
    intro: trimBlankLines(introLines.join('\n')),
    code: trimBlankLines(codeLines.join('\n')),
    output,
  };
};
