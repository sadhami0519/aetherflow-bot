document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings');
    const landscapeModeToggle = document.getElementById('landscape-mode-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const typingIndicator = document.getElementById("typing-indicator");
    const chatBox = document.getElementById("chat-box");
    const todoButton = document.getElementById('todo-button');
    const todoModal = document.getElementById('todo-modal');
    const closeTodoButton = document.getElementById('close-todo');
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');

    function initializeSettings() {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        if (localStorage.getItem('landscapeMode') === 'enabled') {
            chatContainer.classList.add('landscape-mode');
            landscapeModeToggle.checked = true;
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        localStorage.setItem('darkMode', darkModeToggle.checked ? 'enabled' : '');
    }

    function toggleLandscapeMode() {
        chatContainer.classList.toggle('landscape-mode', landscapeModeToggle.checked);
        localStorage.setItem('landscapeMode', landscapeModeToggle.checked ? 'enabled' : '');
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage(message, "user-message");
        userInput.value = "";

        // Show typing indicator
        typingIndicator.style.display = "block";

        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = "none";
            appendMessage(data.response, "bot-message");
        })
        .catch(error => {
            console.error("Error:", error);
            typingIndicator.style.display = "none";
            appendMessage("Oops, something went wrong. Please try again later.", "bot-message");
        });
    }

    function appendMessage(message, sender) {
        const newMessage = document.createElement("div");
        newMessage.classList.add("message", sender);
        newMessage.textContent = message;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function loadTodos() {
        todoList.innerHTML = '';
        const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        savedTodos.forEach(todo => addTodoItem(todo.text, todo.completed));
    }

    function saveTodos() {
        const todos = [...todoList.children].map(item => ({
            text: item.firstChild.textContent.trim(),
            completed: item.classList.contains('completed')
        }));
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function addTodoItem(text, completed = false) {
        if ([...todoList.children].some(item => item.firstChild.textContent.trim() === text)) return;

        const todoItem = document.createElement('li');
        todoItem.innerHTML = `<span>${text}</span> <button class="delete-todo">X</button>`;
        if (completed) todoItem.classList.add('completed');

        todoList.appendChild(todoItem);
        saveTodos();
    }

    function handleTodoClick(e) {
        if (e.target.classList.contains('delete-todo')) {
            e.target.parentElement.remove();
        } else {
            e.target.parentElement.classList.toggle('completed');
        }
        saveTodos();
    }

    // Event Listeners
    settingsButton.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeSettingsButton.addEventListener('click', () => settingsModal.style.display = 'none');
    darkModeToggle.addEventListener('change', toggleDarkMode);
    landscapeModeToggle.addEventListener('change', toggleLandscapeMode);
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
    todoButton.addEventListener('click', () => { todoModal.style.display = 'flex'; loadTodos(); });
    closeTodoButton.addEventListener('click', () => todoModal.style.display = 'none');
    addTodoButton.addEventListener('click', () => { if (todoInput.value.trim()) addTodoItem(todoInput.value.trim()); todoInput.value = ''; });
    todoList.addEventListener('click', handleTodoClick);

    initializeSettings();
    loadTodos();
});
