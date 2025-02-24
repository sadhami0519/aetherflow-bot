// To-Do List Logic
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.initializeDOM();
        this.bindEvents();
        this.loadTodos();
    }
    
        async loadTodos() {
            try {
                const response = await fetch('/api/todos');
                const todos = await response.json();
                this.todos = todos;
                localStorage.setItem('todos', JSON.stringify(todos));
                this.renderTodos();
            } catch (error) {
                console.error('Using local storage:', error);
                this.todos = JSON.parse(localStorage.getItem('todos')) || [];
                this.renderTodos();
            }
        }
    
        async addTodo(text) {
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const newTodo = await response.json();
                this.todos.push(newTodo);
                localStorage.setItem('todos', JSON.stringify(this.todos));
                this.renderTodos();
            } catch (error) {
                console.error('Saving locally:', error);
                this.todos.push({ text, completed: false });
                localStorage.setItem('todos', JSON.stringify(this.todos));
                this.renderTodos();
            }
        }

    initializeDOM() {
        // Create Todo Modal
        const todoModal = document.createElement('div');
        todoModal.id = 'todo-modal';
        todoModal.className = 'settings-modal';
        todoModal.innerHTML = `
            <div class="settings-content">
                <h2 class="text-xl font-bold mb-4">To-Do List</h2>
                <div class="todo-input-container flex gap-2 mb-4">
                    <input 
                        type="text" 
                        id="todo-input" 
                        class="flex-1 p-2 border rounded"
                        placeholder="Add a new task..."
                    >
                    <button 
                        id="add-todo" 
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add
                    </button>
                </div>
                <ul id="todo-list" class="space-y-2 mb-4"></ul>
                <button 
                    id="close-todo" 
                    class="w-full bg-gray-200 py-2 rounded mt-4 hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(todoModal);

        this.todoList = document.getElementById('todo-list');
        this.todoInput = document.getElementById('todo-input');
        this.todoModal = todoModal;
    }

    bindEvents() {
        const todoButton = this.createTodoButton();
        const headerRight = document.querySelector('.header-right');
        headerRight.insertBefore(todoButton, document.getElementById('settings-button'));

        document.getElementById('close-todo').addEventListener('click', () => {
            this.todoModal.style.display = 'none';
        });

        todoButton.addEventListener('click', () => {
            this.todoModal.style.display = 'flex';
            this.loadTodos();
        });

        document.getElementById('add-todo').addEventListener('click', () => {
            this.addTodo();
        });

        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
    }

    createTodoButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clip-rule="evenodd" />
            </svg>
        `;
        button.className = 'p-2 hover:opacity-75 transition-opacity';
        return button;
    }

    loadTodos() {
        this.todoList.innerHTML = '';
        this.todos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between bg-gray-100 p-3 rounded';
        li.innerHTML = `
            <span class="${todo.completed ? 'line-through text-gray-500' : ''}">${todo.text}</span>
            <button class="delete-todo text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;

        li.querySelector('span').addEventListener('click', () => {
            todo.completed = !todo.completed;
            li.querySelector('span').classList.toggle('line-through');
            li.querySelector('span').classList.toggle('text-gray-500');
            this.saveTodos();
        });

        li.querySelector('.delete-todo').addEventListener('click', () => {
            this.todos = this.todos.filter(t => t !== todo);
            li.remove();
            this.saveTodos();
        });

        return li;
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const newTodo = { text, completed: false };
        this.todos.push(newTodo);
        this.todoList.appendChild(this.createTodoElement(newTodo));
        this.todoInput.value = '';
        this.saveTodos();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize Todo App when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});