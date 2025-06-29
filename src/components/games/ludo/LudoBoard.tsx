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

    // Enhanced dice roll animation
    const rollAnimation = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

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
        }, 3000);
      } else {
        toast.info(`You rolled ${finalValue}. Click a piece to move!`);
      }
    }, 1200);
  };

  const checkIfCanMove = (diceVal: number): boolean => {
    const playerPieces = gameState?.pieces?.[playerColor] || [];
    
    return playerPieces.some((piece: any, index: number) => {
      console.log(`Checking piece ${index}:`, piece);
      
      // Can move out of home with a 6
      if (piece.position === "home" && diceVal === 6) {
        console.log(`Piece ${index} can move out of home with 6`);
        return true;
      }
      
      // Can move pieces already on the board (active pieces)
      if (piece.position === "active") {
        const currentPathPosition = piece.pathPosition || 0;
        const newPathPosition = currentPathPosition + diceVal;
        
        // Check if the new position is within the valid range (0-57)
        // 52 is the last position on the main track, 53-57 are home stretch positions
        if (newPathPosition <= 57) {
          console.log(`Piece ${index} can move from ${currentPathPosition} to ${newPathPosition}`);
          return true;
        } else {
          console.log(`Piece ${index} cannot move beyond finish line: ${currentPathPosition} + ${diceVal} = ${newPathPosition}`);
        }
      }
      
      // Pieces that are finished cannot move
      if (piece.position === "finished") {
        console.log(`Piece ${index} is finished and cannot move`);
        return false;
      }
      
      console.log(`Piece ${index} cannot move: position=${piece.position}, pathPosition=${piece.pathPosition}`);
      return false;
    });
  };

  const canMovePiece = (pieceId: number, steps: number): boolean => {
    const piece = gameState?.pieces?.[playerColor]?.[pieceId];
    if (!piece) {
      console.log(`Invalid piece ID: ${pieceId}`);
      return false;
    }

    console.log(`Checking if piece ${pieceId} can move ${steps} steps:`, piece);

    if (piece.position === "finished") {
      console.log(`Piece ${pieceId} is already finished`);
      return false;
    }

    if (piece.position === "home") {
      const canMoveOut = steps === 6;
      console.log(`Piece ${pieceId} in home, can move out: ${canMoveOut} (need 6, got ${steps})`);
      return canMoveOut;
    }

    if (piece.position === "active") {
      const currentPathPosition = piece.pathPosition || 0;
      const newPathPosition = currentPathPosition + steps;
      const canMove = newPathPosition <= 57;
      console.log(`Piece ${pieceId} active at ${currentPathPosition}, can move to ${newPathPosition}: ${canMove}`);
      return canMove;
    }

    console.log(`Piece ${pieceId} in unknown position: ${piece.position}`);
    return false;
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

    console.log(`Attempting to move piece ${pieceId} with dice value ${diceValue}`);

    if (!canMovePiece(pieceId, diceValue)) {
      if (piece.position === "home" && diceValue !== 6) {
        toast.error("Need to roll a 6 to move out of home!");
      } else if (piece.position === "finished") {
        toast.error("This piece has already reached home!");
      } else if (piece.position === "active") {
        const currentPathPosition = piece.pathPosition || 0;
        const newPathPosition = currentPathPosition + diceValue;
        if (newPathPosition > 57) {
          toast.error("Cannot move beyond the finish line!");
        } else {
          toast.error("Invalid move!");
        }
      } else {
        toast.error("Invalid move!");
      }
      return;
    }

    setSelectedPiece(pieceId);
    onMove(playerColor, pieceId, diceValue);
    
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
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="relative">
          {/* 3D Dice Container */}
          <div className="relative transform-gpu">
            <Button
              onClick={rollDice}
              disabled={
                !isPlayerTurn || disabled || isRolling || (diceValue !== null && diceValue !== 6)
              }
              className={`
                w-20 h-20 sm:w-24 sm:h-24 p-0 rounded-2xl border-4 transition-all duration-500 
                shadow-2xl relative overflow-hidden transform-gpu
                ${isPlayerTurn && !disabled && (diceValue === null || diceValue === 6)
                  ? `bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300 
                     hover:scale-110 hover:rotate-6 shadow-lg hover:shadow-2xl
                     active:scale-95 active:rotate-3`
                  : "bg-gradient-to-br from-gray-300 to-gray-500 border-gray-400 cursor-not-allowed opacity-60"
                }
                ${isRolling ? "animate-spin" : ""}
              `}
              style={{
                boxShadow: isRolling 
                  ? "0 20px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8)"
                  : "0 8px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)",
                transform: isRolling ? "rotateX(360deg) rotateY(360deg)" : "rotateX(10deg) rotateY(10deg)",
              }}
            >
              {/* 3D Dice Face */}
              <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-inner">
                <DiceIcon
                  className={`w-8 h-8 sm:w-10 sm:h-10 text-gray-800 drop-shadow-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    ${isRolling ? "animate-pulse" : ""}`}
                />
              </div>
              
              {/* Dice Dots for 3D effect */}
              {!isRolling && diceValue && (
                <div className="absolute inset-2 rounded-lg">
                  {Array.from({ length: diceValue }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-red-600 rounded-full shadow-sm"
                      style={{
                        top: `${20 + (i % 2) * 20}%`,
                        left: `${20 + Math.floor(i / 2) * 20}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </Button>
            
            {/* Glowing result indicator */}
            {diceValue && !isRolling && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-pulse">
                {diceValue}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
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

        let cellColor = "bg-gradient-to-br from-orange-50 to-yellow-50";
        let borderClass = "border border-yellow-200";
        
        if (isCenter) {
          cellColor = "bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400";
          borderClass = "border-2 border-yellow-600 shadow-inner";
        } else if (isHome) {
          cellColor = getHomeColor(row, col);
          borderClass = "border-2 border-white/50 shadow-inner";
        } else if (isPath) {
          cellColor = "bg-gradient-to-br from-orange-50 to-yellow-50";
          borderClass = "border border-yellow-300";
        } else if (isSafe) {
          cellColor = "bg-gradient-to-br from-yellow-100 to-orange-100";
          borderClass = "border-2 border-yellow-400 shadow-inner";
        }

        const pieces = getPiecesAtPosition(row, col);

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${cellColor} ${borderClass} 
              flex items-center justify-center text-xs relative transition-all duration-300 
              hover:scale-105 hover:shadow-md transform-gpu ${isSafe ? "shadow-inner" : ""}`}
            style={{
              boxShadow: isCenter 
                ? "inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(255,193,7,0.3)"
                : isSafe 
                ? "inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(255,193,7,0.2)"
                : "0 1px 2px rgba(0,0,0,0.1)"
            }}
          >
            {isCenter && (
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-800 drop-shadow-sm animate-pulse" />
            )}
            
            {isSafe && (
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 absolute top-0.5 right-0.5 animate-pulse" />
            )}
            
            {isStart && (
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full border border-gray-400 shadow-md animate-pulse" />
            )}
            
            {pieces.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {pieces.map((piece, index) => (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-white 
                      cursor-pointer transition-all duration-300 transform-gpu ${getPieceColor(piece.color)} 
                      ${selectedPiece === piece.id 
                        ? "ring-2 sm:ring-3 ring-yellow-400 ring-offset-1 scale-125 animate-pulse" 
                        : ""
                      } 
                      ${isPlayerTurn && piece.color === playerColor 
                        ? "hover:scale-125 hover:ring-2 hover:ring-blue-400 shadow-lg active:scale-95 hover:animate-pulse" 
                        : ""
                      } shadow-md hover:shadow-lg`}
                    style={{
                      transform: `translate(${index * 2}px, ${index * 2}px) ${selectedPiece === piece.id ? 'scale(1.25)' : ''}`,
                      zIndex: index + 10,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
                  </div>
                ))}
              </div>
            )}
          </div>,
        );
      }
    }

    return (
      <div className="relative flex justify-center px-2 sm:px-4">
        {/* 3D Board Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 to-orange-900 rounded-3xl transform rotate-2 scale-105 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800 to-yellow-800 rounded-2xl transform -rotate-1 scale-102 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-orange-700 rounded-xl transform rotate-0.5 scale-101 opacity-40" />
        
        <div
          className="relative grid gap-0 border-4 border-yellow-700 bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50 rounded-2xl shadow-2xl overflow-hidden transform-gpu"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "min(90vw, 420px)",
            height: "min(90vw, 420px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)",
            transform: "perspective(1000px) rotateX(5deg) rotateY(5deg)",
          }}
        >
          {cells}
          
          {/* 3D Overlay Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-2xl pointer-events-none" />
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
    if (col === 7 && row >= 8 && col <= 13) return true; // Yellow path
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
      return "bg-gradient-to-br from-red-400 via-red-500 to-red-600"; // #e53935
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"; // #1e88e5
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) 
      return "bg-gradient-to-br from-green-400 via-green-500 to-green-600"; // #43a047
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) 
      return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"; // #fdd835
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
      red: "bg-gradient-to-br from-red-500 to-red-700", // #e53935
      blue: "bg-gradient-to-br from-blue-500 to-blue-700", // #1e88e5
      green: "bg-gradient-to-br from-green-500 to-green-700", // #43a047
      yellow: "bg-gradient-to-br from-yellow-500 to-yellow-700", // #fdd835
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-2 sm:p-4 space-y-4 sm:space-y-6 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-30 animate-pulse particle-float" />
        <div className="absolute top-60 right-40 w-3 h-3 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-60 w-5 h-5 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-gradient-to-br from-red-300 to-pink-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Game Status */}
      <div className="text-center space-y-3 relative z-10">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge
            className={`px-4 py-3 text-lg font-bold rounded-full shadow-lg transition-all duration-300 transform-gpu ${
              isPlayerTurn 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse hover:scale-105" 
                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
            }`}
          >
            {isPlayerTurn ? "🎮 Your Turn" : `⏳ ${currentPlayer}'s Turn`}
          </Badge>
          
          <Button
            onClick={() => setShowRules(true)}
            variant="ghost"
            size="sm"
            className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/50 rounded-full px-4 py-2 text-sm transform-gpu hover:scale-105"
          >
            <Info className="h-4 w-4 mr-1" />
            Rules
          </Button>
        </div>

        {isPlayerTurn && (
          <div className="bg-gradient-to-r from-black/30 to-blue-900/30 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block border border-blue-400/30 shadow-lg">
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
      <div className="flex justify-center relative z-10">{renderDice()}</div>

      {/* Game Board */}
      <div className="flex justify-center relative z-10">{renderBoard()}</div>

      {/* Player Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto px-2 relative z-10">
        {Object.entries(gameState?.pieces || {}).map(([color, pieces]) => (
          <Card
            key={color}
            className={`border-3 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform-gpu ${
              currentPlayer === color ? "ring-4 ring-yellow-400 ring-offset-2 scale-105 animate-pulse" : ""
            }`}
            style={{
              borderColor: color === 'red' ? '#e53935' : color === 'blue' ? '#1e88e5' : color === 'green' ? '#43a047' : '#fdd835',
              background: `linear-gradient(135deg, ${color === 'red' ? '#e53935' : color === 'blue' ? '#1e88e5' : color === 'green' ? '#43a047' : '#fdd835'}20, ${color === 'red' ? '#e53935' : color === 'blue' ? '#1e88e5' : color === 'green' ? '#43a047' : '#fdd835'}10)`,
            }}
          >
            <CardContent className="p-4 text-center bg-gradient-to-br from-white/10 to-black/10 backdrop-blur-sm relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-md" 
                  style={{
                    background: `linear-gradient(135deg, ${color === 'red' ? '#e53935' : color === 'blue' ? '#1e88e5' : color === 'green' ? '#43a047' : '#fdd835'}, ${color === 'red' ? '#c62828' : color === 'blue' ? '#1565c0' : color === 'green' ? '#2e7d32' : '#f9a825'})`
                  }}
                />
                <p className="font-bold capitalize text-white text-lg drop-shadow-sm">{color}</p>
                {currentPlayer === color && <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-100 drop-shadow-sm">
                  🏠 Home: {(pieces as any[]).filter((p) => p.position === "home").length}/4
                </p>
                <p className="text-gray-100 drop-shadow-sm">
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
