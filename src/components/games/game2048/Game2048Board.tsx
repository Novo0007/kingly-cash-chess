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
}

const Tile: React.FC<TileProps> = ({ tile, boardSize }) => {
  const cellSize =
    boardSize === 4 ? "w-16 h-16" : boardSize === 5 ? "w-14 h-14" : "w-12 h-12";
  const textSize =
    tile.value >= 1000
      ? "text-sm"
      : tile.value >= 100
        ? "text-base"
        : "text-lg";

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-gray-200 text-gray-800",
      4: "bg-gray-300 text-gray-800",
      8: "bg-orange-300 text-white",
      16: "bg-orange-400 text-white",
      32: "bg-orange-500 text-white",
      64: "bg-orange-600 text-white",
      128: "bg-yellow-400 text-white font-bold",
      256: "bg-yellow-500 text-white font-bold",
      512: "bg-yellow-600 text-white font-bold",
      1024: "bg-red-400 text-white font-bold",
      2048: "bg-red-500 text-white font-bold shadow-lg",
      4096: "bg-purple-500 text-white font-bold shadow-lg",
      8192: "bg-purple-600 text-white font-bold shadow-lg",
    };

    return (
      colors[value] ||
      "bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold shadow-xl"
    );
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    }
    return value.toString();
  };

  return (
    <div
      className={cn(
        cellSize,
        "absolute rounded-lg flex items-center justify-center font-bold transition-all duration-200 transform",
        getTileColor(tile.value),
        tile.isNew ? "animate-pulse scale-110" : "",
        tile.merged ? "animate-bounce" : "",
      )}
      style={{
        transform: `translate(${tile.position.y * (boardSize === 4 ? 72 : boardSize === 5 ? 64 : 56)}px, ${tile.position.x * (boardSize === 4 ? 72 : boardSize === 5 ? 64 : 56)}px)`,
      }}
    >
      <span className={cn(textSize, "select-none")}>
        {formatValue(tile.value)}
      </span>
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

  const cellSize =
    gameState.boardSize === 4
      ? "w-16 h-16"
      : gameState.boardSize === 5
        ? "w-14 h-14"
        : "w-12 h-12";
  const gridGap = "gap-2";

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

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;

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
    }

    setTouchStart(null);
  };

  const createBoardGrid = () => {
    const cells = [];
    for (let x = 0; x < gameState.boardSize; x++) {
      for (let y = 0; y < gameState.boardSize; y++) {
        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className={cn(
              cellSize,
              "bg-gray-100 rounded-lg border-2 border-gray-200 shadow-inner",
            )}
          />,
        );
      }
    }
    return cells;
  };

  const tiles = gameState.board.flat().filter(Boolean) as GameTile[];

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Game Board */}
      <div
        ref={boardRef}
        className="relative select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width:
            gameState.boardSize === 4
              ? "280px"
              : gameState.boardSize === 5
                ? "312px"
                : "344px",
          height:
            gameState.boardSize === 4
              ? "280px"
              : gameState.boardSize === 5
                ? "312px"
                : "344px",
        }}
      >
        {/* Background Grid */}
        <div
          className={cn(
            "grid bg-gray-300 rounded-xl p-2 shadow-lg",
            gridGap,
            gameState.boardSize === 4
              ? "grid-cols-4"
              : gameState.boardSize === 5
                ? "grid-cols-5"
                : "grid-cols-6",
          )}
        >
          {createBoardGrid()}
        </div>

        {/* Tiles */}
        <div className="absolute top-2 left-2">
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} boardSize={gameState.boardSize} />
          ))}
        </div>

        {/* Game Over Overlay */}
        {gameState.gameStatus === "lost" && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Game Over!
              </h3>
              <p className="text-gray-600 mb-4">No more moves available</p>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Final Score: {gameState.score.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Moves: {gameState.moves}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {gameState.gameStatus === "won" && (
          <div className="absolute inset-0 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center shadow-xl border-4 border-yellow-400">
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">
                🎉 You Won!
              </h3>
              <p className="text-gray-600 mb-4">
                You reached {gameState.targetTile}!
              </p>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Score: {gameState.score.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Moves: {gameState.moves}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Instructions */}
      <div className="text-center text-sm text-gray-600 max-w-md">
        <p className="mb-2">
          <strong>Desktop:</strong> Use arrow keys or WASD to move tiles
        </p>
        <p>
          <strong>Mobile:</strong> Swipe in any direction to move tiles
        </p>
      </div>
    </div>
  );
};
