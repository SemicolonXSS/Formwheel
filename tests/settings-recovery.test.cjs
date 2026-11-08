'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
function setup({blocked=false,quota=false,initial={}}={}){
 const data=new Map(Object.entries(initial)),events=new Map(),nodes=new Map(),redirects=[];let doc;
 class Node{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(k,v){this[k]=v;}};this.classes=new Set();this.classList={toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k)};this.checked=false;this.value='';this.textContent='';}
  append(...items){this.children.push(...items);}
  appendChild(item){this.append(item);}
  insertBefore(item){this.children.unshift(item);}
  replaceChildren(...items){this.children=items;}
  setAttribute(){}
  addEventListener(t,fn){this.listeners[t]=fn;}
  querySelector(){return new Node();}
  click(){this.listeners.click?.({});}
 }
 const element=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
 const find=(node,id)=>node.id===id?node:node.children.map(c=>find(c,id)).find(Boolean);
 const raw=id=>nodes.get(id)||find(doc.body,id)||null;
 doc={body:new Node('body'),head:new Node('head'),documentElement:new Node(),readyState:'complete',createElement:tag=>new Node(tag),createTextNode:text=>{const n=new Node('text');n.textContent=text;return n;},getElementById:element,querySelectorAll:()=>[],addEventListener(){}};
 const dispatch=e=>(events.get(e.type)||[]).forEach(fn=>fn(e));
 const ctx={console,document:doc,Date,URL,location:{href:'https://semicolonxss.github.io/Formwheel/?stay=1',origin:'https://semicolonxss.github.io',replace:url=>redirects.push(url)},Event:class{constructor(type){this.type=type;}},
  window:{addEventListener:(t,fn)=>events.set(t,[...(events.get(t)||[]),fn]),dispatchEvent:dispatch,FormwheelHubProjects:[{url:'https://semicolonxss.github.io/Formwheel/sudoku.html'}]},
  localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return data.get(k)||null;},setItem:(k,v)=>{if(blocked||quota)throw Error('quota');data.set(k,v);},removeItem:k=>{if(blocked||quota)throw Error('blocked');data.delete(k);}},
  sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>false,setTimeout:fn=>{fn();},clearTimeout(){}};
 vm.createContext(ctx);vm.runInContext(read('shared/settings-state.js'),ctx);
 return {ctx,data,nodes,doc,raw,dispatch,redirects,api:ctx.window.FormwheelSettings,run:code=>vm.runInContext(code,ctx)};
}
test('partial and malformed settings retain validated defaults without losing future fields',()=>{
 const h=setup({initial:{'fw.settings.v2':JSON.stringify({font:'nonsense',highContrast:'false',notifications:{achievement:false},futureSetting:7})}});
 const s=h.api.read();assert.equal(s.font,'normal');assert.equal(s.highContrast,false);assert.equal(s.notifications.achievement,false);assert.equal(s.notifications.reward,true);assert.equal(s.futureSetting,7);
});
test('a field save merges the latest other-tab values and individual notification switches',()=>{
 const h=setup();h.data.set('fw.settings.v2',JSON.stringify({font:'large',notifications:{achievement:false,futureNotice:true}}));
 h.api.write({highContrast:true});h.api.write({notifications:{reward:false}});
 const s=JSON.parse(h.data.get('fw.settings.v2'));assert.equal(s.font,'large');assert.equal(s.highContrast,true);assert.equal(s.notifications.achievement,false);assert.equal(s.notifications.reward,false);assert.equal(s.notifications.futureNotice,true);
});
test('blocked storage permits startup and failed saves do not pretend to succeed',()=>{
 const h=setup({blocked:true});assert.equal(h.api.read().font,'normal');assert.equal(h.api.write({font:'large'}).ok,false);
 assert.doesNotThrow(()=>h.run(read('assets/smart-return.js')));
});
test('storage changes and storage clearing apply the same presentation defaults',()=>{
 const h=setup();h.data.set('fw.settings.v2',JSON.stringify({font:'large',density:'compact',animation:'off'}));h.dispatch({type:'storage',key:'fw.settings.v2'});
 assert.equal(h.doc.documentElement.style.fontSize,'18px');assert(h.doc.body.classes.has('fw-v2-compact'));assert(h.doc.body.classes.has('fw-v2-reduced'));
 h.data.clear();h.dispatch({type:'storage',key:null});assert.equal(h.doc.documentElement.style.fontSize,'16px');assert(!h.doc.body.classes.has('fw-v2-compact'));
});
test('smart return recognizes catalog-hosted games, rejects foreign URLs and rolls back a failed toggle',()=>{
 const h=setup({quota:true});h.doc.getElementById=id=>id==='fw-settings-resume'?h.nodes.get(id):h.raw(id);h.nodes.set('fw-settings-resume',new (h.doc.body.constructor)());h.doc.body.append(h.nodes.get('fw-settings-resume'));
 h.run(read('assets/smart-return.js'));const api=h.ctx.window.FormwheelSmartReturn;
 assert.equal(api.canResume('https://semicolonxss.github.io/Formwheel/sudoku.html'),true);assert.equal(api.canResume('https://evil.example/Formwheel_Maze/'),false);assert.equal(api.canResume('javascript:alert(1)'),false);
 const toggle=h.raw('fw-resume-enabled');toggle.checked=true;assert.doesNotThrow(()=>toggle.listeners.change());assert.equal(toggle.checked,false);assert.match(h.raw('fw-resume-detail').textContent,/저장하지 못/);
});
test('local activity ignores malformed history instead of inventing play statistics',()=>{
 const h=setup({initial:{'fw:hub:home:v1':JSON.stringify({visits:{wheel:{count:4,last:100},maze:{count:2,last:200},bad:{count:'oops'},empty:{count:0}}})}});
 assert.deepEqual(JSON.parse(JSON.stringify(h.api.activity())),{projectsOpened:2,projectOpenCount:6,lastOpenAt:200});
});
for(const page of ['index.html','settings-2.html'])test(page+' settings controls follow another tab and preserve its changes',()=>{
 const h=setup();const code=[...read(page).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes("const KEY='fw.settings.v2'")&&s.includes('window.FormwheelSettings.read()'));
 assert(code);h.run(code);
 h.data.set('fw.settings.v2',JSON.stringify({font:'large'}));h.dispatch({type:'storage',key:'fw.settings.v2'});
 const prefix=page==='index.html'?'fw21-':'';
 const appearance=h.nodes.get(prefix+'appearance'),advanced=h.nodes.get(prefix+'advanced');
 assert.equal(appearance.children[3].children.at(-1).value,'large');
 const contrast=advanced.children[2].children.at(-1);contrast.checked=true;contrast.listeners.change();
 assert.equal(JSON.parse(h.data.get('fw.settings.v2')).font,'large');assert.equal(JSON.parse(h.data.get('fw.settings.v2')).highContrast,true);
});
test('achievement notifications honor the saved off switch',async()=>{
 const h=setup({initial:{'fw.settings.v2':'{"notifications":{"achievement":false}}'}});
 Object.assign(h.ctx,{auth:{},db:{},BADGES:[],onAuthStateChanged(){},ref:(_,p)=>p,onValue:()=>()=>{}});
 const code=read('assets/badge-notifications.js').replace(/^import .*;\n/gm,'').replace(/^const (config|app|auth)=.*;\n/gm,'');
 h.run(code+'\nwindow.testNotify=notify;');
 await h.ctx.window.testNotify({icon:'x',title:'test'});
 const toast=h.doc.body.children[0];assert(!toast.classes.has('show'));
});
test('FW12 syntax diagnostics parse and classify unmatched-parenthesis reports',()=>{
 const code=read('assets/formwheel-devtools.js');assert.doesNotThrow(()=>new vm.Script(code));
 const start=code.indexOf('function classify(message){'),end=code.indexOf('\nfunction record(',start);
 const classify=vm.runInNewContext('const denyPattern=/permission[_ -]?denied/i,sessionPattern=/liveHubSessions/;'+code.slice(start,end)+';classify');
 assert.equal(classify("SyntaxError: Unexpected keyword 'return'. Expected ')'"),'JavaScript 문법 오류');
 assert.equal(classify('missing )'),'JavaScript 문법 오류');
 assert.equal(classify('permission_denied /formwheelV2/liveHubSessions/x/y'),'세션 저장 권한 오류');
});
