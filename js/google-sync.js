// ============================================
// SINCRONIZAÇÃO SIMPLES - SÓ API KEY
// ============================================

const GoogleSync = {
    API_KEY: 'AIzaSyD15PiC_a6LkJqoVqD7XW2ogujETN-IjWk',
    
    syncAllEvents: function() {
        const clients = Storage.get('clients') || [];
        
        if (clients.length === 0) {
            alert('Nenhum evento para sincronizar');
            return;
        }
        
        console.log(`Sincronizando ${clients.length} eventos para Google Calendar...`);
        
        clients.forEach((client, index) => {
            setTimeout(() => {
                this.createEvent(client);
            }, index * 500);
        });
        
        setTimeout(() => {
            alert(`✅ ${clients.length} eventos sincronizados!`);
        }, clients.length * 500);
    },
    
    createEvent: function(client) {
        const event = {
            summary: `${client.clientName} - ${client.kitName}`,
            description: `Valor: R$ ${client.value}\nStatus: ${client.status}`,
            start: {
                date: client.date,
                timeZone: 'America/Sao_Paulo'
            },
            end: {
                date: client.date,
                timeZone: 'America/Sao_Paulo'
            }
        };
        
        fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${this.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        })
        .then(r => r.json())
        .then(data => {
            if (data.id) {
                console.log('✅', client.clientName, 'sincronizado');
            } else if (data.error) {
                console.log('⚠️', data.error.message);
            }
        })
        .catch(err => console.error('Erro:', err));
    }
};
