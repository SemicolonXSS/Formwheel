"use strict";
/* Formwheel Board: local 2-player classical board games, no Firebase writes. */
(function(){
const $=id=>document.getElementById(id);
const tabs=[...document.querySelectorAll("[data-game]")];
const title=$("game-title"),turnText=$("turn"),scoreEl=$("score"),boardEl=$("board"),tip=$("tip");
const sizeWrap=$("size-wrap"),sizeInput=$("board-size"),passBtn=$("pass"),undoBtn=$("undo"),claimBtn=$("claim");
const modal=$("promotion"),promoOptions=$("promotion-options");
const descriptions={
 chess:{title:"♟ 체스",note:"체스 표준 규칙의 왕 안전, 캐슬링, 앙파상, 폰 승격, 체크메이트와 무승부 판정을 적용합니다. 시간제한·합의 무승부는 이 버전에 없습니다.",
 rules:[
 "백이 먼저 둡니다. 자신의 차례에 자기 기물 하나를 합법적인 칸으로 이동합니다. 상대 기물이 있는 칸으로 이동하면 잡습니다.",
 "킹은 주변 한 칸, 퀸은 가로·세로·대각선, 룩은 가로·세로, 비숍은 대각선, 나이트는 ㄱ자(2칸+1칸)로 움직입니다. 나이트는 다른 말을 뛰어넘습니다.",
 "폰은 앞으로 한 칸(첫 이동은 두 칸까지) 움직이고, 대각선 앞 한 칸의 적을 잡습니다. 끝 줄에 닿으면 퀸·룩·비숍·나이트 중 하나로 승격합니다.",
 "조건이 맞으면 킹과 룩을 함께 움직이는 캐슬링이 가능합니다. 적 폰의 첫 두 칸 전진 직후에는 앙파상으로 잡을 수 있습니다.",
 "자기 킹을 공격받는 상태로 두는 수는 금지입니다. 공격받은 상태가 체크, 체크를 벗어날 수 없으면 체크메이트로 승패가 결정됩니다.",
 "체크가 아니면서 합법적인 수가 하나도 없다면 스테일메이트 무승부입니다. 같은 위치 3번 반복/50수 규칙은 무승부를 주장할 수 있고, 5번 반복/75수 규칙과 기물 부족은 자동 판정합니다."
 ]},
 go:{title:"⚫ 바둑",note:"이 버전은 흑 선공, 덤 6.5집, 중국식 면적 계산의 간이 자동 계가입니다. 동형반복(슈퍼코)을 막으며 자살수는 금지합니다. 사석을 따로 합의·제거하는 기능이 없어 공식 대국 점수와 다를 수 있습니다.",
 rules:[
 "검은 돌이 먼저 둡니다. 차례마다 바둑판 선의 교차점 한 곳에 돌 하나를 놓습니다. 놓은 돌은 이동하지 않습니다.",
 "돌 또는 연결된 돌 무리는 상하좌우에 비어 있는 교차점(활로)이 있어야 살아 있습니다. 대각선은 연결로 세지 않습니다.",
 "상대 돌 무리의 마지막 활로를 없애면 그 무리의 돌을 모두 잡아 판에서 제거합니다. 잡아내지 못하면서 자기 돌의 활로를 없애는 자살수는 금지됩니다.",
 "이전에 나온 돌 배치와 완전히 같은 상태를 다시 만드는 수는 둘 수 없습니다(동형반복 금지).",
 "둘 곳이 없거나 쉬고 싶으면 패스할 수 있습니다. 두 플레이어가 연속해서 패스하면 대국을 종료합니다.",
 "간이 중국식 점수는 자기 돌 수 + 자기 돌만 둘러싼 빈 교차점 수입니다. 백에 덤 6.5집을 더해 높은 쪽이 승리합니다. 대국 종료 전에는 상대 사석을 정리한 상태여야 정확한 계산에 가깝습니다."
 ]},
 omok:{title:"⚪ 오목",note:"이 버전은 자유룰(프리스타일 오목)입니다. 흑의 3·3, 4·4 등 금수가 없고 6목 이상도 승리로 인정합니다. 렌주 대회 규칙과는 다릅니다.",
 rules:[
 "흑이 먼저 두고 백과 번갈아 빈 교차점에 돌을 하나씩 놓습니다.",
 "놓은 돌은 움직이거나 제거하지 않습니다.",
 "가로, 세로, 대각선 어느 방향으로든 자기 돌을 연속해서 다섯 개 이상 놓으면 즉시 이깁니다.",
 "이 게임은 흑의 금수를 적용하지 않는 자유룰입니다. 육목 이상도 승리합니다.",
 "판이 가득 차도록 승자가 없으면 무승부입니다."
 ]},
 connect4:{title:"🔵 커넥트 포",note:"7열 6행 판에 말을 아래부터 놓는 4목 게임입니다.",rules:["빨강과 노랑이 번갈아 열을 누르면 말이 가장 아래 빈 칸에 놓입니다.","가로·세로·대각선으로 4개를 먼저 연결하면 승리합니다.","모든 칸이 차면 무승부입니다."]},
 territory:{title:"🏰 영토 쟁탈전",note:"Formwheel 창작 전략 게임. 5×5 판에서 서로 자신의 요새로부터 영토를 넓힙니다.",rules:["파랑과 주황은 대각선 반대편 요새에서 시작합니다.","자신의 땅에 상하좌우로 붙은 빈 칸을 하나씩 점령합니다.","둘 수 없는 플레이어는 차례를 건너뜁니다.","양쪽 모두 확장할 수 없으면 더 많은 땅을 점령한 쪽이 승리합니다."]},
 checkers:{title:"🔴 체커",note:"미국식 체커: 일반 말은 전진, 킹은 양방향 이동합니다. 잡을 수 있으면 반드시 잡아야 하며 연속 잡기도 적용됩니다.",
 rules:["빨강이 먼저 둡니다. 어두운 칸의 말을 대각선 앞으로 한 칸 옮깁니다.","상대 말을 뛰어넘어 잡을 수 있으면 반드시 잡아야 합니다.","잡은 뒤 다시 잡을 수 있으면 같은 말로 연속 잡아야 합니다.","상대 끝줄에 도착하면 킹으로 승격해 앞뒤로 이동합니다. 승격한 턴에는 연속 잡기가 종료됩니다.","상대의 말이 없어지거나 상대가 둘 수 없으면 승리합니다."]},
 ttt:{title:"❎ 틱택토",note:"3×3 격자에서 가로·세로·대각선 3개를 먼저 연결하면 이깁니다.",
 rules:["X가 먼저 빈 칸에 표시합니다.","X와 O가 번갈아 빈 칸 하나를 선택합니다.","가로·세로·대각선으로 3개를 잇는 쪽이 승리합니다.","9칸이 가득 찰 때까지 아무도 잇지 못하면 무승부입니다."]},
 othello:{title:"◉ 오델로",note:"8×8 표준 오델로의 뒤집기·강제 패스·최종 돌 수 판정을 적용합니다. 모서리에서 시작하지 않으며 흑이 선공합니다.",
 rules:[
 "8×8 판 중앙 네 칸에 흑 2개와 백 2개를 대각선으로 놓고, 흑이 먼저 둡니다.",
 "가로, 세로, 대각선으로 상대 돌 한 개 이상을 사이에 두고 자기 돌로 끝을 막는 빈 칸에만 둘 수 있습니다.",
 "수를 두면 새 돌과 원래 자기 돌 사이에 일직선으로 끼인 상대 돌을 모두 뒤집습니다. 여러 방향에서 동시에 뒤집을 수 있습니다.",
 "합법적으로 둘 자리가 없는 플레이어는 자동으로 패스합니다. 둘 곳이 있는데 임의로 패스할 수는 없습니다.",
 "양쪽 모두 둘 수 없거나 판이 꽉 차면 종료합니다. 내 색 돌이 더 많은 쪽이 이깁니다."
 ]}
};
let game="chess",state=null,history=[],selected=-1,promotionMoves=null,notice="",replaying=false;
let botEnabled=false,botActing=false,botTimer=null,botVersion=0;
const botDifficulty=$("bot-difficulty"),botToggle=$("bot-toggle"),botStatus=$("bot-status");
function botCancel(){clearTimeout(botTimer);botTimer=null;botVersion++;}
function botModeOff(){
  botEnabled=false;botCancel();
  botToggle.textContent="🤖 봇 대전 시작";botToggle.setAttribute("aria-pressed","false");
  botStatus.textContent="현재: 로컬 2인 대전";
}
function botBlocked(){return botEnabled&&!botActing&&!replaying&&state?.t===-1;}
function botSchedule(){
  botCancel();
  if(!botEnabled||replaying||online()?.isOnline()||!state||state.t!==-1||state.done||state.draw||(game==="chess"&&chessStatus().done))return;
  const version=botVersion;
  botStatus.textContent="🤖 봇이 생각 중…";
  botTimer=setTimeout(()=>{
    if(version!==botVersion||!botEnabled||online()?.isOnline()||state.t!==-1)return;
    botActing=true;
    try{botPlay()}catch(e){console.error("Board bot error",e);botStatus.textContent="봇 오류 · 새 게임으로 다시 시도해 주세요.";}
    finally{botActing=false;}
  },350);
}
function botChoice(items,score){
  if(!items.length)return null;
  const ranked=items.map(x=>({x,v:score(x)+Math.random()*0.25})).sort((a,b)=>b.v-a.v);
  const d=botDifficulty.value;
  if(d==="easy")return ranked[Math.floor(Math.random()*ranked.length)].x;
  if(d==="normal")return ranked[Math.floor(Math.random()*Math.min(3,ranked.length))].x;
  return ranked[0].x;
}
function lineStrength(b,i,color,n){
  const r=Math.floor(i/n),c=i%n;
  let best=0;
  for(const [dr,dc] of [[1,0],[0,1],[1,1],[1,-1]]){
    let count=1,open=0;
    for(const sign of [-1,1]){
      let rr=r+dr*sign,cc=c+dc*sign;
      while(inBounds(rr,cc,n)&&b[rr*n+cc]===color){count++;rr+=dr*sign;cc+=dc*sign;}
      if(inBounds(rr,cc,n)&&b[rr*n+cc]===0)open++;
    }
    best=Math.max(best,count>=5?100000:count*count*(open+1));
  }
  return best;
}
function botPlay(){
  if(!state||state.done||!botEnabled||online()?.isOnline())return;
  if(game==="omok"){
    const b=state.board,empty=b.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
    const nearby=empty.filter(i=>{const r=Math.floor(i/15),c=i%15;for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){const rr=r+dr,cc=c+dc;if(inBounds(rr,cc,15)&&b[rr*15+cc]!==0)return true;}return false;});
    const options=nearby.length?nearby:[112];
    const move=botChoice(options,i=>{
      const attack=lineStrength(b,i,-1,15),defend=lineStrength(b,i,1,15);
      return (attack>=100000?1e7:0)+(defend>=100000?1e6:0)+attack*1.25+defend+ (7-Math.hypot(Math.floor(i/15)-7,i%15-7))*0.2;
    });
    if(move!==null)omokMove(move);
  }else if(game==="othello"){
    const legal=othelloLegal(-1),corners=new Set([0,7,56,63]);
    const move=botChoice(legal,i=>{
      const flip=othelloFlips(state.board,i,-1).length;
      const r=Math.floor(i/8),c=i%8;
      const edge=r===0||r===7||c===0||c===7;
      const tmp=state.board.slice();tmp[i]=-1;othelloFlips(state.board,i,-1).forEach(q=>tmp[q]=-1);
      return (corners.has(i)?1000:0)+(edge?20:0)+flip*2;
    });
    if(move!==null)othelloMove(move);
  }else if(game==="chess"){
    const legal=chessLegal(state);
    const val={p:1,n:3,b:3.2,r:5,q:9,k:0};
    const move=botChoice(legal,m=>{
      const target=state.b[m[1]],piece=state.b[m[0]];
      const next=applyChess(state,m);
      const check=inCheck(next,1);
      const replies=chessLegal(next);
      const wins=check&&!replies.length;
      const center=3.5-Math.abs((m[1]&7)-3.5)+3.5-Math.abs((m[1]>>4)-3.5);
      return (wins?100000:0)+(target!=="."?(val[target.toLowerCase()]||0)*12:0)+(m[2]?70:0)+(check?4:0)+center*.4+(m[3]==="castle"?8:0)-(attacked(next,m[1],1)?(val[piece.toLowerCase()]||0)*5:0);
    });
    if(move)chessMove(move);
  }else if(game==="connect4"){
    const moves=c4Legal(state.board);
    const move=botChoice(moves,c=>{
      const pos=c4Target(state.board,c),b=state.board.slice();b[pos]=-1;
      if(c4Win(b,pos,-1))return 10000;
      b[pos]=1;if(c4Win(b,pos,1))return 1000;
      return 5-Math.abs(c-3);
    });
    if(move!==null)c4Move(move);
  }else if(game==="territory"){
    const moves=territoryLegal(state.board,-1);
    const move=botChoice(moves,i=>territoryNeighbors(i).filter(q=>state.board[q]===1).length*3+2-Math.abs(Math.floor(i/5)-2));
    if(move!==null)territoryMove(move);
  }else if(game==="checkers"){
    const opts=checkerLegal(state),choice=botChoice(opts,m=>{
      const b=state.board,rr=Math.floor(m.to/8);
      return (m.capture>=0?50:0)+(Math.abs(b[m.from])===1&&(rr===7)?35:0)+(3.5-Math.abs(m.to%8-3.5))*2;
    });
    if(choice)checkerMove(choice);
  }else if(game==="ttt"){
    const empties=state.board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
    const wins=i=>{const b=state.board.slice();b[i]=-1;return tttWinner(b)===-1;};
    const blocks=i=>{const b=state.board.slice();b[i]=1;return tttWinner(b)===1;};
    const move=botChoice(empties,i=>(wins(i)?1000:0)+(blocks(i)?100:0)+(i===4?12:0)+([0,2,6,8].includes(i)?4:0));
    if(move!==null)tttMove(move);
  }else if(game==="go"){
    const n=state.n,b=state.board;
    const candidates=[];
    for(let i=0;i<b.length;i++){
      if(b[i])continue;
      const r=Math.floor(i/n),c=i%n;
      let local=0;
      for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(inBounds(rr,cc,n)&&b[rr*n+cc])local++;}
      const snapshot=history.length,old=state,oldNotice=notice;
      // Evaluate legal moves without changing the live board.
      const copy=b.slice();copy[i]=-1;let captures=0;
      const seen=new Set();
      for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
        const rr=r+dr,cc=c+dc;if(!inBounds(rr,cc,n))continue;
        const at=rr*n+cc;if(copy[at]!==1||seen.has(at))continue;
        const group=makeGoGroup(copy,n,at);group.stones.forEach(q=>seen.add(q));
        if(group.liberties===0){captures+=group.stones.length;group.stones.forEach(q=>copy[q]=0);}
      }
      if(makeGoGroup(copy,n,i).liberties===0)continue;
      if(history.some(x=>x.board&&x.n===n&&x.board.join(",")===copy.join(","))||b.join(",")===copy.join(","))continue;
      candidates.push({i,score:captures*12+local*2+(n/2-Math.hypot(r-(n-1)/2,c-(n-1)/2))*.3+Math.random()});
    }
    const chosen=botChoice(candidates,x=>x.score);
    if(chosen)goMove(chosen.i);else goPass();
  }
  if(botEnabled&&!state.done)botStatus.textContent="🤖 봇 대전 중 · "+botDifficulty.selectedOptions[0].textContent;
}
botToggle.addEventListener("click",()=>{
  if(online()?.isOnline()){botStatus.textContent="온라인 방에서는 봇을 사용할 수 없어요.";return;}
  if(botEnabled){botModeOff();render();return;}
  botEnabled=true;botToggle.textContent="✕ 봇 대전 종료";botToggle.setAttribute("aria-pressed","true");
  reset(game);
  botStatus.textContent="봇과 대전 시작! 당신이 선공이에요.";
});

