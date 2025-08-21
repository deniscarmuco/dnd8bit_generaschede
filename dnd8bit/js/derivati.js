// Funzioni per il calcolo dei valori derivati
import { calcolaModificatore, calcolaBonusCompetenza } from './utils/statUtils.js';

export function calcolaVisione(razza) {
  return razza === "Elfo" || razza === "Nano" ? "Scurovisione 18m" : "Visione normale";
}

export function calcolaVelocità(razza) {
  return razza === "Nano" ? "7.5 metri" : "8 metri";
}

export function calcolaPF(classe, livello, costituzione, dadiVita, bonusPfPerLivello = 0) {
  const modCOS = calcolaModificatore(costituzione);
  if (!dadiVita[classe]) return "";
  let pf = dadiVita[classe] + modCOS;
  if (livello > 1) {
    const perLiv = Math.floor(dadiVita[classe] / 2) + 1 + modCOS;
    pf += perLiv * (livello - 1);
  }
  pf += bonusPfPerLivello * livello;
  return Math.max(1, pf);
}

export function calcolaCA(armatura, modDES) {
  if (armatura === "Cuoio") return 11 + modDES;
  if (armatura === "Maglia") return 16;
  if (armatura === "Piastre") return 18;
  return 10 + modDES;
}

export function calcolaPercezionePassiva(saggezza, livello) {
  const modSAG = calcolaModificatore(saggezza);
  const bonusCompetenza = calcolaBonusCompetenza(livello);
  return 10 + modSAG + 2; // +2 di default, personalizza se vuoi gestire le competenze
}

export function calcolaIntelligenzaPassiva(intelligenza, livello) {
  const modINT = calcolaModificatore(intelligenza);
  const bonusCompetenza = calcolaBonusCompetenza(livello);
  return 10 + modINT + 2; // +2 di default, personalizza se vuoi gestire le competenze
}
