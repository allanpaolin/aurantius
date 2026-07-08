/**
 * AURANTIUS - Scripts de UI/UX (Final Premium Polish)
 * Perfomance de alto nível. Easing matemático, Parallax sutil no mouse.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar ícones minimalistas (Lucide)
    lucide.createIcons();

    // 2. Dinâmica da Navbar Cápsula e Botão Voltar ao Topo
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');
    
    const checkScroll = () => {
        const currentScroll = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (currentScroll / scrollHeight) * 100;

        // Navbar Glassmorphism
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Voltar ao Topo (Aparece após 40%)
        if (scrollPercentage > 40) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    // 3. FUNÇÃO DE SCROLL PREMIUM (Easing matemático 'easeOutQuart')
    const smoothScroll = (targetY, duration) => {
        const startY = window.scrollY;
        const difference = targetY - startY;
        let startTime = null;

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = currentTime - startTime;
            const percent = Math.min(progress / duration, 1);
            
            window.scrollTo(0, startY + difference * easeOutQuart(percent));

            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    };

    // Botão Voltar ao Topo
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScroll(0, 1200); 
    });

    // Links Internos (Ignorando magicamente hrefs de e-mail ou WhatsApp graças ao seletor ^=)
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 100;
                smoothScroll(offsetTop, 1200); 
            }
        });
    });

    // 4. PARALLAX SUTIL NO HERO (Mousemove)
    const hero = document.getElementById('hero');
    const bgLayer = document.querySelector('.hero-bg-layer');
    const gradLayer = document.querySelector('.hero-gradient-layer');
    const lightLayer = document.querySelector('.hero-light-layer');

    if (hero && window.matchMedia("(hover: hover)").matches) { 
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;

            window.requestAnimationFrame(() => {
                // Imagem: 3px max de deslocamento
                bgLayer.style.transform = `translate3d(${x * 6}px, ${y * 6}px, 0)`;
                // Gradiente: 5px max de deslocamento
                gradLayer.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`;
                // Iluminação: 7px max de deslocamento
                lightLayer.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`;
            });
        });
    }

    // 5. INTERSECTION OBSERVER (Animação de Entrada - Fade in)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 6. Footer dinâmico
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});