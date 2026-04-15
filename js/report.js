// --- SUBABAS FINANÇAS ---
function switchFinanceTab(tab) {
    const dashboard = document.getElementById('finance-dashboard');
    const report    = document.getElementById('finance-report');
    const btnDash   = document.getElementById('btn-sub-dashboard');
    const btnRep    = document.getElementById('btn-sub-report');

    if(tab === 'dashboard') {
        dashboard.style.display = 'block';
        report.style.display    = 'none';
        btnDash.classList.add('active');
        btnRep.classList.remove('active');
    } else {
        dashboard.style.display = 'none';
        report.style.display    = 'block';
        btnDash.classList.remove('active');
        btnRep.classList.add('active');
        renderReport();
    }
}

// --- CORES DO GRÁFICO ---
const CHART_COLORS = [
    '#6200ea','#00b4d8','#2ed573','#ffa502','#ff4757',
    '#ff6b81','#a29bfe','#fd79a8','#00cec9','#fdcb6e'
];

let chartInstance = null;

// --- RENDERIZAR RELATÓRIO ---
function renderReport() {
    const clients  = Storage.get('clients') || [];
    const settings = Storage.get('settings') || { splitPercentage: 50 };
    const mePercent    = parseFloat(settings.splitPercentage) || 50;
    const storePercent = 100 - mePercent;

    let totalPago = 0, totalPendente = 0, total50resto = 0;

    clients.forEach(c => {
        const val = (parseFloat(c.value) || 0) + (c.adicionais||[]).reduce((s,a)=>s+(parseFloat(a.valor)||0),0);
        if(c.status === 'pago')         totalPago     += val;
        else if(c.status === '50')      total50resto  += val / 2;
        else                            totalPendente += val;
    });

    const totalAReceber = totalPendente + total50resto;
    const totalGeral    = totalPago + totalAReceber;
    const meuLucro      = totalPago * (mePercent / 100);
    const caixaLoja     = totalPago * (storePercent / 100);

    const fmt = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

    // Cards de resumo
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('rep-total-pago',    fmt(totalPago));
    set('rep-a-receber',     fmt(totalAReceber));
    set('rep-total-geral',   fmt(totalGeral));
    set('rep-total-clientes', clients.length);
    set('rep-me-pct',        mePercent);
    set('rep-store-pct',     storePercent);
    set('rep-my-cut',        fmt(meuLucro));
    set('rep-store-cut',     fmt(caixaLoja));

    // --- GRÁFICO DE SERVIÇOS ---
    // Agrupa por categoria (extrai só a parte antes de " + Arco")
    const serviceCounts = {};
    clients.forEach(c => {
        let cat = (c.category || 'Sem categoria').split(' + Arco')[0].trim() || 'Sem categoria';
        serviceCounts[cat] = (serviceCounts[cat] || 0) + 1;
    });

    const labels = Object.keys(serviceCounts);
    const data   = Object.values(serviceCounts);
    const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    const canvas = document.getElementById('chart-services');
    if(canvas && labels.length > 0) {
        if(chartInstance) chartInstance.destroy();

        chartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.raw} venda${ctx.raw !== 1 ? 's' : ''}`
                        }
                    }
                }
            }
        });

        // Legenda manual
        const legend = document.getElementById('chart-legend');
        if(legend) {
            legend.innerHTML = labels.map((l, i) => `
                <div class="legend-item">
                    <div class="legend-dot" style="background:${colors[i]}"></div>
                    <span>${l} (${data[i]})</span>
                </div>`).join('');
        }
    } else if(canvas) {
        canvas.style.display = 'none';
        const legend = document.getElementById('chart-legend');
        if(legend) legend.innerHTML = '<p style="color:var(--text-sub);font-size:13px;">Nenhum agendamento ainda.</p>';
    }

    // --- LISTA DE CLIENTES ---
    const listEl = document.getElementById('report-clients-list');
    if(!listEl) return;

    if(clients.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;color:var(--text-sub);padding:20px 0;">Nenhum agendamento cadastrado.</p>';
        return;
    }

    const statusLabel = { pago: 'Pago Total', '50': '50% Pago', pendente: 'Pendente' };
    const statusColor = { pago: '#2ed573',    '50': '#ffa502',  pendente: '#ff4757' };

    // Ordena: pagos primeiro, depois 50%, depois pendentes; dentro de cada grupo por data
    const order = { pago: 0, '50': 1, pendente: 2 };
    const sorted = [...clients].sort((a, b) => {
        if(order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return new Date(a.date) - new Date(b.date);
    });

    listEl.innerHTML = sorted.map(c => {
        const val = parseFloat(c.value) || 0;
        const valorExibido = c.status === '50' ? val / 2 : val;
        const sufixo = c.status === '50' ? '<br><span style="font-size:10px;color:#aaa;">50% restante</span>' : '';
        return `
        <div class="report-client-row">
            <div class="rcr-left">
                <div class="rcr-name">${c.clientName}</div>
                <div class="rcr-sub">${c.kitName || '—'} · ${c.category || '—'}</div>
                <div class="rcr-sub">💳 ${c.method || 'N/A'}</div>
            </div>
            <div class="rcr-right">
                <div class="rcr-value">${fmt(valorExibido)}${sufixo}</div>
                <div class="rcr-date">${c.date.split('-').reverse().join('/')}</div>
                <span style="display:inline-block;margin-top:4px;background:${statusColor[c.status]}22;color:${statusColor[c.status]};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">
                    ${statusLabel[c.status] || c.status}
                </span>
            </div>
        </div>`;
    }).join('');
}

// --- GERAR HTML DO RELATÓRIO PARA EXPORTAÇÃO ---
function buildReportHTML() {
    const clients  = Storage.get('clients') || [];
    const profile  = Storage.get('profile') || { name: 'Agenda Plus', color: '#6200ea' };
    const settings = Storage.get('settings') || { splitPercentage: 50 };
    const color      = profile.color || '#6200ea';
    const mePercent  = parseFloat(settings.splitPercentage) || 50;
    const storePercent = 100 - mePercent;
    const today = new Date().toLocaleDateString('pt-BR');

    let totalPago = 0, totalPendente = 0, total50resto = 0;
    clients.forEach(c => {
        const val = (parseFloat(c.value) || 0) + (c.adicionais||[]).reduce((s,a)=>s+(parseFloat(a.valor)||0),0);
        if(c.status === 'pago') totalPago += val;
        else if(c.status === '50') total50resto += val / 2;
        else totalPendente += val;
    });
    const totalAReceber = totalPendente + total50resto;
    const totalGeral = totalPago + totalAReceber;
    const meuLucro = totalPago * (mePercent / 100);
    const caixaLoja = totalPago * (storePercent / 100);
    const fmt = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

    const statusLabel = { pago: 'Pago Total', '50': '50% Pago', pendente: 'Pendente' };
    const statusColor = { pago: '#2ed573', '50': '#ffa502', pendente: '#ff4757' };
    const order = { pago: 0, '50': 1, pendente: 2 };
    const sorted = [...clients].sort((a,b) => {
        if(order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return new Date(a.date) - new Date(b.date);
    });

    const rows = sorted.map(c => {
        const val = parseFloat(c.value) || 0;
        const valorExibido = c.status === '50' ? val / 2 : val;
        return `<tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:10px 8px;font-size:13px;">${c.date.split('-').reverse().join('/')}</td>
            <td style="padding:10px 8px;font-size:13px;font-weight:600;">${c.clientName}</td>
            <td style="padding:10px 8px;font-size:12px;color:#555;">${c.kitName || '—'}</td>
            <td style="padding:10px 8px;font-size:12px;color:#555;">${c.category || '—'}</td>
            <td style="padding:10px 8px;font-size:13px;font-weight:600;color:#2ed573;">${fmt(valorExibido)}${c.status==='50'?' <small style="color:#aaa;">(rest.)</small>':''}</td>
            <td style="padding:10px 8px;">
                <span style="background:${statusColor[c.status]}22;color:${statusColor[c.status]};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">
                    ${statusLabel[c.status]}
                </span>
            </td>
            <td style="padding:10px 8px;font-size:12px;color:#555;">${c.method || '—'}</td>
        </tr>`;
    }).join('');

    return `<div style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;padding:0;width:420px;">
        <div style="background:${color};padding:28px 28px 18px;color:white;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <div style="font-size:20px;font-weight:700;">${profile.name}</div>
                    <div style="font-size:12px;opacity:0.8;margin-top:3px;">Relatório de Agendamentos</div>
                </div>
                <div style="text-align:right;font-size:12px;opacity:0.8;">
                    <div>Gerado em</div><div style="font-weight:600;">${today}</div>
                </div>
            </div>
        </div>
        <div style="display:flex;gap:10px;padding:18px 28px;background:#f5f5f5;">
            <div style="flex:1;background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="font-size:10px;color:#2ed573;font-weight:600;margin-bottom:4px;">RECEBIDO</div>
                <div style="font-size:17px;font-weight:700;color:#2ed573;">${fmt(totalPago)}</div>
            </div>
            <div style="flex:1;background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="font-size:10px;color:#ff4757;font-weight:600;margin-bottom:4px;">A RECEBER</div>
                <div style="font-size:17px;font-weight:700;color:#ff4757;">${fmt(totalAReceber)}</div>
            </div>
            <div style="flex:1;background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="font-size:10px;color:#6200ea;font-weight:600;margin-bottom:4px;">TOTAL</div>
                <div style="font-size:17px;font-weight:700;color:#6200ea;">${fmt(totalGeral)}</div>
            </div>
        </div>
        <div style="margin:0 28px 18px;background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="font-size:12px;font-weight:700;color:#333;margin-bottom:10px;">💰 Divisão de Lucros (sobre pagos)</div>
            <div style="display:flex;gap:8px;">
                <div style="flex:1;background:${color}12;border-radius:8px;padding:12px;text-align:center;">
                    <div style="font-size:10px;color:${color};font-weight:600;">VOCÊ (${mePercent}%)</div>
                    <div style="font-size:16px;font-weight:700;color:${color};margin-top:3px;">${fmt(meuLucro)}</div>
                </div>
                <div style="flex:1;background:#f0f0f0;border-radius:8px;padding:12px;text-align:center;">
                    <div style="font-size:10px;color:#888;font-weight:600;">LOJA (${storePercent}%)</div>
                    <div style="font-size:16px;font-weight:700;color:#555;margin-top:3px;">${fmt(caixaLoja)}</div>
                </div>
            </div>
        </div>
        <div style="padding:0 28px 28px;">
            ${clients.length === 0 ? '<p style="text-align:center;color:#aaa;padding:30px;">Nenhum agendamento.</p>' : `
            <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                <thead><tr style="background:#f8f8f8;">
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">DATA</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">CLIENTE</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">TEMA</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">CATEGORIA</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">VALOR</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">STATUS</th>
                    <th style="padding:8px;font-size:10px;color:#888;font-weight:600;text-align:left;">PGTO</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>`}
        </div>
    </div>`;
}

// --- DOWNLOAD PNG ---
function downloadReportPNG() {
    const profile = Storage.get('profile') || { name: 'Agenda Plus' };
    const today   = new Date().toLocaleDateString('pt-BR').replace(/\//g,'-');
    const canvas  = document.getElementById('report-canvas');
    const content = document.getElementById('report-content');

    content.innerHTML = buildReportHTML();
    canvas.style.left = '-9999px';

    html2canvas(canvas, { scale: 2, useCORS: true, backgroundColor: '#f5f5f5' }).then(c => {
        const link = document.createElement('a');
        link.download = `Relatorio_${profile.name.replace(/\s/g,'_')}_${today}.png`;
        link.href = c.toDataURL('image/png');
        link.click();
    });
}

// --- COMPARTILHAR ---
async function shareReport() {
    const profile = Storage.get('profile') || { name: 'Agenda Plus' };
    const today   = new Date().toLocaleDateString('pt-BR').replace(/\//g,'-');
    const canvas  = document.getElementById('report-canvas');
    const content = document.getElementById('report-content');

    content.innerHTML = buildReportHTML();
    canvas.style.left = '-9999px';

    html2canvas(canvas, { scale: 2, useCORS: true, backgroundColor: '#f5f5f5' }).then(async c => {
        c.toBlob(async blob => {
            const file = new File([blob], `Relatorio_${profile.name}_${today}.png`, { type: 'image/png' });
            if(navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: `Relatório ${profile.name}`, text: 'Relatório de agendamentos' });
                } catch(e) {
                    if(e.name !== 'AbortError') downloadReportPNG();
                }
            } else {
                // Fallback: baixa o PNG
                downloadReportPNG();
            }
        }, 'image/png');
    });
}

// --- INICIALIZAÇÃO DOS BOTÕES ---
window.addEventListener('load', () => {
    const btnDownload = document.getElementById('btn-download-report');
    const btnShare    = document.getElementById('btn-share-report');
    if(btnDownload) btnDownload.addEventListener('click', downloadReportPNG);
    if(btnShare)    btnShare.addEventListener('click', shareReport);
});
