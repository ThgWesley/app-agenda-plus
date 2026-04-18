// --- CONFIGURAÇÕES DO PICKER ---
const optionsData = {
    category: [
        "Pegue e monte P", 
        "Pegue e monte M", 
        "Pegue e monte G",
        "Mesa P", 
        "Mesa M", 
        "Mesa G"
    ],
    payment: ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito"]
};

let currentPickerType = '';

function openPicker(type) {
    currentPickerType = type;
    const picker = document.getElementById('custom-picker');
    const list = document.getElementById('picker-options');
    const title = document.getElementById('picker-title');
    if(!picker || !list) return;
    title.innerText = type === 'category' ? 'Escolha o Serviço' : 'Forma de Pagamento';
    list.innerHTML = '';
    optionsData[type].forEach(opt => {
        const div = document.createElement('div');
        div.className = 'picker-option';
        div.innerText = opt;
        div.onclick = () => selectOption(opt);
        list.appendChild(div);
    });
    picker.style.display = 'flex';
}

function selectOption(value) {
    if(currentPickerType === 'category') {
        const mainCat = document.getElementById('main-category');
        const textDisplay = document.getElementById('selected-category-text');
        const clearBtn = document.getElementById('btn-clear-category');
        const arrow = document.getElementById('category-arrow');
        if(mainCat) mainCat.value = value;
        if(textDisplay) textDisplay.innerText = value;
        if(clearBtn) clearBtn.style.display = 'inline-block';
        if(arrow) arrow.style.display = 'none';
    } else {
        const payMethod = document.getElementById('payment-method');
        const payDisplay = document.getElementById('selected-payment-text');
        if(payMethod) payMethod.value = value;
        if(payDisplay) payDisplay.innerText = value;
    }
    closePicker();
}

function clearCategory() {
    const mainCat = document.getElementById('main-category');
    const textDisplay = document.getElementById('selected-category-text');
    const clearBtn = document.getElementById('btn-clear-category');
    const arrow = document.getElementById('category-arrow');
    if(mainCat) mainCat.value = '';
    if(textDisplay) textDisplay.innerText = 'Selecionar kit...';
    if(clearBtn) clearBtn.style.display = 'none';
    if(arrow) arrow.style.display = 'inline-block';
    updateKitNameRequired();
}

function closePicker() {
    const picker = document.getElementById('custom-picker');
    if(picker) picker.style.display = 'none';
}

function toggleBalloonColors() {
    const checkbox = document.getElementById('has-balloons');
    const inputGroup = document.getElementById('balloon-input-group');
    if(!checkbox || !inputGroup) return;
    if(checkbox.checked) {
        inputGroup.style.display = 'block';
        const colorInput = document.getElementById('balloon-colors');
        if(colorInput) setTimeout(() => colorInput.focus(), 100);
    } else {
        inputGroup.style.display = 'none';
        const colorInput = document.getElementById('balloon-colors');
        if(colorInput) colorInput.value = '';
    }
    updateKitNameRequired();
}

function updateKitNameRequired() {
    const kitNameInput = document.getElementById('kit-name');
    const kitNameLabel = document.getElementById('kit-name-label');
    if(kitNameInput) kitNameInput.removeAttribute('required');
    if(kitNameLabel) kitNameLabel.innerText = 'Nome do Kit / Tema (Opcional)';
}

// --- SISTEMA DE CROP DE IMAGEM (Croppie) ---
let _croppieInstance = null;
let _cropForProfile = false;

function openCropModal(src) {
    const modal = document.getElementById('modal-crop');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Destruir instância anterior se existir
    if(_croppieInstance) {
        try { _croppieInstance.destroy(); } catch(e) {}
        _croppieInstance = null;
    }

    const container = document.getElementById('crop-croppie-container');
    container.innerHTML = '';

    _croppieInstance = new Croppie(container, {
        viewport: { width: 240, height: 240, type: 'square' },
        boundary: { width: '100%', height: 300 },
        showZoomer: true,
        enableResize: false
    });

    _croppieInstance.bind({ url: src });
}

