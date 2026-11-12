/* Generic modal wiring. Delegated on document so modals created LATER (Studio, dashboards...) get a working X, backdrop click and Esc. */
$$('[data-open]').forEach(b=>b.onclick=()=>{open(b.dataset.open);if(b.dataset.tab)tab(b.dataset.tab)});
document.addEventListener('click',e=>{const t=e.target;if(t.closest&&t.closest('[data-close]'))return close();if(t.classList&&t.classList.contains('ov'))close()});
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&$$('.ov.o').length)close()});
