const Finance = {
    init: () => {
        const settings = Storage.getSettings();
        document.getElementById('split-slider').value = settings.splitPercentage;
        document.getElementById('my-percentage-label').textContent = `${settings.splitPercentage}%`;
        Finance.updateDashboard();
    },

    updateSplit: () => {
        const val = document.getElementById('split-slider').value;
        document.getElementById('my-percentage-label').textContent = `${val}%`;
        
        const settings = Storage.getSettings();
        settings.splitPercentage = val;
        Storage.saveSettings(settings);
        
        Finance.updateDashboard();
    },

    updateDashboard: () => {
        const clients = Storage.getClients();
        let totalFaturado = 0;
        let totalPendente = 0;

        clients.forEach(c => {
            if (c.status === 'Pago') {
                totalFaturado += c.price;
            } else {
                totalPendente += c.price;
            }
        });

        const settings = Storage.getSettings();
        const mePercentage = parseFloat(settings.splitPercentage) / 100;
        const storePercentage = 1 - mePercentage;

        const meuLucro = totalFaturado * mePercentage;
        const caixaLoja = totalFaturado * storePercentage;

        const formatCurrency = (val) => `R$ ${val.toFixed(2).replace('.', ',')}`;

        document.getElementById('dash-total').textContent = formatCurrency(totalFaturado);
        document.getElementById('dash-pending').textContent = formatCurrency(totalPendente);
        document.getElementById('dash-me').textContent = formatCurrency(meuLucro);
        document.getElementById('dash-store').textContent = formatCurrency(caixaLoja);
    }
};
