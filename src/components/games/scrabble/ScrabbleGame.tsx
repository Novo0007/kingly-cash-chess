import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrabbleBoard } from "./ScrabbleBoard";
import { ScrabbleLobby } from "./ScrabbleLobby";
import { ScrabbleRules } from "./ScrabbleRules";
import { CoinShop } from "./CoinShop";
import { ScrabbleLeaderboard } from "./ScrabbleLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Users,
  Coins,
  Star,
  Brain,
  Crown,
  Timer,
  ShoppingCart,
  BookOpen,
  Home,
} from "lucide-react";
import {
  ScrabbleGameLogic,
  ScrabbleGameState,
  ScrabbleTile,
  GameMove,
  Player,
} from "./ScrabbleGameLogic";
import {
  createScrabbleGame,
  joinScrabbleGame,
  updateScrabbleGameState,
  saveScrabbleMove,
  getScrabbleGame,
  getUserCoins,
  completeScrabbleGame,
} from "@/utils/scrabbleDbHelper";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-mobile";

interface ScrabbleGameProps {
  onBack: () => void;
  user: any;
}

type GameView = "lobby" | "game" | "rules" | "shop" | "gameComplete";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

export const ScrabbleGame: React.FC<ScrabbleGameProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<GameView>("lobby");
  const [gameLogic, setGameLogic] = useState<ScrabbleGameLogic | null>(null);
  const [gameState, setGameState] = useState<ScrabbleGameState | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: Player;
    finalScores: { player: Player; score: number }[];
  } | null>(null);
  const [playerProfiles, setPlayerProfiles] = useState<
    Map<string, UserProfile>
  >(new Map());

  const timerRef = useRef<NodeJS.Timeout>();
  const gameSubscriptionRef = useRef<any>();

  // Load user coins on mount
  useEffect(() => {
    if (user?.id) {
      loadUserCoins();
    }
  }, [user?.id]);

  // Set up real-time subscription for game updates
  useEffect(() => {
    if (currentGameId && currentView === "game") {
      setupGameSubscription();
    }

    return () => {
      if (gameSubscriptionRef.current) {
        gameSubscriptionRef.current.unsubscribe();
      }
    };
  }, [currentGameId, currentView]);

  // Timer effect
  useEffect(() => {
    if (gameState?.gameStatus === "active" && gameLogic) {
      const updateTimer = () => {
        const remaining = gameLogic.getRemainingTime();
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Handle timeout
          const currentPlayer = gameLogic.getCurrentPlayer();
          if (currentPlayer?.id === user.id) {
            gameLogic.handleTimeOut();
            handleGameStateUpdate();
          }
        }
      };

      timerRef.current = setInterval(updateTimer, 1000);
      updateTimer();

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState, gameLogic, user.id]);

  const loadUserCoins = async () => {
    const result = await getUserCoins(user.id);
    if (result.success) {
      setUserCoins(result.coins);

      // Check if this is a new user (first time getting coins)
      if (result.totalEarned === 1300) {
        // 1000 base + 300 bonus
        toast.success(
          "🎉 Welcome bonus! You received 300 extra coins for being a first-time player!",
        );
      }
    }
  };

  const loadPlayerProfiles = async (playerIds: string[]) => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, full_name")
        .in("id", playerIds);

      if (error) {
        console.error("Error loading player profiles:", error);
        return;
      }

      if (profiles) {
        const profileMap = new Map<string, UserProfile>();
        profiles.forEach((profile) => {
          profileMap.set(profile.id, profile);
        });
        setPlayerProfiles(profileMap);
      }
    } catch (error) {
      console.error("Unexpected error loading player profiles:", error);
    }
  };

  const setupGameSubscription = useCallback(() => {
    if (!currentGameId) return;

    gameSubscriptionRef.current = supabase
      .channel(`scrabble_game_${currentGameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scrabble_games",
          filter: `id=eq.${currentGameId}`,
        },
        (payload) => {
          if (payload.new && payload.new.game_state) {
            const newGameState = payload.new.game_state as ScrabbleGameState;
            setGameState(newGameState);

            if (gameLogic) {
              // Update local game logic with new state
              gameLogic.getGameState = () => newGameState;
            }

            // Load player profiles if we have new players
            if (newGameState.players.length > 0) {
              const playerIds = newGameState.players.map((p) => p.id);
              loadPlayerProfiles(playerIds);

              // Notify when a new player joins (but not for the first update)
              if (
                gameState &&
                newGameState.players.length > gameState.players.length
              ) {
                const newPlayer =
                  newGameState.players[newGameState.players.length - 1];
                if (newPlayer.id !== user.id) {
                  toast.success(`🎉 ${newPlayer.username} joined the game!`);
                }
              }
            }

            // Check for game completion
            if (newGameState.gameStatus === "completed") {
              handleGameCompletion(newGameState);
            }
          }
        },
      )
      .subscribe();
  }, [currentGameId, gameLogic]);

  const handleCreateGame = async (
    gameName: string,
    maxPlayers: number,
    entryFee: number,
    isPrivate: boolean,
    isSinglePlayer: boolean = false,
  ) => {
    if (userCoins < entryFee) {
      toast.error("Insufficient coins!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createScrabbleGame(
        user.id,
        gameName,
        maxPlayers,
        entryFee,
        isPrivate,
        isSinglePlayer,
      );

      if (result.success && result.gameId) {
        // Create game logic
        const logic = new ScrabbleGameLogic(result.gameId, {
          entryCost: entryFee,
          maxPlayers,
          isPrivate,
          isSinglePlayer,
        });

        // Add current user to the game
        const username =
          user.user_metadata?.username || user.email?.split("@")[0] || "Player";
        logic.addPlayer(user.id, username, userCoins);

        setGameLogic(logic);
        const newGameState = logic.getGameState();
        setGameState(newGameState);
        setCurrentGameId(result.gameId);
        setCurrentView("game");

        // Update the game state in the database
        await updateScrabbleGameState(result.gameId, newGameState);

        // Load player profiles for all players in the game
        if (newGameState.players.length > 0) {
          const playerIds = newGameState.players.map((p) => p.id);
          await loadPlayerProfiles(playerIds);
        }

        await loadUserCoins(); // Refresh coin balance
        toast.success("Game created successfully!");
      } else {
        toast.error(result.error || "Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      // First get the game details
      const gameResult = await getScrabbleGame(gameId);
      if (!gameResult.success || !gameResult.game) {
        toast.error("Game not found");
        return;
      }

      const game = gameResult.game;

      if (userCoins < game.entry_fee) {
        toast.error("Insufficient coins!");
        return;
      }

      // Join the game
      const joinResult = await joinScrabbleGame(gameId, user.id);
      if (!joinResult.success) {
        toast.error(joinResult.error || "Failed to join game");
        return;
      }

      // Detect if this is a single player game (max_players is 2 but created as single player)
      const isSinglePlayerGame =
        game.max_players === 2 &&
        game.is_friend_challenge &&
        game.current_players === 1;

      // Create fresh game logic and add all players
      const logic = new ScrabbleGameLogic(gameId, {
        entryCost: game.entry_fee,
        maxPlayers: isSinglePlayerGame ? 1 : game.max_players,
        isPrivate: game.is_friend_challenge,
        isSinglePlayer: isSinglePlayerGame,
      });

      // Add all existing players to the game logic
      const playerIds = [
        game.player1_id,
        game.player2_id,
        game.player3_id,
        game.player4_id,
      ].filter(Boolean);

      // We need to get player info for all players
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", playerIds);

      // Add each player to the game logic
      for (const playerId of playerIds) {
        const profile = profiles?.find((p) => p.id === playerId);
        const playerUsername =
          playerId === user.id
            ? user.user_metadata?.username ||
              user.email?.split("@")[0] ||
              "Player"
            : profile?.username || "Player";

        const playerCoins = playerId === user.id ? userCoins : 1000; // Default coins for other players
        logic.addPlayer(playerId, playerUsername, playerCoins);
      }

      setGameLogic(logic);
      const newGameState = logic.getGameState();
      setGameState(newGameState);
      setCurrentGameId(gameId);
      setCurrentView("game");

      // Update the game state in the database with all players
      await updateScrabbleGameState(gameId, newGameState);

      // Load player profiles for all players in the game
      if (newGameState.players.length > 0) {
        const playerIds = newGameState.players.map((p) => p.id);
        await loadPlayerProfiles(playerIds);
      }

      await loadUserCoins(); // Refresh coin balance
      toast.success("Joined game successfully!");
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameStateUpdate = async () => {
    if (!gameLogic || !currentGameId) return;

    const newGameState = gameLogic.getGameState();
    setGameState(newGameState);

    // Update database
    await updateScrabbleGameState(currentGameId, newGameState);
  };

  const handlePlaceTiles = async (
    tiles: { tile: ScrabbleTile; position: { row: number; col: number } }[],
  ) => {
    if (!gameLogic || !gameState) return;

    const result = gameLogic.makeMove(user.id, {
      type: "place_word",
      placedTiles: tiles,
    });

    if (result.success && result.newGameState) {
      setGameState(result.newGameState);

      // Save move to database
      await saveScrabbleMove(
        currentGameId!,
        user.id,
        result.newGameState.moves.length,
        result.newGameState.moves[result.newGameState.moves.length - 1],
      );

      await updateScrabbleGameState(currentGameId!, result.newGameState);

      if (result.newGameState.gameStatus === "completed") {
        handleGameCompletion(result.newGameState);
      } else {
        toast.success(
          `Word played! +${result.newGameState.moves[result.newGameState.moves.length - 1].score} points`,
        );
      }
    } else {
      toast.error(result.error || "Invalid move");
    }
  };

  const handleExchangeTiles = async (tiles: ScrabbleTile[]) => {
    if (!gameLogic || !gameState) return;

    const result = gameLogic.makeMove(user.id, {
      type: "exchange_tiles",
      exchangedTiles: tiles,
    });

    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
      await updateScrabbleGameState(currentGameId!, result.newGameState);
      toast.success(`Exchanged ${tiles.length} tiles`);
    } else {
      toast.error(result.error || "Cannot exchange tiles");
    }
  };

  const handlePass = async () => {
    if (!gameLogic || !gameState) return;

    const result = gameLogic.makeMove(user.id, {
      type: "pass",
    });

    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
      await updateScrabbleGameState(currentGameId!, result.newGameState);
      toast.info("Turn passed");
    }
  };

  const handleGameCompletion = async (finalGameState: ScrabbleGameState) => {
    if (!finalGameState.winner) return;

    const winner = finalGameState.players.find(
      (p) => p.id === finalGameState.winner,
    )!;
    const finalScores = finalGameState.players.map((p) => ({
      player: p,
      score: p.score,
    }));

    setGameResult({ winner, finalScores });
    setCurrentView("gameComplete");

    // Complete game in database
    await completeScrabbleGame(
      currentGameId!,
      finalGameState.winner,
      finalScores.map((fs) => ({ playerId: fs.player.id, score: fs.score })),
    );

    await loadUserCoins(); // Refresh coin balance

    if (finalGameState.winner === user.id) {
      toast.success(
        `Congratulations! You won ${finalGameState.gameSettings.prizePot} coins!`,
      );
    } else {
      toast.info(`Game completed. ${winner.username} won!`);
    }
  };

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderPlayerList = () => {
    if (!gameState) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {gameState.gameSettings.isSinglePlayer
              ? "Single Player Mode"
              : `Players (${gameState.players.length}/${gameState.gameSettings.maxPlayers})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                index === gameState.currentPlayerIndex
                  ? "bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 shadow-md"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Player Avatar */}
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={playerProfiles.get(player.id)?.avatar_url || ""}
                      alt={player.username}
                    />
                    <AvatarFallback
                      className={`text-white font-bold text-sm ${
                        player.id === user.id
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : index === 0
                            ? "bg-gradient-to-br from-green-500 to-green-600"
                            : index === 1
                              ? "bg-gradient-to-br from-purple-500 to-purple-600"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                : "bg-gradient-to-br from-red-500 to-red-600"
                      }`}
                    >
                      {player.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === gameState.currentPlayerIndex && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-medium truncate ${
                        player.id === user.id
                          ? "text-blue-600"
                          : "text-gray-800"
                      }`}
                    >
                      {player.username}
                    </span>
                    {player.id === user.id && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        You
                      </Badge>
                    )}
                    {index === gameState.currentPlayerIndex && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Turn
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Position #{index + 1}</span>
                    {gameState.gameStatus === "active" && <span>•</span>}
                    {gameState.gameStatus === "active" && (
                      <span>{player.rack.length} tiles</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">
                    {player.score}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>
          ))}

          {/* Waiting for more players - only show for multiplayer games */}
          {gameState.gameStatus === "waiting" &&
            !gameState.gameSettings.isSinglePlayer &&
            gameState.players.length < gameState.gameSettings.maxPlayers && (
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    Waiting for{" "}
                    {gameState.gameSettings.maxPlayers -
                      gameState.players.length}{" "}
                    more player(s)
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    Share the game ID to invite friends
                  </p>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };

  const renderGameStats = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {gameState.gameSettings.prizePot}
            </div>
            <div className="text-xs opacity-90">Prize Pool</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userCoins}</div>
            <div className="text-xs opacity-90">Your Coins</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Timer className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs opacity-90">Time Left</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{gameState.tileBag.length}</div>
            <div className="text-xs opacity-90">Tiles Left</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (currentView === "lobby") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Coins className="h-3 w-3 mr-1" />
            {userCoins} Coins
          </Badge>
        </div>

        <Tabs defaultValue="play" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="play">Play Game</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="shop">Coin Shop</TabsTrigger>
          </TabsList>

          <TabsContent value="play">
            <ScrabbleLobby
              onCreateGame={handleCreateGame}
              onJoinGame={handleJoinGame}
              userCoins={userCoins}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <ScrabbleLeaderboard
              currentUserId={user.id}
              onRefresh={loadUserCoins}
            />
          </TabsContent>

          <TabsContent value="rules">
            <ScrabbleRules />
          </TabsContent>

          <TabsContent value="shop">
            <CoinShop
              userCoins={userCoins}
              onPurchaseComplete={loadUserCoins}
              userId={user.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (currentView === "gameComplete" && gameResult) {
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
            <div className="text-6xl mb-4">
              {gameResult.winner.id === user.id ? "🏆" : "🎉"}
            </div>
            <CardTitle className="text-3xl text-gray-800 mb-2">
              Game Complete!
            </CardTitle>
            <p className="text-gray-600">
              {gameResult.winner.id === user.id
                ? "Congratulations! You won!"
                : `${gameResult.winner.username} won the game!`}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-center">Final Scores</h3>
              {gameResult.finalScores
                .sort((a, b) => b.score - a.score)
                .map((result, index) => (
                  <div
                    key={result.player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0
                        ? "bg-yellow-100 border-2 border-yellow-300"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Crown className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        #{index + 1} {result.player.username}
                        {result.player.id === user.id && " (You)"}
                      </span>
                    </div>
                    <div className="text-xl font-bold">{result.score} pts</div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => setCurrentView("lobby")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Play Again
              </Button>

              <Button
                onClick={() => setCurrentView("lobby")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lobby
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "game" && gameState) {
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
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Scrabble Game
          </Badge>
          <Badge variant="outline">
            <Coins className="h-3 w-3 mr-1" />
            {userCoins} Coins
          </Badge>
        </div>

        {renderGameStats()}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3">
            <ScrabbleBoard
              gameState={gameState}
              currentPlayerId={user.id}
              onPlaceTiles={handlePlaceTiles}
              onExchangeTiles={handleExchangeTiles}
              onPass={handlePass}
            />
          </div>

          <div className="space-y-4">
            {renderPlayerList()}

            {gameState.gameStatus === "waiting" && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">
                    Waiting for more players...
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Need {Math.max(0, 2 - gameState.players.length)} more
                    player(s) to start
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
