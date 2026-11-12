/* NPC portraits (assets/npcs/*.png, made by tools/make_npcs.py - replace any PNG with your own art, same file name).
   NPCS.find(speakerName, emoji) -> {key,name,title,color,img,emoji}. Unknown speakers (e.g. names a teacher types in Studio) get a hooded traveller. */
const NPC_LIST=[
{k:'sage axiom',img:'sage-axiom',title:'Keeper of Numbers',color:'#5b8def'},
{k:'archivist fenwick',img:'archivist-fenwick',title:'Archivist of Scrolls',color:'#f0933a'},
{k:'queen vera',img:'queen-vera',title:'Queen of Numeria',color:'#c04a7a'},
{k:'null wraith',img:'null-wraith',title:'Eraser of Numbers',color:'#8a5cff'},
{k:'keeper ember',img:'keeper-ember',title:'Keeper of the Flame',color:'#ff7a2a'},
{k:'dr. lumen the golem',img:'dr-lumen',title:'Golem Engineer',color:'#ffcc3d'},
{k:'tide spirit nyra',img:'tide-nyra',title:'Spirit of the Tides',color:'#3cc6e8'},
{k:'chronicler maren',img:'chronicler-maren',title:'Royal Chronicler',color:'#6fae6a'},
{k:'general tiberan',img:'general-tiberan',title:'Ghost of the Old War',color:'#7fb4d6'},
{k:'archivist corvin',img:'archivist-corvin',title:'Keeper of the Candle',color:'#b07cff'},
{k:'scribe lyra',img:'scribe-lyra',title:'Scribe of Lexara',color:'#38b6a8'},
{k:'silent dragon',img:'silent-dragon',title:'The Dragon of Words',color:'#46c9a8'},
{k:'lorekeeper quill',img:'lorekeeper-quill',title:'Lorekeeper',color:'#c4546a'}];
const NPCS={
 norm:n=>String(n||'').toLowerCase().replace(/\(.*?\)/g,'').replace(/^the\s+/,'').replace(/\s+/g,' ').trim(),
 isNarrator:n=>!n||/^narrator$/i.test(String(n).trim()),
 find(name,emoji){const k=this.norm(name),n=NPC_LIST.find(x=>x.k==k||k.startsWith(x.k)||x.k.startsWith(k)&&k.length>4);
  return n?{key:n.k,name:String(name).replace(/\(.*?\)/g,'').trim(),title:n.title,color:n.color,img:'assets/npcs/'+n.img+'.png',emoji}
   :{key:k,name:String(name).trim(),title:'',color:'#b89a62',img:'assets/npcs/unknown.png',emoji}}};
