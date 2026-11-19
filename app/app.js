const SAVE_KEY = 'leonida-ledger-progress-v1';
const response = await fetch('data/trophies.json');
const dataset = await response.json();
const trophies = dataset.trophies;
const state = { earned: new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]')), filter: 'all', query: '', selected: null, spoiler: true, view: 'guide' };
const list = document.querySelector('#trophy-list');
const detail = document.querySelector('#detail');
const phases = ['Story', 'Side & activities', 'Collectibles', 'Cleanup'];
const filters = ['All 55', 'Story', 'Missable', 'Collectibles', 'Activities', 'Online'];
const sourceMap = new Map(dataset.sources.map((source) => [source.id, source]));

function safeText(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value ?? '';
  return node;
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...state.earned]));
  renderProgress();
}

function renderProgress() {
  const amount = state.earned.size;
  const percent = Math.round(amount / trophies.length * 100);
  document.querySelector('#earned-count').textContent = String(amount).padStart(2, '0');
  document.querySelector('#percent').textContent = `${percent}%`;
  document.querySelector('#progress-fill').style.width = `${percent}%`;
}

function matches(trophy) {
  const earned = state.earned.has(trophy.name);
  if (state.spoiler && !earned && trophy.kind === 'story') return false;
  if (state.filter === 'missable' && !trophy.missable) return false;
  if (state.filter !== 'all' && state.filter !== 'missable' && trophy.kind !== state.filter) return false;
  const query = state.query.trim().toLowerCase();
  return !query || `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase().includes(query);
}

function renderList() {
  list.replaceChildren();
  const visible = trophies.filter(matches);
  document.querySelector('#shown-count').textContent = `${visible.length} / 55`;
  for (const trophy of visible) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `trophy-row${state.selected?.id === trophy.id ? ' selected' : ''}${state.earned.has(trophy.name) ? ' earned' : ''}`;
    row.setAttribute('aria-pressed', String(state.selected?.id === trophy.id));
    row.addEventListener('click', () => { state.selected = trophy; renderList(); renderDetail(); });
    const check = safeText('span', 'check-mark', state.earned.has(trophy.name) ? '✓' : '');
    const copy = document.createElement('span'); copy.className = 'row-copy';
    const hidden = state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name);
    copy.append(safeText('strong', 'row-name', hidden ? 'Story milestone' : trophy.name));
    copy.append(safeText('span', 'row-desc', hidden ? 'Hidden until earned' : trophy.description));
    const grade = safeText('span', `grade grade-${trophy.grade}`, trophy.grade.toUpperCase());
    row.append(check, copy, grade); list.append(row);
  }
  if (!visible.length) list.append(safeText('p', 'no-results', 'No trophies match this view.'));
}

function renderSources(ids) {
  const block = document.createElement('div'); block.className = 'detail-sources';
  block.append(safeText('h3', 'micro-heading', 'SOURCES'));
  for (const id of ids) {
    const source = sourceMap.get(id);
    if (!source) continue;
    const line = document.createElement('p'); line.className = 'source-line';
    line.append(safeText('b', '', `[${id}] `));
    if (source.url) { const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = source.title; line.append(link); }
    else line.append(safeText('span', '', source.title));
    line.append(safeText('small', '', ` · retrieved ${source.retrieved}`)); block.append(line);
  }
  return block;
}

function renderDetail() {
  const trophy = state.selected;
  if (!trophy) return;
  detail.replaceChildren();
  const top = document.createElement('div'); top.className = 'detail-topline';
  top.append(safeText('span', 'eyebrow', `TROPHY ${String(trophy.id).padStart(2, '0')} / 55`));
  top.append(safeText('span', `grade grade-${trophy.grade}`, trophy.grade.toUpperCase()));
  const heading = safeText('h2', 'detail-title', trophy.name);
  const official = document.createElement('section'); official.className = 'detail-section'; official.append(safeText('h3', 'micro-heading', 'OFFICIAL DESCRIPTION'), safeText('p', 'official-description', trophy.description));
  const guide = document.createElement('section'); guide.className = 'detail-section guide-copy'; guide.append(safeText('h3', 'micro-heading', 'FIELD GUIDE'), safeText('p', '', trophy.guide));
  const risk = document.createElement('section'); risk.className = `risk-note${trophy.missable ? ' risk-yes' : ''}`;
  risk.append(safeText('h3', 'micro-heading', 'MISSABLE?'), safeText('p', '', trophy.missable ? trophy.missable_note : 'No verified missable condition found in the consulted guide. This is a fan-made note; check the source before committing to a one-time action.'));
  const route = document.createElement('section'); route.className = 'route-step'; route.append(safeText('span', 'micro-heading', 'ROADMAP STEP'), safeText('p', '', trophy.roadmap));
  const action = document.createElement('button'); action.type = 'button'; action.className = 'primary-button';
  action.textContent = state.earned.has(trophy.name) ? '✓ Earned — undo' : 'Mark earned';
  action.addEventListener('click', () => { state.earned.has(trophy.name) ? state.earned.delete(trophy.name) : state.earned.add(trophy.name); save(); renderList(); renderDetail(); renderRoadmap(); });
  detail.append(top, heading, official, guide, risk, route, renderSources(trophy.sources), action);
}

function renderRoadmap() {
  const target = document.querySelector('#phase-list'); target.replaceChildren();
  phases.forEach((phase, index) => {
    const members = trophies.filter((t) => t.phase === phase);
    const done = members.filter((t) => state.earned.has(t.name)).length;
    const card = document.createElement('article'); card.className = 'phase-card';
    const number = safeText('span', 'phase-number', `0${index + 1}`);
    const body = document.createElement('div'); body.className = 'phase-body';
    body.append(safeText('h3', '', phase), safeText('p', '', phaseCopy[index]));
    const bar = document.createElement('div'); bar.className = 'phase-track'; const fill = document.createElement('span'); fill.style.width = `${members.length ? done / members.length * 100 : 0}%`; bar.append(fill); body.append(bar);
    const count = document.createElement('span'); count.className = 'phase-count'; count.append(safeText('b', '', `${done}/${members.length}`), safeText('small', '', 'earned'));
    card.append(number, body, count); target.append(card);
  });
}

const phaseCopy = [
  'Follow the main chapters and finish story-linked missions as they appear. Keep a manual save at chapter breaks if your own route calls for one.',
  'Work through character strands, partner feats, races, combat, and repeatable activity counters. Verify any timing-sensitive task in the cited guide.',
  'Sweep the named collectibles and exploration counts with the in-game map and progress screens. The cited counts are the most reliable checklist.',
  'Use the trophy list and progress menu to identify remaining totals, then finish the broad completion target and award the platinum.'
];

function renderSourcesPage() {
  const target = document.querySelector('#sources-list'); target.replaceChildren();
  for (const source of dataset.sources) {
    const card = document.createElement('article'); card.className = 'source-card';
    card.append(safeText('span', 'source-index', `[${source.id}]`), safeText('h3', '', source.title), safeText('p', '', `${source.note} Retrieved ${source.retrieved}.`));
    if (source.url) { const a = document.createElement('a'); a.href = source.url; a.target = '_blank'; a.rel = 'noreferrer'; a.textContent = 'Open source ↗'; card.append(a); }
    target.append(card);
  }
}

function setView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('.tab')) tab.classList.toggle('active', tab.dataset.view === view);
  for (const name of ['guide', 'roadmap', 'about']) document.querySelector(`#${name}-view`).classList.toggle('hidden', name !== view);
}

