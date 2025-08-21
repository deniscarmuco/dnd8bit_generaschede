// Funzioni statistiche standalone
export function calcolaModificatore(valore) {
  const num = parseInt(valore, 10);
  if (isNaN(num)) return 0;
  return Math.floor((num - 10) / 2);
}

export function calcolaBonusCompetenza(livello) {
  if (livello >= 17) return 6;
  if (livello >= 13) return 5;
  if (livello >= 9) return 4;
  if (livello >= 5) return 3;
  return 2;
}

export function rollStat() {
  const r = [0,0,0,0].map(() => Math.floor(Math.random() * 6) + 1).sort((a,b) => b - a);
  return r[0] + r[1] + r[2];
}
