import { 
  generateSudokuCommon,
  buildBoardCommon,
  attachClickHighlightCommon,
  renderGridCommon,
  highlightSameNumberCommon
} from './game.js';

let soloGrid = [];
let soloSolution = [];
let soloScore = 0;

const soloBoardEl = document.getElementById("board");
const soloStatusEl = document.getElementById("status");
const soloScoreEl = document.getElementById("solo-score");

// Start / restart solo game
function startSoloGame(difficulty = "medium") {
  const { grid, solution } = generateSudokuCommon(difficulty);
  soloGrid = grid;
  soloSolution = solution;
  soloScore = 0;
  soloScoreEl.textContent = soloScore;

  if (!soloBoardEl.dataset.built) {
    buildBoardCommon(soloBoardEl, handleSoloInputWrapper);
    attachClickHighlightCommon(soloBoardEl);
    soloBoardEl.dataset.built = "1";
  }

  renderGridCommon(soloBoardEl, soloGrid);
  soloStatusEl.textContent = "Solo mode – fill the board!";
}

// Wrapper so common builder can reuse existing logic style
function handleSoloInputWrapper(row, col, inputEl) {
  handleSoloInput({ target: inputEl });
}

function handleSoloInput(e) {
  const input = e.target;
  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  let val = input.value.trim();

  // Only allow digits 1–9
  if (!/^[1-9]$/.test(val)) {
    input.value = "";
    highlightSameNumberCommon(soloBoardEl, "");
    return;
  }

  const correct = soloSolution[row][col].toString();

  if (val === correct) {
    soloGrid[row][col] = soloSolution[row][col];
    input.classList.remove("invalid");
    soloScore += 1;
    soloScoreEl.textContent = soloScore;

    if (isSoloSolved()) {
      soloStatusEl.textContent = `You solved the puzzle! 🎉 Score: ${soloScore}`;
      disableSoloBoard();
    } else {
      soloStatusEl.textContent = "Correct!";
    }
  } else {
    // Wrong move
    input.classList.add("invalid");
    soloScore -= 1;
    soloScoreEl.textContent = soloScore;
    soloStatusEl.textContent = "Wrong number, try again.";
  }

  // Update highlight based on current value
  highlightSameNumberCommon(soloBoardEl, val);
}

function isSoloSolved() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (soloGrid[r][c] === 0) return false;
      if (soloGrid[r][c] !== soloSolution[r][c]) return false;
    }
  }
  return true;
}

function disableSoloBoard() {
  const inputs = soloBoardEl.querySelectorAll("input");
  inputs.forEach((input) => {
    input.readOnly = true;
  });
}

// Buttons
document.getElementById("btn-new").addEventListener("click", () => {
  startSoloGame("medium");
});

document.getElementById("btn-check").addEventListener("click", () => {
  let allCorrect = true;
  const inputs = soloBoardEl.querySelectorAll("input");

  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    const val = input.value.trim();

    input.classList.remove("invalid");

    if (val === "" || parseInt(val, 10) !== soloSolution[r][c]) {
      allCorrect = false;
      input.classList.add("invalid");
    }
  });

  soloStatusEl.textContent = allCorrect
    ? "Everything correct so far!"
    : "There are mistakes highlighted in red.";
});

document.getElementById("btn-show-solution").addEventListener("click", () => {
  renderGridCommon(soloBoardEl, soloSolution);
  disableSoloBoard();
  soloStatusEl.textContent = "Solution shown.";
  highlightSameNumberCommon(soloBoardEl, "");
});

document.getElementById("btn-clear").addEventListener("click", () => {
  const inputs = soloBoardEl.querySelectorAll("input");
  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);

    // Only clear cells that are not in the original puzzle (soloGrid is current, so check readOnly)
    if (!input.readOnly) {
      input.value = "";
      input.classList.remove("invalid");
      soloGrid[r][c] = 0;
    }
  });

  soloStatusEl.textContent = "Mistakes cleared.";
  highlightSameNumberCommon(soloBoardEl, "");
});

// Init on load
startSoloGame("medium");
