const Calendar = {
    currentDate: new Date(),
    selectedDate: new Date(),

    init: () => {
        Calendar.render();
    },

    render: () => {
        const year = Calendar.currentDate.getFullYear();
        const month = Calendar.currentDate.getMonth();
        
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        document.getElementById('month-year').textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        const clients = Storage.getClients();
        
        // Espaços vazios do início do mês
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            grid.appendChild(emptyDiv);
        }

        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'cal-day';
            div.textContent = i;
            div.onclick = () => Calendar.selectDate(new Date(year, month, i));

            // Verifica se é hoje
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                div.classList.add('today');
            }

            // Verifica se está selecionado
            if (i === Calendar.selectedDate.getDate() && month === Calendar.selectedDate.getMonth() && year === Calendar.selectedDate.getFullYear()) {
                div.classList.add('selected');
            }

            // Verifica se tem evento neste dia
            const hasEvent = clients.some(c => c.rawDate === dateStr);
            if (hasEvent) {
                div.classList.add('has-event');
            }

            grid.appendChild(div);
        }

        Calendar.renderEventsForDate(Calendar.selectedDate);
    },

    selectDate: (date) => {
        Calendar.selectedDate = date;
        Calendar.render();
    },

    prevMonth: () => {
        Calendar.currentDate.setMonth(Calendar.currentDate.getMonth() - 1);
        Calendar.render();
    },

    nextMonth: () => {
        Calendar.currentDate.setMonth(Calendar.currentDate.getMonth() + 1);
        Calendar.render();
    },

    renderEventsForDate: (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;

        const clients = Storage.getClients().filter(c => c.rawDate === targetDate);
        const container = document.getElementById('daily-events');
        container.innerHTML = '';

        if (clients.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum evento marcado para hoje.</p>';
            return;
        }

        clients.forEach(client => {
            const div = document.createElement('div');
            div.className = 'event-card';
            
            const img = client.photoBase64 ? `<img src="${client.photoBase64}" class="event-img">` : `<div class="event-img" style="display:flex;align-items:center;justify-content:center;background:#eee"><i class="ph ph-party" style="font-size:24px;color:#aaa"></i></div>`;

            div.innerHTML = `
                ${img}
                <div class="event-info">
                    <h4>${client.clientName}</h4>
                    <p>${client.kitName} - ${client.mainCategory}</p>
                    <span class="badge ${client.status.toLowerCase()}">${client.status} - R$ ${client.price.toFixed(2)}</span>
                </div>
            `;
            container.appendChild(div);
        });
    }
};
