/* the daily practice. v0.3 — local-first Chrome prototype. No animation or network dependencies. */
(function(){'use strict';
var $=function(id){return document.getElementById(id)};
var screen=$('screen'),status=$('status');
var STORAGE_KEY='tdp.v03.data';
var today=function(){var d=new Date();return [d.getFullYear(),('0'+(d.getMonth()+1)).slice(-2),('0'+d.getDate()).slice(-2)].join('-')};
var defaults={version:3,ink:false,habits:{},journals:{},notes:{},bookshelfNote:'',bookmarks:[{name:'conjuring archive',url:'https://www.conjuringarchive.com/'},{name:'ask alexander',url:'https://askalexander.org/'},{name:'the magic café',url:'https://www.themagiccafe.com/forums/index.php'}],feeds:[],articles:[],savedArticles:[],tasks:[],reminders:[],stacks:[],scripts:[],knowledge:[],reviews:{},lastBookId:null};
function clone(a){return JSON.parse(JSON.stringify(a))}
function load(){var d=clone(defaults);try{var saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');Object.keys(saved).forEach(function(k){if(Object.prototype.hasOwnProperty.call(d,k))d[k]=saved[k]})}catch(e){/* storage disabled */}return d}
var store=load();
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store));return true}catch(e){notify('Browser storage unavailable or full. Export a backup.');return false}}
function notify(message){status.textContent=message;status.hidden=false}
function clearNotice(){status.hidden=true;status.textContent=''}
function el(tag,cls,text,parent){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined&&text!==null)n.textContent=String(text);if(parent)parent.appendChild(n);return n}
function btn(text,fn,cls,parent){var n=el('button',cls||'btn',text,parent);n.type='button';n.addEventListener('click',fn);return n}
function line(parent){el('hr','rule',null,parent)}
function small(text,parent,cls){return el('p',cls||'hint',text,parent)}
function heading(title,path){var d=el('div','section-header',null,screen),x=el('div','',null,d);el('span','eyebrow',path||'the daily practice. / v0.3',x);el('h1','',title,x);btn('← home',home,'small-link',d);return d}
function field(label,value,placeholder,parent,multiline){el('label','field-label',label,parent);var e=el(multiline?'textarea':'input','field',null,parent);if(!multiline)e.type='text';e.value=value||'';e.placeholder=placeholder||'';return e}
function filePicker(label,accept,cb,parent){var a=el('label','field-label',label,parent),i=el('input','field',null,parent);i.type='file';i.accept=accept;i.addEventListener('change',function(){if(i.files&&i.files.length)cb(i.files)});return i}
function buttons(parent,items){var row=el('div','button-row',null,parent);items.forEach(function(item){btn(item[0],item[1],item[2]||'btn',row)});return row}
function block(title,desc,callback,parent,num,dark){var b=btn('',callback,'panel'+(dark?' dark':''),parent);el('span','panel-num',num||'→',b);el('strong','',title,b);el('small','',desc,b);return b}
var route={name:'home'},trail=[];
function go(name,data){trail.push(route);route={name:name,data:data||{}};render()}
function back(){if(trail.length){route=trail.pop();render()}else home()}
function home(){trail=[];route={name:'home'};render()}
function banner(title,caption,callback){var b=btn('',callback,'desk-banner',screen);b.setAttribute('aria-label','open '+title);el('strong','',title,b);if(caption)el('small','',caption,b);el('em','', '→',b);return b}
function label(name){var d=el('div','label-bar',null,screen);el('h2','',name,d)}
function sectionTitle(name,desc){heading(name,desc)}
var navMap={home:home,desk:function(){go('desk')},library:function(){go('library')},browser:function(){go('browser')}};
Object.keys(navMap).forEach(function(key){$('nav-'+key).addEventListener('click',navMap[key])});$('home-mark').addEventListener('click',home);
function setInk(flag){var changed=store.ink!==flag;store.ink=flag;document.body.classList.toggle('ink',flag);$('toggle-ink').textContent=flag?'editorial ink':'clean ink';$('toggle-ink').setAttribute('aria-pressed',flag?'true':'false');if(changed)persist()}
$('toggle-ink').addEventListener('click',function(){setInk(!store.ink)});setInk(store.ink);
function dayRecord(){var key=today();if(!store.habits[key])store.habits[key]={read:false,meditate:false,study:false,journal:false,reading:{},growth:{}};return store.habits[key]}
function done(name){return !!dayRecord()[name]}
function complete(name){var h=dayRecord();if(!h[name]){h[name]=true;persist();notify(name+' completed. small actions count.')}else persist()}

/* Local-only, low-detail line icons: no icon font, web dependency, or animation. */
var ICONS={
 'read':'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
 'meditate':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/>',
 'study':'<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 12v5c4 3 8 3 12 0v-5M22 9v7"/>',
 'journal':'<path d="M3 21h6l12-12-6-6L3 15v6Z"/><path d="m13 5 6 6M3 21l5-2"/>',
 'recall':'<path d="M12 5c-3-4-8-2-8 2-3 1-3 6 0 7-1 4 3 6 6 4v-5M12 5c3-4 8-2 8 2 3 1 3 6 0 7 1 4-3 6-6 4v-5M12 3v18M8 8l3 2M16 8l-3 2M8 16l3-2M16 16l-3-2"/>',
 'create':'<path d="M9 18h6M10 22h4M8 15c0-2-4-4-4-8a8 8 0 0 1 16 0c0 4-4 6-4 8v2H8v-2Z"/>',
 'move':'<path d="M5 3c-2 2-2 6 0 8l3 1 3-2V5L8 2 5 3ZM16 12l4 1 2 4-2 4-4 1-2-4 2-6ZM4 16l5 2M17 8l3-1"/>',
 'connect':'<path d="M20 5a5.6 5.6 0 0 0-8 0 5.6 5.6 0 0 0-8 0c-3 4 0 8 8 15 8-7 11-11 8-15Z"/>',
 'finances':'<rect x="2" y="5" width="20" height="15" rx="1"/><path d="M2 8h20M17 12h5v5h-5a2.5 2.5 0 0 1 0-5Z"/>',
 'rest':'<path d="M20 16a9 9 0 0 1-12-12A9 9 0 1 0 20 16Z"/>',
 'library':'<path d="M3 4v16M8 4v16M3 4h5M3 20h5M8 4h5v16H8M16 6l4-1 3 15-4 1-3-15Z"/>',
 'timer':'<circle cx="12" cy="13" r="9"/><path d="M12 4V1M8 1h8M12 13V7M12 13l4 2"/>',
 'rss':'<circle cx="5" cy="19" r="2"/><path d="M3 11a10 10 0 0 1 10 10M3 4a17 17 0 0 1 17 17"/>',
 'browser':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a16 16 0 0 1 0 18M12 3a16 16 0 0 0 0 18"/>',
 'calendar':'<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 2v6M16 2v6M8 14h2M14 14h2M8 18h2"/>',
 'notifications':'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3ZM10 20h4"/>',
 'eye':'<path d="M2 12q10-12 20 0-10 12-20 0Z"/><circle cx="12" cy="12" r="4"/>'
};
function icon(name,owner,cls){var span=el('span',cls||'glyph',null,owner);span.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||ICONS.eye)+'</svg>';return span}

