const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rules = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database.rules.json'), 'utf8')).rules;
const wallet = rules.formwheelV2.rapidWallets.$uid;

test('Rapid wallet reads require a signed-in, non-anonymous owner', () => {
  assert.match(wallet['.read'], /auth != null/);
  assert.match(wallet['.read'], /auth\.uid === \$uid/);
  assert.match(wallet['.read'], /sign_in_provider !== 'anonymous'/);
});

test('Rapid wallet client writes remain disabled', () => {
  assert.equal(wallet['.write'], false);
  assert.equal(rules['.write'], false);
});

test('unrelated rules retain their original structure', () => {
  assert.ok(rules.formwheelV2.publicVisitorCounts);
  assert.ok(rules.formwheelV2.liveHubSessions);
});
