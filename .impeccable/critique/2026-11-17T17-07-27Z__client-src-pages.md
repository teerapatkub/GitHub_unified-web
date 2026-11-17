---
target: ตรวจ UI ฝั่งผู้เรียนทั้งหมด
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:Z:\\code\\pythonGame\\game-test\\full_web\\unified-web\\client\\src\\pages"
timestamp: 2026-11-17T17-07-27Z
slug: client-src-pages
---
# Critique: PyArena student UI (client/src/pages) — 2026-11-18
Method: dual-agent (A design review · B detector + browser)
Score 22/40 (Acceptable). Heuristics: 1=2 level mismatch header LV12 vs pages 52; 2=2 Thai/English mixed labels; 3=2 one-click 15,200-coin purchase; 4=2 naming/colour inconsistencies; 5=2 student-visible force-summary (no server admin check); 6=3; 7=2; 8=2 theme petals over editor/quiz, repeated "owned" badges; 9=2 disabled buttons give no reason; 10=3.
Specificity: about half. Workbench, Debug Lab and Thai copy are product-specific; rest is pastel cards over theme art, so modes look alike.
Detector: CLI 2 findings, both false positives (test file bounce-easing; tab underline border). Browser overlay: /shop 34, /online 15, /profile 12, /learn 5, /debug 2, /matchmaking 2 (small/low-contrast text, nested cards, heading skip).
Priority issues:
P0 level source of truth (utils/gameModeAccess.js levelOf vs XP-derived level).
P1 force-summary visible to students + server/server.js:4807 lacks admin check.
P1 shop buy/buy-set with no confirmation (ShopPage.jsx:252,305).
P1 theme scene layer zIndex 30 over workspaces (fx/index.js:24).
P1 headings/meta set directly on theme art are unreadable.
P2 Thai text 10-11px, mixed-language labels; targets <32px; pre-test radio semantics/colour/no "not graded" note; inconsistent counts (1/25 lessons, 31 achievements, "finished" at 0%); English mode partly Thai.
P3 mobile shop length/filter row; leaderboard 6 tabs; unlabeled icon buttons; literal backticks; "ดั้งเดิม" difficulty label; "win rate 0%" headline.
