// ===== SUDOKU GENERATOR =====

// Create an empty 9x9 array
function emptyBoard() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    board[r] = new Array(9).fill(0);
  }
  return board;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isSafe(board, row, col, num) {
  // Row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Column
  for (let y = 0; y < 9; y++) {
    if (board[y][col] === num) return false;
  }

  // 3x3 box
  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) return false;
    }
  }

  return true;
}

// Backtracking solver that fills empty cells with a valid solution
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (let num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false; // no number works here, backtrack
      }
    }
  }
  return true; // all cells filled
}

// Deep copy 9x9 grid
function copyBoard(board) {
  return board.map(row => row.slice());
}

/**
 * Remove numbers from a solved board to create the puzzle.
 * difficulty: "easy" | "medium" | "hard"
 */
function carveHoles(solvedBoard, difficulty = "medium") {
  const grid = copyBoard(solvedBoard);

  // how many cells to clear
  let holes;
  switch (difficulty) {
    case "easy":
      holes = 35; // ~46 filled
      break;
    case "hard":
      holes = 55; // ~26 filled
      break;
    case "medium":
    default:
      holes = 45; // ~36 filled
      break;
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

/**
 * Generate a new Sudoku puzzle
 * returns: { grid, solution }
 */
export function generateSudoku(difficulty = "medium") {
  const board = emptyBoard();
  fillBoard(board);                   // full solved board
  const solution = copyBoard(board);  // keep the solution
  const grid = carveHoles(board, difficulty); // create puzzle

  return { grid, solution };
}
