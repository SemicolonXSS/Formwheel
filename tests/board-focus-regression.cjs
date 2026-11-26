'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',types[path.extname(f)]||'text/plain');res.end(fs.readFileSync(f))});
// This detector evaluates the rendered indicator against the actual solid board fill.
// It does not require a particular repair color. Patterned/translucent fills fail explicitly.
function inspect(){const e=document.activeElement,b=document.getElementById('board'),s=getComputedStyle(e);function color(v){const m=v.match(/^rgba?\(([^)]+)\)/);if(!m)return null;return m[1].split(/[,/ ]+/).filter(Boolean).map(Number)}let bg=null;for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p),rgb=color(c.backgroundColor);if(c.backgroundImage!=='none')throw Error('Non-solid focus background');if(rgb&&(rgb.length<4||rgb[3]===1)){bg=rgb.slice(0,3);break}if(rgb&&rgb[3]>0)throw Error('Translucent focus background')}const fg=color(s.outlineColor);if(!fg||fg.length>3&&fg[3]!==1)throw Error('Unsupported translucent outline');for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p);if(Number(c.opacity)!==1||c.filter!=='none'||c.mixBlendMode!=='normal')throw Error('Unsupported focus compositing')}function luminance(c){return c.slice(0,3).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((a,n,i)=>a+n*[.2126,.7152,.0722][i],0)}const a=luminance(fg),z=luminance(bg);return{index:[...b.children].indexOf(e),label:e.getAttribute('aria-label'),html:e.outerHTML,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,focusVisible:e.matches(':focus-visible'),outlineColor:fg,outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineOffset:parseFloat(s.outlineOffset),background:bg,contrast:(Math.max(a,z)+.05)/(Math.min(a,z)+.05)}}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.FORMWHEEL_CHROMIUM_PATH?{executablePath:process.env.FORMWHEEL_CHROMIUM_PATH}:{})}),results=[];
 try{for(const width of [320,390,768,900,1280])for(const game of ['go9','go13','go19','omok']){
  const n=game==='omok'?15:Number(game.slice(2)),full=width===390&&(game==='go19'||game==='omok');
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.routeWebSocket('**/*',w=>w.close());await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  try{
   await page.goto('http://127.0.0.1:'+server.address().port+'/board/index.html',{waitUntil:'load'});await page.locator('[data-game="'+(game==='omok'?'omok':'go')+'"]').click();if(game!=='omok')await page.locator('#board-size').selectOption(String(n));
   assert.equal(await page.locator('#board > button').count(),n*n);await page.locator('.board-wrap').focus();const nodes=[],indices=full?Array.from({length:n*n},(_,i)=>i):[0,Math.floor(n*n/2),n*n-1];
   for(const index of indices){if(full||index===0)await page.keyboard.press('Tab');else await page.locator('#board > button').nth(index).focus();const node=await page.evaluate(inspect);
    assert.equal(node.index,index);assert(node.focusVisible,'the indicator must be a real focus-visible state');assert(node.contrast>=3,game+' @ '+width+' focus contrast '+node.contrast);assert.equal(node.outlineStyle,'solid');assert(node.outlineWidth>=2,'focus ring is too thin');assert(node.outlineOffset+node.outlineWidth<=0,'an edge focus ring can be clipped');assert(node.width>=27.98&&node.height>=27.98,'the focus repair shrank a target');
    nodes.push({...node,row:Math.floor(index/n)+1,column:index%n+1});
   }
   assert.equal(await page.locator('#board .stone').count(),0,'focus navigation must not place stones');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(process.env.FW_FOCUS_SCREENSHOT_DIR&&full){await page.locator('#board > button').last().screenshot({path:path.join(process.env.FW_FOCUS_SCREENSHOT_DIR,game+'-last-focused.png')});await page.locator('#board > button').first().focus();await page.locator('#board > button').first().screenshot({path:path.join(process.env.FW_FOCUS_SCREENSHOT_DIR,game+'-first-focused.png')})}
   const axe=await new AxeBuilder({page}).options({iframes:false,rules:{'target-size':{enabled:true}}}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();assert.deepEqual(axe.violations,[]);assert.deepEqual(errors,[]);
   results.push({game,width,fullNativeTraversal:full,checkedTargets:nodes.length,nodes,violations:[],errors:[]});console.log('PASS '+game+' @ '+width+' · '+nodes.length+' focused targets, min ratio '+Math.min(...nodes.map(x=>x.contrast)).toFixed(3));
  }finally{await context.close();if(process.env.FW_FOCUS_REPORT)fs.writeFileSync(process.env.FW_FOCUS_REPORT,JSON.stringify(results,null,2))}
 }
 assert.equal(results.length,20);assert.equal(results.filter(r=>r.fullNativeTraversal).reduce((s,r)=>s+r.nodes.length,0),586);console.log('PASS 20 board layouts and axe checks; 586-point native Tab traversal and 640 focused-target measurements');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
