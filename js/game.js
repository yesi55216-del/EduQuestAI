/* GAMEPLAY: story scenes, dialogue, individual questions, group discussion + voting, chapters 1-4, endings, learning summary. */
(()=>{
const ALLIES=[['Bram','archer'],['Iris','mage'],['Kira','support']];
let G=null,typing=null,gEl=null;
const ai=()=>getAI();
function build(){if(gEl)return;gEl=document.createElement('div');gEl.id='game';gEl.innerHTML=`
<div class='gbg'><div class='gl'></div><div class='gl'></div></div><div class='gvig'></div>
<div class='gtop'><b class='cz' id='gti'></b><div class='gpips' id='gpips'></div><span class='gmis' id='gmis'></span><span style='flex:1'></span><button class='g' id='gaub'>🔊 Sound</button><button class='g' id='gxt'>Exit</button></div>
<div class='gaud' id='gaud'></div>
<aside class='gparty' id='gparty'></aside>
<div class='gstage'><div class='gnpc' id='gnpc'></div></div>
<aside class='gas' id='gas'><button class='gast' id='gast'>🧙 AI Dungeon Assistant</button><div class='gasb' id='gasb'></div></aside>
<div class='gpanel' id='gpanel'></div>
<div class='gdlg' id='gdlg'><div class='gplate'><div class='gsp' id='gsp'></div><small id='gtt'></small></div><div class='gbody'><div class='gav' id='gav'></div><p class='gtx' id='gtx'></p></div><div class='gfoot'><span class='gdots' id='gdots'></span><small class='ghint'>Click or press Space</small><button class='gold' id='gnx'>NEXT <i>▸</i></button></div></div>
<div class='gcin' id='gcin'></div>`;
 document.body.appendChild(gEl);
 $('#gxt').onclick=exit;$('#gnx').onclick=next;$('#gaub').onclick=()=>{$('#gaud').classList.toggle('o');drawAudio()};
 $('#gast').onclick=()=>$('#gas').classList.toggle('open');
 $('#gdlg').onclick=e=>{if(e.target.closest('#gnx'))return;if(typing)skipType();else next()};
 document.addEventListener('keydown',e=>{if(!G||!gEl.classList.contains('o')||$('#gdlg').style.display=='none'||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if(e.key==' '||e.key=='Enter'||e.key=='ArrowRight'){e.preventDefault();$('#gnx').click()}})}
function drawAudio(){const s=audioManager.s;$('#gaud').innerHTML=`<h4 class='cz'>AUDIO SETTINGS</h4><button id='aon' class='${s.on?'g':'gold'}'>${s.on?'Sound is ON (click to turn off)':'Enable sound'}</button>
<label>Music volume</label><input type='range' min='0' max='1' step='.05' id='amv' value='${s.mv}'><label>Effects volume</label><input type='range' min='0' max='1' step='.05' id='asv' value='${s.sv}'>
<div class='achk'><label><input type='checkbox' id='am1' ${s.music?'checked':''}> Mute music</label><label><input type='checkbox' id='am2' ${s.sfx?'checked':''}> Mute effects</label><label><input type='checkbox' id='am3' ${s.master?'checked':''}> Master mute</label></div><small>Sound starts only after you enable it.</small>`;
 $('#aon').onclick=()=>{audioManager.toggle();if(audioManager.s.on&&G)audioManager.playMusic(G.music,true);drawAudio();$('#gaub').textContent=audioManager.s.on?'🔊 Sound':'🔇 Sound'};
 $('#amv').oninput=e=>audioManager.set('mv',+e.target.value);$('#asv').oninput=e=>{audioManager.set('sv',+e.target.value)};$('#asv').onchange=()=>audioManager.sfx('click');
 $('#am1').onchange=e=>audioManager.set('music',e.target.checked);$('#am2').onchange=e=>audioManager.set('sfx',e.target.checked);$('#am3').onchange=e=>audioManager.set('master',e.target.checked)}
/* ----- Scene manager view: crossfading backgrounds with fallback ----- */
let layer=0,curBg=null;
function setBg(id){if(curBg==id)return;curBg=id;const b=backgroundManager.resolve(id),L=gEl.querySelectorAll('.gl'),n=L[layer^1],o=L[layer];layer^=1;
 const apply=img=>{n.style.backgroundImage=img?`url(${b.src})`:b.css;n.classList.add('on');o.classList.remove('on')};
 if(b.src){const im=new Image();im.onload=()=>apply(true);im.onerror=()=>{console.warn('[EduQuest] Background image failed to load:',b.src);toast('Background image not found: '+b.src.split('?')[0]);apply(false)};im.src=b.src}else apply(false)}
/* ----- Start ----- */
function start(subject,o={}){const adv=AdvStore.get(subject);
 if(!o.preview&&!AdvStore.canPlay(adv)){toast('The Dungeon Master has not published this adventure yet.');return}
 build();G={adv,subject,ci:0,li:0,phase:'lines',qi:0,res:{},votes:{},deferred:[],discussed:{},hints:0,preview:!!o.preview,dm:!!(me&&me.dm),music:'lobby'};
 const r=me&&me.role||'swordsman',al=ALLIES.map(([n,k],i)=>({n,k:k==r?['swordsman','mage'][i%2]:k}));G.allies=al;
 gEl.classList.add('o');$('#lobby').style.display='none';$('#gas').style.display=G.dm?'':'none';$('#gas').classList.remove('open');
 curBg=null;gEl.querySelectorAll('.gl').forEach(l=>l.classList.remove('on'));$('#gpanel').innerHTML='';$('#gaud').classList.remove('o');
 if(G.dm)EQStudio.mountAssistant($('#gasb'),()=>({subject:G.subject,chapter:G.ci+1}),()=>{});
 drawParty();audioManager.sfx('open');beginChapter()}
function exit(){clearInterval(typing);typing=null;audioManager.playMusic('lobby');gEl.classList.remove('o');G=null;if(room)$('#lobby').style.display='flex'}
function ch(){return G.adv.chapters[G.ci]}
function drawParty(){const r=me&&me.role||'swordsman',list=[{n:(me&&me.name)||'You',k:r,me:1},...G.allies];
 $('#gparty').innerHTML=list.map(p=>`<div class='gpm${p.me?' me':''}'><img src='${IMG[p.k]}' alt=''><b>${esc(p.n)}</b></div>`).join('')}
function pips(){$('#gpips').innerHTML=G.adv.chapters.map((c,i)=>`<i class='${i<G.ci?'d':i==G.ci?'c':''}' title='${esc(c.title)}'></i>`).join('');$('#gti').textContent=G.adv.title.toUpperCase();$('#gmis').textContent='Mission: '+ch().mission}
/* ----- Chapter flow ----- */
function beginChapter(){G.recapping=0;const c=ch();G.li=0;G.qi=0;G.phase='lines';G.music=c.music;pips();setBg(backgroundManager.forChapter(c,G.subject,room&&room.level));audioManager.playMusic(c.music);audioManager.sfx('chapter');
 $('#gdlg').style.display='none';$('#gpanel').innerHTML='';$('#gpanel').classList.remove('o');{const n=$('#gnpc');n.className='gnpc';n.dataset.k='';n.innerHTML=''}
 const cin=$('#gcin');cin.innerHTML=`<small>CHAPTER ${c.n} OF 4</small><h1>${esc(c.title.toUpperCase())}</h1><p>${esc(c.mission)}</p>`;cin.classList.add('o');
 setTimeout(()=>{cin.classList.remove('o');showLine()},2200)}
function stageNpc(info,narr){const n=$('#gnpc');
 if(narr){n.classList.add('dim');n.classList.remove('talk');return}
 if(n.dataset.k==info.key){n.classList.remove('dim','out');n.classList.add('on');return}
 const had=!!n.dataset.k;n.classList.remove('on');if(had)n.classList.add('out');n.dataset.k=info.key;
 setTimeout(()=>{if(n.dataset.k!=info.key)return;n.style.setProperty('--ac',info.color);
  n.innerHTML=`<div class='np-glow'></div><img class='np-img' src='${info.img}' alt='${esc(info.name)}' draggable='false'><div class='np-tag'><b>${esc(info.name)}</b>${info.title?`<small>${esc(info.title)}</small>`:''}</div>`;
  n.classList.remove('out','dim');void n.offsetWidth;n.classList.add('on')},had?240:30)}
function showLine(){const c=ch(),l=c.lines[G.li];if(!l){return afterLines()}
 if(l.bg)setBg(l.bg);const dlg=$('#gdlg');dlg.style.display='';$('#gpanel').classList.remove('o');
 const narr=NPCS.isNarrator(l.s),info=narr?null:NPCS.find(l.s,l.e);
 dlg.classList.toggle('narr',narr);dlg.style.setProperty('--ac',info?info.color:'#b89a62');dlg.classList.remove('in');void dlg.offsetWidth;dlg.classList.add('in');
 $('#gsp').textContent=narr?'':info.name;$('#gtt').textContent=info?info.title:'';
 $('#gav').innerHTML=info?`<img src='${info.img}' alt=''>`:'';
 stageNpc(info,narr);
 $('#gdots').innerHTML=c.lines.map((_,i)=>`<i class='${i<G.li?'d':i==G.li?'c':''}'></i>`).join('');
 audioManager.sfx('open');typeText(l.t);$('#gnx').firstChild.textContent=G.li==c.lines.length-1?'CONTINUE ':'NEXT '}
function talk(on){$('#gnpc').classList.toggle('talk',on)}
function typeText(t){clearInterval(typing);const el=$('#gtx');el.textContent='';let i=0;G.full=t;talk(true);typing=setInterval(()=>{el.textContent=t.slice(0,++i);if(i>=t.length){clearInterval(typing);typing=null;talk(false)}},18)}
function skipType(){clearInterval(typing);typing=null;talk(false);$('#gtx').textContent=G.full}
function next(){audioManager.sfx('click');if(typing)return skipType();G.li++;showLine()}
function afterLines(){const c=ch();$('#gdlg').style.display='none';
 if(c.discuss&&c.questions.length&&!G.discussed[G.ci]){G.discussed[G.ci]=1;return discussion()}
 askQuestion()}
/* ----- Group discussion (does NOT replace individual answers) ----- */
function discussion(){const c=ch(),q=c.questions[0],al=G.allies;const msgs=[[al[0].n,`This one is about “${q.objective||c.mission}”. Let’s each try it on our own first.`],[al[1].n,'We can talk it through, but remember: every hero submits their own answer.'],[al[2].n,'I’ll keep notes for the party. What does everyone think the key idea is?']];
 const P=$('#gpanel');P.classList.add('o');P.innerHTML=`<div class='gcard'><h3 class='cz'>PARTY DISCUSSION</h3><p class='sub'>Talk it over, then answer individually.</p><div class='dchat' id='dchat'>${msgs.map(m=>`<p><b>${esc(m[0])}:</b> ${esc(m[1])}</p>`).join('')}</div><form id='dfm' class='asf'><input name='m' placeholder='Share an idea with your party…' autocomplete='off'><button>Send</button></form><p><button id='dgo' class='gold'>I’M READY TO ANSWER</button></p></div>`;
 $('#dfm').onsubmit=e=>{e.preventDefault();const inp=e.target.querySelector('input'),v=inp.value.trim();if(!v)return;inp.value='';audioManager.sfx('vote');const d=$('#dchat');d.insertAdjacentHTML('beforeend',`<p class='me'><b>You:</b> ${esc(v)}</p>`);setTimeout(()=>{d.insertAdjacentHTML('beforeend',`<p><b>${esc(al[0].n)}:</b> Good point. Let’s test that idea when we answer.</p>`);d.scrollTop=d.scrollHeight},700);d.scrollTop=d.scrollHeight};
 $('#dgo').onclick=e=>{e.target.disabled=true;audioManager.sfx('click');askQuestion()}}
/* ----- Questions (always individual) ----- */
function askQuestion(){const c=ch(),q=c.questions[G.qi];if(!q)return afterQuestions();
 const P=$('#gpanel');P.classList.add('o');const mc=q.type!='open',hinted=G.hint==q.id;
 P.innerHTML=`<div class='gcard'><small class='qt'>${q.type=='scenario'?'⚔ STORY CHALLENGE':q.type=='open'?'✍ OPEN QUESTION':'❖ CHALLENGE'} · ${q.difficulty||''} · QUESTION ${G.qi+1}/${c.questions.length}</small>
 ${q.context?`<p class='qc'>${esc(q.context)}</p>`:''}<h3>${esc(q.text)}</h3>
 ${mc?`<div class='qo'>${q.options.map((o,i)=>`<label class='qopt'><input type='radio' name='qa' value='${i}'><span>${'ABCD'[i]}</span>${esc(o)}</label>`).join('')}</div>`:`<textarea id='qopen' rows='3' placeholder='Write your answer in your own words…'></textarea>`}
 ${q.hint?`<p><button class='g' id='qh'>💡 Hint</button> <span id='qhx'>${hinted?esc(q.hint):''}</span></p>`:''}
 <p><button class='gold' id='qs'>SUBMIT MY ANSWER</button></p><div id='qfb'></div></div>`;
 if($('#qh'))$('#qh').onclick=()=>{G.hint=q.id;G.hints=(G.hints||0)+1;$('#qhx').textContent=q.hint;audioManager.sfx('open')};
 $$('.qopt').forEach(l=>l.onclick=()=>audioManager.sfx('choose'));
 $('#qs').onclick=()=>submit(q)}
async function submit(q){let a;if(q.type=='open'){a=$('#qopen').value.trim();if(a.length<3)return toast('Write your answer first')}else{const r=document.querySelector('input[name=qa]:checked');if(!r)return toast('Choose an answer first');a=+r.value}
 $('#qs').disabled=true;audioManager.sfx('submit');const res=await ai().evaluateAnswer(q,a),fb=await ai().generateFeedback(q,res);
 G.res[q.id]={score:res.score,correct:res.correct,ch:ch().n,objective:q.objective||'General',q:q.text,hints:G.hint==q.id};
 audioManager.sfx(res.score>=1?'correct':res.score>0?'reward':'wrong');
 const now=q.explain!='chapter';if(!now)G.deferred.push(q);
 $('#qfb').innerHTML=`<div class='fb ${res.score>=1?'ok':res.score>0?'part':'no'}'><b>${res.score>=1?'✔ Well done!':res.score>0?'◐ Partly right':'✖ Not quite'}</b> <span>${esc(res.feedback)}</span>${now?`<p>${esc(q.explanation)}</p>`:'<p><small>The explanation will appear at the end of the chapter.</small></p>'}${res.score>=1?'<small>+10 XP</small>':''}</div><p><button class='gold' id='qn'>CONTINUE ▸</button></p>`;
 $('#qn').onclick=e=>{e.target.disabled=true;audioManager.sfx('click');G.qi++;askQuestion()}}
/* ----- Group decision / vote (never affects individual scoring) ----- */
function afterQuestions(){const c=ch();if(c.decision)return vote();recap()}
function vote(){const c=ch(),d=c.decision,P=$('#gpanel');P.classList.add('o');
 P.innerHTML=`<div class='gcard'><small class='qt'>🗳 PARTY DECISION</small><h3>${esc(d.prompt)}</h3><div class='qo'>${d.options.map(o=>`<button class='vopt' data-o='${o.id}'>${esc(o.text)}</button>`).join('')}</div><div id='vres'></div></div>`;
 $$('.vopt').forEach(b=>b.onclick=()=>castVote(b.dataset.o,d))}
function castVote(mine,d){audioManager.sfx('vote');$$('.vopt').forEach(b=>{b.disabled=true;b.classList.toggle('sel',b.dataset.o==mine)});
 const ids=d.options.map(o=>o.id),votes={[mine]:1};G.allies.forEach((a,i)=>{const v=ids[(i+G.ci)%ids.length];votes[v]=(votes[v]||0)+1});
 const el=$('#vres');el.innerHTML='<p><small>Waiting for the party to vote…</small></p>';
 setTimeout(()=>{audioManager.sfx('vote');const tot=Object.values(votes).reduce((a,b)=>a+b,0);let win=ids.slice().sort((a,b)=>(votes[b]||0)-(votes[a]||0))[0];if((votes[ids[0]]||0)==(votes[ids[1]]||0))win=mine;
  G.votes[ch().id]={win,mine,text:d.options.find(o=>o.id==win).text};
  el.innerHTML=d.options.map(o=>`<div class='vr'><span>${esc(o.text)}</span><div class='bar'><i style='width:${(votes[o.id]||0)/tot*100}%'></i></div><em>${votes[o.id]||0}</em></div>`).join('')+`<p>The party chose: <b>${esc(G.votes[ch().id].text)}</b>.</p><p><button class='gold' id='vn'>CONTINUE ▸</button></p>`;
  $('#vn').onclick=e=>{e.target.disabled=true;audioManager.sfx('click');recap()}},900)}
/* ----- Chapter recap ----- */
async function recap(){if(G.recapping)return;G.recapping=1;const c=ch(),qs=c.questions.map(q=>G.res[q.id]).filter(Boolean),pct=qs.length?Math.round(qs.reduce((a,r)=>a+r.score,0)/qs.length*100):100,sum=await ai().summarizeProgress({chapter:c.n,answered:qs.length,pct});
 audioManager.sfx('complete');const P=$('#gpanel');P.classList.add('o');
 const dq=G.deferred.splice(0);
 P.innerHTML=`<div class='gcard'><small class='qt'>★ CHAPTER ${c.n} COMPLETE</small><h3>${esc(c.title)}</h3><p>${esc(c.completion||'')}</p><p class='sum'>${esc(sum)}</p><div class='bar big'><i style='width:${pct}%'></i></div><small>Your accuracy this chapter: ${pct}%</small>
 ${dq.length?`<h4>Explanations</h4>${dq.map(q=>`<p><b>${esc(q.text)}</b><br>${esc(q.explanation)}</p>`).join('')}`:''}
 <p><button class='gold' id='cn'>${G.ci<3?'NEXT CHAPTER ▸':'SEE THE ENDING ▸'}</button></p></div>`;
 $('#cn').onclick=e=>{e.target.disabled=true;audioManager.sfx('click');if(G.ci<3){G.ci++;beginChapter()}else ending()}}
/* ----- Ending + learning summary ----- */
function ending(){const all=Object.values(G.res),pct=all.length?all.reduce((a,r)=>a+r.score,0)/all.length:0,E=G.adv.endings.find(e=>pct>=e.min)||G.adv.endings.at(-1);
 const last=G.votes[G.adv.chapters[3].id],good=pct>=.4;audioManager.playMusic(good?'victory':'reflect');setBg(E.bg);audioManager.sfx('complete');
 $('#gdlg').style.display='none';$('#gnpc').classList.remove('on');$('#gpips').querySelectorAll('i').forEach(i=>i.className='d');
 const byCh=[1,2,3,4].map(n=>{const r=all.filter(x=>x.ch==n);return{n,pct:r.length?Math.round(r.reduce((a,x)=>a+x.score,0)/r.length*100):0}});
 const obj={};all.forEach(r=>{(obj[r.objective]=obj[r.objective]||[]).push(r.score)});
 const badge=pct>=.75?'🏆 Legends of the Realm':pct>=.4?'🛡 Steadfast Party':'🌱 Rising Adventurers';
 const P=$('#gpanel');P.classList.add('o','end');
 P.innerHTML=`<div class='gcard wide'><small class='qt'>THE END</small><h2 class='cz'>${esc(E.title)}</h2><p>${esc(E.text)}</p>${last?`<p><i>Your final choice, “${esc(last.text)}”, shaped how the story closed.</i></p>`:''}
 <div class='sg'><div><h4>YOUR LEARNING SUMMARY</h4><div class='kp2'><b>${Math.round(pct*100)}%</b><span>overall · ${all.filter(r=>r.score>=1).length}/${all.length} fully correct · ${G.hints||0} hint(s)</span></div>
 ${byCh.map(c=>`<div class='dr'><span>Chapter ${c.n}</span><div class='bar'><i style='width:${c.pct}%'></i></div><em>${c.pct}%</em></div>`).join('')}
 <h4>BY LEARNING OBJECTIVE</h4>${Object.entries(obj).map(([k,v])=>{const p=Math.round(v.reduce((a,b)=>a+b,0)/v.length*100);return`<div class='dr'><span>${esc(k)}</span><div class='bar'><i style='width:${p}%'></i></div><em>${p}%</em></div>`}).join('')}</div>
 <div><h4>GROUP ACHIEVEMENT</h4><p class='badge'>${badge}</p><p><small>Party decisions (voting is separate from your individual score):</small></p>${G.adv.chapters.filter(c=>G.votes[c.id]).map(c=>`<p>• Ch ${c.n}: ${esc(G.votes[c.id].text)}</p>`).join('')||'<p>None</p>'}</div></div>
 <p><button class='gold' id='ag'>PLAY AGAIN</button> <button class='g' id='ax'>BACK TO LOBBY</button></p></div>`;
 $('#ag').onclick=()=>{P.classList.remove('end');start(G.subject,{preview:G.preview})};$('#ax').onclick=()=>{P.classList.remove('end');exit()}}
window.EQGame={start};
/* Lobby integration */
function lobbyButtons(){if(!$('#ben')){$('.acts').insertAdjacentHTML('beforeend',"<button id='ben' class='gold' style='display:none'>ENTER ADVENTURE</button>");
  $('.ltop').insertBefore(Object.assign(document.createElement('button'),{id:'stb',className:'g',textContent:'📖 Studio',style:'display:none'}),$('#tpb'));
  $('#ben').onclick=()=>EQGame.start(room.subject||'Mathematics');$('#stb').onclick=()=>EQStudio.open(room.subject);
  const o=$('#bst');o.onclick=()=>{if(!allReady())return toast('Everyone needs a role and must be ready');const a=AdvStore.get(room.subject||'Mathematics');if(!AdvStore.canPlay(a))toast('Previewing: publish in Studio so students can join.');EQGame.start(room.subject||'Mathematics',{preview:true})}}
 const dm=me&&me.dm;$('#stb').style.display=dm?'':'none';$('#ben').style.display=dm?'none':'';$('#ben').disabled=!(me&&me.ready)}
const _render=render;render=function(){_render();lobbyButtons()};
})();