const online=()=>window.FormwheelBoardOnline;
const requestOnline=action=>{
 if(replaying||!online()?.isOnline())return false;
 online().submit(action);
 return true;
};
const onlineBlocked=()=>botBlocked()||(!replaying&&online()?.isOnline()&&!online().canMove());
const clone=o=>JSON.parse(JSON.stringify(o));
const dirs8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const inBounds=(r,c,n)=>r>=0&&c>=0&&r<n&&c<n;
function initial(type) {
 if(type==="go")return {board:Array(Number(sizeInput.value)**2).fill(0),n:Number(sizeInput.value),t:1,passes:0,captures:{black:0,white:0},done:false,last:-1};
 if(type==="connect4")return {board:Array(42).fill(0),n:7,t:1,done:false,winner:0,last:-1};
 if(type==="territory"){const b=Array(25).fill(0);b[0]=1;b[24]=-1;return {board:b,n:5,t:1,done:false,winner:0,last:-1};}
 if(type==="checkers"){const b=Array(64).fill(0);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===1){if(r<3)b[r*8+c]=-1;if(r>4)b[r*8+c]=1;}return {board:b,n:8,t:1,done:false,winner:0,last:-1,forced:-1};}
 if(type==="ttt")return {board:Array(9).fill(0),n:3,t:1,done:false,winner:0,last:-1};
 if(type==="omok")return {board:Array(225).fill(0),n:15,t:1,done:false,winner:0,last:-1};
 if(type==="othello"){const b=Array(64).fill(0);b[3*8+3]=-1;b[4*8+4]=-1;b[3*8+4]=1;b[4*8+3]=1;return {board:b,n:8,t:1,done:false,last:-1};}
 return chessStart();
}
function reset(type){
 botCancel();
 game=type;state=initial(type);history=[];selected=-1;promotionMoves=null;notice="";
 modal.hidden=true;
 tabs.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.game===game)));
 title.textContent=descriptions[game].title;
 $("rule-title").textContent=descriptions[game].title+" 규칙";
 const list=$("rule-list");list.replaceChildren();
 descriptions[game].rules.forEach(s=>{const li=document.createElement("li");li.textContent=s;list.append(li);});
 $("rule-note").textContent=descriptions[game].note;
 sizeWrap.hidden=game!=="go";passBtn.hidden=game!=="go";
 render();
}
function save(){history.push(clone(state));notice="";}
function marker(val){return val===1?"흑":"백";}
function pushScore(parts){scoreEl.replaceChildren();parts.forEach(s=>{const span=document.createElement("span");span.textContent=s;scoreEl.append(span);});}
function render(){
 if(replaying)return;
 if(botEnabled&&online()?.isOnline())botModeOff();
 botSchedule();
 undoBtn.disabled=history.length===0||!!online()?.isOnline();
 passBtn.disabled=game!=="go"||state.done||!!onlineBlocked();
 claimBtn.hidden=true;
 boardEl.className=game==="go"?"go-board":game==="omok"?"omok-board":"";
 if(game==="chess"){renderChess();return;}
 if(game==="go"){renderGo();return;}
 if(game==="omok"){renderOmok();return;}
 if(game==="checkers"){renderCheckers();return;}
 if(game==="connect4"){renderConnect4();return;}
 if(game==="territory"){renderTerritory();return;}
 if(game==="ttt"){renderTTT();return;}
 renderOthello();
}
function appendGrid(n,cell){
 boardEl.style.gridTemplateColumns="repeat("+n+",minmax(0,1fr))";
 boardEl.style.gridTemplateRows="repeat("+n+",minmax(0,1fr))";
 boardEl.replaceChildren();
 const frag=document.createDocumentFragment();
 for(let i=0;i<n*n;i++)frag.append(cell(i));
 boardEl.append(frag);
}
function node(tag,cl,txt){const el=document.createElement(tag);if(cl)el.className=cl;if(txt!==undefined)el.textContent=txt;return el;}
function piece(nodeEl,val,klass="disk"){
 if(!val)return;nodeEl.append(node("span",klass+" "+(val===1?"black":"white")));
}
function makeGoGroup(b,n,point) {
 const color=b[point],stack=[point],seen=new Set([point]),libs=new Set();
 while(stack.length){
  const p=stack.pop(),r=Math.floor(p/n),c=p%n;
  for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
   const rr=r+dr,cc=c+dc;if(!inBounds(rr,cc,n))continue;
   const idx=rr*n+cc;
   if(b[idx]===0)libs.add(idx);
   else if(b[idx]===color&&!seen.has(idx)){seen.add(idx);stack.push(idx);}
  }
 }
 return {stones:[...seen],liberties:libs.size};
}
function goMove(at){
 if(botBlocked()||state.done||!Number.isInteger(at)||at<0||at>=state.board.length||state.board[at])return;
 const n=state.n,b=state.board.slice(),who=state.t;
 b[at]=who;
 let captured=0,scanned=new Set();
 const r=Math.floor(at/n),c=at%n;
 for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
  const rr=r+dr,cc=c+dc;if(!inBounds(rr,cc,n))continue;
  const p=rr*n+cc;if(b[p]!==-who||scanned.has(p))continue;
  const g=makeGoGroup(b,n,p);g.stones.forEach(v=>scanned.add(v));
  if(g.liberties===0){captured+=g.stones.length;g.stones.forEach(v=>b[v]=0);}
 }
 if(makeGoGroup(b,n,at).liberties===0){tip.textContent="자살수는 둘 수 없어요.";return;}
 if(history.some(h=>h.board&&h.n===n&&h.board.join(",")===b.join(",")) || state.board.join(",")===b.join(",")){
   tip.textContent="동형반복 금지: 이전과 같은 돌 배치로 돌아갈 수 없어요.";return;
 }
 if(requestOnline({kind:"place",index:at}))return;
 save();state.board=b;state.t=-who;state.passes=0;state.last=at;
 state.captures[who===1?"black":"white"]+=captured;
 if(captured)notice=marker(who)+"이 "+captured+"개 돌을 잡았어요.";
 render();
}
function goArea(){
 const {board:b,n}=state;let black=b.filter(v=>v===1).length,white=b.filter(v=>v===-1).length,neutral=0;
 const seen=new Set();
 for(let start=0;start<b.length;start++){
  if(b[start]!==0||seen.has(start))continue;
  const region=[start],touch=new Set();seen.add(start);
  for(let k=0;k<region.length;k++){
   const at=region[k],r=Math.floor(at/n),c=at%n;
   for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const rr=r+dr,cc=c+dc;if(!inBounds(rr,cc,n))continue;
    const q=rr*n+cc;
    if(b[q]===0&&!seen.has(q)){seen.add(q);region.push(q);}
    else if(b[q])touch.add(b[q]);
   }
  }
  if(touch.size===1){if(touch.has(1))black+=region.length;else white+=region.length;}
  else neutral+=region.length;
 }
 return {black,white:white+6.5,neutral};
}
function goPass(){
 if(botBlocked()||game!=="go"||state.done)return;
 if(requestOnline({kind:"pass"}))return;
 save();state.passes++;state.t=-state.t;state.last=-1;
 if(state.passes===2){state.done=true;notice="양쪽이 연속 패스하여 계가했어요. 사석 판정은 포함되지 않습니다.";}
 else notice="패스했어요. 다음 차례로 넘어갑니다.";
 render();
}
function renderGo(){
 const a=state.done?goArea():null;
 turnText.textContent=a?(a.black>a.white?"흑 승리":a.black<a.white?"백 승리":"무승부")+" · 흑 "+a.black+" / 백 "+a.white+" (덤 6.5 포함)":marker(state.t)+" 차례";
 const {n,board:b}=state;
 pushScore(["흑 잡은 돌 "+state.captures.black,"백 잡은 돌 "+state.captures.white,"연속 패스 "+state.passes+"/2",state.done?"간이 계가 완료":n+"×"+n+" 바둑판"]);
 tip.textContent=notice||"빈 교차점을 눌러 착수하세요. 흑이 먼저 두며, 두 번 연속 패스하면 계가합니다.";
 const stars=n===9?[2,4,6]:n===13?[3,6,9]:[3,9,15];
 appendGrid(n,i=>{
  const r=Math.floor(i/n),c=i%n;
  const cl=["go-cell",r===0?"top-edge":"",r===n-1?"bottom-edge":"",c===0?"left-edge":"",c===n-1?"right-edge":"",state.last===i?"last-move":""].filter(Boolean).join(" ");
  const btn=node("button",cl);btn.type="button";
  btn.setAttribute("aria-label",(r+1)+"행 "+(c+1)+"열 "+(b[i]===0?"빈 점":marker(b[i])+"돌"));
  if(stars.includes(r)&&stars.includes(c))btn.append(node("i","star"));
  if(b[i])piece(btn,b[i],"stone");
  btn.disabled=state.done||b[i]!==0||!!onlineBlocked();
  btn.addEventListener("click",()=>goMove(i));return btn;
 });
}
function win5(b,i,color,n){
 const r=Math.floor(i/n),c=i%n;
 for(const [dr,dc] of [[1,0],[0,1],[1,1],[1,-1]]){
  let count=1;
  for(const sign of [-1,1]){
   let rr=r+dr*sign,cc=c+dc*sign;
   while(inBounds(rr,cc,n)&&b[rr*n+cc]===color){count++;rr+=dr*sign;cc+=dc*sign;}
  }
  if(count>=5)return true;
 }
 return false;
}
function omokMove(i){
 if(botBlocked()||state.done||!Number.isInteger(i)||i<0||i>=state.board.length||state.board[i])return;
 if(requestOnline({kind:"place",index:i}))return;
 save();state.board[i]=state.t;state.last=i;
 if(win5(state.board,i,state.t,15)){state.winner=state.t;state.done=true;}
 else if(state.board.every(Boolean)){state.done=true;}
 else state.t=-state.t;
 render();
}
function renderOmok(){
 turnText.textContent=state.done?(state.winner?marker(state.winner)+" 승리!":"무승부 · 판이 가득 찼어요."):marker(state.t)+" 차례";
 pushScore(["15×15 자유룰","흑 선공","5개 이상 연속이면 승리"]);
 tip.textContent="바둑판 선의 교차점을 눌러 돌을 놓으세요. 가로·세로·대각선 5개 이상을 연결하면 승리합니다.";
 appendGrid(15,i=>{
  const r=Math.floor(i/15),c=i%15;
  const cl=["omok-cell",r===0?"top-edge":"",r===14?"bottom-edge":"",c===0?"left-edge":"",c===14?"right-edge":"",state.last===i?"last-move":""].filter(Boolean).join(" ");
  const btn=node("button",cl);btn.type="button";
  btn.setAttribute("aria-label",(r+1)+"행 "+(c+1)+"열 "+(state.board[i]===0?"빈 교차점":marker(state.board[i])+"돌"));
  if([3,7,11].includes(r)&&[3,7,11].includes(c))btn.append(node("i","star"));
  if(state.board[i])piece(btn,state.board[i],"stone");
  btn.disabled=state.done||state.board[i]!==0||!!onlineBlocked();
  btn.addEventListener("click",()=>omokMove(i));return btn;
 });
}
function othelloFlips(b,i,who){
 if(b[i]!==0)return [];
 const r=Math.floor(i/8),c=i%8,found=[];
 for(const [dr,dc] of dirs8){
  let rr=r+dr,cc=c+dc;const chain=[];
  while(inBounds(rr,cc,8)&&b[rr*8+cc]===-who){chain.push(rr*8+cc);rr+=dr;cc+=dc;}
  if(chain.length&&inBounds(rr,cc,8)&&b[rr*8+cc]===who)found.push(...chain);
 }
 return found;
}
function othelloLegal(who){const out=[];for(let i=0;i<64;i++)if(othelloFlips(state.board,i,who).length)out.push(i);return out;}
function othelloMove(i){
 if(state.done||!Number.isInteger(i)||i<0||i>=state.board.length)return;
 const flips=othelloFlips(state.board,i,state.t);if(!flips.length)return;
 if(requestOnline({kind:"place",index:i}))return;
 save();state.board[i]=state.t;flips.forEach(p=>state.board[p]=state.t);
 state.last=i;const next=-state.t;
 if(othelloLegal(next).length)state.t=next;
 else if(othelloLegal(state.t).length)notice=marker(next)+"은 둘 곳이 없어 자동 패스했습니다.";
 else{state.done=true;notice="양쪽 모두 둘 수 없어 종료되었습니다.";}
 render();
}
function renderOthello(){
 const black=state.board.filter(v=>v===1).length,white=state.board.filter(v=>v===-1).length;
 turnText.textContent=state.done?(black===white?"무승부":(black>white?"흑":"백")+" 승리!") : marker(state.t)+" 차례";
 pushScore(["흑 "+black+"개","백 "+white+"개","놓을 수 있는 칸은 점으로 표시"]);
 tip.textContent=notice||"상대 돌을 한 개 이상 뒤집을 수 있는 위치만 선택할 수 있어요.";
 const can=new Set(state.done?[]:othelloLegal(state.t));
 appendGrid(8,i=>{
  const r=Math.floor(i/8),c=i%8,btn=node("button","square "+((r+c)%2?"dark":"light")+(state.last===i?" last-move":""));
  btn.type="button";btn.style.fontSize="0";btn.style.background=(r+c)%2?"#29764e":"#348657";
  btn.setAttribute("aria-label",(r+1)+"행 "+(c+1)+"열 "+(state.board[i]===0?"빈 칸":marker(state.board[i])+"돌"));
  piece(btn,state.board[i]);
  if(can.has(i))btn.append(node("span","legal-dot"));
  btn.disabled=state.done||!can.has(i)||!!onlineBlocked();
  btn.addEventListener("click",()=>othelloMove(i));return btn;
 });
}


