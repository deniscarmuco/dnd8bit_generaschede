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
  document.getElementById("visione").textContent = calcolaVisione(razzaSel.value);
  document.getElementById("velocità").textContent = calcolaVelocità(razzaSel.value);
  // Aggiorna percezione e intelligenza passiva
  document.getElementById("percezione-passiva").textContent = calcolaPercezionePassiva(statInputs.saggezza.value, livelloInput.value);
  document.getElementById("intelligenza-passiva").textContent = calcolaIntelligenzaPassiva(statInputs.intelligenza.value, livelloInput.value);
}
