'use strict';
// Exercise production UI in isolated browser contexts. Firebase transport is
// replaced only for Music's local editor; this never tests server permissions.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(__dirname,'..'),siblings=process.env.FW_ECOSYSTEM_ROOT||path.dirname(root);
const baseline=process.argv.includes('--record-baseline'),beforeRoot=process.env.FW_BASELINE_ROOT;
const roots={Formwheel:baseline&&beforeRoot?path.join(beforeRoot,'Formwheel'):root};
for(const name of ['Formwheel_Tool','Formwheel_Music'])roots[name]=baseline&&beforeRoot?path.join(beforeRoot,name):path.join(siblings,name);
for(const [name,dir] of Object.entries(roots))assert(fs.existsSync(path.join(dir,'index.html')),'Missing '+name+' checkout: '+dir);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
function asset(u){const [name,...rest]=decodeURIComponent(u.pathname).slice(1).split('/'),dir=roots[name];if(!dir)return null;let f=path.resolve(dir,rest.join('/'));if(f!==dir&&!f.startsWith(dir+path.sep))return null;if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');return fs.existsSync(f)&&fs.statSync(f).isFile()?f:null;}
const server=http.createServer((req,res)=>{const f=asset(new URL(req.url,'http://localhost'));if(!f){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',(types[path.extname(f)]||'text/plain')+'; charset=utf-8');res.end(fs.readFileSync(f));});
const sdkFixture=`export const initializeApp=()=>({}),getApps=()=>[],getApp=()=>({}),getAuth=()=>({currentUser:null}),getDatabase=()=>({});export const onAuthStateChanged=(_,cb)=>{queueMicrotask(()=>cb(null));return()=>{}};export const signInAnonymously=async()=>{throw Error('Offline test')};export const ref=(_,p)=>p,push=()=>({key:'offline'}),query=x=>x,orderByChild=x=>x,limitToLast=x=>x;export const get=async()=>{throw Error('Offline test')};export const set=async()=>{throw Error('Writes disabled in local editor test')};`;
const observations=[];
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.FORMWHEEL_CHROMIUM_PATH?{executablePath:process.env.FORMWHEEL_CHROMIUM_PATH}:{})});
 const origin='http://127.0.0.1:'+server.address().port;
 async function open(repo,file='index.html',init=null,arg=null){
  const c=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();if(repo==='Formwheel_Music'&&/^https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\//.test(u.href))return r.fulfill({body:sdkFixture,contentType:'text/javascript'});const f=u.hostname==='semicolonxss.github.io'&&asset(u);return f?r.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'text/plain'}):r.abort();});
  if(init)await c.addInitScript(init,arg);const p=await c.newPage(),errors=[];p.on('pageerror',e=>{if(!/Failed to fetch dynamically imported module/.test(e.message))errors.push(e.message)});await p.goto(origin+'/'+repo+'/'+file,{waitUntil:'load'});return {p,c,errors};
 }
 try{
  for(const file of ['quest.html','secret/index.html'])for(const mode of ['denied','quota']){
   const {p,c,errors}=await open('Formwheel',file,m=>{if(m==='denied')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage denied','SecurityError')}});else Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}},mode);
   try{
    const count=await p.locator(file==='quest.html'?'#tasks article':'#cards article').count();
    observations.push({repo:'Formwheel',file,state:mode,count,errors:[...errors]});
    if(!baseline){assert.equal(count,file==='quest.html'?3:38);if(file==='quest.html')assert.match(await p.locator('#status').textContent(),/저장/);else {await p.locator('#catalog-fold > summary').click();await p.waitForTimeout(30);assert.equal(await p.locator('#cards article').count(),38)}assert.deepEqual(errors,[]);}
   }finally{await c.close()}
  }
  for(const theme of ['sunset','forest','midnight','echo','cosmic-eternity']){
   const {p,c}=await open('Formwheel','index.html',t=>{localStorage.setItem('formwheel_rapid_shop_beta_v1',JSON.stringify({equipped:t,purchases:[{theme:t,refunded:false}]}));localStorage.setItem('fw-global-theme-v1',t)},theme);
   try{await p.waitForFunction(t=>document.body.dataset.fwGlobalTheme===t,theme);const a=await new AxeBuilder({page:p}).options({iframes:false}).withRules(['color-contrast']).analyze();observations.push({repo:'Formwheel',file:'index.html',state:'theme:'+theme,violations:a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});if(!baseline)assert.deepEqual(a.violations,[],theme);}finally{await c.close()}
  }
  {
   const {p,c}=await open('Formwheel');try{await p.locator('[data-mode="simple"]').click();const a=await new AxeBuilder({page:p}).options({iframes:false}).withRules(['landmark-one-main','region']).analyze();observations.push({repo:'Formwheel',file:'index.html',state:'simple',violations:a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});if(!baseline){assert.deepEqual(a.violations,[]);assert.equal(await p.getByRole('main').count(),1);await p.locator('[data-mode="card"]').click();assert.equal(await p.getByRole('main').count(),1)}}finally{await c.close()}
  }
  for(const raw of ['null','{}','[null,{"text":"Keep","done":true},{"foo":1}]']){
   const {p,c,errors}=await open('Formwheel_Tool','index.html',s=>localStorage.setItem('fw_tool_todos',s),raw);
   try{await p.locator('[data-tool="todo"]').click();const count=await p.locator('#todoList .check-item').count();observations.push({repo:'Formwheel_Tool',file:'assets/app.js',state:'todos:'+raw,count,errors:[...errors]});if(!baseline){assert.equal(count,raw.startsWith('[')?1:0);await p.locator('#todoInput').fill('New task');await p.locator('#todoInput').press('Enter');const check=p.locator('#todoList input[type="checkbox"]').last();const id=await check.getAttribute('id');await p.locator('label[for="'+id+'"]').click();assert.equal(await check.isChecked(),true);await p.locator('[data-tool="unit"]').click();assert((await p.locator('#unitFrom option').count())>0);assert.deepEqual(errors,[])}}finally{await c.close()}
  }
  {
   const {p,c}=await open('Formwheel_Tool','index.html',()=>localStorage.setItem('fw_tool_todos','[{"text":"Task","done":false}]'));
   try{await p.locator('[data-tool="todo"]').click();const labelled=await p.locator('#todoList input').evaluate(n=>n.labels.length);await p.locator('[data-tool="math"]').click();await p.locator('#mathType').selectOption('pyth');const mathLabel=await p.locator('#my').evaluate(n=>n.labels.length);observations.push({repo:'Formwheel_Tool',file:'assets/app.js',state:'generated-labels',todoLabels:labelled,mathLabels:mathLabel});if(!baseline){assert.equal(labelled,1);assert.equal(mathLabel,1)}}finally{await c.close()}
  }
  {
   const {p,c,errors}=await open('Formwheel_Music');try{await p.evaluate(()=>window.showScreen('create'));const keys=await p.locator('#editorPiano [data-note]').all(),records=[];for(const key of keys){const info=await key.evaluate(n=>({note:n.dataset.note,tag:n.tagName,tabIndex:n.tabIndex,pressed:n.getAttribute('aria-pressed')}));records.push(info);if(!baseline){assert.equal(info.tag,'BUTTON');assert.equal(info.tabIndex,0);await key.focus();await p.keyboard.press('Enter');assert.equal(await key.getAttribute('aria-pressed'),'true');assert((await p.locator('#selectedNotes').inputValue()).includes(info.note));await p.keyboard.press('Space');assert.equal(await key.getAttribute('aria-pressed'),'false')}}observations.push({repo:'Formwheel_Music',file:'modules/app.js',state:'editor-keyboard',keys:records});assert.equal(keys.length,36);if(!baseline)assert.deepEqual(errors,[]);}finally{await c.close()}
  }
 }finally{await browser.close()}
 if(process.env.FW_EXTENDED_REPORT)fs.writeFileSync(process.env.FW_EXTENDED_REPORT,JSON.stringify(observations,null,2)+'\n');
 console.log((baseline?'RECORDED baseline':'PASS')+': storage failure, themes, compact landmarks, corrupt todos, generated labels and all 36 editor keys');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
