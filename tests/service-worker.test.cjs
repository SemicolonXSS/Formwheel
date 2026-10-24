'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
function harness(network) {
  const handlers = {}, saved = new Map();
  const key = request => typeof request === 'string' ? new URL(request, 'https://semicolonxss.github.io').href : request.url;
  const cache = {match: async r => saved.get(key(r)), put: async (r, response) => saved.set(key(r), response), addAll: async () => {}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8'), {
    self: {location: {origin: 'https://semicolonxss.github.io'}, addEventListener: (name, fn) => handlers[name] = fn, skipWaiting() {}, clients: {claim() {}}},
    caches: {open: async () => cache, match: cache.match, keys: async () => []},
    fetch: network, URL, Response, Promise
  });
  async function request(route, mode = 'cors') {
    let response;
    const pending = [];
    handlers.fetch({request: {url: new URL(route, 'https://semicolonxss.github.io').href, method: 'GET', mode}, respondWith(p) {response = p}, waitUntil(p) {pending.push(p)}});
    const result = await response;
    await Promise.all(pending);
    return result;
  }
  return {request, saved};
}
test('versioned assets update online and use exact cached version offline', async () => {
  let online = true, body = 'v1';
  const h = harness(async () => {if (!online) throw Error('offline'); return new Response(body)});
  const route = '/Formwheel/assets/app.js?v=release';
  assert.equal(await (await h.request(route)).text(), 'v1');
  body = 'v2';
  assert.equal(await (await h.request(route)).text(), 'v2');
  online = false;
  assert.equal(await (await h.request(route)).text(), 'v2');
});
test('preloaded app shell supports versioned HTML references offline', async () => {
  const h = harness(async () => {throw Error('offline')});
  h.saved.set('https://semicolonxss.github.io/Formwheel/assets/app.js', new Response('shell'));
  assert.equal(await (await h.request('/Formwheel/assets/app.js?v=new')).text(), 'shell');
  assert.equal(await h.request('https://formwheel-default-rtdb.firebaseio.com/users.json'), undefined);
  assert.equal(await h.request('/Formwheel/api/private.json'), undefined);
});
test('unknown navigation gets connection guidance and not a fake home page', async () => {
  const h = harness(async () => {throw Error('offline')});
  const response = await h.request('/Formwheel/missing/', 'navigate');
  assert.equal(response.status, 503);
  assert.match(await response.text(), /인터넷 연결/);
});