function c4Target(b,c){if(!Number.isInteger(c)||c<0||c>=7)return -1;for(let r=5;r>=0;r--)if(b[r*7+c]===0)return r*7+c;return -1;}
function c4Legal(b){return Array.from({length:7},(_,i)=>i).filter(c=>c4Target(b,c)>=0);}
function c4Win(b,i,who){const r=Math.floor(i/7),c=i%7;for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){let n=1;for(const sign of [-1,1]){let rr=r+dr*sign,cc=c+dc*sign;while(rr>=0&&rr<6&&cc>=0&&cc<7&&b[rr*7+cc]===who){n++;rr+=dr*sign;cc+=dc*sign;}}if(n>=4)return true;}return false;}
function c4Move(c){if(botBlocked()||state.done)return;const i=c4Target(state.board,c);if(i<0)return;save();const t=state.t;state.board[i]=t;state.last=i;if(c4Win(state.board,i,t)){state.done=true;state.winner=t;}else if(state.board.every(Boolean))state.done=true;else state.t=-t;render();}
function renderConnect4(){
 const b=state.board;turnText.textContent=state.done?(state.winner?(state.winner===1?"빨강":"노랑")+" 승리!":"무승부"):(state.t===1?"빨강":"노랑")+" 차례";
 pushScore(["빨강 "+b.filter(x=>x===1).length,"노랑 "+b.filter(x=>x===-1).length,"4개 연결 승리"]);tip.textContent="원하는 열을 눌러 말을 떨어뜨리세요.";
 boardEl.style.gridTemplateColumns="repeat(7,minmax(0,1fr))";boardEl.style.gridTemplateRows="repeat(6,minmax(0,1fr))";boardEl.replaceChildren();
 for(let i=0;i<42;i++){const c=i%7,v=b[i],btn=node("button","square",v?"●":"○");btn.type="button";btn.style.cssText="background:#245fbd;color:"+(v===1?"#ff526c":v===-1?"#ffe56b":"#b9d4ff")+";font-size:clamp(19px,5vw,53px);font-weight:900";btn.disabled=state.done||c4Target(b,c)<0||!!onlineBlocked();btn.setAttribute("aria-label",(c+1)+"번째 열");btn.onclick=()=>c4Move(c);boardEl.append(btn);}
}
function territoryNeighbors(i){const r=Math.floor(i/5),c=i%5,out=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(inBounds(rr,cc,5))out.push(rr*5+cc);}return out;}
function territoryLegal(b,who){const out=[];for(let i=0;i<25;i++)if(!b[i]&&territoryNeighbors(i).some(q=>b[q]===who))out.push(i);return out;}
function territoryMove(i){if(state.done||botBlocked()||!territoryLegal(state.board,state.t).includes(i))return;save();state.board[i]=state.t;state.last=i;state.t=-state.t;const a=territoryLegal(state.board,1),b=territoryLegal(state.board,-1);if(!a.length&&!b.length){state.done=true;const p=state.board.filter(v=>v===1).length,q=state.board.filter(v=>v===-1).length;state.winner=p===q?0:p>q?1:-1;}else if(!territoryLegal(state.board,state.t).length){state.t=-state.t;notice="상대가 둘 곳이 없어 차례를 넘겼어요.";}render();}
function renderTerritory(){
 const b=state.board,legal=territoryLegal(b,state.t);turnText.textContent=state.done?(state.winner?(state.winner===1?"파랑":"주황")+" 승리!":"무승부"):(state.t===1?"파랑":"주황")+" 차례";
 pushScore(["파랑 "+b.filter(v=>v===1).length+"칸","주황 "+b.filter(v=>v===-1).length+"칸"]);tip.textContent=notice||"내 영토의 상하좌우에 붙은 빈 칸을 점령하세요.";
 appendGrid(5,i=>{const v=b[i],btn=node("button","square",i===0?"🏰":i===24?"🏯":v?"■":"·");btn.type="button";btn.style.cssText="font-size:clamp(19px,5vw,48px);font-weight:900;background:"+(v===1?"#5da5fa":v===-1?"#ffac63":legal.includes(i)?"#eaf3ed":"#d5ddd8")+";color:#18344f;border:1px solid #ffffff90";btn.disabled=state.done||!legal.includes(i)||!!onlineBlocked();btn.setAttribute("aria-label",(Math.floor(i/5)+1)+"행 "+(i%5+1)+"열");btn.onclick=()=>territoryMove(i);return btn;});
}

