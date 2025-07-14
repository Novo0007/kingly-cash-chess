
import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HangmanBoard } from "./HangmanBoard";
import { HangmanLobby } from "./HangmanLobby";
import { HangmanRules } from "./HangmanRules";
import { HangmanLeaderboard } from "./HangmanLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Star,
  Clock,
  Target,
  Crown,
  Sparkles,
  Share2,
  RotateCcw,
  Play,
} from "lucide-react";
import {
  HangmanGameState,
  HangmanGameLogic,
  HangmanScore,
} from "./HangmanGameLogic";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface HangmanGameProps {
  onBack: () => void;
  user: any;
}

type GameView = "lobby" | "game" | "rules" | "leaderboard" | "gameComplete";

export const HangmanGame: React.FC<HangmanGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameState, setGameState] = useState<HangmanGameState | null>(null);
  const [gameLogic] = useState(() => new HangmanGameLogic());
  const [gamesPlayed, setGamesPlayed] = useState<HangmanGameState[]>([]);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize hangman scores table if it doesn't exist
  useEffect(() => {
    const initializeHangmanTable = async () => {
      try {
        // Check if hangman_scores table exists by trying a simple query
        const { error } = await supabase
          .from("hangman_scores")
          .select("id")
          .limit(1);

        if (error && error.message.includes("does not exist")) {
          console.log(
            "Hangman scores table doesn't exist, this is normal on first run",
          );
          toast.info("Setting up Hangman game for the first time...");
        }
      } catch (error) {
        console.error("Error checking hangman table:", error);
      }
    };

    initializeHangmanTable();
  }, []);

  // Game timer effect
  useEffect(() => {
    // Clear existing timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    if (gameState && !gameState.isGameOver && currentView === "game") {
      const timer = setInterval(() => {
        setGameState((prevState) => {
          if (!prevState) return null;
          const updatedState = gameLogic.updateTimer(prevState);

          if (updatedState.timeLeft === 0 && !updatedState.isGameOver) {
            toast.error("Time's up! ⏰");
          }

          return updatedState;
        });
      }, 1000);

      gameTimerRef.current = timer;
      return () => {
        if (gameTimerRef.current) {
          clearInterval(gameTimerRef.current);
          gameTimerRef.current = null;
        }
      };
    }
  }, [gameState, currentView, gameLogic]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, []);

  const startNewGame = useCallback(
    (level: number = 1) => {
      const newGameState = gameLogic.createNewGame(level);
      setGameState(newGameState);
      setCurrentView("game");
      toast.success("New game started! Good luck! 🎪");
    },
    [gameLogic],
  );

  const handleGuessLetter = useCallback(
    (letter: string) => {
      if (!gameState) return;

      const updatedState = gameLogic.makeGuess(gameState, letter);
      setGameState(updatedState);

      if (updatedState.word.includes(letter)) {
        toast.success(`Great! "${letter}" is in the word! ✅`);
      } else {
        toast.error(`Sorry, "${letter}" is not in the word. ���`);
      }

      if (updatedState.isGameOver) {
        if (updatedState.isWon) {
          toast.success("Congratulations! You solved the word! 🎉");
        } else {
          toast.error("Game over! Better luck next time! 💀");
        }

        // Add completed game to the list
        setGamesPlayed((prev) => [...prev, updatedState]);

        // Auto-advance after a short delay
        setTimeout(() => {
          if (updatedState.isWon && updatedState.level < 10) {
            // Continue to next level
            startNewGame(updatedState.level + 1);
          } else {
            // Show completion screen
            setCurrentView("gameComplete");
          }
        }, 2000);
      }
    },
    [gameState, gameLogic, startNewGame],
  );

  const handleUseHint = useCallback(() => {
    if (!gameState) return;

    // Deduct points for using hint
    setGameState((prev) =>
      prev ? { ...prev, score: Math.max(0, prev.score - 5) } : null,
    );
    toast.info(`Hint: ${gameState.hint} 💡`);
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    if (gameState?.isWon && gameState.level < 10) {
      startNewGame(gameState.level + 1);
    } else {
      startNewGame(1);
    }
  }, [gameState, startNewGame]);

  const submitScore = useCallback(async () => {
    if (!user || gamesPlayed.length === 0 || isSubmittingScore) return;

    try {
      setIsSubmittingScore(true);

      const finalStats = gameLogic.calculateFinalScore(gamesPlayed);
      const highestLevel = Math.max(...gamesPlayed.map((g) => g.level));

      const scoreData: Omit<HangmanScore, "id" | "created_at"> = {
        user_id: user.id,
        username:
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "Anonymous",
        score: finalStats.totalScore,
        level: highestLevel,
        words_solved: finalStats.wordsCompleted,
        time_taken: Math.round(finalStats.averageTime),
      };

      const { error } = await supabase
        .from("hangman_scores")
        .insert([scoreData]);

      if (error) {
        console.error("Error submitting score:", error);
        toast.error("Couldn't save your score, but great job!");
      } else {
        toast.success("Score saved successfully! 🏆");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Couldn't save your score, but great job!");
    } finally {
      setIsSubmittingScore(false);
    }
  }, [user, gamesPlayed, gameLogic, isSubmittingScore]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setGamesPlayed([]);
    setCurrentView("lobby");
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  const renderGameComplete = () => {
    const stats = gameLogic.calculateFinalScore(gamesPlayed);

    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-0 text-white">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <CardTitle className="text-3xl font-black mb-2">
              Game Complete!
            </CardTitle>
            <p className="text-white/90 text-lg">
              Amazing job! Here's how you performed:
            </p>
          </CardHeader>
        </Card>

        {/* Final Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalScore}
              </div>
              <div className="text-sm text-blue-700">Total Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {stats.wordsCompleted}
              </div>
              <div className="text-sm text-green-700">Words Solved</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {Math.max(...gamesPlayed.map((g) => g.level))}
              </div>
              <div className="text-sm text-purple-700">Highest Level</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {Math.round(stats.accuracy)}%
              </div>
              <div className="text-sm text-orange-700">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-600" />
              Achievements Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              {stats.wordsCompleted >= 1 && (
                <Badge className="bg-green-100 text-green-800 px-3 py-2">
                  🎯 First Word
                </Badge>
              )}
              {stats.wordsCompleted >= 5 && (
                <Badge className="bg-blue-100 text-blue-800 px-3 py-2">
                  🌟 Word Master
                </Badge>
              )}
              {stats.accuracy >= 80 && (
                <Badge className="bg-purple-100 text-purple-800 px-3 py-2">
                  🎯 Sharp Shooter
                </Badge>
              )}
              {stats.totalScore >= 500 && (
                <Badge className="bg-yellow-100 text-yellow-800 px-3 py-2">
                  👑 High Scorer
                </Badge>
              )}
              {gamesPlayed.some((g) => g.level >= 5) && (
                <Badge className="bg-red-100 text-red-800 px-3 py-2">
                  🔥 Level Climber
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={submitScore}
            disabled={isSubmittingScore}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 text-lg"
          >
            <Trophy className="h-5 w-5 mr-2" />
            {isSubmittingScore ? "Saving..." : "Save Score"}
          </Button>

          <Button
            onClick={() => startNewGame(1)}
            variant="outline"
            className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Play Again
          </Button>

          <Button
            onClick={resetGame}
            variant="outline"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-3 px-8 text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "lobby":
        return (
          <HangmanLobby
            onStartGame={() => startNewGame(1)}
            onViewRules={() => setCurrentView("rules")}
            onViewLeaderboard={() => setCurrentView("leaderboard")}
          />
        );
      case "game":
        return gameState ? (
          <HangmanBoard
            gameState={gameState}
            onGuessLetter={handleGuessLetter}
            onUseHint={handleUseHint}
            onNewGame={handleNewGame}
            canUseHint={true}
          />
        ) : null;
      case "rules":
        return (
          <HangmanRules
            onBack={() => setCurrentView("lobby")}
            onStartGame={() => startNewGame(1)}
          />
        );
      case "leaderboard":
        return (
          <HangmanLeaderboard
            onBack={() => setCurrentView("lobby")}
            currentUser={user}
          />
        );
      case "gameComplete":
        return renderGameComplete();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Back Button - Always visible */}
      {currentView !== "lobby" && (
        <div className="sticky top-4 z-50 p-4">
          <Button
            onClick={() => (currentView === "game" ? resetGame() : onBack())}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-600 hover:bg-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentView === "game" ? "End Game" : "Back"}
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className={currentView !== "lobby" ? "pt-0" : "pt-8"}>
        {renderCurrentView()}
      </div>
    </div>

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
