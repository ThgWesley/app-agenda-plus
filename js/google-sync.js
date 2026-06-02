// ============================================
// SINCRONIZAÇÃO GOOGLE CALENDAR - OAUTH
// ============================================

const GoogleSync = {
    CLIENT_ID: '1043225940082-0slf91qvm2njm0t8450dtpk8iomsgosm.apps.googleusercontent.com',
    REDIRECT_URI: 'https://thgwesley.github.io/app-agenda-plus/',
    SCOPES: 'https://www.googleapis.com/auth/calendar',
    
    startAuth: function() {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('oauth_state', state);
        
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', this.CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('scope', this.SCOPES);
        authUrl.searchParams.append('state', state);
        
        window.location.href = authUrl.toString();
    },
    
    handleCallback: function() {
        const hash = window.location.hash.substring(1);
        if (!hash) return false;
        
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const state = params.get('state');
        
        if (state !== localStorage.getItem('oauth_state')) {
            console.error('State inválido');
            return false;
        }
        
        if (token) {
            localStorage.setItem('google_access_token', token);
            localStorage.removeItem('oauth_state');
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('✅ Autenticado!');
            return true;
        }
        return false;
    },
    
    isConnected: function() {
        return !!localStorage.getItem('google_access_token');
    },
    
    disconnect: function() {
        localStorage.removeItem('google_access_token');
        console.log('❌ Desconectado');
    },
    
    syncAllEvents: function() {
        if (!this.isConnected()) {
            alert('Conecte ao Google primeiro!');
            this.startAuth();
            return;
        }
        
        const clients = Storage.get('clients') || [];
        if (clients.length === 0) {
            alert('Nenhum evento para sincronizar');
            return;
        }
        
        console.log(`Sincronizando ${clients.length} eventos...`);
        let syncedCount = 0;
        
        clients.forEach((client, index) => {
            setTimeout(() => {
                this.createEvent(client);
                syncedCount++;
            }, index * 800);
        });
        
        setTimeout(() => {
            alert(`✅ ${syncedCount} eventos enviados para Google Calendar!`);
        }, clients.length * 800);
    },
    
    createEvent: function(client) {
        const token = localStorage.getItem('google_access_token');
        
        // Usar apenas a data, sem conversão de hora
        const [year, month, day] = client.date.split('-');
        
        const event = {
            summary: `${client.clientName} - ${client.kitName}`,
            description: `Valor: R$ ${client.value}\nStatus: ${client.status}\nCategoria: ${client.category}`,
            start: {
                date: client.date
            },
            end: {
                date: client.date
            }
        };
        
        fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
        .then(r => r.json())
        .then(data => {
            if (data.id) {
                console.log('✅', client.clientName);
            } else {
                console.error('Erro:', data.error?.message);
            }
        })
        .catch(err => console.error('Erro:', err));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (GoogleSync.handleCallback()) {
        location.reload();
    }
});
