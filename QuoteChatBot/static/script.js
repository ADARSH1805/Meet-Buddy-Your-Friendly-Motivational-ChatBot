const form = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const typingIndicator = document.getElementById("typing-indicator");
const themeToggle = document.getElementById("theme-toggle");
const micBtn = document.getElementById("mic-btn");
const dailyQuote = document.getElementById("daily-quote");

let dailyQuotes = [];

// Dark mode toggle
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}

// Time and greeting
function updateTimeAndGreeting() {
  const now = new Date();
  const hrs = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, '0');
  const secs = now.getSeconds().toString().padStart(2, '0');
  document.getElementById("current-time").innerText = `${hrs}:${mins}:${secs}`;

  let greet = "Hello 🌞";
  if (hrs < 12) greet = "Good morning 🌅";
  else if (hrs < 18) greet = "Good afternoon ☀️";
  else greet = "Good evening 🌙";

  document.getElementById("greeting-text").innerText = greet;
}
setInterval(updateTimeAndGreeting, 1000);

// Send chat message
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  sendUserMessage(userInput.value);
  userInput.value = "";
});

async function sendUserMessage(message) {
  if (message.trim() === "") return;
  appendMessage("user", message);
  typingIndicator.style.display = "block";

  const response = await fetch("/get-quote", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `message=${encodeURIComponent(message)}`
  });

  const data = await response.json();
  typingIndicator.style.display = "none";
  appendMessage("bot", data.response);
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  const icon = sender === "user" ? "🧑‍💻" : "🤖";
  msg.innerHTML = `
    <span class="icon">${icon}</span>
    <div class="bubble">
      ${text}
      ${sender === "bot" ? `<button class="copy-btn" onclick="copyText(this)">📋</button>` : ""}
    </div>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle mood and daily quote
function sendMood(text, isDaily = false) {
  fetch("/get-quote", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `message=${encodeURIComponent(text)}`
  })
    .then(res => res.json())
    .then(data => {
      if (isDaily) {
        dailyQuote.innerText = `"${data.response}"`;
        updateHistory(data.response);
      } else {
        sendUserMessage(text);
      }
    });
}

// Category dropdown
function fetchCategoryQuote() {
  const cat = document.getElementById("category").value;
  sendMood(`Give me a motivational quote about ${cat}`, true);
}

// Quote history
function updateHistory(quote) {
  dailyQuotes.unshift(quote);
  if (dailyQuotes.length > 5) dailyQuotes.pop();

  const historyList = document.getElementById("quote-history").querySelector("ul");
  historyList.innerHTML = "";
  dailyQuotes.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    historyList.appendChild(li);
  });
}

// Copy quote text
function copyText(button) {
  const text = button.parentElement.innerText.trim();
  navigator.clipboard.writeText(text);
  button.textContent = "✅";
  setTimeout(() => (button.textContent = "📋"), 1000);
}

// Voice input
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.textContent = "🎙️";
  });

  recognition.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
    recognition.stop();
    micBtn.textContent = "🎤";
  };

  recognition.onerror = () => {
    recognition.stop();
    micBtn.textContent = "🎤";
  };
} else {
  micBtn.style.display = "none";
}

// Load first quote on page load
window.onload = () => {
  sendMood("Give me one motivational quote", true);
};
