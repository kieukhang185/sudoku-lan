// ===== SOLO SUDOKU (PLAY ALONE) =====

// Simple sample puzzles (0 = empty)
const soloPuzzles = [
  {
    // Easy
    grid: [
      [5,3,0, 0,7,0, 0,0,0],
      [6,0,0, 1,9,5, 0,0,0],
      [0,9,8, 0,0,0, 0,6,0],

      [8,0,0, 0,6,0, 0,0,3],
      [4,0,0, 8,0,3, 0,0,1],
      [7,0,0, 0,2,0, 0,0,6],

      [0,6,0, 0,0,0, 2,8,0],
      [0,0,0, 4,1,9, 0,0,5],
      [0,0,0, 0,8,0, 0,7,9]
    ],
    solution: [
      [5,3,4, 6,7,8, 9,1,2],
      [6,7,2, 1,9,5, 3,4,8],
      [1,9,8, 3,4,2, 5,6,7],

      [8,5,9, 7,6,1, 4,2,3],
      [4,2,6, 8,5,3, 7,9,1],
      [7,1,3, 9,2,4, 8,5,6],

      [9,6,1, 5,3,7, 2,8,4],
      [2,8,7, 4,1,9, 6,3,5],
      [3,4,5, 2,8,6, 1,7,9]
    ]
  }
];

let soloCurrentPuzzleIndex = 0;
let soloGrid = [];
let soloSolutionGrid = [];
let soloScore = 0;

const soloBoardEl = document.getElementById("board");
const soloStatusEl = document.getElementById("status");
const soloScoreEl = document.getElementById("solo-score");

function deepCopyGrid(grid) {
  return JSON.parse(JSON.stringify(grid));
}

function chooseRandomSoloPuzzle() {
  soloCurrentPuzzleIndex = Math.floor(Math.random() * soloPuzzles.length);
  const p = soloPuzzles[soloCurrentPuzzleIndex];
  soloGrid = deepCopyGrid(p.grid);
  soloSolutionGrid = deepCopyGrid(p.solution);
}

function renderSoloBoard() {
  soloBoardEl.innerHTML = "";

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

      const value = soloGrid[r][c];

      if (value !== 0) {
        input.value = value;
        input.readOnly = true;
        cell.classList.add("given");
      }

      input.addEventListener("input", handleSoloInput);

      cell.appendChild(bg);
      cell.appendChild(input);
      soloBoardEl.appendChild(cell);
    }
  }
}

// Highlight all cells with the same number as `value`
function highlightSoloSameNumber(value) {
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

function handleSoloInput(e) {
  const input = e.target;
  const r = parseInt(input.dataset.row, 10);
  const c = parseInt(input.dataset.col, 10);
  let val = input.value;

  // Only allow digits 1–9
  if (!/^[1-9]$/.test(val)) {
    input.value = "";
    highlightSoloSameNumber(""); // clear
    return;
  }

  const correct = soloSolutionGrid[r][c].toString();

  if (val === correct) {
    soloGrid[r][c] = soloSolutionGrid[r][c];
    input.classList.remove("invalid");
    soloScore += 1;
    updateSoloScore();

    if (isSoloSolved()) {
      soloStatusEl.textContent = `You solved the puzzle! 🎉 Final score: ${soloScore}`;
      disableSoloInputs();
    } else {
      soloStatusEl.textContent = "Correct!";
    }
  } else {
    // Wrong move
    input.classList.add("invalid");
    soloScore -= 1;
    updateSoloScore();
    soloStatusEl.textContent = "Wrong number, try again.";
  }

  // Update highlight based on current value
  highlightSoloSameNumber(val);
}

function updateSoloScore() {
  soloScoreEl.textContent = soloScore;
}

function isSoloSolved() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (soloGrid[r][c] === 0) return false;
      if (soloGrid[r][c] !== soloSolutionGrid[r][c]) return false;
    }
  }
  return true;
}

function disableSoloInputs() {
  const inputs = soloBoardEl.querySelectorAll("input");
  inputs.forEach((input) => {
    input.readOnly = true;
  });
}

// Board click: highlight all same numbers (works for given + typed)
soloBoardEl.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const input = cell.querySelector("input");
  const value = input.value;

  highlightSoloSameNumber(value);
});

// Button handlers
document.getElementById("btn-new").addEventListener("click", () => {
  soloScore = 0;
  updateSoloScore();
  chooseRandomSoloPuzzle();
  renderSoloBoard();
  soloStatusEl.textContent = "New puzzle started.";
  highlightSoloSameNumber(""); // clear
});

document.getElementById("btn-check").addEventListener("click", () => {
  let allCorrect = true;
  const inputs = soloBoardEl.querySelectorAll("input");

  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    const val = input.value;

    input.classList.remove("invalid");

    if (val === "") {
      allCorrect = false;
      return;
    }

    if (parseInt(val, 10) !== soloSolutionGrid[r][c]) {
      allCorrect = false;
      input.classList.add("invalid");
    }
  });

  soloStatusEl.textContent = allCorrect
    ? "So far so good!"
    : "There are mistakes highlighted in red.";
});

document.getElementById("btn-show-solution").addEventListener("click", () => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const index = r * 9 + c;
      const cell = soloBoardEl.children[index];
      const input = cell.querySelector("input");
      input.value = soloSolutionGrid[r][c];
      input.readOnly = true;
      soloGrid[r][c] = soloSolutionGrid[r][c];
      input.classList.remove("invalid");
    }
  }
  soloStatusEl.textContent = "Solution shown.";
  highlightSoloSameNumber(""); // clear highlight
});

document.getElementById("btn-clear").addEventListener("click", () => {
  const inputs = soloBoardEl.querySelectorAll("input");
  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    if (soloPuzzles[soloCurrentPuzzleIndex].grid[r][c] === 0) {
      input.value = "";
      input.classList.remove("invalid");
      soloGrid[r][c] = 0;
    }
  });
  soloStatusEl.textContent = "Mistakes cleared.";
  highlightSoloSameNumber(""); // clear highlight
});

// Initialize solo mode
(function initSolo() {
  soloScore = 0;
  updateSoloScore();
  chooseRandomSoloPuzzle();
  renderSoloBoard();
  soloStatusEl.textContent = "Solo mode – fill the board!";
})();
