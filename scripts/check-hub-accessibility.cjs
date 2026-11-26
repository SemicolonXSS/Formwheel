'use strict';
// Verify the accessible keyboard skip link and focus target on each listed page.
// Static, dependency-free checks: no network calls or user data access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pages = [
  "404.html",
  "achievement.html",
  "anniversary-40-50.html",
  "atom.html",
  "beta-lab.html",
  "board/index.html",
  "calendar.html",
  "creators.html",
  "duck.html",
  "edu.html",
  "event-calendar.html",
  "explore.html",
  "factor-lab.html",
  "feedback.html",
  "festival.html",
  "find10-stats.html",
  "glitch-detector.html",
  "grid.html",
  "hall-of-fame.html",
  "id-center.html",
  "maker/index.html",
  "more.html",
  "null.html",
  "offline.html",
  "optical-chaos-v2.html",
  "optical-chaos-v3.html",
  "optical-chaos-v4.html",
  "optical-chaos.html",
  "party.html",
  "pixel-war.html",
  "playtest.html",
  "profile.html",
  "project-rush.html",
  "quest.html",
  "random-lab.html",
  "random-mission.html",
  "rapid-2.html",
  "rapid-space.html",
  "secol-lab.html",
  "settings-2.html",
  "share.html",
  "sns.html",
  "sports/index.html",
  "sudoku.html",
  "text-sorter.html",
  "threads-code.html",
  "unite.html",
  "workshop/gallery.html",
  "workshop/index.html"
];
assert.equal(new Set(pages).size, pages.length, 'Duplicate page in checklist');
const hub = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.equal((hub.match(/<main(?:\s|>)/gi) || []).length, 1, 'Hub must have one main landmark');
const hubMarkup = hub.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
assert.doesNotMatch(hubMarkup, /본문으로 (?:바로\s*가기|돌아가기)|Skip to (?:main )?content|<a\b[^>]*(?:fw-skip-link|skip-to-content|skip-link)/i, 'Hub must omit the skip link');
for (const page of pages) {
  const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  const prefix = page + ': ';
  const links = html.match(/<a class="fw-skip-link" href="#fw-main-content">본문으로 바로가기<\/a>/g) || [];
  assert.equal(links.length, 1, prefix + 'expected one skip link');
  const main = html.match(/<main\b[^>]*\bid="fw-main-content"[^>]*>/i);
  assert(main, prefix + 'missing matching main landmark');
  assert(/\btabindex="-1"/.test(main[0]), prefix + 'main must be keyboard-focusable');
  assert.equal((html.match(/id="fw-skip-link-style"/g) || []).length, 1, prefix + 'missing or duplicate skip link styling');
  const bodyStart = html.search(/<body\b/i);
  const skipStart = html.indexOf(links[0]);
  const mainStart = html.indexOf(main[0]);
  assert(bodyStart >= 0 && bodyStart < skipStart && skipStart < mainStart, prefix + 'skip link must precede main inside body');
}
console.log(`PASS: ${pages.length} pages have keyboard skip navigation and all checked pages have a main landmark.`);
