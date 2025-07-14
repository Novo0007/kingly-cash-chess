import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  HangmanGameLogic,
  type HangmanLevel,
  type GameState,
} from "./HangmanGameLogic";
import type { User } from "@supabase/supabase-js";

interface HangmanGameProps {
  onBack: () => void;
  user: User;
  initialDifficulty?: "easy" | "medium" | "hard";
}

type GameView = "menu" | "playing" | "completed";

export const HangmanGame: React.FC<HangmanGameProps> = ({
  onBack,
  user,
  initialDifficulty = "medium",
}) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<HangmanGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<HangmanLevel | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    perfectGames: 0,
  });

  // Start a new game with selected difficulty
  const startGame = useCallback((difficulty: "easy" | "medium" | "hard") => {
    try {
      setIsLoading(true);

      // Generate a random level for the selected difficulty
      const level = HangmanGameLogic.generateRandomLevel(difficulty);

      // Initialize game logic
      const logic = new HangmanGameLogic(level, (newState) => {
        setGameState(newState);
      });

      setGameLogic(logic);
      setCurrentLevel(level);
      setGameState(logic.getGameState());
      setUserInput("");
      setCurrentView("playing");

      toast.success(`New ${difficulty} game started! Good luck! 🎯`);
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle letter guess
  const handleGuessLetter = useCallback(() => {
    if (!gameLogic || !userInput.trim()) return;

    const result = gameLogic.guessLetter(userInput.trim());

    if (result.success) {
      if (result.isCorrect) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      toast.warning(result.message);
    }

    setUserInput("");
  }, [gameLogic, userInput]);

  // Handle input change
  const handleInputChange = (value: string) => {
    // Only allow single letters
    const letter = value.slice(-1).toUpperCase();
    if (/^[A-Z]?$/.test(letter)) {
      setUserInput(letter);
    }
  };

  // Handle hint usage
  const handleUseHint = useCallback(() => {
    if (!gameLogic) return;

    const result = gameLogic.useHint();

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, [gameLogic]);

  // Handle game completion
  useEffect(() => {
    if (!gameState || !gameLogic) return;

    if (gameState.isCompleted) {
      const stats = gameLogic.getCompletionStats();

      // Update game stats
      setGameStats((prev) => ({
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon:
          gameState.gameStatus === "won" ? prev.gamesWon + 1 : prev.gamesWon,
        totalScore: prev.totalScore + stats.score,
        perfectGames: stats.isPerfect
          ? prev.perfectGames + 1
          : prev.perfectGames,
      }));

      // Show completion message
      setTimeout(() => {
        if (gameState.gameStatus === "won") {
          toast.success(`Congratulations! You guessed "${stats.word}"! 🎉`);
        } else {
          toast.error(
            `Game Over! The word was "${stats.word}". Better luck next time! 💪`,
          );
        }
        setCurrentView("completed");
      }, 1000);
    }
  }, [gameState, gameLogic]);

  // Handle alphabet button click
  const handleAlphabetClick = (letter: string) => {
    if (!gameLogic) return;

    const result = gameLogic.guessLetter(letter);

    if (result.success) {
      if (result.isCorrect) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      toast.warning(result.message);
    }
  };

  // Reset current game
  const handleResetGame = () => {
    if (gameLogic) {
      gameLogic.resetGame();
      setUserInput("");
      toast.info("Game reset! 🔄");
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

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    return HangmanGameLogic.getDifficultyColor(difficulty);
  };

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Starting Hangman Game...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Playing view
  if (currentView === "playing" && gameState && currentLevel) {
    const hangmanDrawing = HangmanGameLogic.getHangmanDrawing(
      gameState.wrongGuesses.length,
    );
    const alphabet = HangmanGameLogic.getAlphabet();

    return (
      <MobileContainer>
        <div className="space-y-4">
          {/* Game Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Badge
                    className={getDifficultyColor(currentLevel.difficulty)}
                  >
                    {currentLevel.difficulty.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {gameLogic?.getRemainingGuesses()}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {gameState.score}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    {HangmanGameLogic.formatTime(gameState.timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {gameState.hintsUsed}
                  </div>
                  <div className="text-sm text-gray-600">Hints</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hangman Drawing */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <pre className="font-mono text-lg leading-tight text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {hangmanDrawing.join("\n")}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Word Display and Category */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Category:{" "}
                  <span className="font-semibold">
                    {currentLevel.category.toUpperCase()}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold tracking-widest bg-gray-100 p-4 rounded-lg">
                  {gameLogic?.getWordProgress()}
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  💡 {currentLevel.hint}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Letter Input */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter a letter..."
                  className="text-center text-lg font-semibold uppercase"
                  disabled={gameState.isCompleted}
                  maxLength={1}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleGuessLetter();
                    }
                  }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleGuessLetter}
                    disabled={!userInput.trim() || gameState.isCompleted}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Guess Letter
                  </Button>

                  <Button
                    onClick={handleUseHint}
                    variant="outline"
                    disabled={gameState.isCompleted}
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alphabet Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alphabet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map((letter) => {
                  const isGuessed = gameState.guessedLetters.has(letter);
                  const isCorrect = gameState.correctGuesses.includes(letter);
                  const isWrong = gameState.wrongGuesses.includes(letter);

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
                      className={`aspect-square p-0 text-sm font-bold ${
                        isCorrect ? "bg-green-500 hover:bg-green-600" : ""
                      } ${isWrong ? "bg-red-500 hover:bg-red-600" : ""}`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Game Controls */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleResetGame}
              variant="outline"
              disabled={gameState.isCompleted}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Completed view
  if (currentView === "completed" && gameState && currentLevel && gameLogic) {
    const stats = gameLogic.getCompletionStats();

    return (
      <MobileContainer>
        <div className="space-y-6 text-center">
          <Card
            className={`${
              gameState.gameStatus === "won"
                ? "bg-gradient-to-r from-green-500 to-blue-600"
                : "bg-gradient-to-r from-red-500 to-orange-600"
            } text-white`}
          >
            <CardContent className="p-8">
              {gameState.gameStatus === "won" ? (
                <>
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                  <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                  <p className="text-green-100">
                    You guessed the word:{" "}
                    <span className="font-bold text-xl">{stats.word}</span>
                  </p>
                </>
              ) : (
                <>
                  <Target className="h-16 w-16 mx-auto mb-4 text-red-300" />
                  <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                  <p className="text-red-100">
                    The word was:{" "}
                    <span className="font-bold text-xl">{stats.word}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.score}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {HangmanGameLogic.formatTime(stats.timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.wrongGuesses}
                  </div>
                  <div className="text-sm text-gray-600">Wrong Guesses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.hintsUsed}
                  </div>
                  <div className="text-sm text-gray-600">Hints Used</div>
                </div>
              </div>

              {stats.isPerfect && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-bold">
                      Perfect Game!
                    </span>
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    No wrong guesses and no hints used!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleNewGame(currentLevel.difficulty)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Play Again ({currentLevel.difficulty})
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleNewGame("easy")}
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100"
              >
                <Zap className="h-4 w-4 mr-1" />
                Easy
              </Button>
              <Button
                onClick={() => handleNewGame("medium")}
                variant="outline"
                size="sm"
                className="bg-yellow-50 hover:bg-yellow-100"
              >
                <Target className="h-4 w-4 mr-1" />
                Medium
              </Button>
              <Button
                onClick={() => handleNewGame("hard")}
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Hard
              </Button>
            </div>

            <Button
              onClick={() => setCurrentView("menu")}
              variant="outline"
              className="w-full"
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

  // Main Menu
  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
              <CardTitle className="text-3xl mb-2">🎯 Hangman</CardTitle>
              <p className="text-blue-100">
                Guess the word before the drawing is complete!
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {gameStats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {gameStats.gamesWon}
                </div>
                <div className="text-sm text-gray-600">Games Won</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {gameStats.totalScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.perfectGames}
                </div>
                <div className="text-sm text-gray-600">Perfect Games</div>
              </div>
            </div>

            {gameStats.gamesPlayed > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <span className="text-blue-800 font-semibold">
                    Win Rate:{" "}
                    {Math.round(
                      (gameStats.gamesWon / gameStats.gamesPlayed) * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => startGame("easy")}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold">🟢 Easy</div>
                <div className="text-sm opacity-90">
                  8 wrong guesses • 3 minutes • Common words
                </div>
              </div>
            </Button>

            <Button
              onClick={() => startGame("medium")}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold">🟡 Medium</div>
                <div className="text-sm opacity-90">
                  6 wrong guesses • 2 minutes • Moderate words
                </div>
              </div>
            </Button>

            <Button
              onClick={() => startGame("hard")}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-6"
              size="lg"
            >
              <div className="text-center">
                <div className="text-xl font-bold">🔴 Hard</div>
                <div className="text-sm opacity-90">
                  5 wrong guesses • 90 seconds • Challenging words
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* How to Play */}
        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Choose your difficulty level to start a new game</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Guess letters to reveal the hidden word</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Wrong guesses add parts to the hangman drawing</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Use hints if you're stuck (but it costs points!)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">5.</span>
                <span>
                  Win by guessing the word before the drawing is complete!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
