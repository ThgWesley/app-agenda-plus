document.getElementById('btn-generate-report').addEventListener('click', () => {
    const clients = Storage.get('clients') || [];
    const profile = Storage.get('profile') || { name: 'Agenda Plus', color: '#6200ea' };
    const settings = Storage.get('settings') || { splitPercentage: 50 };

    const color = profile.color || '#6200ea';
    const mePercent = parseFloat(settings.splitPercentage) || 50;
    const storePercent = 100 - mePercent;

    let totalPago = 0;
    let totalPendente = 0;
    let total50 = 0;

    clients.forEach(c => {
        const val = parseFloat(c.value) || 0;
        if (c.status === 'pago') totalPago += val;
        else if (c.status === '50') total50 += val;
        else totalPendente += val;
    });

    const totalGeral = totalPago + total50 + totalPendente;
    const meuLucro = totalPago * (mePercent / 100);
    const caixaLoja = totalPago * (storePercent / 100);

    const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;
    const today = new Date().toLocaleDateString('pt-BR');

    // Agrupa clientes por status
    const pagos     = clients.filter(c => c.status === 'pago');
    const meio      = clients.filter(c => c.status === '50');
    const pendentes = clients.filter(c => c.status === 'pendente');

    const statusColor = { pago: '#2ed573', '50': '#ffa502', pendente: '#ff4757' };
    const statusLabel = { pago: 'Pago Total', '50': '50% Pago', pendente: 'Pendente' };

    const rowsHTML = (list) => list.sort((a,b) => new Date(a.date) - new Date(b.date)).map(c => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding:10px 8px; font-size:13px;">${c.date.split('-').reverse().join('/')}</td>
            <td style="padding:10px 8px; font-size:13px; font-weight:600;">${c.clientName}</td>
            <td style="padding:10px 8px; font-size:12px; color:#555;">${c.kitName || '—'}</td>
            <td style="padding:10px 8px; font-size:12px; color:#555;">${c.category || '—'}</td>
            <td style="padding:10px 8px; font-size:13px; font-weight:600; color:#2ed573;">${fmt(parseFloat(c.value)||0)}</td>
            <td style="padding:10px 8px;">
                <span style="background:${statusColor[c.status]}22; color:${statusColor[c.status]}; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600;">
                    ${statusLabel[c.status] || c.status}
                </span>
            </td>
            <td style="padding:10px 8px; font-size:12px; color:#555;">${c.method || '—'}</td>
        </tr>
    `).join('');

    const sectionHTML = (title, list, bgColor) => {
        if(list.length === 0) return '';
        return `
        <div style="margin-bottom:24px;">
            <div style="background:${bgColor}18; border-left:4px solid ${bgColor}; padding:10px 16px; border-radius:0 8px 8px 0; margin-bottom:8px;">
                <span style="font-weight:700; color:${bgColor}; font-size:14px;">${title}</span>
                <span style="font-size:12px; color:#888; margin-left:8px;">(${list.length} cliente${list.length>1?'s':''})</span>
            </div>
            <table style="width:100%; border-collapse:collapse; background:white; border-radius:8px; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                <thead>
                    <tr style="background:#f8f8f8;">
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">DATA</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">CLIENTE</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">TEMA</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">CATEGORIA</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">VALOR</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">STATUS</th>
                        <th style="padding:8px; font-size:11px; color:#888; font-weight:600; text-align:left;">PAGAMENTO</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML(list)}</tbody>
            </table>
        </div>`;
    };

    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = `
    <div style="font-family:'Segoe UI',Arial,sans-serif; background:#f5f5f5; padding:0;">

        <!-- Cabeçalho -->
        <div style="background:${color}; padding:30px 30px 20px; color:white; border-radius:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <div style="font-size:22px; font-weight:700; letter-spacing:-0.5px;">${profile.name}</div>
                    <div style="font-size:13px; opacity:0.8; margin-top:4px;">Relatório de Agendamentos</div>
                </div>
                <div style="text-align:right; font-size:12px; opacity:0.8;">
                    <div>Gerado em</div>
                    <div style="font-weight:600; font-size:14px;">${today}</div>
                </div>
            </div>
        </div>

        <!-- Cards de resumo -->
        <div style="display:flex; gap:12px; padding:20px 30px; background:#f5f5f5;">
            <div style="flex:1; background:white; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.07); text-align:center;">
                <div style="font-size:11px; color:#999; font-weight:600; margin-bottom:6px;">TOTAL GERAL</div>
                <div style="font-size:20px; font-weight:700; color:#333;">${fmt(totalGeral)}</div>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${clients.length} agendamento${clients.length!==1?'s':''}</div>
            </div>
            <div style="flex:1; background:white; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.07); text-align:center;">
                <div style="font-size:11px; color:#2ed573; font-weight:600; margin-bottom:6px;">RECEBIDO</div>
                <div style="font-size:20px; font-weight:700; color:#2ed573;">${fmt(totalPago)}</div>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${pagos.length} pago${pagos.length!==1?'s':''}</div>
            </div>
            <div style="flex:1; background:white; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.07); text-align:center;">
                <div style="font-size:11px; color:#ff4757; font-weight:600; margin-bottom:6px;">A RECEBER</div>
                <div style="font-size:20px; font-weight:700; color:#ff4757;">${fmt(totalPendente + total50)}</div>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${pendentes.length + meio.length} pendente${(pendentes.length+meio.length)!==1?'s':''}</div>
            </div>
        </div>

        <!-- Divisão de lucros -->
        <div style="margin:0 30px 20px; background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
            <div style="font-size:13px; font-weight:700; color:#333; margin-bottom:12px;">💰 Divisão de Lucros (sobre pagos)</div>
            <div style="display:flex; gap:10px;">
                <div style="flex:1; background:${color}12; border-radius:10px; padding:14px; text-align:center;">
                    <div style="font-size:11px; color:${color}; font-weight:600;">VOCÊ (${mePercent}%)</div>
                    <div style="font-size:18px; font-weight:700; color:${color}; margin-top:4px;">${fmt(meuLucro)}</div>
                </div>
                <div style="flex:1; background:#f0f0f0; border-radius:10px; padding:14px; text-align:center;">
                    <div style="font-size:11px; color:#888; font-weight:600;">LOJA (${storePercent}%)</div>
                    <div style="font-size:18px; font-weight:700; color:#555; margin-top:4px;">${fmt(caixaLoja)}</div>
                </div>
            </div>
        </div>

        <!-- Tabelas por status -->
        <div style="padding:0 30px 30px;">
            ${sectionHTML('✅ Pagos', pagos, '#2ed573')}
            ${sectionHTML('🟠 50% Pago', meio, '#ffa502')}
            ${sectionHTML('🔴 Pendentes', pendentes, '#ff4757')}
            ${clients.length === 0 ? '<p style="text-align:center; color:#aaa; padding:40px;">Nenhum agendamento cadastrado.</p>' : ''}
        </div>

    </div>`;

    const canvasDiv = document.getElementById('report-canvas');
    canvasDiv.style.left = '0px';
    canvasDiv.style.width = '420px';

    html2canvas(canvasDiv, { scale: 2, useCORS: true, backgroundColor: '#f5f5f5' }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Relatorio_${profile.name.replace(/\s/g,'_')}_${today.replace(/\//g,'-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        canvasDiv.style.left = '-9999px';
        canvasDiv.style.width = '';
    });
});
