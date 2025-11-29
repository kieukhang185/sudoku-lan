let socket;
let myPlayerNumber = null;
let lastState = null; // keep last server state to help with highlighting

// Read ?player=1 or ?player=2 from URL
function getDesiredPlayerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("player");
  if (p === "1" || p === "2") return parseInt(p, 10);
  return null;
}
const desiredPlayer = getDesiredPlayerFromUrl();

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const p1ScoreEl = document.getElementById("p1-score");
const p2ScoreEl = document.getElementById("p2-score");
const youAreEl = document.getElementById("you-are");
const player1Info = document.getElementById("player1-info");
const player2Info = document.getElementById("player2-info");

let boardInitialized = false;

function connect() {
  const loc = window.location;
  const proto = loc.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${proto}://${loc.host}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WS Connected");

    // Tell server which player we want
    socket.send(JSON.stringify({
      type: "join",
      desiredPlayer: desiredPlayer
    }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "assign-player") {
      myPlayerNumber = data.player;
      youAreEl.textContent = "Player " + myPlayerNumber;
      return;
    }

    if (data.type === "full") {
      alert(data.message);
      return;
    }

    if (data.type === "state") {
      lastState = data.state;
      updateUI(data.state);
      return;
    }

    if (data.type === "error") {
      alert(data.message);
    }
  };

  socket.onclose = () => {
    console.log("Disconnected. Reconnecting...");
    setTimeout(connect, 2000);
  };
}

function buildBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;

      const bg = document.createElement("div");
      bg.classList.add("cell-bg");

      const input = document.createElement("input");
      input.setAttribute("maxlength", "1");
      input.dataset.row = r;
      input.dataset.col = c;

      input.addEventListener("input", handleInput);

      cell.appendChild(bg);
      cell.appendChild(input);
      boardEl.appendChild(cell);
    }
  }
}

// Highlight all cells with the same number as `value`
function highlightSharedSameNumber(value) {
  document.querySelectorAll(".cell-bg").forEach(bg => bg.style.background = "");

  if (!value || !/^[1-9]$/.test(value)) return;

  document.querySelectorAll("#board .cell").forEach(cell => {
    const input = cell.querySelector("input");
    const bg = cell.querySelector(".cell-bg");

    if (input.value === value) {
      bg.style.background = cell.classList.contains("given")
        ? "#ffd86b"
        : "#ffeaa7";
    }
  });
}

function updateUI(state) {
  if (!boardInitialized) {
    buildBoard();
    boardInitialized = true;
  }

  // Fill board
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const index = r * 9 + c;
      const cell = boardEl.children[index];
      const input = cell.querySelector("input");

      if (state.grid[r][c] === 0) {
        input.value = "";
        input.readOnly = false;
        cell.classList.remove("given");
      } else {
        input.value = state.grid[r][c];
        input.readOnly = true;          // given / locked
        cell.classList.add("given");
      }
    }
  }

  // Update scores
  p1ScoreEl.textContent = state.scores[1];
  p2ScoreEl.textContent = state.scores[2];

  // Current player highlight
  player1Info.classList.toggle("active", state.currentPlayer === 1);
  player2Info.classList.toggle("active", state.currentPlayer === 2);

  // Status display
  statusEl.textContent = state.status;

  // Re-apply highlight if something is focused
  const active = boardEl.querySelector("input:focus");
  if (active && active.value) {
    highlightSharedSameNumber(active.value);
  } else {
    highlightSharedSameNumber("");
  }
}

function handleInput(e) {
  const input = e.target;
  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  const value = input.value.trim();

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "move",
      row,
      col,
      value,
      player: myPlayerNumber
    }));
  }

  // Locally update highlight
  highlightSharedSameNumber(value);
}

// Board click: highlight same number for that cell (works on given + typed)
boardEl.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const input = cell.querySelector("input");
  const value = input.value;

  highlightSharedSameNumber(value);
});

// Reset button
document.getElementById("btn-reset").addEventListener("click", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "reset" }));
  }
  highlightSharedSameNumber("");
});

connect();
