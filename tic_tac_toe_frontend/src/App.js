import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Tic Tac Toe
 * - Blue (#2563EB) primary, Amber (#F59E0B) secondary accents
 * - Clean, centered layout with header, board, control panel, and status
 * - Responsive for desktop and mobile
 */

// Types and helpers
const PRIMARY = '#2563EB';
const AMBER = '#F59E0B';
const ERROR = '#EF4444';

// Minimax AI for Tic Tac Toe
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (const [a,b,c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a,b,c] };
    }
  }
  if (squares.every(s => s)) {
    return { winner: null, line: null, draw: true };
  }
  return null;
}

function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) moves.push(i);
  }
  return moves;
}

function minimax(board, isMaximizing, aiPlayer, humanPlayer) {
  const result = calculateWinner(board);
  if (result) {
    if (result.winner === aiPlayer) return { score: 10 };
    if (result.winner === humanPlayer) return { score: -10 };
    if (result.draw) return { score: 0 };
  }

  const moves = availableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (const move of moves) {
      board[move] = aiPlayer;
      const { score } = minimax(board, false, aiPlayer, humanPlayer);
      board[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = null;
    for (const move of moves) {
      board[move] = humanPlayer;
      const { score } = minimax(board, true, aiPlayer, humanPlayer);
      board[move] = null;
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Main app component: manages theme, game state, and layout.
   * Includes header, control panel, game board, and status section.
   */
  const [theme, setTheme] = useState('light'); // light | dark
  const [mode, setMode] = useState('pvp'); // pvp | ai
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [aiPlaysAs, setAiPlaysAs] = useState('O'); // 'X' or 'O'
  const [isThinking, setIsThinking] = useState(false);

  const current = xIsNext ? 'X' : 'O';
  const result = useMemo(() => calculateWinner(board), [board]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // AI Move effect
  useEffect(() => {
    if (mode !== 'ai') return;
    if (result) return;
    const aiTurn = (aiPlaysAs === 'X' && xIsNext) || (aiPlaysAs === 'O' && !xIsNext);
    if (!aiTurn) return;
    setIsThinking(true);
    const timer = setTimeout(() => {
      const { move } = minimax([...board], true, aiPlaysAs, aiPlaysAs === 'X' ? 'O' : 'X');
      if (move !== null && move !== undefined) {
        const next = [...board];
        next[move] = aiPlaysAs;
        setBoard(next);
        setXIsNext(prev => !prev);
      }
      setIsThinking(false);
    }, 450); // short delay for UX
    return () => clearTimeout(timer);
  }, [mode, aiPlaysAs, xIsNext, board, result]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  function handleSquareClick(i) {
    if (result || board[i]) return;
    if (mode === 'ai') {
      const human = aiPlaysAs === 'X' ? 'O' : 'X';
      const isHumanTurn = (human === 'X' && xIsNext) || (human === 'O' && !xIsNext);
      if (!isHumanTurn) return;
      const next = [...board];
      next[i] = human;
      setBoard(next);
      setXIsNext(prev => !prev);
      return;
    }
    const next = [...board];
    next[i] = current;
    setBoard(next);
    setXIsNext(prev => !prev);
  }

  function newGame() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setIsThinking(false);
  }

  function onModeChange(newMode) {
    setMode(newMode);
    newGame();
  }

  function onAiSideChange(side) {
    setAiPlaysAs(side);
    newGame();
  }

  const status = (() => {
    if (result?.winner) {
      return `Winner: ${result.winner}`;
    }
    if (result?.draw) {
      return "It's a draw!";
    }
    return `Turn: ${current}`;
  })();

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="logo">◻︎</div>
          <div className="titles">
            <h1 className="title">Tic Tac Toe</h1>
            <p className="subtitle">Ocean Professional</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <div className="controls">
            <div className="row">
              <div className="control-group">
                <label className="label">Mode</label>
                <div className="segmented">
                  <button
                    className={`seg-item ${mode === 'pvp' ? 'active' : ''}`}
                    onClick={() => onModeChange('pvp')}
                    aria-pressed={mode === 'pvp'}
                  >
                    Player vs Player
                  </button>
                  <button
                    className={`seg-item ${mode === 'ai' ? 'active' : ''}`}
                    onClick={() => onModeChange('ai')}
                    aria-pressed={mode === 'ai'}
                  >
                    Player vs AI
                  </button>
                </div>
              </div>

              {mode === 'ai' && (
                <div className="control-group">
                  <label className="label">AI plays as</label>
                  <div className="segmented">
                    <button
                      className={`seg-item ${aiPlaysAs === 'X' ? 'active' : ''}`}
                      onClick={() => onAiSideChange('X')}
                      aria-pressed={aiPlaysAs === 'X'}
                    >
                      X
                    </button>
                    <button
                      className={`seg-item ${aiPlaysAs === 'O' ? 'active' : ''}`}
                      onClick={() => onAiSideChange('O')}
                      aria-pressed={aiPlaysAs === 'O'}
                    >
                      O
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="row">
              <button className="btn primary" onClick={newGame}>
                New Game
              </button>
            </div>
          </div>

          <div className="status">
            <span
              className={`badge ${result?.winner ? 'win' : result?.draw ? 'draw' : 'turn'}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {status}
            </span>
            {isThinking && mode === 'ai' && !result && (
              <span className="thinking">AI thinking…</span>
            )}
          </div>
        </section>

        <section className="board-wrap" role="application" aria-label="Tic Tac Toe Board">
          <Board
            squares={board}
            onClick={handleSquareClick}
            winningLine={result?.line || []}
          />
        </section>
      </main>

      <footer className="footer">
        <span className="hint">
          Tip: You can switch modes anytime. A new game starts automatically.
        </span>
      </footer>
    </div>
  );
}

function Square({ value, onClick, highlight, index }) {
  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
      aria-label={`Square ${index + 1} ${value ? 'with ' + value : 'empty'}`}
    >
      {value === 'X' ? (
        <span className="mark x" style={{ color: PRIMARY }}>X</span>
      ) : value === 'O' ? (
        <span className="mark o" style={{ color: AMBER }}>O</span>
      ) : (
        <span className="mark placeholder">·</span>
      )}
    </button>
  );
}

function Board({ squares, onClick, winningLine }) {
  function renderSquare(i) {
    const highlight = winningLine?.includes(i);
    return (
      <Square
        key={i}
        index={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        highlight={highlight}
      />
    );
  }

  return (
    <div className="board">
      <div className="grid">
        {Array.from({ length: 9 }).map((_, i) => renderSquare(i))}
      </div>
    </div>
  );
}

export default App;
