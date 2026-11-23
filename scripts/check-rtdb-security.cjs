#!/usr/bin/env node
// Read-only checks for the Formwheel RTDB rules selected by firebase.json.
// This does not deploy rules or change user data.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));
const rulesFile = path.resolve(root, config.database.rules);
assert.equal(rulesFile, path.join(root, 'database.rules.json'), 'Unexpected deployment target');
const rules = JSON.parse(fs.readFileSync(rulesFile, 'utf8')).rules;
assert.equal(rules['.read'], false, 'Root must not allow public reads');
assert.equal(rules['.write'], false, 'Root must not allow public writes');
function walk(node, keys = []) {
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === '.read' || key === '.write') {
      assert.notEqual(value, true, 'Unconditional grant at /' + keys.join('/') + ' (' + key + ')');
    }
    if (key === '.validate' && typeof value === 'string') {
      assert(!/\\bchildrenCount\\b/.test(value), 'Unsupported childrenCount at /' + keys.join('/'));
    }
    if (!key.startsWith('.')) walk(value, [...keys, key]);
  }
}
walk(rules);
console.log('PASS: root denies, no unconditional grants, no unsupported childrenCount.');
console.log('NOTE: static checks are not a replacement for Firebase Emulator tests.');
