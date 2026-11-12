/* Mock chapters & scenes. Each scene points to an existing background asset id. */
const MOCK_STORIES={
chapters:[
 {id:'ch1',title:'Chapter 1 — The Archive Gate',subject:'Mathematics',scenes:['s1','s2']},
 {id:'ch2',title:'Chapter 2 — The Whispering Forest',subject:'Science',scenes:['s3']},
 {id:'ch3',title:'Chapter 3 — The Crown of Knowledge',subject:'History',scenes:['s4']}],
scenes:[
 {id:'s1',location:'Gates of Eduria',backgroundId:'castle',description:'The party reaches the sealed Archive Gate beneath the mountain castle.',characters:['swordsman','mage','archer','support'],dialogue:[{speaker:'Guide',text:'Only those who answer the riddle together may pass.'}],choices:[{id:'c1',text:'Solve the riddle together',next:'s2'}]},
 {id:'s2',location:'The Grand Archive',backgroundId:'castle',description:'Endless shelves of ancient books glow softly inside the castle walls.',characters:['mage','support'],dialogue:[{speaker:'Archivist',text:'Every answer you find lights a lantern.'}],choices:[{id:'c2',text:'Follow the glowing lantern',next:'s3'}]},
 {id:'s3',location:'Whispering Forest',backgroundId:'castle',description:'A misty forest path below the castle cliffs.',characters:['archer'],dialogue:[{speaker:'Owl',text:'The path forks. Choose with care.'}],choices:[]},
 {id:'s4',location:'Crown Hall',backgroundId:'castle',description:'The castle throne hall where the final challenge waits.',characters:['swordsman','mage','archer','support'],dialogue:[],choices:[]}]
};
