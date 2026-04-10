const Report = {
    downloadReport: () => {
        const clients = Storage.getClients();
        const settings = Storage.getSettings();
        const container = document.getElementById('report-container');
        
        if(clients.length === 0){
            alert("Nenhum cliente para gerar relatório.");
            return;
        }

        let totalVendido = 0;

        let tableRows = '';
        clients.forEach(c => {
            totalVendido += c.price;
            let extras = c.hasBalloons ? `Arco ${c.balloonSize} (${c.balloonColors})` : '-';
            tableRows += `
                <tr>
                    <td>${c.dateFormatted}</td>
                    <td>${c.clientName}</td>
                    <td>${c.kitName}</td>
                    <td>${c.mainCategory}</td>
                    <td>${extras}</td>
                    <td>${c.paymentMethod} - ${c.status}</td>
                    <td>R$ ${c.price.toFixed(2)}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="report-title">Relatório de Eventos e Clientes - ${settings.appName}</div>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Kit</th>
                        <th>Categoria</th>
                        <th>Balões</th>
                        <th>Pagamento</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div class="report-summary">
                <span>Total de Kits: ${clients.length}</span>
                <span>Faturamento Global Bruto: R$ ${totalVendido.toFixed(2)}</span>
            </div>
        `;

        // Utiliza html2canvas para gerar o PNG
        html2canvas(container, {
            scale: 2, // Maior qualidade
            backgroundColor: "#ffffff"
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `relatorio-${settings.appName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Limpa o container para não pesar a memória
            container.innerHTML = '';
        });
    }
};
