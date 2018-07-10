var solution = [];
var initialBoard = [];
var currentBoard = [];

var numSolutions = 0;

var selectedNumber = -1;
var selectedCell = -1;

$(document).ready(function() {
  newGame();

  $("#newGame").on("click", function() {
    newGame();
  });

  $("#hint").on("click", function() {
    getHint();
  });

  $("#check").on("click", function() {
    checkGame();
  });

  $("#solve").on("click", function() {
    solveGame();
  });

  $("#reset").on("click", function() {
    resetGame();
  });

  // Each click selects or deselects the cell
  $(".SudokuBoard").on("click", ".EmptyButton, .UserFilledButton", function() {
    $(this).toggleClass("CellSelected");

    // Cell selected
    if ($(this).hasClass("CellSelected")) {

      // If another cell is selected, deselect that ibe and select current one
      if (selectedCell != -1) {
        $("#cell" + selectedCell).removeClass("CellSelected");
      }
      selectCell(this.id);

      // If a number is already selected: display if 1 - 9, empty if 0
      if (selectedNumber > 0) {
        inputNumber(selectedCell);
      } else if (selectedNumber == 0) {
        removeNumber(selectedCell);
      }

    } else {
      deselectCell();
    }

  });

  // Each click selects or deselects a number
  $(".NumberButton").on("click", function() {
    $(this).toggleClass("NumberSelected");

    // Number selected
    if ($(this).hasClass("NumberSelected")) {

      // If another number is selected, deselect that one and select current one
      if (selectedNumber != -1) {
        $("#button" + selectedNumber).removeClass("NumberSelected");
      }
      selectNumber(this.id);

      // If a cell is already selected, display number (or empty if 0)
      if (selectedCell >= 0) {
        inputNumber(selectedCell);
      }

    } else {
      deselectNumber();
    }

  });

  // Click hides modal window and starts new game
  $("#modalNewGame").on("click", function() {
    $(".ModalWindow").css("display", "none");
    $(".container").css("opacity", "1");

    newGame();
  });

  // Click hides modal window 
  $("#modalNoNewGame").on("click", function() {
    $(".ModalWindow").css("display", "none");
    $(".container").css("opacity", "1");
  });

});

/************ GAME FEATURES *************/

/**
 * Generates new Sudoku game with one possible solution
 */
function newGame() {
  generateInitialBoard();
}

/**
 * Fills random empty cell with correct value
 */
function getHint() {
  var i = getRandomEmptyCell(currentBoard);

  if (i != -1) {
    selectedNumber = solution[i];
    inputNumber(i);
  }
}

/**
 * Highlights cells that are currently invalid in its row, column or 3 x 3 box
 */
function checkGame() {
  deselectNumber();
  deselectCell();

  $(".UserFilledButton").each(function() {
    var i = /\d+/g;
    var cellIndex = ($(this).attr("id")).match(i);
    cellIndex = parseInt(cellIndex, 10);

    var val = currentBoard[cellIndex];
    currentBoard[cellIndex] = 0;
    if (!valIsValid(val, cellIndex, currentBoard)) {
      $(this).addClass("CellIncorrect");
    }
    currentBoard[cellIndex] = val;
  });
}

/**
 * Displays solution on the board
 */
function solveGame() {
  currentBoard = solution.slice();
  updateBoard();
}

/**
 * Resets the game to the initial board 
 */
function resetGame() {
  currentBoard = initialBoard.slice();
  updateBoard();

  // Reset any selected numbers or cells
  deselectNumber();
  deselectCell();
}

/**
 * Generates modal window "New Game?" if board is solved
 */
function isBoardSolved() {
  var solved = true;
  for (var i = 0; i < 81 && solved; i++) {
    if (currentBoard[i] != solution[i]) {
      solved = false;
    }
  }

  if (solved) {
    $(".ModalWindow").css("display", "block");
    $(".container").css("opacity", "0.2");
  }
}




/**************** FUNCTIONS TO GENERATE INITIAL GAME ****************/

/**
 * Generates initial 9x9 Sudoku board with one possible solution
 */
function generateInitialBoard() {
  // Reset global variables
  numSolutions = 0;
  selectedNumber = -1;
  selectedCell = -1;

  // Generate solution
  generateFirstRow();
  for (var i = 9; i <= 81; i++) {
    solution[i] = 0;
  }
  generateSolution();

  // Generate initial game board from solution
  generateInitialGame();
  currentBoard = initialBoard.slice();
  updateBoard();
}

/**
 * Generate the first row of a Sudoku Solution
 */
function generateFirstRow() {
  var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleRow(array);
  for (var i = 0; i < 9; i++) {
    solution[i] = array[i];
  }
}

/**
 * Recursively generates a Sudoku solution given a filled first row
 */
