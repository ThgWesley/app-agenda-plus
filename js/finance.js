const Finance = {
    init: () => {
        const settings = Storage.get('settings') || { splitPercentage: 50 };
        const slider = document.getElementById('split-slider');
        const label = document.getElementById('my-percentage');
        if(slider) slider.value = settings.splitPercentage;
        if(label) label.textContent = settings.splitPercentage;

        if(slider) {
            slider.addEventListener('input', () => {
                const val = slider.value;
                if(label) label.textContent = val;
                const s = Storage.get('settings') || {};
                s.splitPercentage = val;
                Storage.set('settings', s);
                Finance.updateDashboard();
            });
        }

        Finance.updateDashboard();
        Finance.adjustCardTextColor();
    },

    // Detecta se a cor primária é clara e ajusta o texto do card para preto ou branco
    adjustCardTextColor: () => {
        const profile = Storage.get('profile') || { color: '#6200ea' };
        const hex = profile.color || '#6200ea';
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        // Luminosidade percebida
        const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
        const isLight = lum > 0.55;
        const card = document.querySelector('.main-balance');
        if(card) {
            card.querySelector('h3').style.color = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
            const total = card.querySelector('.total-value');
            if(total) total.style.color = isLight ? '#111' : 'white';
        }
    },

    updateDashboard: () => {
        const clients = Storage.get('clients') || [];
        let totalPago = 0;

        clients.forEach(c => {
            const val = parseFloat(c.value) || 0;
            const extras = (c.adicionais || []).reduce((s,a) => s + (parseFloat(a.valor)||0), 0);
            if (c.status === 'pago') totalPago += val + extras;
        });

        const settings = Storage.get('settings') || { splitPercentage: 50 };
        const mePercentage = parseFloat(settings.splitPercentage) / 100;
        const storePercentage = 1 - mePercentage;

        const meuLucro  = totalPago * mePercentage;
        const caixaLoja = totalPago * storePercentage;

        const fmt = (val) => `R$ ${val.toFixed(2).replace('.', ',')}`;

        const elTotal  = document.getElementById('finance-total');
        const elMyCut  = document.getElementById('my-cut');
        const elStore  = document.getElementById('store-cut');

        if(elTotal)  elTotal.textContent  = fmt(totalPago);
        if(elMyCut)  elMyCut.textContent  = fmt(meuLucro);
        if(elStore)  elStore.textContent  = fmt(caixaLoja);

        Finance.adjustCardTextColor();
    }
};
