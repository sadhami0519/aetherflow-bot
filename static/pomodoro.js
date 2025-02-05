// Pomodoro Timer Logic
class PomodoroTimer {
    constructor() {
        this.duration = {
            work: 25 * 60,  // 25 minutes
            break: 5 * 60   // 5 minutes
        };
        this.timeRemaining = this.duration.work;
        this.isRunning = false;
        this.isWorkSession = true;
        this.interval = null;

        this.initializeDOM();
        this.bindEvents();
    }

    initializeDOM() {
        // Create Pomodoro Modal
        const pomodoroModal = document.createElement('div');
        pomodoroModal.id = 'pomodoro-modal';
        pomodoroModal.className = 'settings-modal';
        pomodoroModal.innerHTML = `
            <div class="settings-content">
                <h2 class="text-xl font-bold mb-4">Pomodoro Timer</h2>
                <div class="timer-display text-center text-4xl font-bold mb-4">
                    25:00
                </div>
                <div class="flex justify-center space-x-4 mb-4">
                    <button id="play-pause-timer" class="bg-green-500 text-white px-4 py-2 rounded">
                        ▶️ Start
                    </button>
                    <button id="reset-timer" class="bg-red-500 text-white px-4 py-2 rounded">
                        🔄 Reset
                    </button>
                </div>
                <div id="session-type" class="text-center mt-2">
                    Work Session
                </div>
                <button id="close-pomodoro" class="w-full bg-gray-200 py-2 rounded mt-4 hover:bg-gray-300">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(pomodoroModal);

        this.timerDisplay = document.querySelector('.timer-display');
        this.sessionTypeDisplay = document.getElementById('session-type');
        this.playPauseBtn = document.getElementById('play-pause-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.pomodoroModal = pomodoroModal;
    }

    bindEvents() {
        const pomodoroButton = this.createPomodoroButton();

        // Ensure that the button is inserted after 'clock-button' to keep it in the correct position
        const headerRight = document.querySelector('.header-right');
        headerRight.insertBefore(
            pomodoroButton, 
            document.getElementById('settings-button')
        );

        document.getElementById('close-pomodoro').addEventListener('click', () => {
            this.pomodoroModal.style.display = 'none';
        });

        pomodoroButton.addEventListener('click', () => {
            console.log("Pomodoro button clicked");
            this.pomodoroModal.style.display = 'flex';
        });

        this.playPauseBtn.addEventListener('click', () => {
            console.log("Play/Pause clicked");
            this.toggleTimer();
        });

        this.resetBtn.addEventListener('click', () => {
            console.log("Reset clicked");
            this.resetTimer();
        });
    }

    createPomodoroButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
        `;
        button.className = 'p-2 hover:opacity-75 transition-opacity';
        return button;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    toggleTimer() {
        if (this.isRunning) {
            clearInterval(this.interval);
            this.isRunning = false;
            this.playPauseBtn.textContent = '▶️ Resume';
        } else {
            this.interval = setInterval(() => this.updateTimer(), 1000);
            this.isRunning = true;
            this.playPauseBtn.textContent = '⏸️ Pause';
        }
    }

    updateTimer() {
        this.timeRemaining--;

        if (this.timeRemaining < 0) {
            this.switchSession();
        }

        this.timerDisplay.textContent = this.formatTime(this.timeRemaining);
    }

    switchSession() {
        clearInterval(this.interval);
        this.isWorkSession = !this.isWorkSession;

        if (this.isWorkSession) {
            this.timeRemaining = this.duration.work;
            this.sessionTypeDisplay.textContent = 'Work Session';
        } else {
            this.timeRemaining = this.duration.break;
            this.sessionTypeDisplay.textContent = 'Break Session';
        }

        this.timerDisplay.textContent = this.formatTime(this.timeRemaining);
        this.isRunning = false;
        this.playPauseBtn.textContent = '▶️ Start';
    }

    resetTimer() {
        clearInterval(this.interval);
        this.isWorkSession = true;
        this.timeRemaining = this.duration.work;
        this.timerDisplay.textContent = this.formatTime(this.timeRemaining);
        this.sessionTypeDisplay.textContent = 'Work Session';
        this.isRunning = false;
        this.playPauseBtn.textContent = '▶️ Start';
    }
}

// Initialize Pomodoro Timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
