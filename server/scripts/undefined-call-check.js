/**
 * Find identifiers that server.js calls but never defines — the failure mode that
 * hid behind "insertLedgerEntry is not defined": a route ported in without its
 * helper, which only shows up when that exact branch runs.
 *
 * Walks the AST and collects every called name, then subtracts everything bound
 * anywhere in the file (top level, nested, params, catch clauses, imports) plus
 * the usual globals.
 */
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', '..');
const acorn = require(path.join(BASE, 'client/node_modules/acorn'));
const walkAll = (node, fn) => {
    if (!node || typeof node.type !== 'string') return;
    fn(node);
    for (const k of Object.keys(node)) {
        const v = node[k];
        if (Array.isArray(v)) v.forEach(n => walkAll(n, fn));
        else if (v && typeof v.type === 'string') walkAll(v, fn);
    }
};

const file = process.argv[2] || path.join(__dirname, "..", "server.js");
const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true });

const bound = new Set();
const collectPattern = (p) => {
    if (!p) return;
    if (p.type === 'Identifier') bound.add(p.name);
    else if (p.type === 'ObjectPattern') p.properties.forEach(pr => collectPattern(pr.value || pr.argument));
    else if (p.type === 'ArrayPattern') p.elements.forEach(collectPattern);
    else if (p.type === 'AssignmentPattern') collectPattern(p.left);
    else if (p.type === 'RestElement') collectPattern(p.argument);
};
walkAll(ast, n => {
    if (n.type === 'VariableDeclarator') collectPattern(n.id);
    else if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression') {
        if (n.id) bound.add(n.id.name);
        n.params.forEach(collectPattern);
    } else if (n.type === 'ArrowFunctionExpression') n.params.forEach(collectPattern);
    else if (n.type === 'ClassDeclaration' && n.id) bound.add(n.id.name);
    else if (n.type === 'CatchClause') collectPattern(n.param);
});

const GLOBALS = new Set(`require module exports process console JSON Math Date Promise Map Set WeakMap Array Object
String Number Boolean Error TypeError RangeError Symbol RegExp Buffer setTimeout setInterval clearTimeout
clearInterval setImmediate parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent
encodeURI decodeURI fetch AbortSignal structuredClone URL URLSearchParams TextEncoder TextDecoder
globalThis undefined NaN Infinity queueMicrotask BigInt Proxy Reflect Intl`.split(/\s+/));

const called = new Map();
walkAll(ast, n => {
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
        if (!called.has(n.callee.name)) called.set(n.callee.name, n.loc.start.line);
    }
});

const missing = [...called].filter(([name]) => !bound.has(name) && !GLOBALS.has(name));
if (!missing.length) console.log('every called function is defined in this file');
for (const [name, line] of missing.sort((a, b) => a[1] - b[1])) {
    console.log(`  server.js:${line}  ${name}(...) is called but never defined`);
}
process.exitCode = missing.length ? 1 : 0;
