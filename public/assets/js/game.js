// ---------- Board & Rendering ----------
export function buildBoardCommon(containerEl, onInputCallback) {
  containerEl.innerHTML = "";

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

      if (typeof onInputCallback === "function") {
        input.addEventListener("input", () => onInputCallback(r, c, input));
      }

      cell.appendChild(bg);
      cell.appendChild(input);
      containerEl.appendChild(cell);
    }
  }
}

// Render a 9x9 grid into an already-built board
// grid[r][c] === 0 -> empty, else given (readOnly)
export function renderGridCommon(containerEl, grid) {
  const cells = containerEl.querySelectorAll(".cell");
  cells.forEach((cell, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const input = cell.querySelector("input");
    const val = grid[r][c];

    if (val === 0) {
      input.value = "";
      input.readOnly = false;
      cell.classList.remove("given");
    } else {
      input.value = val;
      input.readOnly = true;          // important: NOT disabled
      cell.classList.add("given");
    }
  });
}

// Highlight all cells with same number inside this container
export function highlightSameNumberCommon(containerEl, value) {
  const bgs = containerEl.querySelectorAll(".cell-bg");
  bgs.forEach(bg => {
    bg.style.background = "";
  });

  if (!value || !/^[1-9]$/.test(value)) return;

  const cells = containerEl.querySelectorAll(".cell");
  cells.forEach(cell => {
    const input = cell.querySelector("input");
    const bg = cell.querySelector(".cell-bg");
    if (!input || !bg) return;

    if (input.value === value) {
      bg.style.background = cell.classList.contains("given")
        ? "#ffd86b"   // stronger for givens
        : "#ffeaa7";  // normal cells
    }
  });
}

// Attach click-to-highlight behavior to any board container
export function attachClickHighlightCommon(containerEl) {
  containerEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const input = cell.querySelector("input");
    const value = input ? input.value : "";

    highlightSameNumberCommon(containerEl, value);
  });
}


// ---------- Generator ----------
function emptyBoardCommon() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    board[r] = new Array(9).fill(0);
  }

  return board;
}

function copyBoardCommon(board) {
  return board.map(row => row.slice());
}

function shuffleArrayCommon(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function isSafeCommon(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  for (let y = 0; y < 9; y++) {
    if (board[y][col] === num) return false;
  }

  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) return false;
    }
  }

  return true;
}

function fillBoardCommon(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffleArrayCommon([1,2,3,4,5,6,7,8,9]);
        for (let num of nums) {
          if (isSafeCommon(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoardCommon(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function carveHolesCommon(solvedBoard, difficulty = "medium") {
  const grid = copyBoardCommon(solvedBoard);
  let holes;

  switch (difficulty) {
    case "easy":  holes = 35; break;
    case "hard":  holes = 55; break;
    case "medium":
    default:      holes = 45; break;
  }

  let attempts = holes;
  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (grid[row][col] !== 0) {
      grid[row][col] = 0;
      attempts--;
    }
  }
  return grid;
}

// Main generator: returns { grid, solution }
export function generateSudokuCommon(difficulty = "medium") {
  const board = emptyBoardCommon();
  fillBoardCommon(board);
  const solution = copyBoardCommon(board);
  const grid = carveHolesCommon(board, difficulty);
  return { grid, solution };
}
