'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'pixel-war.html'), 'utf8');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'firebase-security/database.rules.json'), 'utf8'));
const playerRules = rules.rules.formwheelV2.pixelWar.v1.players['$uid'];
const moveRule = playerRules.moves['$index']['.validate'];
const writeRule = playerRules['.write'];

test('PIXEL WAR inline JavaScript parses', () => {
  const match = html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(match, 'Expected inline game script');
  assert.doesNotThrow(() => new vm.Script(match[1]));
});

test('Existing palette, data path and cooldown are preserved', () => {
  const palette = html.match(/const colors=\[([^\]]+)\]/);
  assert.ok(palette);
  assert.equal((palette[1].match(/#[0-9a-f]{6}/g) || []).length, 32);
  assert.ok(html.includes("formwheelV2/pixelWar/v1"));
  assert.ok(html.includes('30000'));
});

test('Canvas counts remain separate after redraw', () => {
  assert.match(html, /id="count"/);
  assert.match(html, /id="placements"/);
  assert.match(html, /totalMoves=total/);
  assert.match(html, /\$\('placements'\)\.textContent=totalMoves/);
});

test('Login restores first, and failed reads disable placement', () => {
  assert.match(html, /auth\.onAuthStateChanged\(resolve,reject\)/);
  assert.match(html, /existing\|\|\(await auth\.signInAnonymously\(\)\)/);
  assert.match(html, /ready=false;status\('읽기 권한 오류:/);
  assert.match(html, /\$\('place'\)\.disabled=!ready\|\|busy/);
});

test('Server rules enforce one move each 30 seconds and immutable history', () => {
  assert.match(writeRule, /auth\.uid === \$uid/);
  assert.match(writeRule, /now - data\.child\('lastAt'\)\.val\(\) >= 30000/);
  assert.match(writeRule, /newData\.child\('lastAt'\)\.val\(\) === now/);
  assert.match(writeRule, /newData\.child\('moves'\)\.numChildren\(\)/);
  assert.match(moveRule, /data\.exists\(\) && newData\.child\('x'\)\.val\(\) === data\.child\('x'\)\.val\(\)/);
  assert.match(moveRule, /data\.exists\(\) \|\| newData\.child\('at'\)\.val\(\) === now/);
});

test('Rules require bounded integer coordinates and palette indexes', () => {
  for (const key of ['x','y','color']) {
    assert.ok(moveRule.includes("newData.child('" + key + "').val() % 1 === 0"));
  }
  assert.match(moveRule, /newData\.child\('color'\)\.val\(\) < 32/);
  assert.match(playerRules['.validate'], /newData\.numChildren\(\) === 3/);
});

test('Tests never change production data', () => {
  assert.doesNotMatch(html, /db\.ref\(root\)\.remove\(/);
  assert.equal(typeof rules.rules.formwheelV2.pixelWar.v1.players['.read'], 'boolean');
});
