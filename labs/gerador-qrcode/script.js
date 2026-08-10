/**
 * AURANTIUS LABS
 * Ferramenta: Gerador de QR Code
 * 
 * Lógica funcional, processamento de payload e renderização.
 * 100% Client-side. Foco em performance e privacidade.
 */

const AurantiusQRCode = {
    state: {
        currentMode: 'link', // 'link' ou 'wifi'
        qrCodeInstance: null
    },

    elements: {},

    init() {
        this.cacheElements();
        this.bindEvents();
    },

    cacheElements() {
        this.elements = {
            // Modos e Abas
            tabLink: document.getElementById('tab-link'),
            tabWifi: document.getElementById('tab-wifi'),
            formLink: document.getElementById('form-link'),
            formWifi: document.getElementById('form-wifi'),
            
            // Estados do App
            stateInput: document.getElementById('state-input'),
            stateResult: document.getElementById('state-result'),
            
            // Inputs: Link
            inputUrl: document.getElementById('input-url'),
            
            // Inputs: Wi-Fi
            wifiSsid: document.getElementById('wifi-ssid'),
            wifiPassword: document.getElementById('wifi-password'),
            wifiEncryption: document.getElementById('wifi-encryption'),
            groupPassword: document.getElementById('group-password'),
            togglePasswordBtn: document.getElementById('toggle-password'),
            
            // Área de Resultado
            qrcodeDisplay: document.getElementById('qrcode-display'),
            resultTypeLabel: document.getElementById('result-type-label'),
            resultContent: document.getElementById('result-content'),
            
            // Botões de Ação
            btnDownload: document.getElementById('btn-download'),
            btnNew: document.getElementById('btn-new')
        };
    },

    bindEvents() {
        // Troca de Modos
        this.elements.tabLink.addEventListener('click', () => this.setMode('link'));
        this.elements.tabWifi.addEventListener('click', () => this.setMode('wifi'));
        
        // Comportamento do formulário Wi-Fi (Criptografia e Senha)
        this.elements.wifiEncryption.addEventListener('change', () => this.handleEncryptionChange());
        this.elements.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Submissão dos Formulários
        this.elements.formLink.addEventListener('submit', (e) => this.handleGenerateLink(e));
        this.elements.formWifi.addEventListener('submit', (e) => this.handleGenerateWifi(e));
        
        // Ações de Resultado
        this.elements.btnDownload.addEventListener('click', () => this.downloadQRCode());
        this.elements.btnNew.addEventListener('click', () => this.resetGenerator());

        // Limpeza de erros ao digitar
        this.elements.inputUrl.addEventListener('input', () => this.clearError(this.elements.inputUrl));
        this.elements.wifiSsid.addEventListener('input', () => this.clearError(this.elements.wifiSsid));
        this.elements.wifiPassword.addEventListener('input', () => this.clearError(this.elements.wifiPassword));
    },

    // ==========================================
    // CONTROLE DE INTERFACE (UI)
    // ==========================================

    setMode(mode) {
        if (this.state.currentMode === mode) return;
        this.state.currentMode = mode;

        // Limpa erros e campos ao trocar de modo para evitar inconsistências
        this.clearAllErrors();

        if (mode === 'link') {
            this.elements.tabLink.classList.add('active');
            this.elements.tabLink.setAttribute('aria-selected', 'true');
            this.elements.tabWifi.classList.remove('active');
            this.elements.tabWifi.setAttribute('aria-selected', 'false');

            this.elements.formLink.classList.remove('hidden');
            this.elements.formLink.classList.add('active');
            this.elements.formWifi.classList.add('hidden');
            this.elements.formWifi.classList.remove('active');
            
            this.elements.inputUrl.focus();
        } else {
            this.elements.tabWifi.classList.add('active');
            this.elements.tabWifi.setAttribute('aria-selected', 'true');
            this.elements.tabLink.classList.remove('active');
            this.elements.tabLink.setAttribute('aria-selected', 'false');

            this.elements.formWifi.classList.remove('hidden');
            this.elements.formWifi.classList.add('active');
            this.elements.formLink.classList.add('hidden');
            this.elements.formLink.classList.remove('active');
            
            this.elements.wifiSsid.focus();
        }
    },

    handleEncryptionChange() {
        const encryption = this.elements.wifiEncryption.value;
        const passGroup = this.elements.groupPassword;
        const passInput = this.elements.wifiPassword;

        if (encryption === 'nopass') {
            passGroup.classList.add('hidden');
            passInput.removeAttribute('required');
            this.clearError(passInput);
        } else {
            passGroup.classList.remove('hidden');
            passInput.setAttribute('required', 'true');
        }
    },

    togglePasswordVisibility() {
        const input = this.elements.wifiPassword;
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        
        // Atualiza o ícone Lucide
        this.elements.togglePasswordBtn.innerHTML = isPassword 
            ? '<i data-lucide="eye-off" aria-hidden="true"></i>' 
            : '<i data-lucide="eye" aria-hidden="true"></i>';
        
        // Re-renderiza o novo ícone
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    // ==========================================
    // LÓGICA DE GERAÇÃO
    // ==========================================

    handleGenerateLink(e) {
        e.preventDefault();
        
        const url = this.elements.inputUrl.value.trim();
        
        if (!url) {
            this.showError(this.elements.inputUrl, 'Insira uma URL para gerar o QR Code.');
            return;
        }

        // Validação leve para ajudar o usuário sem bloquear formatos exóticos
        const hasProtocol = /^https?:\/\//i.test(url);
        const finalUrl = hasProtocol ? url : `https://${url}`;

        this.generateQRCode(finalUrl, 'Destino', finalUrl);
    },

    handleGenerateWifi(e) {
        e.preventDefault();
        
        const ssid = this.elements.wifiSsid.value.trim();
        const encryption = this.elements.wifiEncryption.value;
        const password = this.elements.wifiPassword.value; // Senha não leva trim (espaços importam)

        if (!ssid) {
            this.showError(this.elements.wifiSsid, 'Informe o nome da rede Wi-Fi.');
            return;
        }

        if (encryption !== 'nopass' && !password) {
            this.showError(this.elements.wifiPassword, 'Informe a senha da rede.');
            return;
        }

        const payload = this.buildWifiPayload(ssid, password, encryption);
        this.generateQRCode(payload, 'Rede Wi-Fi', ssid);
    },

    buildWifiPayload(ssid, password, encryption) {
        // Escapa caracteres especiais de acordo com o padrão Wi-Fi
        const escapeStr = (str) => str.replace(/([\\;,":])/g, '\\$1');
        
        const safeSsid = escapeStr(ssid);
        
        if (encryption === 'nopass') {
            return `WIFI:T:nopass;S:${safeSsid};;`;
        }

        const safePassword = escapeStr(password);
        return `WIFI:T:${encryption};S:${safeSsid};P:${safePassword};;`;
    },

    generateQRCode(payload, typeLabel, contentText) {
        // 1. Limpar instância anterior
        this.elements.qrcodeDisplay.innerHTML = '';
        
        // 2. Definir estado de "carregando" visualmente (desabilita botões temporariamente)
        const activeForm = this.state.currentMode === 'link' ? this.elements.formLink : this.elements.formWifi;
        const submitBtn = activeForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        // 3. Renderizar com QRCode.js
        setTimeout(() => {
            try {
                this.state.qrCodeInstance = new QRCode(this.elements.qrcodeDisplay, {
                    text: payload,
                    width: 256,
                    height: 256,
                    colorDark: "#0B1F3A", // Azul institucional
                    colorLight: "#FFFFFF",
                    correctLevel: QRCode.CorrectLevel.M
                });

                // 4. Atualizar textos de resultado
                this.elements.resultTypeLabel.textContent = typeLabel;
                this.elements.resultContent.textContent = contentText;

                // 5. Trocar interface para estado de resultado
                this.showResultState();
            } catch (err) {
                // Fallback seguro em caso de falha da biblioteca
                this.showError(activeForm.querySelector('input'), 'Ocorreu um erro ao gerar o QR Code.');
            } finally {
                submitBtn.disabled = false;
            }
        }, 100); // Timeout leve para permitir que a UI respire antes da thread travar com a renderização
    },

    // ==========================================
    // TRANSIÇÃO DE ESTADOS E AÇÕES
    // ==========================================

    showResultState() {
        this.elements.stateInput.classList.add('hidden');
        this.elements.stateInput.classList.remove('active');
        
        this.elements.stateResult.classList.remove('hidden');
        this.elements.stateResult.classList.add('active');

        // Mover foco para botão de download (Acessibilidade)
        this.elements.btnDownload.focus();
    },

    resetGenerator() {
        this.elements.stateResult.classList.add('hidden');
        this.elements.stateResult.classList.remove('active');
        
        this.elements.stateInput.classList.remove('hidden');
        this.elements.stateInput.classList.add('active');

        this.elements.qrcodeDisplay.innerHTML = '';
        this.state.qrCodeInstance = null;

        // Limpa apenas o formulário que estava ativo
        if (this.state.currentMode === 'link') {
            this.elements.formLink.reset();
            this.elements.inputUrl.focus();
        } else {
            this.elements.formWifi.reset();
            this.handleEncryptionChange(); // Restaura campo de senha caso necessário
            
            // Restaura input de password para estado oculto
            this.elements.wifiPassword.type = 'password';
            this.elements.togglePasswordBtn.innerHTML = '<i data-lucide="eye" aria-hidden="true"></i>';
            if (window.lucide) window.lucide.createIcons();

            this.elements.wifiSsid.focus();
        }
    },

    downloadQRCode() {
        // A biblioteca QRCode.js gera um canvas e depois um img. 
        // Vamos capturar o canvas para garantir a exportação limpa do PNG.
        const canvas = this.elements.qrcodeDisplay.querySelector('canvas');
        const img = this.elements.qrcodeDisplay.querySelector('img');

        let imageUri = '';

        if (canvas) {
            imageUri = canvas.toDataURL('image/png');
        } else if (img && img.src) {
            imageUri = img.src;
        }

        if (!imageUri) return; // Proteção contra estado vazio

        // Cria elemento temporário e dispara download
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUri;
        downloadLink.download = 'aurantius-qrcode.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    },

    // ==========================================
    // TRATAMENTO DE ERROS NA UI
    // ==========================================

    showError(inputElement, message) {
        this.clearError(inputElement); // Previne duplicação

        const wrapper = inputElement.closest('.input-group');
        inputElement.classList.add('has-error');
        inputElement.setAttribute('aria-invalid', 'true');

        const errorText = document.createElement('span');
        errorText.className = 'error-message';
        errorText.textContent = message;
        // Estilo injetado programaticamente apenas se não houver cobertura via CSS global
        errorText.style.color = '#EF4444';
        errorText.style.fontSize = '0.8125rem';
        errorText.style.marginTop = '0.25rem';
        errorText.style.display = 'block';

        wrapper.appendChild(errorText);
        inputElement.focus();
    },

    clearError(inputElement) {
        inputElement.classList.remove('has-error');
        inputElement.removeAttribute('aria-invalid');
        
        const wrapper = inputElement.closest('.input-group');
        if (wrapper) {
            const errorMsg = wrapper.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    },

    clearAllErrors() {
        const inputs = [this.elements.inputUrl, this.elements.wifiSsid, this.elements.wifiPassword];
        inputs.forEach(input => this.clearError(input));
    }
};

// Inicializa a ferramenta apenas quando a DOM estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    AurantiusQRCode.init();
});