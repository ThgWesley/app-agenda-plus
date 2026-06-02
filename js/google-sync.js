// ============================================
// MÓDULO DE SINCRONIZAÇÃO GOOGLE CALENDAR + DRIVE
// ============================================

const GoogleSync = {
    
    // ===== AUTENTICAÇÃO =====
    
    startAuth: function() {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('oauth_state', state);
        
        const params = new URLSearchParams({
            client_id: GoogleConfig.CLIENT_ID,
            redirect_uri: GoogleConfig.REDIRECT_URI,
            response_type: 'token',
            scope: GoogleConfig.SCOPES,
            state: state,
            access_type: 'offline',
            prompt: 'consent'
        });
        
        window.location.href = `${GoogleConfig.AUTH_ENDPOINT}?${params}`;
    },
    
    // Processa o retorno de autenticação
    handleAuthCallback: function() {
        const hash = window.location.hash.substring(1);
        
        if (!hash) return false;
        
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const state = params.get('state');
        
        const savedState = localStorage.getItem('oauth_state');
        
        if (state !== savedState) {
            console.error('Estado OAuth inválido');
            return false;
        }
        
        if (token) {
            GoogleConfig.setToken(token);
            localStorage.removeItem('oauth_state');
            
            // Limpa a URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('✅ Google conectado com sucesso!');
            
            // Cria pasta de backup no Drive
            setTimeout(() => GoogleSync.ensureBackupFolder(), 500);
            
            return true;
        }
        
        return false;
    },
    
    disconnect: function() {
        GoogleConfig.clearToken();
        console.log('❌ Desconectado do Google');
    },
    
    // ===== GOOGLE DRIVE - BACKUP =====
    
    ensureBackupFolder: function() {
        // Procura pasta "Agenda Plus Backup"
        const query = "name='Agenda Plus Backup' and mimeType='application/vnd.google-apps.folder' and trashed=false";
        
        fetch(`${GoogleConfig.DRIVE_API}?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name)`, {
            headers: { 'Authorization': `Bearer ${GoogleConfig.getToken()}` }
        })
        .then(r => r.json())
        .then(data => {
            if (data.files && data.files.length > 0) {
                // Pasta existe
                GoogleSync.findOrCreateBackupFile(data.files[0].id);
            } else {
                // Criar pasta
                GoogleSync.createBackupFolder();
            }
        })
        .catch(err => console.error('Erro ao procurar pasta:', err));
    },
    
    createBackupFolder: function() {
        const metadata = {
            name: 'Agenda Plus Backup',
            mimeType: 'application/vnd.google-apps.folder'
        };
        
        fetch(GoogleConfig.DRIVE_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GoogleConfig.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        })
        .then(r => r.json())
        .then(data => {
            GoogleSync.findOrCreateBackupFile(data.id);
            console.log('✅ Pasta de backup criada');
        })
        .catch(err => console.error('Erro ao criar pasta:', err));
    },
    
    findOrCreateBackupFile: function(folderId) {
        const query = `name='backup.json' and '${folderId}' in parents and trashed=false`;
        
        fetch(`${GoogleConfig.DRIVE_API}?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id)`, {
            headers: { 'Authorization': `Bearer ${GoogleConfig.getToken()}` }
        })
        .then(r => r.json())
        .then(data => {
            if (data.files && data.files.length > 0) {
                GoogleConfig.setBackupFileId(data.files[0].id);
            } else {
                // Criar arquivo
                GoogleSync.createBackupFile(folderId);
            }
        })
        .catch(err => console.error('Erro ao procurar backup.json:', err));
    },
    
    createBackupFile: function(folderId) {
        const metadata = {
            name: 'backup.json',
            parents: [folderId]
        };
        
        const backupData = Storage.get('clients') || [];
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);
        
        fetch(GoogleConfig.DRIVE_UPLOAD + '?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GoogleConfig.getToken()}` },
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            GoogleConfig.setBackupFileId(data.id);
            console.log('✅ Arquivo de backup criado');
        })
        .catch(err => console.error('Erro ao criar backup.json:', err));
    },
    
    // ===== SINCRONIZAR BACKUP =====
    
    updateBackupFile: function() {
        if (!GoogleConfig.isConnected()) return;
        
        const fileId = GoogleConfig.getBackupFileId();
        if (!fileId) {
            GoogleSync.ensureBackupFolder();
            return;
        }
        
        const backupData = Storage.get('clients') || [];
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        
        fetch(`${GoogleConfig.DRIVE_UPLOAD}/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${GoogleConfig.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: blob
        })
        .then(() => {
            console.log('✅ Backup atualizado no Google Drive');
        })
        .catch(err => console.error('Erro ao atualizar backup:', err));
    },
    
    // ===== SINCRONIZAÇÃO DE EVENTOS =====
    
    createEvent: function(client) {
        if (!GoogleConfig.isConnected()) {
            console.warn('Google não conectado');
            return;
        }
        
        const eventData = this.formatClientToEvent(client);
        
        fetch(GoogleConfig.CALENDAR_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GoogleConfig.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao criar evento: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Evento criado no Google Calendar:', data.id);
            client.googleEventId = data.id;
            
            // Também faz backup
            GoogleSync.updateBackupFile();
        })
        .catch(error => {
            console.error('❌ Erro ao sincronizar com Google Calendar:', error);
        });
    },
    
    updateEvent: function(client) {
        if (!GoogleConfig.isConnected() || !client.googleEventId) {
            return;
        }
        
        const eventData = this.formatClientToEvent(client);
        const url = `${GoogleConfig.CALENDAR_API}/${client.googleEventId}`;
        
        fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GoogleConfig.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ Evento atualizado no Google Calendar');
                GoogleSync.updateBackupFile();
            }
        })
        .catch(error => {
            console.error('❌ Erro ao atualizar evento:', error);
        });
    },
    
    deleteEvent: function(client) {
        if (!GoogleConfig.isConnected() || !client.googleEventId) {
            return;
        }
        
        const url = `${GoogleConfig.CALENDAR_API}/${client.googleEventId}`;
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${GoogleConfig.getToken()}`
            }
        })
        .then(() => {
            console.log('✅ Evento deletado do Google Calendar');
            GoogleSync.updateBackupFile();
        })
        .catch(error => {
            console.error('❌ Erro ao deletar evento:', error);
        });
    },
    
    syncAllEvents: function() {
        if (!GoogleConfig.isConnected()) {
            alert('Conecte ao Google primeiro');
            return;
        }
        
        const clients = Storage.get('clients') || [];
        console.log(`Sincronizando ${clients.length} eventos...`);
        
        clients.forEach(client => {
            if (!client.googleEventId) {
                this.createEvent(client);
            }
        });
        
        alert('✅ Sincronização iniciada!');
    },
    
    // ===== FORMATAÇÃO =====
    
    formatClientToEvent: function(client) {
        const date = new Date(client.date);
        const startDateTime = new Date(date);
        startDateTime.setHours(9, 0, 0);
        
        const endDateTime = new Date(date);
        endDateTime.setHours(10, 0, 0);
        
        const statusEmoji = {
            'pendente': '🔴',
            '50': '🟠',
            'pago': '🟢',
            'credito': '🔵'
        };
        
        const description = `
Cliente: ${client.clientName}
Serviço: ${client.kitName} (${client.category})
Valor: R$ ${parseFloat(client.value || 0).toFixed(2).replace('.', ',')}
Status: ${statusEmoji[client.status] || '⚪'} ${client.status.toUpperCase()}
Forma de Pagamento: ${client.paymentMethod || '-'}
Criado em: ${new Date().toLocaleString('pt-BR')}
        `.trim();
        
        return {
            summary: `${client.clientName} - ${client.kitName}`,
            description: description,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo'
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Sao_Paulo'
            },
            colorId: this.getColorId(client.status)
        };
    },
    
    getColorId: function(status) {
        const colors = {
            'pendente': '4',
            '50': '5',
            'pago': '2',
            'credito': '9'
        };
        return colors[status] || '1';
    }
};

// Verifica se voltamos de autenticação do Google
document.addEventListener('DOMContentLoaded', function() {
    if (GoogleSync.handleAuthCallback()) {
        if (typeof updateGoogleSyncUI === 'function') {
            updateGoogleSyncUI();
        }
    }
});
