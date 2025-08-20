// main.js

document.addEventListener("DOMContentLoaded", () => {
// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  let currentStep = 0;

  function showStep(step) {
    steps.forEach((el, index) => {
      el.classList.toggle("active", index === step);
    });
  }

  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Carica dati da JSON
  fetch("data/razze.json")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("razzaSelect");
      data.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.nome;
        opt.textContent = r.nome;
        select.appendChild(opt);
      });
    });

  fetch("data/classi.json")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("classeSelect");
      data.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.nome;
        opt.textContent = c.nome;
        select.appendChild(opt);
      });
    });

  // Salvataggio dati e redirect
  document.getElementById("characterForm").addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {};
    formData.forEach((v, k) => obj[k] = v);
    localStorage.setItem("schedaPersonaggio", JSON.stringify(obj));
    window.location.href = "scheda.html";
  });

  showStep(currentStep);
});
document.querySelector(".versione-sito").textContent = "v0.1.8";
});