function confirmCrop() {
    if(!_croppieInstance) return;
    _croppieInstance.result({ type: 'base64', size: { width: 300, height: 300 }, format: 'jpeg', quality: 0.85 }).then(result => {
        if(_cropForProfile) {
            const profile = Storage.get('profile') || { name: 'Agenda Plus', color: '#6200ea' };
            profile.photo = result;
            Storage.set('profile', profile);
            applyProfile();
            _cropForProfile = false;
        } else {
            const preview = document.getElementById('kit-photo-preview');
            if(preview) preview.innerHTML = `<img src="${result}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
            let hiddenPhoto = document.getElementById('kit-photo-base64');
            if(!hiddenPhoto) {
                hiddenPhoto = document.createElement('input');
                hiddenPhoto.type = 'hidden'; hiddenPhoto.id = 'kit-photo-base64';
                document.getElementById('add-client-form').appendChild(hiddenPhoto);
            }
            hiddenPhoto.value = result;
        }
        closeCropModal();
    });
}

function cancelCrop() { closeCropModal(); }

function closeCropModal() {
    const modal = document.getElementById('modal-crop');
    if(modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    if(_croppieInstance) {
        try { _croppieInstance.destroy(); } catch(e) {}
        _croppieInstance = null;
    }
}

function openProfileCropModal(src) {
    _cropForProfile = true;
    openCropModal(src);
}

// --- SISTEMA DE STATUS NO CARD ---
let currentStatusClientId = null;

function openStatusModal(clientId, clientName) {
    currentStatusClientId = clientId;
    const modal = document.getElementById('modal-status');
    const nameEl = document.getElementById('modal-status-name');
    if(nameEl) nameEl.innerText = clientName;
    if(modal) modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function setClientStatus(newStatus) {
    if(currentStatusClientId === null) return;
    const clients = Storage.get('clients') || [];
    const idx = clients.findIndex(c => c.id === currentStatusClientId);
    if(idx !== -1) {
        clients[idx].status = newStatus;
        Storage.set('clients', clients);
        renderClients();
        if(typeof Finance !== 'undefined') Finance.updateDashboard();
        // Atualiza eventos do dia se estiver na aba agenda
        const activeDay = document.querySelector('.cal-day.active');
        if(activeDay && typeof loadDailyEvents === 'function') {
            const dateInput = document.getElementById('event-date');
            if(dateInput && dateInput.value) loadDailyEvents(dateInput.value);
        }
    }
    document.getElementById('modal-status').style.display = 'none';
    document.body.style.overflow = '';
    currentStatusClientId = null;
}

// --- SISTEMA DE EDITAR / EXCLUIR CLIENTE ---
let currentActionClientId = null;

function openClientActions(clientId, clientName) {
    currentActionClientId = clientId;
    const modal = document.getElementById('modal-client-actions');
    const nameEl = document.getElementById('action-client-name');
    if(nameEl) nameEl.innerText = clientName;
    if(modal) modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeClientActions() {
    const modal = document.getElementById('modal-client-actions');
    if(modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

function confirmDeleteClient() {
    if(currentActionClientId === null) return;
    if(!confirm('Deseja realmente excluir este agendamento?')) return;
    let clients = Storage.get('clients') || [];
    clients = clients.filter(c => c.id !== currentActionClientId);
    Storage.set('clients', clients);
    renderClients();
    if(typeof Finance !== 'undefined') Finance.updateDashboard();
    if(typeof renderCalendar === 'function') renderCalendar();
    closeClientActions();
    currentActionClientId = null;
}

function openEditModal() {
    const clients = Storage.get('clients') || [];
    const client = clients.find(c => c.id === currentActionClientId);
    if(!client) return;

    closeClientActions();

    // Preenche o formulário com os dados do cliente
    document.getElementById('client-name').value = client.clientName || '';
    document.getElementById('event-date').value = client.date || '';
    document.getElementById('kit-name').value = client.kitName || '';
    document.getElementById('kit-value').value = client.value || '';

    // Categoria
    const mainCat = document.getElementById('main-category');
    const catText = document.getElementById('selected-category-text');
    const clearBtn = document.getElementById('btn-clear-category');
    const arrow = document.getElementById('category-arrow');
    if(client.category) {
        if(mainCat) mainCat.value = client.category;
        if(catText) catText.innerText = client.category;
        if(clearBtn) clearBtn.style.display = 'inline-block';
        if(arrow) arrow.style.display = 'none';
    }

    // Pagamento
    const payMethod = document.getElementById('payment-method');
    const payText = document.getElementById('selected-payment-text');
    if(client.method) {
        if(payMethod) payMethod.value = client.method;
        if(payText) payText.innerText = client.method;
    }

    // Status
    const statusRadio = document.querySelector(`input[name="payment-status"][value="${client.status}"]`);
    if(statusRadio) statusRadio.checked = true;

    // Foto
    const preview = document.getElementById('kit-photo-preview');
    if(client.photo && preview) {
        preview.innerHTML = `<img src="${client.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`;
    }
    let hiddenPhoto = document.getElementById('kit-photo-base64');
    if(!hiddenPhoto) {
        hiddenPhoto = document.createElement('input');
        hiddenPhoto.type = 'hidden'; hiddenPhoto.id = 'kit-photo-base64';
        document.getElementById('add-client-form').appendChild(hiddenPhoto);
    }
    hiddenPhoto.value = client.photo || '';

    // Muda título e botão do modal
    document.querySelector('#modal-add h2').innerText = 'Editar Agendamento';
    const submitBtn = document.querySelector('#add-client-form button[type="submit"]');
    submitBtn.innerText = 'Salvar Alterações';

    // Guarda o ID sendo editado
    let editingId = document.getElementById('editing-client-id');
    if(!editingId) {
        editingId = document.createElement('input');
        editingId.type = 'hidden'; editingId.id = 'editing-client-id';
        document.getElementById('add-client-form').appendChild(editingId);
    }
    editingId.value = client.id;

    // Carregar adicionais do cliente
    _adicionaisList = client.adicionais ? [...client.adicionais] : [];
    renderAdicionaisList();

    openModal();
}

function resetFormToNew() {
    document.querySelector('#modal-add h2').innerText = 'Novo Agendamento';
    const submitBtn = document.querySelector('#add-client-form button[type="submit"]');
    if(submitBtn) submitBtn.innerText = 'Salvar no Calendário';
    const editingId = document.getElementById('editing-client-id');
    if(editingId) editingId.value = '';

    // Limpar todos os campos do formulário
    const form = document.getElementById('add-client-form');
    if(form) form.reset();

    if(document.getElementById('selected-category-text')) document.getElementById('selected-category-text').innerText = 'Selecionar kit...';
    if(document.getElementById('selected-payment-text')) document.getElementById('selected-payment-text').innerText = 'Selecionar pagamento...';
    if(document.getElementById('balloon-input-group')) document.getElementById('balloon-input-group').style.display = 'none';
    if(document.getElementById('btn-clear-category')) document.getElementById('btn-clear-category').style.display = 'none';
    if(document.getElementById('category-arrow')) document.getElementById('category-arrow').style.display = 'inline-block';
    if(document.getElementById('main-category')) document.getElementById('main-category').value = '';
    if(document.getElementById('kit-name-label')) document.getElementById('kit-name-label').innerText = 'Nome do Kit / Tema (Opcional)';
    if(document.getElementById('kit-photo-base64')) document.getElementById('kit-photo-base64').value = '';
    const preview = document.getElementById('kit-photo-preview');
    if(preview) preview.innerHTML = '<span class="photo-add-hint">📷<br><span style="font-size:11px;color:var(--text-sub);">Toque para adicionar</span></span>';
    _adicionaisList = [];
    if(typeof renderAdicionaisList === 'function') renderAdicionaisList();
    const adicionaisPanel = document.getElementById('adicionais-panel');
    if(adicionaisPanel) adicionaisPanel.style.display = 'none';
    const inlineForm = document.getElementById('adicional-inline-form');
    if(inlineForm) inlineForm.style.display = 'none';
}

// --- CONTROLE DE INTERFACE ---
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (item.classList.contains('active')) return;
        navItems.forEach(nav => nav.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        const targetTab = document.getElementById(target);
        if(targetTab) targetTab.classList.add('active');
        if (target === 'tab-clients') renderClients();
        if (target === 'tab-finance') typeof Finance !== 'undefined' && Finance.updateDashboard();
        if (target === 'tab-calendar') typeof renderCalendar === 'function' && renderCalendar();
        const mainContent = document.getElementById('main-content');
        if(mainContent) mainContent.scrollTop = 0;
    });
});

