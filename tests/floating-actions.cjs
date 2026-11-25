'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),siblings=process.env.FW_ECOSYSTEM_ROOT||path.dirname(root),manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/quality-audit-500-2026-11-24.json'))),names=manifest.repositories.map(x=>x.repo),sdk=JSON.parse(fs.readFileSync(process.env.FW_FIREBASE_SDK_MAP||path.join(siblings,'.expanded-audit-sdk/map.json')));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
function asset(u){const [name,...rest]=decodeURIComponent(u.pathname).slice(1).split('/');if(!names.includes(name))return null;const folder=name==='Formwheel'?root:path.join(siblings,name);let f=path.resolve(folder,rest.join('/'));if(!f.startsWith(folder+path.sep))return null;if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');return fs.existsSync(f)&&fs.statSync(f).isFile()?f:null}
const server=http.createServer((req,res)=>{const f=asset(new URL(req.url,'http://localhost'));if(!f){res.writeHead(404);res.end();return}res.setHeader('Content-Type',(types[path.extname(f)]||'text/plain')+'; charset=utf-8');res.end(fs.readFileSync(f))});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.FORMWHEEL_CHROMIUM_PATH?{executablePath:process.env.FORMWHEEL_CHROMIUM_PATH}:{})});
async function open(name,file,width){const c=await browser.newContext({viewport:{width,height:800},reducedMotion:'reduce',serviceWorkers:'block'});await c.routeWebSocket('**/*',w=>w.close());await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();const f=sdk[u.href]||(u.hostname==='semicolonxss.github.io'&&asset(u));return f?r.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'text/javascript'}):r.abort()});await c.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copied=value}}})});const p=await c.newPage();await p.goto('http://127.0.0.1:'+server.address().port+'/'+name+'/'+file,{waitUntil:'load'});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return {c,p}}
async function clickable(p,selector){const result=await p.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {uncovered:el===hit||el.contains(hit),width:r.width,height:r.height,left:r.left,right:r.right,viewport:innerWidth}});assert(result.uncovered,selector+' is covered');assert(result.width>=24&&result.height>=24,selector+' has no 24px target');assert(result.left>=0&&result.right<=result.viewport,selector+' is outside viewport')}
let states=0;
try{
 for(const width of [320,390,1280])for(const name of ['AI','Chat','Check','Clicker','Form','Tool','Vault']){
  const file=name==='Clicker'?'season1-02/index.html':'index.html',{c,p}=await open('Formwheel_'+name,file,width);
  try{
   await clickable(p,'#secol-share-link');await clickable(p,'.fw-tutorial-launch');
   await p.locator('#secol-share-link').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>typeof window.__copied==='string');
   assert.match(await p.evaluate(()=>window.__copied),/^http:\/\/127\.0\.0\.1:/);
   const launch=p.locator('.fw-tutorial-launch');if(await launch.getAttribute('aria-expanded')==='true')await launch.click();await launch.focus();await p.keyboard.press('Enter');assert.equal(await launch.getAttribute('aria-expanded'),'true');
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const panel=await p.locator('#fw-tutorial').boundingBox(),bar=await p.locator('.fw-floating-actions').boundingBox();assert(panel.y+panel.height<=bar.y-7,'tutorial overlaps actions');await clickable(p,'#secol-share-link');
   const canScroll=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight>450);
   if(canScroll&&await p.locator('#secol-scroll-top').count()){await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await p.locator('#secol-scroll-top').waitFor({state:'visible'});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await clickable(p,'#secol-scroll-top');await clickable(p,'#secol-share-link');await p.locator('#secol-scroll-top').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>scrollY<5)}
   states++;
  }finally{await c.close()}
 }
 {const {c,p}=await open('Formwheel','pixel-war.html',390);try{const area=p.locator('#viewport');assert.equal(await area.getAttribute('tabindex'),'0');assert(await area.evaluate(n=>n.scrollWidth>n.clientWidth));await area.focus();await p.keyboard.press('ArrowRight');await p.waitForFunction(()=>document.getElementById('viewport').scrollLeft>0);states++;}finally{await c.close()}}
 for(const [name,file,selector,tool] of [['Formwheel_AI','index.html','#input'],['Formwheel_Wheel','index.html','#wa-new-input'],['Formwheel','secret/creator.html','#title'],['Formwheel_Tool','index.html','#timerMin','timer']]){
  const {c,p}=await open(name,file,390);try{if(tool)await p.locator('[data-tool="'+tool+'"]').click();const field=p.locator(selector);await field.focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab');assert.equal(await field.evaluate(n=>document.activeElement===n),true,'keyboard returns to editable field');const focus=await field.evaluate(n=>{const s=getComputedStyle(n);return {width:parseFloat(s.outlineWidth),style:s.outlineStyle}});assert(focus.width>=2&&focus.style!=='none','editable field has no visible keyboard focus');states++;}finally{await c.close()}
 }
 console.log('PASS '+states+' interaction states: uncovered actions, keyboard sharing, tutorial layout, pixel-board scrolling and editable-field focus');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
