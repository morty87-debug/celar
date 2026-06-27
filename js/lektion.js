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
  3: 'data/lektion-03-italien.json'
};

function getLektionId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

async function loadLektion() {
  const id = getLektionId();
  const fil = lektionsFiler[id];
  if (!fil) {
    document.getElementById('lektionContent').innerHTML =
      '<p style="text-align:center;color:var(--text-muted);padding:4rem;">Lektionen är inte tillgänglig ännu.</p>';
    return;
  }

  const res = await fetch(fil);
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
