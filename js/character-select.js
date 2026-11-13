/* CHARACTER SELECTION overlay */
function showDet(){const h=hn(pick);$('#sdet').innerHTML=h?`<h3 style='color:var(--gold)'>${h.n} — ${h.t}</h3><p>${h.bio}</p><p>${h.eq.map(e=>`<span class='chip'>${e}</span>`).join('')}</p>`:'';$$('#so4>div').forEach(d=>d.classList.toggle('a',d.dataset.r==pick));$('#sok').disabled=!pick}
function openSel(){pick=me.role;$('#so4').innerHTML=H.map(h=>`<div data-r='${h.id}'><div class='cf'><img src='${IMG[h.id]}' alt=''></div><div class='plat2'></div><b class='cz'>${h.n}</b><em>${h.t}</em><small>${h.pers}</small></div>`).join('');$$('#so4>div').forEach(d=>d.onclick=()=>{pick=d.dataset.r;showDet()});showDet();open('selm')}
$('#bch').onclick=openSel;
$('#sok').onclick = async () => {
    if (!pick) return;

    const selectedRole = pick;

    $('#sok').disabled = true;

    try {
        await svc.updateRole(room.code, selectedRole);

        me.role = selectedRole;
        me.ready = false;

        close();

        say(
            me.name + ' has chosen the path of the ' +
            hn(selectedRole).n + '!'
        );

        render();

    } catch (error) {
        console.error('Role selection failed:', error);
        toast(error.message || 'Could not save your role.');

    } finally {
        $('#sok').disabled = false;
    }
};
