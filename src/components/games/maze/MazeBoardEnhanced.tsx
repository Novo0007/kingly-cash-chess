import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RefreshCw,
  Trophy,
  Timer,
  Target,
  Zap,
  Crown,
  Star,
} from "lucide-react";
import { MazeGameState, MazeGameLogic, Position } from "./MazeGameLogic";
import { useDeviceType } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface MazeBoardEnhancedProps {
  gameState: MazeGameState;
  onGameComplete: (score: number, timeTaken: number) => void;
  onGameReset: () => void;
  disabled?: boolean;
}

export const MazeBoardEnhanced: React.FC<MazeBoardEnhancedProps> = ({
  gameState,
  onGameComplete,
  onGameReset,
  disabled = false,
}) => {
  const { isMobile } = useDeviceType();
  const [gameTimer, setGameTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [moves, setMoves] = useState(0);
  const [trail, setTrail] = useState<Position[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.gameStatus === "playing" && !isPaused) {
      interval = setInterval(() => {
        setGameTimer(Date.now() - gameState.startTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.gameStatus, gameState.startTime, isPaused]);

  // Add current position to trail
  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      setTrail((prev) => {
        const newTrail = [...prev, gameState.playerPosition];
        // Keep only last 10 positions to avoid performance issues
        return newTrail.slice(-10);
      });
    }
  }, [gameState.playerPosition, gameState.gameStatus]);

  // Keyboard controls
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || gameState.gameStatus !== "playing" || isPaused) return;

      const direction = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      }[event.key.toLowerCase()];

      if (direction) {
        event.preventDefault();
        handleMove(direction as "up" | "down" | "left" | "right");
      }

      if (event.key === " ") {
        event.preventDefault();
        setIsPaused(!isPaused);
      }
    },
    [disabled, gameState.gameStatus, gameState.playerPosition, isPaused],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    const newPosition = MazeGameLogic.canMoveTo(
      gameState.maze,
      gameState.playerPosition,
      direction,
    );

    if (newPosition) {
      // Update game state with new position
      gameState.playerPosition = newPosition;
      setMoves((prev) => prev + 1);

      // Check if game is complete
      if (MazeGameLogic.isGameComplete(newPosition, gameState.endPosition)) {
        const timeTaken = Date.now() - gameState.startTime;
        const finalScore = MazeGameLogic.calculateScore(gameState, timeTaken);
        gameState.gameStatus = "completed";
        gameState.endTime = Date.now();

        toast.success("🎉 Maze Completed!", {
          description: `Time: ${(timeTaken / 1000).toFixed(1)}s • Score: ${finalScore} • Moves: ${moves + 1}`,
        });

        onGameComplete(finalScore, timeTaken);
      }
    }
  };

  const getCellClasses = (x: number, y: number) => {
    const cell = gameState.maze[y][x];
    const isPlayer =
      gameState.playerPosition.x === x && gameState.playerPosition.y === y;
    const isStart =
      gameState.startPosition.x === x && gameState.startPosition.y === y;
    const isEnd =
      gameState.endPosition.x === x && gameState.endPosition.y === y;
    const isInTrail = trail.some((pos) => pos.x === x && pos.y === y);

    let classes = "transition-all duration-200 ";

    if (cell.isWall) {
      classes +=
        "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700";
    } else {
      classes +=
        "bg-gradient-to-br from-blue-50 to-white border border-blue-100";
    }

    if (isPlayer) {
      classes +=
        " bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-300 shadow-lg scale-110 animate-pulse";
    } else if (isEnd) {
      classes +=
        " bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300 animate-bounce";
    } else if (isStart) {
      classes +=
        " bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300";
    } else if (isInTrail && !cell.isWall) {
      classes +=
        " bg-gradient-to-br from-green-100 to-green-200 border border-green-200";
    }

    return classes;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    }
    return `${remainingSeconds}.${centiseconds.toString().padStart(2, "0")}s`;
  };

  const getDifficultyColor = () => {
    switch (gameState.difficulty) {
      case "easy":
        return "from-green-500 to-emerald-600";
      case "medium":
        return "from-yellow-500 to-orange-600";
      case "hard":
        return "from-red-500 to-rose-600";
    }
  };

  const cellSize = isMobile
    ? Math.max(8, Math.min(12, 280 / gameState.size))
    : Math.max(12, Math.min(16, 400 / gameState.size));

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-xl">
      <CardContent className="p-4 md:p-6">
        {/* Game Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 bg-gradient-to-r ${getDifficultyColor()} rounded-xl text-white shadow-lg`}
            >
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🧩 Maze Challenge
                <Badge
                  className={`bg-gradient-to-r ${getDifficultyColor()} text-white border-0`}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  {gameState.difficulty.toUpperCase()}
                </Badge>
              </h3>
              <p className="text-sm text-gray-600">
                Size: {gameState.size}×{gameState.size} • Target Score:{" "}
                {gameState.score}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
              size="sm"
              disabled={gameState.gameStatus !== "playing"}
              className="flex items-center gap-2"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={onGameReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 border border-blue-200 text-center">
            <Timer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">
              {formatTime(gameTimer)}
            </div>
            <div className="text-xs text-gray-600">Time</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
            <Zap className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">{moves}</div>
            <div className="text-xs text-gray-600">Moves</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-yellow-200 text-center">
            <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">
              {gameState.score}
            </div>
            <div className="text-xs text-gray-600">Score</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
            <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">
              {gameState.gameStatus === "completed"
                ? "🎉"
                : gameState.gameStatus === "playing"
                  ? "🎮"
                  : "⏳"}
            </div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        {/* Maze Board */}
        <div className="relative bg-white rounded-xl border-2 border-gray-200 p-4 shadow-inner overflow-auto">
          {isPaused && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="bg-white rounded-xl p-6 text-center shadow-xl">
                <Pause className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Game Paused
                </h3>
                <p className="text-gray-600 mb-4">
                  Press Space or click Resume to continue
                </p>
                <Button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume Game
                </Button>
              </div>
            </div>
          )}

          <div
            className="grid gap-0 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gameState.size}, ${cellSize}px)`,
              maxWidth: "fit-content",
            }}
          >
            {gameState.maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={getCellClasses(x, y)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    minWidth: `${cellSize}px`,
                    minHeight: `${cellSize}px`,
                  }}
                >
                  {/* Player */}
                  {gameState.playerPosition.x === x &&
                    gameState.playerPosition.y === y && (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        🏃
                      </div>
                    )}
                  {/* Start */}
                  {gameState.startPosition.x === x &&
                    gameState.startPosition.y === y &&
                    !(
                      gameState.playerPosition.x === x &&
                      gameState.playerPosition.y === y
                    ) && (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        🏁
                      </div>
                    )}
                  {/* End */}
                  {gameState.endPosition.x === x &&
                    gameState.endPosition.y === y && (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        🏆
                      </div>
                    )}
                </div>
              )),
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        {isMobile && gameState.gameStatus === "playing" && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Touch Controls
            </h4>
            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
              <div></div>
              <Button
                onTouchStart={() => handleMove("up")}
                variant="outline"
                size="sm"
                className="aspect-square"
                disabled={isPaused}
              >
                ↑
              </Button>
              <div></div>

              <Button
                onTouchStart={() => handleMove("left")}
                variant="outline"
                size="sm"
                className="aspect-square"
                disabled={isPaused}
              >
                ←
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                  🎮
                </div>
              </div>
              <Button
                onTouchStart={() => handleMove("right")}
                variant="outline"
                size="sm"
                className="aspect-square"
                disabled={isPaused}
              >
                →
              </Button>

              <div></div>
              <Button
                onTouchStart={() => handleMove("down")}
                variant="outline"
                size="sm"
                className="aspect-square"
                disabled={isPaused}
              >
                ↓
              </Button>
              <div></div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isMobile
              ? "🎯 Use touch controls or swipe to move • 🏆 Reach the golden trophy to win!"
              : "🎯 Use arrow keys or WASD to move • Space to pause • 🏆 Reach the trophy to win!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