function renderHome(){
 var h=dayRecord(),count=['read','meditate','study','journal'].filter(function(k){return !!h[k]}).length;
 var intro=el('div','home-summary',null,screen);el('span','home-kicker','issue no. 001 / an operating system for attention',intro);el('span','home-progress',count+'/4 today',intro);
 label('your daily anchors');var grid=el('div','anchor-grid',null,screen);
 [
 ['read','two pages','read'],['meditate','two minutes','meditate'],['study','one concept','study'],['journal','one sentence','journal']
 ].forEach(function(a){var t=btn('',function(){go(a[2])},'anchor-tile anchor-'+a[0]+(done(a[0])?' is-complete':''),grid);t.setAttribute('aria-label',a[0]+(done(a[0])?', completed today':', '+a[1]));
 var img=el('span','image',null,t);img.style.backgroundImage="url('assets/"+a[0]+".jpg')";
 var top=el('span','tile-top',null,t);icon(a[0],top,'anchor-icon');el('span',done(a[0])?'check-badge':'undone',done(a[0])?'✓':'',top);
 var main=el('span','tile-main',null,t);el('strong','tile-name',a[0],main);el('span','tile-caption',done(a[0])?'completed today':a[1],main)});
 label('growth & wellbeing');var growth=el('div','growth-grid',null,screen);
 [['recall','recall'],['create','create'],['move','move'],['connect','connect'],['finances','finances'],['rest','rest']].forEach(function(x){var b=btn('',function(){go(x[1])},'mini-tile',growth);icon(x[0],b,'tile-icon');el('span','',x[0],b)});
 banner("the magician's desk.",'',function(){go('desk')});
 label('tools & resources');var tools=el('div','tools-grid',null,screen);
 [['library','library'],['timer','timer'],['rss','rss'],['browser','browser'],['calendar','calendar'],['notifications','notifications']].forEach(function(x){var b=btn('',function(){go(x[1])},'utility-tile',tools);icon(x[0],b,'tile-icon');el('span','',x[0],b)});
}
function renderDesk(){heading("the magician's desk.",'private workspace / practice before performance');small('one effect. one improvement. pick up exactly where you left off.',screen,'copy');
 var grid=el('div','panel-grid',null,screen);
 block('stack trainer','card ↔ position / neighbors / custom tarot',function(){go('stacks')},grid,'01 / memory systems',true);
 block('script rehearsal','next line / beats / blocking / cues',function(){go('scripts')},grid,'02 / performance');
 block('effect knowledge','methods / history / reset / contingencies',function(){go('knowledge')},grid,'03 / knowledge');
 block('repertoire','working routines and effect dossiers',function(){go('notebook',{key:'repertoire',title:'repertoire'})},grid,'04 / dossier');
 block('show builder','running order and transitions',function(){go('notebook',{key:'showbuilder',title:'show builder'})},grid,'05 / programming');
 block('prop inventory','packing list, backups, repairs',function(){go('notebook',{key:'props',title:'prop inventory'})},grid,'06 / logistics');
 block('research','references, citations and source notes',function(){go('notebook',{key:'research',title:'research'})},grid,'07 / archives');
 block('performance log','what worked, what to refine',function(){go('notebook',{key:'performancelog',title:'performance log'})},grid,'08 / field notes');
 buttons(screen,[['open book library',function(){go('library')}],['research browser',function(){go('browser')}]]);
}
function renderStudy(){heading('study.','anchor / one concept');small('a successful recall counts as today’s study habit.',screen,'copy');var grid=el('div','panel-grid',null,screen);
 block('flashcards','effect knowledge / self-assessment',function(){go('knowledge')},grid,'01');
 block('stack trainer','practice card positions and neighbors',function(){go('stacks')},grid,'02');
 block('script rehearsal','learn lines and performance beats',function(){go('scripts')},grid,'03');
 block('one concept','record something you understood',function(){go('concept')},grid,'04');
}
function renderConcept(){heading('one concept.','study / a small action');var i=field('what did you learn?','','one idea in your own words',screen,true);buttons(screen,[['save & complete study',function(){if(i.value.trim().length<6){notify('Add a few words about the idea first.');return}var date=today();if(!store.notes.studyConcepts)store.notes.studyConcepts={};if(!store.notes.studyConcepts[date])store.notes.studyConcepts[date]=[];store.notes.studyConcepts[date].push(i.value.trim());complete('study');go('study')}]]);}
function renderJournal(){heading('journal.','anchor / one sentence');small('write a sentence. save it. the home screen will quietly mark journal complete.',screen,'copy');
 var saved=store.journals[today()]||'',i=field('today’s entry',saved,'what happened, or what did you notice?',screen,true);i.rows=9;
 buttons(screen,[['save entry',function(){var value=i.value.trim();store.journals[today()]=value;persist();if(/[.!?](?:\s|$)/.test(value)&&value.split(/\s+/).length>=2)complete('journal');else notify('Entry saved. Add a complete sentence with punctuation to earn the checkmark.')} ,'btn primary'],['return home',home]]);
 small('an entry can be saved without being marked complete. a period, question mark, or exclamation mark can finish a sentence.',screen);
}
function renderGrowth(kind){heading(kind+'.','growth & wellbeing / optional');
 if(kind==='recall'){small('return to something you’ve learned, without rereading it first.',screen,'copy');buttons(screen,[['review knowledge',function(){go('knowledge')}],['stack drill',function(){go('stacks')}],['script rehearsal',function(){go('scripts')}]]);return}
 if(kind==='rest'){small('a moment of quiet is sufficient. no score required.',screen,'copy');buttons(screen,[['meditate for 2 minutes',function(){go('meditate')}],['open timer',function(){go('timer')}]]);return}
 if(kind==='move'){small('move at your own pace. the Kindle can stay on a static screen.',screen,'copy');buttons(screen,[['start a 2-minute timer',function(){startTimer('move',120);go('timing')}]]);return}
 var prompts={create:'one idea you could make or develop.',connect:'one person you could check in with.',finances:'one expense, upcoming bill, or decision worth reviewing.'};small(prompts[kind],screen,'copy');var i=field('private note',store.notes[kind]||'','one line is plenty',screen,true);buttons(screen,[['save note',function(){store.notes[kind]=i.value;persist();notify('Saved locally.')}],['mark today',function(){dayRecord().growth[kind]=true;persist();notify(kind+' marked today.')}]]);
}
function renderNotebook(){var d=route.data,key=d.key,title=d.title||key;heading(title+'.',"magician's desk / private field notes");small('notes stay in this browser. no secrets appear on the home screen.',screen);var i=field('working notes',store.notes['desk:'+key]||'','write, revise, organize...',screen,true);i.rows=16;buttons(screen,[['save notes',function(){store.notes['desk:'+key]=i.value;persist();notify('Notes saved locally.')}],['back to desk',function(){go('desk')}]]);}
/* Timer: wall clock is authoritative; no per-second DOM updates. */
var clock=null,clockInterval=null,displayNode=null,clockNote=null;
function startTimer(kind,seconds){clock={kind:kind,duration:seconds||120,elapsed:0,startedAt:0,running:false,finished:false,bucket:null};displayNode=null;clockNote=null}
function secondsElapsed(){if(!clock)return 0;return clock.elapsed+(clock.running?Math.max(0,Math.floor((Date.now()-clock.startedAt)/1000)):0)}
function formatTime(s){s=Math.max(0,Math.floor(s));return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}
function stopClockInterval(){if(clockInterval){clearInterval(clockInterval);clockInterval=null}}
function tickClock(force){if(!clock)return;var elapsed=secondsElapsed();var current=clock.kind==='stopwatch'?elapsed:Math.max(0,clock.duration-elapsed);var size=Math.max(1,Math.ceil(clock.duration/4));var bucket=clock.kind==='stopwatch'?Math.floor(elapsed/300):Math.ceil(current/size);
 if(force||bucket!==clock.bucket||current===0){clock.bucket=bucket;if(displayNode&&document.body.contains(displayNode))displayNode.textContent=clock.kind==='stopwatch'?formatTime(elapsed):formatTime(current)}
 if(clock.kind!=='stopwatch'&&current===0&&clock.running){clock.elapsed=clock.duration;clock.running=false;clock.finished=true;stopClockInterval();if(clock.kind==='meditate'&&clock.duration>=120)complete('meditate');if(clock.kind==='move'){dayRecord().growth.move=true;persist();notify('Two minutes of movement logged.')}if(clockNote&&document.body.contains(clockNote))clockNote.textContent='session complete. you showed up.';if(route.name==='timing')render()}
}
function beginClock(){if(!clock)return;if(clock.finished){clock.elapsed=0;clock.finished=false;clock.bucket=null}if(clock.running)return;clock.startedAt=Date.now();clock.running=true;stopClockInterval();clockInterval=setInterval(function(){tickClock(false)},1000);render()}
function pauseClock(){if(!clock||!clock.running)return;clock.elapsed=secondsElapsed();clock.running=false;stopClockInterval();render()}
function resetClock(){if(clock)startTimer(clock.kind,clock.duration);stopClockInterval();render()}
document.addEventListener('visibilitychange',function(){if(!document.hidden)tickClock(true)});
function renderTimerLanding(){heading('timer.','tools / focus without distractions');small('the clock runs internally; the screen updates only at milestones.',screen,'copy');var grid=el('div','panel-grid',null,screen);
 block('focus','2 / 5 / 15 / 25 minute sessions',function(){startTimer('focus',1500);go('timing')},grid,'01');
 block('meditation','static image, two minutes by default',function(){go('meditate')},grid,'02');
 block('stopwatch','open-ended practice, no deadline',function(){startTimer('stopwatch',0);go('timing')},grid,'03');
 if(clock&&clock.running)buttons(screen,[['return to running timer',function(){go('timing')}]]);
}
function renderMeditate(){heading('meditate.','anchor / two quiet minutes');small('blink naturally. breathe comfortably. the image stays still.',screen,'copy');el('div','meditation-symbol',null,screen);small('there is nothing to chase here.',screen,'copy');var row=buttons(screen,[["begin 2 minutes",function(){startTimer('meditate',120);go('timing')} ,'btn primary'],['more durations',function(){startTimer('meditate',300);go('timing')}]]);}
function renderTiming(){if(!clock)startTimer('focus',1500);heading(clock.kind==='meditate'?'stillness.':clock.kind==='stopwatch'?'stopwatch.':clock.kind==='move'?'move.':'focus.','timer / minimal refresh');
 var p=el('div','timer-panel',null,screen);small(clock.kind==='meditate'?'quiet timer. no moving circle.':'time for one meaningful action.',p);
 displayNode=el('div','timer-number',formatTime(clock.kind==='stopwatch'?secondsElapsed():Math.max(0,clock.duration-secondsElapsed())),p);
 clockNote=small(clock.finished?'session complete. you showed up.':'display refreshes at quarter marks, and at the end.',p);
 if(!clock.running){var preset=el('div','button-row',null,screen);var vals=clock.kind==='meditate'?[2,5,10,20]:[2,5,15,25];if(clock.kind!=='stopwatch')vals.forEach(function(min){btn(min+' min',function(){startTimer(clock.kind,min*60);render()},'btn',preset)})}
 buttons(screen,[[clock.running?'pause':clock.finished?'restart':'begin',clock.running?pauseClock:beginClock,'btn primary'],['reset',resetClock],['home (timer stays active)',home]]);
 tickClock(true);
}
/* Reusable flip-and-self-grade review engine. */
function uid(){return 'id'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
function sampleStack(){var ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],suits=['♠','♥','♣','♦'],cards=[];suits.forEach(function(s){ranks.forEach(function(r){cards.push(r+s)})});return {id:'sample-standard-order',name:'standard deck order (demo)',items:cards,created:Date.now()}}
if(!store.stacks.length){store.stacks=[sampleStack()];persist()}
if(!store.scripts.length){store.scripts=[{id:'sample-script',name:'example rehearsal script',body:'Opening cue\nThere is something interesting about how people understand memory.\n\nInvite the participant\nWould you mind helping me with something for a moment?\n\nEnd beat\nThank you. What interests me is what we notice along the way.',created:Date.now()}];persist()}
if(!store.knowledge.length){store.knowledge=[{id:uid(),q:'What should be checked before a strolling set?',a:'Prop setup, reset, pocket management, visibility, and venue conditions.'},{id:uid(),q:'What belongs in an effect dossier?',a:'Effect, method, script, blocking, reset, contingencies, and sources.'},{id:uid(),q:'What is an audience-safe performance cue?',a:'A prompt that helps you perform without exposing private methods.'},{id:uid(),q:'What is an effective post-show note?',a:'One specific observation and one action to test at the next performance.'}];persist()}
var trainer=null;
function randomIndex(n,prior){if(n<2)return 0;var i=Math.floor(Math.random()*n);if(i===prior)i=(i+1+Math.floor(Math.random()*(n-1)))%n;return i}
function saveRating(key,success){if(!store.reviews[key])store.reviews[key]={got:0,again:0,last:0,interval:0,dueAt:0};var r=store.reviews[key];r[success?'got':'again']+=1;r.last=Date.now();r.interval=success?(r.interval?Math.min(60,r.interval*2):1):0;r.dueAt=r.last+r.interval*86400000;persist();if(success){complete('study');dayRecord().growth.recall=true;persist()}}
function trainerContinue(correct){if(!trainer)return;saveRating(trainer.key,correct);trainer.total++;if(correct)trainer.correct++;trainer.last=trainer.idx;trainer.idx=trainer.type==='script'?(trainer.idx+1)%trainer.length:pickNextCard(trainer);trainer.revealed=false;render()}
function pickNextCard(t){var due=[];for(var i=0;i<t.length;i++){if(i===t.last)continue;var key=t.type==='knowledge'?'knowledge:'+store.knowledge[i].id:'stack:'+t.deckId+':'+t.mode+':'+i;var r=store.reviews[key];if(!r||!r.dueAt||r.dueAt<=Date.now())due.push(i)}if(due.length)return due[Math.floor(Math.random()*due.length)];return randomIndex(t.length,t.last)}
function showTrainingCard(front,backText,subtitle){var d=el('div','card',null,screen),top=el('div','card-head',null,d);el('span','',subtitle||'practice / active recall',top);el('span','',trainer?((trainer.total+1)+' / session'):'',top);
 el('div','prompt-text',front,d);if(trainer&&trainer.revealed)el('div','answer-text',backText,d);else small('recall before revealing.',d);
 el('div','card-foot',trainer?('session: '+trainer.correct+' got it / '+trainer.total+' reviewed'):'',d);
 if(trainer&&!trainer.revealed){buttons(screen,[['reveal answer',function(){trainer.revealed=true;render()},'btn primary'],['end review',back]])}
 else{buttons(screen,[['again',function(){trainerContinue(false)}],['got it ✓',function(){trainerContinue(true)},'btn primary'],['finish',back]])}
}
function renderStacks(){heading('stack trainer.','magician’s desk / memory systems');small('test any custom ordered stack, including tarot. this demo stack is ordinary new-deck order, not a memorized stack.',screen,'copy');
 var d=el('div','stack',null,screen);store.stacks.forEach(function(deck){var row=el('div','list-row',null,d),label=el('div','entry',null,row);el('strong','',deck.name,label);el('small','',deck.items.length+' positions / custom order',label);btn('train',function(){go('stack-config',{id:deck.id})},'small-link primary',row);btn('edit',function(){go('stack-edit',{id:deck.id})},'small-link',row)});
 buttons(screen,[['+ new stack',function(){go('stack-edit',{id:null})}]]);
}
function findStack(id){return store.stacks.filter(function(x){return x.id===id})[0]}
function renderStackEdit(){var old=findStack(route.data.id),deck=old||{name:'',items:[]};heading(old?'edit stack.':'new stack.','magician’s desk / custom card order');small('one card per line, from position 1 onward. for a circular stack, the last and first cards are neighbors.',screen);
 var name=field('deck name',deck.name,'e.g. tarot major arcana',screen);var cards=field('one card name per line',deck.items.join('\n'),'strength\n...\nthe devil',screen,true);cards.rows=16;
 buttons(screen,[['save stack',function(){var items=cards.value.split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean);if(!name.value.trim()||items.length<2){notify('Name the deck and enter at least two cards.');return}if(old){old.name=name.value.trim();old.items=items}else store.stacks.push({id:uid(),name:name.value.trim(),items:items,created:Date.now()});persist();go('stacks')},'btn primary'],['cancel',back]]);
 if(old&&old.id!=='sample-standard-order')buttons(screen,[['delete deck',function(){if(confirm('Delete this deck and its order?')){store.stacks=store.stacks.filter(function(x){return x.id!==old.id});persist();go('stacks')}}]]);
}
function renderStackConfig(){var d=findStack(route.data.id);if(!d){go('stacks');return}heading(d.name+'.','stack trainer / select test');small('all modes support wraparound for cyclical decks.',screen);
 var grid=el('div','panel-grid',null,screen);
 [['card-position','card → position','identify its numerical position'],['position-card','position → card','identify the card at a number'],['neighbors','before / after','name the cards beside it'],['next','next card','recall the following card']].forEach(function(x,i){block(x[1],x[2],function(){trainer={type:'stack',deckId:d.id,mode:x[0],idx:randomIndex(d.items.length,-1),last:-1,shown:false,revealed:false,total:0,correct:0,length:d.items.length,key:''};go('stack-drill')},grid,'0'+(i+1))});
}
function renderStackDrill(){if(!trainer||trainer.type!=='stack'){go('stacks');return}var d=findStack(trainer.deckId);if(!d)return;heading('stack trainer.','practice / '+d.name);var index=trainer.idx,items=d.items,mode=trainer.mode,n=index+1,front='',answer='';
 if(mode==='card-position'){front=items[index];answer='position '+n}
 else if(mode==='position-card'){front='position '+n;answer=items[index]}
 else if(mode==='neighbors'){front=items[index];answer='before: '+items[(index+items.length-1)%items.length]+'\nafter: '+items[(index+1)%items.length]}
 else{front=items[index];answer='next: '+items[(index+1)%items.length]}
 trainer.key='stack:'+d.id+':'+mode+':'+index;showTrainingCard(front,answer,mode+' / '+items.length+' positions');
}
function renderScripts(){heading('script rehearsal.','magician’s desk / performance');small('separate beats with a blank line. the first line of each beat becomes a cue; the remainder stays hidden until reveal.',screen,'copy');var area=el('div','stack',null,screen);
 store.scripts.forEach(function(s){var row=el('div','list-row',null,area),entry=el('div','entry',null,row);el('strong','',s.name,entry);el('small','',scriptBeats(s).length+' rehearsal beats',entry);btn('rehearse',function(){trainer={type:'script',scriptId:s.id,idx:0,revealed:false,total:0,correct:0,length:scriptBeats(s).length};go('script-drill')},'small-link primary',row);btn('edit',function(){go('script-edit',{id:s.id})},'small-link',row)});
 buttons(screen,[['+ new script',function(){go('script-edit',{id:null})}]]);
}
function scriptBeats(s){return s.body.split(/\n\s*\n+/).map(function(t){var lines=t.trim().split(/\n/);return {cue:lines[0]||'rehearsal cue',answer:lines.slice(1).join('\n').trim()||lines[0]}}).filter(function(x){return x.cue.trim()})}
function findScript(id){return store.scripts.filter(function(s){return s.id===id})[0]}
function renderScriptEdit(){var old=findScript(route.data.id),s=old||{name:'',body:''};heading(old?'edit script.':'new script.','magician’s desk / rehearsal editor');var name=field('script title',s.name,'effect or routine name',screen),body=field('script beats',s.body,'Opening cue\nFull dialogue or blocking to remember.\n\nSecond cue\nNext passage...',screen,true);body.rows=18;
 buttons(screen,[['save script',function(){if(!name.value.trim()||!body.value.trim()){notify('Add a title and at least one rehearsal beat.');return}if(old){old.name=name.value.trim();old.body=body.value}else store.scripts.push({id:uid(),name:name.value.trim(),body:body.value,created:Date.now()});persist();go('scripts')},'btn primary'],['cancel',back]]);
 if(old&&old.id!=='sample-script')buttons(screen,[['delete script',function(){if(confirm('Delete this private script?')){store.scripts=store.scripts.filter(function(x){return x.id!==old.id});persist();go('scripts')}}]]);
}
function renderScriptDrill(){if(!trainer||trainer.type!=='script')return;var s=findScript(trainer.scriptId);if(!s)return;var beats=scriptBeats(s);if(!beats.length){notify('No rehearsal beats in script.');go('scripts');return}heading('rehearse.','script / '+s.name);var beat=beats[trainer.idx%beats.length];trainer.key='script:'+s.id+':'+(trainer.idx%beats.length);trainer.length=beats.length;
 showTrainingCard(beat.cue,beat.answer,'beat '+(trainer.idx%beats.length+1)+' / '+beats.length);
}
function renderKnowledge(){heading('effect knowledge.','magician’s desk / active recall');var due=store.knowledge.filter(function(c){var r=store.reviews['knowledge:'+c.id];return !r||!r.dueAt||r.dueAt<=Date.now()}).length;small('add your own questions, methods, origins, reset steps, and contingency plans. '+due+' card(s) due for review today.',screen,'copy');
 buttons(screen,[['review cards',function(){if(!store.knowledge.length){notify('Add a card first.');return}trainer={type:'knowledge',idx:randomIndex(store.knowledge.length,-1),last:-1,revealed:false,total:0,correct:0,length:store.knowledge.length,key:''};go('knowledge-drill')},'btn primary'],['+ add card',function(){go('knowledge-edit',{id:null})}]]);
 var list=el('div','stack',null,screen);store.knowledge.forEach(function(c){var row=el('div','list-row',null,list),entry=el('div','entry',null,row);el('strong','',c.q,entry);btn('edit',function(){go('knowledge-edit',{id:c.id})},'small-link',row)});
}
function renderKnowledgeEdit(){var existing=store.knowledge.filter(function(x){return x.id===route.data.id})[0];heading(existing?'edit card.':'new card.','effect knowledge / authoring');var q=field('question',existing?existing.q:'','what must you recall?',screen,true),a=field('answer',existing?existing.a:'','a concise explanation',screen,true);
 buttons(screen,[['save card',function(){if(!q.value.trim()||!a.value.trim()){notify('Both sides need text.');return}if(existing){existing.q=q.value.trim();existing.a=a.value.trim()}else store.knowledge.push({id:uid(),q:q.value.trim(),a:a.value.trim()});persist();go('knowledge')},'btn primary'],['cancel',back]]);
 if(existing)buttons(screen,[['delete card',function(){if(confirm('Delete this card?')){store.knowledge=store.knowledge.filter(function(x){return x.id!==existing.id});persist();go('knowledge')}}]]);
}
function renderKnowledgeDrill(){if(!trainer||trainer.type!=='knowledge')return;heading('effect knowledge.','flashcards / active recall');if(!store.knowledge.length)return;var c=store.knowledge[trainer.idx%store.knowledge.length];trainer.length=store.knowledge.length;trainer.key='knowledge:'+c.id;showTrainingCard(c.q,c.a,'effect knowledge / '+store.knowledge.length+' cards');}
/* Ebook library: IndexedDB schema compatible with v0.2. */
var db=null,books=[],bookReader=null,bookUrl=null;
function initBooks(){if(!window.indexedDB){notify('IndexedDB is not available in this browser. Ebook importing is disabled.');return}var req;try{req=indexedDB.open('daily-practice-books',1)}catch(err){notify('Local ebook storage is not available in this browser context. Other tools can still work.');return}
 req.onupgradeneeded=function(){if(!req.result.objectStoreNames.contains('books'))req.result.createObjectStore('books',{keyPath:'id'})};
 req.onsuccess=function(){db=req.result;refreshBooks()};req.onerror=function(){notify('Browser could not open the local ebook library. Check storage permissions.')};
}
function refreshBooks(){if(!db)return;var r=db.transaction('books','readonly').objectStore('books').getAll();r.onsuccess=function(){books=r.result||[];if(['home','library'].indexOf(route.name)!==-1)render()}}
function putBook(b){if(!db){notify('Ebook library is not available.');return}var tx=db.transaction('books','readwrite');tx.objectStore('books').put(b);tx.oncomplete=refreshBooks;tx.onerror=function(){notify('Could not save book. Your browser may be out of storage.')}}
function deleteBook(b){if(!db)return;var tx=db.transaction('books','readwrite');tx.objectStore('books').delete(b.id);tx.oncomplete=refreshBooks}
function addBooks(files){if(!db){notify('Ebook storage not available in this browser.');return}var valid=[];for(var i=0;i<files.length;i++){var f=files[i],format=f.name.split('.').pop().toLowerCase();if(['txt','pdf','epub'].indexOf(format)<0)continue;valid.push({id:uid(),title:f.name.replace(/\.[^.]+$/,''),format:format,status:'unread',file:f,page:0,added:Date.now()})}
 if(!valid.length){notify('Choose PDF, EPUB, or TXT files.');return}var tx=db.transaction('books','readwrite'),s=tx.objectStore('books');valid.forEach(function(b){s.put(b)});tx.oncomplete=function(){notify(valid.length+' book(s) imported and saved locally.');refreshBooks()};tx.onerror=function(){notify('Import failed; try smaller batches or check browser storage.')}}
