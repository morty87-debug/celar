let druvor = [];
let questions = [];
let current = 0;
let score = 0;
let answered = false;
const TOTAL_Q = 15;

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

async function init() {
  if (!mode) return;
  document.getElementById('hubGrid').style.display = 'none';
  document.getElementById('quizWrap').style.display = 'block';

  const res = await fetch('data/druvor.json');
  druvor = await res.json();

  questions = generateQuestions(mode);
  showQuestion();
}

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function pickOther(arr, exclude, n) {
  return pick(arr.filter(x => x !== exclude), n);
}

function generateQuestions(mode) {
  const all = [];

  if (mode === 'druvor' || mode === 'blandad') {
    all.push(...generateDruvQuestions());
  }
  if (mode === 'regioner' || mode === 'blandad') {
    all.push(...generateRegionQuestions());
  }
  if (mode === 'fakta' || mode === 'blandad') {
    all.push(...generateFaktaQuestions());
  }
  if (mode === 'parning' || mode === 'blandad') {
    all.push(...generateParningQuestions());
  }
  if (mode === 'provning' || mode === 'blandad') {
    all.push(...generateProvningQuestions());
  }

  return pick(all, TOTAL_Q);
}

function generateDruvQuestions() {
  const qs = [];
  const vita = druvor.filter(d => d.typ === 'vit');
  const roda = druvor.filter(d => d.typ === 'röd');

  druvor.forEach(d => {
    if (d.aromer?.frukt) {
      qs.push({
        cat: 'Druvor',
        q: `Vilken druva har dessa fruktaromer: "${d.aromer.frukt}"?`,
        correct: d.namn,
        wrong: pickOther(druvor.filter(x => x.typ === d.typ), d, 3).map(x => x.namn),
        explain: `${d.namn} är en ${d.typ} druva från ${d.ursprung || 'okänt ursprung'}. ${d.stil || ''}`
      });
    }

    if (d.karaktar?.syra) {
      qs.push({
        cat: 'Druvor',
        q: `Vilken syranivå har ${d.namn}?`,
        correct: d.karaktar.syra,
        wrong: pickOther(['Låg', 'Medium-', 'Medium', 'Medium+', 'Medium+ till hög', 'Hög'], d.karaktar.syra, 3),
        explain: `${d.namn}: syra ${d.karaktar.syra}${d.karaktar.tanniner ? ', tanniner ' + d.karaktar.tanniner : ''}.`
      });
    }

    if (d.synonymer?.length) {
      qs.push({
        cat: 'Druvor',
        q: `"${d.synonymer[0]}" är en synonym för vilken druva?`,
        correct: d.namn,
        wrong: pickOther(druvor, d, 3).map(x => x.namn),
        explain: `${d.namn} kallas även: ${d.synonymer.join(', ')}.`
      });
    }

    if (d.typ === 'röd' && d.karaktar?.tanniner) {
      qs.push({
        cat: 'Druvor',
        q: `Vilken tanninnivå har ${d.namn}?`,
        correct: d.karaktar.tanniner,
        wrong: pickOther(['Låg till medium-', 'Medium- till medium', 'Medium', 'Medium till medium+', 'Medium+ till hög', 'Hög'], d.karaktar.tanniner, 3),
        explain: `${d.namn} har tanniner: ${d.karaktar.tanniner}. ${d.aromer?.ovrigt ? 'Övrigt: ' + d.aromer.ovrigt : ''}`
      });
    }

    if (d.regioner?.length >= 2) {
      qs.push({
        cat: 'Druvor',
        q: `I vilken av dessa regioner odlas ${d.namn}?`,
        correct: d.regioner[0],
        wrong: pickOther(druvor.flatMap(x => x.regioner || []), d.regioner[0], 3),
        explain: `${d.namn} odlas i: ${d.regioner.join(', ')}.`
      });
    }

    qs.push({
      cat: 'Druvor',
      q: `Är ${d.namn} en vit eller röd druva?`,
      correct: d.typ === 'vit' ? 'Vit druva' : 'Röd druva',
      wrong: d.typ === 'vit' ? ['Röd druva'] : ['Vit druva'],
      explain: `${d.namn} är en ${d.typ} druva.`
    });
  });

  return qs;
}

