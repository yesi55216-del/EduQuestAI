/* ROLE SELECTION (Dungeon Master / Player) + Create Adventure Room */
const rs=$('#rolesel');
$('#rs-th').innerHTML=H.map(h=>`<img src="${IMG[h.id]}" alt="">`).join('');
const showRoles=()=>rs.classList.remove('off'),hideRoles=()=>rs.classList.add('off');
const pickDM=()=>{hideRoles();open('create')},pickPL=()=>{hideRoles();open('join');tab('code')};
[['rs-dm',pickDM],['rs-pl',pickPL]].forEach(([id,fn])=>{const e=$('#'+id);e.onclick=fn;e.onkeydown=ev=>(ev.key=='Enter'||ev.key==' ')&&(ev.preventDefault(),fn())});
$('#rs-x').onclick=hideRoles;
$('#swr').onclick=e=>{e.preventDefault();showRoles()};
MOCK_STORIES.chapters.forEach(c=>$('#ch').insertAdjacentHTML('beforeend',`<option value="${c.id}">${c.title}</option>`));
let smode='teacher';
$$('.mode').forEach(m=>m.onclick=()=>{smode=m.dataset.m;$$('.mode').forEach(x=>x.classList.toggle('a',x===m))});
$('#cb').onclick=async()=>{const nick=$('#pn').value.trim(),name=$('#rn').value.trim();
 if(!name||!nick)return msg($('#cm'),'Please enter a room name and your Dungeon Master name.');
 const chap=MOCK_STORIES.chapters.find(c=>c.id==$('#ch').value);
 $('#cb').disabled=1;msg($('#cm'),'Forging your adventure…',1);
 const r=await svc.create({name,nick,max:+$('#mp').value,min:1,level:$('#lvl').value,subject:$('#sb').value,chapter:chap.id,chapterTitle:chap.title,mode:smode,objectives:$('#obj').value.trim()});
 save(r);msg($('#cm'),'Adventure created! Code '+r.code,1);
 setTimeout(()=>{$('#cb').disabled=0;$('#cm').className='msg';enter(r,nick,true)},900)};
