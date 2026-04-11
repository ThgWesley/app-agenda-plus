// --- CONFIGURAÇÕES DO PICKER (INTEGRADO COM LÓGICA DE BALÕES) ---
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

        // Mostra o X e esconde a seta
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

    // Esconde o X e mostra a seta novamente
    if(clearBtn) clearBtn.style.display = 'none';
    if(arrow) arrow.style.display = 'inline-block';

    // Reavalia o required do kit-name
    updateKitNameRequired();
}

function closePicker() {
    const picker = document.getElementById('custom-picker');
    if(picker) picker.style.display = 'none';
}

// Controla exibição do campo de cores dos balões e o required do kit-name
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

// Atualiza o label e o required do kit-name conforme o contexto
function updateKitNameRequired() {
    const checkbox = document.getElementById('has-balloons');
    const mainCat = document.getElementById('main-category');
    const kitNameInput = document.getElementById('kit-name');
    const kitNameLabel = document.getElementById('kit-name-label');

    const apenasArco = checkbox && checkbox.checked && (!mainCat || mainCat.value === '');

    if(apenasArco) {
        // Arco de balões vendido sozinho: kit-name é opcional
        if(kitNameInput) kitNameInput.removeAttribute('required');
        if(kitNameLabel) kitNameLabel.innerText = 'Nome do Kit / Tema (Opcional)';
    } else {
        // Qualquer outro caso: obrigatório
        if(kitNameInput) kitNameInput.setAttribute('required', 'required');
        if(kitNameLabel) kitNameLabel.innerText = 'Nome do Kit / Tema';
    }
}

// --- CONTROLE DE INTERFACE ORIGINAL ---

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
        if (target === 'tab-finance') typeof updateFinance === 'function' && updateFinance();
        if (target === 'tab-calendar') typeof renderCalendar === 'function' && renderCalendar();
        
        const mainContent = document.getElementById('main-content');
        if(mainContent) mainContent.scrollTop = 0;
    });
});

const modal = document.getElementById('modal-add');
const fab = document.getElementById('fab-add');
const closeModal = document.getElementById('close-modal');
const topSettings = document.getElementById('btn-top-settings');

