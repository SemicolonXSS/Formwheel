"use strict";
// Exercise production assets with cached public SDK scripts and no external transport.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(__dirname,'..'),siblings=process.env.FW_ECOSYSTEM_ROOT||path.dirname(root),manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/quality-audit-500-2026-11-24.json')));
const repos=manifest.repositories.map(x=>x.repo),sdk=JSON.parse(fs.readFileSync(process.env.FW_FIREBASE_SDK_MAP||path.join(siblings,'.expanded-audit-sdk/map.json'))),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
function dir(repo){return repo==='Formwheel'?root:path.join(siblings,repo)}
function asset(u){const [repo,...parts]=decodeURIComponent(u.pathname).slice(1).split('/');if(!repos.includes(repo))return null;const folder=dir(repo);let f=path.resolve(folder,parts.join('/'));if(!f.startsWith(folder+path.sep))return null;if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');return fs.existsSync(f)&&fs.statSync(f).isFile()?f:null}
const server=http.createServer((req,res)=>{const f=asset(new URL(req.url,'http://localhost'));if(!f){res.writeHead(404);res.end();return}res.setHeader('Content-Type',(types[path.extname(f)]||'text/plain')+'; charset=utf-8');res.end(fs.readFileSync(f))});
function walk(folder,rel=''){return fs.readdirSync(path.join(folder,rel),{withFileTypes:true}).flatMap(e=>e.isDirectory()?(['.git','node_modules','archive','backups','firebase-security','ecosystem','ecosystem-third','ecosystem-expanded'].includes(e.name)?[]:walk(folder,path.join(rel,e.name))):e.name.endsWith('.html')?[path.join(rel,e.name)]:[])}
const jobs=[];
for(const repo of repos)for(const file of walk(dir(repo))){const source=fs.readFileSync(path.join(dir(repo),file),'utf8');if(file.startsWith('google')||source.includes('data-sns-channel=')&&source.includes('shared/sns-traffic.js')||/http-equiv=["']?refresh/i.test(source))continue;jobs.push({repo,file,state:'page:'+file})}
for(const t of [...fs.readFileSync(path.join(dir('Formwheel_Tool'),'index.html'),'utf8').matchAll(/data-tool="([^"]+)"/g)].map(x=>x[1]))jobs.push({repo:'Formwheel_Tool',file:'index.html',state:'tool:'+t,action:p=>p.locator('[data-tool="'+t+'"]').click()});
for(const repo of manifest.themeRepositories)for(const theme of ['sunset','midnight','cosmic-eternity'])jobs.push({repo,file:'index.html',state:'theme:'+theme,theme});
const selected=jobs.filter(j=>(!process.env.FW_APP_FILTER||j.repo===process.env.FW_APP_FILTER)&&(!process.env.FW_STATE_FILTER||j.state===process.env.FW_STATE_FILTER));
function inspect(){
 function color(s){const m=s.match(/^rgba?\(([^)]+)\)/);if(!m)return null;const n=m[1].split(/[,/ ]+/).filter(Boolean).map(Number);return[n[0],n[1],n[2],n.length>3?n[3]:1]}
 function solidBg(n){for(let p=n;p;p=p.parentElement){const c=getComputedStyle(p);if(c.backgroundImage!=='none')return null;const b=color(c.backgroundColor);if(b&&b[3]===1)return b.slice(0,3);if(b&&b[3]>0)return null}return[255,255,255]}
 function lum(c){return c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0)}
 function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 function mix(c,b){return c.slice(0,3).map((v,i)=>v*c[3]+b[i]*(1-c[3]))}
 function selector(n){if(n.id)return '#'+CSS.escape(n.id);const parts=[];for(let p=n;p&&p!==document.body;p=p.parentElement){if(p.id){parts.unshift('#'+CSS.escape(p.id));break}parts.unshift(p.tagName.toLowerCase()+':nth-child('+([...p.parentElement.children].indexOf(p)+1)+')')}return parts.join(' > ')}
 const rows=[];for(const n of document.querySelectorAll('input,textarea,select')){
  const type=n.type;if(n.disabled||n.readOnly||['hidden','button','submit','reset','checkbox','radio','range','color','file','image'].includes(type))continue;
  const rect=n.getBoundingClientRect(),c=getComputedStyle(n);if(!rect.width||!rect.height||c.visibility!=='visible'||c.opacity==='0')continue;
  const outside=solidBg(n.parentElement),inside=solidBg(n);if(!outside||!inside)continue;
  const sides=['Top','Right','Bottom','Left'].map(s=>({style:c['border'+s+'Style'],width:parseFloat(c['border'+s+'Width']),color:color(c['border'+s+'Color'])}));
  if(sides.some(s=>['inset','outset','groove','ridge'].includes(s.style))||c.boxShadow!=='none')continue;
  const fill=ratio(inside,outside),borders=sides.map(s=>s.width&&s.style!=='none'&&s.color?ratio(mix(s.color,outside),outside):0);
  const outline=color(c.outlineColor),outlineRatio=c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>=1&&outline?ratio(mix(outline,outside),outside):0;
  if(fill>=3||Math.max(...borders,outlineRatio)>=3)continue;
  rows.push({rule:'input-boundary-contrast',target:selector(n),html:n.outerHTML.slice(0,300),type,inside,outside,fillRatio:fill,borderRatios:borders,borders:sides,outlineRatio,width:rect.width,height:rect.height});
 }
 // Compare shared grid edges against both neighboring cell fills. One result per active cell.
 const cells=[...document.querySelectorAll('#board button.square, #board button[role="gridcell"]')];
 for(const n of cells){if(n.disabled)continue;const r=n.getBoundingClientRect(),bg=solidBg(n);if(!r.width||!r.height||!bg)continue;const failures=[];
  for(const other of cells){if(n===other)continue;const q=other.getBoundingClientRect();let side,opposite;
   if(Math.abs(r.right-q.left)<1&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>r.height*.8){side='Right';opposite='Left'}
   else if(Math.abs(r.bottom-q.top)<1&&Math.min(r.right,q.right)-Math.max(r.left,q.left)>r.width*.8){side='Bottom';opposite='Top'}
   else if(Math.abs(r.left-q.right)<1&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>r.height*.8){side='Left';opposite='Right'}
   else if(Math.abs(r.top-q.bottom)<1&&Math.min(r.right,q.right)-Math.max(r.left,q.left)>r.width*.8){side='Top';opposite='Bottom'}else continue;
   const adjacent=solidBg(other);if(!adjacent||ratio(bg,adjacent)>=3)continue;let edge=0;
   for(const [el,s] of [[n,side],[other,opposite]]){const style=getComputedStyle(el),c=color(style['border'+s+'Color']);if(parseFloat(style['border'+s+'Width'])>=1&&style['border'+s+'Style']!=='none'&&c){const line=mix(c,bg);edge=Math.max(edge,Math.min(ratio(line,bg),ratio(line,adjacent)))}}
   if(edge<3)failures.push({side,neighbor:selector(other),fillRatio:ratio(bg,adjacent),edgeRatio:edge});
  }
  if(failures.length)rows.push({rule:'grid-boundary-contrast',target:selector(n),html:n.outerHTML.slice(0,250),background:bg,failures});
 }
 return rows;
}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,...(process.env.FORMWHEEL_CHROMIUM_PATH?{executablePath:process.env.FORMWHEEL_CHROMIUM_PATH}:{})});
 const results=[];let next=0;
 try{await Promise.all(Array.from({length:Number(process.env.FW_AUDIT_WORKERS||3)},async()=>{while(next<selected.length){
  const j=selected[next++],c=await b.newContext({viewport:{width:Number(process.env.FW_VIEWPORT||1280),height:1000},serviceWorkers:'block',reducedMotion:'reduce'}),errors=[];
  await c.routeWebSocket('**/*',w=>w.close());await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();const f=sdk[u.href]||(u.hostname==='semicolonxss.github.io'&&asset(u));return f?r.fulfill({body:fs.readFileSync(f),contentType:types[path.extname(f)]||'text/javascript'}):r.abort()});
  if(j.theme)await c.addInitScript(t=>{localStorage.setItem('formwheel_rapid_shop_beta_v1',JSON.stringify({equipped:t,purchases:[{theme:t,refunded:false}]}));localStorage.setItem('fw-global-theme-v1',t)},j.theme);
  try{const p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port+'/'+j.repo+'/'+j.file,{waitUntil:'load'});if(j.action)await j.action(p);
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const boundaries=await p.evaluate(inspect);
   // User-authored sandboxed previews are excluded; audit the surrounding editor itself.
   const a=await new AxeBuilder({page:p}).exclude('iframe').options({iframes:false,rules:{'target-size':{enabled:true}}}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();
   const result={repo:j.repo,file:j.file,state:j.state,themeApplied:await p.locator('body').getAttribute('data-fw-global-theme'),errors,boundaries,violations:a.violations};results.push(result);
   if(boundaries.length||a.violations.length||errors.length)console.log('FAIL '+j.repo+' '+j.state+' '+boundaries.length+' boundaries; '+a.violations.map(v=>v.id+'='+v.nodes.length).join(',')+' '+errors.join(';'));
   if(process.env.FW_SCREENSHOT_DIR&&['Formwheel','Formwheel_Tool','Formwheel_Balance'].includes(j.repo)&&['page:sudoku.html','page:board/index.html','tool:timer','theme:midnight'].includes(j.state))await p.screenshot({path:path.join(process.env.FW_SCREENSHOT_DIR,j.repo+'-'+j.state.replaceAll(/[^a-z0-9]/gi,'-')+'-'+(process.env.FW_VIEWPORT||1280)+'.png'),fullPage:true});
  }catch(e){results.push({repo:j.repo,file:j.file,state:j.state,error:e.message,errors});console.log('ERROR '+j.repo+' '+j.state+' '+e.message.slice(0,160));}
  finally{await c.close();if(process.env.FW_EXPANDED_REPORT)fs.writeFileSync(process.env.FW_EXPANDED_REPORT,JSON.stringify(results,null,2));}
 } }));}finally{await b.close()}
 const failed=results.filter(r=>r.error||r.errors.length||r.boundaries.length||r.violations.length);assert.equal(failed.length,0,JSON.stringify(failed.map(r=>({repo:r.repo,state:r.state,error:r.error,boundaries:r.boundaries?.length,rules:r.violations?.map(v=>v.id)}))));
 console.log('PASS '+results.length+' UI states at '+(process.env.FW_VIEWPORT||1280)+'px: axe, editable-field and active-grid boundaries');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
