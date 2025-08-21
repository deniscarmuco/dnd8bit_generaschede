// Funzioni DOM standalone
export async function caricaOpzioni(selectId, jsonFile, descBoxId) {
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
    });
  } catch (error) {
    console.error(`Errore nel caricamento di ${jsonFile}`, error);
  }
}
