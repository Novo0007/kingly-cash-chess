import React, { useState, useEffect, useCallback } from "react";
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
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);

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

      setGameTimer(timer);
      return () => clearInterval(timer);
    } else if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
  }, [gameState, currentView, gameLogic, gameTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) {
        clearInterval(gameTimer);
      }
    };
  }, [gameTimer]);

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
        toast.error(`Sorry, "${letter}" is not in the word. ❌`);
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
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
  }, [gameTimer]);

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
  );
};
