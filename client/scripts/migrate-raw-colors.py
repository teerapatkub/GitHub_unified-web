"""Move raw Tailwind colours onto the token layer (Spec 0005 Track H).

    python client/scripts/migrate-raw-colors.py <folder> --dry   # list what would change
    python client/scripts/migrate-raw-colors.py <folder>         # rewrite the files

Maps <utility>-<family>-<shade>[/opacity] to <utility>-pysim-<role>[/opacity]
(see client/src/styles/tokens.css for the roles). The role depends on the
utility: text gets a colour that reads at 4.5:1, a fill that sits behind white
text gets the strong shade, a border gets the light one. Arcade went through
this in ticket 18 (630 classes in 19 files).

It cannot see what is behind an element. Light text on a dark panel (a code
console, an overlay that darkens the screen) comes out dark-on-dark; after a
run, look for slate-800/900/950 and black backgrounds in the diff and move
them and their text onto the inverse-* tokens by hand.
"""
import io, os, re, sys
from collections import Counter

root = sys.argv[1]
dry = '--dry' in sys.argv

TEXT_UTILS = {'text', 'placeholder', 'caret', 'decoration'}
LINE_UTILS = {'border', 'divide', 'ring', 'outline', 'border-t', 'border-b', 'border-l', 'border-r', 'border-x', 'border-y', 'ring-offset'}
FILL_UTILS = {'bg', 'from', 'via', 'to', 'fill', 'stroke', 'shadow', 'accent'}

NEUTRAL = {'slate', 'gray', 'zinc', 'neutral', 'stone'}
ACCENT = {'rose', 'pink', 'fuchsia'}
SUCCESS = {'emerald', 'green', 'lime', 'teal'}
WARNING = {'amber', 'yellow', 'orange'}
ERROR = {'red'}
INFO = {'indigo', 'sky', 'blue', 'cyan', 'violet', 'purple'}


def status_role(fam, shade, util):
    if util in TEXT_UTILS:
        return f'{fam}-strong' if shade >= 400 or fam != 'error' else fam
    if util in LINE_UTILS:
        if shade <= 300:
            return f'{fam}-border'
        return f'{fam}-strong' if shade >= 600 else fam
    # fills
    if shade <= 100:
        return f'{fam}-container'
    if shade <= 300:
        return f'{fam}-border'
    if shade <= 500:
        return fam
    return f'{fam}-strong'


def role(family, shade, util):
    if family == 'white':
        return 'on-primary' if util in TEXT_UTILS else 'card'
    if family == 'black':
        return 'on-surface'
    if family in NEUTRAL:
        if util in TEXT_UTILS:
            if shade <= 600:
                return 'label'
            if shade == 700:
                return 'on-surface-variant'
            return 'on-surface'
        if util in LINE_UTILS:
            if shade <= 300:
                return 'outline-variant'
            return 'outline' if shade <= 500 else 'on-surface-variant'
        return {50: 'surface', 100: 'surface-container', 200: 'surface-high', 300: 'surface-dim',
                400: 'outline', 500: 'outline', 600: 'on-surface-variant', 700: 'on-surface-variant'}.get(shade, 'on-surface')
    if family in ACCENT:
        if util in TEXT_UTILS:
            return 'accent-strong' if shade >= 500 else 'accent'
        if util in LINE_UTILS:
            return 'accent-border' if shade <= 300 else ('accent' if shade <= 500 else 'accent-strong')
        if shade <= 100:
            return 'accent-container'
        if shade <= 300:
            return 'accent-border'
        if shade == 400:
            return 'accent'
        return 'accent-strong'  # 500+ fills sit behind white text: 4.7:1 needs the strong shade
    fam = ('success' if family in SUCCESS else 'warning' if family in WARNING
           else 'error' if family in ERROR else 'info' if family in INFO else None)
    if fam == 'error':
        if util in TEXT_UTILS:
            return 'error'
        if util in LINE_UTILS:
            return 'error-border' if shade <= 300 else 'error'
        return 'error-container' if shade <= 100 else 'error-border' if shade <= 300 else 'error'
    if fam == 'info' and util in TEXT_UTILS and shade == 600:
        return 'info'
    return status_role(fam, shade, util)


FAMILIES = sorted(NEUTRAL | ACCENT | SUCCESS | WARNING | ERROR | INFO)
UTILS = sorted(TEXT_UTILS | LINE_UTILS | FILL_UTILS, key=len, reverse=True)
PAT = re.compile(r'(?<![\w-])((?:[a-z-]+:)*)(' + '|'.join(map(re.escape, UTILS)) + r')-(' + '|'.join(FAMILIES) + r')-(\d{2,3})(/\d+)?(?![\w-])'
                 r'|(?<![\w-])((?:[a-z-]+:)*)(' + '|'.join(map(re.escape, UTILS)) + r')-(white|black)(/\d+)?(?![\w-])')

seen = Counter()


def repl(m):
    if m.group(2):
        variants, util, family, shade, op = m.group(1), m.group(2), m.group(3), int(m.group(4)), m.group(5) or ''
    else:
        variants, util, family, shade, op = m.group(6), m.group(7), m.group(8), 0, m.group(9) or ''
    r = role(family, shade, util)
    out = f'{variants}{util}-pysim-{r}{op}'
    seen[(m.group(0), out)] += 1
    return out


total = 0
for dirpath, _, files in os.walk(root):
    for f in files:
        if not f.endswith(('.jsx', '.js')) or f.endswith('.test.js'):
            continue
        p = os.path.join(dirpath, f)
        s = io.open(p, encoding='utf-8').read()
        n = PAT.sub(repl, s)
        if n != s:
            total += 1
            if not dry:
                io.open(p, 'w', encoding='utf-8', newline='').write(n)

for (a, b), c in sorted(seen.items(), key=lambda x: -x[1]):
    print(f'{c:4} {a} -> {b}')
print('files', total, 'replacements', sum(seen.values()))
