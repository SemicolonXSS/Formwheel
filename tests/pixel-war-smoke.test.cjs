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
const moveRules = playerRules.moves['$index'];

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
  assert.match(playerRules['.validate'], /now - data\.child\('lastAt'\)\.val\(\) >= 30000/);
  assert.match(playerRules['.validate'], /newData\.child\('lastAt'\)\.val\(\) === now/);
  assert.match(playerRules['.validate'], /data\.child\('count'\)\.val\(\) \+ 1/);
  assert.equal(playerRules['.write'], undefined);
  for (const field of ['count', 'lastAt']) {
    assert.match(playerRules[field]['.write'], /auth\.uid === \$uid && newData\.exists\(\)/);
  }
  assert.match(moveRules['.write'], /auth\.uid === \$uid && newData\.exists\(\) && !data\.exists\(\)/);
  assert.match(moveRules['.write'], /\$index === .*child\('count'\)/);
  assert.equal(moveRules.at['.validate'], 'newData.val() === now');
});

test('Rules require bounded integer coordinates and palette indexes', () => {
  assert.match(moveRules['.validate'], /hasChildren\(\['x','y','color','at'\]\)/);
  for (const [field, bound] of [['x', 400], ['y', 400], ['color', 32]]) {
    assert.equal(moveRules[field]['.validate'],
      'newData.isNumber() && newData.val() % 1 === 0 && newData.val() >= 0 && newData.val() < ' + bound);
  }
  assert.equal(moveRules['$other']['.validate'], false);
});

test('Tests never change production data', () => {
  assert.doesNotMatch(html, /db\.ref\(root\)\.remove\(/);
  assert.equal(typeof rules.rules.formwheelV2.pixelWar.v1.players['.read'], 'boolean');
});
