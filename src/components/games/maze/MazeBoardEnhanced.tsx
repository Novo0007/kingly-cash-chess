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

    let classes = "transition-all duration-300 relative overflow-hidden ";

    if (cell.isWall) {
      classes +=
        "bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 border border-slate-700 shadow-inner";
      // Add some texture to walls
      classes +=
        " before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-600/20 before:to-transparent";
    } else {
      classes +=
        "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm";
      // Add subtle glow to paths
      classes +=
        " before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent";
    }

    if (isPlayer) {
      classes +=
        " !bg-gradient-to-br !from-emerald-400 !via-green-500 !to-emerald-600 !border-2 !border-emerald-300 !shadow-xl !scale-110 animate-pulse";
      classes +=
        " after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/30 after:to-transparent after:animate-pulse";
    } else if (isEnd) {
      classes +=
        " !bg-gradient-to-br !from-yellow-400 !via-orange-500 !to-red-500 !border-2 !border-yellow-300 !shadow-lg animate-bounce";
      classes +=
        " after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/50 after:to-transparent";
    } else if (isStart) {
      classes +=
        " !bg-gradient-to-br !from-blue-400 !via-cyan-500 !to-blue-600 !border-2 !border-blue-300 !shadow-lg";
      classes +=
        " after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/40 after:to-transparent";
    } else if (isInTrail && !cell.isWall) {
      classes +=
        " !bg-gradient-to-br !from-green-100 !via-emerald-100 !to-green-200 !border !border-green-300";
      classes +=
        " after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/20 after:to-transparent";
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
    ? Math.max(12, Math.min(18, 350 / gameState.size))
    : Math.max(18, Math.min(28, 600 / gameState.size));

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="p-4 md:p-6">
        {/* Game Header - Mobile Optimized */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 bg-gradient-to-r ${getDifficultyColor()} rounded-lg text-white shadow-lg`}
              >
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  🧩 Maze
                  <Badge
                    className={`bg-gradient-to-r ${getDifficultyColor()} text-white border-0 text-xs`}
                  >
                    {gameState.difficulty.toUpperCase()}
                  </Badge>
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {gameState.size}×{gameState.size} • Score: {gameState.score}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                size="sm"
                disabled={gameState.gameStatus !== "playing"}
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={onGameReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs px-2 py-1"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Game Stats - Mobile Optimized */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-blue-200 text-center">
            <Timer className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-sm md:text-lg font-bold text-gray-800">
              {formatTime(gameTimer)}
            </div>
            <div className="text-xs text-gray-600">Time</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-green-200 text-center">
            <Zap className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-sm md:text-lg font-bold text-gray-800">
              {moves}
            </div>
            <div className="text-xs text-gray-600">Moves</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-yellow-200 text-center">
            <Trophy className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <div className="text-sm md:text-lg font-bold text-gray-800">
              {gameState.score}
            </div>
            <div className="text-xs text-gray-600">Score</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-purple-200 text-center">
            <Star className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <div className="text-sm md:text-lg font-bold text-gray-800">
              {gameState.gameStatus === "completed"
                ? "🎉"
                : gameState.gameStatus === "playing"
                  ? "🎮"
                  : "⏳"}
            </div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        {/* Maze Board - Full Width Mobile Friendly */}
        <div className="relative bg-gradient-to-br from-slate-100 via-gray-50 to-indigo-50 rounded-xl p-2 md:p-4 shadow-lg overflow-auto">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-3">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-xl"></div>
          </div>

          {isPaused && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 md:p-8 text-center shadow-2xl border border-indigo-200 max-w-sm w-full">
                <Pause className="h-12 w-12 md:h-16 md:w-16 text-indigo-600 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                  Game Paused
                </h3>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-lg">
                  Press Space or tap Resume to continue
                </p>
                <Button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl shadow-lg w-full justify-center"
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5" />
                  Resume Game
                </Button>
              </div>
            </div>
          )}

          {/* Maze container - Mobile optimized */}
          <div className="relative flex justify-center">
            <div
              className="grid gap-0.5 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 p-2 md:p-3 rounded-lg shadow-xl border border-slate-600"
              style={{
                gridTemplateColumns: `repeat(${gameState.size}, ${cellSize}px)`,
                width: "fit-content",
                maxWidth: "100vw",
                overflowX: "auto",
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
                        <div className="w-full h-full flex items-center justify-center text-white font-bold relative z-10">
                          <span
                            className="text-xl drop-shadow-lg transform transition-transform duration-300 hover:scale-110"
                            style={{
                              fontSize: `${Math.max(12, cellSize * 0.7)}px`,
                            }}
                          >
                            🏃‍♂️
                          </span>
                        </div>
                      )}
                    {/* Start */}
                    {gameState.startPosition.x === x &&
                      gameState.startPosition.y === y &&
                      !(
                        gameState.playerPosition.x === x &&
                        gameState.playerPosition.y === y
                      ) && (
                        <div className="w-full h-full flex items-center justify-center text-white relative z-10">
                          <span
                            className="drop-shadow-lg animate-pulse"
                            style={{
                              fontSize: `${Math.max(12, cellSize * 0.7)}px`,
                            }}
                          >
                            🚀
                          </span>
                        </div>
                      )}
                    {/* End */}
                    {gameState.endPosition.x === x &&
                      gameState.endPosition.y === y && (
                        <div className="w-full h-full flex items-center justify-center text-white relative z-10">
                          <span
                            className="drop-shadow-lg animate-bounce"
                            style={{
                              fontSize: `${Math.max(12, cellSize * 0.8)}px`,
                            }}
                          >
                            🎯
                          </span>
                        </div>
                      )}

                    {/* Wall decoration */}
                    {gameState.maze[y][x].isWall && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-600/30 via-gray-700/20 to-slate-800/30 opacity-60"></div>
                    )}

                    {/* Path glow effect */}
                    {!gameState.maze[y][x].isWall &&
                      !gameState.playerPosition.x === x &&
                      !gameState.playerPosition.y === y && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/10 via-indigo-200/5 to-purple-200/10 opacity-50"></div>
                      )}
                  </div>
                )),
              )}
            </div>
          </div>
        </div>

        {/* Mobile Controls - Fixed Position */}
        {isMobile && gameState.gameStatus === "playing" && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            <div className="grid grid-cols-3 gap-2 w-48 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl">
              <div></div>
              <Button
                onTouchStart={() => handleMove("up")}
                variant="outline"
                size="sm"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-lg font-bold rounded-lg active:scale-95 h-12 w-12"
                disabled={isPaused}
              >
                ↑
              </Button>
              <div></div>

              <Button
                onTouchStart={() => handleMove("left")}
                variant="outline"
                size="sm"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-lg font-bold rounded-lg active:scale-95 h-12 w-12"
                disabled={isPaused}
              >
                ←
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm shadow-lg border border-purple-400">
                  🎮
                </div>
              </div>
              <Button
                onTouchStart={() => handleMove("right")}
                variant="outline"
                size="sm"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-lg font-bold rounded-lg active:scale-95 h-12 w-12"
                disabled={isPaused}
              >
                →
              </Button>

              <div></div>
              <Button
                onTouchStart={() => handleMove("down")}
                variant="outline"
                size="sm"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-lg font-bold rounded-lg active:scale-95 h-12 w-12"
                disabled={isPaused}
              >
                ↓
              </Button>
              <div></div>
            </div>

            {/* Quick tip */}
            <div className="mt-2 text-center">
              <p className="text-xs text-white/80 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
                💡 Tap to move
              </p>
            </div>
          </div>
        )}

        {/* Instructions - Mobile Optimized */}
        {!isMobile && (
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
              <p className="text-sm font-semibold mb-1">⌨️ Desktop Controls</p>
              <p className="text-xs opacity-90">
                Arrow keys or WASD to move • Spacebar to pause • Reach the
                target to win!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
