let allDruvor = [];
let currentFilter = 'alla';
let currentSearch = '';

function getFavorites() {
  return JSON.parse(localStorage.getItem('cellar-favorites') || '[]');
}

function toggleFavorite(name) {
  let favs = getFavorites();
  if (favs.includes(name)) {
    favs = favs.filter(f => f !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem('cellar-favorites', JSON.stringify(favs));
  // Update heart button in modal
  const btn = document.querySelector('.fav-btn');
  if (btn) btn.classList.toggle('active', favs.includes(name));
  // Re-render if filtering by favorites
  if (currentFilter === 'favoriter') renderDruvor();
}

async function loadDruvor() {
  const res = await fetch('data/druvor.json');
  allDruvor = await res.json();
  allDruvor.sort((a, b) => a.namn.localeCompare(b.namn, 'sv'));
  renderDruvor();
  setupControls();

  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash) {
    const match = allDruvor.find(d => d.namn.toLowerCase() === hash.toLowerCase());
    if (match) openModal(match);
  }
}

function renderDruvor() {
  const grid = document.getElementById('druvorGrid');
  const count = document.getElementById('druvCount');
  grid.innerHTML = '';

  const filtered = allDruvor.filter(d => {
    if (currentFilter === 'favoriter') {
      if (!getFavorites().includes(d.namn)) return false;
    } else if (currentFilter !== 'alla' && d.typ !== currentFilter) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const searchable = [
        d.namn,
        d.ursprung,
        d.aromer?.frukt || '',
        d.aromer?.ovrigt || '',
        ...(d.synonymer || []),
        ...(d.regioner || []),
        ...(d.matparning || [])
      ].join(' ').toLowerCase();
      return searchable.includes(q);
    }
    return true;
  });

  count.textContent = `${filtered.length} druvor`;

  filtered.forEach((druva, i) => {
    const card = document.createElement('div');
    card.className = 'druv-card';
    card.style.animationDelay = `${i * 0.02}s`;
    card.style.animation = 'fadeUp 0.4s ease-out backwards';

    const aromerText = [druva.aromer?.frukt, druva.aromer?.ovrigt]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 80);

    const tags = (druva.regioner || []).slice(0, 3);

    card.innerHTML = `
      <div class="druv-card-header">
        <span class="druv-type-dot ${druva.typ}"></span>
        <span class="druv-card-name">${druva.namn}</span>
        <span class="druv-card-origin">${druva.ursprung || ''}</span>
      </div>
      <div class="druv-card-aromer">${aromerText}${aromerText.length >= 80 ? '…' : ''}</div>
      <div class="druv-card-tags">
        ${tags.map(t => `<span class="druv-tag">${t}</span>`).join('')}
      </div>
    `;

    card.addEventListener('click', () => openModal(druva));
    grid.appendChild(card);
  });
}

function meterPercent(value) {
  if (!value) return 0;
  const v = value.toLowerCase();
  if (v.includes('hög') || v.includes('full')) return 90;
  if (v.includes('medium+') || v.includes('medium+ till hög')) return 75;
  if (v.includes('medium') && !v.includes('+') && !v.includes('-')) return 55;
  if (v.includes('medium-') || v.includes('medium- till medium')) return 40;
  if (v.includes('låg') || v.includes('lätt')) return 20;
  return 50;
}

function openModal(druva) {
  const modal = document.getElementById('druvModal');
  const content = document.getElementById('modalContent');

  const synonymer = (druva.synonymer || []).length
    ? `<p class="modal-synonymer">Synonymer: ${druva.synonymer.join(', ')}</p>` : '';

  const k = druva.karaktar || {};

  let metersHtml = '';
  if (k.syra) {
    metersHtml += meterRow('Syra', k.syra, 'syra');
  }
  if (k.tanniner) {
    metersHtml += meterRow('Tanniner', k.tanniner, 'tanniner');
  }
  if (k.kropp) {
    metersHtml += meterRow('Kropp', k.kropp, 'kropp');
  }

  const regioner = (druva.regioner || []).map(r =>
    `<span class="modal-region-tag">${r}</span>`).join('');

  const matparning = (druva.matparning || []).map(m =>
    `<span class="modal-mat-tag">${m}</span>`).join('');

  const isFav = getFavorites().includes(druva.namn);
  content.innerHTML = `
    <button class="fav-btn${isFav ? ' active' : ''}" onclick="toggleFavorite('${druva.namn.replace(/'/g, "\\'")}')">&#9829;</button>
    <h2 class="modal-grape-name">${druva.namn}</h2>
    <p class="modal-grape-type ${druva.typ}">${druva.typ === 'vit' ? '● Vit druva' : '● Röd druva'}</p>
    <p class="modal-origin">${druva.ursprung || ''}</p>
    ${synonymer}

    <div class="modal-section">
      <h3 class="modal-section-title">Aromer</h3>
      ${druva.aromer?.frukt ? `<p class="modal-arom-row"><span class="modal-arom-label">Frukt:</span> ${druva.aromer.frukt}</p>` : ''}
      ${druva.aromer?.ovrigt ? `<p class="modal-arom-row"><span class="modal-arom-label">Övrigt:</span> ${druva.aromer.ovrigt}</p>` : ''}
    </div>

    ${metersHtml ? `<div class="modal-section">
      <h3 class="modal-section-title">Karaktär</h3>
      ${metersHtml}
      ${k.alkohol ? `<div class="modal-meter"><span class="modal-meter-label">Alkohol</span><span class="modal-meter-value">${k.alkohol}</span></div>` : ''}
    </div>` : ''}

    ${druva.stil ? `<div class="modal-section">
      <h3 class="modal-section-title">Stil</h3>
      <div class="modal-stil">${druva.stil}</div>
    </div>` : ''}

    ${regioner ? `<div class="modal-section">
      <h3 class="modal-section-title">Regioner</h3>
      <div class="modal-regioner">${regioner}</div>
    </div>` : ''}

    ${matparning ? `<div class="modal-section">
      <h3 class="modal-section-title">Matparning</h3>
      <div class="modal-matparning">${matparning}</div>
    </div>` : ''}
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function meterRow(label, value, cls) {
  const pct = meterPercent(value);
  return `
    <div class="modal-meter">
      <span class="modal-meter-label">${label}</span>
      <div class="modal-meter-bar">
        <div class="modal-meter-fill ${cls}" style="width: ${pct}%"></div>
      </div>
      <span class="modal-meter-value">${value}</span>
    </div>
  `;
}

function closeModal() {
  document.getElementById('druvModal').classList.remove('open');
  document.body.style.overflow = '';
}

function setupControls() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderDruvor();
    });
  });

  document.getElementById('druvSearch').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderDruvor();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('druvModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

loadDruvor();
