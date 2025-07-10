import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import "@/styles/wordsearch-mobile.css";
import {
  ArrowLeft,
  Clock,
  Trophy,
  Users,
  Coins,
  Lightbulb,
  Star,
  Target,
} from "lucide-react";
import { WordSearchBoard } from "./WordSearchBoard";
import { WordSearchLobby } from "./WordSearchLobby";
import { WordSearchLeaderboard } from "./WordSearchLeaderboard";
import { SimpleLeaderboard } from "./SimpleLeaderboard";
import { LevelProgressionGame } from "./LevelProgressionGame";
import { CoinShop } from "./CoinShop";
import { WordSearchGameLogic, GameState, Player } from "./WordSearchGameLogic";
import {
  getUserCoinBalance,
  deductCoins,
  saveWordSearchScore,
  recordHintUsage,
  getWordSearchGame,
  updateWordSearchGameState,
  saveWordSearchMove,
  completeWordSearchGame,
} from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { User } from "@supabase/supabase-js";

interface WordSearchGameProps {
  onBack: () => void;
  user: User;
}

type GameView =
  | "menu"
  | "solo"
  | "levels"
  | "lobby"
  | "multiplayer"
  | "leaderboard"
  | "shop";

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  onBack,
  user,
}) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("menu");
  const [gameLogic, setGameLogic] = useState<WordSearchGameLogic | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [selectedGridSize, setSelectedGridSize] = useState<number>(15);
  const [selectedWordCount, setSelectedWordCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's coin balance
  const fetchCoinBalance = useCallback(async () => {
    try {
      const result = await getUserCoinBalance(user.id);
      if (result.success) {
        setCoinBalance(result.balance || 100); // Default starting balance
      } else {
        console.warn("Could not fetch coin balance:", result.error);
        setCoinBalance(100); // Default fallback balance
      }
    } catch (error) {
      console.warn(
        "Error fetching coin balance:",
        error instanceof Error ? error.message : String(error),
      );
      setCoinBalance(100); // Default fallback balance
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

  const startSoloGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const logic = new WordSearchGameLogic(
        selectedDifficulty,
        selectedGridSize,
        selectedWordCount,
        false, // not multiplayer
        0, // no entry fee for solo
      );

      const player: Player = {
        id: user.id,
        username:
          user.user_metadata?.username || user.email?.split("@")[0] || "Player",
        score: 0,
        wordsFound: [],
        hintsUsed: 0,
        isOnline: true,
      };

      logic.addPlayer(player);
      logic.startGame();

      setGameLogic(logic);
      setGameState(logic.getGameState());
      setCurrentView("solo");
      setTimeRemaining(logic.getTimeRemaining());

      toast.success("Solo game started! Find all the words!");
    } catch (error) {
      console.error("Error starting solo game:", error);
      toast.error("Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedDifficulty, selectedGridSize, selectedWordCount]);

  const handleWordFound = useCallback(
    async (start: any, end: any) => {
      if (!gameLogic || !gameState) return;

      const result = gameLogic.findWord(user.id, start, end);

      if (result.success && result.word && result.points) {
        const newState = gameLogic.getGameState();
        setGameState(newState);

        // Save move if multiplayer
        if (currentGameId) {
          await saveWordSearchMove(currentGameId, {
            playerId: user.id,
            word: result.word,
            start,
            end,
            direction:
              gameLogic
                .getGameState()
                .foundWords.find((fw) => fw.word === result.word)?.direction ||
              "horizontal",
            timestamp: Date.now(),
          });

          // Update game state in database
          await updateWordSearchGameState(currentGameId, newState);
        }

        toast.success(`Found "${result.word}"! +${result.points} points`);

        // Check if game is complete
        if (gameLogic.isGameComplete()) {
          handleGameEnd();
        }
      } else {
        toast.error("Not a valid word or already found!");
      }
    },
    [gameLogic, gameState, user.id, currentGameId],
  );

  const handleHintRequest = useCallback(
    async (
      hintType: "letter_highlight" | "word_location" | "direction_hint",
    ) => {
      if (!gameLogic || !gameState) return;

      const hintCost = 5; // 5 coins per hint

      if (coinBalance < hintCost) {
        toast.error("Not enough coins for hint! Visit the shop to buy more.");
        return;
      }

      // Find a word that hasn't been found yet
      const remainingWords = gameState.words.filter(
        (word) => !gameState.foundWords.some((fw) => fw.word === word),
      );

      if (remainingWords.length === 0) {
        toast.info("All words have been found!");
        return;
      }

      const targetWord =
        remainingWords[Math.floor(Math.random() * remainingWords.length)];

      // Deduct coins
      try {
        const deductResult = await deductCoins(
          user.id,
          hintCost,
          currentGameId,
          `Hint: ${hintType} for word "${targetWord}"`,
          "hint_purchase",
        );

        if (!deductResult.success) {
          console.warn("Failed to deduct coins for hint:", deductResult.error);
          // Still allow hint in demo mode
        }

        setCoinBalance(Math.max(0, coinBalance - hintCost)); // Local fallback
      } catch (error) {
        console.warn(
          "Error processing hint purchase:",
          error instanceof Error ? error.message : String(error),
        );
        // Continue with hint anyway for demo purposes
        setCoinBalance(Math.max(0, coinBalance - hintCost));
      }

      // Use hint in game logic
      gameLogic.useHint(user.id, hintType, targetWord);
      setGameState(gameLogic.getGameState());

      // Record hint usage
      await recordHintUsage(
        user.id,
        currentGameId,
        hintType,
        targetWord,
        hintCost,
      );

      // Clear hints after 3 seconds
      setTimeout(() => {
        if (gameLogic) {
          gameLogic.clearHints();
          setGameState(gameLogic.getGameState());
        }
      }, 3000);

      let hintMessage = "";
      switch (hintType) {
        case "letter_highlight":
          hintMessage = `First letter of "${targetWord}" is highlighted!`;
          break;
        case "word_location":
          hintMessage = `Location of "${targetWord}" is highlighted!`;
          break;
        case "direction_hint":
          const placement = gameState.wordPlacements.find(
            (p) => p.word === targetWord,
          );
          hintMessage = placement
            ? `"${targetWord}" is placed ${placement.direction}ly`
            : `Direction hint for "${targetWord}"`;
          break;
      }

      toast.success(hintMessage);
    },
    [gameLogic, gameState, coinBalance, user.id, currentGameId],
  );

  const handleGameEnd = useCallback(async () => {
    if (!gameLogic || !gameState) return;

    gameLogic.endGame();
    const finalState = gameLogic.getGameState();
    setGameState(finalState);

    const player = finalState.players.find((p) => p.id === user.id);
    if (!player) return;

    const timeTaken =
      finalState.endTime && finalState.startTime
        ? Math.round((finalState.endTime - finalState.startTime) / 1000)
        : gameState.timeLimit;

    const coinsSpent = player.hintsUsed * 5; // 5 coins per hint

    // Calculate coins won (for solo games, small reward based on performance)
    let coinsWon = 0;
    if (!gameState.isMultiplayer) {
      const completionRate = player.wordsFound.length / gameState.words.length;
      if (completionRate === 1) {
        coinsWon = 20; // Perfect game bonus
      } else if (completionRate >= 0.8) {
        coinsWon = 10; // Good performance bonus
      } else if (completionRate >= 0.5) {
        coinsWon = 5; // Participation bonus
      }
    }

    // Save score
    try {
      await saveWordSearchScore({
        user_id: user.id,
        username: player.username,
        game_id: currentGameId,
        score: player.score,
        words_found: player.wordsFound.length,
        total_words: gameState.words.length,
        time_taken: timeTaken,
        hints_used: player.hintsUsed,
        coins_spent: coinsSpent,
        coins_won: coinsWon,
        difficulty: gameState.difficulty,
        game_mode: gameState.isMultiplayer ? "multiplayer" : "solo",
        grid_size: gameState.gridSize,
        is_solo_game: !gameState.isMultiplayer,
      });
    } catch (error) {
      console.warn("Could not save score to database:", error);
      // Continue with game completion despite database error
    }

    // Complete multiplayer game
    if (currentGameId && gameState.isMultiplayer) {
      const leaderboard = gameLogic.getLeaderboard();
      const finalScores = leaderboard.map((p) => ({
        user_id: p.id,
        username: p.username,
        score: p.score,
        words_found: p.wordsFound.length,
        total_words: gameState.words.length,
        time_taken: timeTaken,
        hints_used: p.hintsUsed,
        coins_spent: p.hintsUsed * 5,
      }));

      await completeWordSearchGame(currentGameId, finalScores);
    }

    // Award coins if any
    if (coinsWon > 0) {
      await fetchCoinBalance();
      toast.success(`Game complete! You earned ${coinsWon} coins!`);
    } else {
      toast.success("Game complete!");
    }

    // Show results
    const completionRate = Math.round(
      (player.wordsFound.length / gameState.words.length) * 100,
    );
    setTimeout(() => {
      toast.info(
        `Final Score: ${player.score} points (${completionRate}% words found)`,
      );
    }, 1000);
  }, [gameLogic, gameState, user, currentGameId, fetchCoinBalance]);

  const handleJoinGame = useCallback((gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentView("multiplayer");
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (currentView === "lobby") {
    return (
      <WordSearchLobby
        onJoinGame={handleJoinGame}
        onBack={() => setCurrentView("menu")}
        user={user}
        coinBalance={coinBalance}
      />
    );
  }

  if (currentView === "leaderboard") {
    return <WordSearchLeaderboard onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "shop") {
    return (
      <CoinShop
        onBack={() => setCurrentView("menu")}
        user={user}
        currentBalance={coinBalance}
        onPurchaseComplete={fetchCoinBalance}
      />
    );
  }

  if (currentView === "solo" || currentView === "multiplayer") {
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
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Badge
                    className={getDifficultyColor(
                      gameState?.difficulty || "medium",
                    )}
                  >
                    {gameState?.difficulty?.toUpperCase()}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {gameState?.players.find((p) => p.id === user.id)?.score ||
                      0}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {gameState?.foundWords.length || 0}/
                    {gameState?.words.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Words Found</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                    <Clock className="h-5 w-5" />
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-600">Time Left</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {gameState?.players.find((p) => p.id === user.id)
                      ?.hintsUsed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Hints Used</div>
                </div>
              </div>

              {/* Hint Buttons - Mobile Optimized */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => handleHintRequest("letter_highlight")}
                  className="hint-button flex items-center gap-1 min-h-[44px]"
                  disabled={coinBalance < 5}
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">First Letter</span>
                  <span className="sm:hidden">Letter</span>
                  (5 <Coins className="h-3 w-3" />)
                </Button>

                <Button
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => handleHintRequest("word_location")}
                  className="hint-button flex items-center gap-1 min-h-[44px]"
                  disabled={coinBalance < 5}
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Show Word</span>
                  <span className="sm:hidden">Show</span>
                  (5 <Coins className="h-3 w-3" />)
                </Button>

                <Button
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  onClick={() => handleHintRequest("direction_hint")}
                  className="hint-button flex items-center gap-1 min-h-[44px]"
                  disabled={coinBalance < 5}
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Direction</span>
                  <span className="sm:hidden">Dir</span>
                  (5 <Coins className="h-3 w-3" />)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Word Search Board */}
          {gameState && (
            <WordSearchBoard
              gameState={gameState}
              onWordFound={handleWordFound}
              isActive={gameState.gameStatus === "active"}
            />
          )}

          {/* Words List */}
          {gameState && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Words to Find</CardTitle>
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
                        className={`p-2 text-center rounded-lg border ${
                          isFound
                            ? "bg-green-100 text-green-800 border-green-300 line-through"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {word}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
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
              <CardTitle className="text-3xl mb-2">Word Search</CardTitle>
              <p className="text-blue-100">
                Find hidden words in the puzzle grid!
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <Button
                    key={diff}
                    variant={
                      selectedDifficulty === diff ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={
                      diff === selectedDifficulty
                        ? getDifficultyColor(diff)
                        : ""
                    }
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Grid Size
                </label>
                <select
                  value={selectedGridSize}
                  onChange={(e) => setSelectedGridSize(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={10}>10x10</option>
                  <option value={15}>15x15</option>
                  <option value={20}>20x20</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Words</label>
                <select
                  value={selectedWordCount}
                  onChange={(e) => setSelectedWordCount(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={5}>5 Words</option>
                  <option value={10}>10 Words</option>
                  <option value={15}>15 Words</option>
                  <option value={20}>20 Words</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Mode Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Solo Play</h3>
              <p className="text-gray-600 mb-4">
                Practice and improve your skills
              </p>
              <Button
                onClick={startSoloGame}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Starting..." : "Start Solo Game"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Multiplayer</h3>
              <p className="text-gray-600 mb-4">Play with friends online</p>
              <Button
                onClick={() => setCurrentView("lobby")}
                className="w-full"
              >
                Join Lobby
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setCurrentView("leaderboard")}
          >
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-bold">Leaderboard</h3>
              <p className="text-sm text-gray-600">Top players</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setCurrentView("shop")}
          >
            <CardContent className="p-4 text-center">
              <Coins className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-bold">Coin Shop</h3>
              <p className="text-sm text-gray-600">Buy coins</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-bold">Rules</h3>
              <p className="text-sm text-gray-600">How to play</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};