/* Local-only American-style checkers: forced captures and chained jumps. */
function checkerLegal(s){
 const b=s.board,out=[],captures=[];
 for(let i=0;i<64;i++){
  const p=b[i];if(!p||Math.sign(p)!==s.t||(s.forced>=0&&i!==s.forced))continue;
  const r=Math.floor(i/8),c=i%8,drs=Math.abs(p)===2?[-1,1]:[s.t===1?-1:1];
  for(const dr of drs)for(const dc of [-1,1]){
   const rr=r+dr,cc=c+dc;if(!inBounds(rr,cc,8))continue;
   const mid=rr*8+cc,farR=r+2*dr,farC=c+2*dc;
   if(b[mid]===0&&s.forced<0)out.push({from:i,to:mid,capture:-1});
   if(Math.sign(b[mid])===-s.t&&inBounds(farR,farC,8)&&b[farR*8+farC]===0)
    captures.push({from:i,to:farR*8+farC,capture:mid});
  }
 }
 return captures.length?captures:(s.forced>=0?[]:out);
}
function checkerMove(m){
 if(botBlocked()||state.done)return;
 const valid=checkerLegal(state).find(q=>q.from===m.from&&q.to===m.to&&q.capture===m.capture);
 if(!valid)return;
 save();
 const b=state.board,p=b[m.from];b[m.from]=0;b[m.to]=p;
 if(m.capture>=0)b[m.capture]=0;
 const promoted=Math.abs(p)===1&&(state.t===1?Math.floor(m.to/8)===0:Math.floor(m.to/8)===7);
 if(promoted)b[m.to]=2*state.t;
 state.last=m.to;selected=-1;state.forced=-1;
 if(m.capture>=0&&!promoted){
   state.forced=m.to;
   if(checkerLegal(state).some(q=>q.capture>=0)){notice="연속 잡기! 같은 말을 다시 움직이세요.";render();return;}
   // No further capture: clear the forced-piece lock before switching turns.
   state.forced=-1;
 }
 state.t=-state.t;
 if(!checkerLegal(state).length||!state.board.some(v=>Math.sign(v)===state.t)){state.done=true;state.winner=-state.t;}
 render();
}
function renderCheckers(){
 const b=state.board,legal=checkerLegal(state);
 turnText.textContent=state.done?(state.winner===1?"빨강 승리!":"검정 승리!"):(state.t===1?"빨강":"검정")+" 차례";
 pushScore(["빨강 "+b.filter(v=>v>0).length+"개","검정 "+b.filter(v=>v<0).length+"개",legal.some(m=>m.capture>=0)?"잡기 필수":"대각선 이동"]);
 tip.textContent=notice||"말을 누른 후 이동할 어두운 칸을 선택하세요. 잡을 수 있으면 반드시 잡아야 합니다.";
 const targets=new Set(legal.filter(m=>m.from===selected).map(m=>m.to));
 appendGrid(8,i=>{
  const r=Math.floor(i/8),c=i%8,p=b[i],btn=node("button","square "+((r+c)%2?"dark":"light")+(selected===i?" selected":"")+(targets.has(i)?" target":""));
  btn.type="button";btn.setAttribute("aria-label",(r+1)+"행 "+(c+1)+"열 "+(p?(p>0?"빨강":"검정")+(Math.abs(p)===2?" 킹":" 말"):"빈 칸"));
  if(p){const disk=node("span","disk",Math.abs(p)===2?"★":"");disk.style.cssText="width:77%;height:77%;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:clamp(12px,3vw,27px);font-weight:900;background:"+(p>0?"#d83c55":"#252b39")+";border:3px solid #ffffff70;box-shadow:0 2px 5px #0005";btn.append(disk);}
  btn.disabled=state.done||!!onlineBlocked()||(r+c)%2===0;
  btn.onclick=()=>{
   if(b[i]&&Math.sign(b[i])===state.t){if(legal.some(m=>m.from===i)){selected=i;render();}return;}
   const m=legal.find(q=>q.from===selected&&q.to===i);if(m)checkerMove(m);
  };
  return btn;
 });
}
function tttWinner(b){
 for(const a of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]){
  if(b[a[0]]&&b[a[0]]===b[a[1]]&&b[a[1]]===b[a[2]])return b[a[0]];
 }return 0;
}
function tttMove(i){
 if(botBlocked()||state.done||state.board[i]!==0)return;
 save();state.board[i]=state.t;state.last=i;
 state.winner=tttWinner(state.board);
 state.done=!!state.winner||state.board.every(Boolean);
 if(!state.done)state.t=-state.t;
 render();
}
function renderTTT(){
 turnText.textContent=state.done?(state.winner?(state.winner===1?"X":"O")+" 승리!":"무승부"):(state.t===1?"X":"O")+" 차례";
 pushScore(["3×3 판","X 선공","3개 연결하면 승리"]);
 tip.textContent="빈 칸을 눌러 X 또는 O를 놓으세요.";
 appendGrid(3,i=>{
  const btn=node("button","square "+((Math.floor(i/3)+i%3)%2?"dark":"light"),state.board[i]===1?"X":state.board[i]===-1?"O":"");
  btn.type="button";btn.style.fontSize="clamp(28px,9vw,90px)";btn.style.fontWeight="900";
  btn.style.color=state.board[i]===1?"#b32643":"#173c9c";
  btn.disabled=state.done||state.board[i]!==0||!!onlineBlocked();
  btn.setAttribute("aria-label",(Math.floor(i/3)+1)+"행 "+(i%3+1)+"열 "+(state.board[i]===0?"빈 칸":state.board[i]===1?"X":"O"));
  btn.onclick=()=>tttMove(i);return btn;
 });
}

