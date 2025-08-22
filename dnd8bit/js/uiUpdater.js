// Funzioni per aggiornare la UI
import { calcolaModificatore, calcolaBonusCompetenza } from './utils/statUtils.js';
import { calcolaVisione, calcolaVelocità, calcolaPercezionePassiva, calcolaIntelligenzaPassiva } from './derivati.js';

export function aggiornaModificatori(statInputs) {
  Object.keys(statInputs).forEach(stat => {
    const el = document.getElementById(`mod-${stat}`);
    if (!el) return;
    const mod = calcolaModificatore(statInputs[stat].value);
    el.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
  });
}

export function aggiornaBonusCompetenza(livelloInput) {
  const livello = parseInt(livelloInput.value, 10) || 1;
  const bonus = calcolaBonusCompetenza(livello);
  const el = document.getElementById("bonus-competenza");
  if (el) el.textContent = `+${bonus}`;
}

export function aggiornaDerivati(statInputs, livelloInput, razzaSel) {
  // Aggiorna visione e velocità
  const visioneEl = document.getElementById("visione");
  if (visioneEl) visioneEl.textContent = calcolaVisione(razzaSel.value);
  const velocitaEl = document.getElementById("velocità");
  if (velocitaEl) velocitaEl.textContent = calcolaVelocità(razzaSel.value);
  // Aggiorna percezione e intelligenza passiva
  const percezioneEl = document.getElementById("percezione-passiva");
  if (percezioneEl) percezioneEl.textContent = calcolaPercezionePassiva(statInputs.saggezza.value, livelloInput.value);
  const intellEl = document.getElementById("intelligenza-passiva");
  if (intellEl) intellEl.textContent = calcolaIntelligenzaPassiva(statInputs.intelligenza.value, livelloInput.value);
}
