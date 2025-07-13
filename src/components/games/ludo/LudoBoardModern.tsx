import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Crown,
  Star,
  Timer,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  LudoGameState,
  LudoPiece,
  BOARD_SIZE,
  HOME_POSITIONS,
  START_POSITIONS,
  SAFE_POSITIONS,
  COLOR_PATHS,
  canMovePieceOut,
  canCapture,
  calculateNewPosition,
  isWinCondition,
  getNextPlayer,
} from "./LudoGameLogic";

interface LudoBoardModernProps {
  gameState: LudoGameState;
  onMove: (color: string, pieceId: number, steps: number) => Promise<void>;
  onTurnEnd: () => void;
  playerColor: "red" | "blue" | "green" | "yellow";
  currentPlayer: string;
  isPlayerTurn: boolean;
  disabled?: boolean;
  onGameEnd?: (winner: string) => void;
}

export const LudoBoardModern: React.FC<LudoBoardModernProps> = ({
  gameState,
  onMove,
  onTurnEnd,
  playerColor,
  currentPlayer,
  isPlayerTurn,
  disabled = false,
  onGameEnd,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);

  // Modern Ludo King color scheme
  const modernColors = {
    red: "#FF4444",
    blue: "#4285F4",
    green: "#34A853",
    yellow: "#FBBC05",
  };

  const playerNames = {
    red: "Bot1",
    blue: "Bot2",
    green: "You",
    yellow: "Bot3",
  };

  // Turn timer
  useEffect(() => {
    if (!isPlayerTurn || disabled) return;

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          toast.error("Time's up! Turn passed.");
          handleTurnEnd();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, disabled, currentPlayer]);

  // Reset turn state when turn changes
  useEffect(() => {
    setTurnTimeLeft(30);
    setSelectedPiece(null);
    setValidMoves([]);
    setHasRolledThisTurn(false);
    setHasMovedThisTurn(false);
    setDiceValue(null);
  }, [currentPlayer]);

  const handleTurnEnd = useCallback(() => {
    setDiceValue(null);
    setHasRolledThisTurn(false);
    setHasMovedThisTurn(false);
    setSelectedPiece(null);
    setValidMoves([]);
    onTurnEnd();
  }, [onTurnEnd]);

  const rollDice = useCallback(async () => {
    if (!isPlayerTurn || disabled || isRolling || hasRolledThisTurn) return;

    setIsRolling(true);
    setHasRolledThisTurn(true);

    // Dice roll animation
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);

      // Check for valid moves
      const moves = calculateValidMoves(finalValue);
      if (moves.length === 0) {
        toast.info("No valid moves! Turn ends.");
        setTimeout(() => {
          handleTurnEnd();
        }, 2000);
      } else {
        toast.success(`Rolled ${finalValue}! Choose a piece to move.`);
      }
    }, 800);
  }, [isPlayerTurn, disabled, isRolling, hasRolledThisTurn, handleTurnEnd]);

  const calculateValidMoves = useCallback(
    (steps: number): number[] => {
      if (!gameState.pieces[playerColor]) return [];

      const pieces = gameState.pieces[playerColor];
      const valid: number[] = [];

      pieces.forEach((piece, index) => {
        if (canMovePiece(piece, steps)) {
          valid.push(index);
        }
      });

      setValidMoves(valid);
      return valid;
    },
    [gameState.pieces, playerColor],
  );

  const canMovePiece = (piece: LudoPiece, steps: number): boolean => {
    if (piece.position === "home") {
      return canMovePieceOut(steps);
    }

    if (piece.position === "finished") {
      return false;
    }

    if (piece.position === "active") {
      const newPos = calculateNewPosition(
        playerColor,
        piece.pathPosition,
        steps,
      );
      return newPos !== null;
    }

    return false;
  };

  const handlePieceClick = async (pieceId: number) => {
    if (
      !isPlayerTurn ||
      disabled ||
      !diceValue ||
      !validMoves.includes(pieceId) ||
      hasMovedThisTurn
    ) {
      if (!validMoves.includes(pieceId)) {
        toast.error("This piece cannot be moved!");
      }
      return;
    }

    try {
      setSelectedPiece(pieceId);
      setHasMovedThisTurn(true);

      await onMove(playerColor, pieceId, diceValue);

      // Check for win condition
      const pieces = gameState.pieces[playerColor];
      if (isWinCondition(pieces)) {
        onGameEnd?.(playerColor);
        return;
      }

      // Only continue turn if rolled a 6, otherwise end turn
      if (diceValue === 6) {
        toast.success("You rolled a 6! Take another turn!");
        setHasRolledThisTurn(false);
        setHasMovedThisTurn(false);
        setDiceValue(null);
        setSelectedPiece(null);
        setValidMoves([]);
      } else {
        toast.info("Turn complete!");
        setTimeout(() => {
          handleTurnEnd();
        }, 1500);
      }
    } catch (error) {
      console.error("Error moving piece:", error);
      toast.error("Failed to move piece");
      setSelectedPiece(null);
      setHasMovedThisTurn(false);
    }
  };

  const renderPlayerArea = (
    color: "red" | "blue" | "green" | "yellow",
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  ) => {
    const pieces = gameState.pieces[color] || [];
    const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][
      (diceValue || 1) - 1
    ];

    const isCurrentPlayer = currentPlayer === color;
    const isPlayerArea = playerColor === color;

    const positionClasses = {
      "top-left": "flex-row",
      "top-right": "flex-row-reverse",
      "bottom-left": "flex-row",
      "bottom-right": "flex-row-reverse",
    };

    const textPosition = {
      "top-left": "text-left",
      "top-right": "text-right",
      "bottom-left": "text-left",
      "bottom-right": "text-right",
    };

    return (
      <div className={`flex ${positionClasses[position]} items-center gap-3`}>
        {/* Player Info */}
        <div className={`${textPosition[position]} space-y-2`}>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: modernColors[color] }}
            />
            <span className="font-bold text-white text-sm drop-shadow-md">
              {playerNames[color]}
            </span>
          </div>
          {isCurrentPlayer && (
            <Badge className="bg-white/90 text-gray-800 text-xs px-2 py-1">
              Current Turn
            </Badge>
          )}
        </div>

        {/* Dice */}
        <div className="flex flex-col items-center">
          <Button
            onClick={isPlayerArea ? rollDice : undefined}
            disabled={
              !isPlayerArea ||
              !isPlayerTurn ||
              disabled ||
              isRolling ||
              hasRolledThisTurn ||
              hasMovedThisTurn
            }
            className={`
              w-12 h-12 rounded-lg border-2 border-white shadow-lg transition-all duration-200
              ${
                isPlayerArea &&
                isPlayerTurn &&
                !hasRolledThisTurn &&
                !hasMovedThisTurn
                  ? "bg-white hover:scale-105 text-gray-700 cursor-pointer"
                  : "bg-white/80 cursor-not-allowed opacity-60 text-gray-400"
              }
            `}
          >
            <DiceIcon className="w-6 h-6" />
          </Button>

          {diceValue && isCurrentPlayer && !isRolling && (
            <div className="mt-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">
              {diceValue}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHomeArea = (color: "red" | "blue" | "green" | "yellow") => {
    const pieces = gameState.pieces[color] || [];
    const homePieces = pieces.filter((p) => p.position === "home");

    return (
      <div
        className={`w-24 h-24 rounded-lg border-4 border-white shadow-lg relative`}
        style={{ backgroundColor: modernColors[color] }}
      >
        {/* Home area grid */}
        <div className="absolute inset-2 grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((index) => {
            const piece = homePieces[index];
            return (
              <div
                key={index}
                className="w-8 h-8 bg-white/90 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-all duration-200"
                onClick={() => piece && handlePieceClick(piece.id)}
              >
                {piece && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-all duration-200 ${
                      selectedPiece === piece.id
                        ? "ring-2 ring-blue-400 scale-110"
                        : ""
                    } ${
                      validMoves.includes(piece.id) && !hasMovedThisTurn
                        ? "ring-2 ring-green-400 animate-pulse"
                        : ""
                    }`}
                    style={{ backgroundColor: modernColors[color] }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBoard = () => {
    const cells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isPath = isPathCell(row, col);
        const isHome = isHomeArea(row, col);
        const isSafe = isSafeCell(row, col);
        const isStart = isStartCell(row, col);
        const isCenter = row === 7 && col === 7;
        const isMainPath = isMainPathCell(row, col);

        let cellColor = "bg-white";
        let borderClass = "border border-gray-200";

        if (isCenter) {
          cellColor = "bg-gradient-to-br from-yellow-300 to-yellow-400";
          borderClass = "border-2 border-yellow-500";
        } else if (isHome) {
          cellColor = getHomeColor(row, col);
          borderClass = "border-2 border-white";
        } else if (isSafe) {
          cellColor = "bg-gradient-to-br from-green-100 to-green-200";
          borderClass = "border-2 border-green-400";
        } else if (isMainPath) {
          cellColor = getMainPathColor(row, col);
          borderClass = "border border-gray-300";
        } else if (isPath) {
          cellColor = "bg-gray-50";
          borderClass = "border border-gray-300";
        }

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-6 h-6 ${cellColor} ${borderClass} flex items-center justify-center relative transition-all duration-200`}
          >
            {isCenter && <Crown className="w-4 h-4 text-yellow-700" />}
            {isSafe && !isCenter && (
              <Star className="w-3 h-3 text-green-600 absolute top-0.5 right-0.5" />
            )}
            {isStart && (
              <div className="w-2 h-2 bg-white rounded-full border border-gray-400" />
            )}
            {renderArrows(row, col)}

            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={`${piece.color}-${piece.id}`}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`
                      w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-all duration-200 shadow-md
                      ${selectedPiece === piece.id ? "ring-2 ring-blue-400 scale-110" : ""}
                      ${validMoves.includes(piece.id) && !hasMovedThisTurn ? "ring-2 ring-green-400 animate-pulse" : ""}
                      ${piece.color === playerColor && isPlayerTurn && !hasMovedThisTurn ? "hover:scale-110" : ""}
                    `}
                    style={{
                      backgroundColor:
                        modernColors[piece.color as keyof typeof modernColors],
                      transform: `translate(${index * 1.5}px, ${index * 1.5}px)`,
                      zIndex: index + 10,
                    }}
                  />
                ))}
              </div>
            )}
          </div>,
        );
      }
    }

    return (
      <div
        className="grid gap-0 bg-white rounded-2xl shadow-2xl border-4 border-gray-300 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: "min(80vw, 420px)",
          height: "min(80vw, 420px)",
        }}
      >
        {cells}
      </div>
    );
  };

  const isPathCell = (row: number, col: number): boolean => {
    if ((row === 6 || row === 8) && col >= 0 && col <= 14) return true;
    if ((col === 6 || col === 8) && row >= 0 && row <= 14) return true;
    if (row === 7 && col >= 1 && col <= 6) return true;
    if (row === 7 && col >= 8 && col <= 13) return true;
    if (col === 7 && row >= 1 && row <= 6) return true;
    if (col === 7 && row >= 8 && row <= 13) return true;
    return false;
  };

  const isMainPathCell = (row: number, col: number): boolean => {
    // Colored paths leading to center
    if (row === 7 && col >= 1 && col <= 6) return true; // Red path
    if (col === 7 && row >= 1 && row <= 6) return true; // Blue path
    if (row === 7 && col >= 8 && col <= 13) return true; // Green path
    if (col === 7 && row >= 8 && row <= 13) return true; // Yellow path
    return false;
  };

  const getMainPathColor = (row: number, col: number): string => {
    if (row === 7 && col >= 1 && col <= 6) return "bg-red-100"; // Red path
    if (col === 7 && row >= 1 && row <= 6) return "bg-blue-100"; // Blue path
    if (row === 7 && col >= 8 && col <= 13) return "bg-green-100"; // Green path
    if (col === 7 && row >= 8 && row <= 13) return "bg-yellow-100"; // Yellow path
    return "bg-white";
  };

  const renderArrows = (row: number, col: number) => {
    // Add directional arrows for main paths
    if (row === 7 && col === 6)
      return <ArrowRight className="w-3 h-3 text-red-500" />;
    if (col === 7 && row === 6)
      return <ArrowDown className="w-3 h-3 text-blue-500" />;
    if (row === 7 && col === 8)
      return <ArrowLeft className="w-3 h-3 text-green-500" />;
    if (col === 7 && row === 8)
      return <ArrowUp className="w-3 h-3 text-yellow-500" />;
    return null;
  };

  const isHomeArea = (row: number, col: number): boolean => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return true;
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return true;
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return true;
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return true;
    return false;
  };

  const getHomeColor = (row: number, col: number): string => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return `bg-red-300`;
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return `bg-blue-300`;
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return `bg-green-300`;
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return `bg-yellow-300`;
    return "bg-gray-200";
  };

  const isSafeCell = (row: number, col: number): boolean => {
    return SAFE_POSITIONS.some(([r, c]) => r === row && c === col);
  };

  const isStartCell = (row: number, col: number): boolean => {
    return Object.values(START_POSITIONS).some(
      ([r, c]) => r === row && c === col,
    );
  };

  const getPiecesAtPosition = (row: number, col: number) => {
    const pieces: any[] = [];
    Object.entries(gameState.pieces || {}).forEach(([color, colorPieces]) => {
      (colorPieces as LudoPiece[]).forEach((piece) => {
        if (piece.row === row && piece.col === col) {
          pieces.push({ ...piece, color });
        }
      });
    });
    return pieces;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      {/* Game Board Container */}
      <div className="relative">
        {/* Top Players */}
        <div className="absolute -top-16 left-0 right-0 flex justify-between px-8">
          {renderPlayerArea("red", "top-left")}
          {renderPlayerArea("blue", "top-right")}
        </div>

        {/* Left and Right Home Areas */}
        <div className="absolute top-16 -left-28">{renderHomeArea("red")}</div>
        <div className="absolute top-16 -right-28">
          {renderHomeArea("blue")}
        </div>
        <div className="absolute bottom-16 -right-28">
          {renderHomeArea("green")}
        </div>
        <div className="absolute bottom-16 -left-28">
          {renderHomeArea("yellow")}
        </div>

        {/* Main Board */}
        {renderBoard()}

        {/* Bottom Players */}
        <div className="absolute -bottom-16 left-0 right-0 flex justify-between px-8">
          {renderPlayerArea("yellow", "bottom-left")}
          {renderPlayerArea("green", "bottom-right")}
        </div>
      </div>

      {/* Game Status */}
      {isPlayerTurn && !disabled && (
        <div className="mt-8 text-center">
          <Badge className="bg-white/90 text-gray-800 px-4 py-2 text-lg font-bold">
            🎮 Your Turn - {turnTimeLeft}s
          </Badge>
          {!hasRolledThisTurn && !hasMovedThisTurn && (
            <p className="text-white mt-2 text-sm drop-shadow-md">
              Roll the dice to continue!
            </p>
          )}
          {diceValue && validMoves.length > 0 && !hasMovedThisTurn && (
            <p className="text-white mt-2 text-sm drop-shadow-md">
              Choose a piece to move with {diceValue} steps
            </p>
          )}
        </div>
      )}
    </div>
  );
};
