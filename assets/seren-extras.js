/* SEREN additional feature modules — local-only, opt-in. */
(function(g){
"use strict";
const core=g.FormwheelSeren,services=g.FormwheelSerenServices;
if(!core||!services)throw Error("SEREN core and services required");
const store=core.store;
function entries(key){const a=store.read(key,[]);return Array.isArray(a)?a:[]}
function add(key,item,max=100){return store.write(key,[item,...entries(key)].slice(0,max))}
function safeId(value){if(typeof value!=="string"||!/^[a-zA-Z0-9_.-]{1,100}$/.test(value))throw Error("Invalid identifier");return value}
function logVisit(project){return add("visits",{project:safeId(project),at:new Date().toISOString()},200)}
function timeline(){return entries("visits")}
function setWidget(name,enabled){name=safeId(name);const widgets=store.read("widgets",{});return store.write("widgets",{...(widgets&&typeof widgets==="object"?widgets:{}),[name]:Boolean(enabled)})}
function widgets(){return store.read("widgets",{})}
function setAccessibility(options){if(!options||typeof options!=="object")throw Error("Invalid options");const next={reducedMotion:Boolean(options.reducedMotion),largeText:Boolean(options.largeText),highContrast:Boolean(options.highContrast)};return store.write("accessibility",next)}
function accessibility(){return store.read("accessibility",{reducedMotion:false,largeText:false,highContrast:false})}
function dailyPick(projects,date=new Date()){const valid=(Array.isArray(projects)?projects:[]).filter(p=>p&&typeof p.id==="string");if(!valid.length)return null;const day=date.toISOString().slice(0,10);let hash=0;for(const c of day)hash=(hash*31+c.charCodeAt(0))>>>0;return valid[hash%valid.length]}
function addGameResult(game,score){game=safeId(game);if(!Number.isFinite(score)||score<0)throw Error("Invalid score");services.best(game,score);return add("game-results",{game,score,at:new Date().toISOString()},200)}
function gameResults(game){return entries("game-results").filter(x=>!game||x.game===game)}
function logEvent(eventId){return add("events",{event:safeId(eventId),at:new Date().toISOString()},100)}
function eventHistory(){return entries("events")}
function addAchievement(id,progress,total){id=safeId(id);if(!Number.isFinite(progress)||!Number.isFinite(total)||total<=0||progress<0)throw Error("Invalid progress");const old=store.read("achievements",{});return store.write("achievements",{...(old&&typeof old==="object"?old:{}),[id]:{progress:Math.min(progress,total),total}})}
function achievements(){return store.read("achievements",{})}
function logReward(rewardId,receiptId){rewardId=safeId(rewardId);receiptId=safeId(receiptId);const current=entries("reward-receipts");if(current.some(x=>x.receiptId===receiptId))return {recorded:false,duplicate:true};const saved=add("reward-receipts",{rewardId,receiptId,at:new Date().toISOString()},500);return {recorded:saved,duplicate:false}}
function rewardHistory(){return entries("reward-receipts")}
function validateRapidSnapshot(snapshot){if(!snapshot||typeof snapshot!=="object")return {valid:false,reason:"missing snapshot"};const balance=snapshot.balance;if(typeof balance!=="string"||!/^[0-9]+$/.test(balance))return {valid:false,reason:"balance must be a nonnegative integer string"};return {valid:true,balance,readOnly:true}}
function deployment(){return {serenVersion:core.version,mode:"isolated-development",firebaseWrites:false}}
g.FormwheelSerenExtras=Object.freeze({logVisit,timeline,setWidget,widgets,setAccessibility,accessibility,dailyPick,addGameResult,gameResults,logEvent,eventHistory,addAchievement,achievements,logReward,rewardHistory,validateRapidSnapshot,deployment});
})(window);
