
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log("Audio context not supported");
      }
    }
  }, []);

  // Improved move sound with error handling
  const playMoveSound = useCallback(() => {
    try {
      initAudioContext();
      const audioContext = audioContextRef.current;
      
      if (!audioContext) return;

      // Resume context if suspended (required by browser policies)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log("Move sound failed:", error);
    }
  }, [initAudioContext]);

  // Improved FEN update logic
  useEffect(() => {
    try {
      console.log("ChessBoard: Updating with FEN:", fen);
      const newChess = new Chess(fen);
      const newBoard = newChess.board();

      // Detect moves more reliably
      if (chess.fen() !== fen && board) {
        const history = newChess.history({ verbose: true });
        const lastMoveInHistory = history[history.length - 1];
        
        if (lastMoveInHistory) {
          setLastMove({ 
            from: lastMoveInHistory.from, 
            to: lastMoveInHistory.to 
          });
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
      toast.error("Invalid board position received");
    }
  }, [fen, chess, board, playMoveSound]);

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
    return (
      (piece.color === "w" && toRank === 8) ||
      (piece.color === "b" && toRank === 1)
    );
  };

  const getSquareName = (row: number, col: number): Square => {
    const files = "abcdefgh";
    const actualRow = playerColor === "white" ? row : 7 - row;
    const actualCol = playerColor === "white" ? col : 7 - col;

    const rank = 8 - actualRow;
    const file = files[actualCol];
    return `${file}${rank}` as Square;
  };

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (disabled || !isPlayerTurn) {
      console.log("Square click ignored - disabled or not player turn");
      return;
    }

    const square = getSquareName(row, col);
    console.log("Square clicked:", square);

    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect current square
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Try to make a move
      if (possibleMoves.includes(square)) {
        console.log("Making move:", selectedSquare, "to", square);

        // Validate move
        const moveAttempt = chess
          .moves({ verbose: true })
          .find((m) => m.from === selectedSquare && m.to === square);

        if (!moveAttempt) {
          console.error("Invalid move attempted:", { from: selectedSquare, to: square });
          toast.error("Invalid move");
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }

        // Handle pawn promotion
        if (isPawnPromotion(selectedSquare, square)) {
          console.log("Pawn promotion detected");
          setPromotionMove({ from: selectedSquare, to: square });
          setShowPromotionDialog(true);
          return;
        }

        // Make the move
        playMoveSound();
        onMove?.(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      } else {
        // Try to select a new piece
        const piece = chess.get(square);
        if (piece && 
            ((playerColor === "white" && piece.color === "w") ||
             (playerColor === "black" && piece.color === "b"))) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map((move) => move.to));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select a piece
      const piece = chess.get(square);
      if (piece && !disabled && isPlayerTurn) {
        const canSelectPiece =
          (playerColor === "white" && piece.color === "w") ||
          (playerColor === "black" && piece.color === "b");

        if (canSelectPiece) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setPossibleMoves(moves.map((move) => move.to));
          console.log("Selected piece at:", square, "with", moves.length, "possible moves");
        } else {
          toast.error("You can only move your own pieces");
        }
      }
    }
  }, [disabled, isPlayerTurn, selectedSquare, possibleMoves, chess, playerColor, onMove, playMoveSound]);

  const handlePromotionSelect = useCallback((piece: "q" | "r" | "b" | "n") => {
    if (!promotionMove) return;

    console.log("Promotion piece selected:", piece);
    playMoveSound();
    onMove?.(promotionMove.from, promotionMove.to, piece);

    setPromotionMove(null);
    setShowPromotionDialog(false);
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, [promotionMove, onMove, playMoveSound]);

  const handlePromotionCancel = useCallback(() => {
    console.log("Promotion cancelled");
    setPromotionMove(null);
    setShowPromotionDialog(false);
  }, []);

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
      <div className="electric-card p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl electric-shadow-lg w-full h-full max-w-none sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl border-2 sm:border-4 electric-border">
        <div
          ref={boardRef}
          className="grid grid-cols-8 gap-0 aspect-square w-full h-full border-2 sm:border-4 border-blue-400 rounded-md sm:rounded-lg overflow-hidden electric-shadow-lg"
        >
          {Array.from({ length: 8 }, (_, rowIndex) =>
            Array.from({ length: 8 }, (_, colIndex) => {
              const actualRow = playerColor === "white" ? rowIndex : 7 - rowIndex;
              const actualCol = playerColor === "white" ? colIndex : 7 - colIndex;

              const piece = board[actualRow] && board[actualRow][actualCol];

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold cursor-pointer
                    transition-all duration-150 active:scale-95 relative overflow-hidden select-none
                    ${
                      isLightSquare(rowIndex, colIndex)
                        ? "bg-electric-50 hover:bg-electric-100"
                        : "bg-blue-300 hover:bg-blue-400"
                    }
                    ${
                      isSquareHighlighted(rowIndex, colIndex)
                        ? "ring-4 ring-blue-400 bg-blue-200"
                        : ""
                    }
                    ${
                      isPossibleMove(rowIndex, colIndex)
                        ? "after:absolute after:inset-1/3 after:bg-blue-500 after:rounded-full after:opacity-70"
                        : ""
                    }
                    ${
                      isLastMove(rowIndex, colIndex)
                        ? "bg-electric-300 ring-2 ring-blue-500"
                        : ""
                    }
                    ${disabled || !isPlayerTurn ? "cursor-default opacity-70" : "cursor-pointer"}
                    ${!isPlayerTurn ? "pointer-events-none" : ""}
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  <span
                    className={`z-10 drop-shadow-2xl select-none transition-transform duration-150 ${
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
          ).flat()}
        </div>

        <div className="mt-2 sm:mt-4 md:mt-8 text-center">
          <div className="electric-text text-sm sm:text-lg md:text-2xl font-bold electric-glass rounded-md sm:rounded-lg px-3 py-2 sm:px-6 sm:py-4 border electric-border sm:border-2 electric-shadow tap-target">
            Playing as {playerColor === "white" ? "⚪ White" : "⚫ Black"}
          </div>
          {!isPlayerTurn && !disabled && (
            <div className="text-blue-600 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold electric-glass rounded-md px-3 py-2 sm:px-4 sm:py-3 inline-block border electric-border sm:border-2 electric-shadow tap-target">
              Opponent's turn...
            </div>
          )}
          {disabled && (
            <div className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold electric-glass rounded-md px-3 py-2 sm:px-4 sm:py-3 inline-block border border-gray-300 sm:border-2 electric-shadow tap-target">
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