function generateRegionQuestions() {
  const regions = [
    { region: 'Champagne', land: 'Frankrike', druvor: 'Chardonnay, Pinot Noir, Meunier', fakta: '17 Grand Cru-byar, kalkstensmark, méthode traditionnelle' },
    { region: 'Bordeaux', land: 'Frankrike', druvor: 'Cabernet Sauvignon, Merlot', fakta: 'Vänster strand (Cab Sauv) vs höger strand (Merlot). 1855 klassificering.' },
    { region: 'Bourgogne', land: 'Frankrike', druvor: 'Pinot Noir, Chardonnay', fakta: 'Grand Cru → Premier Cru → Village → Régional. Terroir-fokus.' },
    { region: 'Barossa Valley', land: 'Australien', druvor: 'Shiraz, Grenache', fakta: 'Äldsta vinstockar (1843). Old Vine Charter. Inga phylloxera.' },
    { region: 'Marlborough', land: 'Nya Zeeland', druvor: 'Sauvignon Blanc', fakta: '2/3 av NZ:s vingårdar. 28 000 ha.' },
    { region: 'Rioja', land: 'Spanien', druvor: 'Tempranillo, Garnacha', fakta: 'DOCa. Crianza/Reserva/Gran Reserva. Tre delområden.' },
    { region: 'Piemonte', land: 'Italien', druvor: 'Nebbiolo, Barbera, Dolcetto', fakta: 'Barolo och Barbaresco. Moscato d\'Asti.' },
    { region: 'Toscana', land: 'Italien', druvor: 'Sangiovese', fakta: 'Chianti, Brunello, Super Toscana. Sassicaia.' },
    { region: 'Mosel', land: 'Tyskland', druvor: 'Riesling', fakta: 'Branta skiffersluttningar. Kabinett-stilens hemvist.' },
    { region: 'Douro', land: 'Portugal', druvor: 'Touriga Nacional, Tinta Roriz', fakta: 'Portvin. Skifferjord. Tre delområden.' },
    { region: 'Mendoza', land: 'Argentina', druvor: 'Malbec', fakta: '76% av all argentinsk vin. Valle de Uco upp till 2000m.' },
    { region: 'Napa Valley', land: 'USA', druvor: 'Cabernet Sauvignon', fakta: '16 sub-AVAs. Judgment of Paris 1976.' },
    { region: 'Stellenbosch', land: 'Sydafrika', druvor: 'Cabernet Sauvignon, Shiraz', fakta: 'Mest berömda i Sydafrika. False Bay.' },
    { region: 'Wachau', land: 'Österrike', druvor: 'Grüner Veltliner, Riesling', fakta: 'Steinfeder/Federspiel/Smaragd. Donau.' },
    { region: 'Tokaj', land: 'Ungern', druvor: 'Furmint', fakta: 'Aszú — botrytis. Puttonyos. Eszencia min 450 g/L.' },
    { region: 'Jerez', land: 'Spanien', druvor: 'Palomino', fakta: 'Sherry-triangeln. Albariza-jord. Flor. Solera.' },
    { region: 'Priorat', land: 'Spanien', druvor: 'Garnacha, Cariñena', fakta: 'DOCa. Licorella (skiffer). Gamla vinstockar.' },
    { region: 'Chablis', land: 'Frankrike', druvor: 'Chardonnay', fakta: 'Kimmeridge-kalksten. 7 Grand Cru. Mineraldrivet.' },
    { region: 'Swartland', land: 'Sydafrika', druvor: 'Shiraz, Chenin Blanc', fakta: 'Naturvinsrevolution sedan 2000. Torrodling.' },
    { region: 'Santorini', land: 'Grekland', druvor: 'Assyrtiko', fakta: 'Vulkanjord. Kouloura-träning. Ogympade vinstockar.' }
  ];

  const qs = [];
  regions.forEach(r => {
    qs.push({
      cat: 'Regioner',
      q: `Vilka druvor är viktigast i ${r.region}?`,
      correct: r.druvor,
      wrong: pickOther(regions, r, 3).map(x => x.druvor),
      explain: `${r.region} (${r.land}): ${r.fakta}`
    });
    qs.push({
      cat: 'Regioner',
      q: `I vilket land ligger ${r.region}?`,
      correct: r.land,
      wrong: pickOther([...new Set(regions.map(x => x.land))], r.land, 3),
      explain: `${r.region} ligger i ${r.land}. Druvor: ${r.druvor}.`
    });
    qs.push({
      cat: 'Regioner',
      q: `Vilken region matchar: "${r.fakta}"?`,
      correct: r.region,
      wrong: pickOther(regions, r, 3).map(x => x.region),
      explain: `${r.region} (${r.land}): ${r.druvor}.`
    });
  });
  return qs;
}

