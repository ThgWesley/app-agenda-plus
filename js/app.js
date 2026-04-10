const App = {
    init: () => {
        UI.init();
        Calendar.init();
        Finance.init();

        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker Registrado'))
            .catch(err => console.error('Erro no SW:', err));
        }
    },

    saveEvent: (event) => {
        event.preventDefault();

        const rawDate = document.getElementById('event-date').value;
        const [year, month, day] = rawDate.split('-');
        const dateFormatted = `${day}/${month}/${year}`;

        const newClient = {
            rawDate: rawDate,
            dateFormatted: dateFormatted,
            clientName: document.getElementById('client-name').value,
            kitName: document.getElementById('kit-name').value,
            mainCategory: document.getElementById('main-category').value,
            hasBalloons: document.getElementById('has-balloons').checked,
            balloonSize: document.getElementById('balloon-size').value,
            balloonColors: document.getElementById('balloon-colors').value,
            price: parseFloat(document.getElementById('event-price').value),
            paymentMethod: document.getElementById('payment-method').value,
            status: document.getElementById('payment-status').value,
            photoBase64: document.getElementById('photo-preview').src.includes('data:image') ? document.getElementById('photo-preview').src : ''
        };

        Storage.addClient(newClient);
        
        UI.closeModal('add-modal');
        
        // Atualiza UI baseada na aba atual
        Calendar.render();
        UI.renderClients();
        Finance.updateDashboard();
        
        alert('Agendamento salvo com sucesso!');
    },

    deleteClient: (id) => {
        if(confirm("Deseja realmente excluir este agendamento?")) {
            let clients = Storage.getClients();
            clients = clients.filter(c => c.id !== id);
            Storage.saveClients(clients);
            
            Calendar.render();
            UI.renderClients();
            Finance.updateDashboard();
        }
    }
};

// Iniciar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', App.init);