function generateSolution() {

  // Get next empty cell (done if no more empty cells)
  var indexCell = getEmptyCell(solution);
  if (getEmptyCell(solution) == -1) {
    return true;
  }

  // Loop through each digit 
  for (var val = 1; val <= 9; val++) {

    // Find the first valid number given the partial solution
    if (valIsValid(val, indexCell, solution)) {
      solution[indexCell] = val;

      // Recursively determine if the number will give a valid solution
      if (generateSolution()) {
        return true;
      }

      // If number cannot give valid solution, empty the cell and find next valid number
      solution[indexCell] = 0;
    }
  }

  // No valid solution exists 
  return false;
}

/**
 * Return the index of an empty cell in the partial Sudoku solution
 */
function getEmptyCell() {
  for (var i = 0; i < 81; i++) {
    if (solution[i] == 0) {
      return i;
    }
  }
  return -1;
}

/**
 * Generate the initial game board given the generated solution
 * One possible solution only
 */
function generateInitialGame() {
  initialBoard = solution.slice();

  // Create list of random Sudoku board positions
  var positions = [];
  for (var i = 0; i < 81; i++) {
    positions[i] = i;
  }
  shuffleRow(positions);

  // Remove random numbers from the solution, as long as only 1 solution exists
  for (var i = 0; i < 81; i++) {
    initialBoard[positions[i]] = 0;

    // If multiple solutions exist after removing previous number, re-assign 
    // previous number to board, and remove another random number
    numSolutions = 0;
    if (!solutionIsUnique(0)) {
      initialBoard[positions[i]] = solution[positions[i]];
    }
  }

}

/**
 * Shuffle row using Durstenfeld shuffle algorithm
 */
function shuffleRow(row) {
  for (var i = row.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = row[i];
    row[i] = row[j];
    row[j] = temp;
  }
  return row;
}

/**
 * Recursively determines if only 1 possible solution to initial game board exists
 */
function solutionIsUnique(cellIndex) {

  if (cellIndex > 80) {
    numSolutions += 1;
    if (numSolutions == 1) {
      return true;
    } else {
      return false;
    }
  }

  // Check if current cell is empty
  if (initialBoard[cellIndex] == 0) {

    // Check if each digit from 1 - 9 is valid
    for (var val = 1; val <= 9; val++) {
      if (valIsValid(val, cellIndex, initialBoard)) {
        initialBoard[cellIndex] = val;

        if (!solutionIsUnique(cellIndex + 1)) {
          initialBoard[cellIndex] = 0;
          return false;
        }

        initialBoard[cellIndex] = 0;
      }
    }
  } else if (!solutionIsUnique(cellIndex + 1)) {
    return false;
  }

  return true;

}

/**
 * Draw the current game
 */
function updateBoard() {
  var html = "";
  for (var i = 1; i <= 81; i++) {
    html += generateCell(currentBoard[i - 1], i);
  }

  $(".SudokuBoard").html(html);
}

/**
 * Draw a Sudoku cell: where cells on the edge of 3x3 box have thicker border
 */
function generateCell(num, indexAdd1) {
  var rightBorder = false;
  var bottomBorder = false;

  if (num == 0) {
    elementClass = "EmptyButton";
  } else if (initialBoard[indexAdd1 - 1] != 0) {
    elementClass = "InitialFilledButton";
  } else {
    elementClass = "UserFilledButton"
  }

  var id = "cell" + (indexAdd1 - 1);
  // Generate html to draw a Sudoku cell
  var html = '<a href="javascript: void(0)" class="' + elementClass + '" id="cell' + (indexAdd1 - 1) + '" ';

  // 3rd and 6th columns: thick right border
  if (indexAdd1 % 3 == 0 && indexAdd1 % 9 !== 0) {
    html += 'style="border-right-width: 5px;';
    rightBorder = true;
  }

  // 3rd and 6th rows: thick bottom border
  if ((indexAdd1 > 18 && indexAdd1 < 28) || (indexAdd1 > 45 && indexAdd1 < 55)) {
    if (!rightBorder) {
      html += 'style="';
    }
    html += 'border-bottom-width: 5px;';
    bottomBorder = true;
  }

  html += '">' + num;
  html += '</a>';
  return html;
}




/************ FUNCTIONS TO INTERACT WITH CELL OR NUMBER *************/


/**
 * Update selected number on game board at given index
 */
