/* Small helpers: DOM, escaping, toast, clipboard, modal open/close */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const msg=(el,t,k)=>{el.className='msg '+(k?'k':'e');el.textContent=t};
function toast(t){const e=$('#tt');e.textContent=t;e.style.display='block';clearTimeout(lb.tt);lb.tt=setTimeout(()=>e.style.display='none',2200)}
const cp=(t,b)=>{toast('Copied to clipboard!');navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{});const o=b.textContent;b.textContent='Copied!';setTimeout(()=>b.textContent=o,1200)};
const open=id=>$('#'+id).classList.add('o'),close=()=>$$('.ov').forEach(o=>{if(o.id=='selm'&&o.classList.contains('o')&&!o.classList.contains('out')){o.classList.add('out');setTimeout(()=>o.classList.remove('o','out'),300)}else if(o.id!='selm')o.classList.remove('o')});
