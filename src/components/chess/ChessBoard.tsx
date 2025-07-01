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
    <div className="flex flex-col items-center w-full h-full">
      {/* Full Width Chess Board - Enhanced Wood Theme */}
      <div className="w-full h-full flex flex-col">
        {/* Premium Chess Board Container */}
        <div 
          ref={boardRef}
          className="grid grid-cols-8 gap-0 aspect-square w-full h-full rounded-lg overflow-hidden shadow-2xl relative"
          style={{
            background: `
              linear-gradient(45deg, 
                rgba(101, 67, 33, 0.1) 0%, 
                rgba(139, 69, 19, 0.15) 25%, 
                rgba(160, 82, 45, 0.1) 50%, 
                rgba(139, 69, 19, 0.15) 75%, 
                rgba(101, 67, 33, 0.1) 100%
              )
            `,
            boxShadow: `
              inset 0 0 100px rgba(101, 67, 33, 0.3),
              0 20px 40px rgba(0, 0, 0, 0.3)
            `,
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
                    aspect-square flex items-center justify-center text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[8rem] xl:text-[10rem] 2xl:text-[12rem] font-bold cursor-pointer
                    transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden shadow-inner
                    ${
                      isLightSquare(rowIndex, colIndex)
                        ? "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 hover:from-amber-100 hover:via-orange-100 hover:to-yellow-100"
                        : "bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 hover:from-amber-800 hover:via-orange-800 hover:to-yellow-800"
                    }
                    ${
                      isSquareHighlighted(rowIndex, colIndex)
                        ? "ring-4 ring-yellow-500 bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg"
                        : ""
                    }
                    ${
                      isPossibleMove(rowIndex, colIndex)
                        ? "after:absolute after:inset-1/3 after:bg-gradient-to-br after:from-green-500 after:to-emerald-600 after:rounded-full after:opacity-80 after:shadow-lg after:border-2 after:border-green-700"
                        : ""
                    }
                    ${
                      isLastMove(rowIndex, colIndex)
                        ? "bg-gradient-to-br from-blue-200 to-cyan-300 ring-2 ring-blue-500 shadow-lg"
                        : ""
                    }
                    ${disabled || !isPlayerTurn ? "cursor-default opacity-70" : "cursor-pointer"}
                    ${!isPlayerTurn ? "pointer-events-none" : ""}
                  `}
                  style={{
                    background: isLightSquare(rowIndex, colIndex)
                      ? `
                        linear-gradient(135deg, 
                          #fef3c7 0%, 
                          #fcd34d 25%, 
                          #f59e0b 50%, 
                          #fcd34d 75%, 
                          #fef3c7 100%
                        ),
                        repeating-linear-gradient(0deg,
                          rgba(245, 158, 11, 0.1) 0px,
                          rgba(251, 191, 36, 0.05) 2px,
                          rgba(245, 158, 11, 0.1) 4px)
                      `
                      : `
                        linear-gradient(135deg, 
                          #451a03 0%, 
                          #7c2d12 25%, 
                          #a16207 50%, 
                          #7c2d12 75%, 
                          #451a03 100%
                        ),
                        repeating-linear-gradient(45deg,
                          rgba(124, 45, 18, 0.2) 0px,
                          rgba(161, 98, 7, 0.1) 2px,
                          rgba(124, 45, 18, 0.2) 4px)
                      `,
                    boxShadow: isLightSquare(rowIndex, colIndex)
                      ? "inset 0 2px 4px rgba(245, 158, 11, 0.2), inset 0 -2px 4px rgba(251, 191, 36, 0.1)"
                      : "inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 -2px 4px rgba(124, 45, 18, 0.3)",
                  }}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  <span
                    className={`z-10 drop-shadow-2xl select-none ${
                      piece && piece.color === "b"
                        ? "text-gray-900"
                        : "text-gray-100"
                    }`}
                    style={{
                      textShadow: piece
                        ? piece.color === "b"
                          ? "2px 2px 4px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.3)"
                          : "2px 2px 4px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.2)"
                        : "none",
                      filter: piece
                        ? piece.color === "b"
                          ? "drop-shadow(1px 1px 2px rgba(255, 255, 255, 0.5))"
                          : "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))"
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

        {/* Status Display - Enhanced Wood Theme */}
        <div className="mt-4 sm:mt-6 text-center">
          <div 
            className="text-base sm:text-xl md:text-2xl font-bold rounded-lg px-6 py-4 sm:px-8 sm:py-6 shadow-lg"
            style={{
              background: `
                linear-gradient(135deg, 
                  #fef3c7 0%, 
                  #fcd34d 50%, 
                  #f59e0b 100%
                ),
                repeating-linear-gradient(45deg,
                  rgba(245, 158, 11, 0.1) 0px,
                  rgba(251, 191, 36, 0.05) 2px,
                  rgba(245, 158, 11, 0.1) 4px)
              `,
              color: "#451a03",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
              border: "2px solid #a16207",
            }}
          >
            Playing as {playerColor === "white" ? "⚪ White" : "⚫ Black"}
          </div>
          {!isPlayerTurn && !disabled && (
            <div 
              className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-bold rounded-lg px-4 py-3 sm:px-6 sm:py-4 inline-block shadow-lg"
              style={{
                background: `
                  linear-gradient(135deg, 
                    #fed7aa 0%, 
                    #fdba74 50%, 
                    #fb923c 100%
                  )
                `,
                color: "#7c2d12",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                border: "2px solid #ea580c",
              }}
            >
              Opponent's turn...
            </div>
          )}
          {disabled && (
            <div 
              className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-bold rounded-lg px-4 py-3 sm:px-6 sm:py-4 inline-block shadow-lg"
              style={{
                background: `
                  linear-gradient(135deg, 
                    #fef3c7 0%, 
                    #fde68a 50%, 
                    #fbbf24 100%
                  )
                `,
                color: "#92400e",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                border: "2px solid #d97706",
              }}
            >
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
