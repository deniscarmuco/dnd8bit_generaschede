// ===============================
// Utils comuni
// ===============================
function calcolaModificatore(valore) {
  const num = parseInt(valore, 10);
  if (isNaN(num)) return 0;
  return Math.floor((num - 10) / 2);
}

const bonusRazza = {
  "Nano": { costituzione: 2 },
  "Elfo": { destrezza: 2 },
  "Umano": { forza: 1, destrezza: 1, costituzione: 1, intelligenza: 1, saggezza: 1, carisma: 1 },
  "Mezzorco": { forza: 2, costituzione: 1 },
  "Halfling": { destrezza: 2 }
};

const dadiVita = {
  "Barbaro": 12,
  "Guerriero": 10,
  "Paladino": 10,
  "Ranger": 10,
  "Chierico": 8,
  "Druido": 8,
  "Ladro": 8,
  "Monaco": 8,
  "Bardo": 8,
  "Mago": 6,
  "Stregone": 6,
  "Warlock": 8
};

// ===============================
// Caricamento opzioni da JSON (solo crea.html)
// ===============================
async function caricaOpzioni(selectId, jsonFile, descBoxId) {
  const select = document.getElementById(selectId);
  const descBox = document.getElementById(descBoxId);
  if (!select) return;

  try {
    const response = await fetch(`data/${jsonFile}`);
    const data = await response.json();

    select.innerHTML = `<option value="">-- Nessuna --</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.nome;
      opt.textContent = item.nome;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      const scelta = data.find(el => el.nome === select.value);
      if (descBox) descBox.textContent = scelta ? scelta.descrizione : "";
      if (selectId === "razzaSelect") {
        syncStatsWithRace();
        aggiornaDerivati();
      }
      if (selectId === "classeSelect") {
        aggiornaAbilitaClasse();
        aggiornaDerivati();
      }
    });
  } catch (error) {
    console.error(`Errore nel caricamento di ${jsonFile}`, error);
  }
}

// ===============================
// Inizializzazione per CREA.HTML
// ===============================
(function initCrea() {
  const form = document.getElementById("characterForm");
  if (!form) return;

  // Selettori
  const razzaSel = document.getElementById("razzaSelect");
  const classeSel = document.getElementById("classeSelect");
  const livelloInput = form.querySelector("input[name='livello']");
  const pfInput = form.querySelector("input[name='pf']");
  const pfMsg = document.getElementById("pf-msg");
  const caInput = form.querySelector("input[name='classe_armatura']");
  const caMsg = document.getElementById("ca-msg");
  const rollBtn = document.getElementById("roll-stats-btn");

  const statInputs = {
    forza: form.querySelector("input[name='forza']"),
    destrezza: form.querySelector("input[name='destrezza']"),
    costituzione: form.querySelector("input[name='costituzione']"),
    intelligenza: form.querySelector("input[name='intelligenza']"),
    saggezza: form.querySelector("input[name='saggezza']"),
    carisma: form.querySelector("input[name='carisma']")
  };

  // Memorizza valori base
  Object.values(statInputs).forEach(inp => {
    const v = parseInt(inp.value, 10);
    inp.dataset.base = isNaN(v) ? 10 : v;
  });

  // Carico opzioni
  caricaOpzioni("razzaSelect", "razze.json", "razzaDesc");
  caricaOpzioni("classeSelect", "classi.json", "classeDesc");
  caricaOpzioni("backgroundSelect", "background.json", "backgroundDesc");

  // Funzioni derivate
  function calcolaVisione() {
    const razza = razzaSel.value;
    return razza === "Elfo" || razza === "Nano" ? "Scurovisione 18m" : "Visione normale";
  }
  function calcolaVelocità() {
    const razza = razzaSel.value;
    return razza === "Nano" ? "25 piedi" : "30 piedi";
  }
  function getRaceBonusFor(stat) {
    const razza = razzaSel ? razzaSel.value : "";
    return (bonusRazza[razza] && bonusRazza[razza][stat]) ? bonusRazza[razza][stat] : 0;
  }
  function calcolaBonusCompetenza(livello) {
    if (livello >= 17) return 6;
    if (livello >= 13) return 5;
    if (livello >= 9) return 4;
    if (livello >= 5) return 3;
    return 2;
  }
  function syncStatsWithRace() {
    Object.keys(statInputs).forEach(stat => {
      const inp = statInputs[stat];
      const base = parseInt(inp.dataset.base || inp.value || 10, 10);
      const bonus = getRaceBonusFor(stat);
      inp.value = base + bonus;
    });
    aggiornaModificatori();
  }
  function calcolaPF() {
    const classe = classeSel ? classeSel.value : "";
    const livello = parseInt(livelloInput.value, 10) || 1;
    const cos = parseInt(statInputs.costituzione.value, 10) || 10;
    const modCOS = calcolaModificatore(cos);
    if (!dadiVita[classe]) return "";
    let pf = dadiVita[classe] + modCOS;
    if (livello > 1) {
      const perLiv = Math.floor(dadiVita[classe] / 2) + 1 + modCOS;
      pf += perLiv * (livello - 1);
    }
    return Math.max(1, pf);
  }
  function calcolaCA() {
    const armaturaEl = document.querySelector("input[name='armatura']:checked");
    const modDES = calcolaModificatore(statInputs.destrezza.value);
    let ca = 10 + modDES;
    if (armaturaEl) {
      const armatura = armaturaEl.value;
      if (armatura === "Cuoio") ca = 11 + modDES;
      else if (armatura === "Maglia") ca = 16;
      else if (armatura === "Piastre") ca = 18;
    }
    const el = document.getElementById("ca-value");
    if (el) el.textContent = ca;
    return ca;
  }

  // Aggiorna derivati
  function aggiornaPF() { pfInput.value = calcolaPF(); if (pfMsg) pfMsg.textContent = ""; }
  function aggiornaCA() { caInput.value = calcolaCA(); if (caMsg) caMsg.textContent = ""; }
  function aggiornaDerivati() {
    aggiornaPF();
    aggiornaCA();
    aggiornaBonusCompetenza();
    document.getElementById("percezione-passiva").textContent = calcolaPercezionePassiva();
    document.getElementById("intelligenza-passiva").textContent = calcolaIntelligenzaPassiva();
    document.getElementById("visione").textContent = calcolaVisione();
    document.getElementById("velocità").textContent = calcolaVelocità();
    document.getElementById("competenze").textContent = getCompetenze().join(", ");
  }
  function aggiornaBonusCompetenza() {
    const livello = parseInt(livelloInput.value, 10) || 1;
    const bonus = calcolaBonusCompetenza(livello);
    const el = document.getElementById("bonus-competenza");
    if (el) el.textContent = `+${bonus}`;
  }
  function aggiornaModificatori() {
    Object.keys(statInputs).forEach(stat => {
      const el = document.getElementById(`mod-${stat}`);
      if (!el) return;
      const mod = calcolaModificatore(statInputs[stat].value);
      el.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
    });
  }

  // Eventi sugli input
  Object.keys(statInputs).forEach(stat => {
    const inp = statInputs[stat];
    inp.addEventListener("input", () => {
      const v = parseInt(inp.value, 10);
      const bonus = getRaceBonusFor(stat);
      if (!isNaN(v)) inp.dataset.base = v - bonus;
      aggiornaModificatori();
      aggiornaDerivati();
    });
  });
  if (razzaSel) razzaSel.addEventListener("change", () => { syncStatsWithRace(); aggiornaDerivati(); });
  if (classeSel) classeSel.addEventListener("change", aggiornaDerivati);
  if (livelloInput) livelloInput.addEventListener("input", () => { aggiornaPF(); aggiornaBonusCompetenza(); });

  // Roll stats
  function rollStat() {
    const r = [0,0,0,0].map(() => Math.floor(Math.random() * 6) + 1).sort((a,b) => b - a);
    return r[0] + r[1] + r[2];
  }
  function rollAllStats() {
    Object.keys(statInputs).forEach(stat => {
      statInputs[stat].dataset.base = rollStat();
    });
    syncStatsWithRace();
    aggiornaDerivati();
  }
  if (rollBtn) rollBtn.addEventListener("click", rollAllStats);

  // Abilità classe
  function aggiornaAbilitaClasse() {
    const container = document.getElementById("abilita-container");
    if (!container) return;
    const cl = classeSel ? classeSel.value : "";
    container.textContent = cl ? `Abilità aggiornate per la classe: ${cl}` : "";
  }
  window.aggiornaAbilitaClasse = aggiornaAbilitaClasse;

  // Derivate extra
  function calcolaPercezionePassiva() {
    const modSAG = calcolaModificatore(statInputs.saggezza.value);
    const livello = parseInt(livelloInput.value, 10) || 1;
    const bonus = calcolaBonusCompetenza(livello);
    const haComp = getCompetenze().includes("Percezione");
    return 10 + modSAG + (haComp ? bonus : 0);
  }
  function calcolaIntelligenzaPassiva() {
    const modINT = calcolaModificatore(statInputs.intelligenza.value);
    const livello = parseInt(livelloInput.value, 10) || 1;
    const bonus = calcolaBonusCompetenza(livello);
    const haComp = getCompetenze().includes("Investigare");
    return 10 + modINT + (haComp ? bonus : 0);
  }

  // Submit unico
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const dati = {};
    formData.forEach((val, key) => dati[key] = val);
    dati.classe_armatura = calcolaCA();
    dati.pf = calcolaPF();
    dati.percezionePassiva = calcolaPercezionePassiva();
    dati.intelligenzaPassiva = calcolaIntelligenzaPassiva();
    dati.visione = calcolaVisione();
    dati.velocità = calcolaVelocità();
    dati.competenze = getCompetenze();
    localStorage.setItem("schedaPersonaggio", JSON.stringify(dati));
    window.location.href = "scheda.html";
  });

  syncStatsWithRace();
  aggiornaDerivati();
})();


// ===============================
// Inizializzazione per SCHEDA.HTML
// ===============================
function initScheda() {
  if (!window.location.pathname.endsWith("scheda.html")) return;
  const dati = JSON.parse(localStorage.getItem("schedaPersonaggio"));
  if (!dati) return;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? "-"; };
  set("nomePersonaggio", dati.nome);
  set("razza", dati.razza);
  set("classe", dati.classe);
  set("background", dati.background);
  set("livello", dati.livello);
  set("allineamento", dati.allineamento);
  set("forza", dati.forza);
  set("destrezza", dati.destrezza);
  set("costituzione", dati.costituzione);
  set("intelligenza", dati.intelligenza);
  set("saggezza", dati.saggezza);
  set("carisma", dati.carisma);
  set("pf", dati.pf);
  set("equipaggiamento", dati.equipaggiamento);
  set("note", dati.note);
  set("classe_armatura", dati.classe_armatura);
  set("percezione-passiva", dati.percezionePassiva);
  set("intelligenza-passiva", dati.intelligenzaPassiva);
  set("visione", dati.visione);
  set("velocità", dati.velocità);
  set("competenze", Array.isArray(dati.competenze) ? dati.competenze.join(", ") : "-");

  // modificatori
  ["forza","destrezza","costituzione","intelligenza","saggezza","carisma"].forEach(s => {
    const el = document.getElementById(`mod-${s}`);
    if (el) {
      const mod = calcolaModificatore(dati[s]);
      el.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
    }
  });

  // Coordinate su PDF
  const coords = {
    nome:{x:40,y:25}, 
    razza:{x:83.54,y:7.7}, 
    classe:{x:128.62,y:7.7}, 
    livello:{x:157.18,y:7.7},
    background:{x:189.3,y:7.7}, 
    ca:{x:67.1,y:26.05}, 
    pf_max:{x:134.03,y:19.3},
    forza:{x:20.75,y:45.51}, 
    mod_forza:{x:20.75,y:52.51},
    destrezza:{x:48.75,y:45.51}, 
    mod_destrezza:{x:48.75,y:52.51},
    costituzione:{x:83.75,y:45.51}, 
    mod_costituzione:{x:83.75,y:52.51},
    intelligenza:{x:114.75,y:45.51}, 
    mod_intelligenza:{x:114.75,y:52.51},
    saggezza:{x:145.75,y:45.51}, 
    mod_saggezza:{x:145.75,y:52.51},
    carisma:{x:184.75,y:45.51}, 
    mod_carisma:{x:184.75,y:52.51},
    equipaggiamento:{x:30,y:133.51}, 
    note:{x:171.15,y:160.51},
    abilita:{x:20.75,y:170.51}, 
    percezione_passiva:{x:46,y:85},
    intelligenza_passiva:{x:95,y:85}, 
    visione:{x:34,y:88}, 
    velocita:{x:83,y:88}, 
    competenze:{x:36,y:211}
  };

    // --- SOTTOPARTE: handler "Salva PDF" robusto ---
  const pdfBtn = document.getElementById("download-pdf-btn");
  if (!pdfBtn) return;

  // risolve jsPDF in modo cross-CDN
  function getJsPDFCtor() {
    try {
      if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF; // UMD (CDN moderno)
      if (typeof window.jsPDF === "function") return window.jsPDF;        // globale vecchio
    } catch (e) {}
    return null;
  }

  // disegna tutto il testo
  function drawAll(doc, dati, coords) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    const drawCentered = (text, x, y, maxWidth) => {
      if (!text && text !== 0) text = "";
      if (typeof text === "string" && maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y, { align: "center" });
      } else {
        doc.text(String(text), x, y, { align: "center" });
      }
    };

    // campi principali
    drawCentered(dati.nome || "-", coords.nome.x, coords.nome.y);
    drawCentered(dati.razza || "-", coords.razza.x, coords.razza.y);
    drawCentered(dati.classe || "-", coords.classe.x, coords.classe.y);
    drawCentered(dati.livello || "-", coords.livello.x, coords.livello.y);
    drawCentered(dati.background || "-", coords.background.x, coords.background.y);

    // CA
    drawCentered(dati.classe_armatura || "-", coords.ca.x, coords.ca.y);

    // Stat
    drawCentered(dati.forza || "-", coords.forza.x, coords.forza.y);
    drawCentered(dati.destrezza || "-", coords.destrezza.x, coords.destrezza.y);
    drawCentered(dati.costituzione || "-", coords.costituzione.x, coords.costituzione.y);
    drawCentered(dati.intelligenza || "-", coords.intelligenza.x, coords.intelligenza.y);
    drawCentered(dati.saggezza || "-", coords.saggezza.x, coords.saggezza.y);
    drawCentered(dati.carisma || "-", coords.carisma.x, coords.carisma.y);

    // Mod
    drawCentered(calcolaModificatore(dati.forza), coords.mod_forza.x, coords.mod_forza.y);
    drawCentered(calcolaModificatore(dati.destrezza), coords.mod_destrezza.x, coords.mod_destrezza.y);
    drawCentered(calcolaModificatore(dati.costituzione), coords.mod_costituzione.x, coords.mod_costituzione.y);
    drawCentered(calcolaModificatore(dati.intelligenza), coords.mod_intelligenza.x, coords.mod_intelligenza.y);
    drawCentered(calcolaModificatore(dati.saggezza), coords.mod_saggezza.x, coords.mod_saggezza.y);
    drawCentered(calcolaModificatore(dati.carisma), coords.mod_carisma.x, coords.mod_carisma.y);

    // PF
    drawCentered(dati.pf || "-", coords.pf_max.x, coords.pf_max.y);

    // Campi lunghi
    drawCentered(dati.equipaggiamento || "-", coords.equipaggiamento.x, coords.equipaggiamento.y, 80);
    drawCentered(dati.note || "-", coords.note.x, coords.note.y, 80);

    // Derivati (attenzione a “velocità”/“velocita”)
    const vel = dati["velocità"] ?? dati.velocita ?? "-";
    drawCentered(dati.percezionePassiva || "-", coords.percezione_passiva.x, coords.percezione_passiva.y);
    drawCentered(dati.intelligenzaPassiva || "-", coords.intelligenza_passiva.x, coords.intelligenza_passiva.y);
    drawCentered(dati.visione || "-", coords.visione.x, coords.visione.y);
    drawCentered(vel, coords.velocita.x, coords.velocita.y);

    // Competenze
    const comp = Array.isArray(dati.competenze) ? dati.competenze.join(", ") : (dati.competenze || "-");
    drawCentered(comp, coords.competenze.x, coords.competenze.y, 100);
  }

  pdfBtn.addEventListener("click", () => {
    const JsPDF = getJsPDFCtor();
    if (!JsPDF) {
      console.error("jsPDF non trovato: controlla lo script CDN e l’ordine dei tag <script>.");
      alert("Errore: jsPDF non è caricato. Verifica lo script CDN e che venga caricato prima di scheda.js.");
      return;
    }

    const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

    // tenta PNG poi JPG
    const candidates = ["assets/images/Scheda_base.png", "assets/images/Scheda_base.jpg"];

    function tryLoadBg(i) {
      if (i >= candidates.length) {
        console.warn("Sfondo non caricato: procedo senza background.");
        drawAll(doc, dati, coords);
        const nomeFile = `${(dati.nome || "scheda_personaggio").replace(/\s+/g, "_")}.pdf`;
        doc.save(nomeFile);
        return;
      }
      const path = candidates[i];
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        const ext = path.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";
        try {
          doc.addImage(img, ext, 0, 0, 210, 297);
        } catch (e) {
          console.warn("addImage fallita, procedo senza sfondo:", e);
        }
        drawAll(doc, dati, coords);
        const nomeFile = `${(dati.nome || "scheda_personaggio").replace(/\s+/g, "_")}.pdf`;
        doc.save(nomeFile);
      };
      img.onerror = function (err) {
        console.warn("Impossibile caricare sfondo:", path, err);
        tryLoadBg(i + 1);
      };
      img.src = path;
    }

    tryLoadBg(0);
  });

// ===============================
// Utility competenze
// ===============================
function getCompetenze() {
  const competenze = [];
  document.querySelectorAll("input[name='competenza']:checked").forEach(el => {
    competenze.push(el.value);
  });
  return competenze;
}
}