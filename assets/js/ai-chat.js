const AurantiusAIChat = {
    PROACTIVE_CHAT_DELAY: 25000,
    SESSION_INVITE_KEY: 'aurantius-ai-chat-invite-seen',
    WHATSAPP_NUMBER: '5547992630202',
    LABS_URL: 'https://www.aurantius.com.br/labs/',
    INITIAL_MESSAGE: 'Olá. Sou o assistente da Aurantius.\n\nPosso te explicar o que fazemos ou, se você já tiver um projeto em mente, posso entender sua necessidade e te orientar sobre o melhor caminho.',
    state: { history: [], isLoading: false, hasOpened: false },

    init() {
        this.cacheElements();
        if (!this.elements.root) return;
        this.bindEvents();
        this.scheduleInvite();
    },

    cacheElements() {
        const root = document.querySelector('[data-ai-chat]');
        this.elements = {
            root,
            panel: root?.querySelector('[data-chat-panel]'),
            launcher: root?.querySelector('[data-chat-open]'),
            close: root?.querySelector('[data-chat-close]'),
            invite: root?.querySelector('[data-chat-invite]'),
            inviteOpen: root?.querySelector('[data-chat-invite-open]'),
            inviteDismiss: root?.querySelector('[data-chat-dismiss]'),
            messages: root?.querySelector('[data-chat-messages]'),
            suggestions: root?.querySelector('[data-chat-suggestions]'),
            feedback: root?.querySelector('[data-chat-feedback]'),
            form: root?.querySelector('[data-chat-form]'),
            input: root?.querySelector('[data-chat-input]'),
            send: root?.querySelector('[data-chat-send]')
        };
    },

    bindEvents() {
        this.elements.launcher.addEventListener('click', () => this.open());
        this.elements.close.addEventListener('click', () => this.close());
        this.elements.inviteOpen.addEventListener('click', () => {
            this.dismissInvite();
            this.open();
        });
        this.elements.inviteDismiss.addEventListener('click', () => this.dismissInvite());
        this.elements.form.addEventListener('submit', event => {
            event.preventDefault();
            this.sendMessage(this.elements.input.value);
        });
        this.elements.input.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.elements.form.requestSubmit();
            }
        });
        this.elements.input.addEventListener('input', () => this.resizeInput());
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !this.elements.panel.hidden) this.close();
        });
        this.elements.suggestions.addEventListener('click', event => {
            const suggestion = event.target.closest('[data-chat-suggestion]');
            if (suggestion) this.sendMessage(suggestion.dataset.chatSuggestion);
        });
    },

    scheduleInvite() {
        if (sessionStorage.getItem(this.SESSION_INVITE_KEY)) return;
        window.setTimeout(() => {
            if (!this.state.hasOpened) this.elements.invite.hidden = false;
        }, this.PROACTIVE_CHAT_DELAY);
    },

    open() {
        if (this.state.hasOpened) {
            this.elements.panel.hidden = false;
            this.elements.launcher.setAttribute('aria-expanded', 'true');
            this.elements.input.focus();
            return;
        }
        this.state.hasOpened = true;
        sessionStorage.setItem(this.SESSION_INVITE_KEY, 'opened');
        this.elements.invite.hidden = true;
        this.elements.panel.hidden = false;
        this.elements.launcher.setAttribute('aria-expanded', 'true');
        if (!this.state.history.length) {
            this.addMessage('agent', this.INITIAL_MESSAGE);
        }
        window.setTimeout(() => this.elements.input.focus(), 0);
    },

    close() {
        this.elements.panel.hidden = true;
        this.elements.launcher.setAttribute('aria-expanded', 'false');
        this.elements.launcher.focus();
    },

    dismissInvite() {
        sessionStorage.setItem(this.SESSION_INVITE_KEY, 'dismissed');
        this.elements.invite.hidden = true;
    },

    addMessage(role, text, actions = []) {
        const message = document.createElement('div');
        message.className = `ai-chat-message is-${role}`;
        message.textContent = text;
        this.elements.messages.appendChild(message);

        actions.forEach(action => {
            const button = document.createElement('a');
            button.className = 'ai-chat-action';
            button.textContent = action.label;
            button.href = action.href;
            if (action.external) {
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
            }
            this.elements.messages.appendChild(button);
        });
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },

    async sendMessage(rawMessage) {
        const message = rawMessage.trim();
        if (!message || this.state.isLoading || message.length > 2000) return;

        const requestHistory = this.buildRequestHistory(message);

        this.elements.suggestions.classList.add('is-hidden');
        this.elements.feedback.textContent = '';
        this.elements.input.value = '';
        this.resizeInput();
        this.addMessage('user', message);
        this.setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: requestHistory })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Não foi possível responder agora.');

            if (typeof data.response !== 'string') {
                throw new Error('Resposta inválida do assistente.');
            }
            const actions = this.getActions(Array.isArray(data.actions) ? data.actions : [], requestHistory);
            this.addMessage('agent', data.response, actions);
            this.state.history = this.trimHistory([
                ...requestHistory,
                { role: 'model', content: data.response }
            ]);
        } catch (error) {
            this.elements.feedback.textContent = error.message || 'Não foi possível conectar ao assistente. Tente novamente.';
        } finally {
            this.setLoading(false);
        }
    },

    getActions(actions, requestHistory) {
        const safeActions = [];
        if (actions.includes('whatsapp')) {
            safeActions.push({ label: 'Continuar pelo WhatsApp', href: this.createWhatsAppLink(requestHistory), external: true });
            return safeActions;
        }
        if (actions.includes('labs')) {
            safeActions.push({ label: 'Conhecer o Aurantius Labs', href: this.LABS_URL, external: true });
        }
        return safeActions;
    },

    createWhatsAppLink(history) {
        const latestNeed = history
            .filter(item => item.role === 'user')
            .map(item => item.content)
            .pop() || '';
        const safeNeed = latestNeed
            .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[dado removido]')
            .replace(/\b(?:\+?\d[\d\s().-]{8,}\d)\b/g, '[dado removido]')
            .replace(/\b(?:cpf|cnpj)\s*[:.-]?\s*[\d./-]+/gi, '[dado removido]')
            .replace(/\b(?:senha|password|token|chave de api|credencial)[^,.!?;]*/gi, '[dado removido]')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 220);
        const context = safeNeed || 'uma possível solução para minha empresa';
        const text = `Olá! Vim pelo site da AURANTIUS e conversei com o assistente sobre ${context}.`;
        return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    },

    buildRequestHistory(message) {
        return [...this.trimHistory(this.state.history), { role: 'user', content: message }];
    },

    trimHistory(history) {
        if (history.length <= 19) return history;
        return [history[0], ...history.slice(-18)];
    },

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        this.elements.send.disabled = isLoading;
        this.elements.input.disabled = isLoading;
        this.elements.panel.setAttribute('aria-busy', String(isLoading));
        const existing = this.elements.messages.querySelector('[data-loading-message]');
        if (isLoading && !existing) {
            const loading = document.createElement('div');
            loading.className = 'ai-chat-message is-agent is-loading';
            loading.dataset.loadingMessage = 'true';
            loading.textContent = 'Digitando...';
            this.elements.messages.appendChild(loading);
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        } else if (!isLoading && existing) {
            existing.remove();
        }
    },

    resizeInput() {
        this.elements.input.style.height = 'auto';
        this.elements.input.style.height = `${Math.min(this.elements.input.scrollHeight, 110)}px`;
    }
};

document.addEventListener('DOMContentLoaded', () => AurantiusAIChat.init());