import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScrabbleTile,
  BoardCell,
  ScrabbleGameState,
  BOARD_MULTIPLIERS,
} from "./ScrabbleGameLogic";
import { cn } from "@/lib/utils";
import { Trash2, RotateCcw, CheckCircle, X } from "lucide-react";
import "./scrabble.css";

interface ScrabbleBoardProps {
  gameState: ScrabbleGameState;
  currentPlayerId: string;
  onPlaceTiles: (
    tiles: { tile: ScrabbleTile; position: { row: number; col: number } }[],
  ) => void;
  onExchangeTiles: (tiles: ScrabbleTile[]) => void;
  onPass: () => void;
  className?: string;
}

interface DraggedTile {
  tile: ScrabbleTile;
  source: "rack" | "board";
  originalPosition?: { row: number; col: number };
}

export const ScrabbleBoard: React.FC<ScrabbleBoardProps> = ({
  gameState,
  currentPlayerId,
  onPlaceTiles,
  onExchangeTiles,
  onPass,
  className,
}) => {
  const [draggedTile, setDraggedTile] = useState<DraggedTile | null>(null);
  const [placedTiles, setPlacedTiles] = useState<
    { tile: ScrabbleTile; position: { row: number; col: number } }[]
  >([]);
  const [selectedTilesForExchange, setSelectedTilesForExchange] = useState<
    Set<string>
  >(new Set());
  const [isExchangeMode, setIsExchangeMode] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId);
  const isCurrentPlayerTurn =
    gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId;

  const getCellMultiplierDisplay = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    const multiplier = BOARD_MULTIPLIERS[key];

    if (!multiplier) return null;

    if (multiplier.type === "word") {
      return multiplier.value === 3 ? "TW" : "DW";
    } else {
      return multiplier.value === 3 ? "TL" : "DL";
    }
  }, []);

  const getCellMultiplierColor = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    const multiplier = BOARD_MULTIPLIERS[key];

    if (!multiplier) {
      // Center star
      if (row === 7 && col === 7) return "bg-yellow-400";
      return "bg-green-50";
    }

    if (multiplier.type === "word") {
      return multiplier.value === 3 ? "bg-red-500" : "bg-pink-400";
    } else {
      return multiplier.value === 3 ? "bg-blue-500" : "bg-cyan-400";
    }
  }, []);

  const handleDragStart = useCallback(
    (
      tile: ScrabbleTile,
      source: "rack" | "board",
      originalPosition?: { row: number; col: number },
    ) => {
      if (!isCurrentPlayerTurn) return;

      setDraggedTile({ tile, source, originalPosition });
    },
    [isCurrentPlayerTurn],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, row: number, col: number) => {
      e.preventDefault();

      if (!draggedTile || !isCurrentPlayerTurn) return;

      // Check if cell is already occupied by a permanent tile
      const existingTile = gameState.board[row][col].tile;
      const placedTile = placedTiles.find(
        (pt) => pt.position.row === row && pt.position.col === col,
      );

      if (existingTile && !placedTile) {
        setDraggedTile(null);
        return;
      }

      // Remove tile from its previous position if it was on the board
      if (draggedTile.source === "board" && draggedTile.originalPosition) {
        setPlacedTiles((prev) =>
          prev.filter(
            (pt) =>
              !(
                pt.position.row === draggedTile.originalPosition!.row &&
                pt.position.col === draggedTile.originalPosition!.col
              ),
          ),
        );
      }

      // Remove any existing placed tile at this position
      setPlacedTiles((prev) =>
        prev.filter(
          (pt) => !(pt.position.row === row && pt.position.col === col),
        ),
      );

      // Add the tile to the new position
      setPlacedTiles((prev) => [
        ...prev,
        {
          tile: draggedTile.tile,
          position: { row, col },
        },
      ]);

      setDraggedTile(null);
    },
    [draggedTile, isCurrentPlayerTurn, gameState.board, placedTiles],
  );

  const handleReturnToRack = useCallback((tileId: string) => {
    setPlacedTiles((prev) => prev.filter((pt) => pt.tile.id !== tileId));
  }, []);

  const handleClearBoard = useCallback(() => {
    setPlacedTiles([]);
  }, []);

  const handleConfirmMove = useCallback(() => {
    if (placedTiles.length === 0) return;
    onPlaceTiles(placedTiles);
    setPlacedTiles([]);
  }, [placedTiles, onPlaceTiles]);

  const handleTileClickForExchange = useCallback(
    (tile: ScrabbleTile) => {
      if (!isExchangeMode || !isCurrentPlayerTurn) return;

      setSelectedTilesForExchange((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(tile.id)) {
          newSet.delete(tile.id);
        } else {
          newSet.add(tile.id);
        }
        return newSet;
      });
    },
    [isExchangeMode, isCurrentPlayerTurn],
  );

  const handleConfirmExchange = useCallback(() => {
    if (selectedTilesForExchange.size === 0 || !currentPlayer) return;

    const tilesToExchange = currentPlayer.rack.filter((tile) =>
      selectedTilesForExchange.has(tile.id),
    );

    onExchangeTiles(tilesToExchange);
    setSelectedTilesForExchange(new Set());
    setIsExchangeMode(false);
  }, [selectedTilesForExchange, currentPlayer, onExchangeTiles]);

  const renderTile = useCallback(
    (
      tile: ScrabbleTile,
      isPlaced: boolean = false,
      position?: { row: number; col: number },
    ) => {
      const isSelected = selectedTilesForExchange.has(tile.id);

      return (
        <div
          key={tile.id}
          draggable={isCurrentPlayerTurn && !isExchangeMode}
          onDragStart={(e) => {
            if (isExchangeMode) {
              e.preventDefault();
              return;
            }
            handleDragStart(tile, isPlaced ? "board" : "rack", position);
          }}
          onClick={() => {
            if (isExchangeMode && !isPlaced) {
              handleTileClickForExchange(tile);
            } else if (isPlaced) {
              handleReturnToRack(tile.id);
            }
          }}
          className={cn(
            "relative w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
            isCurrentPlayerTurn && "cursor-grab active:cursor-grabbing",
            isSelected && "ring-2 ring-blue-500 bg-blue-100",
            isPlaced && "ring-2 ring-green-500",
          )}
        >
          <span className="text-xs md:text-sm font-bold text-amber-900">
            {tile.letter || "?"}
          </span>
          <span className="absolute bottom-0 right-0 text-[8px] md:text-[10px] font-bold text-amber-800">
            {tile.value}
          </span>
          {isPlaced && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReturnToRack(tile.id);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600"
            >
              <X className="w-2 h-2" />
            </button>
          )}
        </div>
      );
    },
    [
      isCurrentPlayerTurn,
      isExchangeMode,
      selectedTilesForExchange,
      handleTileClickForExchange,
      handleReturnToRack,
      handleDragStart,
    ],
  );

  const renderBoardCell = useCallback(
    (cell: BoardCell, row: number, col: number) => {
      const placedTile = placedTiles.find(
        (pt) => pt.position.row === row && pt.position.col === col,
      );
      const displayTile = placedTile?.tile || cell.tile;
      const multiplierText = getCellMultiplierDisplay(row, col);
      const cellColor = getCellMultiplierColor(row, col);

      return (
        <div
          key={`${row}-${col}`}
          className={cn(
            "relative w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 border border-gray-300 flex items-center justify-center text-[8px] md:text-[10px] font-bold transition-all duration-200",
            cellColor,
            displayTile ? "bg-gray-100" : "",
            row === 7 && col === 7 && !displayTile
              ? "text-yellow-800"
              : "text-white",
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, row, col)}
        >
          {displayTile ? (
            renderTile(displayTile, true, { row, col })
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {row === 7 && col === 7 ? (
                <span className="text-yellow-800">★</span>
              ) : (
                <span className="text-center leading-none">
                  {multiplierText}
                </span>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      placedTiles,
      getCellMultiplierDisplay,
      getCellMultiplierColor,
      handleDragOver,
      handleDrop,
      renderTile,
    ],
  );

  if (!currentPlayer) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Game Board */}
      <Card className="overflow-hidden">
        <CardContent className="p-2 md:p-4">
          <div ref={boardRef} className="scrabble-board">
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) =>
                renderBoardCell(cell, rowIndex, colIndex),
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Rack */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm md:text-lg font-bold">Your Tiles</h3>
            <div className="flex items-center gap-2">
              <Badge variant={isCurrentPlayerTurn ? "default" : "secondary"}>
                {isCurrentPlayerTurn ? "Your Turn" : "Wait"}
              </Badge>
              <Badge variant="outline">Score: {currentPlayer.score}</Badge>
              <Badge variant="outline" className="text-yellow-600">
                Coins: {currentPlayer.coins}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {currentPlayer.rack.map((tile) => {
              const isPlaced = placedTiles.some((pt) => pt.tile.id === tile.id);
              if (isPlaced) return null;
              return renderTile(tile);
            })}
          </div>

          {/* Action Buttons */}
          {isCurrentPlayerTurn && (
            <div className="flex flex-wrap gap-2">
              {isExchangeMode ? (
                <>
                  <Button
                    onClick={handleConfirmExchange}
                    disabled={selectedTilesForExchange.size === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Exchange {selectedTilesForExchange.size} Tiles
                  </Button>
                  <Button
                    onClick={() => {
                      setIsExchangeMode(false);
                      setSelectedTilesForExchange(new Set());
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConfirmMove}
                    disabled={placedTiles.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Play Word
                  </Button>
                  <Button
                    onClick={handleClearBoard}
                    disabled={placedTiles.length === 0}
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    onClick={() => setIsExchangeMode(true)}
                    disabled={gameState.tileBag.length < 7}
                    variant="outline"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Exchange
                  </Button>
                  <Button onClick={onPass} variant="outline">
                    Pass Turn
                  </Button>
                </>
              )}
            </div>
          )}

          {isExchangeMode && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Click tiles to select them for exchange. You can exchange up to
                7 tiles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placed Tiles Preview */}
      {placedTiles.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <h4 className="text-sm font-bold text-green-800 mb-2">
              Placed Tiles:
            </h4>
            <div className="flex flex-wrap gap-1">
              {placedTiles.map((pt) => (
                <div key={pt.tile.id} className="text-xs text-green-700">
                  {pt.tile.letter || "?"} at ({pt.position.row + 1},{" "}
                  {pt.position.col + 1})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
