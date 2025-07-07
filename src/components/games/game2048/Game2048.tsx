import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Game2048Board } from "./Game2048Board";
import { Game2048Lobby } from "./Game2048Lobby";
import { Game2048Rules } from "./Game2048Rules";
import { Game2048Leaderboard } from "./Game2048Leaderboard";
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
  Share2,
  RotateCcw,
  Play,
  Pause,
  Home,
} from "lucide-react";
import { Game2048Logic, Game2048State, Game2048Score } from "./Game2048Logic";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface Game2048Props {
  onBack: () => void;
  user: any;
}

type GameView = "lobby" | "game" | "rules" | "leaderboard" | "gameComplete";

export const Game2048: React.FC<Game2048Props> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameLogic, setGameLogic] = useState<Game2048Logic | null>(null);
  const [gameState, setGameState] = useState<Game2048State | null>(null);
  const [currentScore, setCurrentScore] = useState<Game2048Score | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Initialize game2048_scores table if it doesn't exist
  useEffect(() => {
    const initializeGame2048Table = async () => {
      try {
        // Check if game2048_scores table exists by trying a simple query
        const { error } = await supabase
          .from("game2048_scores")
          .select("id")
          .limit(1);

        if (error && error.message.includes("does not exist")) {
          console.log(
            "game2048_scores table doesn't exist. Please run migration.",
          );
          toast.error("Database setup required. Please contact support.");
        }
      } catch (error) {
        console.error("Error checking game2048_scores table:", error);
      }
    };

    initializeGame2048Table();
  }, []);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      gameState &&
      currentView === "game" &&
      !isGamePaused &&
      gameState.gameStatus === "playing"
    ) {
      interval = setInterval(() => {
        setGameTimer(Date.now() - gameState.startTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, currentView, isGamePaused]);

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartGame = useCallback(
    (difficulty: "classic" | "challenge" | "expert") => {
      const logic = new Game2048Logic(difficulty);
      setGameLogic(logic);
      setGameState(logic.getState());
      setCurrentView("game");
      setGameTimer(0);
      setIsGamePaused(false);
      toast.success(`Started ${difficulty} mode! Good luck! 🎯`);
    },
    [],
  );

  const handleMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!gameLogic || !gameState || isGamePaused) return;

      const moved = gameLogic.move(direction);
      if (moved) {
        const newState = gameLogic.getState();
        setGameState(newState);

        // Check for game end
        if (newState.gameStatus === "won") {
          toast.success(
            `🎉 Congratulations! You reached ${newState.targetTile}!`,
          );
          handleGameEnd(newState);
        } else if (newState.gameStatus === "lost") {
          toast.error("Game Over! No more moves available.");
          handleGameEnd(newState);
        }
      }
    },
    [gameLogic, gameState, isGamePaused],
  );

  const handleContinueGame = useCallback(() => {
    if (!gameLogic) return;

    gameLogic.continueGame();
    const newState = gameLogic.getState();
    setGameState(newState);
    toast.info("Keep going! Try to reach an even higher score! 🚀");
  }, [gameLogic]);

  const handleGameEnd = async (finalState: Game2048State) => {
    if (!user) {
      toast.error("Please sign in to save your score!");
      return;
    }

    setIsSubmittingScore(true);
    try {
      const scoreData = gameLogic!.calculateFinalScore();
      scoreData.user_id = user.id;
      scoreData.username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Anonymous";

      const { data, error } = await supabase
        .from("game2048_scores")
        .insert([scoreData])
        .select()
        .single();

      if (error) {
        console.error("Error saving score:", error);
        toast.error("Failed to save score. Please try again.");
      } else {
        setCurrentScore(data);
        toast.success("Score saved successfully! 🏆");
      }
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("Failed to save score. Please try again.");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleRestartGame = useCallback(() => {
    if (!gameLogic) return;

    const newState = gameLogic.restart();
    setGameState(newState);
    setGameTimer(0);
    setIsGamePaused(false);
    toast.success("Game restarted! 🎮");
  }, [gameLogic]);

  const handlePauseGame = useCallback(() => {
    setIsGamePaused(!isGamePaused);
    toast.info(isGamePaused ? "Game resumed! ▶️" : "Game paused! ⏸️");
  }, [isGamePaused]);

  const renderGameStats = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-semibold">Score</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.score.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-semibold">Best</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.bestScore.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-semibold">Time</span>
            </div>
            <div className="text-xl font-bold">{formatTime(gameTimer)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-semibold">Moves</span>
            </div>
            <div className="text-xl font-bold">{gameState.moves}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGameControls = () => {
    if (!gameState) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <Button
          onClick={handleRestartGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          New Game
        </Button>

        <Button
          onClick={handlePauseGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isGamePaused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </Button>

        <Button
          onClick={() => setCurrentView("lobby")}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Lobby
        </Button>

        {gameState.gameStatus === "won" && (
          <Button
            onClick={handleContinueGame}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 flex items-center gap-2"
            size="sm"
          >
            <Sparkles className="h-4 w-4" />
            Continue Playing
          </Button>
        )}
      </div>
    );
  };

  if (currentView === "lobby") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            🆓 Free to Play
          </Badge>
        </div>

        <Game2048Lobby
          onStartGame={handleStartGame}
          onShowRules={() => setCurrentView("rules")}
          onShowLeaderboard={() => setCurrentView("leaderboard")}
        />
      </div>
    );
  }

  if (currentView === "rules") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        <Game2048Rules />
      </div>
    );
  }

  if (currentView === "leaderboard") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        <Game2048Leaderboard
          currentUserScore={currentScore}
          onRefresh={() => {
            // Refresh leaderboard data
            toast.success("Leaderboard refreshed! 📊");
          }}
        />
      </div>
    );
  }

  if (currentView === "game" && gameState) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setCurrentView("lobby")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lobby
            </Button>
            <Badge
              className={`
              ${gameState.difficulty === "classic" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
              ${gameState.difficulty === "challenge" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
              ${gameState.difficulty === "expert" ? "bg-red-100 text-red-800 border-red-200" : ""}
            `}
            >
              {gameState.difficulty} Mode • Target: {gameState.targetTile}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {gameState.gameStatus === "won" && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse">
                <Crown className="h-3 w-3 mr-1" />
                Winner!
              </Badge>
            )}
            {gameState.gameStatus === "lost" && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Game Over
              </Badge>
            )}
            {isSubmittingScore && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Saving...
              </Badge>
            )}
          </div>
        </div>

        {/* Game Stats */}
        {renderGameStats()}

        {/* Game Board */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 flex justify-center">
            <Game2048Board
              gameState={gameState}
              onMove={handleMove}
              className={isGamePaused ? "opacity-50 pointer-events-none" : ""}
            />
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Game Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Game Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <Badge className="text-xs">{gameState.difficulty}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Board Size:</span>
                  <span className="text-sm font-semibold">
                    {gameState.boardSize}×{gameState.boardSize}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target Tile:</span>
                  <span className="text-sm font-semibold">
                    {gameState.targetTile}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Highest Tile:</span>
                  <span className="text-sm font-semibold">
                    {Math.max(
                      ...gameLogic!.getAllTiles().map((t) => t.value),
                    ) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setCurrentView("leaderboard")}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
                <Button
                  onClick={() => setCurrentView("rules")}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Game Rules
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Controls */}
        {renderGameControls()}

        {/* Pause Overlay */}
        {isGamePaused && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="w-80 max-w-[90vw]">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Pause className="h-6 w-6" />
                  Game Paused
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Your game is paused. Click resume to continue playing.
                </p>
                <Button onClick={handlePauseGame} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Resume Game
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return null;
};