function openModal() {
    if(!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

function fnCloseModal() {
    if(!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

if(fab) fab.onclick = openModal;
if(topSettings) {
    topSettings.onclick = () => {
        const profileTab = document.querySelector('[data-target="tab-profile"]');
        if(profileTab) profileTab.click();
    };
}
if(closeModal) closeModal.onclick = fnCloseModal;

window.onclick = (event) => {
    const picker = document.getElementById('custom-picker');
    if (event.target == modal) fnCloseModal();
    if (event.target == picker) closePicker();
}

// Pesquisa de Clientes
const searchInput = document.getElementById('client-search');
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderClients(term);
    });
}

// Salvar Cliente
const form = document.getElementById('add-client-form');
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('kit-photo');
        const file = fileInput ? fileInput.files[0] : null;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.innerText = "Salvando...";
        submitBtn.disabled = true;
        
        const processAndSave = (base64Img) => {
            const kitCategory = document.getElementById('main-category');
            let categoryVal = kitCategory ? kitCategory.value : '';
            
            // Se tiver arco de balões marcado, acrescenta as cores na categoria
            const hasBalloons = document.getElementById('has-balloons');
            if(hasBalloons && hasBalloons.checked) {
                const bColor = document.getElementById('balloon-colors') ? document.getElementById('balloon-colors').value : '';
                categoryVal = categoryVal ? `${categoryVal} + Arco🎈 (${bColor})` : `Arco🎈 (${bColor})`;
            }
            
            const statusChecked = document.querySelector('input[name="payment-status"]:checked');
            const statusVal = statusChecked ? statusChecked.value : 'pendente';
            
            const newClient = {
                id: Date.now(),
                photo: base64Img,
                clientName: document.getElementById('client-name').value,
                date: document.getElementById('event-date').value,
                category: categoryVal,
                kitName: document.getElementById('kit-name').value,
                value: parseFloat(document.getElementById('kit-value').value) || 0,
                status: statusVal,
                method: document.getElementById('payment-method').value
            };
            
            const clients = Storage.get('clients');
            clients.push(newClient);
            Storage.set('clients', clients);
            
            form.reset();
            
            // Reset visual completo após salvar
            if(document.getElementById('selected-category-text')) document.getElementById('selected-category-text').innerText = 'Selecionar kit...';
            if(document.getElementById('selected-payment-text')) document.getElementById('selected-payment-text').innerText = 'Selecionar pagamento...';
            if(document.getElementById('balloon-input-group')) document.getElementById('balloon-input-group').style.display = 'none';
            if(document.getElementById('btn-clear-category')) document.getElementById('btn-clear-category').style.display = 'none';
            if(document.getElementById('category-arrow')) document.getElementById('category-arrow').style.display = 'inline-block';
            if(document.getElementById('main-category')) document.getElementById('main-category').value = '';
            if(document.getElementById('kit-name-label')) document.getElementById('kit-name-label').innerText = 'Nome do Kit / Tema';
            if(document.getElementById('kit-name')) document.getElementById('kit-name').setAttribute('required', 'required');

            const preview = document.getElementById('kit-photo-preview');
            if(preview) preview.innerHTML = '🎈';
            fnCloseModal();
            
            submitBtn.innerText = "Salvar no Calendário";
            submitBtn.disabled = false;
            
            const clientsTab = document.querySelector('[data-target="tab-clients"]');
            if(clientsTab) clientsTab.click();
        };

        if (file && typeof resizeImage === 'function') {
            resizeImage(file, processAndSave);
        } else {
            processAndSave(null);
        }
    });
}

// Renderizar lista de Clientes
function renderClients(filterTerm = "") {
    const list = document.getElementById('clients-list');
    if(!list) return;

    let clients = Storage.get('clients');
    
    if (filterTerm) {
        clients = clients.filter(c => 
            c.clientName.toLowerCase().includes(filterTerm) || 
            c.kitName.toLowerCase().includes(filterTerm)
        );
    }
    
    if (clients.length === 0) {
        list.innerHTML = `<div class="empty-state">${filterTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}</div>`;
        return;
    }
    
    clients.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    list.innerHTML = clients.map((c, index) => `
        <div class="client-card" style="animation-delay: ${index * 50}ms">
            <div class="client-photo-wrapper">
                <div class="client-photo glass-card">
                    ${c.photo ? `<img src="${c.photo}" loading="lazy">` : '🎈'}
                </div>
                <div class="status-indicator status-${c.status}"></div>
            </div>
            <div class="client-info">
                <div class="client-header-row">
                    <h3>${c.clientName}</h3>
                    <span class="event-date-tag">${c.date.split('-').reverse().join('/')}</span>
                </div>
                <p class="info-line"><span class="info-icon">🎁</span> <span class="kit-theme">${c.kitName}</span></p>
                <p class="info-line"><span class="info-icon">🏷️</span> ${c.category}</p>
                <div class="client-header-row" style="margin-top:5px; align-items:center;">
                    <p class="price-tag">R$ ${c.value.toFixed(2).replace('.',',')}</p>
                    <p class="info-line" style="margin:0; font-size:11px;">💳 ${c.method || 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Aplicar Configurações de Perfil
function applyProfile() {
    const profile = Storage.get('profile');
    document.documentElement.style.setProperty('--primary', profile.color);
    document.documentElement.style.setProperty('--primary-light', profile.color + '22');
    
    const hTitle = document.getElementById('header-title');
    if(hTitle) hTitle.innerText = profile.name;
    
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if(themeMeta) themeMeta.setAttribute('content', profile.color);
}

// Inicialização
window.onload = () => {
    applyProfile();
    if(typeof renderCalendar === 'function') renderCalendar();
};
