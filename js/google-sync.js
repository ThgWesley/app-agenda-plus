// ============================================
// SINCRONIZAÇÃO GOOGLE CALENDAR + DRIVE (API KEY)
// ============================================

const GoogleSync = {
    
    backupFolderId: null,
    backupFileId: null,
    
    // ===== INICIALIZAÇÃO =====
    
    init: function() {
        console.log('✅ Google Sync inicializado');
        this.ensureBackupFolder();
    },
    
    // ===== GOOGLE DRIVE - BACKUP =====
    
    ensureBackupFolder: function() {
        const query = "name='Agenda Plus Backup' and mimeType='application/vnd.google-apps.folder' and trashed=false";
        
        fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name)&key=${GoogleConfig.API_KEY}`)
        .then(r => r.json())
        .then(data => {
            if (data.files && data.files.length > 0) {
                this.backupFolderId = data.files[0].id;
                this.findOrCreateBackupFile();
            } else {
                console.log('Pasta não encontrada. Crie manualmente em Google Drive.');
            }
        })
        .catch(err => console.error('Erro ao procurar pasta:', err));
    },
    
    findOrCreateBackupFile: function() {
        if (!this.backupFolderId) return;
        
        const query = `name='backup.json' and '${this.backupFolderId}' in parents and trashed=false`;
        
        fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id)&key=${GoogleConfig.API_KEY}`)
        .then(r => r.json())
        .then(data => {
            if (data.files && data.files.length > 0) {
                this.backupFileId = data.files[0].id;
                console.log('✅ Arquivo backup.json encontrado');
            } else {
                console.log('Arquivo backup.json não encontrado. Será criado no primeiro backup.');
            }
        })
        .catch(err => console.error('Erro ao procurar backup.json:', err));
    },
    
    updateBackupFile: function() {
        if (!this.backupFolderId) {
            console.warn('Pasta de backup não configurada');
            return;
        }
        
        const backupData = Storage.get('clients') || [];
        const backupJson = JSON.stringify(backupData, null, 2);
        
        if (this.backupFileId) {
            // Atualizar arquivo existente
            this.updateExistingFile(backupJson);
        } else {
            // Criar novo arquivo
            this.createNewBackupFile(backupJson);
        }
    },
    
    createNewBackupFile: function(content) {
        const metadata = {
            name: 'backup.json',
            parents: [this.backupFolderId]
        };
        
        const blob = new Blob([content], { type: 'application/json' });
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);
        
        fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GoogleConfig.API_KEY}`, {
            method: 'POST',
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            this.backupFileId = data.id;
            console.log('✅ Arquivo backup.json criado');
        })
        .catch(err => console.error('Erro ao criar backup:', err));
    },
    
    updateExistingFile: function(content) {
        const blob = new Blob([content], { type: 'application/json' });
        
        fetch(`https://www.googleapis.com/upload/drive/v3/files/${this.backupFileId}?uploadType=media&key=${GoogleConfig.API_KEY}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: blob
        })
        .then(() => {
            console.log('✅ Backup atualizado no Google Drive');
        })
        .catch(err => console.error('Erro ao atualizar backup:', err));
    },
    
    // ===== GOOGLE CALENDAR =====
    
    createEvent: function(client) {
        const eventData = this.formatClientToEvent(client);
        
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${GoogleConfig.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        .then(r => r.json())
        .then(data => {
            if (data.id) {
                console.log('✅ Evento criado no Google Calendar');
                this.updateBackupFile();
            } else if (data.error) {
                console.error('❌ Erro Google Calendar:', data.error.message);
            }
        })
        .catch(err => console.error('Erro ao criar evento:', err));
    },
    
    updateEvent: function(client) {
        if (!client.googleEventId) return;
        
        const eventData = this.formatClientToEvent(client);
        
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${client.googleEventId}?key=${GoogleConfig.API_KEY}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        })
        .then(r => r.json())
        .then(data => {
            if (data.id) {
                console.log('✅ Evento atualizado');
                this.updateBackupFile();
            }
        })
        .catch(err => console.error('Erro ao atualizar evento:', err));
    },
    
    deleteEvent: function(client) {
        if (!client.googleEventId) return;
        
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${client.googleEventId}?key=${GoogleConfig.API_KEY}`, {
            method: 'DELETE'
        })
        .then(() => {
            console.log('✅ Evento deletado');
            this.updateBackupFile();
        })
        .catch(err => console.error('Erro ao deletar evento:', err));
    },
    
    syncAllEvents: function() {
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

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => {
    GoogleSync.init();
});
