// Gerenciador de armazenamento local (LocalStorage)
const Storage = {
    get: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    init: function() {
        if (!this.get('clients')) this.set('clients', []);
        if (!this.get('profile')) {
            this.set('profile', {
                name: 'Agenda Plus',
                color: '#6200ea',
                photo: null
            });
        }
    }
};

Storage.init();
