import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  RefreshCw,
  Trophy,
  Timer,
  Target,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { MazeGameState, MazeGameLogic, Position } from './MazeGameLogic';
import { useDeviceType } from '@/hooks/use-mobile';
import { toast } from 'sonner';

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
  disabled = false
}) => {
  const { isMobile } = useDeviceType();
  const [gameTimer, setGameTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [moves, setMoves] = useState(0);
  const [trail, setTrail] = useState<Position[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.gameStatus === 'playing' && !isPaused) {
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
    if (gameState.gameStatus === 'playing') {
      setTrail(prev => {
        const newTrail = [...prev, gameState.playerPosition];
        // Keep only last 10 positions to avoid performance issues
        return newTrail.slice(-10);
      });
    }
  }, [gameState.playerPosition, gameState.gameStatus]);

  // Keyboard controls
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (disabled || gameState.gameStatus !== 'playing' || isPaused) return;

    const direction = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'w': 'up',
      's': 'down',
      'a': 'left',
      'd': 'right'
    }[event.key.toLowerCase()];

    if (direction) {
      event.preventDefault();
      handleMove(direction as 'up' | 'down' | 'left' | 'right');
    }

    if (event.key === ' ') {
      event.preventDefault();
      setIsPaused(!isPaused);
    }
  }, [disabled, gameState.gameStatus, gameState.playerPosition, isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const newPosition = MazeGameLogic.canMoveTo(
      gameState.maze,
      gameState.playerPosition,
      direction
    );

    if (newPosition) {
      // Update game state with new position
      gameState.playerPosition = newPosition;
      setMoves(prev => prev + 1);

      // Check if game is complete
      if (MazeGameLogic.isGameComplete(newPosition, gameState.endPosition)) {
        const timeTaken = Date.now() - gameState.startTime;
        const finalScore = MazeGameLogic.calculateScore(gameState, timeTaken);
        gameState.gameStatus = 'completed';
        gameState.endTime = Date.now();

        toast.success('🎉 Maze Completed!', {
          description: `Time: ${(timeTaken / 1000).toFixed(1)}s • Score: ${finalScore} • Moves: ${moves + 1}`
        });

        onGameComplete(finalScore, timeTaken);
      }
    }
  };

  const getCellClasses = (x: number, y: number) => {
    const cell = gameState.maze[y][x];
    const isPlayer = gameState.playerPosition.x === x && gameState.playerPosition.y === y;
    const isStart = gameState.startPosition.x === x && gameState.startPosition.y === y;
    const isEnd = gameState.endPosition.x === x && gameState.endPosition.y === y;
    const isInTrail = trail.some(pos => pos.x === x && pos.y === y);

    let classes = 'transition-all duration-300 relative overflow-hidden ';

    if (cell.isWall) {
      classes += 'bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 border border-slate-700 shadow-inner';
      // Add some texture to walls
      classes += ' before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-600/20 before:to-transparent';
    } else {
      classes += 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm';
      // Add subtle glow to paths
      classes += ' before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent';
    }

    if (isPlayer) {
      classes += ' !bg-gradient-to-br !from-emerald-400 !via-green-500 !to-emerald-600 !border-2 !border-emerald-300 !shadow-xl !scale-110 animate-pulse';
      classes += ' after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/30 after:to-transparent after:animate-pulse';
    } else if (isEnd) {
      classes += ' !bg-gradient-to-br !from-yellow-400 !via-orange-500 !to-red-500 !border-2 !border-yellow-300 !shadow-lg animate-bounce';
      classes += ' after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/50 after:to-transparent';
    } else if (isStart) {
      classes += ' !bg-gradient-to-br !from-blue-400 !via-cyan-500 !to-blue-600 !border-2 !border-blue-300 !shadow-lg';
      classes += ' after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/40 after:to-transparent';
    } else if (isInTrail && !cell.isWall) {
      classes += ' !bg-gradient-to-br !from-green-100 !via-emerald-100 !to-green-200 !border !border-green-300';
      classes += ' after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/20 after:to-transparent';
    }

    return classes;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${centiseconds.toString().padStart(2, '0')}s`;
  };

  const getDifficultyColor = () => {
    switch (gameState.difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-rose-600';
    }
  };

  const cellSize = isMobile ?
    Math.max(12, Math.min(18, 350 / gameState.size)) :
    Math.max(18, Math.min(28, 600 / gameState.size));

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-4 border-transparent bg-clip-padding shadow-2xl">
      {/* Enhanced card background with glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-sm opacity-30"></div>
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-white/50 backdrop-blur-sm">
        <CardContent className="p-6 md:p-8">
        {/* Game Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-gradient-to-r ${getDifficultyColor()} rounded-xl text-white shadow-lg`}>
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🧩 Maze Challenge
                <Badge className={`bg-gradient-to-r ${getDifficultyColor()} text-white border-0`}>
                  <Crown className="h-3 w-3 mr-1" />
                  {gameState.difficulty.toUpperCase()}
                </Badge>
              </h3>
              <p className="text-sm text-gray-600">
                Size: {gameState.size}×{gameState.size} • Target Score: {gameState.score}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="outline"
              size="sm"
              disabled={gameState.gameStatus !== 'playing'}
              className="flex items-center gap-2"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? 'Resume' : 'Pause'}
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
            <div className="text-lg font-bold text-gray-800">{formatTime(gameTimer)}</div>
            <div className="text-xs text-gray-600">Time</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
            <Zap className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">{moves}</div>
            <div className="text-xs text-gray-600">Moves</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-yellow-200 text-center">
            <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">{gameState.score}</div>
            <div className="text-xs text-gray-600">Score</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
            <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800">
              {gameState.gameStatus === 'completed' ? '🎉' :
               gameState.gameStatus === 'playing' ? '🎮' : '⏳'}
            </div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        {/* Maze Board */}
        <div className="relative bg-gradient-to-br from-slate-100 via-gray-50 to-indigo-50 rounded-2xl border-4 border-gradient-to-r from-indigo-300 to-purple-300 p-6 shadow-2xl overflow-auto">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl"></div>
          </div>

          {isPaused && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center z-10">
              <div className="bg-white rounded-2xl p-8 text-center shadow-2xl border-2 border-indigo-200 transform scale-105">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30"></div>
                  <Pause className="relative h-16 w-16 text-indigo-600 mx-auto mb-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Game Paused</h3>
                <p className="text-gray-600 mb-6 text-lg">Press Space or click Resume to continue</p>
                <Button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  Resume Game
                </Button>
              </div>
            </div>
          )}

          {/* Maze container with enhanced styling */}
          <div className="relative">
            {/* Maze glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl"></div>

            <div
              className="relative grid gap-1 mx-auto bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 p-4 rounded-xl shadow-2xl border-2 border-slate-700"
              style={{
                gridTemplateColumns: `repeat(${gameState.size}, ${cellSize}px)`,
                maxWidth: 'fit-content'
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
                    minHeight: `${cellSize}px`
                  }}
                >
                  {/* Player */}
                  {gameState.playerPosition.x === x && gameState.playerPosition.y === y && (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold relative z-10">
                      <span
                        className="text-xl drop-shadow-lg transform transition-transform duration-300 hover:scale-110"
                        style={{ fontSize: `${Math.max(12, cellSize * 0.7)}px` }}
                      >
                        🏃‍♂️
                      </span>
                    </div>
                  )}
                  {/* Start */}
                  {gameState.startPosition.x === x && gameState.startPosition.y === y &&
                   !(gameState.playerPosition.x === x && gameState.playerPosition.y === y) && (
                    <div className="w-full h-full flex items-center justify-center text-white relative z-10">
                      <span
                        className="drop-shadow-lg animate-pulse"
                        style={{ fontSize: `${Math.max(12, cellSize * 0.7)}px` }}
                      >
                        🚀
                      </span>
                    </div>
                  )}
                  {/* End */}
                  {gameState.endPosition.x === x && gameState.endPosition.y === y && (
                    <div className="w-full h-full flex items-center justify-center text-white relative z-10">
                      <span
                        className="drop-shadow-lg animate-bounce"
                        style={{ fontSize: `${Math.max(12, cellSize * 0.8)}px` }}
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
                  {!gameState.maze[y][x].isWall && !gameState.playerPosition.x === x && !gameState.playerPosition.y === y && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200/10 via-indigo-200/5 to-purple-200/10 opacity-50"></div>
                  )}
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Controls */}
        {isMobile && gameState.gameStatus === 'playing' && (
          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
              <span className="text-xl">📱</span>
              Touch Controls
            </h4>
            <div className="grid grid-cols-3 gap-3 max-w-56 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div></div>
              <Button
                onTouchStart={() => handleMove('up')}
                variant="outline"
                size="lg"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-xl font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isPaused}
              >
                ↑
              </Button>
              <div></div>

              <Button
                onTouchStart={() => handleMove('left')}
                variant="outline"
                size="lg"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-xl font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isPaused}
              >
                ←
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-purple-400">
                  🎮
                </div>
              </div>
              <Button
                onTouchStart={() => handleMove('right')}
                variant="outline"
                size="lg"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-xl font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isPaused}
              >
                →
              </Button>

              <div></div>
              <Button
                onTouchStart={() => handleMove('down')}
                variant="outline"
                size="lg"
                className="aspect-square bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-xl font-bold rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isPaused}
              >
                ↓
              </Button>
              <div></div>
            </div>

            {/* Control hints */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 inline-block border border-gray-200">
                💡 <strong>Tip:</strong> Tap and hold for continuous movement
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isMobile ?
              '🎯 Use touch controls or swipe to move • 🏆 Reach the golden trophy to win!' :
              '🎯 Use arrow keys or WASD to move • Space to pause • 🏆 Reach the trophy to win!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};