import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  ChevronRight,
  Play,
  Lock,
  CheckCircle,
} from "lucide-react";
import { WordSearchBoard } from "./WordSearchBoard";
import { EnhancedLeaderboard } from "./EnhancedLeaderboard";
import { WordSearchGameLogic, GameState } from "./WordSearchGameLogic";
import {
  getUserCoinBalance,
  saveWordSearchScore,
  recordHintUsage,
  deductCoins,
} from "@/utils/wordsearchDbHelper";
import {
  LEVELS,
  getLevelInfo,
  getNextLevel,
  calculateLevelScore,
  shouldUnlockNextLevel,
  type Level,
} from "@/utils/levelSystem";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useTheme } from "@/contexts/ThemeContext";
import type { User } from "@supabase/supabase-js";

interface LevelProgressionGameProps {
  onBack: () => void;
  user: User;
}

type GameView = "levels" | "playing" | "completed" | "leaderboard";

export const LevelProgressionGame: React.FC<LevelProgressionGameProps> = ({
  onBack,
  user,
}) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [currentView, setCurrentView] = useState<GameView>("levels");
  const [gameLogic, setGameLogic] = useState<WordSearchGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [hintsRemaining, setHintsRemaining] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(
    new Set([1]),
  );
  const [levelScores, setLevelScores] = useState<Map<number, number>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(
      `wordsearch_progress_${user.id}`,
    );
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setUnlockedLevels(new Set(progress.unlockedLevels || [1]));
        setLevelScores(new Map(progress.levelScores || []));
        setCurrentLevel(progress.currentLevel || 1);
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    }
  }, [user.id]);

  // Save user progress to localStorage
  const saveProgress = useCallback(() => {
    const progress = {
      unlockedLevels: Array.from(unlockedLevels),
      levelScores: Array.from(levelScores.entries()),
      currentLevel,
    };
    localStorage.setItem(
      `wordsearch_progress_${user.id}`,
      JSON.stringify(progress),
    );
  }, [unlockedLevels, levelScores, currentLevel, user.id]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Fetch user's coin balance
  const fetchCoinBalance = useCallback(async () => {
    try {
      const result = await getUserCoinBalance(user.id);
      if (result.success) {
        setCoinBalance(result.balance || 100);
      } else {
        setCoinBalance(100);
      }
    } catch (error) {
      setCoinBalance(100);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCoinBalance();
  }, [fetchCoinBalance]);

  // Timer for countdown
  useEffect(() => {
    if (gameLogic && gameState?.gameStatus === "active") {
      const timer = setInterval(() => {
        const remaining = gameLogic.getTimeRemaining();
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          handleGameEnd();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameLogic, gameState?.gameStatus]);

  const startLevel = async (level: number) => {
    const levelInfo = getLevelInfo(level);
    if (!levelInfo) {
      toast.error("Level not found!");
      return;
    }

    if (!unlockedLevels.has(level)) {
      toast.error("This level is locked!");
      return;
    }

    setIsLoading(true);
    setCurrentLevel(level);
    setHintsRemaining(3); // Reset hints for new level

    try {
      // Create the game logic with level parameters
      const logic = new WordSearchGameLogic(
        levelInfo.difficulty as "easy" | "medium" | "hard",
        levelInfo.gridSize,
        levelInfo.wordCount,
        false, // not multiplayer
        0, // no entry fee for level mode
      );

      // Add player
      const player = {
        id: user.id,
        username: user.email?.split("@")[0] || "Player",
        score: 0,
        wordsFound: [],
        hintsUsed: 0,
        isOnline: true,
      };

      logic.addPlayer(player);
      logic.startGame();

      setGameLogic(logic);
      setGameState(logic.getGameState());
      setTimeRemaining(logic.getTimeRemaining());
      setCurrentView("playing");

      toast.success(
        `Level ${level}: ${levelInfo.theme} - Find ${levelInfo.wordCount} words!`,
      );
    } catch (error) {
      console.error("Error starting level:", error);
      toast.error("Failed to start level. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameEnd = async () => {
    if (!gameLogic || !gameState) return;

    const levelInfo = getLevelInfo(currentLevel);
    if (!levelInfo) return;

    const wordsFound = gameState.foundWords.length;
    const timeTaken = Math.floor(
      (Date.now() - (gameState.startTime || Date.now())) / 1000,
    );
    const hintsUsed = Math.max(0, 3 - ((gameState as any).hints || 0));

    const finalScore = calculateLevelScore(
      levelInfo,
      timeTaken,
      wordsFound,
      hintsUsed,
    );

    // Update level score if it's better
    const previousScore = levelScores.get(currentLevel) || 0;
    if (finalScore > previousScore) {
      setLevelScores((prev) => new Map(prev.set(currentLevel, finalScore)));
    }

    // Check if next level should be unlocked
    if (shouldUnlockNextLevel(finalScore, levelInfo)) {
      const nextLevel = currentLevel + 1;
      if (nextLevel <= 99 && !unlockedLevels.has(nextLevel)) {
        setUnlockedLevels((prev) => new Set(prev.add(nextLevel)));
        toast.success(`🎉 Level ${nextLevel} unlocked!`);
      }
    }

    // Save score to database
    try {
      await saveWordSearchScore({
        user_id: user.id, // Fixed property name
        username: user.email?.split("@")[0] || "Player",
        score: finalScore,
        difficulty:
          levelInfo.difficulty === "expert"
            ? "hard"
            : (levelInfo.difficulty as "easy" | "medium" | "hard"), // Map expert to hard
        game_mode: "solo", // Fixed property name
        grid_size: levelInfo.gridSize, // Fixed property name
        words_found: wordsFound, // Fixed property name
        total_words: levelInfo.wordCount, // Fixed property name
        time_taken: timeTaken, // Fixed property name
        hints_used: hintsUsed, // Fixed property name
        coins_spent: 0,
        coins_won: Math.floor(finalScore / 10), // Fixed property name
        is_solo_game: true,
      });
    } catch (error) {
      console.error("Error saving score:", error);
    }

    setCurrentView("completed");
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds); // Ensure no decimals
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "expert":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLevelCardClass = (level: number) => {
    const isUnlocked = unlockedLevels.has(level);
    const isCompleted = levelScores.has(level);
    const isCurrent = level === currentLevel;

    if (!isUnlocked) {
      return "bg-muted/50 border-muted text-muted-foreground opacity-60";
    }
    if (isCompleted) {
      return `bg-gradient-to-r ${currentTheme.gradients.accent}/10 border-primary/30 text-foreground`;
    }
    if (isCurrent) {
      return `bg-gradient-to-r ${currentTheme.gradients.primary}/10 border-primary/50 text-foreground ring-2 ring-primary/20`;
    }
    return "bg-card border-border text-foreground hover:bg-muted/50";
  };

  const renderLevelSelection = () => {
    const levelsPerPage = 12;
    const currentPage = Math.floor((currentLevel - 1) / levelsPerPage);
    const startLevelIndex = currentPage * levelsPerPage + 1;
    const endLevel = Math.min(startLevelIndex + levelsPerPage - 1, 99);

    return (
      <div className="space-y-4">
        {/* Header */}
        <Card
          className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("leaderboard")}
                className="text-white hover:bg-white/20"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl mb-2">
                Word Search Levels
              </CardTitle>
              <p className="text-white/80">
                Complete levels to unlock new challenges
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {unlockedLevels.size}/99 levels unlocked
              </span>
            </div>
            <Progress
              value={(unlockedLevels.size / 99) * 100}
              className="mb-2"
            />
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="font-bold text-primary">{levelScores.size}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="font-bold text-primary">
                  {Array.from(levelScores.values())
                    .reduce((sum, score) => sum + score, 0)
                    .toLocaleString()}
                </div>
                <div className="text-muted-foreground">Total Score</div>
              </div>
              <div>
                <div className="font-bold text-primary">
                  {Math.max(...Array.from(levelScores.values()), 0)}
                </div>
                <div className="text-muted-foreground">Best Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LEVELS.slice(startLevelIndex - 1, endLevel).map((level) => {
            const isUnlocked = unlockedLevels.has(level.level);
            const isCompleted = levelScores.has(level.level);
            const score = levelScores.get(level.level);

            return (
              <Card
                key={level.level}
                className={`${getLevelCardClass(level.level)} transition-all duration-200 hover:shadow-md cursor-pointer`}
                onClick={() => isUnlocked && startLevel(level.level)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {!isUnlocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Play className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div className="text-lg font-bold mb-1">
                      Level {level.level}
                    </div>

                    <Badge className={getDifficultyColor(level.difficulty)}>
                      {level.difficulty}
                    </Badge>

                    <div className="text-xs text-muted-foreground mt-2">
                      {level.theme}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {level.gridSize}×{level.gridSize} • {level.wordCount}{" "}
                      words
                    </div>

                    {isCompleted && score && (
                      <div className="text-sm font-bold text-primary mt-2">
                        ⭐ {score.toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        {(startLevelIndex > 1 || endLevel < 99) && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              disabled={startLevelIndex <= 1}
              onClick={() =>
                setCurrentLevel(Math.max(1, startLevelIndex - levelsPerPage))
              }
            >
              Previous Levels
            </Button>
            <span className="text-sm text-muted-foreground">
              Levels {startLevelIndex} - {endLevel}
            </span>
            <Button
              variant="outline"
              disabled={endLevel >= 99}
              onClick={() => setCurrentLevel(Math.min(99, endLevel + 1))}
            >
              Next Levels
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderGameplay = () => {
    const levelInfo = getLevelInfo(currentLevel);
    if (!gameLogic || !gameState || !levelInfo) return null;

    return (
      <div className="space-y-4">
        {/* Game Rules Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold text-blue-800 mb-2">📋 Game Rules</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  🎯 Find all {levelInfo.wordCount}{" "}
                  {levelInfo.theme.toLowerCase()} words in the grid
                </p>
                <p>
                  ⏰ Complete within {Math.floor(levelInfo.timeLimit / 60)}:
                  {(levelInfo.timeLimit % 60).toString().padStart(2, "0")}{" "}
                  minutes
                </p>
                <p>
                  ✏️ Drag to select words horizontally, vertically, or
                  diagonally
                </p>
                <p>💡 Use hints if you get stuck (limited to 3 per level)</p>
                <p>
                  ⭐ Score {levelInfo.requiredScore}+ points to unlock next
                  level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Header */}
        <Card
          className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Level {currentLevel}</h2>
                <p className="text-white/80 text-sm">{levelInfo.theme}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/80">Time Remaining</div>
                <div className="text-xl font-bold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-white/80">Found</div>
                <div className="font-bold">
                  {gameState.foundWords.length}/{levelInfo.wordCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/80">Score</div>
                <div className="font-bold">
                  {gameState.players[0]?.score || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/80">Target</div>
                <div className="font-bold text-yellow-200">
                  {levelInfo.requiredScore}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/80">Hints Left</div>
                <div className="font-bold">{hintsRemaining}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Words to Find */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Words to Find ({gameState.foundWords.length}/{levelInfo.wordCount}
              )
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {gameState.words.map((word, index) => {
                const isFound = gameState.foundWords.some(
                  (fw) => fw.word === word,
                );
                return (
                  <div
                    key={index}
                    className={`p-2 text-center rounded-lg border transition-all duration-200 ${
                      isFound
                        ? "bg-green-100 text-green-800 border-green-300 line-through scale-95"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">{word}</span>
                    {isFound && <span className="ml-1">✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-center">
              <div
                className={`text-sm px-3 py-1 rounded-full ${
                  gameState.foundWords.length === levelInfo.wordCount
                    ? "bg-green-100 text-green-800"
                    : gameState.foundWords.length >= levelInfo.wordCount * 0.7
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                Progress:{" "}
                {Math.round(
                  (gameState.foundWords.length / levelInfo.wordCount) * 100,
                )}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Board */}
        <WordSearchBoard
          gameState={gameState}
          onWordFound={(start, end) => {
            if (!gameLogic || !gameState) return;

            const result = gameLogic.findWord(user.id, start, end);

            if (result.success && result.word && result.points) {
              const newState = gameLogic.getGameState();
              setGameState(newState);

              // Check if game is complete
              if (gameLogic.isGameComplete()) {
                handleGameEnd();
              }
            }
          }}
          isActive={gameState.gameStatus === "active"}
        />

        {/* Game Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentView("levels");
                  setGameLogic(null);
                  setGameState(null);
                }}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quit Level
              </Button>
              <Button
                onClick={async () => {
                  if (hintsRemaining > 0) {
                    // Use regular hint
                    const remainingWords = gameState.words.filter(
                      (word) =>
                        !gameState.foundWords.some((fw) => fw.word === word),
                    );
                    if (remainingWords.length > 0 && gameLogic) {
                      const targetWord =
                        remainingWords[
                          Math.floor(Math.random() * remainingWords.length)
                        ];
                      gameLogic.useHint(user.id, "word_location", targetWord);
                      setGameState(gameLogic.getGameState());
                      setHintsRemaining((prev) => prev - 1);

                      // Record hint usage
                      await recordHintUsage(
                        user.id,
                        null, // level mode, no game ID
                        "word_location",
                        targetWord,
                        0, // free hint
                      );

                      // Clear hints after 3 seconds
                      setTimeout(() => {
                        if (gameLogic) {
                          gameLogic.clearHints();
                          setGameState(gameLogic.getGameState());
                        }
                      }, 3000);
                    }
                  } else {
                    // Buy hint with coins
                    if (coinBalance >= 5) {
                      const result = await deductCoins(
                        user.id,
                        5,
                        null, // level mode
                        "Purchased hint in level mode",
                        "hint_purchase",
                      );

                      if (result.success) {
                        setCoinBalance(result.newBalance || 0);
                        const remainingWords = gameState.words.filter(
                          (word) =>
                            !gameState.foundWords.some(
                              (fw) => fw.word === word,
                            ),
                        );
                        if (remainingWords.length > 0 && gameLogic) {
                          const targetWord =
                            remainingWords[
                              Math.floor(Math.random() * remainingWords.length)
                            ];
                          gameLogic.useHint(
                            user.id,
                            "word_location",
                            targetWord,
                          );
                          setGameState(gameLogic.getGameState());

                          // Record hint usage
                          await recordHintUsage(
                            user.id,
                            null,
                            "word_location",
                            targetWord,
                            5,
                          );

                          toast.success("💡 Hint purchased and used!");

                          // Clear hints after 3 seconds
                          setTimeout(() => {
                            if (gameLogic) {
                              gameLogic.clearHints();
                              setGameState(gameLogic.getGameState());
                            }
                          }, 3000);
                        }
                      } else {
                        toast.error(result.error || "Failed to purchase hint");
                      }
                    } else {
                      toast.error(
                        "Not enough coins! You need 5 coins to buy a hint.",
                      );
                    }
                  }
                }}
                className="w-full"
              >
                {hintsRemaining > 0 ? (
                  <>💡 Use Hint ({hintsRemaining} left)</>
                ) : (
                  <>💰 Buy Hint (5 coins)</>
                )}
              </Button>
            </div>

            {/* Coin Balance & Hint Info */}
            <div className="mt-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-yellow-600">💰</span>
                <span className="font-medium">{coinBalance} coins</span>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Look for words in all directions - horizontal, vertical,
                and diagonal!
              </p>
              {hintsRemaining === 0 && (
                <p className="text-xs text-orange-600">
                  💰 Out of free hints? Buy more for 5 coins each!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCompleted = () => {
    const levelInfo = getLevelInfo(currentLevel);
    if (!levelInfo || !gameState) return null;

    const wordsFound = gameState.foundWords.length;
    const timeTaken = Math.floor(
      (Date.now() - (gameState.startTime || Date.now())) / 1000,
    );
    const hintsUsed = Math.max(0, 3 - ((gameState as any).hints || 0));
    const finalScore = calculateLevelScore(
      levelInfo,
      timeTaken,
      wordsFound,
      hintsUsed,
    );
    const nextLevel = getNextLevel(currentLevel);
    const canUnlockNext = shouldUnlockNextLevel(finalScore, levelInfo);

    return (
      <div className="space-y-4">
        <Card
          className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              Level {currentLevel} Complete!
            </CardTitle>
            <p className="text-white/80">Great job on {levelInfo.theme}!</p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-3xl font-bold text-primary">
                {finalScore.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Final Score</div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold">
                    {wordsFound}/{levelInfo.wordCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Words Found
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {formatTime(timeTaken)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Taken
                  </div>
                </div>
              </div>

              {canUnlockNext && nextLevel && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="text-green-700 font-medium">
                    🎉 Next Level Unlocked!
                  </div>
                  <div className="text-sm text-green-600">
                    Level {nextLevel.level}: {nextLevel.theme}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setCurrentView("levels")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Levels
          </Button>
          {nextLevel && unlockedLevels.has(nextLevel.level) && (
            <Button onClick={() => startLevel(nextLevel.level)}>
              Next Level
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MobileContainer>
      {currentView === "levels" && renderLevelSelection()}
      {currentView === "playing" && renderGameplay()}
      {currentView === "completed" && renderCompleted()}
      {currentView === "leaderboard" && (
        <EnhancedLeaderboard onBack={() => setCurrentView("levels")} />
      )}
    </MobileContainer>
  );
};