function inputNumber(cellIndex) {
  currentBoard[cellIndex] = selectedNumber;
  updateCell(cellIndex, selectedNumber);
  deselectNumber();
  deselectCell();

  // If correcting an invalid cell highlighted after "check" feature,
  // there may be other highlighted cells
  // If the other highlighted cells are now valid, unhighlight them
  $(".CellIncorrect").each(function() {
    var number = /\d+/g;
    var cellIndex = ($(this).attr("id")).match(number);
    console.log(cellIndex);
    cellIndex = parseInt(cellIndex, 10);
    var val = currentBoard[cellIndex];

    currentBoard[cellIndex] = 0;
    if (valIsValid(val, cellIndex, currentBoard)) {
      $(".UserFilledButton.CellIncorrect").removeClass("CellIncorrect");
    }
    currentBoard[cellIndex] = val;
  });

  isBoardSolved();
}

/**
 * Update user's selected number, given the button clicked
 */
function selectNumber(buttonID) {
  var number = /\d+/g;
  selectedNumber = buttonID.match(number);
  selectedNumber = parseInt(selectedNumber, 10);
}

/**
 * Deselect the previously selected number
 */
function deselectNumber() {
  var id = "#button" + selectedNumber;
  $(id).removeClass("NumberSelected");
  selectedNumber = -1;
}

/**
 * Empty the cell at the given index
 */
function removeNumber(cellIndex) {
  selectedNumber = 0;
  inputNumber(cellIndex);
}

/**
 * Update user's selected cell, given the button clicked
 */
function selectCell(cellID) {
  var i = /\d+/g;
  selectedCell = cellID.match(i);
  selectedCell = parseInt(selectedCell, 10);
}

/**
 * Deselect previously selected cell
 */
function deselectCell() {
  var id = "#cell" + selectedCell;
  $(id).removeClass("CellSelected");
  selectedCell = -1;
}

/**
 * Draw a single cell (hint, user-selected input)
 * 
 */
function updateCell(index, num) {
  var cellID = "#cell" + index;
  $(cellID).text(num);

  if (num == 0) {
    $(cellID).removeClass("UserFilledButton CellIncorrect CellSelected");
    $(cellID).addClass("EmptyButton");
  } else {
    $(cellID).removeClass("EmptyButton CellIncorrect CellSelected");
    $(cellID).addClass("UserFilledButton");
  }
}

/**
 * Returns a random empty cell on the current board
 */
function getRandomEmptyCell(boardToSolve) {
  var positions = [];
  for (var i = 0; i < 81; i++) {
    positions[i] = i;
  }
  shuffleRow(positions);

  for (var i = 0; i < 81; i++) {
    if (boardToSolve[positions[i]] == 0) {
      return positions[i];
    }
  }
  return -1;
}




/********** FUNCTIONS TO CHECK VALIDITY OF VALUE ***********/

/**
 * Check if digit is valid at indexCell
 */
function valIsValid(val, indexCell, boardToSolve) {
  if (validInRow(val, indexCell, boardToSolve) && validInCol(val, indexCell, boardToSolve) && validInBox(val, indexCell, boardToSolve)) {
    return true;
  }
  return false;
}


/**
 * Check if digit is valid in its row
 */
function validInRow(val, indexCell, boardToSolve) {
  var rowStart = Math.floor(indexCell / 9) * 9;
  var rowEnd = Math.floor(indexCell / 9) * 9 + 8;

  for (var i = rowStart; i <= rowEnd; i++) {
    if (val == boardToSolve[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Check if digit is valid in its column
 */
function validInCol(val, indexCell, boardToSolve) {
  var colStart = indexCell % 9;
  var colEnd = colStart + 72;

  for (var i = colStart; i <= colEnd; i += 9) {
    if (val == boardToSolve[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Check if digit is valid in its 3 x 3 box
 */
function validInBox(val, indexCell, boardToSolve) {

  // Box starts on 1st, 4th, or 7th row 
  // Start of 1st, 4th, 7th rows have indices 0, 27, 54
  var cell_0_27_54 = Math.floor(indexCell / 27) * 27;

  // 3 columns of 3x3 boxes
  var boxColumnIndex = Math.floor((indexCell - cell_0_27_54) / 3) % 3;

  if (boxColumnIndex == 0) {
    row1Start = cell_0_27_54;

  } else if (boxColumnIndex == 1) {
    row1Start = cell_0_27_54 + 3;
  } else {
    row1Start = cell_0_27_54 + 6;
  }

  var row1End = row1Start + 2;
  var row2Start = row1Start + 9;
  var row2End = row1Start + 11;
  var row3Start = row1Start + 18;
  var row3End = row1Start + 20;

  for (var i = row1Start; i <= row1End; i++) {
    if (val == boardToSolve[i]) {
      return false;
    }
  }

  for (var j = row2Start; j <= row2End; j++) {
    if (val == boardToSolve[j]) {
      return false;
    }
  }

  for (var k = row3Start; k <= row3End; k++) {
    if (val == boardToSolve[k]) {
      return false;
    }
  }
  return true;
}
