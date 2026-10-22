'use strict';
// Hub release guard: validate the project catalog, local game URLs, and sitemap.
// Pure Node.js built-ins; no network requests or Firebase access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const match = source.match(/\bconst projects\s*=\s*(\[[\s\S]*?\n\]);/);
assert(match, 'Could not extract the Hub projects array');

const projects = vm.runInNewContext(match[1], Object.create(null), { timeout: 1000 });
assert(Array.isArray(projects) && projects.length > 0, 'Hub projects list is empty');

const usedNames = new Set();
const usedUrls = new Set();
const validCategories = new Set(['game', 'tool', 'app']);
const validModes = new Set(['solo', 'multi', 'both']);
const validConnections = new Set(['online', 'offline']);
const validDifficulties = new Set(['쉬움', '보통', '어려움']);

function localFileForUrl(url) {
  if (url.hostname !== 'semicolonxss.github.io' || !url.pathname.startsWith('/Formwheel/')) return null;
  let relative = decodeURIComponent(url.pathname.slice('/Formwheel/'.length));
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const local = path.resolve(root, relative);
  assert(local.startsWith(root + path.sep), 'Invalid local route: ' + url.href);
  return local;
}

for (const [index, project] of projects.entries()) {
  const prefix = 'project #' + (index + 1) + ' (' + String(project.name) + '): ';
  assert(typeof project.name === 'string' && project.name.trim(), prefix + 'missing name');
  assert(!usedNames.has(project.name), prefix + 'duplicate name');
  usedNames.add(project.name);
  assert(validCategories.has(project.category), prefix + 'invalid category');
  assert(validModes.has(project.mode), prefix + 'invalid mode');
  assert(validConnections.has(project.connection), prefix + 'invalid connection');
  assert(validDifficulties.has(project.difficulty), prefix + 'invalid difficulty');
  assert(typeof project.description === 'string' && project.description.trim(), prefix + 'missing description');
  assert(typeof project.addedAt === 'string' && Number.isFinite(Date.parse(project.addedAt)), prefix + 'invalid addedAt');
  assert(typeof project.recent === 'boolean', prefix + 'recent must be boolean');
  let url;
  try { url = new URL(project.url); }
  catch { assert.fail(prefix + 'invalid URL'); }
  assert(url.protocol === 'https:' && url.hostname === 'semicolonxss.github.io', prefix + 'unexpected URL origin');
  assert(!url.hash && [...url.searchParams.keys()].every(key => key === 'v'), prefix + 'unexpected URL parameters');
  assert(!usedUrls.has(url.href), prefix + 'duplicate URL');
  usedUrls.add(url.href);
  const file = localFileForUrl(url);
  if (file) assert(fs.existsSync(file), prefix + 'local project file missing: ' + path.relative(root, file));
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert(sitemapUrls.length > 0, 'Empty sitemap');
const indexed = new Set();
for (const href of sitemapUrls) {
  const url = new URL(href);
  assert(url.protocol === 'https:' && url.hostname === 'semicolonxss.github.io' && url.pathname.startsWith('/Formwheel/'), 'Sitemap URL is outside the Hub: ' + href);
  assert(!indexed.has(href), 'Duplicate sitemap URL: ' + href);
  indexed.add(href);
  const local = localFileForUrl(url);
  assert(local && fs.existsSync(local), 'Missing sitemap file: ' + href);
}
assert(indexed.has('https://semicolonxss.github.io/Formwheel/'), 'Homepage missing from sitemap');
for (const href of usedUrls) {
  if (href.startsWith('https://semicolonxss.github.io/Formwheel/')) {
    assert(indexed.has(href), 'Hub-hosted project missing from sitemap: ' + href);
  }
}
console.log('PASS Hub catalog: ' + projects.length + ' projects, ' + sitemapUrls.length + ' sitemap URLs; no duplicate names, broken local routes, or missing metadata.');
