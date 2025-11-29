import { generateSudokuCommon } from './game.js';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws'; 

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer( {server} );

app.use(express.static("public"));

// SIMPLE PUZZLE
const { grid, solution } = generateSudokuCommon("medium");

const puzzle = {
  grid,
  solution
};

// Track player sockets
let players = {
  1: null,
  2: null
};

// Share game state
let state = {
    grid: JSON.parse(JSON.stringify(puzzle.grid)),
    scores: { 1: 0, 2: 0}, // Score both 2 player
    currentPlayer: 1,
    status: "Player 1's turn."
}

// Game reset
function resetState(){

    const { grid, solution } = generateSudoku("medium");
    puzzle.grid = grid;
    puzzle.solution = solution;

    state.grid = JSON.parse(JSON.stringify(puzzle.grid));
    state.scores = { 1: 0, 2: 0},
    state.currentPlayer =  1,
    state.status = "Player 1's turn."
}

function boardcastState(){
    const msg = JSON.stringify({ type: "state", state });
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN) client.send(msg)
    });
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected");
    let assignedPlayer = null;

    ws.on("message", (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (e) {
            console.error("Bad message", e);
            return;
        }

        // Player joining
        if (data.type === "join") {
            const desired = data.desiredPlayer;

            if (desired === 1 || desired === 2) {
                // Client requested special player
                if (!players[desired]) {
                    players[desired] = ws;
                    assignedPlayer = desired
                } else {
                    ws.send(JSON.stringify({
                        type: "full",
                        message: `Player ${desired} is already taken!`
                    }));
                    return
                }
            } else {
                // Auto assing in case the url not content ?player=1 or ?player=2
                if (!players[1]) {
                    players[1] = ws;
                    assignedPlayer = 1;
                } else if (!players[2]) {
                    players[2] = ws;
                    assignedPlayer = 2;
                } else {
                    ws.send(JSON.stringify({ type: "full", message: "Game is full" }));
                    return;
                }
            }

            // Send player info to client
            ws.send(JSON.stringify({
                type: "assign-player",
                player: assignedPlayer
            }));

            // Send game state to client
            ws.send(JSON.stringify({ type: "state", state }));
            return;
        }

        // Move from client
        if (data.type === "move") {
            const { row, col, value, player } = data;

            // Prevent wrong player making move (not player turn)
            if (player === data.currentPlayer) {
                ws.send(JSON.stringify({ type: "error", message: "Not your turn!" }));
                return;
            }

            // Not allowed to change give calls
            if (puzzle.grid[row][col] !== 0) return

            // Clear cell
            if (value === "") {
                state.grid[row][col] = 0;
                state.status = `Player ${player} cleared a cell.`;
                boardcastState();
                return;
            }

            // Allow only numbers 1-9
            if (!/^[1-9]$/.test(value)) return;

            const correct = puzzle.solution[row][col].toString();

            if (value === correct) {
                // Correct value
                state.grid[row][col] = puzzle.solution[row][col];
                state.scores[player] += 1;
                state.status = `Player ${player} correct! Goes again.`;
            } else {
                // Wrong value
                state.scores[player] -= 1;
                state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
                state.status = `Player ${player} wrong! ${state.currentPlayer}'s turn.`;
            }

            boardcastState();
            return;
        }

        // Reset game
        if (date === "reset") {
            resetState();
            boardcastState();
            return;
        }
    });

    ws.on("close", () => {
        if (players[1] == ws) players[1] = null;
        if (players[2] == ws) players[2] = null;
        console.log("Client disconnected");
    });
});

// Start server
const PORT = 3000; // http://localhost:3000
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
