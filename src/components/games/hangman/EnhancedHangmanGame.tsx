import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Heart,
  Lightbulb,
  RotateCcw,
  Play,
  Home,
  Star,
  Target,
  Zap,
  Flame,
  Shield,
  Eye,
  Gift,
  Crown,
  Timer,
  Coins,
  Sparkles,
  Brain,
  BookOpen,
  Award,
  TrendingUp,
  Gamepad2,
  HelpCircle,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  EnhancedHangmanGameLogic,
  type HangmanLevel,
  type GameState,
  type PowerUp,
} from "./EnhancedHangmanGameLogic";
import type { User } from "@supabase/supabase-js";

interface EnhancedHangmanGameProps {
  onBack: () => void;
  user: User;
  initialDifficulty?: "easy" | "medium" | "hard";
}

type GameView = "menu" | "playing" | "completed" | "powerups" | "achievements";

export const EnhancedHangmanGame: React.FC<EnhancedHangmanGameProps> = ({
  onBack,
  user,
  initialDifficulty = "medium",
}) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<EnhancedHangmanGameLogic | null>(
    null,
  );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<HangmanLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showPowerUpHint, setShowPowerUpHint] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 2500, // Starting with some points for demo
    perfectGames: 0,
    streakRecord: 0,
    totalTimeSpent: 0,
    wordsGuessed: 0,
    categoriesMastered: [],
    achievementsUnlocked: [],
  });

  // Start a new game with selected difficulty
  const startGame = useCallback((difficulty: "easy" | "medium" | "hard") => {
    try {
      setIsLoading(true);

      // Generate a random level for the selected difficulty
      const level = EnhancedHangmanGameLogic.generateRandomLevel(difficulty);

      // Initialize game logic
      const logic = new EnhancedHangmanGameLogic(level, (newState) => {
        setGameState(newState);
      });

      setGameLogic(logic);
      setCurrentLevel(level);
      setGameState(logic.getGameState());
      setCurrentView("playing");

      toast.success(`🎯 ${difficulty.toUpperCase()} game started! Good luck!`, {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle letter guess from alphabet buttons
  const handleAlphabetClick = useCallback(
    (letter: string) => {
      if (!gameLogic) return;

      setSelectedLetter(letter);

      // Add visual feedback
      setTimeout(() => {
        const result = gameLogic.guessLetter(letter);

        if (result.success) {
          if (result.isCorrect) {
            toast.success(result.message, { duration: 1500 });
          } else {
            toast.error(result.message, { duration: 1500 });
          }
        } else {
          toast.warning(result.message, { duration: 1500 });
        }

        setSelectedLetter(null);
      }, 200);
    },
    [gameLogic],
  );

  // Handle power-up usage
  const handleUsePowerUp = useCallback(
    (powerUpId: string) => {
      if (!gameLogic) return;

      const result = gameLogic.usePowerUp(powerUpId);

      if (result.success) {
        toast.success(result.message, { duration: 2000 });
      } else {
        toast.error(result.message, { duration: 2000 });
      }
    },
    [gameLogic],
  );

  // Handle game completion
  useEffect(() => {
    if (!gameState || !gameLogic) return;

    if (gameState.isCompleted) {
      const stats = gameLogic.getCompletionStats();

      // Update game stats
      setGameStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon:
          gameState.gameStatus === "won" ? prev.gamesWon + 1 : prev.gamesWon,
        totalScore: prev.totalScore + stats.score,
        perfectGames: stats.isPerfect
          ? prev.perfectGames + 1
          : prev.perfectGames,
        streakRecord: Math.max(prev.streakRecord, stats.streak),
        totalTimeSpent: prev.totalTimeSpent + stats.timeElapsed,
        wordsGuessed:
          gameState.gameStatus === "won"
            ? prev.wordsGuessed + 1
            : prev.wordsGuessed,
      }));

      // Show completion view after a short delay
      setTimeout(() => {
        if (gameState.gameStatus === "won") {
          toast.success(`🎉 Congratulations! You guessed "${stats.word}"!`, {
            duration: 3000,
          });
        } else {
          toast.error(`💀 Game Over! The word was "${stats.word}"`, {
            duration: 3000,
          });
        }
        setCurrentView("completed");
      }, 1000);
    }
  }, [gameState, gameLogic]);

  // Reset current game
  const handleResetGame = () => {
    if (gameLogic) {
      gameLogic.resetGame();
      toast.info("🔄 New word generated! Good luck!", { duration: 1500 });
    }
  };

  // Start new game
  const handleNewGame = (difficulty?: "easy" | "medium" | "hard") => {
    startGame(difficulty || currentLevel?.difficulty || "medium");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLogic) {
        gameLogic.cleanup();
      }
    };
  }, [gameLogic]);

  // Get difficulty badge color
  const getDifficultyInfo = (difficulty: string) => {
    const info = {
      easy: {
        color: "bg-green-500",
        label: "🟢 EASY",
        textColor: "text-green-600",
      },
      medium: {
        color: "bg-yellow-500",
        label: "🟡 MEDIUM",
        textColor: "text-yellow-600",
      },
      hard: {
        color: "bg-red-500",
        label: "🔴 HARD",
        textColor: "text-red-600",
      },
    };
    return info[difficulty as keyof typeof info] || info.medium;
  };

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">
              Starting Enhanced Hangman...
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Preparing your challenge!
            </p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Power-ups view
  if (currentView === "powerups" && gameState) {
    return (
      <MobileContainer>
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("playing")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Game
                </Button>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  <span className="font-bold">{gameState.score}</span>
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl mb-2">🛠️ Power-ups</CardTitle>
                <p className="text-purple-100">
                  Enhance your gameplay with special abilities
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {gameState.availablePowerUps.map((powerUp) => (
              <Card
                key={powerUp.id}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:border-purple-300 transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{powerUp.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {powerUp.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {powerUp.description}
                        </p>
                        {powerUp.duration && (
                          <p className="text-xs text-blue-600 mt-1">
                            Duration: {powerUp.duration}s
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={() => handleUsePowerUp(powerUp.id)}
                        disabled={gameState.score < powerUp.cost}
                        className={`${
                          gameState.score >= powerUp.cost
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            : "bg-gray-400"
                        } text-white px-6 py-2`}
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        {powerUp.cost}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Playing view
  if (currentView === "playing" && gameState && currentLevel) {
    const hangmanDrawing =
      gameLogic?.getHangmanDrawing(gameState.wrongGuesses.length) || [];
    const alphabet = EnhancedHangmanGameLogic.getAlphabet();
    const difficultyInfo = getDifficultyInfo(currentLevel.difficulty);

    return (
      <MobileContainer>
        <div className="space-y-4">
          {/* Enhanced Game Header */}
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Menu
                </Button>

                <div className="flex items-center gap-2">
                  <Badge
                    className={`${difficultyInfo.color} text-white border-0`}
                  >
                    {difficultyInfo.label}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Heart className="h-3 w-3 mr-1" />
                    {gameLogic?.getRemainingGuesses()}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-300 flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4" />
                    {gameState.score}
                  </div>
                  <div className="text-xs text-purple-100">Score</div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-300 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    {EnhancedHangmanGameLogic.formatTime(gameState.timeElapsed)}
                  </div>
                  <div className="text-xs text-purple-100">Time</div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-orange-300 flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4" />
                    {gameState.streak}
                  </div>
                  <div className="text-xs text-purple-100">Streak</div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-300 flex items-center justify-center gap-1">
                    {gameState.multiplier > 1 ? (
                      <>
                        <Zap className="h-4 w-4" />
                        {gameState.multiplier}x
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        1x
                      </>
                    )}
                  </div>
                  <div className="text-xs text-purple-100">
                    {gameState.multiplier > 1 ? "Bonus" : "Normal"}
                  </div>
                </div>
              </div>

              {/* Power-up Timers */}
              {(gameState.freezeTimeRemaining > 0 ||
                gameState.doublePointsRemaining > 0) && (
                <div className="flex justify-center gap-2">
                  {gameState.freezeTimeRemaining > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400">
                      ⏰ Freeze: {gameState.freezeTimeRemaining}s
                    </Badge>
                  )}
                  {gameState.doublePointsRemaining > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400">
                      💰 2x Points: {gameState.doublePointsRemaining}s
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Hangman Visual */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-inner border-2 border-gray-200">
                  <pre className="font-mono text-base leading-tight text-gray-700 select-none">
                    {hangmanDrawing.join("\n")}
                  </pre>
                </div>

                {/* Danger indicator */}
                {gameState.wrongGuesses.length >=
                  gameState.maxWrongGuesses - 2 && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4" />
                      Danger Zone! {gameLogic?.getRemainingGuesses()} guesses
                      left!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Word Display */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-sm text-blue-600 mb-3 flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-semibold">
                    {currentLevel.category.toUpperCase()}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-100 mb-4">
                  <div className="text-2xl md:text-3xl font-mono font-bold tracking-widest text-gray-800 min-h-[40px] flex items-center justify-center">
                    {gameLogic?.getWordProgress()}
                  </div>
                </div>

                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-semibold">Hint</span>
                  </div>
                  <p>{currentLevel.hint}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Alphabet Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-600" />
                Tap Letters to Guess
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map((letter) => {
                  const isGuessed = gameState.guessedLetters.has(letter);
                  const isCorrect = gameState.correctGuesses.includes(letter);
                  const isWrong = gameState.wrongGuesses.includes(letter);
                  const isSelected = selectedLetter === letter;

                  return (
                    <Button
                      key={letter}
                      variant={
                        isGuessed
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleAlphabetClick(letter)}
                      disabled={isGuessed || gameState.isCompleted}
                      className={`
                        aspect-square p-0 text-sm font-bold transition-all duration-200
                        ${isCorrect ? "bg-green-500 hover:bg-green-600 text-white animate-pulse" : ""}
                        ${isWrong ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                        ${isSelected ? "scale-110 bg-blue-500 text-white" : ""}
                        ${!isGuessed && !isSelected ? "hover:scale-105 hover:bg-blue-50" : ""}
                      `}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setCurrentView("powerups")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 flex flex-col items-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-bold">Power-ups</span>
              <span className="text-xs opacity-90">
                {gameState.availablePowerUps.length} available
              </span>
            </Button>

            <Button
              onClick={handleResetGame}
              variant="outline"
              disabled={gameState.isCompleted}
              className="py-6 flex flex-col items-center gap-2 border-2 border-gray-300 hover:border-gray-400"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm font-bold">New Word</span>
              <span className="text-xs text-gray-600">Same difficulty</span>
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Completed view
  if (currentView === "completed" && gameState && gameLogic) {
    const stats = gameLogic.getCompletionStats();
    const difficultyInfo = getDifficultyInfo(
      currentLevel?.difficulty || "medium",
    );

    return (
      <MobileContainer>
        <div className="space-y-6 text-center">
          <Card
            className={`${
              gameState.gameStatus === "won"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-pink-600"
            } text-white border-0 shadow-2xl`}
          >
            <CardContent className="p-8">
              {gameState.gameStatus === "won" ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold mb-3">Victory!</h2>
                  <p className="text-green-100 text-lg mb-2">
                    You guessed:{" "}
                    <span className="font-bold text-2xl">{stats.word}</span>
                  </p>
                  {stats.isPerfect && (
                    <div className="bg-yellow-400/20 rounded-lg p-3 mt-4">
                      <p className="text-yellow-100 font-bold flex items-center justify-center gap-2">
                        <Crown className="h-5 w-5" />
                        PERFECT GAME!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">💀</div>
                  <h2 className="text-3xl font-bold mb-3">Game Over!</h2>
                  <p className="text-red-100 text-lg mb-2">
                    The word was:{" "}
                    <span className="font-bold text-2xl">{stats.word}</span>
                  </p>
                  <p className="text-red-200">Better luck next time!</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Stats Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                    <Coins className="h-5 w-5" />
                    {stats.score}
                  </div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {EnhancedHangmanGameLogic.formatTime(stats.timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.wrongGuesses}
                  </div>
                  <div className="text-sm text-gray-600">Wrong Guesses</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.powerUpsUsed}
                  </div>
                  <div className="text-sm text-gray-600">Power-ups Used</div>
                </div>
              </div>

              {stats.streak > 0 && (
                <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-800 font-bold">
                      Streak: {stats.streak} {stats.streak > 1 ? "wins" : "win"}
                      !
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleNewGame(currentLevel?.difficulty)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Play Again ({currentLevel?.difficulty || "medium"})
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleNewGame("easy")}
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100 border-green-300"
              >
                <Target className="h-4 w-4 mr-1" />
                Easy
              </Button>
              <Button
                onClick={() => handleNewGame("medium")}
                variant="outline"
                size="sm"
                className="bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
              >
                <Brain className="h-4 w-4 mr-1" />
                Medium
              </Button>
              <Button
                onClick={() => handleNewGame("hard")}
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 border-red-300"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Hard
              </Button>
            </div>

            <Button
              onClick={() => setCurrentView("menu")}
              variant="outline"
              className="w-full border-2 border-gray-300"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Main Menu
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Enhanced Main Menu
  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
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
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <CardTitle className="text-3xl mb-2 font-black">
                Enhanced Hangman
              </CardTitle>
              <p className="text-purple-100">
                Guess words with power-ups, streaks, and awesome features!
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Game Stats */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  {gameStats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {gameStats.gamesWon}
                </div>
                <div className="text-sm text-gray-600">Victories</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5" />
                  {gameStats.totalScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  {gameStats.perfectGames}
                </div>
                <div className="text-sm text-gray-600">Perfect Games</div>
              </div>
            </div>

            {gameStats.gamesPlayed > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                <div className="text-center">
                  <span className="text-blue-800 font-semibold">
                    Win Rate:{" "}
                    {Math.round(
                      (gameStats.gamesWon / gameStats.gamesPlayed) * 100,
                    )}
                    %
                  </span>
                  {gameStats.streakRecord > 0 && (
                    <span className="ml-4 text-orange-600 font-semibold">
                      🔥 Best Streak: {gameStats.streakRecord}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Difficulty Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Choose Your Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => startGame("easy")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center gap-2">
                  🟢 <span>EASY MODE</span>
                </div>
                <div className="text-sm opacity-90 mt-1">
                  8 wrong guesses • 3 minutes • Simple words
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Perfect for beginners and warm-up!
                </div>
              </div>
            </Button>

            <Button
              onClick={() => startGame("medium")}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center gap-2">
                  🟡 <span>MEDIUM MODE</span>
                </div>
                <div className="text-sm opacity-90 mt-1">
                  6 wrong guesses • 2 minutes • Moderate words
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Balanced challenge with good rewards!
                </div>
              </div>
            </Button>

            <Button
              onClick={() => startGame("hard")}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold flex items-center justify-center gap-2">
                  🔴 <span>HARD MODE</span>
                </div>
                <div className="text-sm opacity-90 mt-1">
                  5 wrong guesses • 90 seconds • Complex words
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Maximum challenge and maximum rewards!
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* New Features Highlight */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              New Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Power-ups System</div>
                  <div className="text-sm text-gray-600">
                    Use special abilities like revealing letters and freezing
                    time
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold">Streak System</div>
                  <div className="text-sm text-gray-600">
                    Build winning streaks for bonus points and multipliers
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">6 Categories</div>
                  <div className="text-sm text-gray-600">
                    Animals, Technology, Nature, Space, Sports, and Food
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">No Letter Input</div>
                  <div className="text-sm text-gray-600">
                    Just tap the alphabet buttons - mobile-friendly design!
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
