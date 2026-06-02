const App = {
    init: () => {
        Finance.init();
        updateGoogleSyncUI();

        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker Registrado'))
            .catch(err => console.error('Erro no SW:', err));
        }
    },

    deleteClient: (id) => {
        if(confirm("Deseja realmente excluir este agendamento?")) {
            let clients = Storage.get('clients') || [];
            const client = clients.find(c => c.id === id);
            
            // Sincroniza deleção com Google se conectado
            if (client && GoogleConfig.isConnected()) {
                GoogleSync.deleteEvent(client);
            }
            
            clients = clients.filter(c => c.id !== id);
            Storage.set('clients', clients);
            
            // Atualiza backup
            if (GoogleConfig.isConnected()) {
                GoogleSync.updateBackupFile();
            }

            if(typeof renderCalendar === 'function') renderCalendar();
            if(typeof renderClients === 'function') renderClients();
            if(typeof Finance !== 'undefined') Finance.updateDashboard();
        }
    }
};

// Função para atualizar UI do Google Sync
function updateGoogleSyncUI() {
    const isConnected = GoogleConfig.isConnected();
    const statusDiv = document.getElementById('google-sync-status');
    const statusMsg = document.getElementById('google-sync-message');
    const btnConnect = document.getElementById('btn-google-connect');
    const btnSyncAll = document.getElementById('btn-google-sync-all');
    const btnDisconnect = document.getElementById('btn-google-disconnect');
    
    if (isConnected) {
        statusDiv.style.display = 'block';
        statusMsg.textContent = '✅ Status: Conectado a Google (Agenda + Drive)';
        btnConnect.style.display = 'none';
        btnSyncAll.style.display = 'block';
        btnDisconnect.style.display = 'block';
    } else {
        statusDiv.style.display = 'block';
        statusMsg.textContent = '⚪ Status: Desconectado';
        btnConnect.style.display = 'block';
        btnSyncAll.style.display = 'none';
        btnDisconnect.style.display = 'none';
    }
}

// Iniciar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', App.init);
