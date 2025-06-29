import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown, Star, Timer, Zap } from "lucide-react";
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

interface LudoBoardEnhancedProps {
  gameState: LudoGameState;
  onMove: (color: string, pieceId: number, steps: number) => Promise<void>;
  playerColor: "red" | "blue" | "green" | "yellow";
  currentPlayer: string;
  isPlayerTurn: boolean;
  disabled?: boolean;
  onGameEnd?: (winner: string) => void;
}

export const LudoBoardEnhanced: React.FC<LudoBoardEnhancedProps> = ({
  gameState,
  onMove,
  playerColor,
  currentPlayer,
  isPlayerTurn,
  disabled = false,
  onGameEnd,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(gameState.diceValue);
  const [isRolling, setIsRolling] = useState(false);
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [showMoveHint, setShowMoveHint] = useState(false);

  // Turn timer
  useEffect(() => {
    if (!isPlayerTurn || disabled) return;

    const timer = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          toast.error("Time's up! Turn skipped.");
          // Auto-pass turn after timeout
          setTimeout(() => setDiceValue(null), 1000);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, disabled, currentPlayer]);

  // Reset turn timer when turn changes
  useEffect(() => {
    setTurnTimeLeft(30);
    setSelectedPiece(null);
    setValidMoves([]);
  }, [currentPlayer]);

  // Update dice value from game state
  useEffect(() => {
    setDiceValue(gameState.diceValue);
    if (gameState.diceValue) {
      calculateValidMoves(gameState.diceValue);
    }
  }, [gameState.diceValue]);

  const rollDice = useCallback(async () => {
    if (!isPlayerTurn || disabled || isRolling || diceValue !== null) return;

    setIsRolling(true);
    setShowMoveHint(false);

    // Animated dice roll
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);

      // Check for valid moves
      const moves = calculateValidMoves(finalValue);
      if (moves.length === 0) {
        toast.info("No valid moves! Turn will pass automatically.");
        setTimeout(() => {
          setDiceValue(null);
        }, 2000);
      } else if (moves.length === 1) {
        setShowMoveHint(true);
        toast.success(`You can move piece ${moves[0] + 1}!`);
      } else {
        toast.success(`You rolled ${finalValue}! Choose a piece to move.`);
      }
    }, 1000);
  }, [isPlayerTurn, disabled, isRolling, diceValue]);

  const calculateValidMoves = useCallback((steps: number): number[] => {
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
  }, [gameState.pieces, playerColor]);

  const canMovePiece = (piece: LudoPiece, steps: number): boolean => {
    // Piece in home can only move out with a 6
    if (piece.position === "home") {
      return canMovePieceOut(steps);
    }

    // Finished pieces can't move
    if (piece.position === "finished") {
      return false;
    }

    // Active pieces can move if they don't exceed the path
    if (piece.position === "active") {
      const newPos = calculateNewPosition(playerColor, piece.pathPosition, steps);
      return newPos !== null;
    }

    return false;
  };

  const handlePieceClick = async (pieceId: number) => {
    if (!isPlayerTurn || disabled || !diceValue || !validMoves.includes(pieceId)) {
      if (!validMoves.includes(pieceId)) {
        toast.error("This piece cannot be moved!");
      }
      return;
    }

    try {
      setSelectedPiece(pieceId);
      await onMove(playerColor, pieceId, diceValue);
      
      // Check for win condition
      const pieces = gameState.pieces[playerColor];
      if (isWinCondition(pieces)) {
        onGameEnd?.(playerColor);
        return;
      }

      // If not a 6, clear dice for next player
      if (diceValue !== 6) {
        setDiceValue(null);
      }
      
      setSelectedPiece(null);
      setValidMoves([]);
    } catch (error) {
      console.error("Error moving piece:", error);
      toast.error("Failed to move piece");
      setSelectedPiece(null);
    }
  };

  const renderDice = () => {
    const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][
      (diceValue || 1) - 1
    ];

    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="relative">
          <Button
            onClick={rollDice}
            disabled={!isPlayerTurn || disabled || isRolling || diceValue !== null}
            className={`
              w-20 h-20 rounded-xl border-4 transition-all duration-300 shadow-2xl
              ${isPlayerTurn && !disabled && diceValue === null
                ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600 hover:scale-110 hover:rotate-12 shadow-yellow-400/50"
                : "bg-gray-400 border-gray-500 cursor-not-allowed opacity-60"
              }
              ${isRolling ? "animate-spin scale-110" : ""}
            `}
          >
            <DiceIcon className="w-10 h-10 text-white drop-shadow-lg" />
          </Button>
          
          {diceValue && !isRolling && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse border-2 border-white">
              {diceValue}
            </div>
          )}
          
          {gameState.consecutiveSixes > 0 && (
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              <Zap className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Turn timer */}
        {isPlayerTurn && !disabled && (
          <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-400">
            <Timer className="w-4 h-4 text-blue-300" />
            <span className={`font-bold ${turnTimeLeft <= 10 ? "text-red-400 animate-pulse" : "text-blue-300"}`}>
              {turnTimeLeft}s
            </span>
          </div>
        )}

        {/* Status message */}
        <div className="text-center">
          {isRolling && (
            <p className="text-yellow-300 font-bold animate-pulse">🎲 Rolling...</p>
          )}
          {!isRolling && isPlayerTurn && !diceValue && (
            <p className="text-green-300 font-bold">🎯 Your Turn - Roll Dice!</p>
          )}
          {!isRolling && isPlayerTurn && diceValue && validMoves.length > 0 && (
            <p className="text-blue-300 font-bold">🎮 Choose a piece to move!</p>
          )}
          {!isPlayerTurn && (
            <p className="text-gray-400">⏳ Waiting for {currentPlayer}...</p>
          )}
        </div>

        {/* Move hint */}
        {showMoveHint && validMoves.length === 1 && (
          <div className="bg-green-800/50 border border-green-400 rounded-lg p-2 text-green-200 text-sm animate-pulse">
            💡 Click on piece #{validMoves[0] + 1} to move!
          </div>
        )}
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

        let cellColor = "bg-orange-50";
        let borderClass = "border border-orange-200";
        
        if (isCenter) {
          cellColor = "bg-gradient-to-br from-yellow-400 to-orange-500";
          borderClass = "border-2 border-yellow-600";
        } else if (isHome) {
          cellColor = getHomeColor(row, col);
          borderClass = "border-2 border-white/50";
        } else if (isSafe) {
          cellColor = "bg-gradient-to-br from-green-200 to-emerald-300";
          borderClass = "border-2 border-green-500";
        } else if (isPath) {
          cellColor = "bg-gradient-to-br from-orange-100 to-yellow-100";
          borderClass = "border border-orange-300";
        }

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-7 h-7 ${cellColor} ${borderClass} flex items-center justify-center relative transition-all hover:scale-105 ${
              isSafe ? "shadow-inner" : ""
            }`}
          >
            {isCenter && <Crown className="w-4 h-4 text-yellow-800 animate-pulse" />}
            {isSafe && !isCenter && <Star className="w-3 h-3 text-green-700 absolute top-0.5 right-0.5" />}
            {isStart && <div className="w-2 h-2 bg-white rounded-full border border-gray-400" />}
            
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={`${piece.color}-${piece.id}`}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`
                      w-5 h-5 rounded-full border-2 border-white cursor-pointer transition-all duration-200
                      ${getPieceColor(piece.color)}
                      ${selectedPiece === piece.id ? "ring-2 ring-yellow-400 scale-125 animate-pulse" : ""}
                      ${validMoves.includes(piece.id) ? "ring-2 ring-blue-400 hover:scale-125 animate-bounce" : ""}
                      ${piece.color === playerColor && isPlayerTurn ? "hover:scale-110 shadow-lg" : ""}
                      shadow-md
                    `}
                    style={{
                      transform: `translate(${index * 2}px, ${index * 2}px)`,
                      zIndex: index + 10,
                    }}
                  >
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }

    return (
      <div className="flex justify-center p-4">
        <div
          className="grid gap-0 border-4 border-yellow-700 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-2xl shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "420px",
            height: "420px",
          }}
        >
          {cells}
        </div>
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

  const isHomeArea = (row: number, col: number): boolean => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return true;
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return true;
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return true;
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return true;
    return false;
  };

  const getHomeColor = (row: number, col: number): string => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) 
      return "bg-gradient-to-br from-red-400 to-red-600";
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-blue-400 to-blue-600";
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-green-400 to-green-600";
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) 
      return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    return "bg-gray-200";
  };

  const isSafeCell = (row: number, col: number): boolean => {
    return SAFE_POSITIONS.some(([r, c]) => r === row && c === col);
  };

  const isStartCell = (row: number, col: number): boolean => {
    return Object.values(START_POSITIONS).some(([r, c]) => r === row && c === col);
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

  const getPieceColor = (color: string): string => {
    const colors = {
      red: "bg-gradient-to-br from-red-500 to-red-700",
      blue: "bg-gradient-to-br from-blue-500 to-blue-700",
      green: "bg-gradient-to-br from-green-500 to-green-700",
      yellow: "bg-gradient-to-br from-yellow-500 to-yellow-700",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 space-y-6">
      {/* Game Status */}
      <div className="text-center space-y-3">
        <Badge
          className={`px-6 py-3 text-lg font-bold rounded-full ${
            isPlayerTurn 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse" 
              : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
          }`}
        >
          {isPlayerTurn ? "🎮 Your Turn" : `⏳ ${currentPlayer}'s Turn`}
        </Badge>
        
        {gameState.consecutiveSixes > 0 && (
          <Badge className="bg-orange-500 text-white animate-pulse">
            ⚡ Sixes: {gameState.consecutiveSixes}/3
          </Badge>
        )}
      </div>

      {/* Dice Section */}
      {renderDice()}

      {/* Game Board */}
      {renderBoard()}

      {/* Player Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto px-4">
        {Object.entries(gameState.pieces || {}).map(([color, pieces]) => (
          <Card
            key={color}
            className={`border-2 ${
              currentPlayer === color ? "ring-4 ring-yellow-400 animate-pulse" : ""
            }`}
            style={{ borderColor: color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#eab308' }}
          >
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#eab308' }}
                />
                <p className="font-bold capitalize text-white">{color}</p>
                {currentPlayer === color && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
              <div className="text-xs text-gray-200">
                <p>🏠 Home: {pieces.filter(p => p.position === "home").length}/4</p>
                <p>🏃 Active: {pieces.filter(p => p.position === "active").length}/4</p>
                <p>🏆 Finished: {pieces.filter(p => p.position === "finished").length}/4</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
