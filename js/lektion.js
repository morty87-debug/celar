const sectionTypes = {
  "Vinhistoria — viktiga årtal": "timeline",
  "Vintillverkning — vita och rosévin": "process",
  "Vintillverkning — rödvin": "process",
  "Året i vingården": "process"
};

async function loadLektion() {
  const res = await fetch('data/lektion-01-introduktion.json');
  const data = await res.json();

  const nav = document.getElementById('sectionNav');
  const content = document.getElementById('lektionContent');

  data.sektioner.forEach((sektion, idx) => {
    const sectionId = `section-${idx}`;
    const num = String(idx + 1).padStart(2, '0');
    const type = sectionTypes[sektion.rubrik] || 'default';

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
        .replace(/\b(Vitis Vinifera|Vitis Labrusca|Vitis Rupestris|TCA|MLF|AOC|OIV|phylloxera|véraison|pigeage|remontage)\b/gi,
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
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('.content-section');
  const pills = document.querySelectorAll('.nav-pill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach((pill, i) => {
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
