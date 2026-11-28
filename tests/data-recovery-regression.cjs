'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(__dirname,'..'),ecosystem=process.env.FW_ECOSYSTEM_ROOT||path.dirname(root),baseline=process.env.FW_RECOVERY_BASELINE,diagnostic=process.env.FW_RECOVERY_DIAGNOSTIC==='1';
const dirs={Formwheel:root,Formwheel_Clicker:path.join(ecosystem,'Formwheel_Clicker'),Formwheel_PVP:path.join(ecosystem,'Formwheel_PVP')};
// Only local test responses expose closures or replace remote SDKs. No production test hooks or backend calls.
function instrument(repo,file,s){
 if(repo==='Formwheel_Clicker'&&file==='assets/season2-leaderboard.js'){
  s=s.replace(/await Promise\.all\(\[[\s\S]*?\]\)/,'window.__leaderModules');
  assert(s.includes(' refresh();\n}catch'));
  return s.replace(' refresh();\n}catch',' window.__leaderQA={refresh,drawRows};refresh();\n}catch');
 }
 if(repo==='Formwheel_PVP'&&file==='online.js')return s.replace(/^import[^\n]*\n/gm,'').replace('const app=getApps()',"const {initializeApp,getApps,getAuth,signInAnonymously,onAuthStateChanged,getDatabase,ref,get,set,update,onValue,runTransaction,onDisconnect}=window.__onlineStubs;\nconst app=getApps()")+`
window.__onlineQA=(hostBuild,guestBuild,isHost)=>{host=isHost;room={map:'open',hostBuild,guest:{build:guestBuild}};window.fwPvpOnlineActive=true;render({players:[{x:110,y:230,hp:loadoutHP(hostBuild)},{x:690,y:230,hp:loadoutHP(guestBuild)}],bullets:[]});};`;
 if(repo==='Formwheel_PVP'&&file==='studio.html'){
  const at=s.lastIndexOf('})();');assert(at>=0);return s.slice(0,at)+`window.__studioQA={
 hidden(){switchTab('test');keys.add('d');switchTab('maps');return !active&&keys.size===0;},
 setup(){testMap={grid:base()};player={x:2,y:5,hp:100};target={x:4,y:5,hp:100};testWeapon=defaultW;aiWeapon=defaultW;active=true;keys.clear();$('test').hidden=false;aiMoveAt=aiFireAt=Infinity;lastFrame=100;},
 expiry(){this.setup();shots=[{x:2.5,y:5.5,vx:.1,vy:0,life:1,owner:'player',damage:10,color:'#fb923c'}];tick(135);return target.hp===100&&shots.length===0;},
 shield(){this.setup();target.x=3;aiWeapon={...defaultW,type:'melee',range:2,damage:32};skillShieldUntil=1000;aiFireAt=0;const random=Math.random;Math.random=()=>0;try{aiAttack(500);const protectedHP=player.hp;skillShieldUntil=0;aiFireAt=0;aiAttack(1200);return protectedHP===100&&player.hp===68;}finally{Math.random=random;}}
};`+s.slice(at);
 }
 return s;
}
const server=http.createServer((req,res)=>{
 const [repo,...rest]=new URL(req.url,'http://localhost').pathname.slice(1).split('/'),dir=dirs[repo],file=rest.join('/');
 if(!dir){res.writeHead(404);res.end();return}let full=path.resolve(dir,file);
 if(!full.startsWith(dir+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return}
 const old=baseline&&path.join(baseline,repo,file);if(old&&fs.existsSync(old))full=old;
 const ext=path.extname(full);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[ext]||'application/octet-stream');res.end(['.html','.js'].includes(ext)?instrument(repo,file,fs.readFileSync(full,'utf8')):fs.readFileSync(full));
});
function modules(){
 const unexpected=()=>{throw Error('Unexpected backend operation');};
 window.__onlineStubs={getApps:()=>[{}],initializeApp:()=>({}),getAuth:()=>({currentUser:null}),signInAnonymously:unexpected,onAuthStateChanged:()=>{},getDatabase:()=>({}),ref:()=>({}),get:unexpected,set:unexpected,update:unexpected,onValue:unexpected,runTransaction:unexpected,onDisconnect:unexpected};
 window.__pending=[];
 const database={getDatabase:()=>({}),ref:(_,p)=>p,query:(p,...options)=>({p,options}),orderByChild:order=>({order}),limitToLast:limit=>({limit}),get:request=>{if(!request.options.some(o=>o.limit===20))throw Error('Unbounded leaderboard request');return new Promise((resolve,reject)=>__pending.push({resolve:v=>resolve({val:()=>v}),reject}));},runTransaction:unexpected};
 window.__leaderModules=[{getApps:()=>[{}],initializeApp:()=>({})},database,{getAuth:()=>({currentUser:{uid:'me'},authStateReady:async()=>{}}),signInAnonymously:unexpected}];
 window.setInterval=()=>0;window.requestAnimationFrame=()=>0;
}
async function open(browser,repo,file,width=1280,seed){
 const c=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});await c.routeWebSocket('**/*',w=>w.close());await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await c.addInitScript(modules);if(seed)await c.addInitScript(seed);
 const p=await c.newPage(),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/${repo}/${file}`);return {c,p,errors};
}
const result=[];
function check(id,pass,details){result.push({id,pass,...(details?{details}:{})});if(!diagnostic)assert(pass,id);}
function noErrors(errors){if(!diagnostic)assert.deepEqual(errors,[]);}
async function poly(browser){
 const {c,p,errors}=await open(browser,'Formwheel','polyrhythm.html',390);
 await p.locator('#editorToggle').click();
 await p.evaluate(()=>{window.__savedBlobs=[];const create=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{__savedBlobs.push(b);return create(b);};});
 for(const [value,expected]of [['1',1.8],['9',8],['3.56',3.6],['',3.5]]){
  await p.evaluate(value=>{editorEvents=[{time:1,kind:'normal'}];document.querySelector('#editorPeriod').value=value;},value);
  await p.locator('#editorSave').click();const actual=await p.evaluate(async()=>JSON.parse(await __savedBlobs.at(-1).text()).period);check('poly-export-period-'+(value||'empty'),actual===expected,{actual,expected});
 }
 const imports=await p.evaluate(async()=>{
  const input=document.querySelector('#editorImport'),data=(time,version=1)=>JSON.stringify({format:'formwheel-polyrhythm-map',version,name:'Imported',period:3.5,notes:[{time,kind:'normal'}]});
  const fire=file=>{Object.defineProperty(input,'files',{value:[file],configurable:true});input.dispatchEvent(new Event('change'));};
  const flush=async()=>{await Promise.resolve();await Promise.resolve();};
  editorEvents=[{time:7,kind:'normal'}];fire({size:1,text:async()=>data(2,999)});await flush();const unsupported=editorEvents[0].time===7;
  let read=false;editorEvents=[{time:7,kind:'normal'}];fire({size:2000001,text:async()=>{read=true;return data(2);}});await flush();const size=editorEvents[0].time===7&&!read;
  let resolveOld;fire({size:1,text:()=>new Promise(r=>resolveOld=r)});fire({size:1,text:async()=>data(4)});await flush();resolveOld(data(2));await flush();const latest=editorEvents[0].time===4;
  let rejectOld;fire({size:1,text:()=>new Promise((_,r)=>rejectOld=r)});fire({size:1,text:async()=>data(5)});await flush();rejectOld(Error('old request'));await flush();const staleError=editorEvents[0].time===5&&!editorStatus.textContent.includes('실패');
  editor.hidden=false;let resolveClosed;editorEvents=[{time:7,kind:'normal'}];fire({size:1,text:()=>new Promise(r=>resolveClosed=r)});document.querySelector('#editorToggle').click();resolveClosed(data(2));await flush();const closed=editorEvents[0].time===7;
  return {unsupported,size,latest,staleError,closed};
 });for(const[k,v]of Object.entries(imports))check('poly-import-'+k,v);noErrors(errors);await c.close();
}
async function clicker(browser){
 const key='formwheel_clicker_season2_save_v1';
 const invalid=[['malformed','{unclosed'],['balance',JSON.stringify({version:2,points:'bad',earned:'5',best:'5'})],['level',JSON.stringify({version:2,points:'5',earned:'5',best:'5',clickLevel:Number.MAX_SAFE_INTEGER})],['version',JSON.stringify({version:999,points:'5',earned:'5',best:'5'})]];
 for(const [label,raw]of invalid){
  const {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html',390,{content:`localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(raw)});`});
  const state=await p.evaluate(({key,raw})=>({kept:localStorage.getItem(key)===raw,paused:document.querySelector('#clickButton').disabled,recovery:!!document.querySelector('#saveRecovery')}),{key,raw});
  check('clicker-preserve-'+label,state.kept&&state.paused&&state.recovery,{...state,errors});
  if(label==='malformed'){
   if(await p.locator('#restartWithSaveBackup').count()){
    await p.locator('#restartWithSaveBackup').click();const reset=await p.evaluate(({key,raw})=>({primary:JSON.parse(localStorage.getItem(key)).points==='0',backup:Object.keys(localStorage).some(k=>k.startsWith(key+'_recovery_')&&localStorage.getItem(k)===raw),enabled:!document.querySelector('#clickButton').disabled}),{key,raw});check('clicker-explicit-backup-reset',Object.values(reset).every(Boolean),reset);
    const axe=await new AxeBuilder({page:p}).include('#saveRecovery').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();if(!diagnostic)assert.deepEqual(axe.violations,[]);
    const saved=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
    const next=await open(browser,'Formwheel_Clicker','index.html',390,{content:`Object.entries(${JSON.stringify(saved)}).forEach(([k,v])=>localStorage.setItem(k,v));`});
    const retained=await next.p.locator('#downloadLastSaveBackup').count()===1;check('clicker-backup-available-next-session',retained);
    if(retained){await next.p.evaluate(()=>{const create=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{window.__downloaded=b;return create(b);};});await next.p.locator('#downloadLastSaveBackup').click();check('clicker-backup-download-exact',await next.p.evaluate(async()=>__downloaded.text())===raw);}else check('clicker-backup-download-exact',false);
    noErrors(next.errors);await next.c.close();
   }else{check('clicker-explicit-backup-reset',false);check('clicker-backup-available-next-session',false);check('clicker-backup-download-exact',false);}
  }
  noErrors(errors);await c.close();
 }
 {
  const raw='{unclosed';const {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html',1280,{content:`localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(raw)});`});
  if(await p.locator('#restartWithSaveBackup').count()){
   await p.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.includes('_recovery_'))throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};});
   await p.locator('#restartWithSaveBackup').click();const safe=await p.evaluate(({key,raw})=>localStorage.getItem(key)===raw&&document.querySelector('#clickButton').disabled,{key,raw});check('clicker-backup-failure-keeps-original',safe);
  }else check('clicker-backup-failure-keeps-original',false);
  noErrors(errors);await c.close();
 }
 {
  const raw='{unclosed',replacement=JSON.stringify({version:2,points:'15',earned:'15',best:'15'});const {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html',1280,{content:`localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(raw)});`});
  if(await p.locator('#restartWithSaveBackup').count()){
   await p.evaluate(({key,replacement})=>localStorage.setItem(key,replacement),{key,replacement});await p.locator('#restartWithSaveBackup').click();check('clicker-reset-preserves-newer-tab-save',await p.evaluate(({key,replacement})=>localStorage.getItem(key)===replacement,{key,replacement}));
  }else check('clicker-reset-preserves-newer-tab-save',false);
  noErrors(errors);await c.close();
 }
 {
  const {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html',390,()=>{
   const get=Storage.prototype.getItem,set=Storage.prototype.setItem;window.__primaryWrites=0;
   Storage.prototype.getItem=function(k){if(k==='formwheel_clicker_season2_save_v1')throw new DOMException('Denied','SecurityError');return get.call(this,k);};
   Storage.prototype.setItem=function(k,v){if(k==='formwheel_clicker_season2_save_v1')window.__primaryWrites++;return set.call(this,k,v);};
  });
  await p.locator('#clickButton').click();const temporary=await p.evaluate(()=>document.querySelector('#score').textContent==='1'&&__primaryWrites===0);
  check('clicker-unreadable-storage-temporary-play',temporary);noErrors(errors);await c.close();
 }
 {
  const {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html');await p.waitForFunction(()=>!!window.__leaderQA);
  const rows=await p.evaluate(async()=>{
   __pending[0].resolve({});await Promise.resolve();await Promise.resolve();
   const score=String(10).padStart(101,'0'),mine=[{uid:'me',name:'Me',score}];
   __leaderQA.drawRows(mine,'me');__leaderQA.drawRows([],'me');const emptyRank=document.querySelector('#s2MyRank').textContent==='';
   __pending=[];const invalid=__leaderQA.refresh();__pending[0].resolve({bad:{name:'Bad',score:'9'.repeat(101)},good:{name:'Good',score}});await invalid;const bounded=!document.querySelector('#s2List').textContent.includes('Bad')&&document.querySelector('#s2List').textContent.includes('Good');
   __pending=[];const old=__leaderQA.refresh(),fresh=__leaderQA.refresh();__pending[1].resolve({new:{name:'New',score}});await fresh;__pending[0].resolve({old:{name:'Old',score}});await old;const order=document.querySelector('#s2List').textContent.includes('New')&&!document.querySelector('#s2List').textContent.includes('Old');
   __pending=[];const late=__leaderQA.refresh(),newer=__leaderQA.refresh();__pending[1].resolve({new:{name:'Latest',score}});await newer;__pending[0].reject(Error('late failure'));await late;const staleError=document.querySelector('#s2List').textContent.includes('Latest')&&document.querySelector('#s2Status').textContent.includes('연결됨');
   __leaderQA.drawRows(mine,'me');__pending=[];const failed=__leaderQA.refresh();__pending[0].reject(Error('offline'));await failed;const errorRank=document.querySelector('#s2MyRank').textContent==='';
   return {emptyRank,bounded,order,staleError,errorRank};
  });for(const[k,v]of Object.entries(rows))check('clicker-leaderboard-'+k,v);noErrors(errors);await c.close();
 }
}
async function pvp(browser){
 let {c,p,errors}=await open(browser,'Formwheel_PVP','index.html');await p.waitForFunction(()=>!!window.__onlineQA&&!!document.querySelector('#pvp2-my-bar'));
 const builds=await p.evaluate(async()=>{
  const rows=[];for(const weapon of Object.keys(weaponPoints))for(const ability of Object.keys(skillPoints))for(let speed=0;speed<=10-weaponPoints[weapon]-skillPoints[ability];speed++){
   playing=false;get('weapon').value=weapon;get('skill').value=ability;updateLoadout();get('speed-points').value=String(speed);start();get('hp').textContent=p.hp;get('aihp').textContent=a.hp;await Promise.resolve();
   const full=[document.querySelector('#pvp2-my-bar').style.width,document.querySelector('#pvp2-foe-bar').style.width];
   get('hp').textContent=p.hp/2;get('aihp').textContent=a.hp/2;await Promise.resolve();const half=[document.querySelector('#pvp2-my-bar').style.width,document.querySelector('#pvp2-foe-bar').style.width];
   rows.push({id:`pvp-health-${weapon}-${ability}-speed${speed}`,maximum:p.maxHp,full,half,pass:full.every(x=>Math.abs(parseFloat(x)-100)<.00001)&&half.every(x=>Math.abs(parseFloat(x)-50)<.00001)});
  }playing=false;return rows;
 });assert.equal(builds.length,274);for(const row of builds)check(row.id,row.pass,row);
 const edges=await p.evaluate(async()=>{
  const hostBuild={weapon:'orb',skill:'dash',speedPoints:0},guestBuild={weapon:'heavy',skill:'barrier',speedPoints:0};let online=true;
  for(const isHost of [true,false]){__onlineQA(hostBuild,guestBuild,isHost);await Promise.resolve();online&&=parseFloat(document.querySelector('#pvp2-my-bar').style.width)===100&&parseFloat(document.querySelector('#pvp2-foe-bar').style.width)===100;}window.fwPvpOnlineActive=false;
  const key=customStoreKey,grid=()=>{const g=Array.from({length:18},()=>Array(28).fill(0));g[2][2]=4;g[15][25]=5;return g;};
  const weapon={id:'kept',name:'Saved',type:'projectile',damage:16,range:7,rate:550,speed:8,color:'#fb923c'};
  localStorage.setItem(key,JSON.stringify({maps:'broken',weapons:[weapon]}));syncCustom();const isolated=customWeapons.length===1;
  const invalidWeapons=[{...weapon,id:'float',damage:16.5},{...weapon,id:'type',type:'bad'},{...weapon,id:'color',color:'#000000'},{...weapon,id:''}];
  localStorage.setItem(key,JSON.stringify({maps:[],weapons:invalidWeapons}));syncCustom();const weaponSchema=customWeapons.length===0;
  const m={id:'map',name:'Map',grid:grid()};localStorage.setItem(key,JSON.stringify({maps:[m],weapons:[weapon]}));syncCustom();localStorage.setItem(key,JSON.stringify({maps:[],weapons:[]}));syncCustom();const staleRegistry=!maps['custom:map']&&!weaponStats['custom:kept'];
  const duplicate={...m,grid:grid()};duplicate.grid[3][3]=4;const url=new URL(location.href);url.searchParams.set('importMap',JSON.stringify(duplicate));history.replaceState(null,'',url);const original=localStorage.getItem(key);importSharedMap();const uniqueImport=localStorage.getItem(key)===original;
  localStorage.setItem(key,JSON.stringify({maps:[m]}));const changed={...m,name:'Changed',grid:grid()};changed.grid[5][5]=2;url.searchParams.set('importMap',JSON.stringify(changed));history.replaceState(null,'',url);importSharedMap();const copied=JSON.parse(localStorage.getItem(key)).maps;const collisionCopy=copied.length===2&&copied[0].grid[5][5]===0&&copied[1].grid[5][5]===2&&copied[1].id!==m.id;
  const full=Array.from({length:12},(_,i)=>({...m,id:'m'+i}));localStorage.setItem(key,JSON.stringify({maps:full}));url.searchParams.set('importMap',JSON.stringify({...m,id:'extra'}));history.replaceState(null,'',url);importSharedMap();const capacity=JSON.parse(localStorage.getItem(key)).maps.length===12;
  return {online,isolated,weaponSchema,staleRegistry,uniqueImport,collisionCopy,capacity};
 });for(const[k,v]of Object.entries(edges))check('pvp-main-'+k,v);noErrors(errors);await c.close();
 ({c,p,errors}=await open(browser,'Formwheel_PVP','studio.html'));
 const studio=await p.evaluate(()=>({hidden:__studioQA.hidden(),expiry:__studioQA.expiry(),shield:__studioQA.shield()}));for(const[k,v]of Object.entries(studio))check('pvp-studio-'+k,v);noErrors(errors);await c.close();
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 for(const [name,run]of [['Polyrhythm',poly],['Clicker',clicker],['PVP',pvp]]){const before=result.length;await run(browser);const rows=result.slice(before);console.log(`${name}: ${rows.filter(x=>x.pass).length}/${rows.length} regression scenarios`);}
 const summary={counting:'Regression scenarios include the 274 existing valid built-in loadout choices. They are not independent defects or edited source locations.',scenarios:result.length,failed:result.filter(x=>!x.pass).length,results:result};
 if(process.env.FW_RECOVERY_REPORT)fs.writeFileSync(process.env.FW_RECOVERY_REPORT,JSON.stringify(summary,null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
