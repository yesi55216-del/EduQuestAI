/* Mock room service (swap for real API / Socket.IO later) */
const rnd=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const load=()=>JSON.parse(localStorage.getItem('eq_rooms')||'{}');
function save(r){try{const a=load();a[r.code]=r;localStorage.setItem('eq_rooms',JSON.stringify(a))}catch(e){}}
// mock service layer (swap for real API later)
const svc={create:o=>new Promise(r=>setTimeout(()=>r({id:'room_'+rnd(),code:'EQ'+rnd()+rnd().slice(0,2),...o,players:[{name:o.nick,role:null,ready:true,host:true,dm:true}]}),900)),
join:code=>new Promise((res,rej)=>setTimeout(()=>{code=code.trim().toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(code))return rej('Invalid room code.');
if(code=='FULL01')return rej('Room is full.');
if(MOCK_ROOMS[code])return res(JSON.parse(JSON.stringify(MOCK_ROOMS[code])));
let r=load()[code];r?res(r):rej('Room not found.')},800))};
