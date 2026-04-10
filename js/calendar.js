let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const title = document.getElementById('month-year');
    grid.innerHTML = '';
    
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    title.innerText = `${months[currentMonth]} ${currentYear}`;

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const clients = Storage.get('clients');
    // Cria um Set apenas com as datas que possuem eventos para busca rápida
    const eventsSet = new Set(clients.map(c => c.date));

    // Dias vazios do início (Neumorphism style precisa de divs vazias)
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('cal-day', 'empty');
        grid.appendChild(emptyDiv);
    }

    // Preenche os dias
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('cal-day');
        dayDiv.innerText = i;
        
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Tem evento?
        if (eventsSet.has(dateStr)) {
            dayDiv.classList.add('has-event');
        }

        // É hoje?
        if (dateStr === todayStr) {
            dayDiv.classList.add('today');
        }

        dayDiv.onclick = () => {
            // Remove ativo anterior
            const currentActive = grid.querySelector('.cal-day.active');
            if(currentActive) currentActive.classList.remove('active');
            
            // Adiciona ativo novo
            dayDiv.classList.add('active');
            loadDailyEvents(dateStr);
            
            // Preenche automaticamente a data no formulário do modal para facilitar
            document.getElementById('event-date').value = dateStr;
        };

        grid.appendChild(dayDiv);
    }
}

document.getElementById('prev-month').onclick = () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); };
document.getElementById('next-month').onclick = () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); };

function loadDailyEvents(dateStr) {
    const list = document.getElementById('events-list');
    const clients = Storage.get('clients').filter(c => c.date === dateStr);
    
    if (clients.length === 0) {
        list.innerHTML = `<div class="empty-state">Nenhum evento agendado para ${dateStr.split('-').reverse().join('/')}.</div>`;
        return;
    }
    
    // Renderiza usando o mesmo estilo visual dos cards menores
    list.innerHTML = clients.map(c => `
        <div class="client-card" style="margin-top:10px; padding: 12px; box-shadow: none; border: 1px solid var(--border);">
            <div class="client-photo" style="width:40px; height:40px; font-size:18px;">
                ${c.photo ? `<img src="${c.photo}">` : '🎈'}
            </div>
            <div class="client-info">
                <h3 style="font-size:14px;">${c.clientName}</h3>
                <p style="font-size:11px; color: var(--primary); font-weight:500;">${c.kitName} (${c.category})</p>
                <p class="price-tag" style="font-size:12px; margin:0;">R$ ${c.value.toFixed(2).replace('.',',')}</p>
            </div>
            <div class="status-indicator status-${c.status}" style="position:static; width:10px; height:10px;"></div>
        </div>
    `).join('');
}
