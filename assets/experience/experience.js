/* Shared mastery policy, persistence, and coordinated audiovisual feedback. */
(function(root){
  'use strict';
  const levelFor=n=>1+(Math.max(0,Math.floor(n))%10);
  const solvedCount=s=>Object.keys(s.solved||{}).length;
  function solve(s,qid){s.solved=s.solved||{};const fresh=!s.solved[qid];s.solved[qid]=true;return fresh;}
  function defer(s){const slide=s.slides[s.index];const qid=slide.q.question_id;s.questionAttempts[qid]=0;
    if(!s.slides.slice(s.index+1).some(x=>x.kind==='question'&&x.q.question_id===qid))s.slides.push({...slide});
    s.deferred=true;
  }
  const allSolved=s=>s.questions.every(q=>(s.solved||{})[q.question_id]);
  const api={levelFor,solvedCount,solve,defer,allSolved};
  if(typeof module==='object')module.exports=api;
  root.ClickExperience=api;
  if(!root.document)return;
  let level=1,count=0,currentUser='',ctx,master,musicBus,sfxBus,started=false,source,currentGain,epoch,trackToken=0;
  const buffers=new Map();let lastBloop=0;
  let prefs={music:true,sfx:true,musicVolume:.24,sfxVolume:.18};
  try{prefs={...prefs,...JSON.parse(localStorage.getItem('clickExperienceAudio')||'{}')};}catch(e){}
  for(const key of ['musicVolume','sfxVolume'])prefs[key]=Math.max(0,Math.min(1,Number(prefs[key])||0));
  function getContext(){if(!ctx){ctx=new (root.AudioContext||root.webkitAudioContext)();master=ctx.createGain();master.gain.value=.8;const limiter=ctx.createDynamicsCompressor();master.connect(limiter);limiter.connect(ctx.destination);musicBus=ctx.createGain();sfxBus=ctx.createGain();musicBus.connect(master);sfxBus.connect(master);volume();}return ctx;}
  function volume(){if(!ctx)return;const videoPlaying=[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.ended&&!v.muted);musicBus.gain.setTargetAtTime(prefs.music&&!document.hidden?prefs.musicVolume*(videoPlaying?.2:1):0,ctx.currentTime,.12);sfxBus.gain.setTargetAtTime(prefs.sfx?prefs.sfxVolume:0,ctx.currentTime,.03);}
  async function load(n){if(!buffers.has(n))buffers.set(n,fetch('assets/experience/music/level-'+n+'.wav').then(r=>{if(!r.ok)throw Error('Music could not load');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(e=>{buffers.delete(n);throw e;}));return buffers.get(n);}
  async function track(){if(!started)return;const token=++trackToken,n=level;try{const b=await load(n);if(token!==trackToken)return;const now=ctx.currentTime;epoch=epoch??now;const next=ctx.createBufferSource(),gain=ctx.createGain();next.buffer=b;next.loop=true;next.connect(gain);gain.connect(musicBus);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+1.1);next.start(now,(now-epoch)%b.duration);if(source){currentGain.gain.cancelScheduledValues(now);currentGain.gain.setValueAtTime(currentGain.gain.value,now);currentGain.gain.linearRampToValueAtTime(0,now+1.1);source.stop(now+1.15);}source=next;currentGain=gain;if(n<10)load(n+1).catch(()=>{});status();}catch(e){document.getElementById('experienceMusic').textContent='Retry music';started=false;}}
  async function unlock(){try{getContext();await ctx.resume();if(!started){started=true;await track();}volume();}catch(e){}}
  function tone(freq,delay=0,type='sine',length=.13){if(!ctx||!prefs.sfx||ctx.state!=='running')return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.7,t+length);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.65,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+length+.01);}
  function bloop(){const now=performance.now();if(now-lastBloop<90)return;lastBloop=now;tone(480+level*14);}
  function bounce(el,big=false){if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches||!el.animate)return;el.animate([{scale:'1'},{scale:big?'1.05':'.96',offset:.3},{scale:big?'1.02':'1.025',offset:.7},{scale:'1'}],{duration:big?430:260,easing:'cubic-bezier(.2,.8,.25,1)'});}
  function status(){const badge=document.getElementById('experienceBadge');if(badge)badge.textContent='Level '+level+(level===10?' · next: Level 1':' · next correct answer');const m=document.getElementById('experienceMusic');if(m){m.textContent=prefs.music?(started?'Music on':'Enable music'):'Music off';m.setAttribute('aria-pressed',String(!!prefs.music));}const f=document.getElementById('experienceSfx');if(f){f.textContent=prefs.sfx?'Effects on':'Effects off';f.setAttribute('aria-pressed',String(!!prefs.sfx));}}
  api.setCount=function(n,celebrate=false){count=Math.max(0,Math.floor(Number(n)||0));const next=levelFor(count),changed=level!==next;level=next;document.documentElement.dataset.level=String(level);status();if(changed){track();if(celebrate){[523,659,784,1047].forEach((f,i)=>tone(f,i*.09,'triangle',.22));bounce(document.getElementById('experienceBadge'),true);}}};
  api.advance=function(celebrate=true){const before=count;api.setCount(count+1,celebrate);if(currentUser&&count!==before)try{localStorage.setItem('clickExperienceLevel:'+currentUser,String(count));}catch(e){}};
  api.unlock=unlock;
  api.feedback=function(kind){const notes=kind==='correct'?[659,784,1047]:kind==='complete'?[523,659,784,1047]:[240];notes.forEach((f,i)=>tone(f,i*.085,'sine',.18));};
  api.view=function(){bloop();bounce(document.getElementById('testLessonCard'));};
  api.read=function(key){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&v.version===1?v.state:null;}catch(e){return null;}};
  api.write=function(key,s){try{const copy={...s,syncChain:undefined,syncError:undefined};localStorage.setItem(key,JSON.stringify({version:1,state:copy}));return true;}catch(e){return false;}};
  api.remove=key=>{try{localStorage.removeItem(key);}catch(e){}};
  api.restoreAtmosphere=function(user){currentUser=String(user||'guest');const active=api.read('clickMasteryActive:'+currentUser);let saved=0;try{saved=Number(localStorage.getItem('clickExperienceLevel:'+currentUser)||0);}catch(e){}api.setCount(Math.max(saved,solvedCount(active||{})));};
  function init(){
    const panel=document.createElement('aside');panel.className='experience-controls';panel.setAttribute('aria-label','Music and atmosphere');panel.innerHTML='<span id="experienceBadge" class="experience-badge" aria-live="polite"></span><button id="experienceMusic" type="button"></button><button id="experienceSfx" type="button"></button><details><summary aria-label="Volume settings">♫</summary><div class="experience-settings"><label>Music volume<input id="experienceMusicVolume" type="range" min="0" max="1" step=".01"></label><label>Effects volume<input id="experienceSfxVolume" type="range" min="0" max="1" step=".01"></label></div></details>';(document.getElementById('preferencesCard')||document.body).appendChild(panel);
    const save=()=>{try{localStorage.setItem('clickExperienceAudio',JSON.stringify(prefs));}catch(e){}volume();status();};
    document.getElementById('experienceMusic').onclick=()=>{if(!started){prefs.music=true;unlock();}else prefs.music=!prefs.music;save();};
    document.getElementById('experienceSfx').onclick=()=>{prefs.sfx=!prefs.sfx;save();};
    for(const [id,key] of [['experienceMusicVolume','musicVolume'],['experienceSfxVolume','sfxVolume']]){const el=document.getElementById(id);el.value=prefs[key];el.oninput=()=>{prefs[key]=Number(el.value);save();};}
    document.addEventListener('pointerdown',unlock,{once:true,passive:true});document.addEventListener('keydown',unlock,{once:true});
    document.addEventListener('click',e=>{const el=e.target.closest('button,a,summary,[role="button"],.lp-node,.exp-question-card,[data-term]');if(el&&!el.disabled){bloop();bounce(el);}},true);
    for(const event of ['play','pause','ended','volumechange'])document.addEventListener(event,volume,true);
    document.addEventListener('visibilitychange',volume);api.setCount(count);
  }
  document.documentElement.dataset.level='1';
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof window==='object'?window:globalThis);
