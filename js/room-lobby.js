/* ROOM LOBBY: scene, party panel, dialogue, ready/start, invite, settings */
const NM=['Aria','Bram','Cael','Dara','Eli','Fenn','Gwen','Hale','Iris','Jory','Kira','Lio','Mara','Nox','Orin','Pia','Quin','Rhea','Sol','Tess','Uma','Vex','Wren','Yara','Zed'],RK=['swordsman','mage','archer','support'];
const INTRO=['Welcome, adventurers! Your journey is about to begin. Gather your companions, choose your role, and prepare for the unknown.','Every role matters here. The Swordsman guards, the Mage seeks, the Archer scouts, and the Healer mends.','When all of you are ready, the host may open the gate to the adventure.'];
function say(t,sp){const bx=$('.ldb');bx.classList.remove('pulse');void bx.offsetWidth;bx.classList.add('pulse');$('#dsp').textContent=sp||'GUILD MASTER';clearInterval(lb.tm);let i=0;$('#dtx').textContent='';lb.tm=setInterval(()=>{$('#dtx').textContent=t.slice(0,++i);if(i>=t.length)clearInterval(lb.tm)},20)}
const DM_INTRO='Welcome, Dungeon Master! Your students are gathering. Review the party, then begin the adventure once everyone is ready.';
const allReady=()=>{const S=room.players.filter(p=>!p.dm);return S.length>=room.min&&S.every(p=>p.ready&&p.role)};
function applyRole(){const dm=!!me.dm;$('#sg').style.display=can('settings')?'':'none';$('#bst').style.display=can('start')?'':'none';$('#tpb').style.display=can('teacherPanel')?'':'none';$('#bch').style.display=can('chooseRole')?'':'none';$('#brd').style.display=can('ready')?'':'none';$('#tcp').classList.remove('open')}
function enter(r,nick,host){close();room=r;me=host?{name:nick,role:null,ready:true,host:true,dm:true}:{name:nick,role:null,ready:false,host:false};room.players=room.players.filter(p=>p.name!=nick);room.players.push(me);room.min=room.min||(host?1:2);lb={i:0,n:0};
const want=Math.min(room.max-room.players.filter(p=>!p.dm).length,room.max>=20?Math.min(24,room.max-1):2);for(let k=0;k<want;k++){const n=NM[(k*3+7)%NM.length];if(n!=nick&&!room.players.some(p=>p.name==n))room.players.push({name:n,role:RK[k%4],ready:k%3==0,mock:1})}
$('#home').style.display='none';$('#lobby').style.display='flex';$('#nav').style.display='none';scrollTo(0,0);
$('#ldr').classList.toggle('open',innerWidth>1000);applyRole();
clearInterval(lb.iv);lb.iv=setInterval(()=>{if(!room||room.players.filter(p=>!p.dm).length>=room.max||lb.n>=6)return;const n=NM[(lb.n*5+2)%NM.length]+(lb.n+10);lb.n++;const np={name:n,role:RK[lb.n%4],ready:false,mock:1};room.players.push(np);if(me.dm)setTimeout(()=>{np.ready=true;render()},4000);say(n+' has joined the party!');render()},14000);
say(me.dm?DM_INTRO:INTRO[0]);render();renderTeacher();
if(me.dm)setTimeout(()=>{if(!room)return;room.players.forEach(p=>p.mock&&(p.ready=true));render();say('Your students have taken their places. Start the adventure when you are ready.')},5000);
else if(!me.role)setTimeout(openSel,150)}
function render(){const P=room.players,S=P.filter(p=>!p.dm),n=S.length;$('#lrn').textContent=room.name;$('#lrc').textContent='Room Code: '+room.code;$('#lrp').textContent=n+' / '+room.max+' PLAYERS';$('#pcn').textContent=n;$('#ldc').textContent=n+' / '+room.max+' Players Joined · '+S.filter(p=>p.ready).length+' ready';
const sh=[me,...P.filter(p=>p!==me&&p.role)].filter(p=>p.role).slice(0,innerWidth<700?3:5),ex=n-sh.length;
$('#lsc').innerHTML=sh.map(p=>`<div class='lch${p===me?' me':''}${p.ready?' rdy':''}'><div class='fr'><img src='${IMG[p.role]}' alt=''></div><div class='plat'></div><b>${esc(p.name)}</b><small>${hn(p.role).n} · ${p.ready?'✔ Ready':'Not ready'}</small></div>`).join('')+(ex>0?`<div class='lch more' id='mr'>+${ex}<small>more adventurers</small></div>`:'');
const m=$('#mr');if(m)m.onclick=()=>$('#ldr').classList.add('open');
$('#llist').innerHTML=[...P].filter(p=>p.name.toLowerCase().includes($('#lq').value.toLowerCase())).sort((a,b)=>(b.host?1:0)-(a.host?1:0)).map(p=>`<div class='lp'><div class='la'>${p.role?`<img src='${IMG[p.role]}' alt=''>`:p.dm?'👑':'?'}</div><div><b>${esc(p.name)}</b>${p.host?' 👑':''}${p===me?' (you)':''}<small>${p.dm?'Dungeon Master':p.role?hn(p.role).n:'No role yet'}</small></div><span>${p.ready?'✔ Ready':'…'}</span>${me.dm&&!p.dm?`<button class='kick' data-n='${esc(p.name)}' title='Remove'>✕</button>`:''}</div>`).join('');
$('#brd').textContent=me.ready?'NOT READY':'READY';$('#bst').disabled=!allReady();$('#bst').title=allReady()?'':'All players must choose a role and be ready';$('#bst').classList.toggle('glow',allReady());$('#lobby').style.setProperty('--dbh',($('.ldb').offsetHeight+14)+'px');if(me.dm)renderTeacher()}
$('#brd').onclick=()=>{if(!me.role){toast('Choose a role first');return openSel()}me.ready=!me.ready;if(me.ready){say(me.name+' is ready for the journey!');setTimeout(()=>{if(!room)return;room.players.forEach(p=>p.mock&&(p.ready=true));render();if(allReady())say('The whole party is ready. Waiting for the Dungeon Master to begin!')},1600)}else say(me.name+' needs a little more time.');render()};
$('#bst').onclick=()=>allReady()?toast('The adventure is about to begin… (gameplay comes in a later phase)'):toast('Everyone needs a role and must be ready');
$('#pt').onclick=()=>$('#ldr').classList.toggle('open');$('#ldx').onclick=()=>$('#ldr').classList.remove('open');
$('#iv').onclick=()=>{$('#ivc').value=room.code;$('#ivl').value='https://eduquest.app/join/'+room.code;open('invm')};
$('#ivcb').onclick=e=>cp($('#ivc').value,e.target);$('#ivlb').onclick=e=>cp($('#ivl').value,e.target);
$('#sg').onclick=()=>{$('#srn').value=room.name;$('#smn').value=room.min;open('setm')};
$('#ssv').onclick=()=>{room.name=$('#srn').value.trim()||room.name;room.min=+$('#smn').value;close();render();toast('Room settings saved')};
$('#llv').onclick=()=>{clearInterval(lb.iv);room=null;$('#lobby').style.display='none';$('#home').style.display='';$('#nav').style.display='';$('#nav').classList.remove('s');scrollTo(0,0)};
addEventListener('resize',()=>room&&$('#lobby').style.display=='flex'&&render());
$('#lq').oninput=()=>room&&render();$('#lrc').onclick=()=>cp(room.code,$('#lrc'));$('#ccd').onclick=()=>cp(room.code,$('#ccd'));$('#cli').onclick=()=>cp('https://eduquest.app/join/'+room.code,$('#cli'));
