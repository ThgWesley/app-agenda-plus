// ============================================
// INTERCEPTAÇÃO DO FORMULÁRIO DE AGENDAMENTO
// ============================================

// Intercepta o formulário de novo agendamento
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#modal-add form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Aguarda um pouco para garantir que o Storage foi atualizado
            setTimeout(function() {
                // Pega o cliente criado (é o último da lista)
                const clients = Storage.get('clients') || [];
                if (clients.length > 0) {
                    const newClient = clients[clients.length - 1];
                    
                    // Se Google Calendar está conectado, sincroniza
                    if (GoogleConfig.isConnected()) {
                        GoogleSync.createEvent(newClient);
                    }
                }
            }, 100);
        });
    }
});

// Intercepta também a função setClientStatus para atualizar no Google
const originalSetClientStatus = window.setClientStatus;
if (originalSetClientStatus) {
    window.setClientStatus = function(status) {
        originalSetClientStatus.call(this, status);
        
        setTimeout(function() {
            // Encontra qual cliente está sendo modificado
            const clients = Storage.get('clients') || [];
            if (clients.length > 0) {
                const client = clients[clients.length - 1];
                if (client && GoogleConfig.isConnected()) {
                    GoogleSync.updateEvent(client);
                }
            }
        }, 100);
    };
}
