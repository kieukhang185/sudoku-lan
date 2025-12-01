// Generate random room id
function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Show a specific menu
function showMenu(id) {
  document.querySelectorAll(".menu").forEach(m => m.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// MAIN MENU BUTTONS
const soloBtn = document.getElementById("btn-solo");
const multiBtn = document.getElementById("btn-multi");
const multi2Btn = document.getElementById("btn-multi2");

if (soloBtn) {
  soloBtn.addEventListener("click", () => {
    showMenu("menu-solo");
  });
}

if (multiBtn) {
  multiBtn.addEventListener("click", () => {
    showMenu("menu-multi");
  });
}

if (multi2Btn) {
  multi2Btn.addEventListener("click", () => {
    showMenu("menu-multi");
  });
}

// BACK BUTTONS
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => showMenu("menu-main"));
});

// SOLO MODE LEVEL SELECTION
document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const level = btn.dataset.level;
    window.location.href = `solo.html?level=${level}`;
  });
});

// JOIN ROOM BUTTON
const joinRoomBtn = document.getElementById("btn-join-room");
if (joinRoomBtn) {
  joinRoomBtn.addEventListener("click", () => {
    const room = document.getElementById("join-room-id").value.trim();
    if (!room) {
      alert("Please enter a room ID.");
      return;
    }
    window.location.href = `shared.html?room=${encodeURIComponent(room)}&player=2`;
  });
}

// CREATE ROOM BUTTON
const createRoomBtn = document.getElementById("btn-create-room");
if (createRoomBtn) {
  createRoomBtn.addEventListener("click", () => {
    const roomId = generateRoomId();
    window.location.href = `shared.html?room=${roomId}&player=1`;
  });
}
