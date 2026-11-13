/* MAIN LOBBY: heroes, scroll effects, join room */
$('#hg').innerHTML=H.map((h,i)=>`<div class="hc" data-i="${i}"><div class="art">${fig(h)}</div><h3>${h.n}</h3><em>${h.t}</em></div>`).join('');
addEventListener('scroll',()=>$('#nav').classList.toggle('s',scrollY>60));
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12}).observe&&$$('.rv').forEach(el=>{new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){el.classList.add('in');o.disconnect()}}),{threshold:.1}).observe(el)});
function tab(t){$$('.tabs button').forEach(b=>b.classList.toggle('a',b.dataset.tab==t));$('#tc').style.display=t=='code'?'':'none';$('#tl').style.display=t=='link'?'':'none';$('#jb').dataset.t=t}
$$('.tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));

async function doJoin(code, nick, el) {
    if (!nick) return msg(el, 'Please enter a nickname.');

    $('#jb').disabled = 1;
    msg(el, 'Searching the realm…', 1);

    try {
        const r = await svc.join(code, nick);

        msg(el, 'Successfully joined!', 1);

        setTimeout(() => {
            $('#jb').disabled = 0;
            el.className = 'msg';
            enter(r, nick, false);
        }, 700);

    } catch (e) {
        $('#jb').disabled = 0;
        msg(el, e.message || String(e));
    }
}

$('#jb').onclick = () => {
    const nick = $('#jn').value.trim();
    const selectedTab = $('#jb').dataset.t || 'code';

    if (selectedTab === 'code') {
        const code = $('#jc').value.trim();

        if (!code) {
            return msg($('#jm'), 'Please enter a room code.');
        }

        doJoin(code, nick, $('#jm'));
    } else {
        const link = $('#jl').value.trim();

        if (!link) {
            return msg($('#jm'), 'Please enter an invitation link.');
        }

        try {
            const url = new URL(link);
            const code = url.pathname.split('/').filter(Boolean).pop();

            if (!code) {
                return msg($('#jm'), 'Invalid invitation link.');
            }

            doJoin(code, nick, $('#jm'));
        } catch (error) {
            msg($('#jm'), 'Please enter a valid invitation link.');
        }
    }
};