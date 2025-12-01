import { generateSudokuCommon } from './game.js';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws'; 

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer( {server} );

app.use(express.static("public"));

const rooms = {};

function createRoom(roomId, difficulty) {

    const { grid, solution } = generateSudokuCommon(difficulty);
    const puzzle = {
        grid,
        solution
    };

    rooms[roomId] = {
        puzzle,
        state: {
            grid: JSON.parse(JSON.stringify(puzzle.grid)),
            scores: { 1: 0, 2: 0}, // Score both 2 player
            currentPlayer: 1,
            status: "Player 1's turn."
        },
        players: {
            1: null,
            2: null
        }
    };
}

function getOrCreateRoom(roomId, difficulty) {
  if (!rooms[roomId]) {
    createRoom(roomId, difficulty);
  }
  return rooms[roomId];
}

// Broadcast game state to all clients in a room
function broadcastRoomState(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    const msg = JSON.stringify({ type: "state", state: room.state });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(msg);
        }
    });
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.roomId = null;
    ws.playerNumber = null;

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
            const roomId = data.roomId;
            const desired = data.desiredPlayer;
            const room = getOrCreateRoom(roomId, data.difficulty);

            let assignedPlayer = null;
            if (desired === 1 || desired === 2) {
                // Client requested special player
                if (!room.players[desired]) {
                    room.players[desired] = ws;
                    assignedPlayer = desired;
                } else {
                    ws.send(JSON.stringify({
                        type: "full",
                        message: `Player ${desired} is already taken!`
                    }));
                    return
                }
            } else {
                // Auto assing in case the url not content ?player=1 or ?player=2
                if (!room.players[1]) {
                    room.players[1] = ws;
                    assignedPlayer = 1;
                } else if (!room.players[2]) {
                    room.players[2] = ws;
                    assignedPlayer = 2;
                } else {
                    ws.send(JSON.stringify({ type: "full", message: "Game is full" }));
                    return;
                }
            }

            ws.roomId = roomId;
            ws.playerNumber = assignedPlayer;

            // Send player info to client
            ws.send(JSON.stringify({
                type: "assign-player",
                player: assignedPlayer,
                roomId: roomId
            }));

            // Send game state to client
            ws.send(JSON.stringify({ type: "state", state: room.state }));
            return;
        }

        // Move from client
        if (data.type === "move") {
            const roomId = ws.roomId;
            const room = rooms[roomId];
            if (!room) return; // Invalid room

            const { puzzle, state, players } = room;
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
                broadcastRoomState(roomId);
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

            broadcastRoomState(roomId);
            return;
        }

        // Reset game
        if (data.type === "reset") {
            const roomId = ws.roomId;
            const room = rooms[roomId];
            if (!room) return; // Invalid room
            createRoom(roomId);
            broadcastRoomState(roomId);
            return;
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        const roomId = ws.roomId;
        const playerNumber = ws.playerNumber;
        if (roomId && rooms[roomId]) {
            const room = rooms[roomId];
            if (room.players[playerNumber] === ws) {
                room.players[playerNumber] = null;
            }
            if (!room.players[1] && !room.players[2]) {
                delete rooms[roomId];
                console.log(`Room ${roomId} deleted due to inactivity.`);
            }
        }
    });
});

// Start server
const PORT = 3000; // http://localhost:3000
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
});
