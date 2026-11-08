'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');let count=0;
const origin='https://semicolonxss.github.io',prefix='/Formwheel/';
function check(code,label,module=false){
 const result=spawnSync(process.execPath,['--check',...(module?['--input-type=module']:[])],{input:code,encoding:'utf8'});
 assert.equal(result.status,0,label+'\n'+result.stderr);count++;
}
function checkLinks(html,file){
 // Only inspect markup: generated URLs inside script strings are not static links.
 const markup=html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi,'$1</script>');
 const base=new URL(prefix+path.relative(root,file).split(path.sep).join('/'),origin);
 for(const m of markup.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)){
  const href=m[2].replace(/&amp;/g,'&');
  if(!href||href.startsWith('#')||/^(?:data|blob|mailto|tel|javascript):/i.test(href))continue;
  const url=new URL(href,base);
  if(url.origin!==origin||!url.pathname.startsWith(prefix))continue;
  let local=path.resolve(root,decodeURIComponent(url.pathname.slice(prefix.length)));
  assert(local===root||local.startsWith(root+path.sep),file+' unsafe asset '+href);
  if(url.pathname.endsWith('/'))local=path.join(local,'index.html');
  assert(fs.existsSync(local),path.relative(root,file)+' missing '+href);
 }
}
function walk(dir){
 for(const name of fs.readdirSync(dir)){
  if(['node_modules','.git','tests','scripts','firebase-security','backups'].includes(name))continue;
  const file=path.join(dir,name);
  if(fs.statSync(file).isDirectory())walk(file);
  else if(/\.(?:js|mjs|cjs)$/.test(name))check(fs.readFileSync(file,'utf8'),file,!name.endsWith('.cjs'));
  else if(/\.html$/.test(name)){
   const html=fs.readFileSync(file,'utf8');
   for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=m[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    check(m[2],file,type==='module');
   }
   checkLinks(html,file);
  }
 }
}
if(require.main===module){walk(root);console.log('PASS '+count+' JavaScript blocks/files; relative and same-origin local links');}
module.exports={checkLinks};
