/* SEREN feature services v0.2 — isolated opt-in APIs, no Firebase mutations. */
(function(g){
"use strict";
const core=g.FormwheelSeren;
if(!core)throw Error("Load seren-mega-pack.js first");
const db=core.store;
const MAX=30;
function id(v){if(typeof v!=="string"||!(/^[a-zA-Z0-9_./-]{1,160}$/).test(v))throw Error("Invalid project id");return v}
function list(key){const v=db.read(key,[]);return Array.isArray(v)?v:[]}
function recent(project){project=id(project);const next=[{project,at:new Date().toISOString()},...list("recent").filter(x=>x&&x.project!==project)].slice(0,MAX);return db.write("recent",next)}
function favorites(){return list("favorites").filter(x=>typeof x==="string")}
function toggleFavorite(project){project=id(project);const current=favorites();return db.write("favorites",current.includes(project)?current.filter(x=>x!==project):[...current,project].slice(0,MAX))}
function resume(project,route){project=id(project);if(typeof route!=="string"||route.length>500||!route.startsWith("/")||route.startsWith("//"))throw Error("Invalid route");return db.write("resume",{project,route,at:new Date().toISOString()})}
function best(game,score){game=id(game);if(typeof score!=="number"||!Number.isFinite(score)||score<0)throw Error("Invalid score");const all=db.read("bests",{});const next={...(all&&typeof all==="object"?all:{})};next[game]=Math.max(Number(next[game])||0,score);return db.write("bests",next)}
function changelog(entry){if(typeof entry!=="string"||!entry.trim())throw Error("Invalid entry");return db.write("changelog",[{text:entry.slice(0,300),at:new Date().toISOString()},...list("changelog")].slice(0,50))}
function diagnostics(){const testKey="storage-check";const previous=db.read(testKey,null);const ok=db.write(testKey,{at:Date.now()});const readBack=db.read(testKey,null);if(previous===null){try{localStorage.removeItem("fw:seren:v1:"+testKey)}catch(_){}}else db.write(testKey,previous);return {version:core.version,storageWritable:ok&&!!readBack,storageAvailable:typeof localStorage!=="undefined",recentCount:list("recent").length,favoriteCount:favorites().length,recordedErrors:core.diagnostics().length}}
function search(query,projects){const q=String(query||"").trim().toLocaleLowerCase();if(!q)return [];return (Array.isArray(projects)?projects:[]).filter(x=>x&&typeof x.name==="string"&&(x.name.toLocaleLowerCase().includes(q)||String(x.description||"").toLocaleLowerCase().includes(q))).slice(0,25)}
function exportData(){return JSON.stringify({schema:1,version:core.version,recent:list("recent"),favorites:favorites(),bests:db.read("bests",{}),settings:db.read("settings",{})},null,2)}
g.FormwheelSerenServices=Object.freeze({recent,toggleFavorite,favorites,resume,best,changelog,diagnostics,search,exportData,getRecent:()=>list("recent"),getResume:()=>db.read("resume",null),getBests:()=>db.read("bests",{}),getChangelog:()=>list("changelog")});
})(window);
