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
  Coins,
  Lightbulb,
  Target,
  Eye,
  Star,
  Play,
  RotateCcw,
  Home,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  FourPicsGameLogic,
  type FourPicsLevel,
  type GameState,
  type HintType,
} from "./FourPicsGameLogic";
import {
  getFourPicsLevels,
  getFourPicsProgress,
  completeFourPicsLevel,
  recordFourPicsHint,
  canAccessFourPicsLevel,
} from "@/utils/fourpicsDbHelper";
import type { User } from "@supabase/supabase-js";

interface FourPicsGameProps {
  onBack: () => void;
  user: User;
  initialLevel?: number;
}

type GameView = "menu" | "playing" | "completed";

export const FourPicsGame: React.FC<FourPicsGameProps> = ({
  onBack,
  user,
  initialLevel = 1,
}) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<FourPicsGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<FourPicsLevel | null>(null);
  const [userProgress, setUserProgress] = useState<{
    current_level: number;
    total_levels_completed: number;
    total_coins_earned: number;
    total_coins_spent: number;
    total_hints_used: number;
    total_time_played: number;
    highest_level_reached: number;
  } | null>(null);
  const [userInput, setUserInput] = useState("");
  const [coinBalance, setCoinBalance] = useState(100); // This would come from your coin system
  const [isLoading, setIsLoading] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<FourPicsLevel[]>([]);

  // Fetch user progress and available levels
  const fetchGameData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch user progress
      const progressResult = await getFourPicsProgress(user.id);
      if (progressResult.success) {
        setUserProgress(progressResult.data);
      } else {
        console.warn("Failed to fetch 4 Pics progress:", progressResult.error);
        // Set default progress if database not set up
        setUserProgress({
          current_level: 1,
          total_levels_completed: 0,
          total_coins_earned: 0,
          total_coins_spent: 0,
          total_hints_used: 0,
          total_time_played: 0,
          highest_level_reached: 1,
        });
      }

      // Fetch available levels
      const levelsResult = await getFourPicsLevels();
      if (levelsResult.success) {
        setAvailableLevels(levelsResult.data || []);
      } else {
        console.warn("Failed to fetch 4 Pics levels:", levelsResult.error);
        // Show error but allow demo with fallback levels
        toast.error(
          "Game database not set up yet. Please run the migration first.",
        );
        // Create fallback demo levels
        setAvailableLevels([
          {
            id: "demo-1",
            level_number: 1,
            word: "DEMO",
            image_urls: [
              "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=300&fit=crop",
              "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop",
              "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop",
              "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=300&h=300&fit=crop",
            ],
            difficulty: "easy" as const,
            hint_letter_cost: 5,
            hint_image_cost: 10,
            hint_word_cost: 15,
            coins_reward: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      toast.error("Failed to load game data");
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  // Start a specific level
  const startLevel = useCallback(
    async (levelNumber: number) => {
      try {
        setIsLoading(true);

        // Check if user can access this level
        const accessResult = await canAccessFourPicsLevel(user.id, levelNumber);
        if (!accessResult.success || !accessResult.data) {
          toast.error("You must complete previous levels first!");
          return;
        }

        // Find the level
        const level = availableLevels.find(
          (l) => l.level_number === levelNumber,
        );
        if (!level) {
          toast.error("Level not found!");
          return;
        }

        // Initialize game logic
        const logic = new FourPicsGameLogic(level, (newState) => {
          setGameState(newState);
        });

        setGameLogic(logic);
        setCurrentLevel(level);
        setGameState(logic.getGameState());
        setUserInput("");
        setCurrentView("playing");

        toast.success(`Level ${levelNumber} started!`);
      } catch (error) {
        console.error("Error starting level:", error);
        toast.error("Failed to start level");
      } finally {
        setIsLoading(false);
      }
    },
    [availableLevels, user.id],
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (gameLogic) {
      gameLogic.updateUserInput(value);
    }
  };

  // Submit answer
  const handleSubmitAnswer = useCallback(async () => {
    if (!gameLogic || !currentLevel) return;

    const result = gameLogic.submitAnswer();

    if (result.success) {
      // Level completed successfully
      const stats = gameLogic.getCompletionStats();

      try {
        // Save completion to database
        const completionResult = await completeFourPicsLevel({
          userId: user.id,
          levelId: currentLevel.id,
          levelNumber: currentLevel.level_number,
          word: currentLevel.word,
          attempts: stats.attempts,
          hintsUsed: gameState?.hintsUsed || [],
          timeTaken: stats.timeElapsed,
          coinsSpent: stats.coinsSpent,
        });

        if (completionResult.success) {
          toast.success(
            `${result.message} You earned ${completionResult.data?.coins_earned} coins!`,
          );
          setCoinBalance(
            (prev) => prev + (completionResult.data?.coins_earned || 0),
          );

          // Refresh progress
          await fetchGameData();

          setCurrentView("completed");
        } else {
          toast.error("Failed to save progress: " + completionResult.error);
        }
      } catch (error) {
        console.error("Error saving completion:", error);
        toast.error("Failed to save progress");
      }
    } else {
      toast.error(result.message);
    }
  }, [gameLogic, currentLevel, user.id, gameState, fetchGameData]);

  // Use hint
  const handleUseHint = useCallback(
    async (hintType: HintType) => {
      if (!gameLogic || !currentLevel) return;

      const hintStatus = gameLogic.getHintStatus(hintType);

      if (!hintStatus.available) {
        toast.error("Hint already used!");
        return;
      }

      if (coinBalance < hintStatus.cost) {
        toast.error("Not enough coins! You need more coins to buy this hint.");
        return;
      }

      try {
        // Use hint in game logic first
        const result = gameLogic.useHint(hintType);

        if (result.success) {
          // Then record hint usage in database
          const hintResult = await recordFourPicsHint(
            user.id,
            currentLevel.id,
            hintType,
          );

          if (hintResult.success) {
            setCoinBalance((prev) => prev - result.cost);
            toast.success(result.message);
          } else {
            // If database call fails, we still show the hint but warn user
            console.warn("Failed to record hint usage:", hintResult.error);
            setCoinBalance((prev) => prev - result.cost);
            toast.success(result.message + " (Progress may not be saved)");
          }
        }
      } catch (error) {
        console.error("Error using hint:", error);
        toast.error("Failed to use hint");
      }
    },
    [gameLogic, currentLevel, coinBalance, user.id],
  );

  // Reset current level
  const handleResetLevel = () => {
    if (gameLogic) {
      gameLogic.resetGame();
      setUserInput("");
      toast.info("Level reset!");
    }
  };

  // Go to next level
  const handleNextLevel = () => {
    if (currentLevel) {
      const nextLevelNumber = currentLevel.level_number + 1;
      const nextLevel = availableLevels.find(
        (l) => l.level_number === nextLevelNumber,
      );

      if (nextLevel) {
        startLevel(nextLevelNumber);
      } else {
        toast.success(
          "Congratulations! You've completed all available levels!",
        );
        setCurrentView("menu");
      }
    }
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
    return FourPicsGameLogic.getDifficultyColor(difficulty);
  };

  // Loading state
  if (isLoading && currentView === "menu") {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading 4 Pics 1 Word...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Playing view
  if (currentView === "playing" && gameState && currentLevel) {
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
                    Level {currentLevel.level_number}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {coinBalance}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {gameState.attempts}
                  </div>
                  <div className="text-sm text-gray-600">Attempts</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    {FourPicsGameLogic.formatTime(gameState.timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {gameState.hintsUsed.length}
                  </div>
                  <div className="text-sm text-gray-600">Hints</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Grid */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {currentLevel.image_urls.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      gameState.highlightedImages.has(index)
                        ? "ring-4 ring-yellow-400 ring-opacity-75"
                        : ""
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Clue ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image if loading fails
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Word Input Section */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Revealed Letters Display */}
              {gameState.revealedLetters.size > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Revealed letters:
                  </p>
                  <p className="text-2xl font-mono tracking-widest bg-gray-100 p-3 rounded-lg">
                    {gameLogic.getWordWithRevealedLetters()}
                  </p>
                </div>
              )}

              {/* Word Length Hint */}
              {gameState.showWordLength && (
                <div className="text-center">
                  <p className="text-sm text-blue-600">
                    💡 The word has {currentLevel.word.length} letters
                  </p>
                </div>
              )}

              {/* Input Field */}
              <div className="space-y-3">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) =>
                    handleInputChange(e.target.value.toUpperCase())
                  }
                  placeholder="Enter your answer..."
                  className="text-center text-lg font-semibold uppercase"
                  disabled={gameState.isCompleted}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitAnswer();
                    }
                  }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userInput.trim() || gameState.isCompleted}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Submit
                  </Button>

                  <Button
                    onClick={handleResetLevel}
                    variant="outline"
                    disabled={gameState.isCompleted}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hints Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleUseHint("letter")}
                  disabled={
                    !gameLogic?.getHintStatus("letter").available ||
                    coinBalance < currentLevel.hint_letter_cost ||
                    gameState.isCompleted
                  }
                  className="justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Reveal Letter</div>
                      <div className="text-sm text-gray-500">
                        Show a random letter
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    {currentLevel.hint_letter_cost}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleUseHint("image")}
                  disabled={
                    !gameLogic?.getHintStatus("image").available ||
                    coinBalance < currentLevel.hint_image_cost ||
                    gameState.isCompleted
                  }
                  className="justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Highlight Images</div>
                      <div className="text-sm text-gray-500">
                        Highlight related images
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    {currentLevel.hint_image_cost}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleUseHint("word")}
                  disabled={
                    !gameLogic?.getHintStatus("word").available ||
                    coinBalance < currentLevel.hint_word_cost ||
                    gameState.isCompleted
                  }
                  className="justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Word Length</div>
                      <div className="text-sm text-gray-500">
                        Show number of letters
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="h-4 w-4" />
                    {currentLevel.hint_word_cost}
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  // Completed view
  if (currentView === "completed" && gameState && currentLevel) {
    const stats = gameLogic?.getCompletionStats();

    return (
      <MobileContainer>
        <div className="space-y-6 text-center">
          <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-8">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-2xl font-bold mb-2">Level Completed!</h2>
              <p className="text-green-100">
                The word was:{" "}
                <span className="font-bold text-xl">{currentLevel.word}</span>
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Your Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.attempts}
                    </div>
                    <div className="text-sm text-gray-600">Attempts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {FourPicsGameLogic.formatTime(stats.timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.hintsUsed}
                    </div>
                    <div className="text-sm text-gray-600">Hints Used</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.coinsSpent}
                    </div>
                    <div className="text-sm text-gray-600">Coins Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleNextLevel}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Next Level
            </Button>

            <Button
              onClick={() => setCurrentView("menu")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Level Select
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

              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="font-bold">{coinBalance} Coins</span>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl mb-2">4 Pics 1 Word</CardTitle>
              <p className="text-blue-100">
                Guess the word from four pictures!
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Card */}
        {userProgress && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {userProgress.current_level}
                  </div>
                  <div className="text-sm text-gray-600">Current Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {userProgress.total_levels_completed}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {userProgress.total_coins_earned}
                  </div>
                  <div className="text-sm text-gray-600">Coins Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {userProgress.highest_level_reached}
                  </div>
                  <div className="text-sm text-gray-600">Highest Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Level Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {availableLevels.slice(0, 20).map((level) => {
                const isUnlocked =
                  !userProgress ||
                  level.level_number <= userProgress.current_level;
                const isCompleted =
                  userProgress &&
                  level.level_number < userProgress.current_level;

                return (
                  <Button
                    key={level.id}
                    variant={isCompleted ? "default" : "outline"}
                    size="sm"
                    onClick={() => startLevel(level.level_number)}
                    disabled={!isUnlocked}
                    className={`aspect-square p-0 ${
                      isCompleted ? "bg-green-500 hover:bg-green-600" : ""
                    } ${!isUnlocked ? "opacity-50" : ""}`}
                  >
                    {isCompleted ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      level.level_number
                    )}
                  </Button>
                );
              })}
            </div>

            {availableLevels.length > 20 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                More levels will be unlocked as you progress!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Play className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold">Continue</h3>
              <p className="text-sm text-gray-600">
                Level {userProgress?.current_level || 1}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Coins className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-bold">Get Coins</h3>
              <p className="text-sm text-gray-600">Buy more hints</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};
