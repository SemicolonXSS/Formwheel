/* SEREN MEGA PACK 50 — non-destructive foundation.
 * No automatic balance changes, authentication changes or remote writes.
 */
(function(global){
"use strict";
const VERSION="0.1.0";
const PREFIX="fw:seren:v1:";
const FEATURES=[
"smart-resume","recent-projects","favorite-launch","project-updates","recommendations","home-widgets","quick-search","visit-timeline","accessibility","daily-pick",
"rapid-transactions","balance-diagnostics","theme-comparison","favorite-themes","random-theme","theme-intensity","phase-collections","purchase-search","daily-rapid-stats","duplicate-reward-audit",
"pvp-stats","pvp-rematch","pvp-practice","maze-records","reflex-chart","clicker-growth","personal-bests","resume-last-game","game-instructions","friend-challenge-code",
"achievement-progress","special-rewards","badge-presets","daily-challenges","weekly-challenges","reward-history","achievement-search","profile-summary","event-history","friend-comparison",
"save-status","save-retry","error-diagnostics","admin-bug-dashboard","visitor-chart-stability","login-diagnostics","mobile-ui-audit","deployment-version","settings-import-export","changelog"];
const store={
 read(key,fallback){try{const raw=localStorage.getItem(PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch(_){return fallback}},
 write(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch(_){return false}}
};
const events=[];
function record(type,detail){events.push({type,detail:String(detail||"").slice(0,240),at:new Date().toISOString()});if(events.length>100)events.shift()}
function safeSettingsExport(){return JSON.stringify({schema:1,version:VERSION,settings:store.read("settings",{})},null,2)}
function safeSettingsImport(json){const obj=JSON.parse(json);if(!obj||obj.schema!==1||!obj.settings||typeof obj.settings!=="object"||Array.isArray(obj.settings))throw Error("Invalid SEREN settings");if(JSON.stringify(obj).length>50000)throw Error("Settings too large");return store.write("settings",obj.settings)}
function rewardAudit(items){const seen=new Set(),duplicates=[];for(const item of items||[]){if(!item||typeof item.id!=="string")continue;if(seen.has(item.id))duplicates.push(item.id);else seen.add(item.id)}return duplicates}
global.FormwheelSeren=Object.freeze({version:VERSION,features:FEATURES.slice(),store,record,diagnostics:()=>events.slice(),safeSettingsExport,safeSettingsImport,rewardAudit});
})(window);
