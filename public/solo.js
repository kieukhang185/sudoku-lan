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
  },
  {
    // Another puzzle
    grid: [
      [0,2,0, 6,0,8, 0,0,0],
      [5,8,0, 0,0,9, 7,0,0],
      [0,0,0, 0,4,0, 0,0,0],

      [3,7,0, 0,0,0, 5,0,0],
      [6,0,0, 0,0,0, 0,0,4],
      [0,0,8, 0,0,0, 0,1,3],

      [0,0,0, 0,2,0, 0,0,0],
      [0,0,9, 8,0,0, 0,3,6],
      [0,0,0, 3,0,6, 0,9,0]
    ],
    solution: [
      [1,2,3, 6,7,8, 9,4,5],
      [5,8,4, 2,1,9, 7,6,3],
      [9,6,7, 5,4,3, 1,2,8],

      [3,7,2, 4,6,1, 5,8,9],
      [6,9,1, 7,8,5, 3,0,4], // slightly imperfect example – you can fix/replace
      [4,5,8, 9,3,2, 6,1,7],

      [8,3,6, 1,2,4, 0,5,0],
      [2,1,9, 8,5,7, 4,3,6],
      [7,4,5, 3,9,6, 2,0,1]
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

      const input = document.createElement("input");
      input.setAttribute("maxlength", "1");
      input.dataset.row = r;
      input.dataset.col = c;

      const value = soloGrid[r][c];

      if (value !== 0) {
        input.value = value;
        input.disabled = true;
        cell.classList.add("given");
      }

      input.addEventListener("input", handleSoloInput);
      cell.appendChild(input);
      soloBoardEl.appendChild(cell);
    }
  }
}

function handleSoloInput(e) {
  const input = e.target;
  const r = parseInt(input.dataset.row, 10);
  const c = parseInt(input.dataset.col, 10);
  let val = input.value;

  // Only digits 1–9
  if (!/^[1-9]$/.test(val)) {
    input.value = "";
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
    input.disabled = true;
  });
}

// Button handlers
document.getElementById("btn-new").addEventListener("click", () => {
  soloScore = 0;
  updateSoloScore();
  chooseRandomSoloPuzzle();
  renderSoloBoard();
  soloStatusEl.textContent = "New puzzle started.";
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
      input.disabled = true;
      soloGrid[r][c] = soloSolutionGrid[r][c];
      input.classList.remove("invalid");
    }
  }
  soloStatusEl.textContent = "Solution shown.";
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
});

// Initialize solo mode
(function initSolo() {
  soloScore = 0;
  updateSoloScore();
  chooseRandomSoloPuzzle();
  renderSoloBoard();
  soloStatusEl.textContent = "Solo mode – fill the board!";
})();
