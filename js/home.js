/* MAIN LOBBY: heroes, scroll effects, join room */
$('#hg').innerHTML=H.map((h,i)=>`<div class="hc" data-i="${i}"><div class="art">${fig(h)}</div><h3>${h.n}</h3><em>${h.t}</em></div>`).join('');
addEventListener('scroll',()=>$('#nav').classList.toggle('s',scrollY>60));
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12}).observe&&$$('.rv').forEach(el=>{new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){el.classList.add('in');o.disconnect()}}),{threshold:.1}).observe(el)});
function tab(t){$$('.tabs button').forEach(b=>b.classList.toggle('a',b.dataset.tab==t));$('#tc').style.display=t=='code'?'':'none';$('#tl').style.display=t=='link'?'':'none';$('#jb').dataset.t=t}
$$('.tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
async function doJoin(code,nick,el){if(!nick)return msg(el,'Please enter a nickname.');$('#jb').disabled=1;msg(el,'Searching the realm…',1);
try{const r=await svc.join(code);if(r.players.length>=r.max)throw'Room is full.';msg(el,'Successfully joined!',1);setTimeout(()=>{$('#jb').disabled=0;el.className='msg';enter(r,nick,false)},700)}catch(e){$('#jb').disabled=0;msg(el,e)}}
$('#jb').onclick=()=>{const t=$('#jb').dataset.t||'code';let c=$('#jc').value;if(t=='link'){const m=$('#jl').value.trim().match(/\/join\/([A-Za-z0-9]+)\/?$/);if(!m)return msg($('#jm'),'Invalid invitation link.');c=m[1]}doJoin(c,$('#jn').value.trim(),$('#jm'))};
$('#qj').onclick=()=>{$('#jc').value=$('#qc').value;open('join');tab('code');$('#jn').focus()};
$$('.hc').forEach(c=>c.onclick=()=>{const h=H[c.dataset.i];$('#dc').innerHTML=`<div class="dg"><div><div class="art" style="height:440px">${fig(h)}</div></div>
<div><h2 style="text-align:left;color:${h.c==='#B89A62'?'#8a6f3a':h.c}">${h.n}</h2><div class="cz" style="color:var(--gold)">${h.t}</div><p><i>“${h.q}”</i></p><p>${h.bio}</p><p><b>Personality:</b> ${h.pers}</p>
<p><b>Equipment</b><br>${h.eq.map(e=>`<span class="chip">${e}</span>`).join('')}</p><p><b>Palette</b><br><span class="sw" style="background:${h.c}"></span><span class="sw" style="background:${h.c2}"></span><span class="sw" style="background:var(--cream)"></span></p>
<p><b>Unique Abilities</b></p><ul>${h.ab.map(a=>`<li>${a}</li>`).join('')}</ul></div></div>`;open('det')});
