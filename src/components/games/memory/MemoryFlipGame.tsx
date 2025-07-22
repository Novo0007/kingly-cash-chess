import React, { useState, useEffect } from "react";
import { MemoryGameBoard } from "./MemoryGameBoard";
import { MemoryLobby } from "./MemoryLobby";
import { MemoryRules } from "./MemoryRules";
import { MemoryLeaderboard } from "./MemoryLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Star,
  Timer,
  Target,
  Crown,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Home,
  Brain,
  TrendingUp,
  Zap,
} from "lucide-react";
import { MemoryGameLogic, MemoryGameState, MemoryGameScore } from "./MemoryGameLogic";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface MemoryFlipGameProps {
  onBack: () => void;
  user: any;
}

type GameView = "lobby" | "game" | "rules" | "leaderboard" | "gameComplete";
type DifficultyLevel = "easy" | "medium" | "hard";

export const MemoryFlipGame: React.FC<MemoryFlipGameProps> = ({
  onBack,
  user,
}) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameLogic, setGameLogic] = useState<MemoryGameLogic | null>(null);
  const [gameState, setGameState] = useState<MemoryGameState | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("easy");

  const handleStartGame = (difficulty: DifficultyLevel) => {
    setDifficultyLevel(difficulty);
    const logic = new MemoryGameLogic(difficulty);
    setGameLogic(logic);
    setGameState(logic.getGameState());
    setCurrentView("game");
  };

  const handleBackToLobby = () => {
    setCurrentView("lobby");
    setGameLogic(null);
    setGameState(null);
  };

  const handleGameComplete = (score: MemoryGameScore) => {
    toast.success(`Game Complete! Moves: ${score.moves}, Time: ${score.timeElapsed}s`);
    setCurrentView("gameComplete");
  };

  const handleRestart = () => {
    if (gameLogic) {
      gameLogic.restart();
      setGameState(gameLogic.getGameState());
    }
  };

  useEffect(() => {
    if (gameLogic) {
      const updateGameState = () => {
        setGameState(gameLogic.getGameState());
      };

      // Subscribe to game state changes
      const interval = setInterval(updateGameState, 100);
      return () => clearInterval(interval);
    }
  }, [gameLogic]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "lobby":
        return (
          <MemoryLobby
            onStartGame={handleStartGame}
            onShowRules={() => setCurrentView("rules")}
            onShowLeaderboard={() => setCurrentView("leaderboard")}
          />
        );
      case "game":
        return gameLogic && gameState ? (
          <MemoryGameBoard
            gameLogic={gameLogic}
            gameState={gameState}
            onGameComplete={handleGameComplete}
            onBack={handleBackToLobby}
            onRestart={handleRestart}
          />
        ) : null;
      case "rules":
        return (
          <MemoryRules
            onStartGame={() => setCurrentView("lobby")}
            onBack={() => setCurrentView("lobby")}
          />
        );
      case "leaderboard":
        return (
          <MemoryLeaderboard
            onBack={() => setCurrentView("lobby")}
            user={user}
          />
        );
      case "gameComplete":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Congratulations!
              </h1>
              <p className="text-lg text-gray-600">
                You've completed the Memory Flip Game!
              </p>
              {gameState && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Moves:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                      {gameState.moves}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      {gameState.timeElapsed}s
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${difficultyLevel === "easy" ? "bg-green-50 text-green-600" : ""}
                        ${difficultyLevel === "medium" ? "bg-yellow-50 text-yellow-600" : ""}
                        ${difficultyLevel === "hard" ? "bg-red-50 text-red-600" : ""}
                      `}
                    >
                      {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleStartGame(difficultyLevel)} className="gap-2">
                <Play className="w-4 h-4" />
                Play Again
              </Button>
              <Button onClick={handleBackToLobby} variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Lobby
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && <span>Back</span>}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-gray-900 ${isMobile ? "text-lg" : "text-2xl"}`}>
                  Memory Flip
                </h1>
                <p className={`text-gray-500 ${isMobile ? "text-xs" : "text-sm"}`}>
                  Test your memory skills
                </p>
              </div>
            </div>
          </div>

          {/* Stats Display - Only show during game */}
          {currentView === "game" && gameState && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{gameState.moves}</div>
                <div className="text-xs text-gray-500">Moves</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">{gameState.timeElapsed}s</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{gameState.matchedPairs}</div>
                <div className="text-xs text-gray-500">Pairs</div>
              </div>
            </div>
          )}
        </div>

        {/* Game Content */}
        <div className="space-y-6">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};
