const KEY = 'leonida-ledger-progress-v1';
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const sourceById = Object.fromEntries(data.sources.map((source) => [source.id, source]));
const phases = ['Story', 'Side & activities', 'Collectibles', 'Cleanup'];
let earned = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
let selected = 2;
let filter = 'All';
let query = '';
let spoilers = false;

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function save() { localStorage.setItem(KEY, JSON.stringify([...earned])); }
function visible(t) {
  if (!spoilers && t.hidden && !earned.has(t.name)) return false;
  if (filter === 'Missable' && !t.missable) return false;
  if (filter !== 'All' && filter !== 'Missable' && t.kind !== filter) return false;
  const haystack = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
  return !query || haystack.includes(query.toLowerCase());
}
function counts() {
  const n = earned.size;
  $('earned-label').textContent = `${n} / 55`;
  $('percent').textContent = `${Math.round(n / 55 * 100)}%`;
  $('remaining').textContent = `${55 - n} to go`;
  $('progress-fill').style.width = `${n / 55 * 100}%`;
  const next = trophies.find((t) => !earned.has(t.name));
  $('next-title').textContent = next ? next.name : 'The state is yours';
  $('next-up').dataset.id = next?.id || '';
}
function renderRows() {
  const rows = $('rows');
  rows.replaceChildren();
  const sort = $('sort').value;
  let list = trophies.filter(visible);
  if (sort === 'grade') list = [...list].sort((a, b) => ['platinum','gold','silver','bronze'].indexOf(a.grade) - ['platinum','gold','silver','bronze'].indexOf(b.grade) || a.id - b.id);
  if (sort === 'phase') list = [...list].sort((a, b) => phases.indexOf(a.phase) - phases.indexOf(b.phase) || a.id - b.id);
  $('visible-count').textContent = `${list.length}`;
  $('empty').hidden = list.length !== 0;
  for (const t of list) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `trophy-row${selected === t.id ? ' selected' : ''}${earned.has(t.name) ? ' is-earned' : ''}`;
    row.innerHTML = `<span class="check ${earned.has(t.name) ? 'checked' : ''}">${earned.has(t.name) ? '✓' : ''}</span><span class="row-copy"><b>${esc(t.name)}</b><small>${esc(t.description)}</small></span><span class="grade ${esc(t.grade)}">${esc(t.grade)}</span>`;
    row.addEventListener('click', () => { selected = t.id; renderRows(); renderDetail(); });
    row.querySelector('.check').addEventListener('click', (event) => { event.stopPropagation(); earned.has(t.name) ? earned.delete(t.name) : earned.add(t.name); save(); render(); });
    rows.append(row);
  }
}
function renderDetail() {
  const t = trophies.find((item) => item.id === selected) || trophies[0];
  const refs = t.sources.map((id) => sourceById[id]).filter(Boolean);
  $('detail').innerHTML = `<div class="detail-top"><span class="eyebrow">FIELD NOTE ${String(t.id).padStart(2,'0')} / 55</span><span class="grade ${esc(t.grade)}">${esc(t.grade)}</span></div><h3>${esc(t.name)}</h3><p class="official-desc">“${esc(t.description)}”</p><div class="detail-rule"></div><section class="detail-section"><p class="eyebrow">HOW TO EARN</p><p>${esc(t.guide)}</p></section><div class="detail-split"><section class="detail-section"><p class="eyebrow">MISSABLE?</p><p class="missable-answer ${t.missable ? 'warn' : ''}">${t.missable ? 'Potentially — see the Chapter 1 save note.' : 'No known missable flag.'}</p></section><section class="detail-section"><p class="eyebrow">ROADMAP STEP</p><p>${esc(t.phase)}</p></section></div><section class="detail-section cited"><p class="eyebrow">SOURCES</p><ol>${refs.map((s) => `<li><span>[${esc(s.id)}]</span> ${esc(s.title)} <small>Retrieved ${esc(s.retrieved)}</small></li>`).join('')}</ol></section><button class="earned-button ${earned.has(t.name) ? 'done' : ''}" id="mark-earned" type="button">${earned.has(t.name) ? '✓  Marked earned' : '＋  Mark earned'}</button>`;
  $('mark-earned').addEventListener('click', () => { earned.has(t.name) ? earned.delete(t.name) : earned.add(t.name); save(); render(); });
}
function renderPhases() {
  $('phases').innerHTML = phases.map((phase, index) => {
    const items = trophies.filter((t) => t.phase === phase);
    const done = items.filter((t) => earned.has(t.name)).length;
    return `<article class="phase-card"><div class="phase-number">0${index + 1}</div><div class="phase-content"><div class="phase-head"><div><p class="eyebrow">PHASE 0${index + 1}</p><h3>${esc(phase)}</h3></div><span>${done}<i> / ${items.length}</i></span></div><p>${phase === 'Story' ? 'Follow the main chapters, and protect the early meditation opportunity.' : phase === 'Side & activities' ? 'Close character strands and build counts through races, ranges, challenges and crimes.' : phase === 'Collectibles' ? 'Use the in-game collection counters to sweep the map without losing your place.' : 'Finish remaining requirements and verify every counter before the platinum.'}</p><div class="phase-track"><span style="width:${items.length ? done/items.length*100 : 0}%"></span></div><div class="phase-trophies">${items.slice(0, 5).map((t) => `<button type="button" data-id="${t.id}" class="phase-chip ${earned.has(t.name) ? 'done' : ''}">${esc(t.name)}</button>`).join('')}${items.length > 5 ? `<span class="more">+${items.length - 5} more</span>` : ''}</div></div></article>`;
  }).join('');
  $('phases').querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => { selected = Number(button.dataset.id); setTab('tracker'); render(); }));
}
function renderSources() {
  $('sources').innerHTML = data.sources.map((s) => `<li><b>[${esc(s.id)}] ${esc(s.title)}</b><small>${esc(s.use)} Retrieved ${esc(s.retrieved)}.</small>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">Open source ↗</a>` : '<small>Competition starter data.</small>'}</li>`).join('');
}
function render() { counts(); renderRows(); renderDetail(); renderPhases(); $('spoiler-toggle').setAttribute('aria-pressed', String(spoilers)); $('spoiler-toggle').querySelector('span').textContent = spoilers ? 'Spoilers shown' : 'Spoilers hidden'; }
function setTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `${name}-view`));
}
document.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('.filter').forEach((b) => b.classList.toggle('active', b === button)); renderRows(); }));
$('search').addEventListener('input', (event) => { query = event.target.value.trim(); renderRows(); });
$('sort').addEventListener('change', renderRows);
$('spoiler-toggle').addEventListener('click', () => { spoilers = !spoilers; render(); });
$('next-up').addEventListener('click', () => { const t = trophies.find((item) => item.name === $('next-title').textContent); if (t) selected = t.id; setTab('tracker'); render(); });
$('open-missable').addEventListener('click', () => { filter = 'Missable'; document.querySelectorAll('.filter').forEach((b) => b.classList.toggle('active', b.dataset.filter === 'Missable')); setTab('tracker'); renderRows(); });
$('export').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ format: 'leonida-ledger-v1', earned: [...earned] }, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'leonida-ledger-save.json'; link.click(); URL.revokeObjectURL(link.href); });
$('import').addEventListener('change', async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); const names = Array.isArray(parsed) ? parsed : parsed.earned; if (!Array.isArray(names)) throw new Error('Save file has no earned list'); earned = new Set(names.filter((name) => trophies.some((t) => t.name === name))); save(); render(); } catch { alert('That save file could not be read. Choose a Leonida Ledger JSON export.'); } event.target.value = ''; });
renderSources();
const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'roadmap') setTab('roadmap');
if (shot === 'spoiler') { spoilers = true; selected = 4; }
if (shot === 'checklist') selected = 14;
render();
