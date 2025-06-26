import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";

interface ChessBoardProps {
  fen?: string;
  onMove?: (from: string, to: string) => void;
  playerColor?: "white" | "black";
  disabled?: boolean;
  isPlayerTurn?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  onMove,
  playerColor = "white",
  disabled = false,
  isPlayerTurn = true,
}) => {
  const [chess, setChess] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [board, setBoard] = useState(chess.board());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );
  const boardRef = useRef<HTMLDivElement>(null);

  // Create audio context for move sounds
  const playMoveSound = () => {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.3,
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio not supported");
    }
  };

  useEffect(() => {
    try {
      const newChess = new Chess(fen);
      const newBoard = newChess.board();

      // Check if this is a new move by comparing board states
      if (chess.fen() !== fen && board) {
        // Find the move that was made
        const oldBoard = chess.board();
        let moveFrom = "";
        let moveTo = "";

        // Compare boards to find the move
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const oldPiece = oldBoard[row][col];
            const newPiece = newBoard[row][col];

            // Find where a piece disappeared (from square)
            if (oldPiece && !newPiece) {
              const square = getSquareName(row, col);
              moveFrom = square;
            }

            // Find where a piece appeared or changed (to square)
            if (
              (!oldPiece && newPiece) ||
              (oldPiece &&
                newPiece &&
                (oldPiece.type !== newPiece.type ||
                  oldPiece.color !== newPiece.color))
            ) {
              const square = getSquareName(row, col);
              if (newPiece) {
                moveTo = square;
              }
            }
          }
        }

        // Set last move and play sound
        if (moveFrom && moveTo) {
          setLastMove({ from: moveFrom, to: moveTo });
          playMoveSound();
        }
      }

      setChess(newChess);
      setBoard(newBoard);
      setSelectedSquare(null);
      setPossibleMoves([]);
    } catch (error) {
      console.error("Invalid FEN:", fen, error);
    }
  }, [fen]);

  const getPieceSymbol = (piece: any) => {
    if (!piece) return "";

    const symbols = {
      p: piece.color === "w" ? "♙" : "♟",
      r: piece.color === "w" ? "♖" : "♜",
      n: piece.color === "w" ? "♘" : "♞",
      b: piece.color === "w" ? "♗" : "♝",
      q: piece.color === "w" ? "♕" : "♛",
      k: piece.color === "w" ? "♔" : "♚",
    };

    return symbols[piece.type as keyof typeof symbols] || "";
  };

  const getSquareName = (row: number, col: number): Square => {
    const files = "abcdefgh";
    const rank = playerColor === "white" ? 8 - row : row + 1;
    const file = playerColor === "white" ? files[col] : files[7 - col];
    return `${file}${rank}` as Square;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (disabled || !isPlayerTurn) return;

    const square = getSquareName(row, col);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Try to make a move
      if (possibleMoves.includes(square)) {
        console.log("Making move:", selectedSquare, "to", square);
        playMoveSound();
        onMove?.(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      } else {
        // Check if clicking on another piece of same color
        const piece = chess.get(square);
        if (
          piece &&
          ((playerColor === "white" && piece.color === "w") ||
            (playerColor === "black" && piece.color === "b"))
        ) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map((move) => move.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      const piece = chess.get(square);
      if (piece && !disabled && isPlayerTurn) {
        // Only allow selecting your own pieces
        const canSelectPiece =
          (playerColor === "white" && piece.color === "w") ||
          (playerColor === "black" && piece.color === "b");

        if (canSelectPiece) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map((move) => move.to));
        }
      }
    }
  };

  const isSquareHighlighted = (row: number, col: number) => {
    const square = getSquareName(row, col);
    return selectedSquare === square;
  };

  const isPossibleMove = (row: number, col: number) => {
    const square = getSquareName(row, col);
    return possibleMoves.includes(square);
  };

  const isLastMove = (row: number, col: number) => {
    const square = getSquareName(row, col);
    return lastMove && (lastMove.from === square || lastMove.to === square);
  };

  const isLightSquare = (row: number, col: number) => {
    return (row + col) % 2 === 0;
  };

  return (
    <div className="flex flex-col items-center w-full px-1 sm:px-2">
      <div className="lavender-card p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl lavender-shadow-lg w-full h-full max-w-none sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl border-2 sm:border-4 border-purple-300">
        <div
          ref={boardRef}
          className="grid grid-cols-8 gap-0 aspect-square w-full h-full border-2 sm:border-4 border-purple-400 rounded-md sm:rounded-lg overflow-hidden lavender-shadow-lg"
        >
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const displayRow =
                playerColor === "white" ? rowIndex : 7 - rowIndex;
              const displayCol =
                playerColor === "white" ? colIndex : 7 - colIndex;

              return (
                <div
                  key={`${displayRow}-${displayCol}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold cursor-pointer
                    transition-colors duration-200 active:scale-95 relative overflow-hidden
                    ${
                      isLightSquare(displayRow, displayCol)
                        ? "bg-lavender-50 hover:bg-lavender-100"
                        : "bg-purple-300 hover:bg-purple-400"
                    }
                    ${
                      isSquareHighlighted(displayRow, displayCol)
                        ? "ring-4 ring-purple-400 bg-purple-200"
                        : ""
                    }
                    ${
                      isPossibleMove(displayRow, displayCol)
                        ? "after:absolute after:inset-1/3 after:bg-purple-500 after:rounded-full after:opacity-70"
                        : ""
                    }
                    ${
                      isLastMove(displayRow, displayCol)
                        ? "bg-lavender-300 ring-2 ring-purple-500"
                        : ""
                    }
                    ${disabled || !isPlayerTurn ? "cursor-default opacity-70" : "cursor-pointer"}
                    ${!isPlayerTurn ? "pointer-events-none" : ""}
                  `}
                  onClick={() => handleSquareClick(displayRow, displayCol)}
                >
                  <span
                    className={`z-10 drop-shadow-2xl select-none ${
                      piece && piece.color === "b" ? "text-black" : "text-white"
                    }`}
                    style={{
                      textShadow: piece
                        ? piece.color === "b"
                          ? "2px 2px 4px rgba(255, 255, 255, 0.8)"
                          : "2px 2px 4px rgba(0, 0, 0, 0.8)"
                        : "none",
                      filter:
                        piece && piece.color === "b"
                          ? "drop-shadow(1px 1px 2px white)"
                          : "none",
                    }}
                  >
                    {getPieceSymbol(piece)}
                  </span>
                </div>
              );
            }),
          )}
        </div>

        <div className="mt-2 sm:mt-4 md:mt-8 text-center">
          <div className="text-white text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-black/80 to-purple-900/80 rounded-md sm:rounded-lg px-3 py-2 sm:px-6 sm:py-4 border border-yellow-400 sm:border-2 shadow-xl">
            Playing as {playerColor === "white" ? "⚪ White" : "⚫ Black"}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-purple-300 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-900/60 to-purple-800/60 rounded-md px-3 py-2 sm:px-4 sm:py-3 inline-block border border-purple-400 sm:border-2 shadow-lg">
              Opponent's turn...
            </div>
          )}
          {disabled && (
            <div className="text-gray-300 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-md px-3 py-2 sm:px-4 sm:py-3 inline-block border border-gray-400 sm:border-2 shadow-lg">
              Spectating
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
