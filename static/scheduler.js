class Scheduler {
    constructor() {
        try {
            this.markedDates = JSON.parse(localStorage.getItem('markedDates')) || {};
        } catch {
            this.markedDates = {};
        }
        this.currentYear = 2025;
        this.currentMonth = 0;
        this.initializeDOM();
        this.bindEvents();
    }
    
        async loadSchedules() {
            try {
                const response = await fetch('/api/schedules');
                const schedules = await response.json();
                this.markedDates = schedules.reduce((acc, curr) => {
                    acc[curr.date] = curr.note;
                    return acc;
                }, {});
                localStorage.setItem('markedDates', JSON.stringify(this.markedDates));
                this.generateCalendar();
            } catch (error) {
                console.error('Using local storage:', error);
                this.markedDates = JSON.parse(localStorage.getItem('markedDates')) || {};
                this.generateCalendar();
            }
        }
    
        async saveSchedule(date, note) {
            try {
                await fetch('/api/schedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date, note })
                });
                localStorage.setItem('markedDates', JSON.stringify(this.markedDates));
            } catch (error) {
                console.error('Saving locally:', error);
                localStorage.setItem('markedDates', JSON.stringify(this.markedDates));
            }
        }
    

    initializeDOM() {
        const schedulerModal = document.createElement('div');
        schedulerModal.id = 'scheduler-modal';
        schedulerModal.className = 'settings-modal';
        schedulerModal.innerHTML = `
            <div class="settings-content">
                <h2 class="text-xl font-bold mb-4">Schedule Manager</h2>
                <div class="calendar-controls flex justify-between mb-4">
                    <button id="prev-month" class="px-3 py-1 bg-gray-200 rounded">←</button>
                    <span id="current-month" class="font-semibold"></span>
                    <button id="next-month" class="px-3 py-1 bg-gray-200 rounded">→</button>
                </div>
                <div id="calendar-grid" class="grid grid-cols-7 gap-1"></div>
                <button id="close-scheduler" class="w-full bg-gray-200 py-2 rounded mt-4 hover:bg-gray-300">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(schedulerModal);

        this.calendarGrid = document.getElementById('calendar-grid');
        this.currentMonthDisplay = document.getElementById('current-month');
        this.schedulerModal = schedulerModal;
        this.generateCalendar();
    }

    bindEvents() {
        const schedulerButton = this.createSchedulerButton();
        const headerRight = document.querySelector('.header-right');
        headerRight.insertBefore(schedulerButton, document.getElementById('settings-button'));

        document.getElementById('close-scheduler').addEventListener('click', () => {
            this.schedulerModal.style.display = 'none';
        });

        schedulerButton.addEventListener('click', () => {
            this.schedulerModal.style.display = 'flex';
            this.generateCalendar();
        });

        document.getElementById('prev-month').addEventListener('click', () => this.adjustMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.adjustMonth(1));

        this.calendarGrid.addEventListener('click', (e) => {
            const dateCell = e.target.closest('.calendar-day');
            if (dateCell) this.toggleDate(dateCell.dataset.date);
        });
    }

    adjustMonth(change) {
        this.currentMonth += change;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    createSchedulerButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
        `;
        button.className = 'p-2 hover:opacity-75 transition-opacity';
        return button;
    }

    generateCalendar() {
        this.calendarGrid.innerHTML = '';
        const date = new Date(this.currentYear, this.currentMonth, 1);
        this.currentMonthDisplay.textContent = 
            `${date.toLocaleString('default', { month: 'long' })} ${this.currentYear}`;

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'text-center font-semibold text-sm';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });

        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const startDay = new Date(this.currentYear, this.currentMonth, 1).getDay();

        for (let i = 0; i < startDay; i++) {
            this.calendarGrid.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            const dateString = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            dateCell.className = `calendar-day text-center p-1 rounded cursor-pointer relative 
                ${this.markedDates[dateString] ? 'marked-date' : 'hover:bg-gray-100'}`;
            dateCell.innerHTML = `
                <div class="date-number">${day}</div>
                ${this.markedDates[dateString] ? '<div class="note-indicator text-xs absolute top-0 right-0">📝</div>' : ''}
            `;
            dateCell.dataset.date = dateString;
            this.calendarGrid.appendChild(dateCell);
        }
    }

    toggleDate(dateString) {
        if (this.markedDates[dateString]) {
            delete this.markedDates[dateString];
        } else {
            this.showNotePopup(dateString);
        }
        localStorage.setItem('markedDates', JSON.stringify(this.markedDates));
        this.generateCalendar();
    }

    showNotePopup(dateString) {
        document.querySelectorAll('.note-popup').forEach(popup => popup.remove());

        const popup = document.createElement('div');
        popup.className = 'note-popup';
        popup.innerHTML = `
            <input type="text" placeholder="Why important?" class="note-input mb-2 p-1 w-full" autofocus>
            <div class="flex gap-2 justify-end">
                <button class="save-note px-2 py-1 bg-green-500 text-white rounded">Save</button>
                <button class="cancel-note px-2 py-1 bg-red-500 text-white rounded">Cancel</button>
            </div>
        `;

        const dateCell = [...this.calendarGrid.querySelectorAll('.calendar-day')]
            .find(cell => cell.dataset.date === dateString);

        const rect = dateCell.getBoundingClientRect();
        popup.style.position = 'absolute';
        popup.style.left = `${rect.left + window.scrollX + rect.width}px`;
        popup.style.top = `${rect.top + window.scrollY}px`;
        popup.style.zIndex = '1000';

        document.body.appendChild(popup);

        popup.querySelector('.save-note').addEventListener('click', () => {
            const note = popup.querySelector('.note-input').value;
            this.markedDates[dateString] = note || 'Important day';
            localStorage.setItem('markedDates', JSON.stringify(this.markedDates));
            this.generateCalendar();
            popup.remove();
        });

        popup.querySelector('.cancel-note').addEventListener('click', () => popup.remove());
    }
}

document.addEventListener('DOMContentLoaded', () => new Scheduler());