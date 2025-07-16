import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Brain,
  Play,
  Home,
  Star,
  Lightbulb,
  Target,
  Sparkles,
  Users,
  RotateCcw,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Award,
  TrendingUp,
  Settings,
  Gamepad2,
  Flame,
  Gem,
  Crown,
  Shield,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  AkinatorGameLogic,
  type GameState,
  type Character,
  type Question,
  type GameStats,
  type Achievement,
} from "./AkinatorGameLogic";
import type { User } from "@supabase/supabase-js";

interface AkinatorGameProps {
  onBack: () => void;
  user: User;
}

type GameView =
  | "menu"
  | "difficulty"
  | "playing"
  | "completed"
  | "stats"
  | "achievements";

export const AkinatorGame: React.FC<AkinatorGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<AkinatorGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterHint, setShowCharacterHint] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    perfectGames: 0,
    averageQuestions: 0,
    bestTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalHintsUsed: 0,
    achievements: [],
    difficultiesCompleted: {},
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard" | "expert"
  >("medium");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Start a new game with selected difficulty
  const startGame = useCallback(
    (
      difficulty: "easy" | "medium" | "hard" | "expert" = selectedDifficulty,
    ) => {
      try {
        setIsLoading(true);

        // Initialize game logic with difficulty
        const logic = new AkinatorGameLogic((newState) => {
          setGameState(newState);
        }, difficulty);

        setGameLogic(logic);
        setGameState(logic.getGameState());
        setGameStats(logic.getGameStats());
        setAchievements(logic.getAchievements());
        setCurrentView("playing");
        setShowCharacterHint(false);

        const difficultyText = {
          easy: "Easy mode - I'll go easy on you! 😊",
          medium: "Medium mode - Let's see what you've got! 🎯",
          hard: "Hard mode - This will be challenging! 💪",
          expert: "Expert mode - Only for true masters! 🔥",
        };

        toast.success(
          `${difficultyText[difficulty]} Think of a character and I'll try to guess it! 🔮`,
        );
      } catch (error) {
        console.error("Error starting game:", error);
        toast.error("Failed to start game");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDifficulty],
  );

  // Handle answering a question
  const handleAnswerQuestion = useCallback(
    (answer: boolean) => {
      if (!gameLogic) return;

      const result = gameLogic.answerQuestion(answer);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      // Update stats and achievements
      setGameStats(gameLogic.getGameStats());
      setAchievements(gameLogic.getAchievements());
    },
    [gameLogic],
  );

  // Handle character guess confirmation
  const handleGuessConfirmation = useCallback(
    (isCorrect: boolean) => {
      if (!gameLogic || !gameState?.guessedCharacter) return;

      const result = gameLogic.makeGuess(gameState.guessedCharacter);

      if (isCorrect) {
        toast.success("I got it right! 🎉");
      } else {
        toast.info("You stumped me! Great job! 😅");
      }

      // Update stats and achievements
      setGameStats(gameLogic.getGameStats());
      setAchievements(gameLogic.getAchievements());
    },
    [gameLogic, gameState],
  );

  // Handle game completion
  useEffect(() => {
    if (!gameState || !gameLogic) return;

    if (gameState.isGameComplete) {
      const stats = gameLogic.getCompletionStats();

      // Check for new achievements
      const newAchievements = gameLogic.getAchievements();
      const previousAchievements = achievements.length;

      if (newAchievements.length > previousAchievements) {
        toast.success(`🏆 New achievement unlocked!`);
      }

      // Show completion view after a short delay
      setTimeout(() => {
        setCurrentView("completed");
      }, 1500);
    }
  }, [gameState, gameLogic, achievements.length]);

  // Use hint
  const handleUseHint = () => {
    if (!gameLogic || !gameState) return;

    if (gameState.hintsUsed >= gameState.maxHints) {
      toast.error("No hints remaining!");
      return;
    }

    const hints = gameLogic.useHint();
    if (hints.length > 0) {
      toast.info(`💡 Hint: ${hints[0]}`);
      setGameStats(gameLogic.getGameStats());
    } else {
      toast.error("No hints available!");
    }
  };

  // Reset current game
  const handleResetGame = () => {
    if (gameLogic) {
      gameLogic.restartGame();
      setShowCharacterHint(false);
      toast.info("Game reset! Think of a new character! 🔄");
    }
  };

  // Start new game
  const handleNewGame = () => {
    setCurrentView("difficulty");
  };

  // Show character hint
  const handleShowHint = () => {
    setShowCharacterHint(true);
    toast.info("Here are some of the characters I can guess! 💡");
  };

  // Navigate to stats
  const handleShowStats = () => {
    if (gameLogic) {
      setGameStats(gameLogic.getGameStats());
    }
    setCurrentView("stats");
  };

  // Navigate to achievements
  const handleShowAchievements = () => {
    if (gameLogic) {
      setAchievements(gameLogic.getAchievements());
    }
    setCurrentView("achievements");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLogic) {
        gameLogic.cleanup();
      }
    };
  }, [gameLogic]);

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Starting Akinator...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Difficulty Selection View
  if (currentView === "difficulty") {
    return (
      <MobileContainer>
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-center text-2xl">
                Choose Difficulty
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Difficulty Options */}
          <div className="space-y-3">
            {[
              {
                level: "easy" as const,
                name: "Easy",
                description: "Popular characters, up to 5 hints",
                icon: "😊",
                color: "bg-green-500 hover:bg-green-600",
              },
              {
                level: "medium" as const,
                name: "Medium",
                description: "Mix of characters, up to 3 hints",
                icon: "🎯",
                color: "bg-blue-500 hover:bg-blue-600",
              },
              {
                level: "hard" as const,
                name: "Hard",
                description: "Challenging characters, 1 hint only",
                icon: "💪",
                color: "bg-orange-500 hover:bg-orange-600",
              },
              {
                level: "expert" as const,
                name: "Expert",
                description: "Obscure characters, no hints",
                icon: "🔥",
                color: "bg-red-500 hover:bg-red-600",
              },
            ].map((difficulty) => (
              <Button
                key={difficulty.level}
                onClick={() => {
                  setSelectedDifficulty(difficulty.level);
                  startGame(difficulty.level);
                }}
                className={`w-full p-6 ${difficulty.color} text-white`}
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{difficulty.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg">{difficulty.name}</div>
                      <div className="text-sm opacity-90">
                        {difficulty.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gameStats.difficultiesCompleted[difficulty.level] && (
                      <Badge className="bg-white/20">
                        {gameStats.difficultiesCompleted[difficulty.level]} wins
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Playing view
  if (currentView === "playing" && gameState) {
    return (
      <MobileContainer>
        <div className="space-y-4">
          {/* Game Header */}
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {gameState.difficulty.toUpperCase()}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Q{gameState.questionCount + 1}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Users className="h-3 w-3 mr-1" />
                    {gameLogic?.getRemainingCharacterCount()} left
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Akinator Character */}
              <div className="text-center">
                <div className="text-6xl mb-2">🔮</div>
                <h2 className="text-2xl font-bold">Akinator</h2>
                <p className="text-purple-100">The Web Genie</p>
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-yellow-300">
                    {gameState.score}
                  </div>
                  <div className="text-xs text-purple-100">Score</div>
                </div>

                <div>
                  <div className="text-lg font-bold text-blue-300 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {AkinatorGameLogic.formatTime(gameState.timeElapsed)}
                  </div>
                  <div className="text-xs text-purple-100">Time</div>
                </div>

                <div>
                  <div className="text-lg font-bold text-green-300">
                    {gameState.questionCount}
                  </div>
                  <div className="text-xs text-purple-100">Questions</div>
                </div>

                <div>
                  <div className="text-lg font-bold text-orange-300">
                    {gameState.maxHints - gameState.hintsUsed}
                  </div>
                  <div className="text-xs text-purple-100">Hints</div>
                </div>
              </div>

              {/* Current Streak */}
              {gameStats.currentStreak > 0 && (
                <div className="text-center">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Fire className="h-3 w-3 mr-1" />
                    {gameStats.currentStreak} Win Streak
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Question */}
          {gameState.currentQuestion && !gameState.isGameComplete && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200">
              <CardContent className="p-6 text-center space-y-6">
                <div className="space-y-4">
                  <div className="text-4xl">🤔</div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {gameState.currentQuestion.text}
                  </h3>
                  <p className="text-gray-600">
                    Think carefully about your character...
                  </p>

                  {/* Question Difficulty Indicator */}
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-xs">
                      {gameState.currentQuestion.category} •
                      {Array.from(
                        { length: gameState.currentQuestion.difficulty },
                        (_, i) => "⭐",
                      ).join("")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAnswerQuestion(true)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white py-6 flex flex-col items-center gap-2"
                  >
                    <ThumbsUp className="h-6 w-6" />
                    <span className="text-lg font-bold">YES</span>
                  </Button>

                  <Button
                    onClick={() => handleAnswerQuestion(false)}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white py-6 flex flex-col items-center gap-2"
                  >
                    <ThumbsDown className="h-6 w-6" />
                    <span className="text-lg font-bold">NO</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guess Confirmation */}
          {gameState.guessedCharacter && gameState.isGameComplete && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <CardContent className="p-6 text-center space-y-6">
                <div className="space-y-4">
                  <div className="text-4xl">🎯</div>
                  <h3 className="text-xl font-bold text-gray-800">
                    I think your character is...
                  </h3>
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {gameState.guessedCharacter.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {gameState.guessedCharacter.description}
                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {gameState.guessedCharacter.category}
                      </Badge>
                      <Badge variant="outline">
                        {Array.from(
                          { length: gameState.guessedCharacter.difficulty },
                          (_, i) => "⭐",
                        ).join("")}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600">Was I right?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleGuessConfirmation(true)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white py-6 flex flex-col items-center gap-2"
                  >
                    <Trophy className="h-6 w-6" />
                    <span className="text-lg font-bold">YES!</span>
                  </Button>

                  <Button
                    onClick={() => handleGuessConfirmation(false)}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white py-6 flex flex-col items-center gap-2"
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-lg font-bold">NO</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Character Hint */}
          {showCharacterHint && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Characters I Can Guess
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {gameLogic
                    ?.getPossibleCharacters()
                    .slice(0, 6)
                    .map((char) => (
                      <div key={char.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-purple-600">
                              {char.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {char.category}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Array.from(
                              { length: char.difficulty },
                              (_, i) => "⭐",
                            ).join("")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  And many more! I know{" "}
                  {gameLogic?.getPossibleCharacters().length} characters total.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Game Controls */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShowHint}
              variant="outline"
              disabled={showCharacterHint}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Show Characters
            </Button>

            <Button
              onClick={handleUseHint}
              variant="outline"
              disabled={
                gameState.hintsUsed >= gameState.maxHints ||
                gameState.isGameComplete
              }
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Use Hint ({gameState.maxHints - gameState.hintsUsed})
            </Button>

            <Button
              onClick={handleResetGame}
              variant="outline"
              disabled={gameState.isGameComplete}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={handleShowStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Stats
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Completed view
  if (currentView === "completed" && gameState && gameLogic) {
    const stats = gameLogic.getCompletionStats();

    return (
      <MobileContainer>
        <div className="space-y-6 text-center">
          <Card
            className={`${
              gameState.gameStatus === "won"
                ? "bg-gradient-to-r from-green-500 to-blue-600"
                : "bg-gradient-to-r from-purple-500 to-pink-600"
            } text-white`}
          >
            <CardContent className="p-8">
              {gameState.gameStatus === "won" ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2">I Got It Right!</h2>
                  <p className="text-green-100">
                    Your character was:{" "}
                    <span className="font-bold text-xl">
                      {stats.guessedCharacter?.name}
                    </span>
                  </p>
                  <div className="text-sm text-green-200 mt-2">
                    I guessed it in {stats.questionsAsked} questions on{" "}
                    {stats.difficulty} mode!
                  </div>
                  {stats.hintsUsed > 0 && (
                    <div className="text-sm text-green-200">
                      You used {stats.hintsUsed} hint
                      {stats.hintsUsed > 1 ? "s" : ""}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😅</div>
                  <h2 className="text-2xl font-bold mb-2">You Stumped Me!</h2>
                  <p className="text-purple-100">
                    Great job! You thought of a character I couldn't guess on{" "}
                    {stats.difficulty} mode.
                  </p>
                  <div className="text-sm text-purple-200 mt-2">
                    I asked {stats.questionsAsked} questions but couldn't figure
                    it out!
                  </div>
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
                    {AkinatorGameLogic.formatTime(stats.timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.questionsAsked}
                  </div>
                  <div className="text-sm text-gray-600">Questions Asked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {gameState.gameStatus === "won" ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-gray-600">Result</div>
                </div>
              </div>

              {stats.questionsAsked <= 10 && gameState.gameStatus === "won" && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-bold">
                      Perfect Game!
                    </span>
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    I guessed your character in 10 questions or less!
                  </p>
                </div>
              )}

              {/* New Achievement Alert */}
              {achievements.length > 0 && (
                <div className="mt-4">
                  <Button
                    onClick={handleShowAchievements}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    View Achievements ({achievements.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleNewGame}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Play Again
            </Button>

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

  // Statistics View
  if (currentView === "stats") {
    return (
      <MobileContainer>
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-center text-2xl">
                Your Statistics
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
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
                    {gameStats.totalScore.toLocaleString()}
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
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <span className="text-blue-800 font-semibold">
                        My Success Rate:{" "}
                        {Math.round(
                          (gameStats.gamesWon / gameStats.gamesPlayed) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-50 rounded text-center">
                      <div className="text-green-800 font-semibold">
                        {gameStats.averageQuestions}
                      </div>
                      <div className="text-xs text-green-600">
                        Avg Questions
                      </div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded text-center">
                      <div className="text-orange-800 font-semibold">
                        {gameStats.bestTime > 0
                          ? AkinatorGameLogic.formatTime(gameStats.bestTime)
                          : "N/A"}
                      </div>
                      <div className="text-xs text-orange-600">Best Time</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streak Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                    <Fire className="h-6 w-6" />
                    {gameStats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                    <Crown className="h-6 w-6" />
                    {gameStats.longestStreak}
                  </div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    level: "easy",
                    name: "Easy",
                    icon: "😊",
                    color: "bg-green-100 text-green-800",
                  },
                  {
                    level: "medium",
                    name: "Medium",
                    icon: "🎯",
                    color: "bg-blue-100 text-blue-800",
                  },
                  {
                    level: "hard",
                    name: "Hard",
                    icon: "💪",
                    color: "bg-orange-100 text-orange-800",
                  },
                  {
                    level: "expert",
                    name: "Expert",
                    icon: "🔥",
                    color: "bg-red-100 text-red-800",
                  },
                ].map((difficulty) => (
                  <div
                    key={difficulty.level}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{difficulty.icon}</span>
                      <span className="font-semibold">{difficulty.name}</span>
                    </div>
                    <Badge className={difficulty.color}>
                      {gameStats.difficultiesCompleted[difficulty.level] || 0}{" "}
                      wins
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  // Achievements View
  if (currentView === "achievements") {
    return (
      <MobileContainer>
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("menu")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-center text-2xl">
                Achievements
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {achievements.length}
                </div>
                <div className="text-gray-600">Achievements Unlocked</div>
                <div className="text-sm text-gray-500 mt-1">
                  Total Points:{" "}
                  {achievements.reduce((sum, ach) => sum + ach.points, 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {[
              {
                id: "first_win",
                name: "First Victory",
                description: "Win your first game against Akinator",
                icon: "🏆",
                points: 100,
              },
              {
                id: "perfect_game",
                name: "Perfect Game",
                description: "Win a game in 10 questions or less",
                icon: "⭐",
                points: 200,
              },
              {
                id: "speed_demon",
                name: "Speed Demon",
                description: "Win a game in under 60 seconds",
                icon: "⚡",
                points: 300,
              },
              {
                id: "streak_master",
                name: "Streak Master",
                description: "Win 5 games in a row",
                icon: "🔥",
                points: 400,
              },
              {
                id: "stump_master",
                name: "Stump Master",
                description: "Stump Akinator 10 times",
                icon: "🧩",
                points: 500,
              },
              {
                id: "no_hints",
                name: "No Help Needed",
                description: "Win a hard game without using hints",
                icon: "🎯",
                points: 600,
              },
            ].map((achievement) => {
              const isUnlocked = achievements.some(
                (ach) => ach.id === achievement.id,
              );

              return (
                <Card
                  key={achievement.id}
                  className={
                    isUnlocked
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-2xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${isUnlocked ? "text-yellow-800" : "text-gray-600"}`}
                        >
                          {achievement.name}
                        </div>
                        <div
                          className={`text-sm ${isUnlocked ? "text-yellow-700" : "text-gray-500"}`}
                        >
                          {achievement.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            isUnlocked
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-600"
                          }
                        >
                          {achievement.points} pts
                        </Badge>
                        {isUnlocked && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Unlocked!
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
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
              <div className="text-6xl mb-4">🔮</div>
              <CardTitle className="text-3xl mb-2">Akinator</CardTitle>
              <p className="text-purple-100">
                I can read your mind and guess any character you think of!
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
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
                <div className="text-sm text-gray-600">I Guessed Right</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                  <Fire className="h-5 w-5" />
                  {gameStats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  <Award className="h-5 w-5" />
                  {achievements.length}
                </div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>

            {gameStats.gamesPlayed > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <span className="text-purple-800 font-semibold">
                    My Success Rate:{" "}
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

        {/* Start Game */}
        <Card>
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-4">
              <div className="text-4xl">🧠</div>
              <h3 className="text-xl font-bold text-gray-800">
                Ready to Challenge Me?
              </h3>
              <p className="text-gray-600">
                Think of any character from movies, books, games, history, or
                cartoons. Choose your difficulty and I'll try to guess who it
                is!
              </p>
            </div>

            <Button
              onClick={() => setCurrentView("difficulty")}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6"
            >
              <Brain className="h-6 w-6 mr-2" />
              <span className="text-lg font-bold">START GAME</span>
            </Button>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShowStats}
            variant="outline"
            className="flex items-center gap-2 py-6"
          >
            <TrendingUp className="h-5 w-5" />
            Statistics
          </Button>

          <Button
            onClick={handleShowAchievements}
            variant="outline"
            className="flex items-center gap-2 py-6"
          >
            <Award className="h-5 w-5" />
            Achievements
          </Button>
        </div>

        {/* Enhanced Features */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">4 Difficulty Levels</div>
                  <div className="text-sm text-gray-600">
                    From easy popular characters to expert level challenges
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Smart Hint System</div>
                  <div className="text-sm text-gray-600">
                    Get helpful hints when you need them (difficulty dependent)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Achievement System</div>
                  <div className="text-sm text-gray-600">
                    Unlock achievements and track your progress
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold">Advanced Scoring</div>
                  <div className="text-sm text-gray-600">
                    Difficulty-based scoring with streak bonuses
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Fire className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold">Win Streaks</div>
                  <div className="text-sm text-gray-600">
                    Build winning streaks and challenge your best
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold">Persistent Progress</div>
                  <div className="text-sm text-gray-600">
                    Your stats and achievements are automatically saved
                  </div>
                </div>
              </div>
            </div>
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
                <span className="text-purple-600 font-bold">1.</span>
                <span>Choose your difficulty level (Easy to Expert)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Think of any famous character (real or fictional)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Answer my yes/no questions honestly</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">4.</span>
                <span>Use hints if you need help (difficulty dependent)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">5.</span>
                <span>I'll try to guess your character in 20 questions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">6.</span>
                <span>Build win streaks and unlock achievements!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
