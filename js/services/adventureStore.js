/* AdventureStore: working copy of the 4 adventures (localStorage). Teachers edit here; students only see Published ones.
   Statuses: Draft -> AI Generated -> Needs Review -> Approved -> Published. Any edit to approved/published content drops it back to Needs Review. */
const AdvStore=(()=>{
 const KEY='eq_adv_v1';let data=null;
 const seed=()=>{const d=JSON.parse(JSON.stringify(MOCK_ADVENTURES));Object.values(d).forEach(a=>{if(a.status=='Published')a.chapters.forEach(c=>{c.status='Published';c.questions.forEach(q=>q.status='Approved')})});return d};
 const all=()=>{if(data)return data;try{data=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!data||!data.Mathematics)data=seed();return data};
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}};
 const get=s=>all()[s]||all().Mathematics;
 const set=(s,a)=>{a.chapters=a.chapters.slice(0,4);all()[s]=a;persist()};            // never more than 4 chapters
 const reset=()=>{data=seed();persist()};
 const refresh=a=>{const st=a.chapters.map(c=>c.status);a.status=st.every(s=>s=='Published')?'Published':st.every(s=>s=='Approved'||s=='Published')?'Approved':st.some(s=>s=='Needs Review')?'Needs Review':a.status=='Draft'?'Draft':'AI Generated'};
 const touch=(a,c)=>{if(c)c.status='Needs Review';refresh(a);if(a.status=='Published')a.status='Needs Review';persist()};
 /* Validation: no answer key without support */
 const validate=q=>{if(!q.text||q.text.trim().length<8)return'Question text is too short.';
  if(q.type=='open'){if(!(q.expected||[]).length)return'Open-ended questions need expected concepts.';if(!q.rubric)return'Open-ended questions need an evaluation rubric.';return''}
  if((q.options||[]).length<2||q.options.length>4)return'Multiple-choice questions need 2–4 options.';
  if(!(q.correct>=0&&q.correct<q.options.length))return'Choose the correct answer.';
  if(!q.explanation||q.explanation.trim().length<5)return'Add an explanation that supports the answer key.';return''};
 const approveQ=(a,q)=>{const e=validate(q);if(e)return e;q.status='Approved';persist();return''};
 const approveChapter=(a,c)=>{for(const q of c.questions){const e=validate(q);if(e)return'Question “'+q.text.slice(0,40)+'…”: '+e}
  if(!c.questions.length)return'Add at least one question to this chapter first.';c.questions.forEach(q=>q.status='Approved');c.status='Approved';refresh(a);persist();return''};
 const publish=a=>{if(!a.chapters.every(c=>c.status=='Approved'||c.status=='Published'))return'Approve all four chapters first.';
  a.chapters.forEach(c=>c.status='Published');a.status='Published';persist();return''};
 return{all,get,set,reset,touch,refresh,validate,approveQ,approveChapter,publish,persist,canPlay:a=>a.status=='Published'}})();
