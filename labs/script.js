/**
 * AURANTIUS LABS
 * Diretório Principal - script.js
 * 
 * Lógica de aprimoramento progressivo (Progressive Enhancement).
 * O funcionamento base depende exclusivamente do HTML/CSS.
 */

const AurantiusLabsDirectory = {
    elements: {},

    init() {
        this.cacheElements();
        this.setupCardInteractions();
    },

    cacheElements() {
        this.elements = {
            cards: document.querySelectorAll('.tool-card.is-available')
        };
    },

    setupCardInteractions() {
        if (!this.elements.cards.length) return;

        this.elements.cards.forEach(card => {
            this.makeCardClickable(card);
        });
    },

    makeCardClickable(card) {
        // Aprimoramento Progressivo: Expande a área de clique de forma fluida
        card.style.cursor = 'pointer';

        card.addEventListener('click', (event) => {
            const isClickOnNativeLink = event.target.closest('.tool-action');
            if (isClickOnNativeLink) return;

            const nativeLink = card.querySelector('.tool-action');
            if (nativeLink && nativeLink.href) {
                window.location.href = nativeLink.href;
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AurantiusLabsDirectory.init();
});