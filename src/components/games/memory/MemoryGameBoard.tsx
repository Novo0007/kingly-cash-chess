import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Home,
  Timer,
  Target,
  AlertTriangle,
  Trophy,
  Clock,
  Zap,
} from "lucide-react";
import { MemoryGameLogic, MemoryGameState, Card as GameCard } from "./MemoryGameLogic";
import { useDeviceType } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface MemoryGameBoardProps {
  gameLogic: MemoryGameLogic;
  gameState: MemoryGameState;
  onGameComplete: (score: any) => void;
  onBack: () => void;
  onRestart: () => void;
}

export const MemoryGameBoard: React.FC<MemoryGameBoardProps> = ({
  gameLogic,
  gameState,
  onGameComplete,
  onBack,
  onRestart,
}) => {
  const { isMobile } = useDeviceType();
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastGameState, setLastGameState] = useState<MemoryGameState>(gameState);

  const difficultyInfo = gameLogic.getDifficultyInfo();

  useEffect(() => {
    // Check if game just completed
    if (gameState.isGameOver && !lastGameState.isGameOver) {
      if (gameState.isWon) {
        toast.success("🎉 Congratulations! You won!");
      } else if (gameState.isEliminated) {
        toast.error(`Game Over: ${gameState.eliminationReason}`);
      }
      
      setTimeout(() => {
        onGameComplete(gameLogic.getScore());
      }, 1500);
    }
    
    setLastGameState(gameState);
  }, [gameState, lastGameState, gameLogic, onGameComplete]);

  const handleCardClick = async (cardId: number) => {
    if (isFlipping || gameState.isGameOver) return;

    setIsFlipping(true);
    const success = gameLogic.flipCard(cardId);
    
    if (success) {
      // Add a small delay for flip animation
      setTimeout(() => {
        setIsFlipping(false);
      }, 300);
    } else {
      setIsFlipping(false);
    }
  };

  const getCardSize = () => {
    const { rows, cols } = gameState.gridSize;
    
    if (isMobile) {
      if (cols <= 3) return "w-16 h-16 sm:w-20 sm:h-20";
      if (cols <= 4) return "w-12 h-12 sm:w-16 sm:h-16";
      return "w-10 h-10 sm:w-12 sm:h-12";
    } else {
      if (cols <= 3) return "w-24 h-24 lg:w-28 lg:h-28";
      if (cols <= 4) return "w-20 h-20 lg:w-24 lg:h-24";
      return "w-16 h-16 lg:w-20 lg:h-20";
    }
  };

  const getGridCols = () => {
    const { cols } = gameState.gridSize;
    return `grid-cols-${cols}`;
  };

  const getProgressPercentage = () => {
    return (gameState.matchedPairs / gameState.totalPairs) * 100;
  };

  const getTimeColor = () => {
    const timeLimit = difficultyInfo.config.timeLimit;
    const percentage = (gameState.timeElapsed / timeLimit) * 100;
    
    if (percentage < 50) return "text-green-600";
    if (percentage < 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getMovesColor = () => {
    const maxMoves = difficultyInfo.config.maxMoves;
    const percentage = (gameState.moves / maxMoves) * 100;
    
    if (percentage < 50) return "text-green-600";
    if (percentage < 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <div>
              <div className={`font-bold ${getMovesColor()}`}>{gameState.moves}</div>
              <div className="text-xs text-gray-500">
                Moves ({difficultyInfo.config.maxMoves} max)
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${getTimeColor()}`} />
            <div>
              <div className={`font-bold ${getTimeColor()}`}>
                {gameState.timeElapsed}s
              </div>
              <div className="text-xs text-gray-500">
                Time ({difficultyInfo.config.timeLimit}s max)
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-bold text-purple-600">
                {gameState.matchedPairs}/{gameState.totalPairs}
              </div>
              <div className="text-xs text-gray-500">Pairs</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div>
              <div className="font-bold text-red-600">
                {gameState.wrongMoves}/{difficultyInfo.config.maxWrongMoves}
              </div>
              <div className="text-xs text-gray-500">Wrong</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </Card>

      {/* Game Board */}
      <Card className="p-4 sm:p-6">
        <div className="flex justify-center">
          <div
            className={`grid ${getGridCols()} gap-2 sm:gap-3 justify-center`}
            style={{
              gridTemplateColumns: `repeat(${gameState.gridSize.cols}, minmax(0, 1fr))`,
            }}
          >
            {gameState.cards.map((card) => (
              <MemoryCard
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card.id)}
                isDisabled={isFlipping || gameState.isGameOver}
                size={getCardSize()}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onRestart}
          variant="outline"
          className="gap-2"
          disabled={gameState.isGameOver}
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <Home className="w-4 h-4" />
          Back to Lobby
        </Button>
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              {gameState.isWon ? (
                <Trophy className="w-8 h-8 text-white" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {gameState.isWon ? "You Won!" : "Game Over"}
              </h3>
              {gameState.eliminationReason && (
                <p className="text-gray-600 mb-4">{gameState.eliminationReason}</p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Moves:</span>
                <Badge variant="outline">{gameState.moves}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <Badge variant="outline">{gameState.timeElapsed}s</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pairs Found:</span>
                <Badge variant="outline">{gameState.matchedPairs}/{gameState.totalPairs}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface MemoryCardProps {
  card: GameCard;
  onClick: () => void;
  isDisabled: boolean;
  size: string;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  onClick,
  isDisabled,
  size,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isDisabled) return;
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick();
  };

  return (
    <div
      className={`${size} perspective-1000 cursor-pointer ${
        isDisabled ? "pointer-events-none" : ""
      }`}
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-preserve-3d ${
          card.isFlipped || card.isMatched ? "rotate-y-180" : ""
        } ${isAnimating ? "scale-105" : ""}`}
      >
        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="text-white text-lg font-bold">?</div>
          </Card>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <Card 
            className={`w-full h-full flex items-center justify-center border-2 shadow-lg transition-all duration-200 ${
              card.isMatched 
                ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300" 
                : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
            }`}
          >
            <div className="text-2xl">{card.symbol}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add CSS for 3D flip effect
const styles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