const modal = document.getElementById('modal-add');
const closeModalBtn = document.getElementById('close-modal');
const topSettings = document.getElementById('btn-top-settings');
const btnHeaderAdd = document.getElementById('btn-header-add');

function openModal() {
    if(!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function fnCloseModal() {
    if(!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetFormToNew();
}

if(btnHeaderAdd) btnHeaderAdd.onclick = openModal;
if(topSettings) {
    topSettings.onclick = () => {
        const profileTab = document.querySelector('[data-target="tab-profile"]');
        if(profileTab) profileTab.click();
    };
}
if(closeModalBtn) closeModalBtn.onclick = fnCloseModal;

document.getElementById('close-status-modal') && (document.getElementById('close-status-modal').onclick = () => {
    document.getElementById('modal-status').style.display = 'none';
    document.body.style.overflow = '';
    currentStatusClientId = null;
});

document.getElementById('close-actions-modal') && (document.getElementById('close-actions-modal').onclick = closeClientActions);

window.onclick = (event) => {
    const picker = document.getElementById('custom-picker');
    const cropModal = document.getElementById('modal-crop');
    const statusModal = document.getElementById('modal-status');
    const actionsModal = document.getElementById('modal-client-actions');
    if(event.target == modal) fnCloseModal();
    if(event.target == picker) closePicker();
    if(event.target == cropModal) closeCropModal();
    if(event.target == statusModal) { statusModal.style.display = 'none'; document.body.style.overflow = ''; currentStatusClientId = null; }
    if(event.target == actionsModal) closeClientActions();
};

// Preview e crop ao selecionar foto
const kitPhotoInput = document.getElementById('kit-photo');
if(kitPhotoInput) {
    kitPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => openCropModal(ev.target.result);
        reader.readAsDataURL(file);
    });
}

// Pesquisa de Clientes
const searchInput = document.getElementById('client-search');
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderClients(e.target.value.toLowerCase());
    });
}

