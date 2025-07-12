import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Maximize2,
  Minimize2,
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
  const [isHorizontalMode, setIsHorizontalMode] = useState(false);
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const mazeContainerRef = useRef<HTMLDivElement>(null);

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

  const triggerHapticFeedback = (
    type: "light" | "medium" | "heavy" = "light",
  ) => {
    if ("vibrate" in navigator && isMobile) {
      const vibrationPattern = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(vibrationPattern[type]);
    }
  };

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    // In horizontal mode, only allow left/right movement
    if (isHorizontalMode && (direction === "up" || direction === "down")) {
      triggerHapticFeedback("light");
      toast.info("🔄 Horizontal mode: Only left/right movement allowed!");
      return;
    }

    const newPosition = MazeGameLogic.canMoveTo(
      gameState.maze,
      gameState.playerPosition,
      direction,
    );

    if (newPosition) {
      triggerHapticFeedback("light");
      // Update game state with new position
      gameState.playerPosition = newPosition;
      setMoves((prev) => prev + 1);

      // Auto-scroll to keep player in view on horizontal movement
      if (
        (direction === "left" || direction === "right") &&
        mazeContainerRef.current
      ) {
        const container = mazeContainerRef.current;
        const cellSize = isMobile
          ? Math.max(12, Math.min(18, 350 / gameState.size))
          : Math.max(18, Math.min(28, 600 / gameState.size));

        const targetX = newPosition.x * (cellSize + 1);
        const containerWidth = container.offsetWidth;
        const scrollLeft = targetX - containerWidth / 2;

        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: "smooth",
        });
      }

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

  // Enhanced touch/swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const minSwipeDistance = isMobile ? 30 : 50;
    const maxTapTime = 300; // ms
    const maxTapDistance = 20; // pixels

    // Tap detection (quick touch with minimal movement)
    if (deltaTime < maxTapTime && distance < maxTapDistance) {
      // Handle tap-to-move: move in the direction of the largest delta
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        handleMove(deltaX > 0 ? "right" : "left");
      } else if (Math.abs(deltaY) > 5) {
        // Minimum threshold for vertical tap
        handleMove(deltaY > 0 ? "down" : "up");
      }
    }
    // Swipe detection
    else if (distance > minSwipeDistance) {
      // Determine swipe direction with better sensitivity
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      if (angle >= -45 && angle <= 45) {
        handleMove("right");
      } else if (angle >= 45 && angle <= 135) {
        handleMove("down");
      } else if (angle >= 135 || angle <= -135) {
        handleMove("left");
      } else if (angle >= -135 && angle <= -45) {
        handleMove("up");
      }
    }

    setTouchStart(null);
    setLastTouchTime(Date.now());
  };

  // Handle touch move for continuous gesture tracking
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    e.preventDefault(); // Prevent scrolling while swiping
  };

  // Double tap detection for special actions
  const handleDoubleTap = () => {
    if (Date.now() - lastTouchTime < 300) {
      // Double tap detected - toggle horizontal mode
      setIsHorizontalMode(!isHorizontalMode);
      toast.info(
        isHorizontalMode
          ? "Normal mode activated"
          : "Horizontal mode activated",
      );
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

    let classes = "transition-all duration-500 ease-out relative rounded-sm ";

    if (cell.isWall) {
      classes += "bg-slate-900 border-0 shadow-inner";
    } else {
      classes += "bg-white border-0 shadow-sm";
    }

    if (isPlayer) {
      classes +=
        " !bg-gradient-to-br !from-emerald-400 !to-emerald-600 !shadow-lg !scale-110";
      classes += " ring-4 ring-emerald-300/50 ring-offset-2 ring-offset-white";
    } else if (isEnd) {
      classes +=
        " !bg-gradient-to-br !from-amber-400 !to-orange-500 !shadow-lg";
      classes +=
        " ring-4 ring-amber-300/50 ring-offset-2 ring-offset-white animate-pulse";
    } else if (isStart) {
      classes += " !bg-gradient-to-br !from-blue-400 !to-blue-600 !shadow-lg";
      classes += " ring-4 ring-blue-300/50 ring-offset-2 ring-offset-white";
    } else if (isInTrail && !cell.isWall) {
      classes += " !bg-gradient-to-br !from-emerald-50 !to-emerald-100";
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
    <div className="w-full bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Enhanced Game Header with Horizontal Features */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Maze Challenge
                </h1>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  {gameState.difficulty} • {gameState.size}×{gameState.size}
                  {isHorizontalMode && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      H-Mode
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsHorizontalMode(!isHorizontalMode)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              title="Toggle Horizontal Mode"
            >
              {isHorizontalMode ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => setShowMiniMap(!showMiniMap)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              title="Toggle Mini Map"
            >
              <Target
                className={`h-4 w-4 ${showMiniMap ? "text-blue-600" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
              size="sm"
              disabled={gameState.gameStatus !== "playing"}
              className="h-10 px-4 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={onGameReset}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Clean Stats Display */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatTime(gameTimer)}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Time
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-900 mb-1">{moves}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Moves
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {gameState.score.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Score
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">
              {gameState.gameStatus === "completed"
                ? "🎉"
                : gameState.gameStatus === "playing"
                  ? "🎯"
                  : "⏳"}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </div>
          </div>
        </div>

        {/* Enhanced Maze Board with Horizontal Features */}
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl pointer-events-none"></div>

          {/* Mini Map */}
          {showMiniMap && (
            <div className="absolute top-6 right-6 z-30 bg-white rounded-lg p-3 shadow-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Mini Map
              </div>
              <div
                className="grid gap-0 bg-gray-100 rounded"
                style={{
                  gridTemplateColumns: `repeat(${gameState.size}, 2px)`,
                  width: "fit-content",
                  maxWidth: "120px",
                }}
              >
                {gameState.maze.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`mini-${x}-${y}`}
                      className={`w-0.5 h-0.5 ${
                        gameState.playerPosition.x === x &&
                        gameState.playerPosition.y === y
                          ? "bg-green-500"
                          : gameState.endPosition.x === x &&
                              gameState.endPosition.y === y
                            ? "bg-amber-500"
                            : cell.isWall
                              ? "bg-gray-800"
                              : "bg-white"
                      }`}
                    />
                  )),
                )}
              </div>
            </div>
          )}

          {isPaused && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl border border-gray-100 max-w-sm w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pause className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Game Paused
                </h3>
                <p className="text-gray-600 mb-6 text-base">
                  Ready to continue your maze adventure?
                </p>
                <Button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg w-full justify-center transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Resume Game
                </Button>
              </div>
            </div>
          )}

          {/* Horizontal Mode Indicator */}
          {isHorizontalMode && (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Maximize2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Horizontal Mode Active
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Only left/right movement allowed. Use horizontal navigation!
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Maze Grid with Improved Touch Support */}
          <div
            className="relative overflow-x-auto overflow-y-hidden touch-pan-x select-none"
            ref={mazeContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleDoubleTap}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db #f3f4f6",
              touchAction: "pan-x", // Better touch handling
            }}
          >
            <div className="flex justify-center py-4">
              <div
                className="grid gap-1 bg-gray-100 p-4 rounded-xl shadow-inner border border-gray-200"
                style={{
                  gridTemplateColumns: `repeat(${gameState.size}, ${cellSize}px)`,
                  width: "fit-content",
                  minWidth: "100%",
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
                          <div className="w-full h-full flex items-center justify-center relative z-10">
                            <div className="w-3/4 h-3/4 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300">
                              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        )}
                      {/* Start */}
                      {gameState.startPosition.x === x &&
                        gameState.startPosition.y === y &&
                        !(
                          gameState.playerPosition.x === x &&
                          gameState.playerPosition.y === y
                        ) && (
                          <div className="w-full h-full flex items-center justify-center relative z-10">
                            <div className="w-3/4 h-3/4 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      {/* End */}
                      {gameState.endPosition.x === x &&
                        gameState.endPosition.y === y && (
                          <div className="w-full h-full flex items-center justify-center relative z-10">
                            <div className="w-3/4 h-3/4 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                            </div>
                          </div>
                        )}
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Scroll Indicator */}
          {gameState.size > 20 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-4 h-1 bg-gray-300 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span>Scroll horizontally to explore</span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Mobile Controls with Horizontal Features */}
        {isMobile && gameState.gameStatus === "playing" && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
            {/* Swipe Gesture Hint */}
            <div className="mb-2 text-center">
              <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs">
                {isHorizontalMode
                  ? "↔️ Swipe/tap left/right only"
                  : "👆 Swipe/tap in any direction | Double-tap to toggle mode"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-52 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl">
              <div></div>
              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMove("up");
                }}
                variant="outline"
                size="sm"
                className={`aspect-square border-2 shadow-lg text-lg font-bold rounded-xl active:scale-95 h-14 w-14 transition-all duration-200 ${
                  isHorizontalMode
                    ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                disabled={isPaused || isHorizontalMode}
              >
                <div
                  className={`w-3 h-3 border-t-2 border-r-2 transform rotate-[-45deg] ${
                    isHorizontalMode ? "border-gray-400" : "border-gray-700"
                  }`}
                ></div>
              </Button>
              <div></div>

              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMove("left");
                }}
                variant="outline"
                size="sm"
                className={`aspect-square border-2 shadow-lg text-lg font-bold rounded-xl active:scale-95 h-14 w-14 transition-all duration-200 ${
                  isHorizontalMode
                    ? "bg-blue-50 border-blue-300 hover:border-blue-400 hover:bg-blue-100"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                disabled={isPaused}
              >
                <div
                  className={`w-3 h-3 border-t-2 border-r-2 transform rotate-[-135deg] ${
                    isHorizontalMode ? "border-blue-700" : "border-gray-700"
                  }`}
                ></div>
              </Button>
              <div className="flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border ${
                    isHorizontalMode
                      ? "bg-blue-100 border-blue-200"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isHorizontalMode ? "bg-blue-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>
              </div>
              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMove("right");
                }}
                variant="outline"
                size="sm"
                className={`aspect-square border-2 shadow-lg text-lg font-bold rounded-xl active:scale-95 h-14 w-14 transition-all duration-200 ${
                  isHorizontalMode
                    ? "bg-blue-50 border-blue-300 hover:border-blue-400 hover:bg-blue-100"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                disabled={isPaused}
              >
                <div
                  className={`w-3 h-3 border-t-2 border-r-2 transform rotate-[45deg] ${
                    isHorizontalMode ? "border-blue-700" : "border-gray-700"
                  }`}
                ></div>
              </Button>

              <div></div>
              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMove("down");
                }}
                variant="outline"
                size="sm"
                className={`aspect-square border-2 shadow-lg text-lg font-bold rounded-xl active:scale-95 h-14 w-14 transition-all duration-200 ${
                  isHorizontalMode
                    ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                disabled={isPaused || isHorizontalMode}
              >
                <div
                  className={`w-3 h-3 border-t-2 border-r-2 transform rotate-[135deg] ${
                    isHorizontalMode ? "border-gray-400" : "border-gray-700"
                  }`}
                ></div>
              </Button>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
