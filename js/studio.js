/* ADVENTURE STUDIO (teacher): generate, edit, review, approve, publish. Plus the shared AI Dungeon Assistant chat. */
(()=>{
const SUBJ=['Mathematics','Science','History','Language'],TYPES={mc:'Multiple choice',open:'Open-ended',scenario:'Scenario-based'},DIFF=['Easy','Medium','Hard'];
const S={subject:'Mathematics',tab:'ch',qch:0,edit:null,busy:false,msg:''};const chat=[];
const A=()=>AdvStore.get(S.subject);
const chip=s=>`<span class='chip st ${s.replace(/\s/g,'')}'>${s}</span>`;
const opt=(list,sel)=>list.map(v=>`<option value='${v[0]??v}' ${(v[0]??v)==sel?'selected':''}>${v[1]??v}</option>`).join('');
function mount(){if($('#studio'))return;
 document.body.insertAdjacentHTML('beforeend',`<div class='ov' id='studio'><div class='md w xl'><button class='x' data-close>×</button><div id='stb2'></div></div></div>`);
 $('#studio').addEventListener('click',onClick);$('#studio').addEventListener('change',onChange);}
function openStudio(subj){mount();if(subj&&SUBJ.includes(subj))S.subject=subj;S.tab='ch';S.edit=null;S.msg='';draw();open('studio')}
function draw(){const a=A(),pub=AdvStore.canPlay(a);
 const tabs=[['ch','Chapters'],['q','Questions'],['as','AI Assistant']];
 $('#stb2').innerHTML=`<h2>ADVENTURE STUDIO</h2><p class='sub'>You are the Dungeon Master. AI only drafts: nothing reaches students until you approve and publish.</p>
 <div class='sthead'><select data-f='subject'>${opt(SUBJ,S.subject)}</select><b class='cz'>${esc(a.title)}</b>${chip(a.status)}<span style='flex:1'></span>
 <button data-a='gen' ${S.busy?'disabled':''}>${S.busy?'Generating…':'✨ Generate with AI'}</button><button class='g' data-a='preview'>▶ Preview</button><button class='gold' data-a='publish'>${pub?'Published ✓':'Publish'}</button></div>
 ${S.msg?`<div class='msg ${S.ok?'k':'e'}' style='display:block'>${esc(S.msg)}</div>`:''}
 <div class='tabs'>${tabs.map(t=>`<button class='${S.tab==t[0]?'a':''}' data-tab2='${t[0]}'>${t[1]}</button>`).join('')}</div><div id='stbody'>${S.tab=='ch'?chapters(a):S.tab=='q'?questions(a):'<div id="asroot"></div>'}</div>`;
 if(S.tab=='as')mountAssistant($('#asroot'),()=>({subject:S.subject,chapter:1}),draw)}
function chapters(a){return`<div class='chg'>`+a.chapters.map(c=>`<div class='chc'><div class='chh'><b class='cz'>${c.n}. ${esc(c.title)}</b>${chip(c.status)}</div>
 <label>Title</label><input data-f='ctitle' data-c='${c.n}' value='${esc(c.title)}'>
 <div class='two2'><div><label>Background</label><select data-f='cbg' data-c='${c.n}'>${opt(BACKGROUNDS.map(b=>[b.id,b.label]),c.bg)}</select></div><div><label>Music</label><select data-f='cmu' data-c='${c.n}'>${opt(Object.entries(AUDIO_TRACKS).map(([k,v])=>[k,v.label]),c.music)}</select></div></div>
 <label>Dialogue <small>(Speaker | text, one per line)</small></label><textarea rows='4' data-f='clines' data-c='${c.n}'>${esc(c.lines.map(l=>l.s+' | '+l.t).join('\n'))}</textarea>
 <label>Mission</label><input data-f='cmis' data-c='${c.n}' value='${esc(c.mission)}'>
 <small>${c.questions.length} question(s) · decision: ${c.decision?'yes':'none'}</small>
 <div class='acts2'><button data-a='capp' data-c='${c.n}' ${c.status=='Approved'||c.status=='Published'?'disabled':''}>Approve chapter</button><button class='g' data-a='cregen' data-c='${c.n}'>Regenerate</button></div></div>`).join('')+`</div><p><button class='g' data-a='reset'>Reset demo data</button></p>`}
function questions(a){const all=a.chapters.flatMap(c=>c.questions.map((q,i)=>({q,c,i}))).filter(x=>!S.qch||x.c.n==S.qch);
 return`<div class='sthead'><select data-f='qch'><option value='0'>All chapters</option>${a.chapters.map(c=>`<option value='${c.n}' ${S.qch==c.n?'selected':''}>Chapter ${c.n}</option>`).join('')}</select><span style='flex:1'></span><button data-a='qnew'>+ New question</button><button class='g' data-a='qai'>✨ AI draft (${S.qch||'ch 2'})</button></div>`+(S.edit?qform(a):'')+
 (all.length?all.map(({q,c,i})=>`<div class='qr'><div><b>Ch ${c.n} · ${TYPES[q.type]}</b> ${chip(q.status)} <small>${q.difficulty} · ${q.mode=='individual'?'individual':'collaborative'} · ${q.explain=='now'?'explain now':'explain after chapter'}</small><p>${esc(q.text)}</p>${q.type!='open'?`<small>Answer: ${esc(q.options[q.correct]||'?')}</small>`:`<small>Concepts: ${esc((q.expected||[]).join(', '))}</small>`}</div>
  <div class='qa'><button class='g' data-a='qup' data-q='${q.id}'>↑</button><button class='g' data-a='qdn' data-q='${q.id}'>↓</button><button class='g' data-a='qed' data-q='${q.id}'>Edit</button><button class='g' data-a='qdel' data-q='${q.id}'>Delete</button><button data-a='qapp' data-q='${q.id}' ${q.status=='Approved'?'disabled':''}>Approve</button></div></div>`).join(''):'<p class="sub">No questions here yet.</p>')}
function findQ(id){const a=A();for(const c of a.chapters){const i=c.questions.findIndex(q=>q.id==id);if(i>=0)return{a,c,i,q:c.questions[i]}}return null}
function qform(a){const e=S.edit,q=e=='new'?{id:'',type:'mc',text:'',options:['','','',''],correct:0,difficulty:'Medium',mode:'individual',explain:'now',hint:'',explanation:'',reference:'',expected:[],rubric:'',context:'',ch:S.qch||1}:{...findQ(e).q,ch:findQ(e).c.n};
 const ops=[0,1,2,3].map(i=>`<div class='orow'><input type='radio' name='qfc' value='${i}' ${q.correct==i?'checked':''}><input id='qfo${i}' placeholder='Option ${i+1}' value='${esc(q.options[i]||'')}'></div>`).join('');
 return`<div class='qf'><h4>${e=='new'?'New question':'Edit question'}</h4>
 <div class='two2'><div><label>Chapter</label><select id='qf-ch'>${a.chapters.map(c=>`<option value='${c.n}' ${q.ch==c.n?'selected':''}>${c.n}. ${esc(c.title)}</option>`).join('')}</select></div><div><label>Type</label><select id='qf-type' data-f='qftype'>${opt(Object.entries(TYPES),q.type)}</select></div></div>
 <label>Question</label><textarea id='qf-text' rows='2'>${esc(q.text)}</textarea>
 <label>Story context <small>(scenario)</small></label><input id='qf-ctx' value='${esc(q.context||'')}'>
 <div id='qf-mc'><label>Options (2–4) · select the correct one</label>${ops}</div>
 <div id='qf-op'><label>Expected concepts <small>(comma separated)</small></label><input id='qf-exp' value='${esc((q.expected||[]).join(', '))}'><label>Rubric</label><textarea id='qf-rub' rows='2'>${esc(q.rubric||'')}</textarea></div>
 <label>Explanation</label><textarea id='qf-expl' rows='2'>${esc(q.explanation||'')}</textarea>
 <div class='two2'><div><label>Hint (optional)</label><input id='qf-hint' value='${esc(q.hint||'')}'></div><div><label>Reference</label><input id='qf-ref' value='${esc(q.reference||'')}'></div></div>
 <div class='two3'><div><label>Difficulty</label><select id='qf-diff'>${opt(DIFF,q.difficulty)}</select></div><div><label>Answered</label><select id='qf-mode'>${opt([['individual','Individually'],['collab','Collaboratively (+individual answer)']],q.mode)}</select></div><div><label>Explanation shown</label><select id='qf-tim'>${opt([['now','Immediately'],['chapter','After chapter']],q.explain)}</select></div></div>
 <div class='msg' id='qf-m'></div><p><button data-a='qsave'>Save question</button> <button class='g' data-a='qcancel'>Cancel</button></p></div>`}
function toggleType(){const t=$('#qf-type');if(!t)return;$('#qf-mc').style.display=t.value=='open'?'none':'';$('#qf-op').style.display=t.value=='open'?'':'none'}
async function onChange(e){const t=e.target,f=t.dataset.f,a=A(),c=a.chapters[(+t.dataset.c||1)-1];if(!f)return;
 if(f=='subject'){S.subject=t.value;S.edit=null;S.msg='';return draw()}
 if(f=='qch'){S.qch=+t.value;return draw()}
 if(f=='qftype')return toggleType();
 if(f=='ctitle')c.title=t.value;if(f=='cbg'){c.bg=t.value;c.bgLock=1}if(f=='cmu')c.music=t.value;if(f=='cmis')c.mission=t.value;
 if(f=='clines')c.lines=t.value.split('\n').filter(l=>l.trim()).map(l=>{const[s,...r]=l.split('|'),sp=s.trim(),np=(a.npcs||[]).find(n=>n.name==sp);return r.length?{s:sp,e:np&&np.emoji,t:r.join('|').trim()}:{s:'Narrator',t:l.trim()}});
 AdvStore.touch(a,c);S.msg='Edited. This chapter is now “Needs Review”.';S.ok=1;draw()}
async function onClick(e){const b=e.target.closest('button');if(!b)return;audioManager.sfx('click');const d=b.dataset,a=A();
 if(d.tab2){S.tab=d.tab2;S.msg='';return draw()}
 const c=a.chapters[(+d.c||1)-1];
 if(d.a=='gen'){S.busy=true;draw();const g=await getAI().generateStory({subject:S.subject});AdvStore.set(S.subject,g);S.busy=false;S.msg='AI generated a 4-chapter draft. Review every chapter before publishing.';S.ok=1;return draw()}
 if(d.a=='preview'){close();return EQGame.start(S.subject,{preview:true})}
 if(d.a=='publish'){const er=AdvStore.publish(a);S.msg=er||'Published! Students can now join this adventure.';S.ok=!er;if(!er)audioManager.sfx('complete');return draw()}
 if(d.a=='capp'){const er=AdvStore.approveChapter(a,c);S.msg=er||'Chapter '+c.n+' approved.';S.ok=!er;return draw()}
 if(d.a=='cregen'){const r=await getAI().generateChapter(MOCK_ADVENTURES[S.subject]?{chapters:MOCK_ADVENTURES[S.subject].chapters}:a,c.n);r.status='AI Generated';r.questions.forEach(q=>q.status='AI Generated');a.chapters[c.n-1]=r;AdvStore.refresh(a);AdvStore.persist();S.msg='Chapter '+c.n+' regenerated as a draft.';S.ok=1;return draw()}
 if(d.a=='reset'){AdvStore.reset();S.msg='Demo data reset.';S.ok=1;return draw()}
 if(d.a=='qnew'){S.edit='new';draw();return toggleType()}
 if(d.a=='qcancel'){S.edit=null;return draw()}
 if(d.a=='qed'){S.edit=d.q;draw();return toggleType()}
 if(d.a=='qdel'){const f=findQ(d.q);f.c.questions.splice(f.i,1);AdvStore.touch(a,f.c);S.msg='Question deleted.';S.ok=1;return draw()}
 if(d.a=='qup'||d.a=='qdn'){const f=findQ(d.q),j=f.i+(d.a=='qup'?-1:1);if(j>=0&&j<f.c.questions.length){const L=f.c.questions;[L[f.i],L[j]]=[L[j],L[f.i]];AdvStore.touch(a,f.c)}return draw()}
 if(d.a=='qapp'){const f=findQ(d.q),er=AdvStore.approveQ(a,f.q);S.msg=er||'Question approved.';S.ok=!er;return draw()}
 if(d.a=='qai'){const n=S.qch||2,qs=await getAI().generateQuestions({subject:S.subject,count:2,offset:n});a.chapters[n-1].questions.push(...qs);AdvStore.touch(a,a.chapters[n-1]);S.msg='AI drafted 2 questions for Chapter '+n+' (not approved yet).';S.ok=1;return draw()}
 if(d.a=='qsave')return saveQ(a)}
function saveQ(a){const g=id=>$('#'+id).value,type=g('qf-type'),ch=+g('qf-ch');let opts=[],correct=0;
 if(type!='open'){const raw=[0,1,2,3].map(i=>g('qfo'+i).trim()),sel=+(document.querySelector('input[name=qfc]:checked')||{value:0}).value;raw.forEach((v,i)=>{if(v){if(i==sel)correct=opts.length;opts.push(v)}})}
 const old=S.edit!='new'?findQ(S.edit):null,q={...(old?old.q:{}),id:old?old.q.id:'q'+Date.now().toString(36),type,text:g('qf-text').trim(),context:g('qf-ctx'),options:opts,correct,explanation:g('qf-expl').trim(),hint:g('qf-hint'),reference:g('qf-ref'),difficulty:g('qf-diff'),mode:g('qf-mode'),explain:g('qf-tim'),
  expected:g('qf-exp').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean),rubric:g('qf-rub'),objective:old?old.q.objective:'',status:'Draft'};
 if(type=='open'){q.options=[];q.correct=0}
 const er=AdvStore.validate(q);if(er){const m=$('#qf-m');m.className='msg e';m.textContent=er;return}
 if(old)old.c.questions.splice(old.i,1);a.chapters[ch-1].questions.push(q);q.status='Needs Review';AdvStore.touch(a,a.chapters[ch-1]);S.edit=null;S.msg='Question saved. Approve it to include it in the adventure.';S.ok=1;audioManager.sfx('reward');draw()}

/* ---------- Shared AI Dungeon Assistant chat (used in Studio and in gameplay) ---------- */
const QUICK=['Generate three questions for Chapter 2','Make Chapter 3 harder','Suggest a background','Add an NPC who explains the concept'];
function mountAssistant(root,ctxFn,onChange2){root.innerHTML=`<div class='achat'></div><div class='aqk'>${QUICK.map(q=>`<button class='g' data-q='${esc(q)}'>${esc(q)}</button>`).join('')}</div><form class='asf'><input name='m' placeholder='Tell your co-Dungeon Master what to do…' autocomplete='off'><button>Send</button></form>`;
 const box=root.querySelector('.achat');
 const paint=()=>{box.innerHTML=(chat.length?chat:[{r:'ai',t:'I’m your co-Dungeon Master. I draft; you decide. Ask me to generate questions, change difficulty, suggest NPCs or backgrounds.'}]).map((m,i)=>`<div class='am ${m.r}'><div>${esc(m.t)}</div>${m.action&&!m.done?actionUI(m.action,i):''}${m.done?'<small>✓ Applied as a draft (needs your approval)</small>':''}</div>`).join('');box.scrollTop=box.scrollHeight};
 paint();root._paint=paint;root._ctx=ctxFn;root._cb=onChange2;
 root.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.q){return sendText(root,b.dataset.q)}
  if(b.dataset.apply!=null){const m=chat[+b.dataset.apply];applyAction(m.action,ctxFn());m.done=true;audioManager.sfx('reward');paint();onChange2&&onChange2()}
  if(b.dataset.dismiss!=null){chat[+b.dataset.dismiss].action=null;paint()}};
 root.querySelector('form').onsubmit=ev=>{ev.preventDefault();ev.stopPropagation();const i=ev.target.querySelector('input');const v=i.value.trim();i.value='';if(v)sendText(root,v)}}