// Salvar / Atualizar Cliente
// --- ADICIONAIS ---
let _adicionaisList = [];

function toggleAdicionaisPanel() {
    const panel = document.getElementById('adicionais-panel');
    if(!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    renderAdicionaisList();
}

function renderAdicionaisList() {
    const ul = document.getElementById('adicionais-items');
    if(!ul) return;
    if(_adicionaisList.length === 0) {
        ul.innerHTML = '<p style="font-size:12px;color:var(--text-sub);text-align:center;margin:8px 0;">Nenhum adicional ainda.</p>';
    } else {
        ul.innerHTML = _adicionaisList.map((a, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;">
                <span>📦 ${a.nome}</span>
                <span style="font-weight:600;color:var(--primary);">R$ ${parseFloat(a.valor).toFixed(2).replace('.',',')}</span>
                <button onclick="_adicionaisList.splice(${i},1); renderAdicionaisList(); updateAdicionaisTotal();" style="background:none;border:none;color:var(--red);font-size:16px;cursor:pointer;padding:0 4px;">×</button>
            </div>
        `).join('');
    }
    updateAdicionaisTotal();
}

function updateAdicionaisTotal() {
    const total = _adicionaisList.reduce((s, a) => s + parseFloat(a.valor||0), 0);
    const el = document.getElementById('adicionais-total-label');
    if(el) el.innerText = total > 0 ? `Total adicionais: R$ ${total.toFixed(2).replace('.',',')}` : '';
    // Auto-preenche o Valor Total se estiver vazio ou zerado
    const kitVal = document.getElementById('kit-value');
    if(kitVal && (!kitVal.value || parseFloat(kitVal.value) === 0)) {
        if(total > 0) kitVal.value = total.toFixed(2);
        else kitVal.value = '';
    }
}

function showAddAdicionalForm() {
    const f = document.getElementById('adicional-inline-form');
    if(f) { f.style.display = 'block'; document.getElementById('adicional-nome').focus(); }
}

function saveAdicional() {
    const nome = (document.getElementById('adicional-nome').value || '').trim();
    const valor = parseFloat(document.getElementById('adicional-valor').value) || 0;
    if(!nome) { alert('Informe o nome do adicional.'); return; }
    if(valor <= 0) { alert('Informe um valor válido.'); return; }
    _adicionaisList.push({ nome, valor });
    document.getElementById('adicional-nome').value = '';
    document.getElementById('adicional-valor').value = '';
    document.getElementById('adicional-inline-form').style.display = 'none';
    renderAdicionaisList();
}

const form = document.getElementById('add-client-form');
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerText = "Salvando...";
        submitBtn.disabled = true;

        const kitCategory = document.getElementById('main-category');
        let categoryVal = kitCategory ? kitCategory.value : '';
        const hasBalloons = document.getElementById('has-balloons');
        if(hasBalloons && hasBalloons.checked) {
            const bColor = document.getElementById('balloon-colors') ? document.getElementById('balloon-colors').value : '';
            categoryVal = categoryVal ? `${categoryVal} + Arco🎈 (${bColor})` : `Arco🎈 (${bColor})`;
        }
        const statusChecked = document.querySelector('input[name="payment-status"]:checked');
        const statusVal = statusChecked ? statusChecked.value : 'pendente';
        const hiddenPhoto = document.getElementById('kit-photo-base64');
        const base64 = hiddenPhoto && hiddenPhoto.value ? hiddenPhoto.value : null;
        const editingId = document.getElementById('editing-client-id');
        const isEditing = editingId && editingId.value !== '';

        let clients = Storage.get('clients') || [];

        if(isEditing) {
            // Atualiza cliente existente
            const idx = clients.findIndex(c => c.id === parseInt(editingId.value));
            if(idx !== -1) {
                clients[idx] = {
                    ...clients[idx],
                    clientName: document.getElementById('client-name').value,
                    date: document.getElementById('event-date').value,
                    category: categoryVal,
                    kitName: document.getElementById('kit-name').value,
                    value: parseFloat(document.getElementById('kit-value').value) || _adicionaisList.reduce((s,a)=>s+(parseFloat(a.valor)||0),0),
                    status: statusVal,
                    method: document.getElementById('payment-method').value,
                    photo: base64 !== null ? base64 : clients[idx].photo,
                    adicionais: [..._adicionaisList]
                };
            }
        } else {
            // Novo cliente
            clients.push({
                id: Date.now(),
                photo: base64,
                clientName: document.getElementById('client-name').value,
                date: document.getElementById('event-date').value,
                category: categoryVal,
                kitName: document.getElementById('kit-name').value,
                value: parseFloat(document.getElementById('kit-value').value) || _adicionaisList.reduce((s,a)=>s+(parseFloat(a.valor)||0),0),
                status: statusVal,
                method: document.getElementById('payment-method').value,
                adicionais: [..._adicionaisList]
            });
        }

        Storage.set('clients', clients);
        form.reset();

        // Reset visual
        if(document.getElementById('selected-category-text')) document.getElementById('selected-category-text').innerText = 'Selecionar kit...';
        if(document.getElementById('selected-payment-text')) document.getElementById('selected-payment-text').innerText = 'Selecionar pagamento...';
        if(document.getElementById('balloon-input-group')) document.getElementById('balloon-input-group').style.display = 'none';
        if(document.getElementById('btn-clear-category')) document.getElementById('btn-clear-category').style.display = 'none';
        if(document.getElementById('category-arrow')) document.getElementById('category-arrow').style.display = 'inline-block';
        if(document.getElementById('main-category')) document.getElementById('main-category').value = '';
        if(document.getElementById('kit-name-label')) document.getElementById('kit-name-label').innerText = 'Nome do Kit / Tema (Opcional)';
        if(document.getElementById('kit-name')) document.getElementById('kit-name').removeAttribute('required');
        if(document.getElementById('kit-photo-base64')) document.getElementById('kit-photo-base64').value = '';
        _adicionaisList = []; renderAdicionaisList ? renderAdicionaisList() : null;
        const preview = document.getElementById('kit-photo-preview');
        if(preview) preview.innerHTML = '🎈';

        fnCloseModal();
        submitBtn.innerText = isEditing ? "Salvar Alterações" : "Salvar no Calendário";
        submitBtn.disabled = false;

        renderClients();
        if(typeof Finance !== 'undefined') Finance.updateDashboard();
        if(typeof renderCalendar === 'function') renderCalendar();

        const clientsTab = document.querySelector('[data-target="tab-clients"]');
        if(clientsTab) clientsTab.click();
    });
}

// Renderizar lista de Clientes
function renderClients(filterTerm = "", filterStatus = null, filterCategory = null) {
    const list = document.getElementById('clients-list');
    if(!list) return;

    let clients = Storage.get('clients') || [];

    if (filterTerm) {
        clients = clients.filter(c =>
            (c.clientName || '').toLowerCase().includes(filterTerm) ||
            (c.kitName || '').toLowerCase().includes(filterTerm)
        );
    }

    // Usar estado global de filtros se não passado
    if (filterStatus === null) filterStatus = window._filterStatus || '';
    if (filterCategory === null) filterCategory = window._filterCategory || '';

    if (filterStatus) {
        clients = clients.filter(c => c.status === filterStatus);
    }

    if (filterCategory) {
        clients = clients.filter(c => (c.category || '').includes(filterCategory));
    }

    if (clients.length === 0) {
        list.innerHTML = `<div class="empty-state">${filterTerm || filterStatus || filterCategory ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}</div>`;
        return;
    }

    clients.sort((a, b) => new Date(a.date) - new Date(b.date));

    const statusLabel = { pendente: 'Pendente', '50': '50% Pago', pago: 'Pago Total', credito: 'Crédito' };

    list.innerHTML = clients.map((c, index) => `
        <div class="client-card" style="animation-delay: ${index * 50}ms">
            <div class="client-photo-wrapper">
                <div class="client-photo glass-card">
                    ${c.photo ? `<img src="${c.photo}" loading="lazy">` : '🎈'}
                </div>
            </div>
            <div class="client-info">
                <div class="client-header-row">
                    <h3>${c.clientName}</h3>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="event-date-tag">${c.date.split('-').reverse().join('/')}</span>
                        <button class="btn-card-actions" onclick="openClientActions(${c.id}, '${(c.clientName||'').replace(/'/g,"\'")}')">⋯</button>
                    </div>
                </div>
                <p class="info-line"><span class="info-icon">🎁</span> <span class="kit-theme">${c.kitName || '—'}</span></p>
                <p class="info-line"><span class="info-icon">🏷️</span> ${c.category || '—'}</p>
                <div class="client-footer-row">
                    <p class="price-tag">R$ ${(parseFloat(c.value)||0).toFixed(2).replace('.',',')}</p>
                    <button class="status-chip status-chip-${c.status}" onclick="openStatusModal(${c.id}, '${(c.clientName||'').replace(/'/g,"\'")}')">
                        ${statusLabel[c.status] || c.status}
                    </button>
                </div>
                <p class="info-line" style="margin-top:3px; font-size:11px;">💳 ${c.method || 'N/A'}</p>
                ${c.adicionais && c.adicionais.length > 0 ? `<p class="info-line" style="margin-top:3px; font-size:11px; color:var(--primary);">📦 Adicionais: ${c.adicionais.map(a=>a.nome).join(', ')} (+R$ ${c.adicionais.reduce((s,a)=>s+(parseFloat(a.valor)||0),0).toFixed(2).replace('.',',')})</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Aplicar Configurações de Perfil
function applyProfile() {
    const profile = Storage.get('profile');
    if(!profile) return;
    document.documentElement.style.setProperty('--primary', profile.color);
    document.documentElement.style.setProperty('--primary-light', profile.color + '22');
    const hTitle = document.getElementById('header-title');
    if(hTitle) hTitle.innerText = profile.name;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if(themeMeta) themeMeta.setAttribute('content', profile.color);

    // Aplicar foto de perfil
    const headerPic = document.getElementById('header-profile-pic');
    const profilePreview = document.getElementById('profile-preview');
    const profileEmoji = document.getElementById('profile-emoji');
    if(profile.photo) {
        if(headerPic) { headerPic.innerHTML = `<img src="${profile.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`; }
        if(profilePreview) { profilePreview.src = profile.photo; profilePreview.style.display = 'block'; }
        if(profileEmoji) profileEmoji.style.display = 'none';
    } else {
        if(headerPic) headerPic.innerHTML = '🎈';
        if(profilePreview) profilePreview.style.display = 'none';
        if(profileEmoji) profileEmoji.style.display = 'block';
    }
    // Preencher campos
    const nameInput = document.getElementById('company-name-input');
    const colorInput = document.getElementById('app-color-input');
    const colorVal = document.getElementById('color-val-display');
    if(nameInput) nameInput.value = profile.name || 'Agenda Plus';
    if(colorInput) colorInput.value = profile.color || '#6200ea';
    if(colorVal) colorVal.innerText = profile.color || '#6200ea';
}

// Salvar Perfil
const btnSaveProfile = document.getElementById('btn-save-profile');
if(btnSaveProfile) {
    btnSaveProfile.onclick = () => {
        const name = document.getElementById('company-name-input').value || 'Agenda Plus';
        const color = document.getElementById('app-color-input').value || '#6200ea';
        const profile = Storage.get('profile') || {};
        profile.name = name;
        profile.color = color;
        Storage.set('profile', profile);
        applyProfile();
        btnSaveProfile.innerText = '✅ Salvo!';
        setTimeout(() => btnSaveProfile.innerText = 'Salvar Alterações', 1500);
    };
}

// Upload de foto de perfil - usa crop modal
const profileUpload = document.getElementById('profile-upload');
if(profileUpload) {
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => openProfileCropModal(ev.target.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    });
}

// Cor do app em tempo real
const appColorInput = document.getElementById('app-color-input');
const colorValDisplay = document.getElementById('color-val-display');
if(appColorInput) {
    appColorInput.addEventListener('input', () => {
        if(colorValDisplay) colorValDisplay.innerText = appColorInput.value;
    });
}

// Crop modal para foto de perfil (reutiliza o mesmo modal)
// Filtros de Clientes
window._filterStatus = '';
window._filterCategory = '';

function toggleFilterPanel() {
    const panel = document.getElementById('filter-panel');
    if(!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if(!chip) return;
    const group = chip.dataset.group;
    const value = chip.dataset.value;
    // Deselect siblings
    document.querySelectorAll(`.filter-chip[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    if(group === 'status') window._filterStatus = value;
    if(group === 'category') window._filterCategory = value;
    // Update badge
    const badge = document.getElementById('filter-badge');
    if(badge) badge.style.display = (window._filterStatus || window._filterCategory) ? 'inline' : 'none';
    const searchVal = document.getElementById('client-search') ? document.getElementById('client-search').value.toLowerCase() : '';
    renderClients(searchVal);
});

// Botão de forçar atualização
const btnForceUpdate = document.getElementById('btn-force-update');
if(btnForceUpdate) {
    btnForceUpdate.onclick = async () => {
        btnForceUpdate.innerText = '⏳ Verificando...';
        btnForceUpdate.disabled = true;
        try {
            if('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for(const reg of regs) await reg.unregister();
            }
            // Clear caches
            if('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(k => caches.delete(k)));
            }
            btnForceUpdate.innerText = '✅ Atualizado! Recarregando...';
            setTimeout(() => location.reload(true), 800);
        } catch(e) {
            btnForceUpdate.innerText = '⚠️ Erro, tente recarregar manualmente';
            btnForceUpdate.disabled = false;
        }
    };
}

// Inicialização
window.onload = () => {
    applyProfile();
    if(typeof renderCalendar === 'function') renderCalendar();
};