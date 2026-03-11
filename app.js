
const ENERGY_LABELS = {
  Vs: "Visionnaire",
  Cq: "Conquérant",
  Bv: "Bienveillant",
  Fb: "Fiable",
  Gt: "Garant",
  Sp: "Spontané"
};

const ENERGY_COLORS = {
  Vs: "rgba(22,75,122,0.70)",
  Cq: "rgba(62,132,200,0.70)",
  Bv: "rgba(87,160,137,0.70)",
  Fb: "rgba(127,105,150,0.70)",
  Gt: "rgba(89,119,144,0.70)",
  Sp: "rgba(232,153,69,0.70)"
};

let questions = [];
let phaseItems = [];
let profiles = [];

const intro = document.getElementById("intro");
const testSection = document.getElementById("testSection");
const reportSection = document.getElementById("reportSection");
const questionsForm = document.getElementById("questionsForm");
const phaseForm = document.getElementById("phaseForm");
const progressLabel = document.getElementById("progressLabel");
const progressBar = document.getElementById("progressBar");

document.getElementById("startBtn").addEventListener("click", async () => {
  await loadData();
  renderQuestions();
  renderPhaseItems();
  intro.classList.add("hidden");
  testSection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("calcBtn").addEventListener("click", generateReport);

async function loadData() {
  if (questions.length) return;
  const [q, p, pr] = await Promise.all([
    fetch("questions_ipp_18_25.json").then(r => r.json()),
    fetch("phase_items_ipp.json").then(r => r.json()),
    fetch("profiles_36_ipp.json").then(r => r.json()),
  ]);
  questions = q;
  phaseItems = p;
  profiles = pr;
}

function renderQuestions() {
  questionsForm.innerHTML = "";
  questions.forEach((q, idx) => {
    const div = document.createElement("section");
    div.className = "question";
    div.innerHTML = `<h3>${q.id}. ${q.text}</h3>`;
    q.options.forEach((opt, i) => {
      const id = `q${q.id}_${i}`;
      const label = document.createElement("label");
      label.className = "option";
      label.innerHTML = `<input type="radio" name="q${q.id}" value="${opt.k}" />
      <span>${opt.label}</span>`;
      label.querySelector("input").addEventListener("change", updateProgress);
      div.appendChild(label);
    });
    questionsForm.appendChild(div);
  });
  updateProgress();
}

function renderPhaseItems() {
  phaseForm.innerHTML = "";
  phaseItems.forEach(item => {
    const box = document.createElement("div");
    box.className = "phase-item";
    box.innerHTML = `<strong>${item.id}. ${item.text}</strong>`;
    const scale = document.createElement("div");
    scale.className = "scale";
    item.scale.forEach((label, idx) => {
      const id = `phase_${item.id}_${idx}`;
      const l = document.createElement("label");
      l.innerHTML = `<input type="radio" name="phase_${item.id}" value="${idx}" /> ${label}`;
      scale.appendChild(l);
    });
    box.appendChild(scale);
    phaseForm.appendChild(box);
  });
}

function updateProgress() {
  const answered = [...document.querySelectorAll('input[type="radio"]:checked')]
    .filter(el => el.name.startsWith("q")).length;
  progressLabel.textContent = `Question ${answered} / ${questions.length}`;
  const pct = (answered / questions.length) * 100;
  progressBar.style.width = `${pct}%`;
}

function getRawScores() {
  const raw = { Vs:0, Cq:0, Bv:0, Fb:0, Gt:0, Sp:0 };
  for (const q of questions) {
    const chosen = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (!chosen) return null;
    raw[chosen.value] += 1;
  }
  return raw;
}

function getPhaseScores() {
  const out = { Vs:0, Cq:0, Bv:0, Fb:0, Gt:0, Sp:0 };
  const count = { Vs:0, Cq:0, Bv:0, Fb:0, Gt:0, Sp:0 };
  for (const item of phaseItems) {
    const chosen = document.querySelector(`input[name="phase_${item.id}"]:checked`);
    if (!chosen) return null;
    out[item.k] += Number(chosen.value);
    count[item.k] += 1;
  }
  Object.keys(out).forEach(k => {
    out[k] = Math.round((out[k] / (count[k] * 4)) * 100);
  });
  return out;
}

function centeredScores(raw) {
  const c = {};
  Object.keys(raw).forEach(k => c[k] = raw[k] - 10);
  return c;
}

function pctScores(raw) {
  const p = {};
  Object.keys(raw).forEach(k => p[k] = +(raw[k] / 60 * 100).toFixed(1));
  return p;
}

function sortedEntries(obj) {
  return Object.entries(obj).sort((a,b) => b[1]-a[1]);
}

function profileFor(dominant, secondary) {
  return profiles.find(p => p.dominant === dominant && p.secondary === secondary);
}

function compatLabel(arr) {
  return arr.map(k => ENERGY_LABELS[k]).join(", ");
}

function stressLevel(score) {
  if (score < 25) return "Fluidité";
  if (score < 50) return "Tension légère";
  if (score < 75) return "Surcharge";
  return "Dérive";
}

function buildLongNarrative(profile, raw, pct, phase, username) {
  const d = ENERGY_LABELS[profile.dominant];
  const s = ENERGY_LABELS[profile.secondary];
  const phaseTop = sortedEntries(phase)[0][0];
  const phaseName = ENERGY_LABELS[phaseTop];
  return `
  <div class="card page">
    <h2>Page 1 — Présentation de votre résultat</h2>
    <p><strong>${username || "Participant"}</strong>, votre profil principal ressort comme <strong>${profile.name}</strong>, combinaison <strong>${d}</strong> en énergie de base et <strong>${s}</strong> en énergie secondaire. Ce résultat signifie que vous n’avancez pas d’abord au hasard : vous avez une logique préférentielle de fonctionnement. Cette logique influence votre manière de décider, de gérer la pression, de coopérer avec les autres, d’entrer dans l’effort et de retrouver votre équilibre quand quelque chose se complique.</p>
    <p>Le modèle IPP distingue six énergies mentales : projection, action, relation, analyse, structure et créativité. Tout le monde possède ces six registres, mais pas avec la même intensité. Votre test ne vous enferme pas dans une case ; il met surtout en lumière la combinaison qui vous vient le plus naturellement lorsque vous devez agir dans la vraie vie.</p>
    <p class="small">Lecture recommandée : commencez par le profil global, puis observez les pages stress, valeurs, compatibilités et énergie de phase pour comprendre comment vous fonctionnez quand tout va bien, puis quand la pression monte.</p>
  </div>

  <div class="card page">
    <h2>Page 2 — Votre photographie d’ensemble</h2>
    <p>Vos scores de base montrent une répartition interne de vos préférences. L’énergie dominante n’est pas forcément “meilleure” que les autres : elle est simplement plus spontanée chez vous. L’énergie secondaire nuance votre style. Les autres registres restent disponibles mais demandent souvent plus d’effort conscient.</p>
    <table>
      <thead><tr><th>Énergie</th><th>Score brut</th><th>% interne</th><th>Lecture</th></tr></thead>
      <tbody>
        ${Object.keys(raw).map(k => `<tr><td>${ENERGY_LABELS[k]}</td><td>${raw[k]} / 60</td><td>${pct[k]} %</td><td>${raw[k] >= 13 ? "Énergie très présente" : raw[k] >= 10 ? "Énergie disponible" : "Énergie moins spontanée"}</td></tr>`).join("")}
      </tbody>
    </table>
    <p>Dans votre cas, le duo <strong>${d} + ${s}</strong> crée un style personnel distinct : vous privilégiez d’abord ${d.toLowerCase()}, puis vous complétez ce fonctionnement par ${s.toLowerCase()}. C’est cette combinaison qui structure votre lecture du monde et votre façon de passer à l’action.</p>
  </div>

  <div class="card page">
    <h2>Page 3 — Description psychologique de votre profil</h2>
    <p>${profile.description}</p>
    <p>Au quotidien, cette combinaison se repère souvent dans votre manière de parler, de préparer les choses, de réagir aux imprévus et de tenir vos objectifs dans le temps. Vous pouvez être très performant lorsque l’environnement respecte votre logique naturelle, mais vous pouvez aussi vous fatiguer plus vite si l’on vous demande constamment l’inverse de votre énergie de base.</p>
    <p>Votre force n’est donc pas seulement dans “ce que vous faites”, mais dans la façon dont vous créez de l’efficacité, du sens, du lien ou de la stabilité autour de vous. Le test IPP sert précisément à rendre ce fonctionnement lisible pour que vous puissiez l’utiliser de manière plus consciente.</p>
  </div>

  <div class="card page">
    <h2>Page 4 — Vos points forts naturels</h2>
    <p>Vos principaux appuis sont les suivants :</p>
    <ul>${profile.strengths.map(s => `<li>${s}</li>`).join("")}</ul>
    <p>Quand vous êtes dans un bon niveau d’énergie, vos forces se traduisent souvent par une meilleure confiance, une impression de cohérence intérieure et une capacité plus stable à tenir dans l’effort. C’est dans ces moments-là que votre profil devient un vrai levier de performance mentale.</p>
    <p>À l’inverse, vos qualités peuvent devenir excessives sous pression. Une force mal régulée se transforme souvent en rigidité, en débordement ou en perte de lucidité. C’est pour cela qu’un bon rapport IPP ne s’arrête jamais aux qualités : il montre aussi la dérive possible.</p>
  </div>

  <div class="card page">
    <h2>Page 5 — Stress : vos étapes probables</h2>
    <p>Le stress n’efface pas votre profil ; il le déforme. En général, votre énergie dominante se protège d’abord de manière subtile, puis devient plus rigide si la pression dure. Les étapes les plus probables chez vous sont les suivantes :</p>
    <ol>${profile.stress_stages.map(s => `<li>${s}</li>`).join("")}</ol>
    <p>Repérer ces étapes tôt est fondamental. Plus vous identifiez vite la première phase de tension, plus vous avez de chances de retrouver de la marge avant la surcharge. Dans la méthode A4P, cette compétence appartient au pilier <strong>lucidité</strong> : savoir se voir en train de basculer.</p>
  </div>

  <div class="card page">
    <h2>Page 6 — Que faire pour faire face au stress</h2>
    <p>Votre régulation ne doit pas être générique. Elle doit parler votre langue mentale. Pour votre profil, les actions les plus utiles sont :</p>
    <ol>${profile.stress_actions.map(s => `<li>${s}</li>`).join("")}</ol>
    <p>Concrètement, la bonne stratégie n’est pas de lutter contre votre profil, mais d’y remettre du pilotage. Quand vous vous recentrez sur une action adaptée, vous réduisez progressivement l’emballement interne et vous retrouvez de la disponibilité mentale.</p>
    <p>Cette page peut être utilisée comme un protocole personnel. L’idéal est de la relire avant une compétition, un examen, une période de surcharge ou une conversation difficile.</p>
  </div>

  <div class="card page">
    <h2>Page 7 — Vos valeurs probables</h2>
    <p>Les valeurs ne sont pas une décoration du profil ; elles expliquent pourquoi certaines situations vous nourrissent alors que d’autres vous épuisent. Les valeurs les plus cohérentes avec votre combinaison sont :</p>
    <div>${profile.values.map(v => `<span class="badge">${v}</span>`).join("")}</div>
    <p>Quand votre environnement respecte ces repères, vous gagnez généralement en engagement, en stabilité émotionnelle et en motivation durable. Quand vos valeurs sont constamment contrariées, vous pouvez vous sentir vidé, irrité ou moins aligné sans toujours savoir pourquoi.</p>
  </div>

  <div class="card page">
    <h2>Page 8 — Profils compatibles et moins compatibles</h2>
    <p>La compatibilité ne veut pas dire “s’entendre parfaitement”. Elle indique surtout avec quels fonctionnements vous aurez le plus de facilité à coopérer, et avec lesquels il faudra davantage d’ajustement explicite.</p>
    <p><strong>Profils généralement plus compatibles :</strong> ${compatLabel(profile.compatibility.most_compatible)}.</p>
    <p><strong>Profils souvent moins spontanément compatibles :</strong> ${compatLabel(profile.compatibility.less_compatible)}.</p>
    <p>Les profils compatibles vous aident souvent à renforcer ce qui vous manque. Les profils moins compatibles vous challengent, parfois utilement, mais demandent de la traduction mutuelle. Mieux vous connaissez votre style, mieux vous pouvez coopérer sans vous crisper.</p>
  </div>

  <div class="card page">
    <h2>Page 9 — Énergie de phase : votre état actuel</h2>
    <p>Votre énergie de phase la plus haute est actuellement <strong>${phaseName}</strong>. Cela ne remplace pas votre profil de base ; cela décrit plutôt la couleur de votre période du moment. Une énergie de phase élevée peut révéler la manière dont vous vous adaptez, vous protégez ou vous mobilisez actuellement.</p>
    <table>
      <thead><tr><th>Énergie de phase</th><th>Score /100</th><th>Niveau</th></tr></thead>
      <tbody>
        ${Object.keys(phase).map(k => `<tr><td>${ENERGY_LABELS[k]}</td><td>${phase[k]}</td><td>${stressLevel(phase[k])}</td></tr>`).join("")}
      </tbody>
    </table>
    <p>Si votre énergie de phase est proche de votre énergie de base, vous êtes probablement dans une période relativement alignée. Si elle est très différente, cela peut signaler une phase d’adaptation, de fatigue, de compensation ou de tension.</p>
  </div>

  <div class="card">
    <h2>Page 10 — Synthèse finale et axes de progression</h2>
    <p>Votre lecture d’ensemble met en évidence un profil <strong>${profile.name}</strong> avec une base <strong>${d}</strong> et un appui <strong>${s}</strong>, dans une phase actuellement marquée par <strong>${phaseName}</strong>. Vous fonctionnez donc avec une logique centrale identifiable, mais aussi avec un état du moment qui peut accentuer certaines qualités ou certaines fragilités.</p>
    <p>Votre priorité n’est pas de devenir quelqu’un d’autre. Votre priorité est de mieux piloter votre manière naturelle de fonctionner. Plus vous connaissez vos appuis, vos déclencheurs de stress et vos besoins de régulation, plus vous pouvez construire un mental stable, lucide et performant.</p>
    <p>Trois axes simples peuvent servir de feuille de route : renforcer ce qui vous réussit déjà, apprendre à repérer vos premières dérives sous tension, et développer progressivement l’énergie qui vous manque le plus dans les contextes importants. C’est là que l’IPP devient utile : il transforme un résultat de test en plan de progression concret.</p>
  </div>
  `;
}

function generateReport() {
  const raw = getRawScores();
  if (!raw) {
    alert("Merci de répondre aux 60 vignettes avant de générer le rapport.");
    return;
  }
  const phase = getPhaseScores();
  if (!phase) {
    alert("Merci de répondre aux 12 questions d’énergie de phase.");
    return;
  }

  const pct = pctScores(raw);
  const centered = centeredScores(raw);
  const sorted = sortedEntries(raw);
  const dominant = sorted[0][0];
  const secondary = sorted[1][0];
  const profile = profileFor(dominant, secondary);
  const username = document.getElementById("username").value.trim();
  const tension = {
    vision_structure: Math.abs(raw.Vs - raw.Gt),
    action_relation: Math.abs(raw.Cq - raw.Bv),
    creativite_analyse: Math.abs(raw.Sp - raw.Fb)
  };
  tension.global = +(((tension.vision_structure + tension.action_relation + tension.creativite_analyse) / 3).toFixed(1));

  const reportHtml = `
    <section class="card">
      <h2>Votre rapport IPP A4P</h2>
      <p><strong>Profil principal :</strong> ${profile.name} (${ENERGY_LABELS[dominant]} + ${ENERGY_LABELS[secondary]})</p>
      <p><strong>Indice de tension interne :</strong> ${tension.global} / 10 environ en lecture relative</p>
      <div class="report-grid">
        <div class="card">
          <h3>Radar des énergies de base</h3>
          <canvas id="radarBase"></canvas>
        </div>
        <div class="card">
          <h3>Énergie de phase actuelle</h3>
          <canvas id="radarPhase"></canvas>
        </div>
      </div>
      <div class="report-grid">
        <div class="card">
          <h3>Résumé rapide</h3>
          <p>${profile.description}</p>
          <p><strong>Compatibilités :</strong> ${compatLabel(profile.compatibility.most_compatible)}</p>
          <p><strong>Moins compatibles :</strong> ${compatLabel(profile.compatibility.less_compatible)}</p>
        </div>
        <div class="card">
          <h3>Scores</h3>
          <table>
            <thead><tr><th>Énergie</th><th>Brut</th><th>%</th><th>Centré</th></tr></thead>
            <tbody>
              ${Object.keys(raw).map(k => `<tr><td>${ENERGY_LABELS[k]}</td><td>${raw[k]}</td><td>${pct[k]}</td><td>${centered[k] > 0 ? "+"+centered[k] : centered[k]}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    ${buildLongNarrative(profile, raw, pct, phase, username)}
    <section class="actions">
      <button class="btn" onclick="window.print()">Imprimer / Exporter en PDF</button>
    </section>
  `;

  reportSection.innerHTML = reportHtml;
  reportSection.classList.remove("hidden");
  testSection.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    renderRadar("radarBase", raw);
    renderRadar("radarPhase", phase);
  }, 50);
}

function renderRadar(canvasId, dataObj) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(dataObj).map(k => ENERGY_LABELS[k]),
      datasets: [{
        label: canvasId === "radarBase" ? "Énergies de base" : "Énergie de phase",
        data: Object.keys(dataObj).map(k => dataObj[k]),
        fill: true,
        backgroundColor: "rgba(22,75,122,0.18)",
        borderColor: "rgba(22,75,122,0.95)",
        pointBackgroundColor: "rgba(22,75,122,0.95)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: canvasId === "radarBase" ? 20 : 100
        }
      }
    }
  });
}
