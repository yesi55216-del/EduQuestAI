/* TEACHER PANEL + DASHBOARD PLACEHOLDER (mock data) */
function renderTeacher(){if(!room||!me||!me.dm)return;
 const S=room.players.filter(p=>!p.dm);storyEngine.configure(room);const sc=sceneManager.current(),bg=backgroundManager.recommend(sc);
 const idle=S.filter(p=>p.mock&&!p.ready).length;
 $('#tcb').innerHTML=`<div class='ts'><h4>ROOM</h4><p><b>${esc(room.name)}</b><br>${esc(room.subject||'')} · ${esc(room.level||'')}<br>${esc(room.chapterTitle||'')}<br><span class='chip'>${room.mode=='ai'?'AI-Assisted':'Teacher-Guided'}</span></p><p class='obj'>${esc(room.objectives||'')}</p></div>
<div class='ts'><h4>CAPACITY</h4><div class='cap'><button data-a='capm'>−</button><b>${S.length} / ${room.max}</b><button data-a='capp'>+</button></div></div>
<div class='ts'><h4>STUDENTS</h4><p>${S.length} joined · ${S.filter(p=>p.ready).length} ready · ${S.filter(p=>p.role).length} with characters</p><button data-a='idle' ${idle?'':'disabled'}>Remove inactive (${idle})</button></div>
<div class='ts'><h4>CURRENT SCENE</h4><p>${esc(sc.location)}<br><small>Background: ${esc(bg.label)}</small></p></div>
<div class='ts'><button class='gold' data-a='dash'>Teacher Dashboard</button></div>`}
$('#tcb').onclick=e=>{const b=e.target.closest('button');if(!b||!room)return;const a=b.dataset.a,S=room.players.filter(p=>!p.dm);
 if(a=='capm'&&can('capacity')){room.max=Math.max(S.length,room.max-1,1)}
 else if(a=='capp'&&can('capacity')){room.max=Math.min(60,room.max+1)}
 else if(a=='idle'&&can('kick')){const n=S.filter(p=>p.mock&&!p.ready).length;room.players=room.players.filter(p=>!(p.mock&&!p.ready));say(n+' inactive student'+(n==1?'':'s')+' removed from the party.')}
 else if(a=='dash'){return openDash()}
 render();renderTeacher()};
function kick(name){if(!can('kick'))return;room.players=room.players.filter(p=>p.name!=name);say(name+' has been removed from the party.');render();renderTeacher()}
$('#llist').onclick=e=>{const b=e.target.closest('.kick');if(b)kick(b.dataset.n)};
$('#tpb').onclick=()=>{$('#tcp').classList.toggle('open');$('#ldr').classList.remove('open')};
$('#tcx').onclick=()=>$('#tcp').classList.remove('open');
async function openDash(){if(!can('dashboard'))return;const d=MOCK_TEACHER.dashboard,bar=v=>`<div class='bar'><i style='width:${v}%'></i></div>`;
 const[sug,ch]=await Promise.all([storyEngine.suggestVariations(),learningEngine.suggestChallenges(room.objectives)]);
 $('#dashc').innerHTML=`<h2>TEACHER DASHBOARD</h2><p class='sub'>Preview · mock data only</p><div class='kp'><div><b>${d.analytics.avg}%</b>Average score</div><div><b>${d.analytics.participation}%</b>Participation</div><div><b>${d.analytics.time}</b>Avg. time on task</div></div>
<div class='dgrid'><div class='dc'><h4>STUDENT PARTICIPATION</h4>${d.participation.map(p=>`<div class='dr'><span>${p.n}</span>${bar(p.v)}<em>${p.v}%</em></div>`).join('')}</div>
<div class='dc'><h4>PLAYER PROGRESS</h4>${d.progress.map(p=>`<div class='dr'><span>${p.n}</span>${bar(p.pct)}<em>${p.pct}%</em></div>`).join('')}</div>
<div class='dc'><h4>CHALLENGE RESULTS</h4>${d.results.map(r=>`<div class='dr'><span>${r.q}</span>${bar(r.c)}<em>${r.c}%</em></div>`).join('')}</div>
<div class='dc'><h4>CHAPTER PROGRESS</h4>${d.chapters.map(c=>`<div class='dr col'><span>${c.t}</span>${bar(c.pct)}</div>`).join('')}</div>
<div class='dc wide'><h4>AI STORY ASSISTANT <small>(suggestions only — you decide)</small></h4><p><b>Story variations</b></p><ul>${sug.map(s=>`<li>${s.text}</li>`).join('')}</ul><p><b>Suggested challenges</b></p><ul>${ch.map(s=>`<li>${s.text}</li>`).join('')}</ul></div></div>`;
 open('dash')}
