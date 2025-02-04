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