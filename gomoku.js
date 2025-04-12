
const boardSize = 15;
const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
let currentPlayer = 1; // 1 for black, 2 for white
let gameOver = false;

// Initialize the board
function initBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(e) {
    if (gameOver) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (board[row][col] !== 0) return;

    board[row][col] = currentPlayer;
    renderMove(row, col);

    if (checkWin(row, col)) {
        setTimeout(() => {
            alert(currentPlayer === 1 ? '黑方获胜!' : '白方获胜!');
            gameOver = true;
        }, 10);
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    // AI move (white player)
    if (currentPlayer === 2 && !gameOver) {
        setTimeout(makeAIMove, 500);
    }
}

// Render the move on board
function renderMove(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const piece = document.createElement('div');
    piece.className = board[row][col] === 1 ? 'black' : 'white';
    cell.appendChild(piece);
}

// AI makes a move
function makeAIMove() {
    const bestMove = findBestMove();
    if (!bestMove) return;
    
    const [row, col] = bestMove;
    board[row][col] = 2;
    renderMove(row, col);

    if (checkWin(row, col)) {
        setTimeout(() => {
            alert('白方获胜!');
            gameOver = true;
        }, 10);
        return;
    }

    currentPlayer = 1;
}

// Find the best move for AI
function findBestMove() {
    // First check if AI can win in the next move
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                board[i][j] = 2;
                if (checkWin(i, j)) {
                    board[i][j] = 0;
                    return [i, j];
                }
                board[i][j] = 0;
            }
        }
    }

    // Check if player can win in the next move and block
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                board[i][j] = 1;
                if (checkWin(i, j)) {
                    board[i][j] = 0;
                    return [i, j];
                }
                board[i][j] = 0;
            }
        }
    }

    // Evaluate best position based on patterns
    const scores = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    let maxScore = -1;
    let bestMoves = [];

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                scores[i][j] = evaluatePosition(i, j);
                if (scores[i][j] > maxScore) {
                    maxScore = scores[i][j];
                    bestMoves = [[i, j]];
                } else if (scores[i][j] === maxScore) {
                    bestMoves.push([i, j]);
                }
            }
        }
    }

    // Randomly select among best moves
    return bestMoves.length > 0 
        ? bestMoves[Math.floor(Math.random() * bestMoves.length)] 
        : null;
}

// Evaluate position value
function evaluatePosition(row, col) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let score = 0;

    for (const [dx, dy] of directions) {
        // Evaluate for AI (2)
        score += evaluateLine(row, col, dx, dy, 2) * 10;
        // Evaluate for player (1)
        score += evaluateLine(row, col, dx, dy, 1) * 5;
    }

    // Center preference
    const center = boardSize / 2;
    score += (boardSize - Math.abs(row - center) - Math.abs(col - center)) / 2;

    return score;
}

// Evaluate a line pattern
function evaluateLine(row, col, dx, dy, player) {
    let score = 0;
    let empty = 0;
    let count = 0;
    let blocked = 0;

    // Check both directions
    for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        const r = row + i * dx;
        const c = col + i * dy;

        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (board[r][c] === player) {
                count++;
            } else if (board[r][c] === 0) {
                empty++;
            } else {
                blocked++;
            }
        } else {
            blocked++;
        }
    }

    // Score patterns
    if (count >= 4) score += 10000;
    else if (count === 3 && empty >= 1) score += 1000;
    else if (count === 2 && empty >= 2) score += 100;
    else if (count === 1 && empty >= 3) score += 10;

    return score;
}

// Check for win condition
function checkWin(row, col) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
        let count = 1;

        // Check in positive direction
        for (let i = 1; i <= 4; i++) {
            const r = row + i * dx;
            const c = col + i * dy;
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || board[r][c] !== currentPlayer) break;
            count++;
        }

        // Check in negative direction
        for (let i = 1; i <= 4; i++) {
            const r = row - i * dx;
            const c = col - i * dy;
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || board[r][c] !== currentPlayer) break;
            count++;
        }

        if (count >= 5) return true;
    }

    return false;
}

// Initialize the game
initBoard();
