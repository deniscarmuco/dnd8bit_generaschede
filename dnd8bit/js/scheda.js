import { calcolaModificatore, calcolaBonusCompetenza, rollStat } from './utils/statUtils.js';
import { caricaOpzioni } from './utils/domUtils.js';
import { calcolaVisione, calcolaVelocità, calcolaPF, calcolaCA, calcolaPercezionePassiva, calcolaIntelligenzaPassiva } from './derivati.js';
import { aggiornaModificatori, aggiornaBonusCompetenza, aggiornaDerivati } from './uiUpdater.js';

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
    aggiornaModificatori(statInputs);
  }
  Object.keys(statInputs).forEach(stat => {
    const inp = statInputs[stat];
    inp.addEventListener("input", () => {
      const v = parseInt(inp.value, 10);
      const bonus = getRaceBonusFor(stat);
      if (!isNaN(v)) inp.dataset.base = v - bonus;
      aggiornaModificatori(statInputs);
      aggiornaDerivati(statInputs, livelloInput, razzaSel);
    });
  });
  if (razzaSel) razzaSel.addEventListener("change", () => { syncStatsWithRace(); aggiornaDerivati(statInputs, livelloInput, razzaSel); });
  if (classeSel) classeSel.addEventListener("change", () => aggiornaDerivati(statInputs, livelloInput, razzaSel));
  if (livelloInput) livelloInput.addEventListener("input", () => { aggiornaBonusCompetenza(livelloInput); aggiornaDerivati(statInputs, livelloInput, razzaSel); });
  if (rollBtn) rollBtn.addEventListener("click", () => {
    Object.keys(statInputs).forEach(stat => {
      statInputs[stat].dataset.base = rollStat();
    });
    syncStatsWithRace();
    aggiornaDerivati(statInputs, livelloInput, razzaSel);
    // Aggiorna PF dopo il lancio dei dadi
    if (pfInput && classeSel && livelloInput && statInputs.costituzione) {
      const pf = calcolaPF(
        classeSel.value,
        parseInt(livelloInput.value, 10) || 1,
        statInputs.costituzione.value,
        dadiVita,
        getBonusPfPerLivello()
      );
      pfInput.value = pf;
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const dati = {};
    formData.forEach((val, key) => dati[key] = val);
    dati.classe_armatura = calcolaCA(
      document.querySelector("input[name='armatura']:checked")?.value,
      calcolaModificatore(statInputs.destrezza.value)
    );
    dati.pf = calcolaPF(
      classeSel.value,
      parseInt(livelloInput.value, 10) || 1,
      statInputs.costituzione.value,
      dadiVita,
      getBonusPfPerLivello()
    );
    dati.visione = calcolaVisione(razzaSel.value);
    dati.velocità = calcolaVelocità(razzaSel.value);
    dati.percezione_passiva = calcolaPercezionePassiva(statInputs.saggezza.value, livelloInput.value);
    dati.intelligenza_passiva = calcolaIntelligenzaPassiva(statInputs.intelligenza.value, livelloInput.value);
    localStorage.setItem("schedaPersonaggio", JSON.stringify(dati));
    window.location.href = "scheda.html";
  });
  // Aggiornamento realtime CA
  const caValueSpan = document.getElementById("ca-value");
  const armatureInputs = document.querySelectorAll("input[name='armatura']");
  if (caValueSpan && armatureInputs.length) {
    function aggiornaCARealtime() {
      const armatura = document.querySelector("input[name='armatura']:checked")?.value;
      const modDES = calcolaModificatore(statInputs.destrezza.value);
      const ca = calcolaCA(armatura, modDES);
      caValueSpan.textContent = ca;
      const caHidden = document.getElementById("classe_armatura");
      if (caHidden) caHidden.value = ca;
    }
    armatureInputs.forEach(input => input.addEventListener("change", aggiornaCARealtime));
    if (statInputs.destrezza) statInputs.destrezza.addEventListener("input", aggiornaCARealtime);
    aggiornaCARealtime();
  }
  // Aggiornamento realtime PF
  window.aggiornaPFRealtime = function aggiornaPFRealtime() {
    if (pfInput && classeSel && livelloInput && statInputs.costituzione) {
      const pf = calcolaPF(
        classeSel.value,
        parseInt(livelloInput.value, 10) || 1,
        statInputs.costituzione.value,
        dadiVita,
        getBonusPfPerLivello()
      );
      pfInput.value = pf;
    }
  };
  if (pfInput && classeSel && livelloInput && statInputs.costituzione) {
    classeSel.addEventListener("change", window.aggiornaPFRealtime);
    livelloInput.addEventListener("input", window.aggiornaPFRealtime);
    statInputs.costituzione.addEventListener("input", window.aggiornaPFRealtime);
    window.aggiornaPFRealtime();
  }

  syncStatsWithRace();
  aggiornaDerivati(statInputs, livelloInput, razzaSel);
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
  set("visione", dati.visione);
  set("velocità", dati.velocità);
  set("percezione-passiva", dati.percezione_passiva);
  set("intelligenza-passiva", dati.intelligenza_passiva);
  // modificatori
  ["forza","destrezza","costituzione","intelligenza","saggezza","carisma"].forEach(s => {
    const el = document.getElementById(`mod-${s}`);
    if (el) {
      const mod = calcolaModificatore(dati[s]);
      el.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initScheda();
});