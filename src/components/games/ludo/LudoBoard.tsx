import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const SAFE_POSITIONS = [
  [1, 6], [6, 1], [8, 1], [13, 6],
  [13, 8], [8, 13], [6, 13], [1, 8]
];

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
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [showRules, setShowRules] = useState(false);

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

      // Handle consecutive sixes rule
      if (finalValue === 6) {
        const newConsecutiveSixes = consecutiveSixes + 1;
        setConsecutiveSixes(newConsecutiveSixes);
        
        if (newConsecutiveSixes >= 3) {
          toast.info("Three consecutive 6s! Your turn is forfeited.");
          setConsecutiveSixes(0);
          setDiceValue(null);
          // Pass turn to next player
          return;
        }
        
        toast.success("You rolled a 6! You get another turn!");
      } else {
        setConsecutiveSixes(0);
      }

      // Check if any pieces can move
      const canMove = checkIfCanMove(finalValue);
      if (!canMove) {
        toast.info("No valid moves available!");
        setTimeout(() => {
          setDiceValue(null);
          // Pass turn automatically after 3 seconds
        }, 3000);
      } else {
        toast.info(`You rolled ${finalValue}. Click a piece to move!`);
      }
    }, 1000);
  };

  const checkIfCanMove = (diceVal: number): boolean => {
    const playerPieces = gameState?.pieces?.[playerColor] || [];
    
    return playerPieces.some((piece: any, index: number) => {
      // Can move out of home with a 6
      if (piece.position === "home" && diceVal === 6) return true;
      
      // Can move pieces already on the board
      if (piece.position !== "home" && piece.position !== "finished") {
        // Check if the move would be valid (not landing on own piece, etc.)
        return canMovePiece(index, diceVal);
      }
      
      return false;
    });
  };

  const canMovePiece = (pieceId: number, steps: number): boolean => {
    const piece = gameState?.pieces?.[playerColor]?.[pieceId];
    if (!piece) return false;

    // Can't move finished pieces
    if (piece.position === "finished") return false;

    // Can only move out of home with a 6
    if (piece.position === "home") return steps === 6;

    // Check if destination would be valid
    // This is a simplified check - in a full implementation, 
    // you'd calculate the exact destination and check for conflicts
    return true;
  };

  const handlePieceClick = (pieceId: number) => {
    if (!isPlayerTurn || disabled || !diceValue) {
      toast.error("Not your turn or no dice rolled!");
      return;
    }

    const piece = gameState?.pieces?.[playerColor]?.[pieceId];
    if (!piece) {
      toast.error("Invalid piece!");
      return;
    }

    // Check if move is valid
    if (piece.position === "home" && diceValue !== 6) {
      toast.error("Need to roll a 6 to move out of home!");
      return;
    }

    if (piece.position === "finished") {
      toast.error("This piece has already reached home!");
      return;
    }

    if (!canMovePiece(pieceId, diceValue)) {
      toast.error("Invalid move!");
      return;
    }

    setSelectedPiece(pieceId);
    onMove(playerColor, pieceId, diceValue);
    
    // Clear dice value unless it's a 6 (extra turn)
    if (diceValue !== 6) {
      setDiceValue(null);
    }
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
            !isPlayerTurn || disabled || isRolling || (diceValue !== null && diceValue !== 6)
          }
          className={`w-16 h-16 p-2 rounded-lg border-2 transition-all duration-200 ${
            isPlayerTurn && !disabled && (diceValue === null || diceValue === 6)
              ? "bg-gradient-to-br from-purple-500 to-purple-700 border-yellow-400 hover:scale-105 shadow-lg"
              : "bg-gray-600 border-gray-400 cursor-not-allowed"
          }`}
        >
          <DiceIcon
            className={`w-8 h-8 text-white ${isRolling ? "animate-bounce" : ""}`}
          />
        </Button>
        <p className="text-xs font-bold text-white text-center">
          {isPlayerTurn ? (diceValue === 6 ? "Roll Again!" : "Roll Dice") : "Wait Turn"}
        </p>
        {consecutiveSixes > 0 && (
          <p className="text-xs text-yellow-300">
            Sixes: {consecutiveSixes}/3
          </p>
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

        let cellColor = "bg-gray-100";
        if (isCenter) cellColor = "bg-yellow-300";
        else if (isHome) cellColor = getHomeColor(row, col);
        else if (isPath) cellColor = "bg-white";
        else if (isSafe) cellColor = "bg-green-200";

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-6 h-6 border border-gray-300 ${cellColor} flex items-center justify-center text-xs relative ${
              isSafe ? "ring-1 ring-green-500" : ""
            }`}
          >
            {isSafe && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
              </div>
            )}
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform ${getPieceColor(piece.color)} ${
                      selectedPiece === piece.id ? "ring-2 ring-yellow-400" : ""
                    } ${isPlayerTurn && piece.color === playerColor ? "hover:ring-2 hover:ring-blue-400" : ""}`}
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
    return SAFE_POSITIONS.some(([r, c]) => r === row && c === col);
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

  const LudoRulesDialog = () => (
    <Dialog open={showRules} onOpenChange={setShowRules}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-400">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Ludo Game Rules
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-blue-100">
          <div>
            <h3 className="font-bold text-blue-300 mb-2">🎯 Objective</h3>
            <p>Be the first player to move all four tokens from the starting area to the home (center) by circling the board.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-blue-300 mb-2">🧍‍♂️ Players and Setup</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>2-4 players choose colors: Red, Blue, Green, Yellow</li>
              <li>Each player places 4 tokens in their colored base</li>
              <li>Use a die with numbers 1 to 6</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-blue-300 mb-2">🎲 Game Rules</h3>
            
            <h4 className="font-semibold text-blue-200 mt-3 mb-1">1. Starting the Game</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Players take turns in clockwise order</li>
              <li>Must roll a 6 to bring a token out from base</li>
              <li>Rolling a 6 gives you another turn</li>
            </ul>

            <h4 className="font-semibold text-blue-200 mt-3 mb-1">2. Moving Tokens</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Tokens move according to the number rolled</li>
              <li>Only one token can move per roll</li>
              <li>Tokens can jump over others but can't land on same color</li>
            </ul>

            <h4 className="font-semibold text-blue-200 mt-3 mb-1">3. Rolling a 6</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Can move a token out from base</li>
              <li>Get an extra turn</li>
              <li>Three consecutive sixes = forfeit your turn</li>
            </ul>

            <h4 className="font-semibold text-blue-200 mt-3 mb-1">4. Capturing Opponents</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Landing on opponent's token sends it back to base</li>
              <li>Get a bonus roll after capturing</li>
              <li>Safe zones (marked with dots) are immune from capture</li>
            </ul>

            <h4 className="font-semibold text-blue-200 mt-3 mb-1">5. Reaching Home</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Must enter home column and reach center by exact count</li>
              <li>Tokens in home column cannot be captured</li>
              <li>First player to bring all 4 tokens to center wins</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-blue-300 mb-2">🏆 Winning</h3>
            <p>First player to get all 4 tokens to the home wins!</p>
          </div>

          <div>
            <h3 className="font-bold text-blue-300 mb-2">📱 Online Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Timer for each move</li>
              <li>Chat and emoji reactions</li>
              <li>Auto-pass if inactive</li>
              <li>Prize pools and rewards</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge
            className={`px-4 py-2 text-sm font-bold ${
              isPlayerTurn ? "bg-green-500 text-white" : "bg-gray-500 text-white"
            }`}
          >
            {isPlayerTurn ? "Your Turn" : `${currentPlayer}'s Turn`}
          </Badge>
          
          <Button
            onClick={() => setShowRules(true)}
            variant="ghost"
            size="sm"
            className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
          >
            <Info className="h-4 w-4 mr-1" />
            Rules
          </Button>
        </div>

        {isPlayerTurn && (
          <p className="text-white text-sm">
            {diceValue === null
              ? "Roll the dice to start!"
              : diceValue === 6
              ? `You rolled: ${diceValue} - Roll again or move!`
              : `You rolled: ${diceValue} - Click a piece to move!`}
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
            className={`${getPieceColor(color).replace("bg-", "border-")} border-2 ${
              currentPlayer === color ? "ring-2 ring-yellow-400" : ""
            }`}
          >
            <CardContent className="p-2 text-center">
              <p className="font-bold capitalize text-white">{color}</p>
              <p className="text-gray-300 text-xs">
                Home: {(pieces as any[]).filter((p) => p.position === "home").length}/4
              </p>
              <p className="text-gray-300 text-xs">
                Finished: {(pieces as any[]).filter((p) => p.position === "finished").length}/4
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <LudoRulesDialog />
    </div>
  );
};
