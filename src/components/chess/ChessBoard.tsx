import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { toast } from "sonner";
import { PawnPromotionDialog } from "./PawnPromotionDialog";

interface ChessBoardProps {
  fen?: string;
  onMove?: (from: string, to: string, promotion?: string) => void;
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
  const [promotionMove, setPromotionMove] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
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
      console.log("ChessBoard: Updating with FEN:", fen);
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
              const files = "abcdefgh";
              const rank = 8 - row;
              const file = files[col];
              moveFrom = `${file}${rank}`;
            }

            // Find where a piece appeared or changed (to square)
            if (
              (!oldPiece && newPiece) ||
              (oldPiece &&
                newPiece &&
                (oldPiece.type !== newPiece.type ||
                  oldPiece.color !== newPiece.color))
            ) {
              const files = "abcdefgh";
              const rank = 8 - row;
              const file = files[col];
              if (newPiece) {
                moveTo = `${file}${rank}`;
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
      console.log("ChessBoard: Successfully updated board state");
    } catch (error) {
      console.error("ChessBoard: Invalid FEN:", fen, error);
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

  const isPawnPromotion = (from: string, to: string): boolean => {
    const piece = chess.get(from as Square);
    if (!piece || piece.type !== "p") return false;

    const toRank = parseInt(to[1]);

    // White pawn reaching rank 8, black pawn reaching rank 1
    return (
      (piece.color === "w" && toRank === 8) ||
      (piece.color === "b" && toRank === 1)
    );
  };

  const getSquareName = (row: number, col: number): Square => {
    const files = "abcdefgh";
    // Calculate the actual board position based on player perspective
    const actualRow = playerColor === "white" ? row : 7 - row;
    const actualCol = playerColor === "white" ? col : 7 - col;

    // Convert to chess notation
    const rank = 8 - actualRow; // Row 0 is rank 8, row 7 is rank 1
    const file = files[actualCol]; // Col 0 is file 'a', col 7 is file 'h'
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

        // Double-check the move is valid before calling onMove
        const moveAttempt = chess
          .moves({ verbose: true })
          .find((m) => m.from === selectedSquare && m.to === square);

        if (!moveAttempt) {
          console.error("Move was in possibleMoves but not valid:", {
            from: selectedSquare,
            to: square,
          });
          toast.error("Invalid move");
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }

        // Check if this is a pawn promotion
        if (isPawnPromotion(selectedSquare, square)) {
          console.log("Pawn promotion detected:", selectedSquare, "to", square);
          setPromotionMove({ from: selectedSquare, to: square });
          setShowPromotionDialog(true);
          return;
        }

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

  const handlePromotionSelect = (piece: "q" | "r" | "b" | "n") => {
    if (!promotionMove) return;

    console.log("Promotion piece selected:", piece);
    playMoveSound();
    onMove?.(promotionMove.from, promotionMove.to, piece);

    // Reset promotion state
    setPromotionMove(null);
    setShowPromotionDialog(false);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const handlePromotionCancel = () => {
    console.log("Promotion cancelled");
    setPromotionMove(null);
    setShowPromotionDialog(false);
    // Keep the square selected so user can try a different move
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
    <div className="flex flex-col items-center w-full px-0 sm:px-1">
      <div className="wood-card p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 rounded-xl sm:rounded-2xl wood-shadow-deep w-full h-full max-w-none sm:max-w-6xl md:max-w-7xl lg:max-w-8xl xl:max-w-[100rem] border-6 border-amber-800 wood-plank relative overflow-hidden transform scale-105 sm:scale-110 md:scale-115 lg:scale-120">
        {/* Chess Board Frame - Premium Handcrafted Wood Style */}
        <div className="relative p-3 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-xl wood-shadow-xl border-4 border-amber-700 shadow-2xl">
          {/* Ornate Inner Wood Frame */}
          <div className="relative p-2 sm:p-4 md:p-6 bg-gradient-to-br from-amber-800 via-amber-700 to-amber-800 rounded-lg border-2 border-amber-600">
            {/* Premium Chess Board Surface */}
            <div
              ref={boardRef}
              className="grid grid-cols-8 gap-0 aspect-square w-full h-full rounded-lg overflow-hidden wood-shadow-2xl relative border-4 border-amber-900 shadow-inner"
              style={{
                background: `
                  radial-gradient(circle at center, rgba(139, 69, 19, 0.15) 0%, rgba(160, 82, 45, 0.1) 100%),
                  repeating-linear-gradient(0deg,
                    rgba(139, 69, 19, 0.15) 0px,
                    rgba(160, 82, 45, 0.1) 1px,
                    rgba(139, 69, 19, 0.15) 2px),
                  repeating-linear-gradient(90deg,
                    rgba(139, 69, 19, 0.15) 0px,
                    rgba(160, 82, 45, 0.1) 1px,
                    rgba(139, 69, 19, 0.15) 2px)
                `,
                boxShadow: "inset 0 0 50px rgba(139, 69, 19, 0.3)",
              }}
            >
              {Array.from({ length: 8 }, (_, rowIndex) =>
                Array.from({ length: 8 }, (_, colIndex) => {
                  // Calculate the actual board position based on player perspective
                  const actualRow =
                    playerColor === "white" ? rowIndex : 7 - rowIndex;
                  const actualCol =
                    playerColor === "white" ? colIndex : 7 - colIndex;

                  // Get the piece from the board array
                  const piece = board[actualRow] && board[actualRow][actualCol];

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                    aspect-square flex items-center justify-center text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-bold cursor-pointer
                    transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden border-2 border-amber-900/20 shadow-lg
                    ${
                      isLightSquare(rowIndex, colIndex)
                        ? "bg-gradient-to-br from-amber-100 to-amber-50 hover:from-amber-200 hover:to-amber-100"
                        : "bg-gradient-to-br from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600"
                    }
                    ${
                      isSquareHighlighted(rowIndex, colIndex)
                        ? "ring-4 ring-amber-500 bg-gradient-to-br from-amber-300 to-amber-200"
                        : ""
                    }
                    ${
                      isPossibleMove(rowIndex, colIndex)
                        ? "after:absolute after:inset-1/3 after:bg-amber-600 after:rounded-full after:opacity-80 after:border after:border-amber-800"
                        : ""
                    }
                    ${
                      isLastMove(rowIndex, colIndex)
                        ? "bg-gradient-to-br from-yellow-300 to-amber-300 ring-2 ring-amber-600"
                        : ""
                    }
                    ${disabled || !isPlayerTurn ? "cursor-default opacity-70" : "cursor-pointer"}
                    ${!isPlayerTurn ? "pointer-events-none" : ""}
                  `}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                    >
                      <span
                        className={`z-20 drop-shadow-2xl select-none transition-all duration-300 hover:scale-110 ${
                          piece && piece.color === "b"
                            ? "text-black"
                            : "text-white"
                        }`}
                        style={{
                          textShadow: piece
                            ? piece.color === "b"
                              ? "3px 3px 8px rgba(255, 255, 255, 0.9), 1px 1px 4px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5)"
                              : "3px 3px 8px rgba(0, 0, 0, 0.9), 1px 1px 4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.5)"
                            : "none",
                          filter: piece
                            ? piece.color === "b"
                              ? "drop-shadow(2px 2px 6px white) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))"
                              : "drop-shadow(2px 2px 6px black) drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))"
                            : "none",
                          fontWeight: "900",
                          WebkitTextStroke: piece
                            ? piece.color === "b"
                              ? "2px white"
                              : "2px black"
                            : "none",
                        }}
                      >
                        {getPieceSymbol(piece)}
                      </span>
                    </div>
                  );
                }),
              ).flat()}
            </div>
          </div>
        </div>

        {/* Premium Status Display - Enhanced Wood Style */}
        <div className="mt-6 sm:mt-8 md:mt-12 text-center">
          <div className="wood-text text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold wood-glass rounded-xl px-6 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8 border-4 border-amber-700 wood-shadow-xl tap-target bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 shadow-2xl transform hover:scale-105 transition-all duration-300">
            Playing as {playerColor === "white" ? "⚪ White" : "⚫ Black"}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-amber-800 mt-4 sm:mt-6 text-base sm:text-xl md:text-3xl lg:text-4xl font-bold wood-glass rounded-xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 inline-block border-4 border-amber-600 wood-shadow-xl tap-target bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-xl animate-pulse">
              Opponent's turn...
            </div>
          )}
          {disabled && (
            <div className="text-amber-700 mt-4 sm:mt-6 text-base sm:text-xl md:text-3xl lg:text-4xl font-bold wood-glass rounded-xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 inline-block border-4 border-amber-500 wood-shadow-xl tap-target bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-xl">
              Spectating
            </div>
          )}
        </div>
      </div>

      {/* Pawn Promotion Dialog */}
      <PawnPromotionDialog
        isOpen={showPromotionDialog}
        playerColor={playerColor}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />
    </div>
  );
};
