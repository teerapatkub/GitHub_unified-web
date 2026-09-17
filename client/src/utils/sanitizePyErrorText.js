const isPyodideInternalFrame = (line = "") => {
  const normalized = line.trim();

  if (!normalized) return false;

  return (
    /^File\s+["']?(?:\/lib\/|\/tmp\/|<exec>|<stdin>|<string>)/i.test(normalized) ||
    /_pyodide\//i.test(normalized) ||
    /python312\.zip/i.test(normalized) ||
    /^at\s+/i.test(normalized) ||
    /^\^+$/.test(normalized)
  );
};

const isPythonErrorLine = (line = "") => {
  const normalized = line.trim();

  if (!normalized) return false;

  return /(Traceback|PythonError|SyntaxError|NameError|TypeError|ValueError|IndexError|AttributeError|ZeroDivisionError|IndentationError|AssertionError|ImportError|ModuleNotFoundError|RuntimeError|Exception|KeyboardInterrupt|RecursionError):/.test(normalized);
};

const stripCoroutineWrapper = (line = "") => {
  let cleaned = String(line ?? "");

  cleaned = cleaned.replace(
    /^Error:\s*Traceback\s*\(most recent call last\):\s*await\s+CodeRunner\s*\(\s*await\s+coroutine\s*/i,
    "Error: Traceback (most recent call last): "
  );

  cleaned = cleaned.replace(
    /^await\s+CodeRunner\s*\(\s*await\s+coroutine\s*/i,
    ""
  );

  cleaned = cleaned.replace(/^await\s+coroutine\s*/i, "");

  return cleaned;
};

export function sanitizePyErrorText(rawText = "") {
  const text = String(rawText ?? "");

  if (!text) return "";

  const lines = text
    .split(/\r?\n/)
    .map((line) => stripCoroutineWrapper(line).trimEnd())
    .filter((line) => line.length > 0);

  const filtered = [];
  let started = false;

  for (const rawLine of lines) {
    const normalized = rawLine.trim();

    if (isPyodideInternalFrame(normalized)) {
      continue;
    }

    if (!started) {
      if (
        normalized.startsWith("Traceback") ||
        normalized.startsWith("PythonError") ||
        normalized.startsWith("Error:") ||
        isPythonErrorLine(normalized)
      ) {
        started = true;
      }
    }

    if (started || normalized.startsWith("---") || normalized.startsWith("Exception in") || normalized.startsWith("Error:")) {
      filtered.push(rawLine);
      continue;
    }

    if (/^File\s+/.test(normalized) && /line\s+\d+/i.test(normalized)) {
      const isInternalFileFrame =
        /\/lib\//i.test(normalized) ||
        /_pyodide\//i.test(normalized) ||
        /python312\.zip/i.test(normalized) ||
        /<exec>|<stdin>/i.test(normalized);

      if (isInternalFileFrame) {
        continue;
      }
    }

    if (isPythonErrorLine(normalized)) {
      filtered.push(rawLine);
      started = true;
    }

    if (normalized.startsWith("Error:") && !filtered.length) {
      filtered.push(rawLine);
      started = true;
    }
  }

  const result = filtered.join("\n").trim();

  if (result) return result;

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !isPyodideInternalFrame(line))
    .join("\n")
    .trim();
}
