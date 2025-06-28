import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Crown,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type ChessGame = Tables<"chess_games"> & {
  white_player?: Profile | null;
  black_player?: Profile | null;
};

interface GameLobbyProps {
  onJoinGame?: (gameId: string) => void;
}

export const GameLobby = ({ onJoinGame }: GameLobbyProps) => {
  const [games, setGames] = useState<ChessGame[]>([]);
  const [entryFee, setEntryFee] = useState("10");
  const [gameName, setGameName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const { isMobile, isTablet } = useDeviceType();

  useEffect(() => {
    getCurrentUser();
    fetchGames();
    fetchWallet();

    // Auto-refresh available games every 7 seconds
    const autoRefreshInterval = setInterval(() => {
      fetchGames();
    }, 7000);

    const gamesSubscription = supabase
      .channel("chess_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chess_games" },
        (payload) => {
          console.log("Game update received:", payload);
          fetchGames();
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(gamesSubscription);
    };
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const isGameExpired = (game: ChessGame) => {
    if (game.game_status === "completed" || game.game_status === "cancelled") {
      return true;
    }

    // If game is waiting for more than 15 minutes, consider it expired
    if (game.game_status === "waiting") {
      const gameAge = Date.now() - new Date(game.created_at!).getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      return gameAge > fifteenMinutes;
    }

    // If game is active but both players haven't made moves for 45 minutes, consider it expired
    if (game.game_status === "active") {
      const lastUpdate = Date.now() - new Date(game.updated_at!).getTime();
      const fortyFiveMinutes = 45 * 60 * 1000;
      return lastUpdate > fortyFiveMinutes;
    }

    return false;
  };

  const fetchGames = async () => {
    try {
      const { data: gamesData, error } = await supabase
        .from("chess_games")
        .select("*")
        .in("game_status", ["waiting", "active"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading games:", error);
        return;
      }

      // Filter out expired games
      const activeGames = (gamesData || []).filter(
        (game) => !isGameExpired(game),
      );

      const gamesWithProfiles = await Promise.all(
        activeGames.map(async (game) => {
          const gameWithPlayers: ChessGame = { ...game };

          if (game.white_player_id) {
            const { data: whitePlayer, error: whiteError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", game.white_player_id)
              .single();

            if (!whiteError) {
              gameWithPlayers.white_player = whitePlayer;
            }
          }

          if (game.black_player_id) {
            const { data: blackPlayer, error: blackError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", game.black_player_id)
              .single();

            if (!blackError) {
              gameWithPlayers.black_player = blackPlayer;
            }
          }

          return gameWithPlayers;
        }),
      );

      setGames(gamesWithProfiles);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchWallet = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setWallet(data);
  };

  const generateUniqueGameName = async () => {
    const adjectives = [
      "Epic",
      "Royal",
      "Mystic",
      "Grand",
      "Elite",
      "Swift",
      "Bold",
      "Golden",
      "Diamond",
      "Master",
    ];
    const nouns = [
      "Battle",
      "Quest",
      "Challenge",
      "Duel",
      "Match",
      "Tournament",
      "Clash",
      "Championship",
      "Arena",
      "Showdown",
    ];

    let attempts = 0;
    let uniqueName = "";

    while (attempts < 10) {
      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomNumber = Math.floor(Math.random() * 1000) + 1;

      const proposedName = `${randomAdjective} ${randomNoun} #${randomNumber}`;

      // Check if this name already exists
      const { data: existingGame } = await supabase
        .from("chess_games")
        .select("id")
        .eq("game_name", proposedName)
        .single();

      if (!existingGame) {
        uniqueName = proposedName;
        break;
      }

      attempts++;
    }

    // Fallback if we couldn't generate a unique name
    if (!uniqueName) {
      uniqueName = `Chess Game #${Date.now()}`;
    }

    return uniqueName;
  };

  const createGame = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid entry fee");
      return;
    }

    if (wallet && wallet.balance < fee) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);

    try {
      let finalGameName = gameName.trim();

      // Generate unique name if none provided or if the provided name already exists
      if (!finalGameName) {
        finalGameName = await generateUniqueGameName();
      } else {
        // Check if the provided name already exists
        const { data: existingGame } = await supabase
          .from("chess_games")
          .select("id")
          .eq("game_name", finalGameName)
          .single();

        if (existingGame) {
          toast.error(
            "Game name already exists. Please choose a different name.",
          );
          setLoading(false);
          return;
        }
      }

      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: (wallet?.balance || 0) - fee,
          locked_balance: (wallet?.locked_balance || 0) + fee,
        })
        .eq("user_id", user.id);

      if (walletError) {
        toast.error("Failed to deduct entry fee");
        setLoading(false);
        return;
      }

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "game_entry",
          amount: fee,
          status: "completed",
          description: `Entry fee for chess game: ${finalGameName} - ₹${fee}`,
        });

      if (transactionError) {
        console.error("Transaction record error:", transactionError);
      }

      const { data: gameData, error: gameError } = await supabase
        .from("chess_games")
        .insert({
          white_player_id: user.id,
          entry_fee: fee,
          prize_amount: fee * 2,
          game_name: finalGameName,
        })
        .select()
        .single();

      if (gameError) {
        toast.error("Error creating game");
        await supabase
          .from("wallets")
          .update({
            balance: wallet?.balance || 0,
            locked_balance: wallet?.locked_balance || 0,
          })
          .eq("user_id", user.id);
      } else {
        toast.success(`Game "${finalGameName}" created successfully!`);
        setEntryFee("10");
        setGameName("");
        fetchWallet();
        if (onJoinGame && gameData) {
          onJoinGame(gameData.id);
        }
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    }

    setLoading(false);
  };

  const joinGame = async (
    gameId: string,
    entryFee: number,
    gameName: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (wallet && wallet.balance < entryFee) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      // First, update the wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: (wallet?.balance || 0) - entryFee,
          locked_balance: (wallet?.locked_balance || 0) + entryFee,
        })
        .eq("user_id", user.id);

      if (walletError) {
        toast.error("Failed to deduct entry fee");
        return;
      }

      // Record the transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "game_entry",
          amount: entryFee,
          status: "completed",
          description: `Entry fee for chess game: ${gameName} - ₹${entryFee}`,
        });

      if (transactionError) {
        console.error("Transaction record error:", transactionError);
      }

      // Update game to add black player and set status to active
      const { error: gameError } = await supabase
        .from("chess_games")
        .update({
          black_player_id: user.id,
          game_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (gameError) {
        console.error("Game update error:", gameError);
        toast.error("Error joining game");
        // Rollback wallet changes
        await supabase
          .from("wallets")
          .update({
            balance: wallet?.balance || 0,
            locked_balance: wallet?.locked_balance || 0,
          })
          .eq("user_id", user.id);
      } else {
        toast.success(`Joined "${gameName}" successfully! Game is now active.`);
        fetchWallet();
        if (onJoinGame) {
          onJoinGame(gameId);
        }
      }
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
    }
  };

  const getPlayerCount = (game: ChessGame) => {
    let count = 0;
    if (game.white_player_id) count++;
    if (game.black_player_id) count++;
    return count;
  };

  const getGameStatusBadge = (game: ChessGame) => {
    const playerCount = getPlayerCount(game);

    if (game.game_status === "waiting") {
      return (
        <Badge
          variant="outline"
          className="text-yellow-400 border-yellow-400 text-xs"
        >
          Waiting ({playerCount}/2)
        </Badge>
      );
    } else if (game.game_status === "active") {
      return (
        <Badge
          variant="outline"
          className="text-green-400 border-green-400 text-xs"
        >
          Active ({playerCount}/2)
        </Badge>
      );
    }
    return null;
  };

  const isGameFull = (game: ChessGame) => {
    return getPlayerCount(game) >= 2;
  };

  const canJoinGame = (game: ChessGame) => {
    return (
      game.game_status === "waiting" &&
      !isGameFull(game) &&
      game.white_player_id !== currentUser
    );
  };

  const canEnterGame = (game: ChessGame) => {
    return (
      game.white_player_id === currentUser ||
      game.black_player_id === currentUser
    );
  };

  // Mobile-optimized styles
  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile
    ? ""
    : "transition-all duration-300 hover:scale-105";

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGames();
    await fetchWallet();
    setRefreshing(false);
    toast.success("Lobby refreshed!");
  };

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Header with Wallet Balance */}
        <Card
          className={`${cardGradient} ${animationClass} border-blue-600/30`}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                <span className="text-white font-semibold text-sm md:text-base">
                  Wallet Balance
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg md:text-xl font-bold text-blue-400">
                  ₹{wallet?.balance?.toFixed(2) || "0.00"}
                </div>
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  disabled={refreshing}
                  className="text-blue-400 hover:bg-slate-700/50 h-8 w-8 p-0"
                >
                  <RefreshCw
                    className={`h-3 w-3 md:h-4 md:w-4 ${refreshing && !isMobile ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chess Rules Quick Access */}
        <Card
          className={`${cardGradient} ${animationClass} border-indigo-600/30`}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                <span className="text-white font-semibold text-sm md:text-base">
                  New to Chess?
                </span>
              </div>
              <Button
                onClick={() => (window.location.href = "/chess-rules")}
                variant="outline"
                size="sm"
                className="text-indigo-400 border-indigo-400 hover:bg-indigo-500/10 text-xs px-3 py-1"
              >
                View Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Game */}
        <Card
          className={`${cardGradient} ${animationClass} border-green-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 font-semibold text-base md:text-lg">
              <Plus className="h-5 w-5 md:h-6 md:w-6" />
              Create New Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <label className="text-slate-300 mb-2 block text-sm">
                Game Name (Optional)
              </label>
              <Input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Leave empty for auto-generated unique name"
              />
            </div>
            <div>
              <label className="text-slate-300 mb-2 block text-sm">
                Entry Fee (₹)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Enter amount"
              />
            </div>
            <Button
              onClick={createGame}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </CardContent>
        </Card>

        {/* Available Games */}
        <Card
          className={`${cardGradient} ${animationClass} border-purple-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 flex items-center gap-2 font-semibold text-base md:text-lg">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
              Available Games
              <Badge
                variant="secondary"
                className="text-xs bg-slate-700 text-slate-300 ml-2"
              >
                Auto-refresh: 7s
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-slate-400 text-sm md:text-base">
                  No games available. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="bg-slate-700/30 border-slate-600 hover:border-purple-500/40 transition-colors"
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <Crown className="h-3 w-3 md:h-4 md:w-4 text-purple-400 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-white font-medium text-xs md:text-sm truncate">
                                {game.game_name || "Unnamed Game"}
                              </span>
                              <span className="text-slate-400 text-xs truncate">
                                Host:{" "}
                                {game.white_player?.username || "Anonymous"}
                                {game.black_player && (
                                  <> vs {game.black_player?.username}</>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className="bg-slate-700 text-slate-300 text-xs px-1 md:px-2"
                              >
                                {game.white_player?.chess_rating || 1200}
                              </Badge>
                              {getGameStatusBadge(game)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 md:gap-4 text-xs text-slate-400 flex-wrap">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-2 w-2 md:h-3 md:w-3" />
                              <span>₹{game.entry_fee}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Crown className="h-2 w-2 md:h-3 md:w-3" />
                              <span>₹{game.prize_amount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2 md:h-3 md:w-3" />
                              <span>
                                {Math.floor((game.time_control || 600) / 60)}m
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-2 w-2 md:h-3 md:w-3" />
                              <span>{getPlayerCount(game)}/2</span>
                            </div>
                          </div>
                        </div>

                        {canEnterGame(game) ? (
                          <Button
                            onClick={() => onJoinGame?.(game.id)}
                            variant="outline"
                            className="text-yellow-400 border-yellow-400 hover:bg-yellow-500/10 text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 w-full sm:w-auto"
                          >
                            Enter Game
                          </Button>
                        ) : canJoinGame(game) ? (
                          <Button
                            onClick={() =>
                              joinGame(
                                game.id,
                                game.entry_fee,
                                game.game_name || "Unnamed Game",
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 w-full sm:w-auto"
                          >
                            Join Game
                          </Button>
                        ) : isGameFull(game) ? (
                          <Button
                            onClick={() => onJoinGame?.(game.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 w-full sm:w-auto"
                          >
                            Spectate
                          </Button>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-slate-400 text-xs px-3 py-1"
                          >
                            Game Full
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