function generateFaktaQuestions() {
  const fakta = [
    { q: 'Vad är TCA?', correct: 'Korkfel — klorföreningar reagerar med mögel i korken', wrong: ['Tanninsyra i ekfat', 'En jästtyp vid fermentering', 'En klassificering i Bordeaux'], explain: 'TCA (2,4,6-trikloranisol) ger doft av fuktigt papper och möglig källare. 2-4% av alla korkar drabbas.' },
    { q: 'Vad är MLF (malolaktisk jäsning)?', correct: 'Omvandlar äpplesyra till mjölksyra', wrong: ['En typ av ekfatslagring', 'En skördeteknik', 'En klassificeringsnivå i Bourgogne'], explain: 'MLF ger mjukare, rundare viner med smörig karaktär.' },
    { q: 'Vad betyder "Brut Nature" på en champagneflaska?', correct: '0-3 g/L socker — torrast möjliga', wrong: ['12-17 g/L socker', '32-50 g/L socker', 'Naturvin utan tillsatser'], explain: 'Dosage-nivåer: Brut Nature (0-3), Extra Brut (0-6), Brut (0-12), Extra Dry (12-17), Sec (17-32), Demi-Sec (32-50), Doux (50+).' },
    { q: 'Vad är appassimento?', correct: 'Druvor torkas för att koncentrera socker och smak', wrong: ['En jäsningsmetod i tank', 'En typ av ekfat', 'En italiensk klassificering'], explain: 'Appassimento används för Amarone (torrt) och Recioto (sött) i Veneto.' },
    { q: 'Vilken år skapades Bordeaux-klassificeringen?', correct: '1855', wrong: ['1789', '1935', '1976'], explain: '1855 för Napoleon III:s världsutställning i Paris. 5 nivåer, 61 châteaux. Enda ändringen: Mouton-Rothschild 1973.' },
    { q: 'Vad är "Judgment of Paris"?', correct: 'Blindprovning 1976 där Kalifornien slog Frankrike', wrong: ['Bordeaux-klassificeringen 1855', 'Den franska revolutionens påverkan på vin', 'Paris vinmässa årlig tävling'], explain: 'Chateau Montelena (vitt) och Stag\'s Leap (rött) slog franska toppviner.' },
    { q: 'Vad betyder AOC/AOP?', correct: 'Appellation d\'Origine Contrôlée/Protégée — högsta franska klassificeringen', wrong: ['Association of Organic Cellars', 'Alleen Oude Cuvée — belgisk term', 'Assemblage d\'Origine Classique'], explain: 'AOC grundades 1935 i Frankrike. 2012 ersattes det officiellt av AOP (EU-harmonisering) men båda används.' },
    { q: 'Vad är flor-jäst?', correct: 'Jästhinna som skyddar Sherry från oxidation', wrong: ['En typ av vinfel', 'En druvsort i Jerez', 'En filtreringsmetod'], explain: 'Flor ger Fino och Manzanilla sin unika, nötiga karaktär. Bildas vid 15% alkohol.' },
    { q: 'Vilken temperatur ska rött vin serveras i?', correct: '14-18°C', wrong: ['6-8°C', '20-22°C', '8-12°C'], explain: 'Vitt: 6-12°C, Rosé: 6-12°C, Rött: 14-18°C, Mousserande: 6-8°C.' },
    { q: 'Vad är Reinheitsgebot?', correct: 'Tyska renhetslagen för öl från 1516', wrong: ['Österrikisk vinlag', 'Schweizisk oststandard', 'Tysk vinklassificering'], explain: 'Reinheitsgebot: öl får bara innehålla humle, malt och vatten (jäst lades till senare).' },
    { q: 'Vad är DOCG i Italien?', correct: 'Denominazione di Origine Controllata e Garantita — högsta nivån', wrong: ['Den näst högsta klassificeringen', 'En regional beteckning utan krav', 'En kvalitetsstämpel för olivolja'], explain: 'DOCG: kontrollbanderoll på flaskan. Ca 70 DOCG-viner i Italien.' },
    { q: 'Vad är en Grand Cru i Bourgogne?', correct: 'Toppläge — egen appellation, bästa vingårdarna', wrong: ['En producent som äger flera vingårdar', 'Ett ålderskrav på vinet', 'Den billigaste kategorin'], explain: 'Grand Cru = 1-2% av Bourgognes produktion. Topplägen på sluttningen.' },
    { q: 'Vad är méthode traditionnelle?', correct: 'Andra jäsning i flaskan — Champagne-metoden', wrong: ['Jäsning i stor tank', 'Handskördning av druvor', 'Lagring i ekfat'], explain: 'Stegen: basvin → liqueur de tirage → 2:a jäsning i flaska → riddling → dégorgement → dosage.' },
    { q: 'Vad är phylloxera?', correct: 'Vinlus som attackerar rötterna — förstörde Europas vingårdar på 1860-talet', wrong: ['En svampsjukdom', 'En typ av jäst', 'En druvsort'], explain: 'Phylloxera löstes genom att ympa europeiska vinstockar på amerikanska rotstockar.' },
    { q: 'Vad är véraison?', correct: 'Druvorna börjar mjukna och ändra färg — sockerhalten ökar', wrong: ['Beskärning av vinstocken', 'Skörd av druvorna', 'Pressning av musten'], explain: 'Véraison sker ca 100 dagar innan skörd. Röda druvor får färg, vita blir guldtonade.' },
    { q: 'Vad är Solera-systemet?', correct: 'Gradvis blandning av årgångar genom criaderas', wrong: ['En typ av ekfat', 'En temperaturkontrollmetod', 'En druvsort i Spanien'], explain: 'Solera används för Sherry, Brandy de Jerez och Marsala. Ger konsekvent stil.' },
    { q: 'Vad mäter Oechsle?', correct: 'Sockerhalt i druvmust — avgör Prädikat-nivå i Tyskland', wrong: ['Syranivå i vin', 'Alkoholhalt i färdigt vin', 'Tanninnivå'], explain: 'Kabinett: 67-82 Oe, Spätlese: högre, Auslese: ännu högre, TBA: 150+.' },
    { q: 'Vad är Brettanomyces?', correct: 'Vildjäst — ger stall-, plåster- och läderdoft', wrong: ['En ädel mögelsort', 'En druvsort i Sydafrika', 'En typ av korkfel'], explain: 'Brett kan ge komplexitet i små mängder men överskuggar frukt i stora. Vanlig i gamla ekfat.' }
  ];

  return fakta.map(f => ({ cat: 'Fakta', ...f }));
}