/* Chess: 0x88 board; filtered legal moves prevent king exposure. */
const glyph={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟︎",".":""};
const cd={n:[-33,-31,-18,-14,14,18,31,33],b:[-17,-15,15,17],r:[-16,-1,1,16],k:[-17,-16,-15,-1,1,15,16,17]};
const on=i=>i>=0&&i<128&&!(i&0x88);
const side=p=>!p||p==="."?0:p===p.toUpperCase()?1:-1;
const square=i=>"abcdefgh"[i&7]+(8-(i>>4));
const idx=s=>(8-Number(s[1]))*16+"abcdefgh".indexOf(s[0]);
function chessStart(){
 const b=Array(128).fill("."),fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
 fen.split("/").forEach((row,r)=>{let col=0;for(const p of row){if(/[1-8]/.test(p))col+=Number(p);else b[r*16+col++]=p;}});
 return {b,t:1,c:15,ep:-1,half:0,full:1,done:false,draw:"",last:null};
}
function attacked(s,target,by){
 for(let f=0;f<128;f++){
  if(!on(f)||side(s.b[f])!==by)continue;
  const p=s.b[f].toLowerCase();
  if(p==="p"){if(target===f-16*by-1||target===f-16*by+1)return true;continue;}
  for(const d of (cd[p]||cd.k)){
   for(let t=f+d;on(t);t+=d){
    if(t===target)return true;
    if(s.b[t]!=="."||p==="n"||p==="k")break;
   }
  }
 }
 return false;
}
function inCheck(s,w=s.t){return attacked(s,s.b.indexOf(w===1?"K":"k"),-w);}
function applyChess(s,m){
 const [f,t,promo,flag]=m,b=s.b.slice(),p=b[f],taken=b[t];let rights=s.c;
 b[f]=".";b[t]=promo?(s.t===1?promo.toUpperCase():promo):p;
 if(flag==="ep")b[t+16*s.t]=".";
 if(flag==="castle"){
  const rf=t>f?f+3:f-4,rt=t>f?f+1:f-1;
  b[rt]=b[rf];b[rf]=".";
 }
 if(p==="K")rights&=~3;
 if(p==="k")rights&=~12;
 const rb={119:1,112:2,7:4,0:8};
 if(p.toLowerCase()==="r")rights&=~(rb[f]||0);
 if(taken.toLowerCase()==="r")rights&=~(rb[t]||0);
 return {b,t:-s.t,c:rights,ep:p.toLowerCase()==="p"&&Math.abs(t-f)===32?(t+f)/2:-1,half:p.toLowerCase()==="p"||taken!=="."||flag==="ep"?0:s.half+1,full:s.full+(s.t===-1?1:0),done:false,draw:"",last:[f,t]};
}
function pseudo(s){
 const result=[];
 for(let f=0;f<128;f++){
  if(!on(f)||side(s.b[f])!==s.t)continue;
  const p=s.b[f].toLowerCase();
  const add=(t,flag="")=>{
   if(s.b[t].toLowerCase()==="k")return;
   if(p==="p"&&((t>>4)===0||(t>>4)===7))for(const q of ["q","r","b","n"])result.push([f,t,q,flag]);
   else result.push([f,t,"",flag]);
  };
  if(p==="p"){
   const t=f-16*s.t;
   if(on(t)&&s.b[t]==="."){
    add(t);const twice=t-16*s.t;
    if((f>>4)===(s.t===1?6:1)&&s.b[twice]===".")add(twice);
   }
   for(const d of [-1,1]){
    const u=t+d;if(!on(u))continue;
    if(side(s.b[u])===-s.t)add(u);
    else if(u===s.ep&&s.b[u]==="."&&s.b[u+16*s.t]===(s.t===1?"p":"P"))add(u,"ep");
   }
  }else{
   for(const d of (cd[p]||cd.k))for(let t=f+d;on(t);t+=d){
    if(side(s.b[t])===s.t)break;
    add(t);
    if(s.b[t]!=="."||p==="n"||p==="k")break;
   }
   const home=s.t===1?116:4,rook=s.t===1?"R":"r",bits=s.t===1?[1,2]:[4,8];
   if(p==="k"&&f===home&&!inCheck(s)){
    if((s.c&bits[0])&&s.b[f+3]===rook&&s.b[f+1]==="."&&s.b[f+2]==="."&&!attacked(s,f+1,-s.t)&&!attacked(s,f+2,-s.t))add(f+2,"castle");
    if((s.c&bits[1])&&s.b[f-4]===rook&&s.b[f-1]==="."&&s.b[f-2]==="."&&s.b[f-3]==="."&&!attacked(s,f-1,-s.t)&&!attacked(s,f-2,-s.t))add(f-2,"castle");
   }
  }
 }
 return result;
}
function chessLegal(s){return pseudo(s).filter(m=>!inCheck(applyChess(s,m),s.t));}
function positionKey(s){
 let effective=-1;
 if(s.ep>=0&&chessLegal(s).some(m=>m[3]==="ep"))effective=s.ep;
 return s.b.join("")+":"+s.t+":"+s.c+":"+effective;
}
function insufficient(s){
 const pcs=[];for(let i=0;i<128;i++)if(on(i)&&s.b[i]!=="."&&s.b[i].toLowerCase()!=="k")pcs.push([s.b[i].toLowerCase(),((i>>4)+(i&7))%2]);
 return pcs.length===0||(pcs.length===1&&["b","n"].includes(pcs[0][0]))||(pcs.every(p=>p[0]==="b")&&new Set(pcs.map(p=>p[1])).size===1);
}
function chessStatus(){
 const moves=chessLegal(state),check=inCheck(state),k=positionKey(state);
 const repeats=history.filter(p=>p.b&&positionKey(p)===k).length+1;
 if(!moves.length)return {done:true,text:check?(state.t===1?"흑":"백")+" 승리 · 체크메이트":"무승부 · 스테일메이트",claim:"",moves};
 if(insufficient(state))return {done:true,text:"무승부 · 체크메이트에 필요한 기물 부족",claim:"",moves};
 if(state.half>=150||repeats>=5)return {done:true,text:"무승부 · "+(state.half>=150?"75수":"같은 위치 5번 반복")+" 규칙",claim:"",moves};
 return {done:false,text:(state.t===1?"백":"흑")+" 차례"+(check?" · 체크!":""),claim:repeats>=3?"같은 위치 3회 반복":state.half>=100?"50수 규칙":"",moves};
}
function chessMove(m){
 if(requestOnline({kind:"chess",from:m[0],to:m[1],promotion:m[2]||""}))return;
 save();state=applyChess(state,m);selected=-1;promotionMoves=null;modal.hidden=true;render();
}
function clickChess(i){
 const st=chessStatus();if(st.done||state.draw||onlineBlocked())return;
 if(side(state.b[i])===state.t){selected=selected===i?-1:i;notice="";render();return;}
 const opts=st.moves.filter(m=>m[0]===selected&&m[1]===i);
 if(opts.length>1){
  promotionMoves=opts;promoOptions.replaceChildren();
  const pieces={q:"퀸",r:"룩",b:"비숍",n:"나이트"};
  opts.forEach(m=>{const p=state.t===1?m[2].toUpperCase():m[2],btn=node("button","",glyph[p]);btn.type="button";btn.title=pieces[m[2]];btn.setAttribute("aria-label",pieces[m[2]]+" 승격");btn.addEventListener("click",()=>chessMove(m));promoOptions.append(btn);});
  modal.hidden=false;promoOptions.querySelector("button")?.focus();return;
 }
 if(opts.length===1){chessMove(opts[0]);return;}
 notice="합법적인 이동 칸을 선택하세요.";render();
}
function renderChess(){
 const st=chessStatus(),isDone=st.done||!!state.draw,valid=st.moves;
 turnText.textContent=state.draw||st.text;
 claimBtn.hidden=!st.claim||isDone;
 claimBtn.textContent="무승부 주장 · "+st.claim;
 pushScore(["수순 "+state.full+(state.t===-1?"...":"."),"백 ♔ · 흑 ♚","노란색: 선택한 말 / 초록색: 합법 이동"]);
 tip.textContent=notice||(isDone?"새 게임으로 다시 시작할 수 있습니다.":"이동할 말을 누르고 초록색 표시된 칸을 누르세요. 백이 먼저 둡니다.");
 const targets=new Set(valid.filter(m=>m[0]===selected).map(m=>m[1]));
 boardEl.style.gridTemplateColumns="repeat(8,minmax(0,1fr))";
 boardEl.style.gridTemplateRows="repeat(8,minmax(0,1fr))";
 boardEl.replaceChildren();const frag=document.createDocumentFragment();
 for(let j=0;j<64;j++){
  const i=Math.floor(j/8)*16+j%8,p=state.b[i];
  const cls="square "+((Math.floor(j/8)+j%8)%2?"dark":"light")+(selected===i?" selected":"")+(targets.has(i)?" target":"")+(p!=="."?" occupied":"");
  const btn=node("button",cls);btn.type="button";btn.setAttribute("aria-label",square(i)+" "+(p==="."?"빈 칸":p));
  if(p!==".")btn.append(node("span",side(p)===1?"piece-white":"piece-black",glyph[p]));
  btn.disabled=isDone||!!onlineBlocked();btn.addEventListener("click",()=>clickChess(i));frag.append(btn);
 }
 boardEl.append(frag);
}
tabs.forEach(b=>b.addEventListener("click",()=>{if(!online()?.isOnline())reset(b.dataset.game);}));
$("new-game").addEventListener("click",()=>{if(!online()?.isOnline())reset(game);});
undoBtn.addEventListener("click",()=>{
 if(!history.length||online()?.isOnline())return;
 botCancel();
 if(botEnabled&&history.length>=2&&state.t===1)history.pop();
 state=history.pop();selected=-1;promotionMoves=null;modal.hidden=true;notice="직전 수를 되돌렸어요.";render();
});
passBtn.addEventListener("click",goPass);
sizeInput.addEventListener("change",()=>{if(game==="go"&&!online()?.isOnline())reset("go");});
claimBtn.addEventListener("click",()=>{
 if(game!=="chess")return;
 const st=chessStatus();if(botBlocked()||!st.claim||st.done)return;
 if(requestOnline({kind:"claim"}))return;
 save();state.draw="무승부 · "+st.claim;render();
});
$("cancel-promotion").addEventListener("click",()=>{promotionMoves=null;modal.hidden=true;});
/* Adapter: replay only validated actions, in strict order, through the existing rules. */
window.FormwheelBoardBridge=Object.freeze({
  load(type,size,actions,hostUid,guestUid){
    if(!["chess","go","omok","othello"].includes(type)||!Array.isArray(actions)||actions.length>1200)return false;
    replaying=true;
    try{
      if(type==="go"){
        if(![9,13,19].includes(Number(size)))throw Error("invalid board size");
        sizeInput.value=String(size);
      }
      reset(type);
      for(const a of actions){
        if(!a||typeof a!=="object"||!["place","chess","pass","claim"].includes(a.kind))throw Error("invalid action");
        if(a.kind==="place"&&(!Number.isInteger(a.index)||a.index<0||a.index>=state.board.length))throw Error("place outside board");
        if((state.done||state.draw)||(game==="chess"&&chessStatus().done))throw Error("action after game ended");
        const expected=state.t===1?hostUid:guestUid;
        if(!expected||a.uid!==expected)throw Error("wrong player turn");
        const before=history.length;
        if(a.kind==="chess"&&game==="chess"){
          const move=chessLegal(state).find(m=>m[0]===a.from&&m[1]===a.to&&(m[2]||"")===(a.promotion||""));
          if(!move)throw Error("illegal chess move");
          chessMove(move);
        }else if(a.kind==="place"&&Number.isInteger(a.index)&&game==="go")goMove(a.index);
        else if(a.kind==="place"&&Number.isInteger(a.index)&&game==="omok")omokMove(a.index);
        else if(a.kind==="place"&&Number.isInteger(a.index)&&game==="othello")othelloMove(a.index);
        else if(a.kind==="pass"&&game==="go")goPass();
        else if(a.kind==="claim"&&game==="chess"&&chessStatus().claim){save();state.draw="무승부 · "+chessStatus().claim;}
        else throw Error("wrong action type");
        if(history.length!==before+1)throw Error("illegal action rejected");
      }
      notice="";
      return true;
    }catch(err){
      console.warn("Board replay rejected",err);
      notice="잘못된 온라인 수순이 감지되었습니다.";
      return false;
    }finally{
      replaying=false;selected=-1;promotionMoves=null;modal.hidden=true;render();
    }
  },
  getTurn:()=>state?.t||1,
  getStatus:()=>({done:!!state?.done||!!state?.draw||(game==="chess"&&chessStatus().done),game,size:game==="go"?state.n:game==="omok"?15:8}),
  render:()=>render(),
  resetLocal:()=>{botModeOff();reset(game)}
});
reset("chess");
})();