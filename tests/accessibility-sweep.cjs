'use strict';
// Real production pages with local assets, isolated from live Firebase and user data.
// npm install --no-save playwright@1 @axe-core/playwright@4
// FORMWHEEL_CHROMIUM_PATH optionally selects an already installed Chromium.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.json':'application/json' };
function asset(url) {
  if (!url.pathname.startsWith('/Formwheel/')) return null;
  let file = path.resolve(root, decodeURIComponent(url.pathname.slice('/Formwheel/'.length)));
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}
const server = http.createServer((req, res) => {
  const file = asset(new URL(req.url, 'http://localhost'));
  if (!file) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});
const pages = [
  'index.html', 'calendar.html', 'sudoku.html', 'loop.html', 'afterbeat.html',
  'factor-lab.html', 'rapid-space.html', 'edu.html', 'promotion.html', 'board/index.html',
  'creators.html', 'daily-challenge.html', 'ended.html', 'glitch-detector.html',
  'id-center.html', 'more.html', 'maker/index.html', 'polyrhythm.html', 'secol-lab.html',
  'sports/index.html', 'tycoon/index.html', 'workshop/gallery.html', 'workshop/index.html',
  'explore.html', 'feedback.html', 'playtest.html', 'profile.html', 'rapid-shop/index.html'
];
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless:true, ...(process.env.FORMWHEEL_CHROMIUM_PATH ? {executablePath:process.env.FORMWHEEL_CHROMIUM_PATH} : {}) });
  const base = 'http://127.0.0.1:' + server.address().port + '/Formwheel/';
  const failures = [];
  try {
    for (const width of [1280, 390]) {
      const context = await browser.newContext({ viewport:{width, height:900}, timezoneId:'UTC', reducedMotion:'reduce' });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === new URL(base).origin) return route.continue();
        const file = url.hostname === 'semicolonxss.github.io' && asset(url);
        return file ? route.fulfill({body:fs.readFileSync(file), contentType:types[path.extname(file)] || 'application/octet-stream'}) : route.abort();
      });
      for (const file of pages) {
        const page = await context.newPage();
        try {
          await page.clock.setFixedTime(new Date('2026-11-23T12:00:00Z'));
          await page.goto(base + file, {waitUntil:'load'});
          if (file === 'index.html') await page.locator('#cards > article, #cards > .card').first().waitFor();
          const audit = await new AxeBuilder({page}).options({iframes:false}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();
          assert.deepEqual(audit.violations.map(v=>({rule:v.id, targets:v.nodes.map(n=>n.target)})), [], file + ' at ' + width + 'px');
          if (file === 'sudoku.html') {
            assert.equal(await page.locator('[role="row"]').count(), 9);
            assert.equal(await page.locator('[role="row"] > [role="gridcell"]').count(), 81);
            assert.equal(await page.locator('.cell[tabindex="0"]').count(), 1);
            await page.locator('.cell').first().click();
            await page.keyboard.press('ArrowRight');
            assert.equal(await page.locator('.cell').nth(1).evaluate(n=>n===document.activeElement), true);
            assert.equal(await page.locator('.cell').nth(1).getAttribute('aria-selected'), 'true');
            await page.keyboard.press('ArrowDown');
            assert.equal(await page.locator('.cell').nth(10).evaluate(n=>n===document.activeElement), true);
            // Round-trip actual player notes and values through persistence and reload.
            const empty = page.locator('.cell[aria-readonly="false"]').first();
            await empty.click();
            await page.locator('#notes').click();
            await page.getByRole('button', {name:'1', exact:true}).click();
            const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('formwheel-sudoku-v1')));
            await page.reload({waitUntil:'load'});
            const restored = await page.evaluate(()=>JSON.parse(localStorage.getItem('formwheel-sudoku-v1')));
            assert.deepEqual(restored.values, saved.values);
            assert.deepEqual(restored.notes, saved.notes);
            assert.equal(restored.selected, saved.selected);
          }
          if (file === 'calendar.html') {
            for (const day of await page.locator('.day').all()) assert((await day.getAttribute('aria-label')).includes(await day.textContent()));
            await page.locator('#next').click();
            for (const day of await page.locator('.day').all()) assert((await day.getAttribute('aria-label')).includes(await day.textContent()));
          }
          if (file === 'loop.html') {
            await page.locator('.rhythm').first().click();
            const b = page.locator('.rhythm').first();
            assert((await b.getAttribute('aria-label')).includes(await b.textContent()));
          }
          if (process.env.FORMWHEEL_QA_SCREENSHOTS && ['index.html','sudoku.html'].includes(file)) {
            fs.mkdirSync(process.env.FORMWHEEL_QA_SCREENSHOTS, {recursive:true});
            await page.screenshot({path:path.join(process.env.FORMWHEEL_QA_SCREENSHOTS, file.replace('.html','') + '-' + width + '.png')});
          }
          console.log('PASS accessibility + interactions: ' + file + ' @ ' + width);
        } catch (error) { failures.push({file, width, message:error.message}); console.error('FAIL ' + file + ' @ ' + width + ': ' + error.message); } finally { await page.close(); }
      }
      await context.close();
    }
    assert.deepEqual(failures, [], 'All audited pages must pass');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; }).finally(()=>server.close());
