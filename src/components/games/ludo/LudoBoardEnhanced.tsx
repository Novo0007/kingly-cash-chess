import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown, Star, Timer, Users, Home, Target } from "lucide-react";
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
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);

  // Modern color palette
  const modernColors = {
    red: "#FF6B6B",
    blue: "#4ECDC4", 
    green: "#45B7D1",
    yellow: "#FFA07A",
    purple: "#98D8C8",
    orange: "#F7DC6F"
  };

  // Turn timer
  useEffect(() => {
    if (!isPlayerTurn || disabled) return;

    const timer = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          toast.error("Time's up! Turn passed.");
          setDiceValue(null);
          setHasRolledThisTurn(false);
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
    setHasRolledThisTurn(false);
  }, [currentPlayer]);

  // Update dice value from game state
  useEffect(() => {
    setDiceValue(gameState.diceValue);
    if (gameState.diceValue) {
      calculateValidMoves(gameState.diceValue);
    }
  }, [gameState.diceValue]);

  const rollDice = useCallback(async () => {
    if (!isPlayerTurn || disabled || isRolling || hasRolledThisTurn) return;

    setIsRolling(true);
    setHasRolledThisTurn(true);

    // Simple dice roll animation
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
        toast.info("No valid moves! Turn passed.");
        setTimeout(() => {
          setDiceValue(null);
          setHasRolledThisTurn(false);
        }, 2000);
      } else {
        toast.success(`Rolled ${finalValue}! Choose a piece to move.`);
      }
    }, 800);
  }, [isPlayerTurn, disabled, isRolling, hasRolledThisTurn]);

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
    if (piece.position === "home") {
      return canMovePieceOut(steps);
    }

    if (piece.position === "finished") {
      return false;
    }

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

      // If not a 6, clear dice and reset turn flags
      if (diceValue !== 6) {
        setDiceValue(null);
        setHasRolledThisTurn(false);
      } else {
        setHasRolledThisTurn(false); // Allow another roll for 6
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
            disabled={!isPlayerTurn || disabled || isRolling || hasRolledThisTurn}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 transition-all duration-200 shadow-lg
              ${isPlayerTurn && !disabled && !hasRolledThisTurn
                ? "bg-white border-blue-300 hover:border-blue-500 hover:scale-105 text-gray-700"
                : "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60 text-gray-400"
              }
            `}
          >
            <DiceIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </Button>
          
          {diceValue && !isRolling && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {diceValue}
            </div>
          )}
        </div>

        {/* Turn timer - mobile friendly */}
        {isPlayerTurn && !disabled && (
          <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            <Timer className="w-3 h-3 text-blue-500" />
            <span className={`font-medium text-sm ${turnTimeLeft <= 10 ? "text-red-500" : "text-gray-700"}`}>
              {turnTimeLeft}s
            </span>
          </div>
        )}

        {/* Status message - simplified */}
        <div className="text-center">
          {isRolling && (
            <p className="text-blue-600 font-medium text-sm">Rolling...</p>
          )}
          {!isRolling && isPlayerTurn && !hasRolledThisTurn && (
            <p className="text-green-600 font-medium text-sm">Your Turn - Roll Dice!</p>
          )}
          {!isRolling && isPlayerTurn && diceValue && validMoves.length > 0 && (
            <p className="text-blue-600 font-medium text-sm">Choose a piece to move</p>
          )}
          {!isPlayerTurn && (
            <p className="text-gray-500 text-sm">Waiting for {currentPlayer}...</p>
          )}
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

        let cellColor = "bg-gray-50";
        let borderClass = "border border-gray-200";
        
        if (isCenter) {
          cellColor = "bg-gradient-to-br from-yellow-300 to-yellow-400";
          borderClass = "border-2 border-yellow-500";
        } else if (isHome) {
          cellColor = getModernHomeColor(row, col);
          borderClass = "border-2 border-white";
        } else if (isSafe) {
          cellColor = "bg-gradient-to-br from-green-100 to-green-200";
          borderClass = "border-2 border-green-400";
        } else if (isPath) {
          cellColor = "bg-white";
          borderClass = "border border-gray-300";
        }

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-6 h-6 sm:w-7 sm:h-7 ${cellColor} ${borderClass} flex items-center justify-center relative ${
              isSafe ? "shadow-sm" : ""
            }`}
          >
            {isCenter && <Crown className="w-4 h-4 text-yellow-700" />}
            {isSafe && !isCenter && <Star className="w-3 h-3 text-green-600 absolute top-0.5 right-0.5" />}
            {isStart && <div className="w-2 h-2 bg-white rounded-full border border-gray-400" />}
            
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={`${piece.color}-${piece.id}`}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`
                      w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white cursor-pointer transition-all duration-200
                      ${getModernPieceColor(piece.color)}
                      ${selectedPiece === piece.id ? "ring-2 ring-blue-400 scale-110" : ""}
                      ${validMoves.includes(piece.id) ? "ring-2 ring-green-400" : ""}
                      ${piece.color === playerColor && isPlayerTurn ? "hover:scale-110 shadow-md" : ""}
                      shadow-sm
                    `}
                    style={{
                      transform: `translate(${index * 1.5}px, ${index * 1.5}px)`,
                      zIndex: index + 10,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }
    }

    return (
      <div className="flex justify-center p-2 sm:p-4">
        <div
          className="grid gap-0 border-4 border-gray-300 bg-white rounded-xl shadow-xl"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "min(90vw, 380px)",
            height: "min(90vw, 380px)",
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

  const getModernHomeColor = (row: number, col: number): string => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) 
      return `bg-gradient-to-br from-red-200 to-red-300`;
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) 
      return `bg-gradient-to-br from-cyan-200 to-cyan-300`;
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) 
      return `bg-gradient-to-br from-blue-200 to-blue-300`;
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) 
      return `bg-gradient-to-br from-orange-200 to-orange-300`;
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

  const getModernPieceColor = (color: string): string => {
    const colors = {
      red: "bg-red-500",
      blue: "bg-cyan-500", 
      green: "bg-blue-500",
      yellow: "bg-orange-500",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 space-y-4 sm:space-y-6">
      {/* Game Status - Mobile optimized */}
      <div className="text-center space-y-2 px-4">
        <Badge
          className={`px-4 py-2 text-base font-semibold rounded-full ${
            isPlayerTurn 
              ? "bg-green-500 text-white" 
              : "bg-gray-400 text-white"
          }`}
        >
          {isPlayerTurn ? "🎮 Your Turn" : `⏳ ${currentPlayer}'s Turn`}
        </Badge>
      </div>

      {/* Dice Section */}
      {renderDice()}

      {/* Game Board */}
      {renderBoard()}

      {/* Player Status - Mobile grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto px-4">
        {Object.entries(gameState.pieces || {}).map(([color, pieces]) => (
          <Card
            key={color}
            className={`border-2 rounded-lg ${
              currentPlayer === color ? "ring-2 ring-blue-400" : ""
            }`}
            style={{ borderColor: modernColors[color as keyof typeof modernColors] }}
          >
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: modernColors[color as keyof typeof modernColors] }}
                />
                <p className="font-semibold capitalize text-gray-700 text-sm">{color}</p>
                {currentPlayer === color && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    {pieces.filter(p => p.position === "home").length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {pieces.filter(p => p.position === "active").length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {pieces.filter(p => p.position === "finished").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
