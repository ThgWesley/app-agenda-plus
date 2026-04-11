const App = {
    init: () => {
        Finance.init();

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
            clients = clients.filter(c => c.id !== id);
            Storage.set('clients', clients);

            if(typeof renderCalendar === 'function') renderCalendar();
            if(typeof renderClients === 'function') renderClients();
            if(typeof Finance !== 'undefined') Finance.updateDashboard();
        }
    }
};

// Iniciar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', App.init);
