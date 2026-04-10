document.getElementById('btn-generate-report').addEventListener('click', () => {
    const clients = Storage.get('clients');
    const reportContent = document.getElementById('report-content');
    
    let totalVendidos = 0;
    
    let html = '<table border="1" style="width:100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">';
    html += '<tr><th>Data</th><th>Cliente</th><th>Kit</th><th>Valor</th><th>Status</th></tr>';
    
    clients.forEach(c => {
        html += `<tr>
            <td style="padding: 8px;">${c.date.split('-').reverse().join('/')}</td>
            <td style="padding: 8px;">${c.clientName}</td>
            <td style="padding: 8px;">${c.kitName} (${c.category})</td>
            <td style="padding: 8px;">R$ ${parseFloat(c.value).toFixed(2).replace('.',',')}</td>
            <td style="padding: 8px;">${c.status.toUpperCase()}</td>
        </tr>`;
        if(c.status === 'pago') totalVendidos += parseFloat(c.value);
        if(c.status === '50') totalVendidos += (parseFloat(c.value)/2);
    });
    html += '</table>';
    html += `<h2>Total Faturado (Pago/50%): R$ ${totalVendidos.toFixed(2).replace('.',',')}</h2>`;
    
    reportContent.innerHTML = html;

    const canvasDiv = document.getElementById('report-canvas');
    canvasDiv.style.left = '0px'; // Traz pra tela momentaneamente

    html2canvas(canvasDiv).then(canvas => {
        const link = document.createElement('a');
        link.download = `Relatorio_AgendaPlus_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        canvasDiv.style.left = '-9999px'; // Esconde novamente
    });
});
