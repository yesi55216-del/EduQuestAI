/* AudioManager: music tracks + SFX with volume/mute, crossfade, no autoplay (starts only after the user enables audio).
   Tracks/SFX are referenced by ID (see AUDIO_TRACKS). If a track has `src`, that file is streamed;
   otherwise a tiny built-in WebAudio synth plays a placeholder drone so the demo works with no asset files.
   Preferences persist for the session (sessionStorage). */
const AUDIO_TRACKS={
 lobby:{label:'Fantasy Adventure Theme',notes:[196,246.9,293.7],wave:'triangle'},
 forest:{label:'Enchanted Forest',notes:[174.6,220,261.6],wave:'sine'},
 library:{label:'Ancient Library',notes:[146.8,220,277.2],wave:'sine'},
 dungeon:{label:'Dungeon Exploration',notes:[110,130.8,164.8],wave:'sawtooth',lp:500},
 challenge:{label:'Main Challenge',notes:[98,146.8,185],wave:'sawtooth',lp:700,pulse:.5},
 finale:{label:'Final Chapter',notes:[130.8,196,261.6,392],wave:'triangle',pulse:.25},
 victory:{label:'Victory',notes:[261.6,329.6,392,523.3],wave:'triangle'},
 reflect:{label:'Reflective',notes:[174.6,207.7,261.6],wave:'sine'}};
const AUDIO_SFX={click:[[660,.05]],choose:[[520,.06],[780,.08]],open:[[400,.06]],submit:[[500,.07],[500,.07]],correct:[[523,.09],[659,.09],[784,.16]],wrong:[[200,.18]],reward:[[784,.08],[988,.08],[1175,.16]],vote:[[440,.06],[550,.08]],chapter:[[330,.1],[440,.1],[554,.1],[659,.2]],complete:[[523,.12],[659,.12],[784,.12],[1047,.3]]};
class AudioManager{
 constructor(){let p={};try{p=JSON.parse(sessionStorage.getItem('eq_audio')||'{}')}catch(e){}
  this.s={on:false,master:false,music:false,sfx:false,mv:.5,sv:.6,...p};this.ctx=null;this.cur=null;this.id=null}
 save(){try{sessionStorage.setItem('eq_audio',JSON.stringify(this.s))}catch(e){}}
 enable(){if(!this.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return false;this.ctx=new A();this.mg=this.ctx.createGain();this.mg.connect(this.ctx.destination)}
  this.ctx.resume&&this.ctx.resume();this.s.on=true;this.save();this.apply();if(this.id)this.playMusic(this.id,true);return true}
 disable(){this.s.on=false;this.save();this.stopCur()}
 toggle(){this.s.on?this.disable():this.enable();return this.s.on}
 set(k,v){this.s[k]=v;this.save();this.apply()}
 audible(k){return this.s.on&&!this.s.master&&!this.s[k]}
 apply(){if(this.cur)this.cur.g.gain.value=this.audible('music')?this.s.mv*.25:0}
 stopCur(){if(!this.cur)return;const c=this.cur;this.cur=null;try{c.g.gain.linearRampToValueAtTime(0,this.ctx.currentTime+.8);setTimeout(()=>{c.stop&&c.stop()},900)}catch(e){}}
 playMusic(id,force){this.id=id;if(!this.s.on||!this.ctx)return;if(this.cur&&this.cur.id==id&&!force)return;this.stopCur();
  const t=AUDIO_TRACKS[id];if(!t)return;
  if(t.src){const a=new Audio(t.src);a.loop=true;a.volume=this.audible('music')?this.s.mv:0;a.play().catch(()=>{});this.cur={id,g:{gain:{set value(v){a.volume=Math.min(1,v*4)},linearRampToValueAtTime(){}}},stop:()=>a.pause()};return}
  const ctx=this.ctx,g=ctx.createGain();g.gain.value=0;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=t.lp||1400;g.connect(lp);lp.connect(this.mg);
  const oscs=t.notes.map((f,i)=>{const o=ctx.createOscillator();o.type=t.wave;o.frequency.value=f;o.detune.value=i*4;o.connect(g);o.start();return o});
  let lfo=null;if(t.pulse){lfo=ctx.createOscillator();const lg=ctx.createGain();lfo.frequency.value=t.pulse;lg.gain.value=.4;lfo.connect(lg);lg.connect(lp.frequency);lg.gain.value=300;lfo.start()}
  this.cur={id,g,stop:()=>{oscs.forEach(o=>{try{o.stop()}catch(e){}});lfo&&lfo.stop();g.disconnect()}};
  g.gain.linearRampToValueAtTime(this.audible('music')?this.s.mv*.25:0,ctx.currentTime+1.2)}
 sfx(name){if(!this.audible('sfx')||!this.ctx)return;const seq=AUDIO_SFX[name];if(!seq)return;let t=this.ctx.currentTime;
  seq.forEach(([f,d])=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(this.s.sv*.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.mg);o.start(t);o.stop(t+d);t+=d*.9})}
}
const audioManager=new AudioManager();
