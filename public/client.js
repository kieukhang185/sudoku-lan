let socket; 
let playerNumber = null;
let boardInitialized = false;


// Get player number from url: ?player=1 or ?player=2
function getDesiredPlayerFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const player = params.get("player");
    if (player === "1" || player === "2") return parseInt(player, 10);
    return null
}

const desiredPlayer = getDesiredPlayerFromUrl();

// Get value element from html
const boardEl = document.getElementById("board");
const statusEL = document.getElementById("status");
const p1ScoreEl =  document.getElementById("p1-score");
const p2ScoreEl =  document.getElementById("p2-score");
const youAreEl = document.getElementById("you-are");
const player1Info = document.getElementById("player1-info");
const player2Info = document.getElementById("player2-info");


function connect(){
    const location = window.location; // get current url
    const protoc = location.protocol == "https:" ? "wss" : "ws";
    const wsUrl = `${protoc}://${location.host}`;

    // Create new connect and open
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
        console.log("WS Connected");

        // Tell sever which player join
        socket.send(JSON.stringify({
            type: "join",
            desiredPlayer: desiredPlayer
        }));
    }

    socket.onmessage = (even) => {
        const data = JSON.parse(even.data);

        // Set player on GUI
        if (data.type == "assign-player") {
            playerNumber = data.player;
            youAreEl.textContent = "Player " + playerNumber;
            return;
        }

        if (data.type == "full") {
            alert(data.message);
            return;
        }

        if (data.type === "state") {
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

// Build board once
function buildBoard(){
    boardEl.innerHTML = "";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
             const cell = document.createElement("div");
            cell.classList.add("cell");

            const input = document.createElement("input");
            input.setAttribute("maxlength", "1");
            input.dataset.row = r;
            input.dataset.col = c;

            input.addEventListener("input", handleInput);

            cell.appendChild(input);
            boardEl.appendChild(cell);
        }
    }
}

// Update the UI base on server state
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
                input.disabled = false;
            } else {
                input.value = state.grid[r][c];
                input.disabled = true;
            }
        }
    }

    // Update player scores
    p1ScoreEl.textContent = state.scores[1];
    p2ScoreEl.textContent = state.scores[2];

    // Set current player highlight
    player1Info.classList.toggle("active", state.currentPlayer === 1);
    player1Info.classList.toggle("active", state.currentPlayer === 2);

    // Status display
    statusEL.textContent = state.status;
}

// Handle input
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
            player: playerNumber
        }));
    }
}

// Reset button
document.getElementById("btn-reset").addEventListener("click", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "reset" }));
  }
});

connect();