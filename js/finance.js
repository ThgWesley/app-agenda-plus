const Finance = {
    init: () => {
        // Carrega percentual salvo ou usa 50% como padrão
        const settings = Storage.get('settings') || { splitPercentage: 50 };
        const slider = document.getElementById('split-slider');
        const label = document.getElementById('my-percentage');
        if(slider) slider.value = settings.splitPercentage;
        if(label) label.textContent = settings.splitPercentage;

        // Atualiza o dashboard ao mover o slider
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
    },

    updateDashboard: () => {
        const clients = Storage.get('clients') || [];
        let totalPago = 0;
        let totalPendente = 0;

        clients.forEach(c => {
            const val = parseFloat(c.value) || 0;
            if (c.status === 'pago') {
                totalPago += val;
            } else {
                totalPendente += val;
            }
        });

        const settings = Storage.get('settings') || { splitPercentage: 50 };
        const mePercentage = parseFloat(settings.splitPercentage) / 100;
        const storePercentage = 1 - mePercentage;

        const meuLucro = totalPago * mePercentage;
        const caixaLoja = totalPago * storePercentage;

        const fmt = (val) => `R$ ${val.toFixed(2).replace('.', ',')}`;

        const elTotal   = document.getElementById('finance-total');
        const elMyCut   = document.getElementById('my-cut');
        const elStore   = document.getElementById('store-cut');

        if(elTotal)  elTotal.textContent  = fmt(totalPago);
        if(elMyCut)  elMyCut.textContent  = fmt(meuLucro);
        if(elStore)  elStore.textContent  = fmt(caixaLoja);
    }
};
