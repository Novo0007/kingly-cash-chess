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
  Eye,
  EyeOff,
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
  const [showTrail, setShowTrail] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

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
        return newTrail.slice(-20); // Keep more trail for better visual
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
    [disabled, gameState.gameStatus, isPaused],
  );

  // Enhanced touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || gameState.gameStatus !== "playing" || isPaused) return;

    const touch = e.touches[0];
    const now = Date.now();

    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    });

    setLastTouchTime(now);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (
      !touchStart ||
      disabled ||
      gameState.gameStatus !== "playing" ||
      isPaused
    )
      return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Minimum swipe distance and maximum time for responsiveness
    const minSwipeDistance = 30;
    const maxSwipeTime = 500;

    if (deltaTime > maxSwipeTime) {
      setTouchStart(null);
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > minSwipeDistance || absY > minSwipeDistance) {
      let direction: "up" | "down" | "left" | "right";

      if (absX > absY) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      handleMove(direction);

      // Haptic feedback for mobile
      if (vibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }

    setTouchStart(null);
    e.preventDefault();
  };

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (disabled || gameState.gameStatus !== "playing" || isPaused) return;

    const newPosition = MazeGameLogic.movePlayer(gameState, direction);

    if (
      newPosition.x !== gameState.playerPosition.x ||
      newPosition.y !== gameState.playerPosition.y
    ) {
      setMoves(moves + 1);

      // Check if reached the end
      if (
        newPosition.x === gameState.endPosition.x &&
        newPosition.y === gameState.endPosition.y
      ) {
        const timeTaken = Math.floor((Date.now() - gameState.startTime) / 1000);
        const score = MazeGameLogic.calculateScore(
          gameState.difficulty,
          timeTaken,
          moves + 1,
          gameState.size,
        );

        toast.success("🎉 Maze completed! Excellent work!");
        onGameComplete(score, timeTaken);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCellSize = () => {
    if (typeof window === "undefined") return 20;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 40;

    const availableWidth = screenWidth - padding;
    const availableHeight = screenHeight - 300; // Account for UI elements

    const maxCellSize =
      Math.min(availableWidth, availableHeight) / gameState.size;
    return Math.max(Math.min(maxCellSize, 40), 16); // Min 16px, max 40px
  };

  const cellSize = getCellSize();

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const renderMazeCell = (x: number, y: number) => {
    const isWall = gameState.maze[x][y] === 1;
    const isPlayer =
      x === gameState.playerPosition.x && y === gameState.playerPosition.y;
    const isEnd =
      x === gameState.endPosition.x && y === gameState.endPosition.y;
    const isStart =
      x === gameState.startPosition.x && y === gameState.startPosition.y;
    const isInTrail =
      showTrail && trail.some((pos) => pos.x === x && pos.y === y);
    const trailIndex = trail.findIndex((pos) => pos.x === x && pos.y === y);
    const trailOpacity = trailIndex >= 0 ? (trailIndex + 1) / trail.length : 0;

    let cellClass = "absolute transition-all duration-200 ";
    let content = null;

    if (isWall) {
      cellClass +=
        "bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 shadow-inner rounded-sm";
    } else if (isPlayer) {
      cellClass +=
        "bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg z-20 animate-pulse ring-2 ring-blue-300";
      content = (
        <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xs">
          🧭
        </div>
      );
    } else if (isEnd) {
      cellClass +=
        "bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg animate-bounce ring-2 ring-green-300";
      content = (
        <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xs">
          🏆
        </div>
      );
    } else if (isStart) {
      cellClass +=
        "bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-md ring-1 ring-yellow-300";
      content = (
        <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xs">
          🏁
        </div>
      );
    } else if (isInTrail && showTrail) {
      cellClass += `bg-blue-200 rounded-sm`;
      cellClass += ` opacity-${Math.max(20, Math.floor(trailOpacity * 60))}`;
    } else {
      cellClass +=
        "bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-colors";
    }

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          left: y * cellSize,
          top: x * cellSize,
          width: cellSize - 1,
          height: cellSize - 1,
        }}
      >
        {content}
      </div>
    );
  };

  const renderMiniMap = () => {
    if (!showMiniMap) return null;

    const miniCellSize = 3;

    return (
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-slate-200 z-30">
        <div
          className="relative bg-slate-100 rounded"
          style={{
            width: gameState.size * miniCellSize,
            height: gameState.size * miniCellSize,
          }}
        >
          {gameState.maze.map((row, x) =>
            row.map((cell, y) => {
              const isWall = cell === 1;
              const isPlayer =
                x === gameState.playerPosition.x &&
                y === gameState.playerPosition.y;
              const isEnd =
                x === gameState.endPosition.x && y === gameState.endPosition.y;

              let miniCellClass = "absolute ";

              if (isWall) {
                miniCellClass += "bg-slate-800";
              } else if (isPlayer) {
                miniCellClass += "bg-blue-500 rounded-full";
              } else if (isEnd) {
                miniCellClass += "bg-green-500 rounded-full";
              } else {
                miniCellClass += "bg-slate-200";
              }

              return (
                <div
                  key={`mini-${x}-${y}`}
                  className={miniCellClass}
                  style={{
                    left: y * miniCellSize,
                    top: x * miniCellSize,
                    width: miniCellSize - 0.5,
                    height: miniCellSize - 0.5,
                  }}
                />
              );
            }),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Enhanced Game Stats */}
      <Card className="w-full max-w-4xl border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2 bg-white/80 rounded-xl p-3 shadow-sm">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-semibold text-blue-700">Time</div>
                <div className="text-lg font-bold text-blue-900">
                  {formatTime(gameTimer)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-white/80 rounded-xl p-3 shadow-sm">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-semibold text-green-700">
                  Moves
                </div>
                <div className="text-lg font-bold text-green-900">{moves}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-white/80 rounded-xl p-3 shadow-sm">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm font-semibold text-purple-700">
                  Size
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {gameState.size}×{gameState.size}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-white/80 rounded-xl p-3 shadow-sm">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-sm font-semibold text-yellow-700">
                  Level
                </div>
                <div className="text-lg font-bold text-yellow-900 capitalize">
                  {gameState.difficulty}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          onClick={() => setIsPaused(!isPaused)}
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white"
        >
          {isPaused ? (
            <Play className="w-4 h-4 mr-1" />
          ) : (
            <Pause className="w-4 h-4 mr-1" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </Button>

        <Button
          onClick={onGameReset}
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Reset
        </Button>

        <Button
          onClick={() => setShowMiniMap(!showMiniMap)}
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white"
        >
          {showMiniMap ? (
            <EyeOff className="w-4 h-4 mr-1" />
          ) : (
            <Eye className="w-4 h-4 mr-1" />
          )}
          Map
        </Button>

        <Button
          onClick={() => setShowTrail(!showTrail)}
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white"
        >
          <Target className="w-4 h-4 mr-1" />
          Trail
        </Button>
      </div>

      {/* Main Maze Container */}
      <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <CardContent className="p-4">
          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
              <div className="bg-white rounded-xl p-6 text-center shadow-xl">
                <Pause className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Game Paused
                </h3>
                <p className="text-slate-600 mb-4">Take your time!</p>
                <Button onClick={() => setIsPaused(false)}>
                  <Play className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Maze Grid */}
          <div
            ref={mazeContainerRef}
            className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-inner border-2 border-slate-300"
            style={{
              width: gameState.size * cellSize,
              height: gameState.size * cellSize,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {gameState.maze.map((row, x) =>
              row.map((_, y) => renderMazeCell(x, y)),
            )}
          </div>

          {/* Mini Map */}
          {renderMiniMap()}
        </CardContent>
      </Card>

      {/* Mobile Instructions */}
      <Card className="w-full max-w-md border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
              <span className="text-lg">🎮</span>
              <span>How to Play</span>
            </div>

            {isMobile ? (
              <div className="text-sm text-slate-600">
                <div className="bg-blue-100 rounded-lg p-2 mb-2">
                  <div className="font-semibold text-blue-800">
                    📱 Swipe to Move
                  </div>
                  <div className="text-blue-700">
                    Swipe up, down, left, or right to navigate
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  🧭 Navigate from 🏁 to 🏆 • Avoid dark walls
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                <div className="bg-purple-100 rounded-lg p-2 mb-2">
                  <div className="font-semibold text-purple-800">
                    ⌨️ Keyboard Controls
                  </div>
                  <div className="text-purple-700">
                    Arrow keys or WASD • Space to pause
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  🧭 Navigate from 🏁 to 🏆 • Avoid dark walls
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
