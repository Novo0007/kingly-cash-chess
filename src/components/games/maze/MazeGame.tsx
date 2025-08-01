import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MazeBoardEnhanced } from "./MazeBoardEnhanced";
import { MazeLobby } from "./MazeLobby";
import { MazeRules } from "./MazeRules";
import { MazeLeaderboard } from "./MazeLeaderboard";
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
} from "lucide-react";
import { MazeGameState, MazeGameLogic, MazeScore } from "./MazeGameLogic";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface MazeGameProps {
  onBack: () => void;
  user: any;
}

type GameView = "lobby" | "game" | "rules" | "leaderboard" | "gameComplete";

export const MazeGame: React.FC<MazeGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameState, setGameState] = useState<MazeGameState | null>(null);
  const [currentScore, setCurrentScore] = useState<MazeScore | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Initialize maze scores table if it doesn't exist
  useEffect(() => {
    const initializeMazeTable = async () => {
      try {
        // Check if maze_scores table exists by trying a simple query
        const { error } = await (supabase as any)
          .from("maze_scores")
          .select("id")
          .limit(1);

        if (
          error &&
          error.message.includes('relation "public.maze_scores" does not exist')
        ) {
          console.log("Creating maze_scores table...");
          // The table will be created via migration or manually in Supabase dashboard
          toast.info("Setting up maze leaderboard system...");
        }
      } catch (error) {
        console.log("Maze table initialization check:", error);
      }
    };

    initializeMazeTable();
  }, []);

  const handleStartGame = (difficulty: "easy" | "medium" | "hard") => {
    const newGameState = MazeGameLogic.createNewGame(difficulty);
    newGameState.gameStatus = "playing";
    setGameState(newGameState);
    setCurrentView("game");
    toast.success(`🧩 Starting ${difficulty} maze challenge!`);
  };

  const handleGameComplete = async (score: number, timeTaken: number) => {
    if (!gameState || !user) return;

    const newScore: MazeScore = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      username:
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Anonymous",
      score,
      time_taken: timeTaken,
      difficulty: gameState.difficulty,
      maze_size: gameState.size,
      completed_at: new Date().toISOString(),
    };

    setCurrentScore(newScore);
    await submitScore(newScore);
    setCurrentView("gameComplete");
  };

  const submitScore = async (scoreData: MazeScore) => {
    if (isSubmittingScore) return;

    setIsSubmittingScore(true);
    try {
      const { error } = await (supabase as any).from("maze_scores").insert([
        {
          user_id: scoreData.user_id,
          username: scoreData.username,
          score: scoreData.score,
          time_taken: scoreData.time_taken,
          difficulty: scoreData.difficulty,
          maze_size: scoreData.maze_size,
          completed_at: scoreData.completed_at
        }
      ]);

      if (error) {
        console.error("Error submitting score:", error);
        toast.error("Failed to submit score to leaderboard");
      } else {
        toast.success("🏆 Score submitted to leaderboard!");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Failed to submit score");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleGameReset = () => {
    if (gameState) {
      const newGameState = MazeGameLogic.createNewGame(gameState.difficulty);
      newGameState.gameStatus = "playing";
      setGameState(newGameState);
      toast.info("🔄 Maze reset! New challenge generated.");
    }
  };

  const handleNewGame = () => {
    setGameState(null);
    setCurrentScore(null);
    setCurrentView("lobby");
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "from-green-500 to-emerald-600";
      case "medium":
        return "from-yellow-500 to-orange-600";
      case "hard":
        return "from-red-500 to-rose-600";
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  const shareScore = async () => {
    if (!currentScore) return;

    const shareText = `🧩 Just completed a ${currentScore.difficulty} maze in ${formatTime(currentScore.time_taken)} and scored ${currentScore.score} points! Can you beat my time? 🏆`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Maze Challenge Score",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Score copied to clipboard!");
    }
  };

  if (currentView === "rules") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <MazeRules
          onStartGame={() => setCurrentView("lobby")}
          onBack={() => setCurrentView("lobby")}
        />
      </div>
    );
  }

  if (currentView === "leaderboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button
            onClick={() => setCurrentView("lobby")}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
          <MazeLeaderboard currentUserScore={currentScore} />
        </div>
      </div>
    );
  }

  if (currentView === "game" && gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Game Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              onClick={() => setCurrentView("lobby")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Game
            </Button>

            <div className="flex items-center gap-3">
              <Badge
                className={`bg-gradient-to-r ${getDifficultyColor(gameState.difficulty)} text-white border-0 px-3 py-1`}
              >
                <Crown className="h-3 w-3 mr-1" />
                {gameState.difficulty.toUpperCase()}
              </Badge>
              <Badge className="bg-white/80 text-gray-800 border border-gray-200 px-3 py-1">
                <Target className="h-3 w-3 mr-1" />
                {gameState.size}×{gameState.size}
              </Badge>
            </div>
          </div>

          {/* Game Board */}
          <MazeBoardEnhanced
            gameState={gameState}
            onGameComplete={handleGameComplete}
            onGameReset={handleGameReset}
          />
        </div>
      </div>
    );
  }

  if (currentView === "gameComplete" && currentScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Celebration Header */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 border-0 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-pink-300/20"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full"></div>

            <CardHeader className="relative text-center pb-6 pt-8">
              <CardTitle>
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <span className="block text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">
                  MAZE COMPLETED!
                </span>
                <p className="text-white/90 text-lg font-medium">
                  Congratulations on solving the puzzle!
                </p>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Score Details */}
          <Card className="bg-white border-2 border-yellow-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-800">
                  Your Achievement
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Score */}
              <div className="text-center">
                <div className="text-5xl font-black text-yellow-600 mb-2">
                  {currentScore.score.toLocaleString()}
                </div>
                <div className="text-lg text-gray-600">Points Earned</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-800">
                    {formatTime(currentScore.time_taken)}
                  </div>
                  <div className="text-xs text-gray-600">Completion Time</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-800 capitalize">
                    {currentScore.difficulty}
                  </div>
                  <div className="text-xs text-gray-600">Difficulty</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-800">
                    {currentScore.maze_size}×{currentScore.maze_size}
                  </div>
                  <div className="text-xs text-gray-600">Maze Size</div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center border border-pink-200">
                  <Sparkles className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-800">
                    {isSubmittingScore ? "..." : "✓"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isSubmittingScore ? "Submitting" : "Saved"}
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-200">
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 mb-2">
                    🏆 Performance Rating
                  </h3>
                  <p className="text-gray-700">
                    {currentScore.score >= 1000
                      ? "🔥 Outstanding! You're a maze master!"
                      : currentScore.score >= 500
                        ? "⭐ Excellent solving skills!"
                        : currentScore.score >= 300
                          ? "👍 Good job! Keep practicing!"
                          : "💪 Nice effort! Try again for a higher score!"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={shareScore}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Score
                </Button>

                <Button
                  onClick={() => setCurrentView("leaderboard")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleStartGame(currentScore.difficulty)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Play Same Level
                </Button>

                <Button
                  onClick={handleNewGame}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  New Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default: Lobby view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>

        <MazeLobby
          onStartGame={handleStartGame}
          onShowRules={() => setCurrentView("rules")}
          onShowLeaderboard={() => setCurrentView("leaderboard")}
        />
      </div>
    </div>
  );
};