function actionUI(a,i){const label={questions:'Add '+(a.questions||[]).length+' draft question(s) to Chapter '+a.ch,difficulty:'Set Chapter '+a.ch+' questions to Hard',npc:'Add NPC line to Chapter '+a.ch,bg:'Use this background for Chapter '+a.ch}[a.type];
 const prev=a.type=='questions'?a.questions.map(q=>`<li>${esc(q.text)}</li>`).join(''):'';return`${prev?`<ul>${prev}</ul>`:''}<div><button data-apply='${i}'>${label}</button> <button class='g' data-dismiss='${i}'>Dismiss</button></div>`}
async function sendText(root,text){chat.push({r:'me',t:text});root._paint();const ctx=root._ctx(),r=await getAI().assistantReply(text,ctx);chat.push({r:'ai',t:r.text,action:r.action});audioManager.sfx('open');root._paint()}

function applyAction(a,ctx){const adv=AdvStore.get(ctx.subject),c=adv.chapters[(a.ch||1)-1];if(!c)return;
 if(a.type=='questions'){a.questions.forEach(q=>{q.status='AI Generated';c.questions.push(q)})}
 if(a.type=='difficulty'){c.questions.forEach(q=>q.difficulty=a.level)}
 if(a.type=='npc'){const n=(adv.npcs||[])[0]||{name:'Guide',emoji:'🧙'};c.lines.push({s:n.name,e:n.emoji,t:'Let me explain the key idea in a simple way before you try: look at what changes and what stays the same.'})}
 if(a.type=='bg'){c.bg=a.bg;c.bgLock=1}
 AdvStore.touch(adv,c)}
window.EQStudio={open:openStudio,mountAssistant};
})();
