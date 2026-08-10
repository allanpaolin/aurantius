/**
 * AURANTIUS LABS
 * Ferramenta: Gerador de Link do WhatsApp
 * 
 * Descrição: Lógica isolada e reativa para a geração de links oficiais do WhatsApp.
 * Arquitetura baseada em responsabilidade única, sem dependências externas.
 */

const WhatsAppLinkGenerator = {
    // 1. Estado da Aplicação
    state: {
        isValid: false,
        currentLink: '',
        copyTimeout: null,       // Guarda a referência do temporizador
        originalBtnText: ''      // Previne cache incorreto do texto
    },

    // 2. Cache de Elementos do DOM
    elements: {},

    // 3. Inicialização
    init() {
        this.cacheElements();
        if (!this.validateElements()) return;

        this.bindEvents();
        this.loadFromUrlParams();
        this.processLink();
    },

    cacheElements() {
        this.elements = {
            ddi: document.getElementById('country-code'),
            phone: document.getElementById('phone-number'),
            message: document.getElementById('custom-message'),
            output: document.getElementById('generated-link'),
            btnCopy: document.getElementById('btn-copy'),
            btnOpen: document.getElementById('btn-open'),
            btnClear: document.getElementById('btn-clear')
        };
    },

    validateElements() {
        const { ddi, phone, output, btnCopy, btnOpen } = this.elements;
        return !!(ddi && phone && output && btnCopy && btnOpen);
    },

    // 4. Delegação de Eventos
    bindEvents() {
        const { ddi, phone, message, btnCopy, btnOpen, btnClear } = this.elements;

        const inputs = [ddi, phone, message];
        inputs.forEach(input => {
            input.addEventListener('input', () => this.processLink());
        });

        btnCopy.addEventListener('click', () => this.copyLinkToClipboard());
        btnOpen.addEventListener('click', () => this.openWhatsApp());
        btnClear.addEventListener('click', () => this.resetTool());
    },

    // 5. Lógica Central (Core)
    processLink() {
        const ddiClean = this.extractNumbers(this.elements.ddi.value);
        const phoneClean = this.extractNumbers(this.elements.phone.value);
        const rawMessage = this.elements.message.value.trim();

        if (!ddiClean || phoneClean.length < 8) {
            this.setInvalidState();
            return;
        }

        let baseUrl = `https://wa.me/${ddiClean}${phoneClean}`;
        
        if (rawMessage) {
            baseUrl += `?text=${encodeURIComponent(rawMessage)}`;
        }

        this.state.currentLink = baseUrl;
        this.setValidState(baseUrl);
    },

    // 6. Manipulação de UI (Views)
    setValidState(link) {
        this.state.isValid = true;
        
        const { output, btnCopy, btnOpen } = this.elements;
        
        output.textContent = link;
        output.classList.remove('placeholder-state');
        
        this.enableButton(btnCopy);
        this.enableButton(btnOpen);
    },

    setInvalidState() {
        this.state.isValid = false;
        this.state.currentLink = '';
        
        const { output, btnCopy, btnOpen } = this.elements;
        
        output.textContent = 'O link gerado aparecerá aqui...';
        output.classList.add('placeholder-state');
        
        this.disableButton(btnCopy);
        this.disableButton(btnOpen);
    },

    enableButton(button) {
        button.disabled = false;
        button.setAttribute('aria-disabled', 'false');
    },

    disableButton(button) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
    },

    // 7. Ações
    async copyLinkToClipboard() {
        if (!this.state.isValid) return;

        try {
            await navigator.clipboard.writeText(this.state.currentLink);
            this.showCopyFeedback();
        } catch (error) {
            console.error('Aurantius Labs: Falha ao acessar a área de transferência.', error);
        }
    },

    openWhatsApp() {
        if (!this.state.isValid) return;
        
        window.open(this.state.currentLink, '_blank', 'noopener,noreferrer');
    },

    resetTool() {
        this.elements.ddi.value = '+55';
        this.elements.phone.value = '';
        this.elements.message.value = '';
        
        this.processLink();
        this.elements.phone.focus();
    },

    // 8. Feedbacks Visuais
    showCopyFeedback() {
        const { btnCopy } = this.elements;
        const textSpan = btnCopy.querySelector('span');
        
        if (!textSpan) return;

        // Limpa o temporizador anterior caso o usuário clique múltiplas vezes rápido
        if (this.state.copyTimeout) {
            clearTimeout(this.state.copyTimeout);
        } else {
            // Guarda o texto original apenas na primeira vez, evitando gravar "Copiado!"
            this.state.originalBtnText = textSpan.textContent;
        }

        btnCopy.classList.add('is-success');
        textSpan.textContent = 'Copiado!';

        this.state.copyTimeout = setTimeout(() => {
            btnCopy.classList.remove('is-success');
            textSpan.textContent = this.state.originalBtnText || 'Copiar Link';
            this.state.copyTimeout = null;
        }, 2000);
    },

    // 9. Integração com Parâmetros de URL (Query Strings)
    loadFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        if (params.has('country')) {
            this.elements.ddi.value = `+${this.extractNumbers(params.get('country'))}`;
            hasParams = true;
        }
        
        if (params.has('phone')) {
            this.elements.phone.value = params.get('phone');
            hasParams = true;
        }
        
        if (params.has('text')) {
            this.elements.message.value = params.get('text');
            hasParams = true;
        }

        if (hasParams) {
            this.processLink();
        }
    },

    // 10. Utilitários (Helpers)
    extractNumbers(string) {
        if (!string) return '';
        return string.replace(/\D/g, '');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WhatsAppLinkGenerator.init();
});