function downloadBlob(blob,name){var link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.appendChild(link);link.click();document.body.removeChild(link);setTimeout(function(){URL.revokeObjectURL(url)},15000)}
function bookById(id){return books.filter(function(b){return String(b.id)===String(id)})[0]}
function renderRead(){heading('read.','anchor / two pages');var b=bookById(store.lastBookId)||books.filter(function(x){return x.status==='reading'})[0]||books[0];if(!b){small('start by importing a book to your library.',screen,'copy');buttons(screen,[['open library',function(){go('library')},'btn primary']]);return}
 var row=el('div','list-row',null,screen),entry=el('div','entry',null,row);el('strong','',b.title,entry);el('small','',b.format.toUpperCase()+' · '+(b.status==='finished'?'finished':'continue reading'),entry);btn('open',function(){openBook(b)},'small-link primary',row);
 small('read two pages to earn today’s checkmark. automatic page tracking is available in the built-in TXT reader; PDFs use a manual check-in.',screen);
 buttons(screen,[['browse your books',function(){go('library')}],['ask book / passage search',function(){go('ask-book',{id:b.id})}]]);
}
function renderLibrary(){heading('library.','tools / your ebooks');small('PDF and TXT open here; EPUB can be stored and exported. Files stay in this browser profile.',screen);
 filePicker('import ebook files (multiple files allowed)','.txt,.pdf,.epub',addBooks,screen);
 var select=el('select','field',null,screen);[['all','all books'],['reading','currently reading'],['unread','to read'],['finished','finished']].forEach(function(x){var o=el('option','',x[1],select);o.value=x[0]});
 var search=el('input','field',null,screen);search.type='search';search.placeholder='search your library';search.setAttribute('aria-label','Search ebooks');var list=el('div','stack',null,screen);
 function show(){list.textContent='';var matched=books.filter(function(b){return (select.value==='all'||b.status===select.value)&&b.title.toLowerCase().indexOf(search.value.toLowerCase())!==-1});if(!matched.length){el('div','empty','no matching books yet.',list);return}matched.sort(function(a,b){return (b.added||0)-(a.added||0)}).forEach(function(b){var row=el('div','list-row book-row',null,list),entry=el('div','entry',null,row);el('strong','',b.title,entry);el('small','',b.format.toUpperCase()+' / '+(b.status||'unread'),entry);btn('read',function(){openBook(b)},'small-link primary',row);btn('details',function(){go('book-detail',{id:b.id})},'small-link',row)})}
 select.addEventListener('change',show);search.addEventListener('input',show);show();
 buttons(screen,[['ask library (TXT search)',function(){go('ask-library')}]]);
}
function renderBookDetail(){var b=bookById(route.data.id);if(!b){go('library');return}heading(b.title+'.','library / book details');small('format: '+b.format.toUpperCase(),screen);
 var sel=el('select','field',null,screen);[['unread','to read'],['reading','currently reading'],['finished','finished']].forEach(function(v){var o=el('option','',v[1],sel);o.value=v[0]});sel.value=b.status||'unread';sel.addEventListener('change',function(){b.status=sel.value;putBook(b);notify('Reading status updated.')});
 buttons(screen,[['open book',function(){openBook(b)},'btn primary'],['ask about book',function(){go('ask-book',{id:b.id})}],['export original file',function(){downloadBlob(b.file,b.title+'.'+b.format)}]]);
 buttons(screen,[['remove from library',function(){if(confirm('Remove '+b.title+' from this browser?')){deleteBook(b);go('library')}}]]);
}
function txtPages(s){s=s.replace(/\r\n/g,'\n');var max=1200,pages=[],start=0;while(start<s.length){var end=Math.min(start+max,s.length);if(end<s.length){var cut=s.lastIndexOf(' ',end);if(cut>start+max*.68)end=cut}pages.push(s.slice(start,end).trim());start=end;while(s.charAt(start)===' ')start++}return pages.length?pages:['(This text file is empty.)']}
function openBook(b){store.lastBookId=b.id;persist();if(b.status==='unread'){b.status='reading';putBook(b)}
 if(bookUrl){URL.revokeObjectURL(bookUrl);bookUrl=null}bookReader=null;go('book-reader',{id:b.id});
 if(b.format==='txt'){var f=new FileReader();f.onload=function(){if(route.name!=='book-reader'||String(route.data.id)!==String(b.id))return;var pages=txtPages(String(f.result));bookReader={id:b.id,pages:pages,index:Math.min(Math.max(0,b.page||0),pages.length-1)};render()};f.onerror=function(){notify('Could not read this TXT file.')};f.readAsText(b.file)}
}
function recordPageAdvance(b,index){var d=dayRecord(),k=String(b.id),progress=d.reading[k];if(!progress){progress={max:Math.max(0,(b.page||0)),advances:0};d.reading[k]=progress}
 if(index>progress.max){progress.advances+=(index-progress.max);progress.max=index;if(progress.advances>=2)complete('read')}persist()}
