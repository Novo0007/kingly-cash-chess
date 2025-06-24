import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Crown, Clock, Users, DollarSign } from "lucide-react";
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
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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
          className="text-yellow-500 border-yellow-500 text-xs"
        >
          Waiting ({playerCount}/2)
        </Badge>
      );
    } else if (game.game_status === "active") {
      return (
        <Badge
          variant="outline"
          className="text-green-500 border-green-500 text-xs"
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

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 px-2 sm:px-0">
      {/* Futuristic Wallet Balance */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-400/30 glow-cyan relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 animate-pulse"></div>
        <CardContent className="p-3 sm:p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
              </div>
              <span className="text-cyan-300 font-mono text-sm sm:text-base tracking-wide">
                ⚡ CREDITS
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-400 font-mono">
              ₹{wallet?.balance?.toFixed(2) || "0.00"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Futuristic Create Game */}
      <Card className="bg-slate-900/50 border-purple-400/30 glow-purple relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-cyan-400/5 animate-pulse"></div>
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 relative">
          <CardTitle className="text-cyan-300 flex items-center gap-3 text-base sm:text-xl font-mono tracking-wide">
            <div className="relative">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
            </div>
            INITIALIZE BATTLE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 relative">
          <div>
            <label className="text-xs sm:text-sm text-cyan-300 mb-2 block font-mono tracking-wider">
              ⚡ MISSION NAME (OPTIONAL)
            </label>
            <Input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="bg-slate-800/50 border-cyan-400/30 text-cyan-300 text-sm sm:text-base font-mono glow-cyan"
              placeholder="Auto-generated quantum signature..."
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm text-cyan-300 mb-2 block font-mono tracking-wider">
              💰 STAKE AMOUNT (₹)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="bg-slate-800/50 border-cyan-400/30 text-green-400 text-sm sm:text-base font-mono glow-cyan"
              placeholder="Enter credits..."
            />
          </div>
          <Button
            onClick={createGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold text-sm sm:text-base py-2 sm:py-3 font-mono tracking-wide glow-purple relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 animate-pulse"></div>
            <span className="relative">
              {loading ? "⚡ INITIALIZING..." : "🚀 DEPLOY BATTLE"}
            </span>
          </Button>
        </CardContent>
      </Card>

      {/* Futuristic Available Battles */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-xl font-bold text-cyan-300 flex items-center gap-3 px-1 sm:px-0 font-mono tracking-wide">
          <div className="relative">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
          </div>
          🌐 ACTIVE BATTLES
          <Badge
            variant="secondary"
            className="text-xs bg-green-500/20 text-green-400 ml-2 border border-green-400/30 font-mono"
          >
            ⚡ LIVE SYNC: 7s
          </Badge>
        </h2>

        {games.length === 0 ? (
          <Card className="bg-slate-900/30 border-cyan-400/20 glow-cyan">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-cyan-300 text-sm sm:text-base font-mono">
                🔍 NO ACTIVE BATTLES DETECTED
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Initialize first combat sequence above ⬆️
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {games.map((game) => (
              <Card
                key={game.id}
                className="bg-slate-900/50 border-cyan-400/30 hover:border-purple-400/60 transition-all duration-300 glow-cyan hover:glow-purple relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-3 sm:p-4 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="relative">
                          <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 flex-shrink-0 animate-pulse" />
                          <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-cyan-300 font-mono text-xs sm:text-sm truncate tracking-wide">
                            {game.game_name || "UNNAMED_MISSION"}
                          </span>
                          <span className="text-gray-400 text-xs truncate font-mono">
                            Agent: {game.white_player?.username || "UNKNOWN"}
                            {game.black_player && (
                              <> ⚔️ {game.black_player?.username}</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className="bg-slate-800 text-cyan-400 text-xs px-1 sm:px-2 border border-cyan-400/30 font-mono"
                          >
                            ⚡{game.white_player?.chess_rating || 1200}
                          </Badge>
                          {getGameStatusBadge(game)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span>₹{game.entry_fee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Crown className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span>₹{game.prize_amount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span>
                            {Math.floor((game.time_control || 600) / 60)}m
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span>{getPlayerCount(game)}/2</span>
                        </div>
                      </div>
                    </div>

                    {canEnterGame(game) ? (
                      <Button
                        onClick={() => onJoinGame?.(game.id)}
                        variant="outline"
                        className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-full sm:w-auto"
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
                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-full sm:w-auto"
                      >
                        Join Game
                      </Button>
                    ) : isGameFull(game) ? (
                      <Button
                        onClick={() => onJoinGame?.(game.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-full sm:w-auto"
                      >
                        Spectate
                      </Button>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-gray-400 text-xs px-3 py-1"
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
      </div>
    </div>
  );
};
