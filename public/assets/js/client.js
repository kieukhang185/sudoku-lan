import { 
  buildBoardCommon,
  attachClickHighlightCommon,
  renderGridCommon,
  highlightSameNumberCommon 
} from './game.js';

let socket;
let myPlayerNumber = null;
let lastState = null;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const p1ScoreEl = document.getElementById("p1-score");
const p2ScoreEl = document.getElementById("p2-score");
const youAreEl = document.getElementById("you-are");
const player1Info = document.getElementById("player1-info");
const player2Info = document.getElementById("player2-info");

let boardInitialized = false;

// Read ?player=1 or ?player=2 from URL
function getDesiredPlayerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("player");
  if (p === "1" || p === "2") return parseInt(p, 10);
  return null;
}
const desiredPlayer = getDesiredPlayerFromUrl();

function connect() {
  const loc = window.location;
  const proto = loc.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${proto}://${loc.host}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
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
  buildBoardCommon(boardEl, handleInputWrapper);
  attachClickHighlightCommon(boardEl);
}

function updateUI(state) {
  if (!boardInitialized) {
    buildBoard();
    boardInitialized = true;
  }

  renderGridCommon(boardEl, state.grid);

  // scores
  p1ScoreEl.textContent = state.scores[1];
  p2ScoreEl.textContent = state.scores[2];

  // current player highlight
  player1Info.classList.toggle("active", state.currentPlayer === 1);
  player2Info.classList.toggle("active", state.currentPlayer === 2);

  statusEl.textContent = state.status;

  // if something is focused with a value, keep highlight in sync
  const active = boardEl.querySelector("input:focus");
  if (active && active.value) {
    highlightSameNumberCommon(boardEl, active.value);
  } else {
    highlightSameNumberCommon(boardEl, "");
  }
}

// wrapper to reuse old handleInput style
function handleInputWrapper(row, col, inputEl) {
  handleInput({ target: inputEl });
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

  // local highlight
  highlightSameNumberCommon(boardEl, value);
}

// Reset
document.getElementById("btn-reset").addEventListener("click", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "reset" }));
  }
  highlightSameNumberCommon(boardEl, "");
});

connect();
