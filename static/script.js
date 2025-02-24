document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const settingsModal = document.getElementById('settings-modal');
const settingsButton = document.getElementById('settings-button');
const closeSettingsButton = document.getElementById('close-settings');

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Settings Button Click
settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

// Close Settings Button
closeSettingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Dark Mode Toggle
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.removeItem('darkMode');
    }
});

// Landscape Mode Toggle
const landscapeModeToggle = document.getElementById('landscape-mode-toggle');

// Check for saved landscape mode preference
if (localStorage.getItem('landscapeMode') === 'enabled') {
   document.querySelector('.chat-container').classList.add('landscape-mode');
   landscapeModeToggle.checked = true;
}

// Landscape Mode Toggle
landscapeModeToggle.addEventListener('change', () => {
   const chatContainer = document.querySelector('.chat-container');
   if (landscapeModeToggle.checked) {
       chatContainer.classList.add('landscape-mode');
       localStorage.setItem('landscapeMode', 'enabled');
   } else {
       chatContainer.classList.remove('landscape-mode');
       localStorage.removeItem('landscapeMode');
   }
});

// Chat functionality
document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    
    if (!message) return;

    appendMessage(message, "user-message");
    userInput.value = "";

    // Show typing indicator
    const typingIndicator = document.getElementById("typing-indicator");
    typingIndicator.style.display = "block";

    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
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
    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("div");
    newMessage.classList.add("message", sender);
    newMessage.textContent = message;
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

    // To-Do List Setup
    const todoButton = document.getElementById('todo-button');
    const todoModal = document.getElementById('todo-modal');
    const closeTodoButton = document.getElementById('close-todo');
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');

    function loadTodos() {
        const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        todoList.innerHTML = '';
        savedTodos.forEach(todo => {
            addTodoItem(todo.text, todo.completed);
        });
    }

    function saveTodos() {
        const todos = Array.from(todoList.children).map(item => ({
            text: item.textContent,
            completed: item.classList.contains('completed')
        }));
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function addTodoItem(text, completed = false) {
        const todoItem = document.createElement('li');
        todoItem.textContent = text;
        if (completed) todoItem.classList.add('completed');

        todoItem.addEventListener('click', () => {
            todoItem.classList.toggle('completed');
            saveTodos();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-todo');
        deleteButton.addEventListener('click', () => {
            todoItem.remove();
            saveTodos();
        });

        todoItem.appendChild(deleteButton);
        todoList.appendChild(todoItem);
        saveTodos();
    }

    addTodoButton.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (text) {
            addTodoItem(text);
            todoInput.value = '';
        }
    });

    todoButton.addEventListener('click', () => {
        todoModal.style.display = 'flex';
        loadTodos();
    });

    closeTodoButton.addEventListener('click', () => {
        todoModal.style.display = 'none';
    });

    loadTodos();

});
