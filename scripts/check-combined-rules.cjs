'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const p = path.join(__dirname, '..', 'firebase-security', 'formwheel-combined.PROPOSED.rules.json');
const db = JSON.parse(fs.readFileSync(p, 'utf8'));
const r = db.rules;
assert.equal(r['.read'], false, 'Root reads must default-deny');
assert.equal(r['.write'], false, 'Root writes must default-deny');
for (const name of ['formwheelV2', 'hubCreatorSort', 'syncRooms', 'whiteboardRooms', 'wikiV1', 'aqs']) {
  assert(r[name], 'Missing data family: ' + name);
}
for (const name of ['hubHomes', 'hubProfiles', 'themePreferences', 'featuredBadges', 'visitorStats', 'wallets']) {
  assert(r.formwheelV2[name], 'Missing v2 path: ' + name);
}
assert.equal(r.formwheelV2.wallets.$uid['.write'], false, 'Unverified wallets must not be client-writable');
assert.equal(r.formwheelV2.visitorStats.uniqueVisitors['.read'], "auth != null && auth.token.producer === true", 'Bulk visitor analytics must be restricted');
assert.equal(r.whiteboardRooms.$room.actions.$action.uid['.validate'], 'newData.val() === auth.uid', 'Action ownership must be validated');
assert(r.whiteboardRooms.$room.actions.$action.points.$index, 'Point coordinates must be validated');
assert.equal(r.wikiV1.proposals['.indexOn'][0], 'status', 'Wiki moderation query requires an index');
assert(r.formwheelV2.social.handles['.write'] === false, 'Handles must be server-managed');
function scan(node,where='rules') {
  if (!node || typeof node !== 'object') return;
  for (const [key,value] of Object.entries(node)) {
    if (key === '.write' && value === true) assert.fail('Unconditional writes: ' + where);
    if (key === '.read' && value === true && where !== 'rules.wikiV1.pages' && where !== 'rules.hubCreatorSort' && where !== 'rules.formwheelV2.visitorStats.livePeak' && where !== 'rules.formwheelV2.forms.$id.public') {
      assert.fail('Unintended unconditional reads: ' + where);
    }
    if (key[0] !== '.') scan(value,where + '.' + key);
  }
}
scan(r);
console.log('PASS staged combined Rules JSON and conservative structural checks (not an emulator / deployment test).');
