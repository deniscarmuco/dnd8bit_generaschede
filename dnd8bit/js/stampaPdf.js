document.addEventListener("DOMContentLoaded", function() {
  const pdfBtn = document.getElementById("download-pdf-btn");
  if (!pdfBtn) return;
  pdfBtn.addEventListener("click", function() {
    if (!window.jspdf) {
      alert("jsPDF non è caricato.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Raccogli i dati dalla pagina o da localStorage se non presenti
    const datiStorage = JSON.parse(localStorage.getItem("schedaPersonaggio")) || {};
    const getVal = (id, key) => {
      const el = document.getElementById(id);
      if (el && el.textContent && el.textContent !== "-") return el.textContent;
      if (datiStorage[key] && datiStorage[key] !== "-") return datiStorage[key];
      return "-";
    };
    const dati = {
      nome: getVal("nomePersonaggio", "nome"),
      razza: getVal("razza", "razza"),
      classe: getVal("classe", "classe"),
      background: getVal("background", "background"),
      livello: getVal("livello", "livello"),
      allineamento: getVal("allineamento", "allineamento"),
      forza: getVal("forza", "forza"),
      destrezza: getVal("destrezza", "destrezza"),
      costituzione: getVal("costituzione", "costituzione"),
      intelligenza: getVal("intelligenza", "intelligenza"),
      saggezza: getVal("saggezza", "saggezza"),
      carisma: getVal("carisma", "carisma"),
      pf: getVal("pf", "pf"),
      classe_armatura: getVal("classe_armatura", "classe_armatura"),
      visione: getVal("visione", "visione"),
      velocita: getVal("velocità", "velocità"),
      percezione_passiva: getVal("percezione-passiva", "percezione_passiva"),
      intelligenza_passiva: getVal("intelligenza-passiva", "intelligenza_passiva"),
      equipaggiamento: getVal("equipaggiamento", "equipaggiamento"),
      note: getVal("note", "note")
    };
    let y = 15;
    doc.setFontSize(16);
    doc.text("Scheda Personaggio D&D", 10, y);
    doc.setFontSize(12);
    y += 10;
    // Calcolo modificatori
    function mod(val) {
      const n = parseInt(val, 10);
      if (isNaN(n)) return 0;
      const m = Math.floor((n - 10) / 2);
      return m >= 0 ? `+${m}` : `${m}`;
    }
    // Stampa statistiche e modificatori
    const stats = ["forza","destrezza","costituzione","intelligenza","saggezza","carisma"];
    stats.forEach(stat => {
      doc.text(`${stat}: ${dati[stat]} (${mod(dati[stat])})`, 10, y);
      y += 8;
    });
    // Stampa PF e Allineamento
    doc.text(`Punti Ferita: ${dati.pf}`, 10, y); y += 8;
    doc.text(`Allineamento: ${dati.allineamento || '-'}`, 10, y); y += 8;
    // Stampa gli altri campi
    Object.entries(dati).forEach(([campo, valore]) => {
      if (!stats.includes(campo) && campo !== "pf" && campo !== "allineamento") {
        doc.text(`${campo}: ${valore}`, 10, y);
        y += 8;
      }
    });
    doc.save("scheda_personaggio.pdf");
  });
});
