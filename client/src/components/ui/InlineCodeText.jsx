import { splitInlineCode } from '../../utils/inlineCode.js';

// Problem text from the bank and from the AI marks code with backticks, the
// way Markdown does ("ให้ import โมดูล `math`"). Shown as plain text, the
// backticks appeared as literal characters around the code (UI review
// 2026-11-18, P3). This draws each `...` span as inline code and leaves
// everything else as it is - no other Markdown, and no HTML is ever parsed.
export default function InlineCodeText({ text, codeClassName = '' }) {
  return splitInlineCode(text).map((part, index) => (
    part.code ? (
      <code
        key={index}
        className={`rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-slate-800 ${codeClassName}`}
      >
        {part.text}
      </code>
    ) : (
      part.text
    )
  ));
}
