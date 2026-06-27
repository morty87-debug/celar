const sectionTypes = {
  "Vinhistoria — viktiga årtal": "timeline",
  "Frankrikes vinhistoria": "timeline",
  "Vintillverkning — vita och rosévin": "process",
  "Vintillverkning — rödvin": "process",
  "Året i vingården": "process",
  "Vinifiering": "process",
  "Klassificeringssystemet": "default"
};

const lektionsFiler = {
  1: 'data/lektion-01-introduktion.json',
  2: 'data/lektion-02-frankrike.json',
  3: 'data/lektion-03-italien.json',
  4: 'data/lektion-04-spanien.json',
  5: 'data/lektion-05-mat-dryck-sake.json',
  6: 'data/lektion-06-bordeaux-bourgogne.json',
  7: 'data/lektion-07-portugal-starkvin.json',
  8: 'data/lektion-08-tyskland-osterrike.json',
  9: 'data/lektion-09-sommelierteori.json',
  10: 'data/lektion-10-mousserande.json',
  11: 'data/lektion-11-ol-cider.json',
  12: 'data/lektion-12-ostra-europa.json',
  13: 'data/lektion-13-sota-viner.json',
  14: 'data/lektion-14-sprit.json',
  15: 'data/lektion-15-nordamerika.json',
  16: 'data/lektion-16-sydamerika.json',
  17: 'data/lektion-17-oceanien.json',
  18: 'data/lektion-18-sydafrika-asien.json',
  19: 'data/lektion-19-somm-praktisk.json'
};

function getLektionId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

