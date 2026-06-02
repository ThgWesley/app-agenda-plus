// ============================================
// MÓDULO DE SINCRONIZAÇÃO GOOGLE CALENDAR
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
            state: state
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
            
            console.log('✅ Google Calendar conectado com sucesso!');
            return true;
        }
        
        return false;
    },
    
    disconnect: function() {
        GoogleConfig.clearToken();
        console.log('❌ Desconectado do Google Calendar');
    },
    
    // ===== SINCRONIZAÇÃO DE EVENTOS =====
    
    createEvent: function(client) {
        if (!GoogleConfig.isConnected()) {
            console.warn('Google Calendar não conectado');
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
            // Salva o ID do evento no cliente para sincronização futura
            client.googleEventId = data.id;
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
        })
        .catch(error => {
            console.error('❌ Erro ao deletar evento:', error);
        });
    },
    
    syncAllEvents: function() {
        if (!GoogleConfig.isConnected()) {
            alert('Conecte ao Google Calendar primeiro');
            return;
        }
        
        const clients = Storage.get('clients') || [];
        console.log(`Sincronizando ${clients.length} eventos...`);
        
        clients.forEach(client => {
            // Se não tiver ID do Google, cria novo evento
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
        startDateTime.setHours(9, 0, 0); // Começa às 9h
        
        const endDateTime = new Date(date);
        endDateTime.setHours(10, 0, 0); // Termina às 10h
        
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
        // Cores disponíveis no Google Calendar (1-11)
        const colors = {
            'pendente': '4',  // Vermelho
            '50': '5',        // Amarelo
            'pago': '2',      // Verde
            'credito': '9'    // Azul
        };
        return colors[status] || '1';
    }
};

// Verifica se voltamos de autenticação do Google
document.addEventListener('DOMContentLoaded', function() {
    if (GoogleSync.handleAuthCallback()) {
        // Se autenticou com sucesso, atualiza a UI
        if (typeof updateGoogleSyncUI === 'function') {
            updateGoogleSyncUI();
        }
    }
});
