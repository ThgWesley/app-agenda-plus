const App = {
    init: () => {
        Finance.init();

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker Registrado'))
            .catch(err => console.error('Erro no SW:', err));
        }
    }
};

document.addEventListener('DOMContentLoaded', App.init);

// Atualizar UI do Google
function updateGoogleUI() {
    const isConnected = GoogleSync.isConnected();
    const statusText = document.getElementById('google-status-text');
    const btnLogin = document.getElementById('btn-google-login');
    const btnSync = document.getElementById('btn-google-sync');
    const btnLogout = document.getElementById('btn-google-logout');
    
    if (isConnected) {
        statusText.textContent = '✅ Conectado ao Google Calendar';
        btnLogin.style.display = 'none';
        btnSync.style.display = 'block';
        btnLogout.style.display = 'block';
    } else {
        statusText.textContent = '⚪ Desconectado';
        btnLogin.style.display = 'block';
        btnSync.style.display = 'none';
        btnLogout.style.display = 'none';
    }
}

// Atualizar ao carregar
document.addEventListener('DOMContentLoaded', updateGoogleUI);
