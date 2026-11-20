(() => {
  'use strict';
  const SOURCES = [
    { id: 'S1', name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
    { id: 'S2', name: 'PowerPyx — All Challenges Guide', url: 'https://www.powerpyx.com/gta-6-all-challenges-guide/' },
    { id: 'S3', name: 'Push Square — Trophy Guide and Roadmap', url: 'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap' },
    { id: 'S4', name: 'PC Gamer — GTA 6 achievements list and guide', url: 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-achievements-list/' }
  ];
  const PHASES = ['Story', 'Side & activities', 'Collectibles', 'Cleanup'];
  const STORAGE = 'leonida-ledger-progress-v1';
  let trophies = [];
  let earned = loadProgress();
  let filter = 'all';
  let selected = null;
  let spoilerFree = false;

  function loadProgress() { try { const value = JSON.parse(localStorage.getItem(STORAGE) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } }
  function save() { localStorage.setItem(STORAGE, JSON.stringify(earned)); render(); }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function refLinks(ids) { return (ids || ['S1']).map(id => `<a href="#${id}">[${id}]</a>`).join(' '); }
  function story(t) { return t.kind === 'story'; }
  function visible(t) { return !(spoilerFree && story(t) && !earned[t.id]); }
  function gradeName(grade) { return String(grade).toUpperCase(); }
  function render() {
    const count = Object.keys(earned).filter(id => earned[id]).length;
    document.querySelector('#earned-count').innerHTML = `${count}<span> / 55</span>`;
    document.querySelector('#progress-fill').style.width = `${count / 55 * 100}%`;
    document.querySelector('#progress-label').textContent = `${Math.round(count / 55 * 100)}% complete`;
    const query = document.querySelector('#search').value.trim().toLowerCase();
    const filtered = trophies.filter(t => visible(t) && (filter === 'all' || (filter === 'missable' ? t.missable : t.kind === filter)) && (!query || `${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(query)));
    document.querySelector('#trophy-list').innerHTML = filtered.map(t => `<button class="trophy-row ${selected === t.id ? 'selected' : ''} ${earned[t.id] ? 'is-earned' : ''}" data-id="${t.id}"><span class="check ${earned[t.id] ? 'checked' : ''}">${earned[t.id] ? '✓' : ''}</span><span class="trophy-name">${esc(spoilerFree && story(t) && !earned[t.id] ? 'Story trophy hidden' : t.name)}<small>${esc(t.phase)}</small></span><span class="grade grade-${esc(t.grade)}">${esc(gradeName(t.grade))}</span></button>`).join('') || '<p class="no-results">No trophies match this view.</p>';
    renderDetail(); renderRoadmap();
  }
  function renderDetail() {
    const t = trophies.find(item => item.id === selected && visible(item));
    const box = document.querySelector('#detail');
    if (!t) { box.innerHTML = '<div class="empty-state"><span class="compass">✳</span><p class="eyebrow">FIELD NOTES</p><h3>Choose a trophy</h3><p>See its official description, a practical next step, missable status and source notes.</p></div>'; return; }
    box.innerHTML = `<div class="detail-top"><span class="grade grade-${esc(t.grade)}">${esc(gradeName(t.grade))}</span><span class="detail-kind">${esc(t.kind)} · ${esc(t.phase)}</span></div><h3>${esc(t.name)}</h3><p class="official-label">OFFICIAL DESCRIPTION</p><blockquote>${esc(t.description)}</blockquote><div class="note-block"><h4>Guide</h4><p>${esc(t.guide)} ${refLinks(t.sources)}</p></div><div class="note-grid"><div><h4>Missable?</h4><p>${t.missable ? 'Potentially. Finish this before leaving its available story window; confirm the latest route before advancing.' : 'No specific one-time window is established by the cited list or guide.'}</p></div><div><h4>Roadmap step</h4><p>${esc(t.step)}</p></div></div><button class="mark-button" data-mark="${t.id}">${earned[t.id] ? '✓ Earned — undo' : 'Mark earned'}</button><p class="detail-sources">Sources ${refLinks(t.sources)} · Guide accessed 20 Nov 2026</p>`;
  }
  function renderRoadmap() {
    const host = document.querySelector('#roadmap-phases');
    host.innerHTML = PHASES.map((phase, index) => {
      const members = trophies.filter(t => t.phase === phase);
      const done = members.filter(t => earned[t.id]).length;
      return `<article class="phase-card"><div class="phase-number">0${index + 1}</div><p class="eyebrow">PHASE ${index + 1} · ${done}/${members.length} EARNED</p><h3>${esc(phase)}</h3><p>${['Complete the chapter and named missions as they unlock. Pause at the end of each chapter to check open opportunities.','Mix repeatable activities with character strands; let the checklist keep the larger counts visible.','Work through map-wide sets and locations in small, trackable batches.','Return to remaining one-off actions and raise overall completion toward the final milestone.'][index]}</p><div class="phase-trophies">${members.map(t => `<span>${earned[t.id] ? '✓' : '○'} ${esc(t.name)}</span>`).join('')}</div></article>`;
    }).join('');
  }
  async function init() {
    const response = await fetch('data/trophies.json');
    trophies = (await response.json()).trophies;
    document.querySelector('#source-list').innerHTML = SOURCES.map(s => `<li id="${s.id}"><b>[${s.id}]</b> <a href="${s.url}" target="_blank" rel="noreferrer">${esc(s.name)}</a> <span>Retrieved 20 Nov 2026</span></li>`).join('');
    document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === button)); document.querySelectorAll('.view').forEach(v => v.classList.toggle('hidden', v.id !== `view-${button.dataset.view}`)); }));
    document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button)); render(); }));
    document.querySelector('#search').addEventListener('input', render);
    document.querySelector('#trophy-list').addEventListener('click', event => { const row = event.target.closest('[data-id]'); if (!row) return; selected = row.dataset.id; render(); });
    document.querySelector('#detail').addEventListener('click', event => { const button = event.target.closest('[data-mark]'); if (!button) return; earned[button.dataset.mark] = !earned[button.dataset.mark]; save(); });
    document.querySelector('#spoiler-toggle').addEventListener('click', event => { spoilerFree = !spoilerFree; event.currentTarget.setAttribute('aria-pressed', String(spoilerFree)); event.currentTarget.classList.toggle('on', spoilerFree); render(); });
    document.querySelector('#export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ schema: 'leonida-ledger/v1', earned }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leonida-ledger-progress.json'; a.click(); URL.revokeObjectURL(a.href); });
    document.querySelector('#import-button').addEventListener('click', () => document.querySelector('#import-file').click());
    document.querySelector('#import-file').addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; try { const data = JSON.parse(await file.text()); const next = data.earned || data; earned = Object.fromEntries(Object.entries(next).filter(([id, value]) => trophies.some(t => String(t.id) === id) && value === true)); save(); } catch { alert('That progress file could not be read.'); } event.target.value = ''; });
    document.addEventListener('keydown', event => { if (event.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { event.preventDefault(); document.querySelector('#search').focus(); } });
    render();
    const shot = new URLSearchParams(location.search).get('shot');
    if (shot === 'roadmap') document.querySelector('[data-view="roadmap"]').click();
    if (shot === 'about') document.querySelector('[data-view="about"]').click();
    if (shot === 'spoiler') { spoilerFree = true; document.querySelector('#spoiler-toggle').setAttribute('aria-pressed', 'true'); render(); }
  }
  init().catch(error => { document.querySelector('#trophy-list').textContent = `Could not load the local trophy data: ${error.message}`; });
})();