function generateParningQuestions() {
  const pairs = [
    { mat: 'Grillat lamm med rosmarin', correct: 'Syrah / Shiraz', wrong: ['Riesling', 'Pinot Grigio', 'Moscato d\'Asti'], explain: 'Syrahs peppriga kryddighet speglar rosmarinen. Kraftfull kropp matchar lammets fett.' },
    { mat: 'Ostron', correct: 'Champagne eller Chablis', wrong: ['Amarone', 'Barolo', 'Zinfandel'], explain: 'Champagnes kolsyra och mineralitet lyfter ostronens sälta. Chablis Kimmeridge = fossilostron.' },
    { mat: 'Kryddig thai-curry', correct: 'Off-dry Riesling', wrong: ['Tanninrikt Cabernet Sauvignon', 'Barolo', 'Oloroso Sherry'], explain: 'Sötma och frukt motverkar chili-hetta. Tanniner förstärker hetta — undvik.' },
    { mat: 'Pasta med tomatsås och basilika', correct: 'Sangiovese (Chianti)', wrong: ['Sauternes', 'Eiswein', 'Champagne'], explain: 'Sangioveses höga syra matchar tomatens syra. Körsbär och örter kompletterar.' },
    { mat: 'Getost-sallad', correct: 'Sauvignon Blanc (Sancerre)', wrong: ['Port', 'Amarone', 'Shiraz'], explain: 'Sancerres höga syra och citrus-toner matchar getostens syrlighet.' },
    { mat: 'Chokladdessert', correct: 'Recioto / Ruby Port', wrong: ['Chablis', 'Muscadet', 'Vinho Verde'], explain: 'Grundregeln: vinet måste vara lika sött eller sötare än desserten.' },
    { mat: 'Sushi och sashimi', correct: 'Fino Sherry eller Albariño', wrong: ['Barolo', 'Amarone', 'Châteauneuf-du-Pape'], explain: 'Fino Sherrys saltiga profil under flor matchar rå fisk och soja perfekt.' },
    { mat: 'Roquefort (blåmögelost)', correct: 'Sauternes', wrong: ['Vinho Verde', 'Prosecco', 'Beaujolais Nouveau'], explain: 'Salt + sött = magi. Sauternes honungstoner balanserar ostens intensiva sälta.' },
    { mat: 'BBQ-glaserade spareribs', correct: 'Zinfandel eller Malbec', wrong: ['Chablis', 'Riesling Kabinett', 'Pinot Grigio'], explain: 'Zinfandels mogna frukt matchar BBQ-glasyrens sötma och rökighet.' },
    { mat: 'Tryffel-risotto', correct: 'Pinot Noir (Bourgogne)', wrong: ['Moscato d\'Asti', 'Prosecco', 'Vinho Verde'], explain: 'Pinot Noirs jordiga undertoner är den klassiska matchningen till tryffel.' },
    { mat: 'Wiener schnitzel', correct: 'Grüner Veltliner', wrong: ['Barolo', 'Amarone', 'Port'], explain: 'Österrikes nationaldruva med vitpeppar och citrus — klassisk till schnitzel.' },
    { mat: 'Hummer med smörsås', correct: 'Fyllig Chardonnay (Meursault)', wrong: ['Fino Sherry', 'Lambrusco', 'Beaujolais'], explain: 'Chardonnays smör- och briochetoner matchar hummerns fett och smörsåsen.' }
  ];

  return pairs.map(p => ({
    cat: 'Mat & Vin',
    q: `Vilket vin passar bäst till: ${p.mat}?`,
    correct: p.correct,
    wrong: p.wrong,
    explain: p.explain
  }));
}

