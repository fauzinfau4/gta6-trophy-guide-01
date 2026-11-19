const STORAGE_KEY='leonida-ledger-progress-v1';
const SPOILER_KEY='leonida-ledger-spoilers-v1';
const data=await(await fetch('data/trophies.json')).json();
const trophies=data.trophies;
const rows=document.querySelector('#rows');
let earned=new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));
let selected=trophies.find(t=>t.id===28)||trophies[0];
let activeFilter='all';
let spoiler=localStorage.getItem(SPOILER_KEY)==='true';
document.querySelector('#spoiler-toggle').checked=spoiler;
const storyIds=new Set([2,3,4,5,6,7,8,9,10,11,12,13]);
const roadmapStages=[
 {title:'01 · Chapter 1 — make the save count',summary:'Start the story. Before leaving Chapter 1, take Lucia’s optional balcony meditation after Down to Earth. Keep a manual save at chapter breaks; the cited roadmap reports no mission replay.',ids:[2,3,8,23,28]},
 {title:'02 · Chapters 2–3 — build useful progress',summary:'Continue the story missions in sequence. Scan new vehicles with WAiNK, study animals, try activities and take available optional strands as they appear.',ids:[4,9,20,21,24,35,45,52]},
 {title:'03 · Chapters 4–5 — finish the story',summary:'Complete the Chapter 4 mission awards and Chapter 5 finale. Keep partner activities and any optional strands on your radar; the source says free-roam remains after credits.',ids:[5,6,7,10,11,12,13,33,34]},
 {title:'04 · Free-roam — 100% checklist',summary:'After the story, open Progress → Stats → 100% Completion. Follow the in-game checklist; cited targets include 200 vehicle scans, 100 animal studies and 70 of 80 challenges.',ids:[14,15,16,17,18,19,29,30,31,32,36,37,38,39,40,41,42,43,46,47,48,49,50,51,53,54,55]},
 {title:'05 · Quest strands & final sweep',summary:'Complete any remaining character endings, eight qualifying Stranger strands and trophy-specific cleanup. Earn the platinum after every other trophy; unknown triggers are marked openly.',ids:[1,22,25,26,27,44]}
];
function saveProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify([...earned]));}
function progressCount(){return earned.size;}
function updateProgress(){const n=progressCount(),pct=Math.floor(n/trophies.length*100);document.querySelector('#earned-count').textContent=n;document.querySelector('#percent').textContent=`${pct}%`;document.querySelector('#progress-meter').style.width=`${pct}%`;document.querySelector('#roadmap-progress').textContent=`${n} / 55`;}
function applySpoilerSetting(value){spoiler=value;localStorage.setItem(SPOILER_KEY,String(value));renderChecklist();renderDetail();}
function storyMasked(t){return spoiler&&storyIds.has(t.id)&&!earned.has(t.name);}
function trophyLabel(t){return storyMasked(t)?'Story trophy hidden':t.name;}
function trophyDescription(t){return storyMasked(t)?'Earn this story trophy to reveal its description.':t.description;}
function kindLabel(t){return t.missable?'MISSABLE':t.kind.toUpperCase();}
function renderChecklist(){
 const query=document.querySelector('#search').value.trim().toLowerCase();rows.replaceChildren();let shown=0;
 for(const t of trophies){if(activeFilter==='online')continue;if(activeFilter!=='all'&&!(activeFilter==='missable'?t.missable:t.kind===activeFilter))continue;if(query&&!`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(query))continue;shown++;
  const row=document.createElement('article');row.className=`trophy-row ${selected===t?'selected':''} ${earned.has(t.name)?'is-earned':''}`;
  const check=document.createElement('input');check.type='checkbox';check.checked=earned.has(t.name);check.setAttribute('aria-label',`Mark ${t.name} earned`);check.addEventListener('change',()=>{check.checked?earned.add(t.name):earned.delete(t.name);saveProgress();updateProgress();renderChecklist();renderDetail();renderRoadmap();});
  const title=document.createElement('button');title.className='trophy-title';title.type='button';title.innerHTML=`<span class="trophy-name"></span><small></small>`;title.querySelector('.trophy-name').textContent=trophyLabel(t);title.querySelector('small').textContent=trophyDescription(t);title.addEventListener('click',()=>{selected=t;renderChecklist();renderDetail();});
  const grade=document.createElement('span');grade.className=`grade ${t.grade}`;grade.textContent=t.grade.toUpperCase();
  const kind=document.createElement('span');kind.className=`kind ${t.missable?'warning':''}`;kind.textContent=t.missable?'MISSABLE':t.kind.toUpperCase();
  row.append(check,title,grade,kind);rows.append(row);
 }
 document.querySelector('#empty').hidden=shown!==0;
}
function renderDetail(){const box=document.querySelector('#detail');if(!selected)return;box.replaceChildren();const t=selected;const top=document.createElement('div');top.className='detail-top';top.innerHTML=`<span class="eyebrow">TROPHY GUIDE · #${String(t.id).padStart(2,'0')}</span><span class="grade ${t.grade}">${t.grade.toUpperCase()}</span>`;box.append(top);
 const h=document.createElement('h3');h.textContent=trophyLabel(t);box.append(h);const official=document.createElement('p');official.className='official-desc';official.textContent=trophyDescription(t);box.append(official);
 const flags=document.createElement('div');flags.className='detail-flags';flags.innerHTML=`<span>${t.kind.toUpperCase()}</span>${t.missable?'<span class="warning">⚠ POSSIBLY MISSABLE</span>':''}<span>${t.hidden?'HIDDEN LIST ENTRY':'VISIBLE LIST ENTRY'}</span>`;box.append(flags);
 const guideTitle=document.createElement('h4');guideTitle.textContent='How to earn it';box.append(guideTitle);const guide=document.createElement('p');guide.className='guide-copy';guide.textContent=t.guide;box.append(guide);
 const sources=document.createElement('div');sources.className='citations';sources.innerHTML='<h4>Sources consulted</h4>';for(const s of t.sources||data.sources){const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noreferrer';a.textContent=s.name;sources.append(a);}box.append(sources);
 const mark=document.createElement('label');mark.className='mark-earned';const cb=document.createElement('input');cb.type='checkbox';cb.checked=earned.has(t.name);cb.addEventListener('change',()=>{cb.checked?earned.add(t.name):earned.delete(t.name);saveProgress();updateProgress();renderChecklist();renderDetail();renderRoadmap();});mark.append(cb,document.createTextNode(earned.has(t.name)?' Trophy earned':' Mark as earned'));box.append(mark);
}
function renderRoadmap(){const host=document.querySelector('#roadmap');host.replaceChildren();for(const stage of roadmapStages){const section=document.createElement('section');section.className='road-stage';const head=document.createElement('div');head.className='road-stage-head';head.innerHTML=`<div><h3>${stage.title}</h3><p>${stage.summary}</p></div>`;section.append(head);const items=stage.ids.map(id=>trophies.find(t=>t.id===id)).filter(Boolean);const list=document.createElement('div');list.className='road-items';for(const t of items){const row=document.createElement('button');row.className='road-item';row.type='button';row.innerHTML=`<span class="road-check">${earned.has(t.name)?'✓':'○'}</span><span class="road-copy"><b></b><small></small></span>${t.missable?'<span class="warning-tag">⚠ MISSABLE</span>':''}<span class="grade ${t.grade}">${t.grade.toUpperCase()}</span>`;row.querySelector('b').textContent=storyMasked(t)?'Story trophy hidden':t.name;row.querySelector('small').textContent=storyMasked(t)?'Earn it to reveal details':t.description;row.addEventListener('click',()=>{selected=t;switchView('checklist');renderChecklist();renderDetail();});list.append(row);}section.append(list);host.append(section);}}
function renderSources(){const host=document.querySelector('#source-list');host.replaceChildren();for(const s of data.sources){const card=document.createElement('article');card.className='source-card';const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noreferrer';a.textContent=s.name;const p=document.createElement('p');p.textContent=s.note;const when=document.createElement('small');when.textContent=`Consulted ${s.consulted}`;card.append(a,p,when);host.append(card);}}
function switchView(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===name));document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==`view-${name}`);if(name==='roadmap')renderRoadmap();}
function exportProgress(){const payload={format:'leonida-ledger-progress-v1',game:'Grand Theft Auto VI',earned:[...earned]};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='leonida-ledger-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function importProgress(file){const parsed=JSON.parse(await file.text());const names=Array.isArray(parsed)?parsed:parsed.earned;if(!Array.isArray(names))throw new Error('Progress file has no earned list');const allowed=new Set(trophies.map(t=>t.name));earned=new Set(names.filter(name=>allowed.has(name)));saveProgress();updateProgress();renderChecklist();renderDetail();renderRoadmap();}
function applyShotState(){const shot=new URLSearchParams(location.search).get('shot');if(!shot)return;const stage=(names)=>{earned=new Set(names.filter(n=>trophies.some(t=>t.name===n)));saveProgress();};if(shot==='checklist'||shot==='roadmap'||shot==='spoiler')stage([]);if(shot==='tracker')stage(['Just Like Paradise','Paradise Lost','Trust','Break the Bank','Family Matters','Master of None','Stick Fiddler']);if(['checklist','roadmap','spoiler','tracker'].includes(shot)){spoiler=shot==='spoiler';localStorage.setItem(SPOILER_KEY,String(spoiler));document.querySelector('#spoiler-toggle').checked=spoiler;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===(shot==='spoiler'?'story':'all')));}if(shot==='spoiler')activeFilter='story';if(shot==='roadmap')switchView('roadmap');if(shot==='checklist'){selected=trophies.find(t=>t.id===28);activeFilter='all';}}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderChecklist();}));
document.querySelector('#spoiler-toggle').addEventListener('change',e=>applySpoilerSetting(e.target.checked));document.querySelector('#search').addEventListener('input',renderChecklist);document.querySelector('#export').addEventListener('click',exportProgress);document.querySelector('#import').addEventListener('change',async e=>{try{if(e.target.files[0])await importProgress(e.target.files[0]);}catch(err){alert(`Could not import progress: ${err.message}`);}e.target.value='';});
applyShotState();updateProgress();renderChecklist();renderDetail();renderRoadmap();renderSources();
