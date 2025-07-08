import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Users,
  Clock,
  Coins,
  Play,
  RefreshCw,
  Trophy,
  Target,
  Settings,
} from "lucide-react";
import {
  getAvailableWordSearchGames,
  createWordSearchGame,
  joinWordSearchGame,
  getUserCoinBalance,
  WordSearchGameRecord,
} from "@/utils/wordsearchDbHelper";
import { WordSearchGameLogic } from "./WordSearchGameLogic";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { User } from "@supabase/supabase-js";

interface WordSearchLobbyProps {
  onJoinGame: (gameId: string) => void;
  onBack: () => void;
  user: User;
  coinBalance: number;
}

export const WordSearchLobby: React.FC<WordSearchLobbyProps> = ({
  onJoinGame,
  onBack,
  user,
  coinBalance,
}) => {
  const { isMobile } = useDeviceType();
  const [availableGames, setAvailableGames] = useState<WordSearchGameRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create game form state
  const [gameName, setGameName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [entryFee, setEntryFee] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [gridSize, setGridSize] = useState(15);
  const [wordCount, setWordCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(300);
  const [creating, setCreating] = useState(false);

  const fetchAvailableGames = useCallback(async () => {
    try {
      const result = await getAvailableWordSearchGames();
      if (result.success && result.games) {
        setAvailableGames(result.games);
      } else {
        console.error("Failed to fetch games:", result.error);
        toast.error("Failed to load games");
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableGames();

    // Set up real-time subscription for lobby updates
    const channel = supabase
      .channel("wordsearch_lobby")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_search_games",
        },
        () => {
          fetchAvailableGames();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAvailableGames]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAvailableGames();
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    if (coinBalance < entryFee) {
      toast.error("Insufficient coins to create this game");
      return;
    }

    setCreating(true);
    try {
      // Create game logic instance
      const gameLogic = new WordSearchGameLogic(
        difficulty,
        gridSize,
        wordCount,
        true, // multiplayer
        entryFee,
      );

      const gameState = gameLogic.getGameState();

      const result = await createWordSearchGame(
        user.id,
        gameName.trim(),
        gameState,
        maxPlayers,
        entryFee,
        difficulty,
        gridSize,
        wordCount,
        timeLimit,
      );

      if (result.success && result.gameId) {
        toast.success("Game created successfully!");
        setShowCreateForm(false);
        setGameName("");
        onJoinGame(result.gameId);
      } else {
        toast.error(result.error || "Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGame = async (game: WordSearchGameRecord) => {
    if (coinBalance < game.entry_fee) {
      toast.error("Insufficient coins to join this game");
      return;
    }

    try {
      const result = await joinWordSearchGame(game.id, user.id);
      if (result.success) {
        toast.success("Joined game successfully!");
        onJoinGame(game.id);
      } else {
        toast.error(result.error || "Failed to join game");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
    }
  };

  const getPlayerText = (game: WordSearchGameRecord) => {
    const playerIds = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ].filter(Boolean);

    return `${playerIds.length}/${game.max_players} players`;
  };

  const canJoinGame = (game: WordSearchGameRecord) => {
    return (
      game.game_status === "waiting" &&
      game.current_players < game.max_players &&
      coinBalance >= game.entry_fee &&
      ![
        game.player1_id,
        game.player2_id,
        game.player3_id,
        game.player4_id,
      ].includes(user.id)
    );
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading games...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

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

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">{coinBalance}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-white hover:bg-white/20"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-2xl mb-2">Word Search Lobby</CardTitle>
              <p className="text-purple-100">
                Join or create multiplayer games
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Create Game Button */}
        {!showCreateForm && (
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Create New Game
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Game Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create New Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Game Name
                </label>
                <Input
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Enter game name..."
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Players
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Entry Fee
                  </label>
                  <select
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value={5}>5 Coins</option>
                    <option value={10}>10 Coins</option>
                    <option value={20}>20 Coins</option>
                    <option value={50}>50 Coins</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "easy" | "medium" | "hard",
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Grid Size
                  </label>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value={10}>10x10</option>
                    <option value={15}>15x15</option>
                    <option value={20}>20x20</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Words
                  </label>
                  <select
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Limit
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={900}>15 minutes</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateGame}
                  disabled={creating || coinBalance < entryFee}
                  className="flex-1"
                >
                  {creating ? "Creating..." : `Create Game (${entryFee} coins)`}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>

              {coinBalance < entryFee && (
                <p className="text-sm text-red-600 text-center">
                  Insufficient coins. You need {entryFee} coins to create this
                  game.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Games ({availableGames.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableGames.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Games Available
                </h3>
                <p className="text-gray-600">
                  Be the first to create a multiplayer Word Search game!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableGames.map((game) => (
                  <Card key={game.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">
                              {game.game_name}
                            </h3>
                            <Badge
                              className={getDifficultyColor(game.difficulty)}
                            >
                              {game.difficulty}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {getPlayerText(game)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {game.entry_fee} coins
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(game.time_limit)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {game.prize_pool} prize
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            Grid: {game.grid_size}x{game.grid_size} • Words:{" "}
                            {game.word_count}
                          </div>
                        </div>

                        <div className="ml-4">
                          {canJoinGame(game) ? (
                            <Button
                              onClick={() => handleJoinGame(game)}
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" />
                              Join
                            </Button>
                          ) : (
                            <Badge variant="secondary">
                              {game.current_players >= game.max_players
                                ? "Full"
                                : coinBalance < game.entry_fee
                                  ? "Need coins"
                                  : "Unavailable"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How Multiplayer Works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• All players see the same word grid</li>
                  <li>• First to find a word gets the points</li>
                  <li>• Entry fees create the prize pool</li>
                  <li>• Winners split the prize based on ranking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