function generateProvningQuestions() {
  return [
    { cat: 'Provning', q: 'Vad står BLIK för i kvalitetsbedömning?', correct: 'Balans, Längd, Intensitet, Komplexitet', wrong: ['Bukett, Läge, Import, Kvalitet', 'Bitterhet, Lager, Ister, Kropp', 'Blommig, Lätt, Intensiv, Klar'], explain: 'BLIK: varje parameter 0/0.5/1 poäng. Totalt 0-4 poäng = Låg till Hög kvalitet.' },
    { cat: 'Provning', q: 'Hur många poäng ges totalt i provningsmetodiken?', correct: '40 poäng', wrong: ['20 poäng', '50 poäng', '100 poäng'], explain: 'Utseende 5p + Näsa 10p + Gom 16p + Slutsats 9p = 40 poäng.' },
    { cat: 'Provning', q: 'Vilka röda druvor ger ljus färg?', correct: 'Pinot Noir, Grenache, Nebbiolo, Gamay', wrong: ['Cabernet Sauvignon, Malbec, Tannat', 'Syrah, Primitivo, Touriga Nacional', 'Sagrantino, Petit Verdot, Mourvèdre'], explain: 'Ljusa röda: PN, Grenache, Nebbiolo, Sangiovese, Trousseau, Poulsard, Gamay, Nerello Mascalese.' },
    { cat: 'Provning', q: 'Vad indikerar "tårar" (legs) på glaset?', correct: 'Hög alkoholhalt', wrong: ['Hög syra', 'Höga tanniner', 'Vinfel'], explain: 'Dickare, långsammare tårar = högre alkohol. Säger inget om kvalitet.' },
    { cat: 'Provning', q: 'Vilken vitvin-druva har hög aromatisk intensitet?', correct: 'Gewürztraminer, Muscat, Sauvignon Blanc', wrong: ['Melon de Bourgogne, Aligoté, Pinot Blanc', 'Chardonnay, Sémillon, Marsanne', 'Trebbiano, Garganega, Chasselas'], explain: 'Högaromatiska: Sauvignon Blanc, Torrontés, Muscat, Gewürztraminer, Viognier.' },
    { cat: 'Provning', q: 'Vad är "retronasal" doft?', correct: 'Arom uppfattad inifrån munnen', wrong: ['Doft från korkens undersida', 'Lukt som försvinner snabbt', 'En typ av vinfel'], explain: 'Det mesta vi kallar "smak" är egentligen retronasal doft — aromer som stiger från munnen till näsan.' },
    { cat: 'Provning', q: 'Vad betyder "längd" vid vinprovning?', correct: 'Hur länge smaken sitter kvar efter att man svalt', wrong: ['Hur länge vinet kan lagras', 'Flaskans höjd', 'Antal sekunder man luktar'], explain: 'Kort: <5s, Medium: 5-10s, Lång: 10+s. Längre = ofta högre kvalitet.' },
    { cat: 'Provning', q: 'Vilken servetemperatur gäller för mousserande vin?', correct: '6-8°C', wrong: ['14-18°C', '10-12°C', '18-20°C'], explain: 'Mousserande: 6-8°C, Vitt: 6-12°C, Rosé: 6-12°C, Rött: 14-18°C.' },
    { cat: 'Provning', q: 'Vad är "tertiära" aromer?', correct: 'Aromer från lagring — torkad frukt, nötter, kryddor', wrong: ['Fruktiga aromer från druvan', 'Aromer från ekfat och jäsning', 'Defektaromer'], explain: 'Primära: druva. Sekundära: vinmakeri (ek, jäsning). Tertiära: lagring (5+ år).' },
    { cat: 'Provning', q: 'Vad indikerar hög salivproduktion vid provning?', correct: 'Hög syra i vinet', wrong: ['Höga tanniner', 'Hög alkohol', 'Hög sötma'], explain: 'Mer saliv = högre syra. Tanniner ger istället en torkande, astringent känsla.' },
    { cat: 'Provning', q: 'Vad betyder "torrt" vin?', correct: 'Max 4 g/L restsocker', wrong: ['Vinet har aldrig kontakt med vatten', 'Druvor torkade före pressning', 'Vinet lagrats utan ek'], explain: 'Torrt ≤4 g/L, halvtorrt ≤18, halvsött 18-45, sött 45+ g/L.' },
    { cat: 'Provning', q: 'Vilka druvor ger höga tanniner?', correct: 'Nebbiolo, Cabernet Sauvignon, Tannat, Sagrantino', wrong: ['Pinot Noir, Gamay, Grenache', 'Dolcetto, Barbera, Trousseau', 'Merlot, Cinsault, Poulsard'], explain: 'Hög tannin: Nebbiolo, Cab Sauv, Tannat, Malbec, Sagrantino, Petit Verdot, Syrah.' }
  ];
}

