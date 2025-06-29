import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Info, Crown, Star } from "lucide-react";
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
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Button
            onClick={rollDice}
            disabled={
              !isPlayerTurn || disabled || isRolling || (diceValue !== null && diceValue !== 6)
            }
            className={`w-20 h-20 p-0 rounded-2xl border-4 transition-all duration-300 shadow-2xl relative overflow-hidden ${
              isPlayerTurn && !disabled && (diceValue === null || diceValue === 6)
                ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-yellow-300 hover:scale-110 shadow-yellow-500/50 animate-pulse"
                : "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300 cursor-not-allowed"
            }`}
          >
            {/* Dice background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            
            <DiceIcon
              className={`w-10 h-10 text-white drop-shadow-lg relative z-10 ${
                isRolling ? "animate-spin" : ""
              }`}
            />
            
            {/* Glowing effect when active */}
            {isPlayerTurn && !disabled && (diceValue === null || diceValue === 6) && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0 animate-pulse" />
            )}
          </Button>
          
          {/* Dice value display */}
          {diceValue && !isRolling && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {diceValue}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold text-white bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            {isPlayerTurn ? (diceValue === 6 ? "🎲 Roll Again!" : "🎲 Roll Dice") : "⏳ Wait Turn"}
          </p>
          {consecutiveSixes > 0 && (
            <p className="text-xs text-yellow-300 mt-1 flex items-center justify-center gap-1">
              <span>⚡ Sixes: {consecutiveSixes}/3</span>
            </p>
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

        let cellColor = "bg-gradient-to-br from-amber-50 to-amber-100";
        let borderClass = "border border-amber-200";
        
        if (isCenter) {
          cellColor = "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500";
          borderClass = "border-2 border-yellow-600";
        } else if (isHome) {
          cellColor = getHomeColor(row, col);
          borderClass = "border-2 border-white/50";
        } else if (isPath) {
          cellColor = "bg-gradient-to-br from-white to-gray-50";
          borderClass = "border border-gray-300";
        } else if (isSafe) {
          cellColor = "bg-gradient-to-br from-green-100 to-green-200";
          borderClass = "border-2 border-green-400";
        }

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-7 h-7 ${cellColor} ${borderClass} flex items-center justify-center text-xs relative transition-all duration-200 hover:scale-105 ${
              isSafe ? "shadow-inner" : ""
            }`}
          >
            {/* Center crown */}
            {isCenter && (
              <Crown className="w-4 h-4 text-yellow-800 drop-shadow-sm" />
            )}
            
            {/* Safe zone star */}
            {isSafe && (
              <Star className="w-3 h-3 text-green-600 absolute top-0.5 right-0.5" />
            )}
            
            {/* Start position indicator */}
            {isStart && (
              <div className="w-2 h-2 bg-white rounded-full border border-gray-400 shadow-sm" />
            )}
            
            {/* Game pieces */}
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`w-5 h-5 rounded-full border-3 border-white cursor-pointer transition-all duration-200 ${getPieceColor(piece.color)} ${
                      selectedPiece === piece.id ? "ring-3 ring-yellow-400 ring-offset-1 scale-110" : ""
                    } ${
                      isPlayerTurn && piece.color === playerColor 
                        ? "hover:scale-125 hover:ring-2 hover:ring-blue-400 shadow-lg" 
                        : ""
                    } shadow-md`}
                    style={{
                      transform: `translate(${index * 3}px, ${index * 3}px) ${selectedPiece === piece.id ? 'scale(1.1)' : ''}`,
                      zIndex: index + 10,
                    }}
                  >
                    {/* Piece inner glow */}
                    <div className="absolute inset-0.5 rounded-full bg-white/30" />
                  </div>
                ))}
              </div>
            )}
          </div>,
        );
      }
    }

    return (
      <div className="relative">
        {/* Board shadow and border */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-amber-800 rounded-3xl transform rotate-1 scale-105 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-700 rounded-2xl transform -rotate-0.5 scale-102 opacity-30" />
        
        <div
          className="relative grid gap-0 border-4 border-amber-700 bg-gradient-to-br from-amber-100 to-amber-50 mx-auto rounded-2xl shadow-2xl overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "min(85vw, 420px)",
            height: "min(85vw, 420px)",
          }}
        >
          {cells}
          
          {/* Board inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-2xl pointer-events-none" />
        </div>
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
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) 
      return "bg-gradient-to-br from-red-300 via-red-400 to-red-500";
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500";
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-green-300 via-green-400 to-green-500";
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) 
      return "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500";
    return "bg-gradient-to-br from-gray-200 to-gray-300";
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
      red: "bg-gradient-to-br from-red-500 to-red-700",
      blue: "bg-gradient-to-br from-blue-500 to-blue-700",
      green: "bg-gradient-to-br from-green-500 to-green-700",
      yellow: "bg-gradient-to-br from-yellow-500 to-yellow-700",
    };
    return colors[color as keyof typeof colors] || "bg-gradient-to-br from-gray-500 to-gray-700";
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
              <li>Safe zones (marked with stars) are immune from capture</li>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 space-y-6">
      {/* Game Status */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Badge
            className={`px-6 py-3 text-lg font-bold rounded-full shadow-lg transition-all duration-300 ${
              isPlayerTurn 
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse" 
                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
            }`}
          >
            {isPlayerTurn ? "🎮 Your Turn" : `⏳ ${currentPlayer}'s Turn`}
          </Badge>
          
          <Button
            onClick={() => setShowRules(true)}
            variant="ghost"
            size="sm"
            className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/50 rounded-full px-4 py-2"
          >
            <Info className="h-4 w-4 mr-1" />
            Rules
          </Button>
        </div>

        {isPlayerTurn && (
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block">
            <p className="text-white text-lg font-medium">
              {diceValue === null
                ? "🎲 Roll the dice to start your turn!"
                : diceValue === 6
                ? `🎉 You rolled: ${diceValue} - Roll again or move a piece!`
                : `🎯 You rolled: ${diceValue} - Click a piece to move!`}
            </p>
          </div>
        )}
      </div>

      {/* Dice */}
      <div className="flex justify-center">{renderDice()}</div>

      {/* Game Board */}
      <div className="flex justify-center">{renderBoard()}</div>

      {/* Player Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {Object.entries(gameState?.pieces || {}).map(([color, pieces]) => (
          <Card
            key={color}
            className={`${getPieceColor(color).replace("bg-gradient-to-br", "border-gradient")} border-3 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
              currentPlayer === color ? "ring-4 ring-yellow-400 ring-offset-2 scale-105" : ""
            }`}
          >
            <CardContent className="p-4 text-center bg-gradient-to-br from-white/10 to-black/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${getPieceColor(color)}`} />
                <p className="font-bold capitalize text-white text-lg">{color}</p>
                {currentPlayer === color && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-200">
                  🏠 Home: {(pieces as any[]).filter((p) => p.position === "home").length}/4
                </p>
                <p className="text-gray-200">
                  🏆 Finished: {(pieces as any[]).filter((p) => p.position === "finished").length}/4
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <LudoRulesDialog />
    </div>
  );
};
