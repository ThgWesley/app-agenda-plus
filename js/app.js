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
