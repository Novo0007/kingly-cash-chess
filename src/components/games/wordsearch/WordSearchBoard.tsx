import React, { useState, useRef, useEffect, useCallback } from "react";
import { GameState, Position } from "./WordSearchGameLogic";

interface WordSearchBoardProps {
  gameState: GameState;
  onWordFound: (start: Position, end: Position) => void;
  isActive: boolean;
}

interface DragState {
  isDragging: boolean;
  startCell: Position | null;
  currentCell: Position | null;
  selectedCells: Position[];
}

export const WordSearchBoard: React.FC<WordSearchBoardProps> = ({
  gameState,
  onWordFound,
  isActive,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startCell: null,
    currentCell: null,
    selectedCells: [],
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);

  // Calculate cell size based on container width
  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const containerWidth = boardRef.current.clientWidth;
        const padding = 32; // Account for padding
        const availableWidth = containerWidth - padding;
        const calculatedSize = Math.floor(availableWidth / gameState.gridSize);

        // Constrain between min and max sizes
        const minSize = 20;
        const maxSize = 50;
        const finalSize = Math.max(minSize, Math.min(maxSize, calculatedSize));

        setCellSize(finalSize);
      }
    };

    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, [gameState.gridSize]);

  const getCellPosition = useCallback(
    (element: HTMLElement): Position | null => {
      const row = parseInt(element.dataset.row || "-1");
      const col = parseInt(element.dataset.col || "-1");

      if (
        row >= 0 &&
        col >= 0 &&
        row < gameState.gridSize &&
        col < gameState.gridSize
      ) {
        return { row, col };
      }

      return null;
    },
    [gameState.gridSize],
  );

  const isValidPath = useCallback((start: Position, end: Position): boolean => {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    // Check if it's horizontal, vertical, or diagonal
    return (
      rowDiff === 0 || // horizontal
      colDiff === 0 || // vertical
      Math.abs(rowDiff) === Math.abs(colDiff) // diagonal
    );
  }, []);

  const getPathCells = useCallback(
    (start: Position, end: Position): Position[] => {
      if (!isValidPath(start, end)) {
        return [];
      }

      const cells: Position[] = [];
      const rowStep = end.row === start.row ? 0 : end.row > start.row ? 1 : -1;
      const colStep = end.col === start.col ? 0 : end.col > start.col ? 1 : -1;

      let currentRow = start.row;
      let currentCol = start.col;

      while (true) {
        cells.push({ row: currentRow, col: currentCol });

        if (currentRow === end.row && currentCol === end.col) {
          break;
        }

        currentRow += rowStep;
        currentCol += colStep;
      }

      return cells;
    },
    [isValidPath],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target.classList.contains("word-cell")) {
        const position = getCellPosition(target);
        if (position) {
          setDragState({
            isDragging: true,
            startCell: position,
            currentCell: position,
            selectedCells: [position],
          });
        }
      }
    },
    [isActive, getCellPosition],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.isDragging || !dragState.startCell) return;

      const target = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement;
      if (target && target.classList.contains("word-cell")) {
        const position = getCellPosition(target);
        if (
          position &&
          (position.row !== dragState.currentCell?.row ||
            position.col !== dragState.currentCell?.col)
        ) {
          const pathCells = getPathCells(dragState.startCell, position);
          setDragState((prev) => ({
            ...prev,
            currentCell: position,
            selectedCells: pathCells,
          }));
        }
      }
    },
    [
      dragState.isDragging,
      dragState.startCell,
      dragState.currentCell,
      getCellPosition,
      getPathCells,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (
      !dragState.isDragging ||
      !dragState.startCell ||
      !dragState.currentCell
    ) {
      setDragState({
        isDragging: false,
        startCell: null,
        currentCell: null,
        selectedCells: [],
      });
      return;
    }

    // Check if we have a valid path with at least 2 cells
    if (dragState.selectedCells.length >= 2) {
      onWordFound(dragState.startCell, dragState.currentCell);
    }

    setDragState({
      isDragging: false,
      startCell: null,
      currentCell: null,
      selectedCells: [],
    });
  }, [dragState, onWordFound]);

  // Enhanced touch events for mobile with better responsiveness
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isActive) return;

      e.preventDefault(); // Prevent context menu and other touch behaviors
      const touch = e.touches[0];
      const target = document.elementFromPoint(
        touch.clientX,
        touch.clientY,
      ) as HTMLElement;

      if (target && target.classList.contains("word-cell")) {
        const position = getCellPosition(target);
        if (position) {
          // Add haptic feedback for mobile
          if (window.navigator && (window.navigator as any).vibrate) {
            (window.navigator as any).vibrate(10);
          }

          setDragState({
            isDragging: true,
            startCell: position,
            currentCell: position,
            selectedCells: [position],
          });
        }
      }
    },
    [isActive, getCellPosition],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragState.isDragging || !dragState.startCell) return;

      e.preventDefault(); // Prevent scrolling and page interactions
      const touch = e.touches[0];

      // Use a slightly larger touch area for better mobile experience
      const touchRadius = 10;
      let target = document.elementFromPoint(
        touch.clientX,
        touch.clientY,
      ) as HTMLElement;

      // If no direct hit, try nearby points for better touch detection
      if (!target || !target.classList.contains("word-cell")) {
        for (const offset of [
          [-touchRadius, 0],
          [touchRadius, 0],
          [0, -touchRadius],
          [0, touchRadius],
          [-touchRadius, -touchRadius],
          [touchRadius, touchRadius],
          [-touchRadius, touchRadius],
          [touchRadius, -touchRadius],
        ]) {
          const nearbyTarget = document.elementFromPoint(
            touch.clientX + offset[0],
            touch.clientY + offset[1],
          ) as HTMLElement;

          if (nearbyTarget && nearbyTarget.classList.contains("word-cell")) {
            target = nearbyTarget;
            break;
          }
        }
      }

      if (target && target.classList.contains("word-cell")) {
        const position = getCellPosition(target);
        if (
          position &&
          (position.row !== dragState.currentCell?.row ||
            position.col !== dragState.currentCell?.col)
        ) {
          const pathCells = getPathCells(dragState.startCell, position);
          setDragState((prev) => ({
            ...prev,
            currentCell: position,
            selectedCells: pathCells,
          }));
        }
      }
    },
    [
      dragState.isDragging,
      dragState.startCell,
      dragState.currentCell,
      getCellPosition,
      getPathCells,
    ],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      // Add completion haptic feedback
      if (window.navigator && (window.navigator as any).vibrate) {
        if (dragState.selectedCells.length >= 2) {
          (window.navigator as any).vibrate([20, 50, 20]); // Success pattern
        }
      }

      handleMouseUp();
    },
    [handleMouseUp, dragState.selectedCells.length],
  );

  const isCellSelected = useCallback(
    (row: number, col: number): boolean => {
      return dragState.selectedCells.some(
        (cell) => cell.row === row && cell.col === col,
      );
    },
    [dragState.selectedCells],
  );

  const getCellClassName = useCallback(
    (row: number, col: number): string => {
      const cell = gameState.grid[row][col];
      let className =
        "word-cell flex items-center justify-center font-bold text-sm md:text-base border border-gray-300 cursor-pointer select-none transition-all duration-150";

      // Base styling
      if (cell.isFound) {
        className += " bg-green-200 text-green-800 border-green-400";
      } else if (cell.hintHighlight) {
        className +=
          " bg-yellow-200 text-yellow-800 border-yellow-400 animate-pulse";
      } else if (isCellSelected(row, col)) {
        className += " bg-blue-200 text-blue-800 border-blue-400";
      } else {
        className += " bg-white text-gray-800 hover:bg-gray-50";
      }

      return className;
    },
    [gameState.grid, isCellSelected],
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gameState.gridSize}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${gameState.gridSize}, ${cellSize}px)`,
    gap: "1px",
    padding: "16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    justifyContent: "center",
    maxWidth: "100%",
    overflow: "auto",
  };

  const cellStyle = {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    fontSize: cellSize < 30 ? "10px" : cellSize < 40 ? "12px" : "14px",
  };

  return (
    <div className="w-full flex justify-center">
      <div
        ref={boardRef}
        className="word-search-board"
        style={gridStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {gameState.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              style={cellStyle}
              data-row={rowIndex}
              data-col={colIndex}
            >
              {cell.letter}
            </div>
          )),
        )}
      </div>
    </div>
  );
};
