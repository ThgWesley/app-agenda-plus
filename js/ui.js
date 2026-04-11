// --- CONFIGURAÇÕES DO PICKER (INTEGRADO) ---
const optionsData = {
    category: [
        "Pegue e monte P", "Pegue e monte M", "Pegue e monte G",
        "Mesa P", "Mesa M", "Mesa G", "Arco de balões"
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
        const catInput = document.getElementById('kit-category'); // ID original do script 1
        if(catInput) {
            catInput.value = value;
            // Dispara manualmente o evento 'change' para mostrar/esconder opções de balão
            catInput.dispatchEvent(new Event('change'));
        }
        const textDisplay = document.getElementById('selected-category-text');
        if(textDisplay) textDisplay.innerText = value;
    } else {
        const payInput = document.getElementById('payment-method');
        if(payInput) payInput.value = value;
        
        const textDisplay = document.getElementById('selected-payment-text');
        if(textDisplay) textDisplay.innerText = value;
    }
    closePicker();
}

function closePicker() {
    const picker = document.getElementById('custom-picker');
    if(picker) picker.style.display = 'none';
}

// --- CONTROLE DE INTERFACE ORIGINAL ---

// Controle de Abas com animação de feedback
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
        
        // Gatilhos de renderização
        if (target === 'tab-clients') renderClients();
        if (target === 'tab-finance') typeof updateFinance === 'function' && updateFinance();
        if (target === 'tab-calendar') typeof renderCalendar === 'function' && renderCalendar();
        
        // Rolagem para o topo ao trocar de aba
        const mainContent = document.getElementById('main-content');
        if(mainContent) mainContent.scrollTop = 0;
    });
});

// Modal e Formulário
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
    if (event.target == modal) {
        fnCloseModal();
    }
    // Fechar picker se clicar fora (opcional, conforme lógica do modal)
    const picker = document.getElementById('custom-picker');
    if (event.target == picker) closePicker();
}

// Lógica condicional de balões
const kitCategory = document.getElementById('kit-category');
const balloonOptions = document.getElementById('balloon-options');
if(kitCategory && balloonOptions) {
    kitCategory.addEventListener('change', (e) => {
        balloonOptions.style.display = (e.target.value === 'Arco de balões') ? 'block' : 'none';
    });
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
            let categoryVal = kitCategory.value;
            if (categoryVal === 'Arco de balões') {
                const bSize = document.getElementById('balloon-size').value;
                const bColor = document.getElementById('balloon-colors').value;
                categoryVal = `Arco🎈 ${bSize} (${bColor})`;
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
            // Reset dos textos do Picker
            if(document.getElementById('selected-category-text')) document.getElementById('selected-category-text').innerText = 'Selecionar...';
            if(document.getElementById('selected-payment-text')) document.getElementById('selected-payment-text').innerText = 'Selecionar...';
            
            const preview = document.getElementById('kit-photo-preview');
            if(preview) preview.innerHTML = '🎈';
            if(balloonOptions) balloonOptions.style.display = 'none';
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

// Preview foto do kit
const kitPhotoInput = document.getElementById('kit-photo');
if(kitPhotoInput) {
    kitPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById('kit-photo-preview');
        if (file && preview) {
            preview.innerHTML = '...';
            resizeImage(file, (base64) => {
                preview.innerHTML = base64 ? `<img src="${base64}">` : '🎈';
            });
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

// Configurações do Perfil
function applyProfile() {
    const profile = Storage.get('profile');
    
    document.documentElement.style.setProperty('--primary', profile.color);
    document.documentElement.style.setProperty('--primary-light', profile.color + '22');
    
    const hTitle = document.getElementById('header-title');
    const cNameInput = document.getElementById('company-name-input');
    const colorInput = document.getElementById('app-color-input');
    const colorLabel = document.querySelector('.color-val');
    const rTitle = document.getElementById('report-title');

    if(hTitle) hTitle.innerText = profile.name;
    if(cNameInput) cNameInput.value = profile.name;
    if(colorInput) colorInput.value = profile.color;
    if(colorLabel) colorLabel.innerText = profile.color;
    if(rTitle) rTitle.innerText = `Relatório - ${profile.name}`;
    
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if(themeMeta) themeMeta.setAttribute('content', profile.color);
    
    const picMini = document.getElementById('header-profile-pic');
    const picPreview = document.getElementById('profile-preview');
    const picEmoji = document.getElementById('profile-emoji');
    
    if (profile.photo) {
        if(picMini) picMini.innerHTML = `<img src="${profile.photo}">`;
        if(picPreview) { picPreview.src = profile.photo; picPreview.style.display = 'block'; }
        if(picEmoji) picEmoji.style.display = 'none';
    } else {
        if(picMini) picMini.innerHTML = '🎈';
        if(picPreview) picPreview.style.display = 'none';
        if(picEmoji) picEmoji.style.display = 'block';
    }
}

// Real-time color preview
const colorInp = document.getElementById('app-color-input');
if(colorInp) {
    colorInp.addEventListener('input', (e) => {
        const val = document.querySelector('.color-val');
        if(val) val.innerText = e.target.value;
    });
}

// Upload Foto Perfil
const profUpload = document.getElementById('profile-upload');
if(profUpload) {
    profUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            resizeImage(file, (base64) => {
                const preview = document.getElementById('profile-preview');
                const emoji = document.getElementById('profile-emoji');
                if (base64 && preview) {
                    preview.src = base64;
                    preview.style.display = 'block';
                    if(emoji) emoji.style.display = 'none';
                    profUpload.dataset.base64 = base64;
                }
            });
        }
    });
}

// Botão Salvar Perfil
const saveProfBtn = document.getElementById('btn-save-profile');
if(saveProfBtn) {
    saveProfBtn.addEventListener('click', (e) => {
        const btn = e.target;
        const originalBg = btn.style.background;
        btn.innerText = "Salvando...";
        
        const profile = Storage.get('profile');
        profile.name = document.getElementById('company-name-input').value;
        profile.color = document.getElementById('app-color-input').value;
        
        const newPhoto = document.getElementById('profile-upload').dataset.base64;
        if (newPhoto) profile.photo = newPhoto;
        
        Storage.set('profile', profile);
        applyProfile();
        
        setTimeout(() => {
            btn.innerText = "Salvo!";
            const successColor = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#2ed573';
            btn.style.background = successColor;
            
            setTimeout(() => {
                btn.innerText = "Salvar Alterações";
                btn.style.background = originalBg;
            }, 1500);
        }, 500);
    });
}

// Inicialização
window.onload = () => {
    applyProfile();
    if(typeof renderCalendar === 'function') renderCalendar();
};
