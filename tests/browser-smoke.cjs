'use strict';
// Exercise real DOM/layout with production scripts and markup, with all external
// traffic blocked. Authentication and live Firebase are intentionally excluded.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('index.html'),scripts=[...original.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const inline=code=>'<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>';
const settings=scripts.find(s=>s.includes("const KEY='fw.settings.v2'")&&s.includes('window.FormwheelSettings.read()'));
const display=scripts.find(s=>s.includes("key='formwheel-hub-display-version'"));
const panel=scripts.find(s=>s.includes('/* Keep existing language and opt-in Smart Return controls'));
assert(settings&&display&&panel,'Production UI scripts must be found');
const shared=read('shared/formwheel-ui.js'),keyboard=shared.slice(shared.indexOf('/* Hub keyboard shortcuts'));
const fixture=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',[
 inline(read('shared/settings-state.js')),inline(read('assets/app.js')),inline(display),inline(read('assets/smart-return.js')),inline(panel),inline(settings),inline(keyboard),inline(read('assets/formwheel-virtual-keyboard.js')),'</body>'
].join('\n'));
const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/Formwheel/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture);return;}
 const file=path.resolve(root,decodeURIComponent(url.pathname.replace(/^\/Formwheel\//,'')));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const url='http://127.0.0.1:'+server.address().port+'/Formwheel/index.html';
  async function page(options={},blocked=false){
   const context=await browser.newContext(options),errors=[];
   await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   await context.addInitScript(blocked?()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});}:()=>localStorage.setItem('formwheel-hub-display-version','simple'));
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});return {page,context,errors};
  }
  const desktop=await page();
  await desktop.page.click('#fw-settings-button');await desktop.page.click('[data-fw21="appearance"]');
  await desktop.page.locator('#fw21-appearance select').nth(2).selectOption('large');
  assert.equal(await desktop.page.evaluate(()=>document.documentElement.style.fontSize),'18px');
  await desktop.page.keyboard.press('Escape');await desktop.page.keyboard.press('Control+/');await desktop.page.keyboard.press('Tab');
  assert.equal(await desktop.page.getByLabel('세미콜론 단축키 동작').evaluate(el=>el===document.activeElement),true);
  await desktop.page.keyboard.press('Escape');await desktop.page.keyboard.press('/');
  assert.equal(await desktop.page.locator('#fw-b-search').evaluate(el=>el===document.activeElement&&el.getBoundingClientRect().height>0),true);
  assert.deepEqual(desktop.errors,[]);await desktop.context.close();
  console.log('PASS browser: desktop preferences, keyboard focus and compact search');
  const mobile=await page({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.page.evaluate(()=>{window.__scrollCalls=0;const original=window.scrollTo;window.scrollTo=function(...args){window.__scrollCalls++;return original.apply(this,args);};});
  await mobile.page.click('#fw-vk-toggle');await mobile.page.getByRole('button',{name:'↓ 카드 아래로',exact:true}).click();
  assert.equal(await mobile.page.evaluate(()=>window.__scrollCalls),1);
  assert.deepEqual(mobile.errors,[]);await mobile.context.close();
  console.log('PASS browser: touch shortcut dispatch scrolls once');
  const denied=await page({},true);
  assert.equal(await denied.page.locator('#fw-resume-enabled').isChecked(),false);
  await denied.page.click('#fw-settings-button');await denied.page.click('[data-fw21="appearance"]');
  await denied.page.locator('#fw21-appearance select').nth(2).selectOption('large');
  assert.match(await denied.page.locator('#fw21-status').textContent(),/저장하지 못/);
  assert.deepEqual(denied.errors,[]);await denied.context.close();
  console.log('PASS browser: blocked storage keeps Hub controls working and reports save failure');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
