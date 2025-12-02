<p align="center">
 <img src="public/assets/img/favicon.png" alt="Sudoku LAN" style="width:20%">
</p>

# 🧩 Sudoku LAN – Single and Multiplayer (2-Players)
A simple Sudoku game designed for **local LAN multiplayer**, where **two players connect from different devices** and play on the **same shared board in real time**.

---

Built with:
- **Node.js** (Express server)
- **WebSockets** (real-time sync)
- **HTML, CSS, JavaScript** (client UI)

---

## 📖 Introduction
Sudoku LAN is a web-based Sudoku game that supports:
- Single player
- Two players on the same shared board or tow same board
- Real-time updates
- Turn-based scoring
- Works on desktop + mobile
- LAN-friendly (play over local Wi-Fi)

Players connect using:
```text
shared.html?room=hia1p43&difficulty=easy&player=1
shared.html?room=hia1p43&difficulty=easy&player=2
```
Example: `http://192.168.1.50:3000/shared.html?room=hia1p43&difficulty=easy&player=2`

Refreshing the page keeps the same player number as long as `?player=1` is kept in the URL.

---

## 📦 Requirements
- Node.js (v16 or newer recommended)
- npm (comes with Node)
- LAN network (Wi-Fi/router)

---

## 🛠 Setup
Clone project: 
```bash
git clone https://github.com/kieukhang185/sudoku-lan.git && cd sudoku-lan

# Install npm dependencies and start
npm install && npm start
```

Server runs on **port 3000**.

---

## 🌐 Access Game
🕹 Player 1:
```
http://<HOST-IP>:3000/shared.html?room=hia1p43&difficulty=easy&player=2
```
🕹 Player 2:
```
http://<HOST-IP>:3000/shared.html?room=hia1p43&difficulty=easy&player=2
```

Find your HOST IP:
- Windows:
```bash
ipconfig

Wireless LAN adapter Wi-Fi 2:
...
 IPv4 Address. . . . . . . . . . . : 192.168.1.x
...
```
- Linux/macOS:
```bash
ip addr
...
inet 192.168.56.10/24
...
```

Directly on PC
```bash
# Home page
http://localhost:3000

http://<HOST-IP>:3000/shared.html?room=hia1p43&difficulty=easy&player=1
http://<HOST-IP>:3000/shared.html?room=hia1p43&difficulty=easy&player=2
```

---

## 🔥 Windows Firewall
Open port 3000 for LAN access.
To allow phones/tablets to connect:
- Open Windows Defender Firewall
- Go to Advanced settings
- Create New inbound rule
- Select Port
- TCP 3000
- Allow connection
- Name: Sudoku-3000

---

## 🎮 Gameplay Rules
- Correct move: +1 point, same player continues
- Wrong move: –1 point, turn switches
- Reset button restarts puzzle

---

## 🚀 Future Ideas
- Multi-room support
- Player names
- Spectator mode
- Game level
- Persistent scores

---

## ❤️ Credits
- Created by: Khang Kieu
- Powered by: Node.js, WebSockets, HTML/CSS/JS
- Feel free to modify, enhance, and share!
