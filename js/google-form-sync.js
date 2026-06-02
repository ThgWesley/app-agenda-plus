// ============================================
// INTERCEPTAÇÃO DO FORMULÁRIO + BACKUP AUTOMÁTICO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#modal-add form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            setTimeout(function() {
                const clients = Storage.get('clients') || [];
                if (clients.length > 0) {
                    const newClient = clients[clients.length - 1];
                    
                    if (GoogleConfig.isConnected()) {
                        GoogleSync.createEvent(newClient);
                        GoogleSync.updateBackupFile();
                    }
                }
            }, 100);
        });
    }
});
