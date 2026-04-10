const UI = {
    init: () => {
        UI.applySettings();
        document.getElementById('event-date').valueAsDate = new Date();
    },

    applySettings: () => {
        const settings = Storage.getSettings();
        document.documentElement.style.setProperty('--primary', settings.primaryColor);
        document.getElementById('primary-color').value = settings.primaryColor;
        
        document.getElementById('app-title-display').textContent = settings.appName;
        document.getElementById('edit-app-name').value = settings.appName;

        if (settings.avatarBase64) {
            document.getElementById('topbar-avatar').src = settings.avatarBase64;
            document.getElementById('profile-avatar').src = settings.avatarBase64;
        }
    },

    switchTab: (tabId, element) => {
        // Remove active class das abas e botões
        document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        
        // Ativa a aba clicada
        document.getElementById('tab-' + tabId).classList.add('active');
        element.classList.add('active');

        // Atualiza dados dependendo da aba
        if(tabId === 'calendar') Calendar.renderEventsForDate(Calendar.selectedDate);
        if(tabId === 'clients') UI.renderClients();
        if(tabId === 'finance') Finance.updateDashboard();
    },

    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        // Se abriu via calendário, seta a data pré selecionada
        if(Calendar.selectedDate) {
            const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
            const localISOTime = (new Date(Calendar.selectedDate - tzoffset)).toISOString().split('T')[0];
            document.getElementById('event-date').value = localISOTime;
        }
    },

    closeModal: (modalId) => {
        document.getElementById(modalId).classList.remove('active');
        document.getElementById('add-form').reset();
        document.getElementById('photo-preview').classList.add('hidden');
        document.getElementById('photo-preview').src = '';
        UI.toggleBalloons(); // Reseta seção de balões
    },

    toggleBalloons: () => {
        const isChecked = document.getElementById('has-balloons').checked;
        const section = document.getElementById('balloons-section');
        if (isChecked) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            document.getElementById('balloon-colors').value = '';
        }
    },

    previewImage: (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('photo-preview');
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    handleAvatarUpload: (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                const settings = Storage.getSettings();
                settings.avatarBase64 = base64;
                Storage.saveSettings(settings);
                UI.applySettings();
            };
            reader.readAsDataURL(file);
        }
    },

    saveProfile: () => {
        const name = document.getElementById('edit-app-name').value;
        const settings = Storage.getSettings();
        settings.appName = name || 'Agenda Plus';
        Storage.saveSettings(settings);
        UI.applySettings();
    },

    updateColor: (event) => {
        const color = event.target.value;
        const settings = Storage.getSettings();
        settings.primaryColor = color;
        Storage.saveSettings(settings);
        UI.applySettings();
    },

    renderClients: () => {
        const clients = Storage.getClients();
        const search = document.getElementById('search-client').value.toLowerCase();
        const container = document.getElementById('clients-list');
        container.innerHTML = '';

        // Ordernar do mais novo pro mais velho
        const filtered = clients.filter(c => c.clientName.toLowerCase().includes(search)).reverse();

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum cliente encontrado.</p>';
            return;
        }

        filtered.forEach(client => {
            const div = document.createElement('div');
            div.className = 'client-card';
            
            const img = client.photoBase64 ? `<img src="${client.photoBase64}" class="event-img">` : `<div class="event-img" style="display:flex;align-items:center;justify-content:center;background:#eee"><i class="ph ph-user" style="font-size:24px;color:#aaa"></i></div>`;
            
            let balloonsHtml = '';
            if (client.hasBalloons) {
                balloonsHtml = `<p>🎈 Arco ${client.balloonSize} (${client.balloonColors})</p>`;
            }

            div.innerHTML = `
                ${img}
                <div class="event-info w-100">
                    <h4>${client.clientName}</h4>
                    <p><strong>Kit:</strong> ${client.kitName} - ${client.mainCategory}</p>
                    ${balloonsHtml}
                    <p><strong>Data:</strong> ${client.dateFormatted}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <span class="badge ${client.status.toLowerCase()}">${client.status} - R$ ${client.price.toFixed(2)}</span>
                        <i class="ph ph-trash" style="color:var(--danger); cursor:pointer" onclick="App.deleteClient('${client.id}')"></i>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }
};
