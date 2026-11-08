'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
function keyboard(simple=false){
 const nodes=new Map(),keys=[],scrolls=[];let document;
 class Node{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.classList={contains:()=>simple,toggle(){}};}
  append(...v){this.children.push(...v);}
  setAttribute(){}
  addEventListener(t,fn){this.listeners[t]=fn;}
  focus(){document.activeElement=this;}
  click(){this.clicked=(this.clicked||0)+1;}
  scrollIntoView(){this.scrolled=true;}
  getBoundingClientRect(){return {bottom:500};}
 }
 for(const id of ['projects','cards','search','fw-b-search','fw-b-grid','explore','fw-favorites-toggle'])nodes.set(id,new Node());
 const find=(n,id)=>n.id===id?n:n.children.map(c=>find(c,id)).find(Boolean);
 document={head:new Node(),body:new Node(),readyState:'complete',activeElement:new Node(),createElement:t=>new Node(t),getElementById:id=>nodes.get(id)||find(document.body,id)||null,querySelector:()=>nodes.get('explore'),addEventListener:(t,fn)=>{if(t==='keydown')keys.push(fn);}};
 const ctx={document,localStorage:{getItem:()=>null},window:{scrollY:100,scrollTo:o=>scrolls.push(o),dispatchEvent(){}},Event:class{}};
 const code=source('shared/formwheel-ui.js');vm.runInNewContext(code.slice(code.indexOf('/* Hub keyboard shortcuts')),ctx);
 return {nodes,document,key:keys[0],scrolls};
}
const event=(key,other={})=>({key,preventDefault(){this.defaultPrevented=true;},...other});
test('shortcut help lets Tab reach the semicolon selector, including Command+/ access',()=>{
 const h=keyboard();h.key(event('/',{metaKey:true}));const modal=h.document.getElementById('fw-shortcut-help');assert.equal(modal.hidden,false);
 const close=h.document.getElementById('fw-shortcut-close');close.focus();const tab=event('Tab');modal.listeners.keydown(tab);
 assert.equal(h.document.activeElement.tagName,'SELECT');assert.equal(tab.defaultPrevented,true);
});
test('compact search and arrows operate on visible compact controls and ignore composing input',()=>{
 const h=keyboard(true);h.key(event('/'));assert.equal(h.document.activeElement,h.nodes.get('fw-b-search'));assert.equal(h.nodes.get('explore').clicked,1);
 h.document.activeElement=h.document.body;h.key(event('ArrowDown'));assert.equal(h.scrolls[0].top,600);
 const before=h.scrolls.length;h.key(event('ArrowDown',{isComposing:true}));assert.equal(h.scrolls.length,before);
});
test('favorites ignore duplicates and unknown names and update when another tab changes storage',()=>{
 const text=source('assets/app.js'),start=text.indexOf('const favoriteStorageKey'),end=text.indexOf('const favoriteToggle',start);
 let saved='["Maze","Maze","Unknown","Tool"]',changed,updates=0;
 const ctx={projects:[{name:'Maze',category:'game'},{name:'Tool',category:'tool'}],localStorage:{getItem:()=>saved},window:{addEventListener:(_,fn)=>changed=fn},updateFavoriteControls:()=>updates++,render(){}};
 vm.createContext(ctx);vm.runInContext(text.slice(start,end)+text.slice(text.lastIndexOf("window.addEventListener('storage',event=>{if(event.key===favoriteStorageKey")),ctx);
 assert.equal(vm.runInContext('pinnedGames.join(",")',ctx),'Maze');
 saved='[]';changed({key:'formwheel-hub-pinned-games-v1'});assert.equal(vm.runInContext('pinnedGames.length',ctx),0);assert.equal(updates,1);
});