async function loadGrapeData() {
  try {
    const res = await fetch('data/druvor.json');
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function loadGrapeNames() {
  try {
    const data = await loadGrapeData();
    return data.map(d => d.namn).filter(Boolean).sort((a, b) => b.length - a.length);
  } catch (e) {
    return [];
  }
}

async function loadLessonGrapes() {
  try {
    const res = await fetch('data/lektion-druvor.json');
    return await res.json();
  } catch (e) {
    return {};
  }
}

function linkifyGrapes(html, grapeNames) {
  if (!grapeNames.length) return html;
  const pattern = new RegExp(`\\b(${grapeNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
  // Split on existing HTML tags to avoid replacing inside tag attributes
  const parts = html.split(/(<[^>]+>)/);
  return parts.map(part => {
    if (part.startsWith('<')) return part;
    return part.replace(pattern, '<a href="druvor.html#$1" class="grape-link">$1</a>');
  }).join('');
}

function trackLessonVisit(id) {
  try {
    const progress = JSON.parse(localStorage.getItem('celar-progress')) || {};
    if (!progress[id]) {
      progress[id] = { timestamp: Date.now() };
      localStorage.setItem('celar-progress', JSON.stringify(progress));
    }
  } catch (e) {}
}

async function loadLektion() {
  const id = getLektionId();
  trackLessonVisit(id);
  const fil = lektionsFiler[id];
  if (!fil) {
    document.getElementById('lektionContent').innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding:4rem;">Lektionen är inte tillgänglig ännu.</p>';
    return;
  }

  const [res, grapeNames, grapeData, lessonGrapeMap] = await Promise.all([
    fetch(fil), loadGrapeNames(), loadGrapeData(), loadLessonGrapes()
  ]);
  const data = await res.json();

  document.querySelector('.lektion-title').textContent = data.titel;
  if (data.undertitel) {
    document.querySelector('.lektion-subtitle').textContent = data.undertitel;
  }

  const totalLektioner = Object.keys(lektionsFiler).length;
  document.querySelector('.lektion-badge').textContent = `Lektion ${id} av 19`;

  const nav = document.getElementById('sectionNav');
  const content = document.getElementById('lektionContent');

  data.sektioner.forEach((sektion, idx) => {
    const sectionId = `section-${idx}`;
    const num = String(idx + 1).padStart(2, '0');
    const type = sektion.typ || sectionTypes[sektion.rubrik] || 'default';

    const pill = document.createElement('a');
    pill.href = `#${sectionId}`;
    pill.className = 'nav-pill';
    pill.textContent = sektion.rubrik;
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(pill);

    let factsHtml = '';
    sektion.innehall.forEach(fact => {
      let processed = fact;

      if (type === 'timeline') {
        const match = fact.match(/^(\d+[\s]?(?:f\.Kr|e\.Kr)?[\s]?(?:f\.Kr)?[-:]?\s?(?:talet)?[:\s])/);
        if (match) {
          const year = match[1].replace(/:?\s*$/, '');
          const rest = fact.slice(match[0].length);
          processed = `<span class="fact-year">${year}</span> ${rest}`;
        }
      }

      processed = processed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\b(Vitis Vinifera|Vitis Labrusca|Vitis Rupestris|TCA|MLF|AOC|AOP|AOC\/AOP|OIV|IGP|VDQS|VdP|NV|DRC|LVMH|phylloxera|véraison|pigeage|remontage|botrytis|méthode traditionnelle)\b/gi,
          '<strong>$1</strong>');

      processed = linkifyGrapes(processed, grapeNames);
      factsHtml += `<div class="fact-item">${processed}</div>\n`;
    });

    const sectionHtml = `
      <section class="content-section" id="${sectionId}" data-type="${type}" style="animation-delay: ${idx * 0.05}s">
        <div class="content-section-header">
          <span class="content-section-number">${num}</span>
          <h2 class="content-section-title">${sektion.rubrik}</h2>
        </div>
        <div class="fact-list">
          ${factsHtml}
        </div>
      </section>
    `;
    content.insertAdjacentHTML('beforeend', sectionHtml);
  });

  // Add lesson grapes section
  const lessonGrapeNames = lessonGrapeMap[String(id)] || [];
  if (lessonGrapeNames.length > 0) {
    const grapesByName = {};
    grapeData.forEach(g => { grapesByName[g.namn] = g; });

    let cardsHtml = '';
    lessonGrapeNames.forEach(name => {
      const g = grapesByName[name];
      const typ = g ? g.typ : 'vit';
      const arom = g && g.aromer && g.aromer.frukt ? g.aromer.frukt.split(',')[0].trim() : '';
      const aromHtml = arom ? `<span class="lesson-grape-arom">${arom}</span>` : '';
      cardsHtml += `<a href="druvor.html#${encodeURIComponent(name)}" class="lesson-grape-card">
        <span class="lesson-grape-dot ${typ}"></span>
        <span class="lesson-grape-name">${name}</span>
        ${aromHtml}
      </a>`;
    });

    const grapesSection = document.createElement('div');
    grapesSection.className = 'lesson-grapes-section';
    grapesSection.innerHTML = `
      <div class="lesson-grapes-header">
        <h2 class="content-section-title">Druvor i denna lektion</h2>
      </div>
      <div class="lesson-grapes-grid">${cardsHtml}</div>
    `;
    content.appendChild(grapesSection);
  }

  // Add quiz button
  const quizLink = document.createElement('div');
  quizLink.className = 'lesson-quiz-link';
  quizLink.innerHTML = '<a href="quiz.html?mode=blandad" class="lesson-quiz-btn">Testa dina kunskaper →</a>';
  content.appendChild(quizLink);

  setupScrollSpy();
  setupNavigation(id);
}

function setupNavigation(currentId) {
  const footer = document.querySelector('.footer');
  const navHtml = document.createElement('div');
  navHtml.className = 'lektion-footer-nav';

  let html = '';
  if (currentId > 1 && lektionsFiler[currentId - 1]) {
    html += `<a href="lektion.html?id=${currentId - 1}" class="lektion-nav-btn prev">← Föregående lektion</a>`;
  }
  if (lektionsFiler[currentId + 1]) {
    html += `<a href="lektion.html?id=${currentId + 1}" class="lektion-nav-btn next">Nästa lektion →</a>`;
  }
  navHtml.innerHTML = html;
  footer.parentNode.insertBefore(navHtml, footer);
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('.content-section');
  const pills = document.querySelectorAll('.nav-pill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach(pill => {
          pill.classList.toggle('active', pill.getAttribute('href') === `#${id}`);
        });
        const activePill = document.querySelector('.nav-pill.active');
        if (activePill) {
          activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}

loadLektion();
