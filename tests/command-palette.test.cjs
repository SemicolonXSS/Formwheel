'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function boot(simple=false){
 const nodes=new Map(),keys=[],navigations=[];let doc;
 class Node{
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.style={overflow:''};this.attrs={};this.isConnected=true;this.value='';this.hidden=false;this.classList={contains:()=>simple};}
  append(...children){this.children.push(...children);}
  replaceChildren(){this.children=[];}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(key,value){this.attrs[key]=value;}
  removeAttribute(key){delete this.attrs[key];}
  focus(){doc.activeElement=this;}
  scrollIntoView(){}
  click(){this.clicked=(this.clicked||0)+1;this.listeners.click?.({});}
  closest(){return nodes.get('toolbar');}
  querySelector(className){return this.parts?.[className]||null;}
  querySelectorAll(selector){return this.children.filter(n=>selector==='button'?n.tag==='button':n.className==='fw-command-result');}
  set innerHTML(value){this.parts={'.fw-command-search':new Node('input'),'.fw-command-results':new Node(),'.fw-command-close':new Node('button')};}
 }
 for(const id of ['search','projects','fw-beta-switch','fw-b-search','toolbar','explore'])nodes.set(id,new Node());
 doc={readyState:'complete',head:new Node(),body:new Node(),activeElement:nodes.get('search'),getElementById:id=>nodes.get(id)||null,createElement:tag=>new Node(tag),querySelector:()=>nodes.get('explore'),addEventListener:(type,fn)=>{if(type==='keydown')keys.push(fn);}};
 const ctx={document:doc,projects:[{name:'Maze',url:'https://semicolonxss.github.io/Formwheel_Maze/',description:'미로'}],window:{location:{assign:url=>navigations.push(url)}}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/hub-command-palette.js','utf8'),ctx);
 const open=nodes.get('fw-beta-switch').children[0],backdrop=doc.body.children[0],field=backdrop.querySelector('.fw-command-search'),results=backdrop.querySelector('.fw-command-results');
 return {doc,nodes,keys,navigations,open,backdrop,field,results};
}
const key=(name,props={})=>({key:name,preventDefault(){this.prevented=true;},stopPropagation(){},...props});
test('IME confirmation does not execute a command, while a normal Enter does',()=>{
 const h=boot();h.open.click();h.field.value='Maze';h.field.listeners.input();
 h.field.listeners.keydown(key('Enter',{isComposing:true}));assert.equal(h.navigations.length,0);assert.equal(h.backdrop.hidden,false);
 h.field.listeners.keydown(key('Enter'));assert.equal(h.navigations.length,1);assert.equal(h.backdrop.hidden,true);
});
test('keyboard focus stays inside the launcher and closing restores focus and scrolling',()=>{
 const h=boot();h.open.click();assert.equal(h.doc.body.style.overflow,'hidden');
 h.results.children.at(-1).focus();h.keys[0](key('Tab'));assert.equal(h.doc.activeElement,h.backdrop.querySelector('.fw-command-close'));
 h.keys[0](key('Escape'));assert.equal(h.doc.activeElement,h.nodes.get('search'));assert.equal(h.doc.body.style.overflow,'');
});
test('compact-mode search commands focus the visible compact search input',()=>{
 const h=boot(true);h.open.click();h.field.listeners.keydown(key('Enter'));
 assert.equal(h.nodes.get('explore').clicked,1);assert.equal(h.doc.activeElement,h.nodes.get('fw-b-search'));
});
