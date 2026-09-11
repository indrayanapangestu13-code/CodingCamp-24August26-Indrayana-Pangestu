/* =========================================================
   TO-DO LIST LIFE DASHBOARD
   Semua data disimpan di localStorage (client-side only),
   jadi tidak butuh server/backend sama sekali.
========================================================= */

/* ---------------------------------------------------------
   1) CLOCK, DATE & GREETING
--------------------------------------------------------- */
const clockEl = document.getElementById("clock");
const dateTextEl = document.getElementById("dateText");
const greetingEl = document.getElementById("greeting");
const editNameBtn = document.getElementById("editNameBtn");

function updateClock() {
  const now = new Date();

  // jam:menit:detik, dipaksa 2 digit pakai padStart
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  clockEl.textContent = `${h}:${m}:${s}`;

  // tanggal lengkap dalam Bahasa Indonesia
  dateTextEl.textContent = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  updateGreeting(now.getHours());
}

function updateGreeting(hour) {
  let base;
  if (hour < 10) base = "Selamat Pagi";
  else if (hour < 15) base = "Selamat Siang";
  else if (hour < 18) base = "Selamat Sore";
  else base = "Selamat Malam";

  // CHALLENGE: Custom name in greeting
  const savedName = localStorage.getItem("dashboard_name");
  greetingEl.textContent = savedName ? `${base}, ${savedName}!` : `${base}!`;
}

editNameBtn.addEventListener("click", () => {
  const current = localStorage.getItem("dashboard_name") || "";
  const name = prompt("Masukkan nama kamu:", current);
  if (name !== null) {
    localStorage.setItem("dashboard_name", name.trim());
    updateGreeting(new Date().getHours());
  }
});

updateClock();
setInterval(updateClock, 1000); // jam jalan tiap detik

/* ---------------------------------------------------------
   2) THEME TOGGLE (Light / Dark) - CHALLENGE
--------------------------------------------------------- */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("dashboard_theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("dashboard_theme", newTheme);
});

/* ---------------------------------------------------------
   3) FOCUS TIMER (Pomodoro) + CHALLENGE: ubah durasi
--------------------------------------------------------- */
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const timerMinutesInput = document.getElementById("timerMinutes");
const applyMinutesBtn = document.getElementById("applyMinutesBtn");

let totalSeconds = (parseInt(localStorage.getItem("dashboard_timer_minutes")) || 25) * 60;
let remainingSeconds = totalSeconds;
let timerInterval = null;

timerMinutesInput.value = totalSeconds / 60;

function renderTimer() {
  const m = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const s = String(remainingSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
  if (timerInterval) return; // sudah jalan, jangan dobel
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      renderTimer();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Waktu fokus selesai! 🎉");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  remainingSeconds = totalSeconds;
  renderTimer();
}

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);

applyMinutesBtn.addEventListener("click", () => {
  const minutes = parseInt(timerMinutesInput.value);
  if (!minutes || minutes < 1) return;

  totalSeconds = minutes * 60;
  localStorage.setItem("dashboard_timer_minutes", minutes);
  resetTimer();
});

renderTimer();

/* ---------------------------------------------------------
   4) TASKS (add, edit, done, delete, Local Storage)
--------------------------------------------------------- */
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// setiap task disimpan sebagai { id, text, done }
let tasks = JSON.parse(localStorage.getItem("dashboard_tasks")) || [];

function saveTasks() {
  localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    // checkbox untuk tandai selesai
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    // teks task, double-click untuk edit
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    span.title = "Klik dua kali untuk edit";
    span.addEventListener("dblclick", () => enterEditMode(li, task));

    // tombol hapus
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function enterEditMode(li, task) {
  li.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = task.text;

  function saveEdit() {
    const newText = input.value.trim();
    if (newText) task.text = newText;
    saveTasks();
    renderTasks();
  }

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });

  li.appendChild(input);
  input.focus();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
});

renderTasks();

/* ---------------------------------------------------------
   5) QUICK LINKS (add, open, delete, Local Storage)
--------------------------------------------------------- */
const linkForm = document.getElementById("linkForm");
const linkNameInput = document.getElementById("linkName");
const linkUrlInput = document.getElementById("linkUrl");
const linkList = document.getElementById("linkList");

let links = JSON.parse(localStorage.getItem("dashboard_links")) ||
  [
    { id: 1, name: "Google", url: "https://google.com" },
    { id: 2, name: "Gmail", url: "https://mail.google.com" },
  ];

function saveLinks() {
  localStorage.setItem("dashboard_links", JSON.stringify(links));
}

function renderLinks() {
  linkList.innerHTML = "";

  links.forEach((link) => {
    const pill = document.createElement("div");
    pill.className = "link-pill";

    const label = document.createElement("span");
    label.textContent = link.name;
    label.addEventListener("click", () => window.open(link.url, "_blank"));

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-link";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // biar klik hapus tidak ikut buka link
      links = links.filter((l) => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    pill.appendChild(label);
    pill.appendChild(removeBtn);
    linkList.appendChild(pill);
  });
}

linkForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();
  if (!name || !url) return;

  // kalau user lupa nulis https://, tambahin otomatis
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = "";
  linkUrlInput.value = "";
});

renderLinks();