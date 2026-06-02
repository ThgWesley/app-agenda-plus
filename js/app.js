const App = {
    init: () => {
        Finance.init();
        updateGoogleSyncUI();

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker Registrado'))
            .catch(err => console.error('Erro no SW:', err));
        }
        
        GoogleSync.init();
    },

    deleteClient: (id) => {
        if(confirm("Deseja realmente excluir este agendamento?")) {
            let clients = Storage.get('clients') || [];
            const client = clients.find(c => c.id === id);
            
            if (client && client.googleEventId) {
                GoogleSync.deleteEvent(client);
            }
            
            clients = clients.filter(c => c.id !== id);
            Storage.set('clients', clients);
            
            GoogleSync.updateBackupFile();

            if(typeof renderCalendar === 'function') renderCalendar();
            if(typeof renderClients === 'function') renderClients();
            if(typeof Finance !== 'undefined') Finance.updateDashboard();
        }
    }
};

function updateGoogleSyncUI() {
    const statusDiv = document.getElementById('google-sync-status');
    const statusMsg = document.getElementById('google-sync-message');
    const btnConnect = document.getElementById('btn-google-connect');
    const btnSyncAll = document.getElementById('btn-google-sync-all');
    const btnDisconnect = document.getElementById('btn-google-disconnect');
    
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusMsg.textContent = '✅ Google Sync: Ativo';
        btnConnect.style.display = 'none';
        btnSyncAll.style.display = 'block';
        btnDisconnect.style.display = 'block';
    }
}

function syncAllEvents() {
    GoogleSync.syncAllEvents();
}

document.addEventListener('DOMContentLoaded', App.init);