function turnPage(delta){if(!bookReader)return;var b=bookById(bookReader.id),to=Math.min(Math.max(0,bookReader.index+delta),bookReader.pages.length-1);if(to===bookReader.index)return;if(delta>0)recordPageAdvance(b,to);bookReader.index=to;b.page=to;putBook(b);render()}
function renderBookReader(){var b=bookById(route.data.id);if(!b){go('library');return}heading(b.title+'.','read / local book');buttons(screen,[['← library',function(){go('library')}],['ask book',function(){go('ask-book',{id:b.id})}]]);
 if(b.format==='txt'){
  if(!bookReader||String(bookReader.id)!==String(b.id)){el('div','empty','loading text…',screen);return}
  var pg=bookReader.index,pages=bookReader.pages;var d=el('div','reader-area',null,screen);el('div','eyebrow',b.title+' / page '+(pg+1)+' of '+pages.length,d);el('article','reader-text',pages[pg],d);
  var pr=el('div','progress-line',null,screen),fill=el('span','',null,pr);fill.style.width=(100*(pg+1)/pages.length).toFixed(1)+'%';
  buttons(screen,[['← previous',function(){turnPage(-1)}],['next page →',function(){turnPage(1)},'btn primary']]);
  small('Pages here are approximately 1,200 characters, not physical Kindle pages. Two new forward page advances count as today’s reading minimum.',screen);
 } else if(b.format==='pdf'){
  if(!bookUrl)bookUrl=URL.createObjectURL(b.file);var frame=el('iframe','pdf-view',null,screen);frame.src=bookUrl;frame.title='PDF: '+b.title;
  small('The browser PDF viewer does not report page advances to this dashboard. After reading two pages, you can mark completion manually.',screen);
  buttons(screen,[["i read two pages",function(){if(confirm('Confirm you read two pages in the PDF?'))complete('read')},'btn primary']]);
 }else{
  el('div','empty','EPUB storage is working. In-browser EPUB rendering is not bundled in this offline v0.3 build.',screen);
  small('You can export this file to KOReader, Calibre, or another compatible reading app. This browser prototype does not claim to track EPUB page turns.',screen);
  buttons(screen,[['export epub',function(){downloadBlob(b.file,b.title+'.epub')},'btn primary']]);
 }
}
function scanTextBooks(q,onlyId,callback){var found=books.filter(function(b){return b.format==='txt'&&(!onlyId||String(b.id)===String(onlyId))});var all=[],left=found.length;if(!left){callback([]);return}
 found.forEach(function(b){var fr=new FileReader();fr.onload=function(){var pages=txtPages(String(fr.result)),query=q.toLowerCase().split(/\s+/).filter(Boolean);pages.forEach(function(text,i){var low=text.toLowerCase(),score=0;query.forEach(function(t){if(low.indexOf(t)>=0)score++});if(score){var pos=low.indexOf(query[0]),start=Math.max(0,pos-100);all.push({title:b.title,bookId:b.id,page:i+1,score:score,snippet:(start?'…':'')+text.slice(start,start+360)+(text.length>start+360?'…':'')})}});left--;if(left===0)callback(all.sort(function(a,b){return b.score-a.score}).slice(0,15))};fr.onerror=function(){left--;if(left===0)callback(all)};fr.readAsText(b.file)})
}
function renderAskBook(){var single=route.name==='ask-book',b=single?bookById(route.data.id):null;heading(single?'ask book.':'ask library.','offline / source passage search');
 small('This is local passage retrieval, not an on-device LLM. Answers are not generated; matching text is shown with its source.',screen,'copy');if(single&&b)small('searching: '+b.title+' ('+b.format.toUpperCase()+')',screen);
 if(single&&b&&b.format!=='txt'){el('div','inline-note','Text search currently works for imported TXT books. PDF and EPUB text extraction are not implemented.',screen);return}
 var q=field('search words','','e.g. habit environment, stage blocking, memory',screen),results=el('div','stack',null,screen);
 buttons(screen,[['find passages',function(){if(q.value.trim().length<2){notify('Enter at least two characters.');return}results.textContent='';el('p','hint','searching imported text…',results);scanTextBooks(q.value.trim(),single&&b?b.id:null,function(items){results.textContent='';if(!items.length){el('div','empty','No matching passages in the searchable TXT files.',results);return}items.forEach(function(x){var row=el('div','list-row',null,results),entry=el('div','entry',null,row);el('strong','',x.title+' / page '+x.page,entry);el('small','',x.snippet,entry);btn('open',function(){var book=bookById(x.bookId);book.page=x.page-1;putBook(book);openBook(book)},'small-link',row)})})},'btn primary']]);
}
/* Browser launcher preserves dashboard by default. This is not an embedded browser engine. */
function normalizeWebAddress(raw){var s=(raw||'').trim();if(!s)return null;if(/\s/.test(s)||s.indexOf('.')<0){return 'https://duckduckgo.com/?q='+encodeURIComponent(s)}if(!/^https?:\/\//i.test(s))s='https://'+s;if(!/^https?:\/\/[a-z0-9][a-z0-9.\-:]+(?:[\/?#]|$)/i.test(s))return null;return s}
function openWeb(url,here){if(!url){notify('Please enter a valid web address or search phrase.');return}if(here){window.location.href=url;return}var w=window.open(url,'_blank','noopener,noreferrer');if(!w)notify('If a new tab did not open, try “open in this tab” (useful on some Kindle browsers).')}
function renderBrowser(){heading('browser.','tools / the web is still available');small('the dashboard does not replace Chrome or the Kindle browser. external pages open in a separate tab when supported.',screen,'copy');
 var address=field('address or web search','','example.com or search words',screen);
 buttons(screen,[['open in new tab',function(){openWeb(normalizeWebAddress(address.value),false)},'btn primary'],['open in this tab',function(){openWeb(normalizeWebAddress(address.value),true)}]]);
 label('saved links');var area=el('div','stack',null,screen);
 store.bookmarks.forEach(function(b){var row=el('div','list-row',null,area),entry=el('div','entry',null,row);el('strong','',b.name,entry);el('small','',b.url,entry);btn('open',function(){openWeb(b.url,false)},'small-link primary',row);btn('remove',function(){store.bookmarks=store.bookmarks.filter(function(x){return x!==b});persist();render()},'small-link',row)});
 label('add bookmark');var title=field('name','','e.g. public archives',screen),url=field('website','','https://example.com',screen);
 buttons(screen,[['save bookmark',function(){var normalized=normalizeWebAddress(url.value);if(!title.value.trim()||!normalized||normalized.indexOf('duckduckgo.com/?q=')>=0){notify('Enter a name and a valid website URL.');return}store.bookmarks.push({name:title.value.trim(),url:normalized});persist();render()},'btn primary']]);
}
/* Offline article snapshots and best-effort CORS-dependent RSS refresh. */
function parseXML(raw){var doc=new DOMParser().parseFromString(raw,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('Invalid XML');return doc}
function xmlText(node,tag){var n=node.getElementsByTagName(tag)[0];return n?n.textContent.trim():''}
function ingestFeed(text,sourceUrl){var doc=parseXML(text),items=Array.prototype.slice.call(doc.getElementsByTagName('item'));var atom=false;if(!items.length){items=Array.prototype.slice.call(doc.getElementsByTagName('entry'));atom=true}if(!items.length)throw Error('No RSS/Atom items found');var feedTitle=xmlText(doc,atom?'title':'title')||sourceUrl||'imported feed';var added=0;
 items.slice(0,80).forEach(function(i){var title=xmlText(i,'title')||'(untitled)',link=xmlText(i,'link');if(atom){var l=i.getElementsByTagName('link')[0];link=l?(l.getAttribute('href')||link):link}var safe=normalizeWebAddress(link);if(!safe||safe.indexOf('duckduckgo.com/?q=')>=0)safe='';var excerpt=xmlText(i,atom?'summary':'description')||xmlText(i,'content');
 if(excerpt.indexOf('<')>=0){var div=document.createElement('div');div.textContent=excerpt;excerpt=div.textContent}excerpt=excerpt.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,420);
 var key=title+'|'+link;if(store.articles.some(function(x){return x.key===key}))return;store.articles.push({key:key,title:title,url:safe,source:feedTitle,excerpt:excerpt,added:Date.now()});added++});
 store.articles=store.articles.slice(-250);persist();return added}
function renderRSS(){heading('rss.','tools / the daily briefing');small('read intentionally. no infinite scroll or background refresh. imported feeds and articles remain available offline.',screen,'copy');
 var filter=el('div','button-row',null,screen);btn('all articles ('+store.articles.length+')',function(){go('rss-articles',{saved:false})},'btn primary',filter);btn('saved ('+store.savedArticles.length+')',function(){go('rss-articles',{saved:true})},'btn',filter);
 label('subscriptions');var sources=el('div','stack',null,screen);if(!store.feeds.length)el('div','empty','no subscriptions yet.',sources);
 store.feeds.forEach(function(f){var row=el('div','list-row',null,sources),entry=el('div','entry',null,row);el('strong','',f.name||f.url,entry);el('small','',f.url,entry);btn('refresh',function(){refreshFeed(f)},'small-link primary',row);btn('remove',function(){store.feeds=store.feeds.filter(function(x){return x!==f});persist();render()},'small-link',row)});
 label('add source');var url=field('rss / atom url','','https://example.com/feed.xml',screen);buttons(screen,[['save source',function(){var u=normalizeWebAddress(url.value);if(!u||u.indexOf('duckduckgo.com/?q=')>=0){notify('Enter a valid feed URL.');return}if(!store.feeds.some(function(f){return f.url===u}))store.feeds.push({url:u,name:u});persist();render()},'btn primary']]);
 label('offline import');filePicker('import .xml / .rss / .atom / .opml files','.xml,.rss,.atom,.opml',function(files){readFeedFile(files[0])},screen);
 small('Some feeds block direct browser requests (CORS), especially from file:// pages. Importing an XML snapshot works entirely offline; scheduled server-side updates would be a future feature.',screen);
}
function readFeedFile(file){var r=new FileReader();r.onload=function(){try{var content=String(r.result);if(/\.opml$/i.test(file.name)){var doc=parseXML(content),nodes=doc.getElementsByTagName('outline'),total=0;for(var i=0;i<nodes.length;i++){var u=nodes[i].getAttribute('xmlUrl');if(!u)continue;var norm=normalizeWebAddress(u);if(norm&&!store.feeds.some(function(x){return x.url===norm})){store.feeds.push({name:nodes[i].getAttribute('text')||norm,url:norm});total++}}persist();notify(total+' source(s) imported from OPML. Browser refresh may be blocked by CORS.');render();return}
 var count=ingestFeed(content,file.name);notify(count+' article(s) imported locally.');render()}catch(e){notify('Could not import feed: '+e.message)}};r.readAsText(file)}
function refreshFeed(feed){notify('Trying to retrieve '+feed.url+'…');fetch(feed.url,{mode:'cors'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status);return r.text()}).then(function(t){var added=ingestFeed(t,feed.url);notify(added+' new article(s). Refresh is manual.');render()}).catch(function(e){notify('Direct browser fetch failed (often CORS). You can import a saved RSS XML file instead. '+e.message)})}
function renderRSSArticles(){var saved=!!route.data.saved;heading(saved?'saved articles.':'daily briefing.','rss / offline snapshots');var articles=store.articles.filter(function(a){return !saved||store.savedArticles.indexOf(a.key)>=0}).slice().reverse();if(!articles.length){el('div','empty','No articles here yet. Import a feed snapshot or refresh a subscription.',screen);return}
 articles.forEach(function(a){var row=el('div','list-row',null,screen),entry=el('div','entry',null,row);el('strong','',a.title,entry);el('small','',a.source+(a.excerpt?' / '+a.excerpt:''),entry);var isSaved=store.savedArticles.indexOf(a.key)>=0;btn(isSaved?'unsave':'save',function(){if(isSaved)store.savedArticles=store.savedArticles.filter(function(x){return x!==a.key});else store.savedArticles.push(a.key);persist();render()},'small-link',row);if(a.url)btn('source',function(){openWeb(a.url,false)},'small-link primary',row)});
}
function renderCalendar(){heading('calendar.','organize / local appointments');small('a simple local list. this does not sync to your Google, Apple, or other calendar.',screen,'copy');var date=el('input','field',null,screen);date.type='date';date.value=today();var title=field('event','','appointment or commitment',screen);
 buttons(screen,[['add to calendar',function(){if(!title.value.trim())return notify('Enter an event title.');store.tasks.push({id:uid(),date:date.value||today(),title:title.value.trim()});persist();render()},'btn primary']]);label('upcoming');var arr=store.tasks.slice().sort(function(a,b){return a.date.localeCompare(b.date)});if(!arr.length)el('div','empty','nothing scheduled locally.',screen);
 arr.forEach(function(t){var row=el('div','list-row',null,screen),entry=el('div','entry',null,row);el('strong','',t.title,entry);el('small','',t.date,entry);btn('remove',function(){store.tasks=store.tasks.filter(function(x){return x.id!==t.id});persist();render()},'small-link',row)});
}
function renderNotifications(){heading('notifications.','organize / quiet reminders');small('this is a manual local inbox, not push notifications. no background alerts are sent.',screen,'copy');var note=field('new reminder','','one thing worth remembering',screen);buttons(screen,[['save reminder',function(){if(!note.value.trim())return;store.reminders.push({id:uid(),title:note.value.trim(),done:false});persist();render()},'btn primary']]);
 if(!store.reminders.length)el('div','empty','inbox zero. all quiet.',screen);
 store.reminders.forEach(function(n){var row=el('div','list-row',null,screen),entry=el('div','entry',null,row);el('strong','',(n.done?'✓ ':'')+n.title,entry);btn(n.done?'undo':'done',function(){n.done=!n.done;persist();render()},'small-link primary',row);btn('remove',function(){store.reminders=store.reminders.filter(function(x){return x.id!==n.id});persist();render()},'small-link',row)});
 buttons(screen,[['export private data / settings',function(){go('settings')}]]);
}
function renderSettings(){heading('settings.','local data / backups');small('Export your habits, scripts, stacks, research notes, bookmarks, RSS snapshots, and reminders. Ebook files stored in IndexedDB are NOT included in this JSON backup.',screen,'copy');
 buttons(screen,[['export settings & notes',function(){downloadBlob(new Blob([JSON.stringify(store,null,2)],{type:'application/json'}),'daily-practice-data-'+today()+'.json')},'btn primary']]);
 filePicker('restore from a previously exported JSON','.json',function(files){var r=new FileReader();r.onload=function(){try{var data=JSON.parse(String(r.result));if(!data||data.version!==3||!Array.isArray(data.stacks)||!Array.isArray(data.scripts)){notify('This is not a supported v0.3 backup.');return}if(!confirm('Replace current dashboard settings, habits, notes, and training content? Ebook files remain unchanged.'))return;Object.keys(defaults).forEach(function(k){if(Object.prototype.hasOwnProperty.call(data,k))store[k]=data[k]});persist();setInk(!!store.ink);notify('Dashboard backup restored.');render()}catch(e){notify('Invalid JSON backup.')}};r.readAsText(files[0])},screen);
 small('Important: Chrome local storage can be lost if site data is cleared or the project is moved to a different browser origin. Export backups regularly and keep original ebooks separately.',screen);
 buttons(screen,[['back to home',home]]);
}
function render(){document.body.classList.toggle('on-home',route.name==='home');screen.textContent='';$('footer-meta').textContent=(route.name==='home'?'home':'section')+' / underground 0.3';document.querySelector('.issue-label span').textContent=route.name==='home'?'home / 01':'section / 02';Object.keys(navMap).forEach(function(k){var item=$('nav-'+k);if(k===route.name)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current')});
 switch(route.name){
 case 'home':renderHome();break;
 case 'desk':renderDesk();break;case 'study':renderStudy();break;case 'concept':renderConcept();break;case 'journal':renderJournal();break;
 case 'read':renderRead();break;case 'library':renderLibrary();break;case 'book-detail':renderBookDetail();break;case 'book-reader':renderBookReader();break;case 'ask-book':case 'ask-library':renderAskBook();break;
 case 'meditate':renderMeditate();break;case 'timer':renderTimerLanding();break;case 'timing':renderTiming();break;
 case 'stacks':renderStacks();break;case 'stack-config':renderStackConfig();break;case 'stack-edit':renderStackEdit();break;case 'stack-drill':renderStackDrill();break;
 case 'scripts':renderScripts();break;case 'script-edit':renderScriptEdit();break;case 'script-drill':renderScriptDrill();break;
 case 'knowledge':renderKnowledge();break;case 'knowledge-edit':renderKnowledgeEdit();break;case 'knowledge-drill':renderKnowledgeDrill();break;
 case 'browser':renderBrowser();break;case 'rss':renderRSS();break;case 'rss-articles':renderRSSArticles();break;case 'calendar':renderCalendar();break;case 'notifications':renderNotifications();break;case 'settings':renderSettings();break;
 case 'notebook':renderNotebook();break;
 case 'recall':case 'create':case 'move':case 'connect':case 'finances':case 'rest':renderGrowth(route.name);break;
 default:heading('not found.','return to home');buttons(screen,[['home',home]]);
 }
}
window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!(e.target&&['INPUT','TEXTAREA','SELECT'].indexOf(e.target.tagName)>=0)){e.preventDefault();back()}});
initBooks();render();
})();