for (const button of document.querySelectorAll('.filter')) button.addEventListener('click', () => {
  state.filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button)); renderList();
});
document.querySelector('#search').addEventListener('input', (event) => { state.query = event.target.value; renderList(); });
document.querySelector('#spoiler-toggle').addEventListener('change', (event) => { state.spoiler = event.target.checked; renderList(); });
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
document.querySelector('#export').addEventListener('click', () => {
  const payload = { format: 'leonida-ledger-save-v1', earned: [...state.earned] };
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); link.download = 'leonida-ledger-save.json'; link.click(); URL.revokeObjectURL(link.href);
});
document.querySelector('#import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]; if (!file) return;
  try { const parsed = JSON.parse(await file.text()); const names = Array.isArray(parsed) ? parsed : parsed.earned; if (!Array.isArray(names)) throw new Error('missing earned list');
    const allowed = new Set(trophies.map((t) => t.name)); state.earned = new Set(names.filter((name) => allowed.has(name))); save(); renderList(); renderDetail(); renderRoadmap();
  } catch { alert('That save file could not be read. Choose a Leonida Ledger JSON export.'); }
  event.target.value = '';
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'roadmap') setView('roadmap');
if (shot === 'about') setView('about');
if (shot === 'spoiler') { state.spoiler = true; document.querySelector('#spoiler-toggle').checked = true; }
if (shot === 'tracker') { state.spoiler = false; document.querySelector('#spoiler-toggle').checked = false; state.selected = trophies.find((t) => t.kind === 'collectibles') ?? trophies[0]; }
if (shot === 'checklist') { state.spoiler = false; document.querySelector('#spoiler-toggle').checked = false; state.selected = trophies[0]; }
renderProgress(); renderList(); renderDetail(); renderRoadmap(); renderSourcesPage();
