/**
 * AURANTIUS LABS - GERADOR DE PROPOSTAS
 * script.js
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'aurantius_proposal_v1';
    
    const defaultState = {
        step: 1,
        theme: { mode: 'default', primary: '#0B1F3A', contrast: '#F9FAFB', accent: '#C9A227' },
        company: { logo: '', name: '', cnpj: '', phone: '', email: '', website: '', city: '' },
        client: { name: '', contact: '', email: '', phone: '', city: '' },
        proposal: { title: 'PROPOSTA COMERCIAL', number: '', date: '', intro: '', objective: '' },
        items: [], 
        investment: { subtotal: 0, discountType: 'none', discountValue: 0, total: 0 },
        conditions: { validity: '15 dias', deadline: '', payment: '', notes: '', nextSteps: '', acceptance: false }
    };

    let state = JSON.parse(JSON.stringify(defaultState)); 
    let currentEditItemId = null; 

    const DOM = {
        recoveryModal: document.getElementById('recovery-modal'),
        btnStartNew: document.getElementById('btn-start-new'),
        btnContinue: document.getElementById('btn-continue'),
        btnResetApp: document.getElementById('btn-reset-app'),
        form: document.getElementById('proposal-form'),
        progressSteps: document.querySelectorAll('.progress-step'),
        stepSections: document.querySelectorAll('.step-section'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        btnFinish: document.getElementById('btn-finish'),
        btnEditProposal: document.getElementById('btn-edit-proposal'),
        btnPrintPdf: document.getElementById('btn-print-pdf'),
        
        // Logo & Tema
        logoInput: document.getElementById('company-logo'),
        logoPreviewContainer: document.getElementById('logo-preview-container'),
        logoPreviewImg: document.getElementById('logo-preview-img'),
        btnRemoveLogo: document.getElementById('btn-remove-logo'),
        themeRadios: document.getElementsByName('docTheme'),
        themeLogoOption: document.getElementById('theme-logo-option'),
        customColorPickers: document.getElementById('custom-color-pickers'),
        colorPrimary: document.getElementById('color-primary'),
        colorContrast: document.getElementById('color-contrast'),
        colorAccent: document.getElementById('color-accent'),
        a4Document: document.getElementById('a4-document'),
        offscreenCanvas: document.getElementById('offscreen-canvas'),
        
        // Pagamento (Nova Feature UI)
        paymentBtns: document.querySelectorAll('.payment-btn'),
        paymentTextarea: document.getElementById('proposal-payment'),
        
        // Itens & UI Formulário
        servicesList: document.getElementById('ui-services-list'),
        servicesError: document.getElementById('services-error'),
        btnAddItem: document.getElementById('btn-add-item'),
        itemFormContainer: document.getElementById('item-form-container'),
        btnCancelItem: document.getElementById('btn-cancel-item'),
        btnSaveItem: document.getElementById('btn-save-item'),
        itemName: document.getElementById('item-name'),
        itemDesc: document.getElementById('item-desc'),
        itemQty: document.getElementById('item-qty'),
        itemPrice: document.getElementById('item-price'),
        uiSubtotal: document.getElementById('ui-subtotal'),
        uiTotal: document.getElementById('ui-total'),
        discountType: document.getElementById('discount-type'),
        discountValue: document.getElementById('discount-value'),
        
        // Preview A4
        render: {
            logoArea: document.getElementById('render-logo-area'),
            companyName: document.getElementById('render-company-name'),
            headerMeta: document.getElementById('render-header-meta'),
            clientDataArea: document.getElementById('render-client-data'),
            clientName: document.getElementById('render-client-name'),
            clientContact: document.getElementById('render-client-contact'),
            proposalTitle: document.getElementById('render-proposal-title'),
            proposalMetadata: document.getElementById('render-proposal-metadata'),
            introSection: document.getElementById('render-intro-section'),
            blockIntro: document.getElementById('block-intro'),
            introText: document.getElementById('render-intro-text'),
            blockObjective: document.getElementById('block-objective'),
            objectiveText: document.getElementById('render-objective-text'),
            scopeSection: document.getElementById('render-scope-section'),
            servicesList: document.getElementById('render-services-list'),
            investmentSection: document.getElementById('render-investment-section'),
            subtotalLine: document.getElementById('render-subtotal-line'),
            subtotalVal: document.getElementById('render-subtotal-val'),
            discountLine: document.getElementById('render-discount-line'),
            discountVal: document.getElementById('render-discount-val'),
            totalVal: document.getElementById('render-total-val'),
            conditionsSection: document.getElementById('render-conditions-section'),
            blockDeadline: document.getElementById('block-deadline'),
            deadlineText: document.getElementById('render-deadline-text'),
            blockPayment: document.getElementById('block-payment'),
            paymentText: document.getElementById('render-payment-text'),
            blockNotes: document.getElementById('block-notes'),
            notesText: document.getElementById('render-notes-text'),
            blockNextsteps: document.getElementById('block-nextsteps'),
            nextstepsText: document.getElementById('render-nextsteps-text'),
            acceptanceSection: document.getElementById('render-acceptance-section'),
            footerContact: document.getElementById('render-footer-contact')
        }
    };

    function init() {
        checkLocalStorage();
        bindEvents();
        setDefaultDate();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proposal-date').value = today;
    }

    // ==========================================================================
    // LOCALSTORAGE & ESTADO
    // ==========================================================================
    function checkLocalStorage() {
        try {
            if (localStorage.getItem(STORAGE_KEY)) DOM.recoveryModal.classList.remove('hidden');
            else updateUI();
        } catch (e) { updateUI(); }
    }

    function saveToLocal() {
        syncStateFromForm();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function loadFromLocal() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                state = JSON.parse(saved);
                populateFormFromState();
                renderItemsUI();
                calculateInvestment();
                updateLogoPreview();
                applyThemeUI();
            }
        } catch (e) {}
        DOM.recoveryModal.classList.add('hidden');
        updateUI();
    }

    function resetApp() {
        if (!confirm('Isso apagará todos os dados da proposta atual. Deseja continuar?')) return;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        state = JSON.parse(JSON.stringify(defaultState));
        DOM.form.reset();
        setDefaultDate();
        renderItemsUI();
        calculateInvestment();
        removeLogo();
        applyThemeUI();
        updatePaymentActiveBtn(); // Reinicia botões de pagamento
        state.step = 1;
        DOM.recoveryModal.classList.add('hidden');
        updateUI();
    }

    function syncStateFromForm() {
        state.company.name = document.getElementById('company-name').value.trim();
        state.company.cnpj = document.getElementById('company-cnpj').value.trim();
        state.company.phone = document.getElementById('company-phone').value.trim();
        state.company.email = document.getElementById('company-email').value.trim();
        state.company.website = document.getElementById('company-website').value.trim();
        state.company.city = document.getElementById('company-city').value.trim();
        state.client.name = document.getElementById('client-name').value.trim();
        state.client.contact = document.getElementById('client-contact').value.trim();
        state.client.email = document.getElementById('client-email').value.trim();
        state.client.phone = document.getElementById('client-phone').value.trim();
        state.client.city = document.getElementById('client-city').value.trim();
        state.proposal.title = document.getElementById('proposal-title').value.trim();
        state.proposal.number = document.getElementById('proposal-number').value.trim();
        state.proposal.date = document.getElementById('proposal-date').value.trim();
        state.proposal.intro = document.getElementById('proposal-intro').value.trim();
        state.proposal.objective = document.getElementById('proposal-objective').value.trim();
        state.conditions.validity = document.getElementById('proposal-validity').value.trim();
        state.conditions.deadline = document.getElementById('proposal-deadline').value.trim();
        state.conditions.payment = DOM.paymentTextarea.value.trim();
        state.conditions.notes = document.getElementById('proposal-notes').value.trim();
        state.conditions.nextSteps = document.getElementById('proposal-nextsteps').value.trim();
        state.conditions.acceptance = document.getElementById('proposal-acceptance').checked;
        state.investment.discountType = DOM.discountType.value;
        state.investment.discountValue = parseFloat(DOM.discountValue.value) || 0;
        
        const selectedMode = Array.from(DOM.themeRadios).find(r => r.checked).value;
        state.theme.mode = selectedMode;
        if (selectedMode === 'custom') {
            state.theme.primary = DOM.colorPrimary.value;
            state.theme.contrast = DOM.colorContrast.value;
            state.theme.accent = DOM.colorAccent.value;
        }
        
        calculateInvestment();
    }

    function populateFormFromState() {
        document.getElementById('company-name').value = state.company.name;
        document.getElementById('company-cnpj').value = state.company.cnpj;
        document.getElementById('company-phone').value = state.company.phone;
        document.getElementById('company-email').value = state.company.email;
        document.getElementById('company-website').value = state.company.website;
        document.getElementById('company-city').value = state.company.city;
        document.getElementById('client-name').value = state.client.name;
        document.getElementById('client-contact').value = state.client.contact;
        document.getElementById('client-email').value = state.client.email;
        document.getElementById('client-phone').value = state.client.phone;
        document.getElementById('client-city').value = state.client.city;
        document.getElementById('proposal-title').value = state.proposal.title;
        document.getElementById('proposal-number').value = state.proposal.number;
        document.getElementById('proposal-date').value = state.proposal.date;
        document.getElementById('proposal-intro').value = state.proposal.intro;
        document.getElementById('proposal-objective').value = state.proposal.objective;
        document.getElementById('proposal-validity').value = state.conditions.validity;
        document.getElementById('proposal-deadline').value = state.conditions.deadline;
        DOM.paymentTextarea.value = state.conditions.payment;
        document.getElementById('proposal-notes').value = state.conditions.notes;
        document.getElementById('proposal-nextsteps').value = state.conditions.nextSteps;
        document.getElementById('proposal-acceptance').checked = state.conditions.acceptance;
        DOM.discountType.value = state.investment.discountType;
        DOM.discountValue.value = state.investment.discountValue || '';
        toggleDiscountInput();
        updatePaymentActiveBtn(); // Sincroniza os botões ao carregar
    }

    // ==========================================================================
    // NAVEGAÇÃO
    // ==========================================================================
    function goToStep(targetStep) {
        if (targetStep > state.step && !validateCurrentStep()) return;
        if (targetStep === 7) {
            syncStateFromForm();
            applyDocumentColors();
            renderA4Document();
        }
        state.step = targetStep;
        saveToLocal();
        updateUI();
        window.scrollTo(0, 0);
    }

    function validateCurrentStep() {
        const section = document.getElementById(`step-${state.step}`);
        if (!section) return true;
        section.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
        for (let input of section.querySelectorAll('input[required]')) {
            if (!input.value.trim()) {
                const error = input.parentElement.querySelector('.error-msg');
                if (error) error.classList.remove('hidden');
                input.focus();
                return false;
            }
        }
        if (state.step === 4 && state.items.length === 0) {
            DOM.servicesError.classList.remove('hidden');
            return false;
        }
        return true;
    }

    function updateUI() {
        DOM.stepSections.forEach(s => s.classList.add('hidden'));
        document.getElementById(`step-${state.step}`).classList.remove('hidden');
        DOM.progressSteps.forEach((s, i) => {
            s.classList.remove('active', 'completed');
            if (i + 1 < state.step) s.classList.add('completed');
            else if (i + 1 === state.step) s.classList.add('active');
        });
        const formNav = document.getElementById('form-navigation');
        if (state.step === 7) {
            formNav.classList.add('hidden');
        } else {
            formNav.classList.remove('hidden');
            DOM.btnPrev.classList.toggle('hidden', state.step === 1);
            DOM.btnNext.classList.toggle('hidden', state.step === 6);
            DOM.btnFinish.classList.toggle('hidden', state.step !== 6);
        }
    }

    // ==========================================================================
    // LOGO E IDENTIDADE VISUAL
    // ==========================================================================
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file || !['image/jpeg', 'image/png'].includes(file.type)) {
            DOM.logoInput.value = '';
            return alert('Envie apenas imagens JPG ou PNG.');
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            state.company.logo = e.target.result;
            updateLogoPreview();
            extractColorsFromImage(e.target.result, (colors) => {
                if (colors) {
                    state.theme.mode = 'logo';
                    state.theme.primary = colors.primary;
                    state.theme.accent = colors.accent;
                    applyThemeUI();
                }
                saveToLocal();
            });
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        state.company.logo = '';
        DOM.logoInput.value = '';
        if (state.theme.mode === 'logo') state.theme.mode = 'default';
        updateLogoPreview();
        applyThemeUI();
        saveToLocal();
    }

    function updateLogoPreview() {
        if (state.company.logo) {
            DOM.logoPreviewImg.src = state.company.logo;
            DOM.logoPreviewContainer.classList.remove('hidden');
            DOM.themeLogoOption.classList.remove('hidden');
        } else {
            DOM.logoPreviewImg.src = '';
            DOM.logoPreviewContainer.classList.add('hidden');
            DOM.themeLogoOption.classList.add('hidden');
        }
    }

    function extractColorsFromImage(base64, callback) {
        const img = new Image();
        img.onload = () => {
            const ctx = DOM.offscreenCanvas.getContext('2d');
            DOM.offscreenCanvas.width = img.width;
            DOM.offscreenCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            try {
                const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
                let colorMap = {};
                for (let i = 0; i < imgData.length; i += 40) {
                    let r = Math.round(imgData[i] / 20) * 20, g = Math.round(imgData[i+1] / 20) * 20, b = Math.round(imgData[i+2] / 20) * 20, a = imgData[i+3];
                    if (a < 128) continue; 
                    if ((r>230 && g>230 && b>230) || (r<20 && g<20 && b<20)) continue;
                    let hex = rgbToHex(r,g,b);
                    colorMap[hex] = (colorMap[hex] || 0) + 1;
                }
                let sortedColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);
                if (sortedColors.length > 0) return callback({ primary: sortedColors[0], accent: sortedColors.length > 1 ? sortedColors[1] : defaultState.theme.accent });
            } catch(e) { console.warn("Erro ao extrair cores", e); }
            callback(null);
        };
        img.src = base64;
    }

    function applyThemeUI() {
        Array.from(DOM.themeRadios).forEach(r => r.checked = (r.value === state.theme.mode));
        if (state.theme.mode === 'custom') {
            DOM.customColorPickers.classList.remove('hidden');
            DOM.colorPrimary.value = state.theme.primary;
            DOM.colorContrast.value = state.theme.contrast;
            DOM.colorAccent.value = state.theme.accent;
        } else {
            DOM.customColorPickers.classList.add('hidden');
        }
    }

    function getContrastColor(hex) {
        if (!hex) return '#111827';
        hex = hex.replace('#', '');
        let r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
        let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#111827' : '#FFFFFF';
    }

    function applyDocumentColors() {
        let p, c, a;
        if (state.theme.mode === 'default') { p = defaultState.theme.primary; c = defaultState.theme.contrast; a = defaultState.theme.accent; } 
        else if (state.theme.mode === 'logo') { p = state.theme.primary; c = defaultState.theme.contrast; a = state.theme.accent; } 
        else { p = state.theme.primary; c = state.theme.contrast; a = state.theme.accent; }
        DOM.a4Document.style.setProperty('--doc-primary', p);
        DOM.a4Document.style.setProperty('--doc-primary-text', getContrastColor(p));
        DOM.a4Document.style.setProperty('--doc-contrast', c);
        DOM.a4Document.style.setProperty('--doc-contrast-text', getContrastColor(c));
        DOM.a4Document.style.setProperty('--doc-accent', a);
    }

    // ==========================================================================
    // SUGESTÕES DE PAGAMENTO (NOVA FUNÇÃO)
    // ==========================================================================
    function updatePaymentActiveBtn() {
        const currentVal = DOM.paymentTextarea.value.trim();
        let matched = false;
        
        DOM.paymentBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-val') === currentVal && currentVal !== '') {
                btn.classList.add('active');
                matched = true;
            }
        });
        
        if (!matched) {
            const customBtn = Array.from(DOM.paymentBtns).find(b => b.getAttribute('data-val') === 'custom');
            if (customBtn) customBtn.classList.add('active');
        }
    }

    // ==========================================================================
    // ITENS E INVESTIMENTO
    // ==========================================================================
    function toggleItemForm(show) {
        DOM.itemFormContainer.classList.toggle('hidden', !show);
        DOM.btnAddItem.classList.toggle('hidden', show);
        if (show) { DOM.servicesError.classList.add('hidden'); DOM.itemName.focus(); }
        else resetItemForm();
    }

    function resetItemForm() {
        DOM.itemName.value = ''; DOM.itemDesc.value = ''; DOM.itemQty.value = '1'; DOM.itemPrice.value = '';
        currentEditItemId = null;
    }

    function saveItem() {
        const name = DOM.itemName.value.trim(), desc = DOM.itemDesc.value.trim();
        const qty = parseInt(DOM.itemQty.value) || 1, price = parseFloat(DOM.itemPrice.value) || 0;
        if (!name || price <= 0) return alert('Informe o nome e um valor unitário válido.');
        const total = qty * price;
        
        if (currentEditItemId) {
            const index = state.items.findIndex(i => i.id === currentEditItemId);
            if (index > -1) state.items[index] = { id: currentEditItemId, name, desc, qty, price, total };
        } else {
            state.items.push({ id: Date.now().toString(), name, desc, qty, price, total });
        }
        toggleItemForm(false);
        renderItemsUI();
        calculateInvestment();
        saveToLocal();
    }

    function editItem(id) {
        const item = state.items.find(i => i.id === id);
        if (!item) return;
        currentEditItemId = item.id;
        DOM.itemName.value = item.name; DOM.itemDesc.value = item.desc;
        DOM.itemQty.value = item.qty; DOM.itemPrice.value = item.price;
        toggleItemForm(true);
    }

    function removeItem(id) {
        if (!confirm('Remover item?')) return;
        state.items = state.items.filter(i => i.id !== id);
        renderItemsUI();
        calculateInvestment();
        saveToLocal();
    }

    function renderItemsUI() {
        DOM.servicesList.innerHTML = '';
        if (state.items.length === 0) return DOM.servicesList.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--aur-text-muted);">Nenhum serviço.</td></tr>`;
        state.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHTML(item.name)}</strong>${item.desc ? `<br><small style="color:var(--aur-text-muted);">${escapeHTML(item.desc)}</small>` : ''}</td>
                <td class="col-qty">${item.qty}</td>
                <td class="col-price">${formatCurrency(item.price)}</td>
                <td class="col-total"><strong>${formatCurrency(item.total)}</strong></td>
                <td class="col-actions"><button type="button" class="btn-text" onclick="window.editItemHandler('${item.id}')">Editar</button><button type="button" class="btn-text btn-danger" onclick="window.removeItemHandler('${item.id}')" style="margin-left:8px;">Remover</button></td>
            `;
            DOM.servicesList.appendChild(tr);
        });
    }

    function toggleDiscountInput() {
        const isNone = DOM.discountType.value === 'none';
        DOM.discountValue.disabled = isNone;
        if (isNone) { DOM.discountValue.value = ''; state.investment.discountValue = 0; }
        calculateInvestment();
    }

    function calculateInvestment() {
        state.investment.subtotal = state.items.reduce((acc, item) => acc + item.total, 0);
        let dVal = state.investment.discountValue;
        let discount = 0;
        if (state.investment.discountType === 'fixed') discount = dVal;
        else if (state.investment.discountType === 'percentage') discount = state.investment.subtotal * (dVal / 100);
        
        if (discount > state.investment.subtotal) discount = state.investment.subtotal;
        state.investment.total = state.investment.subtotal - discount;
        
        DOM.uiSubtotal.textContent = formatCurrency(state.investment.subtotal);
        DOM.uiTotal.textContent = formatCurrency(state.investment.total);
    }

    // ==========================================================================
    // RENDERIZAÇÃO A4
    // ==========================================================================
    function renderA4Document() {
        if (state.company.logo) {
            DOM.render.logoArea.innerHTML = `<img src="${state.company.logo}" alt="Logo">`;
            DOM.render.logoArea.classList.remove('hidden');
            DOM.render.companyName.textContent = ''; 
        } else {
            DOM.render.logoArea.innerHTML = '';
            DOM.render.logoArea.classList.add('hidden');
            DOM.render.companyName.textContent = state.company.name; 
        }
        let companyMeta = [];
        if(state.company.cnpj) companyMeta.push(state.company.cnpj);
        if(state.company.phone) companyMeta.push(state.company.phone);
        if(state.company.email) companyMeta.push(state.company.email);
        DOM.render.headerMeta.textContent = companyMeta.join(' • ');

        setTextIfValid(DOM.render.clientName, state.client.name);
        setTextIfValid(DOM.render.clientContact, state.client.contact ? `A/C: ${state.client.contact}` : null);
        setTextIfValid(DOM.render.proposalTitle, state.proposal.title);
        
        let propMeta = [];
        if (state.proposal.number) propMeta.push(`Nº ${state.proposal.number}`);
        if (state.proposal.date) propMeta.push(`Emissão: ${formatDate(state.proposal.date)}`);
        if (state.conditions.validity) propMeta.push(`Validade: ${state.conditions.validity}`);
        setTextIfValid(DOM.render.proposalMetadata, propMeta.join(' | '));

        const hasIntro = !!state.proposal.intro, hasObj = !!state.proposal.objective;
        DOM.render.introSection.classList.toggle('hidden', !hasIntro && !hasObj);
        toggleBlock(DOM.render.blockIntro, DOM.render.introText, state.proposal.intro);
        toggleBlock(DOM.render.blockObjective, DOM.render.objectiveText, state.proposal.objective);

        DOM.render.servicesList.innerHTML = '';
        state.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-item"><strong>${escapeHTML(item.name)}</strong>${item.desc ? `<br><span>${escapeHTML(item.desc)}</span>` : ''}</td>
                <td class="col-qty">${item.qty}</td>
                <td class="col-price">${formatCurrency(item.price)}</td>
                <td class="col-total"><strong>${formatCurrency(item.total)}</strong></td>
            `;
            DOM.render.servicesList.appendChild(tr);
        });

        DOM.render.subtotalVal.textContent = formatCurrency(state.investment.subtotal);
        DOM.render.totalVal.textContent = formatCurrency(state.investment.total);
        
        const discountVal = state.investment.subtotal - state.investment.total;
        if (discountVal > 0) {
            DOM.render.discountLine.classList.remove('hidden');
            DOM.render.discountVal.textContent = `- ${formatCurrency(discountVal)}`;
        } else {
            DOM.render.discountLine.classList.add('hidden'); 
        }

        const hasConds = state.conditions.deadline || state.conditions.payment || state.conditions.notes || state.conditions.nextSteps;
        DOM.render.conditionsSection.classList.toggle('hidden', !hasConds);
        toggleBlock(DOM.render.blockDeadline, DOM.render.deadlineText, state.conditions.deadline);
        toggleBlock(DOM.render.blockPayment, DOM.render.paymentText, state.conditions.payment);
        toggleBlock(DOM.render.blockNotes, DOM.render.notesText, state.conditions.notes);
        toggleBlock(DOM.render.blockNextsteps, DOM.render.nextstepsText, state.conditions.nextSteps);

        DOM.render.acceptanceSection.classList.toggle('hidden', !state.conditions.acceptance);

        let footerStr = [state.company.name, state.company.website, state.company.city].filter(Boolean).join(' • ');
        setTextIfValid(DOM.render.footerContact, footerStr);
    }

    function setTextIfValid(element, text) {
        if (!element) return;
        if (text && text.trim() !== '') { element.textContent = text; element.classList.remove('hidden'); }
        else { element.classList.add('hidden'); }
    }
    function toggleBlock(blockElement, textElement, content) {
        if (!blockElement || !textElement) return;
        if (content && content.trim() !== '') { textElement.textContent = content; blockElement.classList.remove('hidden'); }
        else { blockElement.classList.add('hidden'); }
    }
    function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }
    function formatDate(d) { if (!d) return ''; const p = d.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; }
    function escapeHTML(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
    function rgbToHex(r, g, b) { return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase(); }

    window.editItemHandler = editItem;
    window.removeItemHandler = removeItem;

    // ==========================================================================
    // BIND EVENTOS
    // ==========================================================================
    function bindEvents() {
        DOM.btnStartNew.addEventListener('click', resetApp);
        DOM.btnContinue.addEventListener('click', loadFromLocal);
        DOM.btnResetApp.addEventListener('click', resetApp);
        DOM.btnNext.addEventListener('click', () => goToStep(state.step + 1));
        DOM.btnPrev.addEventListener('click', () => goToStep(state.step - 1));
        DOM.btnFinish.addEventListener('click', () => goToStep(7));
        DOM.btnEditProposal.addEventListener('click', () => goToStep(1));
        
        DOM.progressSteps.forEach((s, i) => {
            s.addEventListener('click', () => {
                const target = i + 1;
                if (target < state.step || target === 7) goToStep(target);
                else if (target > state.step) goToStep(state.step + 1);
            });
        });

        DOM.btnPrintPdf.addEventListener('click', () => setTimeout(() => window.print(), 100));
        DOM.logoInput.addEventListener('change', handleLogoUpload);
        DOM.btnRemoveLogo.addEventListener('click', removeLogo);
        
        DOM.btnAddItem.addEventListener('click', () => toggleItemForm(true));
        DOM.btnCancelItem.addEventListener('click', () => toggleItemForm(false));
        DOM.btnSaveItem.addEventListener('click', saveItem);
        DOM.discountType.addEventListener('change', toggleDiscountInput);
        DOM.discountValue.addEventListener('input', () => { state.investment.discountValue = parseFloat(DOM.discountValue.value) || 0; calculateInvestment(); });
        
        Array.from(DOM.themeRadios).forEach(r => { r.addEventListener('change', () => { syncStateFromForm(); applyThemeUI(); }); });
        
        // Listener de Pagamento Rápido
        DOM.paymentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                if (val === 'custom') {
                    DOM.paymentTextarea.value = '';
                    DOM.paymentTextarea.focus();
                } else {
                    DOM.paymentTextarea.value = val;
                }
                updatePaymentActiveBtn();
                syncStateFromForm();
                saveToLocal();
            });
        });
        DOM.paymentTextarea.addEventListener('input', () => { updatePaymentActiveBtn(); saveToLocal(); });

        DOM.form.addEventListener('change', saveToLocal);
    }

    init();
});