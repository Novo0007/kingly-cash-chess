import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

interface LudoBoardProps {
  gameState: any;
  onMove: (playerId: string, pieceId: number, steps: number) => void;
  playerColor: "red" | "blue" | "green" | "yellow";
  currentPlayer: string;
  isPlayerTurn: boolean;
  disabled?: boolean;
}

const BOARD_SIZE = 15;
const HOME_POSITIONS = {
  red: [1, 1],
  blue: [1, 13],
  green: [13, 13],
  yellow: [13, 1],
};

const START_POSITIONS = {
  red: [6, 1],
  blue: [1, 8],
  green: [8, 13],
  yellow: [13, 6],
};

const WINNING_POSITIONS = {
  red: [7, 7],
  blue: [7, 7],
  green: [7, 7],
  yellow: [7, 7],
};

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  onMove,
  playerColor,
  currentPlayer,
  isPlayerTurn,
  disabled = false,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (!isPlayerTurn || disabled || isRolling) return;

    setIsRolling(true);

    // Animate dice roll
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setIsRolling(false);

      // Check if any pieces can move
      const canMove = checkIfCanMove(finalValue);
      if (!canMove) {
        toast.info("No valid moves available!");
        setTimeout(() => {
          setDiceValue(null);
          // Pass turn to next player
        }, 2000);
      }
    }, 1000);
  };

  const checkIfCanMove = (diceVal: number): boolean => {
    const playerPieces = gameState?.pieces?.[playerColor] || [];
    return playerPieces.some((piece: any) => {
      if (piece.position === "home" && diceVal === 6) return true;
      if (piece.position !== "home" && piece.position !== "finished")
        return true;
      return false;
    });
  };

  const handlePieceClick = (pieceId: number) => {
    if (!isPlayerTurn || disabled || !diceValue) return;

    const piece = gameState?.pieces?.[playerColor]?.[pieceId];
    if (!piece) return;

    // Check if move is valid
    if (piece.position === "home" && diceValue !== 6) {
      toast.error("Need 6 to move out of home!");
      return;
    }

    setSelectedPiece(pieceId);
    onMove(playerColor, pieceId, diceValue);
    setDiceValue(null);
    setSelectedPiece(null);
  };

  const renderDice = () => {
    const DiceIcon = {
      1: Dice1,
      2: Dice2,
      3: Dice3,
      4: Dice4,
      5: Dice5,
      6: Dice6,
    }[diceValue || 1];

    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={rollDice}
          disabled={
            !isPlayerTurn || disabled || isRolling || diceValue !== null
          }
          className={`w-16 h-16 p-2 rounded-lg border-2 transition-all duration-200 ${
            isPlayerTurn && !disabled && diceValue === null
              ? "bg-gradient-to-br from-purple-500 to-purple-700 border-yellow-400 hover:scale-105 shadow-lg"
              : "bg-gray-600 border-gray-400 cursor-not-allowed"
          }`}
        >
          <DiceIcon
            className={`w-8 h-8 text-white ${isRolling ? "animate-bounce" : ""}`}
          />
        </Button>
        <p className="text-xs font-bold text-white">
          {isPlayerTurn ? "Roll Dice" : "Wait Turn"}
        </p>
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

        let cellColor = "bg-gray-100";
        if (isCenter) cellColor = "bg-yellow-300";
        else if (isHome) cellColor = getHomeColor(row, col);
        else if (isPath) cellColor = "bg-white";
        else if (isSafe) cellColor = "bg-green-200";

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-6 h-6 border border-gray-300 ${cellColor} flex items-center justify-center text-xs relative`}
          >
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform ${getPieceColor(piece.color)} ${
                      selectedPiece === piece.id ? "ring-2 ring-yellow-400" : ""
                    }`}
                    style={{
                      transform: `translate(${index * 2}px, ${index * 2}px)`,
                      zIndex: index + 1,
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
        className="grid gap-0 border-2 border-gray-800 bg-gray-200 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: "min(90vw, 400px)",
          height: "min(90vw, 400px)",
        }}
      >
        {cells}
      </div>
    );
  };

  const isPathCell = (row: number, col: number): boolean => {
    // Main paths
    if ((row === 6 || row === 8) && col >= 0 && col <= 14) return true;
    if ((col === 6 || col === 8) && row >= 0 && row <= 14) return true;
    // Colored paths to center
    if (row === 7 && col >= 1 && col <= 6) return true; // Red path
    if (row === 7 && col >= 8 && col <= 13) return true; // Green path
    if (col === 7 && row >= 1 && row <= 6) return true; // Blue path
    if (col === 7 && row >= 8 && row <= 13) return true; // Yellow path
    return false;
  };

  const isHomeArea = (row: number, col: number): boolean => {
    // Red home
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return true;
    // Blue home
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return true;
    // Green home
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return true;
    // Yellow home
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return true;
    return false;
  };

  const getHomeColor = (row: number, col: number): string => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return "bg-red-200";
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return "bg-blue-200";
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return "bg-green-200";
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return "bg-yellow-200";
    return "bg-gray-100";
  };

  const isSafeCell = (row: number, col: number): boolean => {
    const safeCells = [
      [1, 6],
      [6, 1],
      [8, 1],
      [13, 6],
      [13, 8],
      [8, 13],
      [6, 13],
      [1, 8],
    ];
    return safeCells.some(([r, c]) => r === row && c === col);
  };

  const isStartCell = (row: number, col: number): boolean => {
    return Object.values(START_POSITIONS).some(
      ([r, c]) => r === row && c === col,
    );
  };

  const getPiecesAtPosition = (row: number, col: number) => {
    const pieces: any[] = [];
    Object.entries(gameState?.pieces || {}).forEach(
      ([color, colorPieces]: [string, any]) => {
        (colorPieces as any[]).forEach((piece, index) => {
          if (piece.row === row && piece.col === col) {
            pieces.push({ ...piece, id: index, color });
          }
        });
      },
    );
    return pieces;
  };

  const getPieceColor = (color: string): string => {
    const colors = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="text-center space-y-2">
        <Badge
          className={`px-4 py-2 text-sm font-bold ${
            isPlayerTurn ? "bg-green-500 text-white" : "bg-gray-500 text-white"
          }`}
        >
          {isPlayerTurn ? "Your Turn" : `${currentPlayer}'s Turn`}
        </Badge>

        {isPlayerTurn && (
          <p className="text-white text-sm">
            {diceValue === null
              ? "Roll the dice to start!"
              : `You rolled: ${diceValue}`}
          </p>
        )}
      </div>

      {/* Dice */}
      <div className="flex justify-center">{renderDice()}</div>

      {/* Game Board */}
      <div className="flex justify-center">{renderBoard()}</div>

      {/* Player Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {Object.entries(gameState?.pieces || {}).map(([color, pieces]) => (
          <Card
            key={color}
            className={`${getPieceColor(color).replace("bg-", "border-")} border-2`}
          >
            <CardContent className="p-2 text-center">
              <p className="font-bold capitalize text-white">{color}</p>
              <p className="text-gray-300">
                {
                  (pieces as any[]).filter((p) => p.position === "finished")
                    .length
                }
                /4 Home
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
