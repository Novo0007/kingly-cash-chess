import React, { useEffect, useRef, useState } from "react";
import { GameTile, Game2048State } from "./Game2048Logic";
import { cn } from "@/lib/utils";

interface Game2048BoardProps {
  gameState: Game2048State;
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  className?: string;
}

interface TileProps {
  tile: GameTile;
  boardSize: number;
  tileSize: number;
}

const Tile: React.FC<TileProps> = ({ tile, boardSize, tileSize }) => {
  const textSize =
    tile.value >= 10000
      ? "text-xs font-bold"
      : tile.value >= 1000
        ? "text-sm font-bold"
        : tile.value >= 100
          ? "text-base font-bold"
          : "text-lg font-bold";

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 shadow-sm",
      4: "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 shadow-md",
      8: "bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg",
      16: "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg",
      32: "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl",
      64: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl",
      128: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-xl animate-pulse",
      256: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl animate-pulse",
      512: "bg-gradient-to-br from-yellow-600 to-orange-600 text-white shadow-2xl animate-pulse",
      1024: "bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-2xl animate-pulse",
      2048: "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl animate-pulse ring-4 ring-yellow-400",
      4096: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-2xl animate-pulse ring-4 ring-purple-400",
      8192: "bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-2xl animate-pulse ring-4 ring-blue-400",
    };

    return (
      colors[value] ||
      "bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl animate-pulse ring-4 ring-rainbow"
    );
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    }
    return value.toString();
  };

  const gap = boardSize === 4 ? 12 : boardSize === 5 ? 10 : 8;
  const actualTileSize = tileSize - gap;

  return (
    <div
      className={cn(
        "absolute rounded-xl flex items-center justify-center transition-all duration-300 ease-out transform select-none",
        getTileColor(tile.value),
        tile.isNew ? "scale-110 animate-bounce" : "scale-100",
        tile.merged ? "animate-ping" : "",
      )}
      style={{
        width: `${actualTileSize}px`,
        height: `${actualTileSize}px`,
        transform: `translate(${tile.position.y * tileSize}px, ${tile.position.x * tileSize}px) ${tile.isNew ? "scale(1.1)" : "scale(1)"}`,
        zIndex: tile.isNew || tile.merged ? 10 : 1,
      }}
    >
      <span className={cn(textSize, "select-none leading-none")}>
        {formatValue(tile.value)}
      </span>

      {/* Special effects for high value tiles */}
      {tile.value >= 2048 && (
        <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
      )}
    </div>
  );
};

export const Game2048Board: React.FC<Game2048BoardProps> = ({
  gameState,
  onMove,
  className,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);

  // Calculate responsive board size
  const getResponsiveBoardSize = () => {
    if (typeof window === "undefined") return 320;

    const screenWidth = window.innerWidth;
    const padding = 32; // Total padding
    const maxBoardSize = Math.min(screenWidth - padding, 400);

    // Ensure minimum size
    return Math.max(maxBoardSize, 280);
  };

  const [boardPixelSize, setBoardPixelSize] = useState(
    getResponsiveBoardSize(),
  );

  useEffect(() => {
    const handleResize = () => {
      setBoardPixelSize(getResponsiveBoardSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tileSize = (boardPixelSize - 16) / gameState.boardSize; // 16px for padding
  const gap = Math.max(2, Math.floor(tileSize * 0.05));

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus === "lost") return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          onMove("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          onMove("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          onMove("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          onMove("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMove, gameState.gameStatus]);

  // Enhanced touch handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling while playing
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isSwipeEnabled) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = Math.max(30, tileSize * 0.3); // Adaptive swipe distance

    if (
      Math.abs(deltaX) > minSwipeDistance ||
      Math.abs(deltaY) > minSwipeDistance
    ) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        onMove(deltaX > 0 ? "right" : "left");
      } else {
        // Vertical swipe
        onMove(deltaY > 0 ? "down" : "up");
      }

      // Brief disable to prevent double swipes
      setIsSwipeEnabled(false);
      setTimeout(() => setIsSwipeEnabled(true), 150);
    }

    setTouchStart(null);
    e.preventDefault();
  };

  const createBoardGrid = () => {
    const cells = [];
    for (let x = 0; x < gameState.boardSize; x++) {
      for (let y = 0; y < gameState.boardSize; y++) {
        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className="bg-slate-200/80 rounded-lg border border-slate-300/50 shadow-inner"
            style={{
              width: `${tileSize - gap}px`,
              height: `${tileSize - gap}px`,
            }}
          />,
        );
      }
    }
    return cells;
  };

  const tiles = gameState.board.flat().filter(Boolean) as GameTile[];

  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      {/* Game Board Container */}
      <div className="relative">
        {/* Main Game Board */}
        <div
          ref={boardRef}
          className="relative select-none touch-none bg-slate-300 rounded-2xl shadow-2xl border-2 border-slate-400"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: `${boardPixelSize}px`,
            height: `${boardPixelSize}px`,
            padding: "8px",
          }}
        >
          {/* Background Grid */}
          <div
            className="grid w-full h-full rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${gameState.boardSize}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {createBoardGrid()}
          </div>

          {/* Tiles Layer */}
          <div
            className="absolute inset-2 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            {tiles.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                boardSize={gameState.boardSize}
                tileSize={tileSize}
              />
            ))}
          </div>

          {/* Game Over Overlay */}
          {gameState.gameStatus === "lost" && (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center backdrop-blur-sm z-20">
              <div className="bg-white/95 rounded-2xl p-6 text-center shadow-2xl border border-slate-200 max-w-sm mx-4">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Game Over!
                </h3>
                <p className="text-slate-600 mb-4">No more moves available</p>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-3">
                    <p className="text-lg font-bold text-slate-700">
                      Final Score: {gameState.score.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-3">
                    <p className="text-sm text-slate-600">
                      Moves: {gameState.moves} • Best Tile:{" "}
                      {Math.max(...tiles.map((t) => t.value))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Win Overlay */}
          {gameState.gameStatus === "won" && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center backdrop-blur-sm z-20">
              <div className="bg-white/95 rounded-2xl p-6 text-center shadow-2xl border-4 border-yellow-400 max-w-sm mx-4">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-3xl font-bold text-yellow-600 mb-3">
                  You Won!
                </h3>
                <p className="text-slate-700 mb-4 text-lg font-semibold">
                  You reached {gameState.targetTile}!
                </p>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3">
                    <p className="text-lg font-bold text-yellow-700">
                      Score: {gameState.score.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-xl p-3">
                    <p className="text-sm text-green-700">
                      Moves: {gameState.moves} • Time:{" "}
                      {Math.floor(gameState.timeElapsed / 60)}:
                      {(gameState.timeElapsed % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Glow effect for high scores */}
        {gameState.score > 50000 && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-xl -z-10 animate-pulse" />
        )}
      </div>

      {/* Enhanced Mobile Instructions */}
      <div className="text-center max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200">
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-center gap-2 font-semibold text-slate-800 mb-3">
              <span className="text-lg">🎮</span>
              <span>How to Play</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="font-semibold text-blue-800 mb-1">
                  📱 Mobile
                </div>
                <div className="text-blue-700">
                  Swipe in any direction to move tiles
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-2">
                <div className="font-semibold text-purple-800 mb-1">
                  ⌨️ Desktop
                </div>
                <div className="text-purple-700">
                  Arrow keys or WASD to move
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200">
              🎯 <strong>Goal:</strong> Combine tiles to reach{" "}
              {gameState.targetTile}!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
