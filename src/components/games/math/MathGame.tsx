import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MathGameBoard } from "./MathGameBoard";
import { MathLobby } from "./MathLobby";
import { MathRules } from "./MathRules";
import { MathLeaderboard } from "./MathLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Star,
  Timer,
  Target,
  Crown,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Home,
  Brain,
  TrendingUp,
} from "lucide-react";
import { MathGameLogic, MathGameState, MathGameScore } from "./MathGameLogic";
import {
  MathLevelGameLogic,
  LevelGameState,
  LevelGameScore,
} from "./MathLevelGameLogic";
import { MathLevelSystem, LevelProgress } from "./MathLevelSystem";
import { MathLevelSystemSupabase } from "./MathLevelSystemSupabase";
import { MathLevelSelector } from "./MathLevelSelector";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface MathGameProps {
  onBack: () => void;
  user: any;
}

type GameView =
  | "lobby"
  | "game"
  | "rules"
  | "leaderboard"
  | "gameComplete"
  | "levels"
  | "levelGame";
type GameType = "classic" | "level";

// UUID validation function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const MathGame: React.FC<MathGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameType, setGameType] = useState<GameType>("classic");
  const [gameLogic, setGameLogic] = useState<MathGameLogic | null>(null);
  const [levelGameLogic, setLevelGameLogic] =
    useState<MathLevelGameLogic | null>(null);
  const [gameState, setGameState] = useState<
    MathGameState | LevelGameState | null
  >(null);
  const [currentScore, setCurrentScore] = useState<
    MathGameScore | LevelGameScore | null
  >(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [levelSystem, setLevelSystem] = useState<MathLevelSystem | null>(null);
  const [supabaseLevelSystem, setSupabaseLevelSystem] =
    useState<MathLevelSystemSupabase | null>(null);

  // Initialize math_scores table and level system
  useEffect(() => {
    const initializeMathTable = async () => {
      try {
        // Check if math_scores table exists by trying a simple query
        const { error } = await supabase
          .from("math_scores")
          .select("id")
          .limit(1);

        if (error && error.message.includes("does not exist")) {
          console.log("math_scores table doesn't exist. Please run migration.");
          toast.error("Database setup required. Please contact support.");
        }
      } catch (error) {
        console.error("Error checking math_scores table:", error);
      }
    };

    const initializeLevelSystem = () => {
      try {
        // Load level progress from localStorage
        const savedProgress = localStorage.getItem(
          `math_level_progress_${user?.id}`,
        );
        const progressData = savedProgress ? JSON.parse(savedProgress) : {};
        const system = new MathLevelSystem(progressData);
        setLevelSystem(system);
      } catch (error) {
        console.error("Error initializing level system:", error);
        // Create new level system on error
        const system = new MathLevelSystem();
        setLevelSystem(system);
      }
    };

    initializeMathTable();
    if (user?.id) {
      initializeLevelSystem();
    }
  }, [user?.id]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      gameState &&
      currentView === "game" &&
      gameState.gameStatus === "playing"
    ) {
      interval = setInterval(() => {
        setGameTimer(Date.now() - gameState.startTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, currentView]);

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartGame = useCallback(
    (
      difficulty: "easy" | "medium" | "hard",
      gameMode: "practice" | "timed" | "endless",
    ) => {
      const logic = new MathGameLogic(difficulty, gameMode);
      setGameLogic(logic);
      setLevelGameLogic(null);
      setGameState(logic.getState());
      setGameType("classic");
      setCurrentView("game");
      setGameTimer(0);
      logic.startGame();
      setGameState(logic.getState());
      toast.success(`Started ${difficulty} ${gameMode} mode! Good luck! 🧠`);
    },
    [],
  );

  const handleStartLevelGame = useCallback(
    (levelNumber: number) => {
      if (!levelSystem) {
        toast.error("Level system not initialized!");
        return;
      }

      try {
        const logic = new MathLevelGameLogic(levelSystem, levelNumber);
        setLevelGameLogic(logic);
        setGameLogic(null);
        setGameState(logic.getState());
        setGameType("level");
        setCurrentView("levelGame");
        setGameTimer(0);
        logic.startGame();
        setGameState(logic.getState());

        const level = levelSystem.getLevel(levelNumber);
        toast.success(
          `Level ${levelNumber}: ${level?.name.replace(`Level ${levelNumber}: `, "")} started! 🎯`,
        );
      } catch (error) {
        console.error("Error starting level game:", error);
        toast.error("Could not start level. Please try again.");
      }
    },
    [levelSystem],
  );

  const handleAnswer = useCallback(
    (answer: number) => {
      const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
      if (!currentLogic || !gameState) return false;

      const isCorrect = currentLogic.answerQuestion(answer);
      const newState = currentLogic.getState();
      setGameState(newState);

      if (isCorrect) {
        toast.success("Correct! 🎉");
      } else {
        if (gameType === "level" && (newState as LevelGameState).isEliminated) {
          toast.error(
            `Wrong! You've been eliminated! The answer was ${gameState.currentQuestion?.correctAnswer}`,
          );
        } else {
          toast.error(
            `Wrong! The answer was ${gameState.currentQuestion?.correctAnswer}`,
          );
        }
      }

      // Check for game end
      if (newState.gameStatus === "finished") {
        handleGameEnd(newState);
      } else {
        // Move to next question after a delay
        setTimeout(() => {
          const hasNextQuestion = currentLogic.nextQuestion();
          const updatedState = currentLogic.getState();
          setGameState(updatedState);

          // Check if game ended after moving to next question
          if (!hasNextQuestion || updatedState.gameStatus === "finished") {
            handleGameEnd(updatedState);
          }
        }, 1500);
      }

      return isCorrect;
    },
    [gameLogic, levelGameLogic, gameState, gameType],
  );

  const handleUseHint = useCallback((): string | null => {
    const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
    if (!currentLogic) return null;
    return currentLogic.useHint();
  }, [gameLogic, levelGameLogic, gameType]);

  const handleSkipQuestion = useCallback((): boolean => {
    const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
    if (!currentLogic) return false;
    const skipped = currentLogic.skipQuestion();
    if (skipped) {
      setGameState(currentLogic.getState());
      toast.info("Question skipped! ⏭️");
    }
    return skipped;
  }, [gameLogic, levelGameLogic, gameType]);

  const handleTimeUpdate = useCallback(
    (timeRemaining: number) => {
      const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
      if (!currentLogic) return;
      currentLogic.updateTime(timeRemaining);
      const newState = currentLogic.getState();
      setGameState(newState);

      if (newState.gameStatus === "finished") {
        handleGameEnd(newState);
      }
    },
    [gameLogic, levelGameLogic, gameType],
  );

  const handleGameEnd = async (finalState: MathGameState | LevelGameState) => {
    // Validate user and user ID
    if (!user) {
      toast.error("Please sign in to save your score!");
      return;
    }

    if (!user.id || !isValidUUID(user.id)) {
      console.error("Invalid user ID:", user.id);
      toast.error("Invalid user session. Please sign in again.");
      return;
    }

    setIsSubmittingScore(true);
    try {
      const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
      const scoreData = currentLogic!.calculateFinalScore();

      // Save level progress if it's a level game
      if (gameType === "level" && levelSystem) {
        const progress = levelSystem.getProgress();
        localStorage.setItem(
          `math_level_progress_${user.id}`,
          JSON.stringify(progress),
        );
      }

      // Create a new object with only the database-relevant properties
      const dbScoreData = {
        user_id: user.id,
        username:
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "Anonymous",
        score: scoreData.score,
        correct_answers: scoreData.correct_answers,
        total_questions: scoreData.total_questions,
        time_taken: scoreData.time_taken,
        difficulty: scoreData.difficulty,
        game_mode: scoreData.game_mode,
        max_streak: scoreData.max_streak,
        hints_used: scoreData.hints_used,
        skips_used: scoreData.skips_used,
        completed_at: scoreData.completed_at,
      };

      console.log("Saving math score data:", dbScoreData);

      const { data, error } = await supabase
        .from("math_scores")
        .insert([dbScoreData])
        .select()
        .single();

      if (error) {
        console.error("Error saving math score:", error);
        if (error.message.includes("invalid input syntax for type uuid")) {
          toast.error(
            "Invalid user session. Please sign out and sign in again.",
          );
        } else {
          toast.error("Failed to save score. Please try again.");
        }
      } else {
        setCurrentScore(data as any); // Type assertion for database compatibility
        toast.success("Score saved successfully! 🏆");
      }
    } catch (error) {
      console.error("Error saving math score:", error);
      toast.error("Failed to save score. Please try again.");
    } finally {
      setIsSubmittingScore(false);
      setCurrentView("gameComplete");
    }
  };

  const handleRestartGame = useCallback(() => {
    if (gameType === "level") {
      // For level games, restart the current level
      if (!levelGameLogic || !levelSystem) return;

      const currentLevel = (gameState as LevelGameState)?.currentLevel.level;
      if (currentLevel) {
        handleStartLevelGame(currentLevel);
        toast.success("Level restarted! 🎯");
      }
    } else {
      // For classic games, use existing restart logic
      if (!gameLogic) return;

      const newState = gameLogic.restartGame();
      setGameState(newState);
      setGameTimer(0);
      gameLogic.startGame();
      setGameState(gameLogic.getState());
      toast.success("Game restarted! 🎮");
    }
  }, [
    gameLogic,
    levelGameLogic,
    levelSystem,
    gameType,
    gameState,
    handleStartLevelGame,
  ]);

  const handlePauseGame = useCallback(() => {
    const currentLogic = gameType === "level" ? levelGameLogic : gameLogic;
    if (!currentLogic) return;

    if (gameState?.gameStatus === "playing") {
      currentLogic.pauseGame();
      toast.info("Game paused! ⏸️");
    } else if (gameState?.gameStatus === "paused") {
      currentLogic.resumeGame();
      toast.info("Game resumed! ▶️");
    }

    setGameState(currentLogic.getState());
  }, [gameLogic, levelGameLogic, gameState, gameType]);

  const renderGameStats = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-semibold">Score</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.score.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-semibold">Correct</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.correctAnswers}/{gameState.questionIndex - 1}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-semibold">Streak</span>
            </div>
            <div className="text-xl font-bold">{gameState.maxStreak}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-semibold">Time</span>
            </div>
            <div className="text-xl font-bold">{formatTime(gameTimer)}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGameControls = () => {
    if (!gameState) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <Button
          onClick={handleRestartGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          New Game
        </Button>

        <Button
          onClick={handlePauseGame}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {gameState.gameStatus === "paused" ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </Button>

        <Button
          onClick={() => setCurrentView("lobby")}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Lobby
        </Button>
      </div>
    );
  };

  // Early validation - show error if user is invalid
  if (!user || !user.id || !isValidUUID(user.id)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You need to be signed in with a valid account to play Math Puzzles
              and save your scores.
            </p>
            <p className="text-sm text-gray-500">
              Please sign out and sign in again if you continue to see this
              message.
            </p>
            <Button onClick={onBack} className="w-full">
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "lobby") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            🆓 Free to Play
          </Badge>
        </div>

        <MathLobby
          onStartGame={handleStartGame}
          onShowRules={() => setCurrentView("rules")}
          onShowLeaderboard={() => setCurrentView("leaderboard")}
          onShowLevels={() => setCurrentView("levels")}
        />
      </div>
    );
  }

  if (currentView === "rules") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        <MathRules />
      </div>
    );
  }

  if (currentView === "leaderboard") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        <MathLeaderboard
          currentUserScore={currentScore}
          onRefresh={() => {
            toast.success("Leaderboard refreshed! 📊");
          }}
        />
      </div>
    );
  }

  if (currentView === "gameComplete" && currentScore) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl text-gray-800 mb-2">
              Game Complete!
            </CardTitle>
            <p className="text-gray-600">
              Great job! Here's how you performed:
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {currentScore.score}
                </div>
                <div className="text-sm text-gray-600">Final Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {currentScore.correct_answers}/{currentScore.total_questions}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {currentScore.max_streak}
                </div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(currentScore.time_taken)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => {
                  setCurrentView("lobby");
                  setCurrentScore(null);
                }}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play Again
              </Button>

              <Button
                onClick={() => setCurrentView("leaderboard")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>

              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                All Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "levels") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </div>

        {levelSystem && (
          <MathLevelSelector
            levelSystem={levelSystem}
            onSelectLevel={handleStartLevelGame}
            onBack={() => setCurrentView("lobby")}
          />
        )}
      </div>
    );
  }

  if ((currentView === "game" || currentView === "levelGame") && gameState) {
    return (
      <div className="space-y-2 sm:space-y-4 w-full min-h-screen">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={() =>
                setCurrentView(gameType === "level" ? "levels" : "lobby")
              }
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to </span>
              {gameType === "level" ? "Levels" : "Lobby"}
            </Button>
            {gameType === "level" ? (
              <Badge className="bg-gradient-to-r from-yellow-100 to-red-100 text-red-800 border-red-200 text-xs">
                Level {(gameState as LevelGameState).currentLevel.level} •{" "}
                {(gameState as LevelGameState).currentLevel.difficulty}
                {(gameState as LevelGameState).currentLevel.eliminationMode &&
                  " • Elimination"}
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                {gameState.difficulty} • {gameState.gameMode}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            {gameState.gameStatus === "finished" && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Finished!
              </Badge>
            )}
            {gameState.gameStatus === "paused" && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                Paused
              </Badge>
            )}
            {isSubmittingScore && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Saving...
              </Badge>
            )}
          </div>
        </div>

        {/* Game Stats - Mobile Hidden to save space */}
        <div className="hidden lg:block">{renderGameStats()}</div>

        {/* Game Board - Full Width */}
        <div className="w-full">
          <MathGameBoard
            gameState={gameState}
            onAnswer={handleAnswer}
            onUseHint={handleUseHint}
            onSkipQuestion={handleSkipQuestion}
            onTimeUpdate={handleTimeUpdate}
            className={
              gameState.gameStatus === "paused"
                ? "opacity-50 pointer-events-none"
                : ""
            }
          />
        </div>

        {/* Game Controls - Mobile Optimized */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-4 px-2 sm:px-0">
          <Button
            onClick={handleRestartGame}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">New </span>Game
          </Button>

          <Button
            onClick={handlePauseGame}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            {gameState.gameStatus === "paused" ? (
              <>
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                Pause
              </>
            )}
          </Button>

          <Button
            onClick={() =>
              setCurrentView(gameType === "level" ? "levels" : "lobby")
            }
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4" />
            {gameType === "level" ? "Levels" : "Lobby"}
          </Button>

          <Button
            onClick={() => setCurrentView("leaderboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Leader</span>board
          </Button>
        </div>

        {/* Pause Overlay - Mobile Optimized */}
        {gameState.gameStatus === "paused" && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                  Game Paused
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 text-sm sm:text-base">
                  Your game is paused. Click resume to continue playing.
                </p>
                <Button onClick={handlePauseGame} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Resume Game
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return null;
};
