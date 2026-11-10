'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

test('verified operator reloads deployment status after signing back in during a request',async()=>{
 const source=fs.readFileSync(__dirname+'/../assets/github-deploy-status.js','utf8')
  .replace(/await import\('[^']+'\)/g,'deps');
 let authChanged;
 const requests=[];
 class Node {
  hidden=true;
  style={};
  children=[];
  append(...nodes){this.children.push(...nodes)}
  setAttribute(){}
  replaceChildren(){this.children=[]}
  addEventListener(){}
 }
 const host=new Node();
 const deps={
  getApps:()=>[{name:'[DEFAULT]'}],getAuth:()=>({}),
  onAuthStateChanged:(_,listener)=>authChanged=listener,
  getIdTokenResult:async user=>({claims:user.claims})
 };
 await vm.runInNewContext(source,{
  deps,console,document:{getElementById:()=>host,createElement:()=>new Node(),querySelector:()=>new Node()},
  fetch:()=>new Promise(resolve=>requests.push(resolve))
 });
 const operator={claims:{email:'not404spam@gmail.com',email_verified:true}};
 await authChanged({claims:{...operator.claims,email_verified:false}});
 assert.equal(host.hidden,true);
 await authChanged(operator);
 assert.equal(host.hidden,false);
 await authChanged(null);
 await authChanged(operator);
 assert.equal(requests.length,2);
 requests[0]({ok:true,json:async()=>[]});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(host.children[1].disabled,true);
 requests[1]({ok:true,json:async()=>[]});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(host.children[1].disabled,false);
});
