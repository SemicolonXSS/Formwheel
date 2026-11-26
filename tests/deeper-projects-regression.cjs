'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(__dirname,'..'),ecosystem=process.env.FW_ECOSYSTEM_ROOT||path.dirname(root);
const baseline=process.env.FW_DEEP_BASELINE,diagnostic=process.env.FW_DEEP_DIAGNOSTIC==='1';
const dirs={Formwheel:root,Formwheel_Clicker:path.join(ecosystem,'Formwheel_Clicker'),Formwheel_PVP:path.join(ecosystem,'Formwheel_PVP')};
// Test-only closure access and a finite guard keep the original unbounded BFS from hanging a test process.
// Production files contain no test exports. Native UI checks below run against the same served sources.
function instrument(repo,file,source){
 if(repo==='Formwheel_Clicker'&&file==='assets/season2-main.js')return source.replace(/\}\)\(\);\s*$/,`window.__deep={reset(level,digits){game={...fallback,autoLevel:level};points=0n;earned=digits?10n**BigInt(digits):0n;best=0n;lastFrame=0;window.__deepNow=0;if(typeof autoRemainder!=='undefined')autoRemainder=0n;if(typeof autoVisible!=='undefined')autoVisible=true;},step(ms){window.__deepNow=ms;tick();},points:()=>points.toString(),challenge:showChallenge};})();`);
 if(repo==='Formwheel_PVP'&&file==='studio.html'){
  source=source.replace('for(let i=0;i<queue.length;i++){const [x,y]',"for(let i=0;i<queue.length;i++){window.__deepVisits=i+1;if(i>=1024)throw Error('bounded-map-guard');const [x,y]");
  const at=source.lastIndexOf('})();');assert(at>=0);
  return source.slice(0,at)+`window.__deep={probe(x,y){testMap={grid:Array.from({length:H},()=>Array(W).fill(0))};for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])testMap.grid[9+dy][14+dx]=1;player={x:14,y:9,hp:100};target={x,y,hp:100};aiWeapon={...defaultW,type:'melee',range:1};aiLevel=10;window.__deepVisits=0;try{aiStep();return {bounded:true,visited:window.__deepVisits}}catch(e){if(e.message!=='bounded-map-guard')throw e;return {bounded:false,visited:window.__deepVisits}}},extras(){testMap={grid:base()};const bounds=solid(-1,5)&&solid(W,5)&&shotSolid(-1,5)&&shotSolid(W,5);const duplicate=base();duplicate[3][3]=4;const uniqueStarts=!validateMap({name:'duplicate',grid:duplicate});const weapon={id:'kept',...defaultW};localStorage.setItem(KEY,JSON.stringify({maps:'damaged-list',weapons:[weapon],skills:[]}));load();const isolatedLoad=db.weapons.length===1&&db.weapons[0].id==='kept';const saved={id:'saved',name:'Saved',grid:base()};db={maps:[saved],weapons:[],skills:[]};grid=base();grid[5][5]=2;rememberMap();grid[5][5]=3;renderLists();$('mapList').querySelector('button').click();$('undo').click();const isolatedUndo=grid[5][5]===0&&history.length===0;return {bounds,uniqueStarts,isolatedLoad,isolatedUndo};}};`+source.slice(at);
 }
 return source;
}
const server=http.createServer((req,res)=>{
 const [repo,...parts]=new URL(req.url,'http://localhost').pathname.slice(1).split('/'),dir=dirs[repo],file=parts.join('/');
 if(!dir){res.writeHead(404);res.end();return}let full=path.resolve(dir,file);
 if(!full.startsWith(dir+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){res.writeHead(404);res.end();return}
 const old=baseline&&path.join(baseline,repo,file);if(old&&fs.existsSync(old))full=old;
 const ext=path.extname(full);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[ext]||'application/octet-stream');
 res.end(['.html','.js'].includes(ext)?instrument(repo,file,fs.readFileSync(full,'utf8')):fs.readFileSync(full));
});
async function open(browser,repo,file,width=1280){
 const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
 await c.routeWebSocket('**/*',w=>w.close());await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await c.addInitScript(()=>{window.setInterval=()=>0;window.requestAnimationFrame=()=>0;});
 if(repo==='Formwheel_Clicker')await c.addInitScript(()=>{window.__deepNow=0;Object.defineProperty(performance,'now',{value:()=>window.__deepNow,configurable:true});});
 const p=await c.newPage(),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/${repo}/${file}`);return {c,p,errors};
}
function verify(value,label){if(!diagnostic)assert(value,label);}
async function poly(browser){
 let {c,p,errors}=await open(browser,'Formwheel','polyrhythm.html');
 const cases=await p.evaluate(()=>{
  const rows=[],originalNow=performance.now.bind(performance);editor.hidden=false;editorAudio.removeAttribute('src');
  for(const direction of [-1,1])for(let gap=1;gap<=75;gap++){
   editing=true;editorEvents=[{time:1,kind:'normal'}];editorDirection=direction;editorStarted=0;
   Object.defineProperty(performance,'now',{value:()=>1000+gap,configurable:true});editorStamp(true);
   rows.push({id:`rejected-turn-${direction}-${gap}ms`,type:'rejected-stamp-state',pass:editorEvents.length===1&&editorDirection===direction});
  }
  Object.defineProperty(performance,'now',{value:originalNow,configurable:true});editing=false;
  const originals={fillTargets,mapAdvance,playDrum};fillTargets=()=>{};mapAdvance=()=>{};playDrum=()=>{};
  try{
   const holds=maps.flatMap((m,map)=>m.beats.map((at,note)=>({map,note,at})).filter(x=>mapTileType(x.note)==='hold')).slice(0,150);
   for(const t of holds){
    mode='map';mapIndex=t.map;mapBeat=0;stage=0;period=stagePeriod();setJudgmentOffset(200);running=true;direction=1;
    score=0;success=0;combo=0;lives=5;holdTarget=null;activeInput='qa';targets=[{id:1,at:t.at,kind:'hold',angle:0}];
    const offset=TAU*.2/period;progress=t.at-offset;hit();progress=t.at+HOLD_LENGTH-offset;release('qa');
    rows.push({id:`offset-hold-m${t.map}-n${t.note}`,type:'hold-offset-release',pass:score===150&&lives===5});
   }
  }finally{({fillTargets,mapAdvance,playDrum}=originals);running=false;holdTarget=null;activeInput=null;setJudgmentOffset(0);}
  return rows;
 });
 assert.equal(cases.length,300);verify(cases.every(r=>r.pass),'Polyrhythm matrix');assert.deepEqual(errors,[]);await c.close();
 ({c,p,errors}=await open(browser,'Formwheel','polyrhythm.html',390));
 await p.locator('#editorToggle').click();await p.locator('#editorRecord').click();await p.locator('#editorTap').focus();await p.keyboard.press('Enter');
 const keyboardTap=await p.evaluate(()=>editorEvents.length===1&&editorEvents[0].kind==='normal');
 await p.evaluate(()=>{editorEvents=[];});await p.locator('#editorTap').click();
 const pointerOnce=await p.evaluate(()=>editorEvents.length===1&&!editorStatus.textContent.includes('최소'));
 await p.evaluate(()=>{editorStop();editor.hidden=false;editorEvents=[{time:1,kind:'normal'}];editorAudio.src='data:audio/wav;base64,';editorAudio.play=()=>Promise.reject(Error('test playback failure'));});
 await p.locator('#editorRecord').click();const preserved=await p.evaluate(()=>editorEvents.length===1&&!editing);
 await p.evaluate(()=>{editorStop();editor.hidden=false;editorAudio.play=()=>new Promise(resolve=>window.__resolvePlay=resolve);});
 await p.locator('#editorRecord').click();await p.locator('#editorToggle').click();await p.evaluate(()=>window.__resolvePlay());
 const cancelled=await p.evaluate(()=>!editing&&editor.hidden);
 await p.evaluate(()=>{editorStop();editor.hidden=false;editorAudio.removeAttribute('src');});await p.locator('#editorRecord').click();await p.locator('#start').click();
 const exclusive=await p.evaluate(()=>!editing&&running);await p.evaluate(()=>{endGame();editorStop();editor.hidden=false;});
 await p.locator('#editorFile').setInputFiles([]);const emptyAudio=await p.evaluate(()=>!editorAudio.hasAttribute('src'));
 const edges={keyboardTap,pointerOnce,preserved,cancelled,exclusive,emptyAudio};for(const [k,v]of Object.entries(edges))verify(v,'Polyrhythm '+k);assert.deepEqual(errors,[]);await c.close();return {cases,edges};
}
async function clicker(browser){
 let {c,p,errors}=await open(browser,'Formwheel_Clicker','index.html');
 const cases=await p.evaluate(()=>{
  const rows=[],phases=[17,53,89,127,173,239,317,433,557,691,823,947];
  for(const level of [1,4,5,9,20])for(const digits of [0,20,34,70,100])for(const phase of phases){
   __deep.reset(level,digits);__deep.step(1000);const whole=__deep.points();
   __deep.reset(level,digits);__deep.step(phase);__deep.step(1000);const split=__deep.points();
   rows.push({id:`auto-L${level}-E${digits}-split${phase}`,level,earnedExponent:digits,splitMs:phase,whole,split,pass:whole===split&&BigInt(whole)>0n});
  }return rows;
 });assert.equal(cases.length,300);verify(cases.every(r=>r.pass),'Clicker elapsed-time conservation');assert.deepEqual(errors,[]);await c.close();
 ({c,p,errors}=await open(browser,'Formwheel_Clicker','index.html'));
 const visibility=await p.evaluate(()=>{
  __deep.reset(1,0);__deep.step(317);window.__deepNow=600;
  Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));
  window.__deepNow=2600;Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));
  __deep.step(3000);return __deep.points()==='1';
 });
 await p.evaluate(()=>{__deep.reset(1,0);__deep.step(317);window.dispatchEvent(new Event('pagehide'));});
 await p.reload();const persisted=await p.evaluate(()=>{__deep.step(683);return __deep.points()==='1';});
 await c.addInitScript(()=>{localStorage.setItem('formwheel_clicker_season2_save_v1',JSON.stringify({version:2,points:'1000000',earned:'1000000',best:'1000000',autoLevel:4,clickLevel:0}));});
 await p.reload();await p.evaluate(()=>window.__deepNow=500);await p.locator('#autoUpgrade').click();
 const upgradeBoundary=await p.evaluate(()=>{__deep.step(1000);return __deep.points()==='996001';});
 assert.deepEqual(errors,[]);await c.close();
 ({c,p,errors}=await open(browser,'Formwheel_Clicker','index.html',390));await p.locator('#clickButton').focus();await p.evaluate(()=>__deep.challenge());
 const focused=await p.locator('[role="dialog"] button').evaluate(e=>e===document.activeElement);
 await p.keyboard.press('Tab');const trapped=await p.locator('[role="dialog"] button').evaluate(e=>e===document.activeElement);
 await p.setViewportSize({width:320,height:240});
 if(!diagnostic)await p.waitForFunction(()=>{const r=document.querySelector('[role="dialog"]').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;},null,{polling:50,timeout:2000});
 const fits=await p.locator('[role="dialog"]').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;});
 if(!diagnostic){const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();assert.deepEqual(a.violations,[],'Clicker modal accessibility');}
 await p.evaluate(()=>window.__deepNow=500);await p.locator('[role="dialog"] button').focus();await p.keyboard.press('Enter');
 const keyboardConfirmed=await p.locator('[role="dialog"]').count()===0;
 const restored=await p.locator('#clickButton').evaluate(e=>e===document.activeElement&&!e.closest('[inert]'));
 const edges={visibility,persisted,upgradeBoundary,focused,trapped,fits,keyboardConfirmed,restored};for(const[k,v]of Object.entries(edges))verify(v,'Clicker '+k);assert.deepEqual(errors,[]);await c.close();return {cases,edges};
}
async function pvp(browser){
 const {c,p,errors}=await open(browser,'Formwheel_PVP','studio.html');
 const cases=await p.evaluate(()=>{
  const rows=[];for(let y=0;y<18&&rows.length<300;y++)for(let x=0;x<28&&rows.length<300;x++){
   if(Math.abs(x-14)+Math.abs(y-9)<=1)continue;
   const result=__deep.probe(x,y);rows.push({id:`enclosed-player-open-edges-AI-${x}-${y}`,x,y,...result,pass:result.bounded&&result.visited<=504});
  }return rows;
 });const edges=await p.evaluate(()=>__deep.extras());assert.equal(cases.length,300);verify(cases.every(r=>r.pass),'PVP bounded path search');for(const[k,v]of Object.entries(edges))verify(v,'PVP '+k);assert.deepEqual(errors,[]);await c.close();return {cases,edges};
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const report={counting:'900 parameterized regression scenarios, not 900 independent defects or modified source locations'};
 for(const [name,run]of [['polyrhythm',poly],['clicker',clicker],['pvp',pvp]]){report[name]=await run(browser);console.log(name+': '+report[name].cases.filter(x=>x.pass).length+'/300 scenarios, edges '+JSON.stringify(report[name].edges));}
 if(process.env.FW_DEEP_REPORT)fs.writeFileSync(process.env.FW_DEEP_REPORT,JSON.stringify(report,null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
