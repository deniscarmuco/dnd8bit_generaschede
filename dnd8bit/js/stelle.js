// ===============================
    // 1. Crea stelle fisse
    // ===============================
    function creaStelle() {
        const starsContainer = document.querySelector('.stars');
        if (!starsContainer) return;

        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2 + 1 + 'px';
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 5;

            star.classList.add('star');
            if (Math.random() > 0.7) star.classList.add('twinkle');
            star.style.width = size;
            star.style.height = size;
            star.style.left = `${x}vw`;
            star.style.top = `${y}vh`;
            star.style.setProperty('--delay', delay.toFixed(2));

            starsContainer.appendChild(star);
        }
    }

    // ===============================
    // 2. Stelle cadenti random
    // ===============================
    function stellaCadente() {
        const starsContainer = document.querySelector('.stars');
        if (!starsContainer) return;

        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');

        const startX = Math.random() * 100;
        const startY = Math.random() * 50; // parte nella metà alta
        shootingStar.style.left = `${startX}vw`;
        shootingStar.style.top = `${startY}vh`;

        starsContainer.appendChild(shootingStar);

        setTimeout(() => {
            shootingStar.remove();
        }, 1500);
    }

    // Genera stelle cadenti a intervalli random
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% di probabilità ogni intervallo
            stellaCadente();
        }
    }, 3000);

    // ===============================
    // 3. Effetto parallasse
    // ===============================
    document.addEventListener("mousemove", e => {
        const stars = document.querySelectorAll('.star');
        const moveX = (e.clientX / window.innerWidth) - 0.5;
        const moveY = (e.clientY / window.innerHeight) - 0.5; 

        stars.forEach(star => {
            const depth = Math.random() * 2;
            star.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
        });
    });

    // ===============================
    // 4. Avvio
    // ===============================
    creaStelle();