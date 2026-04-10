const Storage = {
    keys: {
        CLIENTS: 'agendaplus_clients',
        SETTINGS: 'agendaplus_settings'
    },

    getClients: () => {
        const data = localStorage.getItem(Storage.keys.CLIENTS);
        return data ? JSON.parse(data) : [];
    },

    saveClients: (clientsArray) => {
        localStorage.setItem(Storage.keys.CLIENTS, JSON.stringify(clientsArray));
    },

    addClient: (clientData) => {
        const clients = Storage.getClients();
        clientData.id = Date.now().toString(); // Gerar ID único
        clients.push(clientData);
        Storage.saveClients(clients);
        return clientData;
    },

    getSettings: () => {
        const defaultSettings = {
            appName: 'Agenda Plus',
            primaryColor: '#6C63FF',
            avatarBase64: '',
            splitPercentage: 50
        };
        const data = localStorage.getItem(Storage.keys.SETTINGS);
        return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    },

    saveSettings: (settingsObj) => {
        localStorage.setItem(Storage.keys.SETTINGS, JSON.stringify(settingsObj));
    },

    clearAllData: () => {
        if(confirm("Tem certeza que deseja apagar TODOS os clientes e configurações? Isso não pode ser desfeito.")){
            localStorage.clear();
            location.reload();
        }
    }
};
