import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DotsAndBoxesProps {
  gameId?: string;
  onBackToLobby?: () => void;
  playerColor?: "player1" | "player2";
  isPlayerTurn?: boolean;
  onMove?: (move: any) => void;
}

interface GameState {
  horizontalLines: boolean[][];
  verticalLines: boolean[][];
  boxes: ("player1" | "player2" | null)[][];
  currentPlayer: "player1" | "player2";
  scores: { player1: number; player2: number };
}

export const DotsAndBoxes: React.FC<DotsAndBoxesProps> = ({
  gameId,
  onBackToLobby,
  playerColor = "player1",
  isPlayerTurn = true,
  onMove,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    horizontalLines: Array(4)
      .fill(null)
      .map(() => Array(5).fill(false)),
    verticalLines: Array(5)
      .fill(null)
      .map(() => Array(4).fill(false)),
    boxes: Array(4)
      .fill(null)
      .map(() => Array(4).fill(null)),
    currentPlayer: "player1",
    scores: { player1: 0, player2: 0 },
  });

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const checkBox = (row: number, col: number): "player1" | "player2" | null => {
    const { horizontalLines, verticalLines } = gameState;

    // Check if all 4 sides of the box are drawn
    const top = horizontalLines[row][col];
    const bottom = horizontalLines[row + 1][col];
    const left = verticalLines[row][col];
    const right = verticalLines[row][col + 1];

    if (top && bottom && left && right) {
      return gameState.currentPlayer;
    }
    return null;
  };

  const handleLineClick = (
    type: "horizontal" | "vertical",
    row: number,
    col: number,
  ) => {
    if (!isPlayerTurn || gameOver) return;

    const newGameState = { ...gameState };
    let boxesCompleted = 0;

    if (type === "horizontal") {
      if (newGameState.horizontalLines[row][col]) return;
      newGameState.horizontalLines[row][col] = true;
    } else {
      if (newGameState.verticalLines[row][col]) return;
      newGameState.verticalLines[row][col] = true;
    }

    // Check for completed boxes
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!newGameState.boxes[r][c]) {
          const boxOwner = checkBoxWithState(newGameState, r, c);
          if (boxOwner) {
            newGameState.boxes[r][c] = boxOwner;
            newGameState.scores[boxOwner]++;
            boxesCompleted++;
          }
        }
      }
    }

    // If no boxes were completed, switch players
    if (boxesCompleted === 0) {
      newGameState.currentPlayer =
        newGameState.currentPlayer === "player1" ? "player2" : "player1";
    }

    setGameState(newGameState);

    // Check for game over
    const totalBoxes =
      newGameState.scores.player1 + newGameState.scores.player2;
    if (totalBoxes === 16) {
      setGameOver(true);
      const winner =
        newGameState.scores.player1 > newGameState.scores.player2
          ? "player1"
          : newGameState.scores.player2 > newGameState.scores.player1
            ? "player2"
            : "tie";
      setWinner(winner);
      toast(winner === "tie" ? "Game ended in a tie!" : `${winner} wins!`);
    }

    // Send move to server if in multiplayer
    if (onMove && gameId) {
      onMove({ type, row, col, gameState: newGameState });
    }
  };

  const checkBoxWithState = (
    state: GameState,
    row: number,
    col: number,
  ): "player1" | "player2" | null => {
    const { horizontalLines, verticalLines } = state;

    const top = horizontalLines[row][col];
    const bottom = horizontalLines[row + 1][col];
    const left = verticalLines[row][col];
    const right = verticalLines[row][col + 1];

    if (top && bottom && left && right) {
      return state.currentPlayer;
    }
    return null;
  };

  const resetGame = () => {
    setGameState({
      horizontalLines: Array(4)
        .fill(null)
        .map(() => Array(5).fill(false)),
      verticalLines: Array(5)
        .fill(null)
        .map(() => Array(4).fill(false)),
      boxes: Array(4)
        .fill(null)
        .map(() => Array(4).fill(null)),
      currentPlayer: "player1",
      scores: { player1: 0, player2: 0 },
    });
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 rounded-xl shadow-2xl border-4 border-yellow-400 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="text-white text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Dots and Boxes</h2>
          <div className="flex justify-center space-x-8 text-lg">
            <span
              className={`${playerColor === "player1" ? "text-blue-400" : "text-red-400"}`}
            >
              Player 1: {gameState.scores.player1}
            </span>
            <span
              className={`${playerColor === "player2" ? "text-red-400" : "text-blue-400"}`}
            >
              Player 2: {gameState.scores.player2}
            </span>
          </div>
          {!gameOver && (
            <p className="text-sm mt-2">
              Current Turn:{" "}
              {gameState.currentPlayer === playerColor
                ? "Your turn"
                : "Opponent's turn"}
            </p>
          )}
          {gameOver && (
            <p className="text-xl font-bold text-yellow-400 mt-2">
              {winner === "tie" ? "Game Tied!" : `${winner} Wins!`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-9 gap-1 bg-white p-3 sm:p-4 rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          {Array(9)
            .fill(null)
            .map((_, rowIndex) =>
              Array(9)
                .fill(null)
                .map((_, colIndex) => {
                  const isDot = rowIndex % 2 === 0 && colIndex % 2 === 0;
                  const isHorizontalLine =
                    rowIndex % 2 === 0 && colIndex % 2 === 1;
                  const isVerticalLine =
                    rowIndex % 2 === 1 && colIndex % 2 === 0;
                  const isBox = rowIndex % 2 === 1 && colIndex % 2 === 1;

                  if (isDot) {
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-5 h-5 sm:w-4 sm:h-4 bg-black rounded-full"
                      />
                    );
                  }

                  if (isHorizontalLine) {
                    const lineRow = Math.floor(rowIndex / 2);
                    const lineCol = Math.floor(colIndex / 2);
                    const isDrawn =
                      gameState.horizontalLines[lineRow]?.[lineCol];

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() =>
                          handleLineClick("horizontal", lineRow, lineCol)
                        }
                        className={`w-10 h-2 sm:w-8 sm:h-1 transition-colors ${
                          isDrawn
                            ? "bg-blue-600"
                            : "bg-gray-300 hover:bg-gray-400"
                        } ${!isPlayerTurn || gameOver ? "cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!isPlayerTurn || gameOver || isDrawn}
                      />
                    );
                  }

                  if (isVerticalLine) {
                    const lineRow = Math.floor(rowIndex / 2);
                    const lineCol = Math.floor(colIndex / 2);
                    const isDrawn = gameState.verticalLines[lineRow]?.[lineCol];

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() =>
                          handleLineClick("vertical", lineRow, lineCol)
                        }
                        className={`w-2 h-10 sm:w-1 sm:h-8 transition-colors ${
                          isDrawn
                            ? "bg-blue-600"
                            : "bg-gray-300 hover:bg-gray-400"
                        } ${!isPlayerTurn || gameOver ? "cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!isPlayerTurn || gameOver || isDrawn}
                      />
                    );
                  }

                  if (isBox) {
                    const boxRow = Math.floor(rowIndex / 2);
                    const boxCol = Math.floor(colIndex / 2);
                    const boxOwner = gameState.boxes[boxRow]?.[boxCol];

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded ${
                          boxOwner === "player1"
                            ? "bg-blue-200 text-blue-800"
                            : boxOwner === "player2"
                              ? "bg-red-200 text-red-800"
                              : "bg-gray-100"
                        }`}
                      >
                        {boxOwner && (
                          <span className="text-sm sm:text-xs font-bold">
                            {boxOwner === "player1" ? "1" : "2"}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="w-4 h-4" />
                  );
                }),
            )}
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          {gameOver && (
            <Button
              onClick={resetGame}
              className="bg-green-600 hover:bg-green-700"
            >
              Play Again
            </Button>
          )}
          {onBackToLobby && (
            <Button onClick={onBackToLobby} variant="outline">
              Back to Lobby
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