function showQuestion() {
  const box = document.getElementById('quizBox');

  if (current >= questions.length) {
    showResults();
    return;
  }

  const q = questions[current];
  answered = false;
  const pct = (current / questions.length) * 100;
  const allOpts = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);

  box.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <span class="quiz-progress-text">${current + 1} / ${questions.length}</span>
    </div>
    <div class="quiz-category-label">${q.cat}</div>
    <div class="quiz-q">${q.q}</div>
    <div class="quiz-opts" id="opts">
      ${allOpts.map(o => `<button class="quiz-opt" onclick="answer(this,'${escHtml(o)}','${escHtml(q.correct)}')">${o}</button>`).join('')}
    </div>
    <div class="quiz-explain" id="explain">${q.explain}</div>
    <button class="quiz-next" id="nextBtn" onclick="nextQ()">Nästa fråga →</button>
  `;
}

function escHtml(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function answer(btn, selected, correct) {
  if (answered) return;
  answered = true;

  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach(o => {
    o.disabled = true;
    if (o.textContent === correct) o.classList.add('correct');
  });

  if (selected === correct) {
    score++;
  } else {
    btn.classList.add('wrong');
  }

  document.getElementById('explain').classList.add('show');
  document.getElementById('nextBtn').classList.add('show');
}

function nextQ() {
  current++;
  showQuestion();
}

function showResults() {
  const box = document.getElementById('quizBox');
  const pct = Math.round((score / questions.length) * 100);
  let msg = 'Fortsätt plugga!';
  if (pct >= 90) msg = 'Fantastiskt! Du är redo för examen! 🏆';
  else if (pct >= 70) msg = 'Bra jobbat! Nästan där! 👏';
  else if (pct >= 50) msg = 'Halvvägs — fortsätt öva! 💪';

  // Save quiz result to history
  try {
    const history = JSON.parse(localStorage.getItem('cellar-quiz-history')) || [];
    history.push({ mode: mode, score: score, total: questions.length, timestamp: Date.now() });
    localStorage.setItem('cellar-quiz-history', JSON.stringify(history));
  } catch (e) {}

  box.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-score">${pct}%</div>
      <div class="quiz-results-label">${msg}</div>
      <div class="quiz-results-breakdown">
        <div class="quiz-rb-item"><div class="quiz-rb-num">${score}</div><div class="quiz-rb-label">Rätt</div></div>
        <div class="quiz-rb-item"><div class="quiz-rb-num">${questions.length - score}</div><div class="quiz-rb-label">Fel</div></div>
        <div class="quiz-rb-item"><div class="quiz-rb-num">${questions.length}</div><div class="quiz-rb-label">Totalt</div></div>
      </div>
      <button class="quiz-restart" onclick="restart()">Kör igen</button>
      <br><br>
      <a href="quiz.html" style="color:var(--text-muted);font-size:0.85rem;">← Tillbaka till quiz-menyn</a>
    </div>
  `;
}

function restart() {
  current = 0;
  score = 0;
  answered = false;
  questions = generateQuestions(mode);
  showQuestion();
}

init();
