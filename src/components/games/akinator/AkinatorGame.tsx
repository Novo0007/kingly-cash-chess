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
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  AkinatorGameLogic,
  type GameState,
  type Character,
  type Question,
} from "./AkinatorGameLogic";
import type { User } from "@supabase/supabase-js";

interface AkinatorGameProps {
  onBack: () => void;
  user: User;
}

type GameView = "menu" | "playing" | "completed";

export const AkinatorGame: React.FC<AkinatorGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<AkinatorGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCharacterHint, setShowCharacterHint] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    perfectGames: 0,
  });

  // Start a new game
  const startGame = useCallback(() => {
    try {
      setIsLoading(true);

      // Initialize game logic
      const logic = new AkinatorGameLogic((newState) => {
        setGameState(newState);
      });

      setGameLogic(logic);
      setGameState(logic.getGameState());
      setCurrentView("playing");
      setShowCharacterHint(false);

      toast.success("Think of a character and I'll try to guess it! 🔮");
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    },
    [gameLogic, gameState],
  );

  // Handle game completion
  useEffect(() => {
    if (!gameState || !gameLogic) return;

    if (gameState.isGameComplete) {
      const stats = gameLogic.getCompletionStats();

      // Update game stats
      setGameStats((prev) => ({
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon:
          gameState.gameStatus === "won" ? prev.gamesWon + 1 : prev.gamesWon,
        totalScore: prev.totalScore + stats.score,
        perfectGames:
          stats.questionsAsked <= 10 && gameState.gameStatus === "won"
            ? prev.perfectGames + 1
            : prev.perfectGames,
      }));

      // Show completion view after a short delay
      setTimeout(() => {
        setCurrentView("completed");
      }, 1500);
    }
  }, [gameState, gameLogic]);

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
    startGame();
  };

  // Show character hint
  const handleShowHint = () => {
    setShowCharacterHint(true);
    toast.info("Here are some of the characters I can guess! 💡");
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
                    Question {gameState.questionCount + 1}
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-yellow-300">
                    {gameState.score}
                  </div>
                  <div className="text-sm text-purple-100">Score</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-blue-300 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    {AkinatorGameLogic.formatTime(gameState.timeElapsed)}
                  </div>
                  <div className="text-sm text-purple-100">Time</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-green-300">
                    {gameState.questionCount}
                  </div>
                  <div className="text-sm text-purple-100">Questions</div>
                </div>
              </div>
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
                    <Badge className="mt-2 bg-purple-100 text-purple-800">
                      {gameState.guessedCharacter.category}
                    </Badge>
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
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {gameLogic
                    ?.getPossibleCharacters()
                    .slice(0, 8)
                    .map((char) => (
                      <div
                        key={char.id}
                        className="p-2 bg-gray-50 rounded-lg text-center"
                      >
                        <div className="font-semibold text-purple-600">
                          {char.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {char.category}
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
          <div className="flex justify-center gap-3">
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
              onClick={handleResetGame}
              variant="outline"
              disabled={gameState.isGameComplete}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
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
                    I guessed it in {stats.questionsAsked} questions!
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😅</div>
                  <h2 className="text-2xl font-bold mb-2">You Stumped Me!</h2>
                  <p className="text-purple-100">
                    Great job! You thought of a character I couldn't guess.
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
                <div className="text-sm text-gray-600">I Guessed Right</div>
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
                cartoons. I'll try to guess who it is in 20 questions or less!
              </p>
            </div>

            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6"
            >
              <Brain className="h-6 w-6 mr-2" />
              <span className="text-lg font-bold">START GAME</span>
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Game Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Smart AI Questions</div>
                  <div className="text-sm text-gray-600">
                    I ask intelligent questions to narrow down possibilities
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Large Character Database</div>
                  <div className="text-sm text-gray-600">
                    Hundreds of characters from all categories
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Quick & Fun</div>
                  <div className="text-sm text-gray-600">
                    Fast-paced guessing game perfect for mobile
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold">Score & Statistics</div>
                  <div className="text-sm text-gray-600">
                    Track your wins and challenge my accuracy
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
                <span>Think of any famous character (real or fictional)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Answer my yes/no questions honestly</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">3.</span>
                <span>I'll try to guess your character in 20 questions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">4.</span>
                <span>
                  Confirm if my guess is correct or if you stumped me!
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">5.</span>
                <span>Try to beat my success rate and challenge my AI!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
