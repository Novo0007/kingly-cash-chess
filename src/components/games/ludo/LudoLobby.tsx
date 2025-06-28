import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Dice1,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  BookOpen,
  Crown,
  Trophy,
  Star,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type LudoGame = {
  id: string;
  game_name: string | null;
  game_status: string;
  entry_fee: number;
  prize_amount: number;
  current_players: number;
  max_players: number;
  created_at: string;
  updated_at: string;
  creator_id: string;
  player1_id: string;
  player2_id: string | null;
  player3_id: string | null;
  player4_id: string | null;
  winner_id: string | null;
  is_friend_challenge: boolean | null;
  player1?: Profile | null;
  player2?: Profile | null;
  player3?: Profile | null;
  player4?: Profile | null;
  creator?: Profile | null;
};

interface LudoLobbyProps {
  onJoinGame?: (gameId: string) => void;
  onBackToGameSelection?: () => void;
}

export const LudoLobby = ({
  onJoinGame,
  onBackToGameSelection,
}: LudoLobbyProps) => {
  const [games, setGames] = useState<LudoGame[]>([]);
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

    // Subscribe to real-time game changes
    const gameSubscription = supabase
      .channel("ludo-lobby")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ludo_games",
        },
        (payload) => {
          console.log("Real-time lobby update:", payload);
          fetchGames();
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(gameSubscription);
    };
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
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

  const fetchGames = async () => {
    try {
      const { data: gameData, error } = await supabase
        .from("ludo_games")
        .select("*")
        .in("game_status", ["waiting", "active"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ludo games:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // Handle table not found error gracefully
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "Ludo games table does not exist yet. This is expected in development.",
          );
          setGames([]);
          return;
        }

        toast.error(`Failed to load games: ${error.message}`);
        return;
      }

      // Fetch player profiles for each game
      const gamesWithPlayers = await Promise.all(
        (gameData || []).map(async (game) => {
          const gameWithPlayers: LudoGame = { ...game };

          // Fetch profiles for all players
          const playerIds = [
            game.player1_id,
            game.player2_id,
            game.player3_id,
            game.player4_id,
          ].filter(Boolean);

          if (playerIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("*")
              .in("id", playerIds);

            if (profiles) {
              gameWithPlayers.player1 =
                profiles.find((p) => p.id === game.player1_id) || null;
              gameWithPlayers.player2 =
                profiles.find((p) => p.id === game.player2_id) || null;
              gameWithPlayers.player3 =
                profiles.find((p) => p.id === game.player3_id) || null;
              gameWithPlayers.player4 =
                profiles.find((p) => p.id === game.player4_id) || null;
            }
          }

          return gameWithPlayers;
        }),
      );

      setGames(gamesWithPlayers);
    } catch (error) {
      console.error("Error in fetchGames:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
      });
      toast.error("Failed to load games. Please try again.");
    }
  };

  const createGame = async () => {
    if (!currentUser || !wallet) {
      toast.error("Please ensure you're logged in and have a wallet");
      return;
    }

    const fee = parseInt(entryFee);
    if (fee < 5) {
      toast.error("Minimum entry fee is ₹5");
      return;
    }

    if (wallet.balance < fee) {
      toast.error("Insufficient balance");
      return;
    }

    if (!gameName.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    setLoading(true);

    try {
      // Deduct entry fee from wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: wallet.balance - fee,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", currentUser);

      if (walletError) {
        toast.error("Failed to deduct entry fee");
        return;
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: currentUser,
        transaction_type: "game_entry",
        amount: -fee,
        status: "completed",
        description: `Entry fee for Ludo game: ${gameName}`,
      });

      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from("ludo_games")
        .insert({
          game_name: gameName,
          entry_fee: fee,
          prize_amount: fee * 4 * 0.9, // 90% of total entry fees as prize
          creator_id: currentUser,
          player1_id: currentUser,
          current_players: 1,
          max_players: 4,
          game_status: "waiting",
        })
        .select()
        .single();

      if (gameError) {
        console.error("Game creation error:", gameError);

        // Handle table not found error
        if (
          gameError.code === "42P01" ||
          gameError.message?.includes("does not exist")
        ) {
          toast.error(
            "Ludo games are not available yet. Database setup in progress.",
          );
        } else {
          toast.error(`Failed to create game: ${gameError.message}`);
        }
        return;
      }

      toast.success("Game created successfully!");
      setGameName("");
      setEntryFee("10");
      fetchWallet();
      fetchGames();

      // Auto-join the created game
      if (gameData && onJoinGame) {
        onJoinGame(gameData.id);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (game: LudoGame) => {
    if (!currentUser || !wallet) {
      toast.error("Please ensure you're logged in and have a wallet");
      return;
    }

    if (wallet.balance < game.entry_fee) {
      toast.error("Insufficient balance to join this game");
      return;
    }

    // Check if already in game
    const playerIds = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ];
    if (playerIds.includes(currentUser)) {
      // Player is already in the game, just join
      if (onJoinGame) {
        onJoinGame(game.id);
      }
      return;
    }

    if (game.current_players >= game.max_players) {
      toast.error("Game is full");
      return;
    }

    try {
      // Deduct entry fee
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: wallet.balance - game.entry_fee,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", currentUser);

      if (walletError) {
        toast.error("Failed to deduct entry fee");
        return;
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: currentUser,
        transaction_type: "game_entry",
        amount: -game.entry_fee,
        status: "completed",
        description: `Entry fee for joining Ludo game: ${game.game_name}`,
      });

      // Determine which player slot to fill
      let updateData: any = {
        current_players: game.current_players + 1,
        updated_at: new Date().toISOString(),
      };

      if (!game.player2_id) updateData.player2_id = currentUser;
      else if (!game.player3_id) updateData.player3_id = currentUser;
      else if (!game.player4_id) updateData.player4_id = currentUser;

      // Update prize amount
      updateData.prize_amount =
        game.entry_fee * (game.current_players + 1) * 0.9;

      // Update game
      const { error: gameError } = await supabase
        .from("ludo_games")
        .update(updateData)
        .eq("id", game.id);

      if (gameError) {
        toast.error("Failed to join game");
        console.error("Join game error:", gameError);
        return;
      }

      toast.success("Joined game successfully!");
      fetchWallet();
      fetchGames();

      if (onJoinGame) {
        onJoinGame(game.id);
      }
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
    }
  };

  const refreshGames = async () => {
    setRefreshing(true);
    await fetchGames();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <MobileContainer>
      <div className="space-y-4 pb-20 px-1 sm:px-2">
        {/* Header */}
        <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-400 shadow-2xl">
          <CardHeader className="text-center pb-3">
            <CardTitle className="flex items-center justify-center gap-3 text-white text-2xl font-bold">
              <Dice1 className="h-8 w-8 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ludo Arena
              </span>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </CardTitle>
            <p className="text-blue-200 text-sm">
              Classic board game with real money prizes!
            </p>
          </CardHeader>
        </Card>

        {/* Wallet & Actions */}
        <Card className="bg-gradient-to-br from-black to-blue-900 border-2 border-blue-400 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="text-white font-bold">
                  Balance: ₹{wallet?.balance || 0}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={refreshGames}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  className="text-blue-400 border-blue-400 hover:bg-blue-500/10"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  onClick={() => (window.location.href = "/ludo-rules")}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400 hover:bg-blue-500/10"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Game */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Game name (e.g., Quick Match)"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="border-blue-400 bg-blue-900/20 text-white placeholder-blue-300"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Entry fee (₹)"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                min="5"
                className="border-blue-400 bg-blue-900/20 text-white placeholder-blue-300"
              />
              <Button
                onClick={createGame}
                disabled={loading || !gameName.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold border-2 border-blue-400"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
            <p className="text-xs text-blue-300">
              Prize Pool: ₹{Math.round(parseInt(entryFee || "0") * 4 * 0.9)} (4
              players)
            </p>
          </CardContent>
        </Card>

        {/* Available Games */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Available Games ({games.length})
            </h3>
          </div>

          {games.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600">
              <CardContent className="p-6 text-center">
                <Dice1 className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No games available</p>
                <p className="text-gray-500 text-sm">
                  Create a new game to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            games.map((game) => (
              <Card
                key={game.id}
                className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-400/50 hover:border-blue-400 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Game Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          {game.game_name}
                        </h4>
                        <p className="text-blue-300 text-sm">
                          by {game.player1?.username || "Unknown"}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          game.game_status === "waiting"
                            ? "bg-yellow-500 text-black"
                            : "bg-green-500 text-white"
                        } font-bold border-2 border-white`}
                      >
                        {game.game_status}
                      </Badge>
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { player: game.player1, color: "bg-red-500" },
                        { player: game.player2, color: "bg-blue-500" },
                        { player: game.player3, color: "bg-green-500" },
                        { player: game.player4, color: "bg-yellow-500" },
                      ].map((slot, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border-2 text-center ${
                            slot.player
                              ? `${slot.color} border-white`
                              : "bg-gray-600 border-gray-400"
                          }`}
                        >
                          <p className="text-xs font-bold text-white truncate">
                            {slot.player?.username || "Empty"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-blue-800/30 p-2 rounded border border-blue-400">
                        <p className="text-blue-300 text-xs">Entry Fee</p>
                        <p className="text-white font-bold">
                          ₹{game.entry_fee}
                        </p>
                      </div>
                      <div className="bg-yellow-800/30 p-2 rounded border border-yellow-400">
                        <p className="text-yellow-300 text-xs">Prize Pool</p>
                        <p className="text-white font-bold">
                          ₹{game.prize_amount}
                        </p>
                      </div>
                      <div className="bg-purple-800/30 p-2 rounded border border-purple-400">
                        <p className="text-purple-300 text-xs">Players</p>
                        <p className="text-white font-bold">
                          {game.current_players}/{game.max_players}
                        </p>
                      </div>
                    </div>

                    {/* Join Button */}
                    <Button
                      onClick={() => joinGame(game)}
                      disabled={game.current_players >= game.max_players}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold py-3 border-2 border-blue-400"
                    >
                      {game.current_players >= game.max_players
                        ? "Game Full"
                        : [
                              game.player1_id,
                              game.player2_id,
                              game.player3_id,
                              game.player4_id,
                            ].includes(currentUser)
                          ? "Rejoin Game"
                          : "Join Game"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Back Button */}
        {onBackToGameSelection && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={onBackToGameSelection}
              variant="outline"
              className="text-blue-400 border-blue-400 hover:bg-blue-500/10"
            >
              ← Back to Game Selection
            </Button>
          </div>
        )}
      </div>
    </MobileContainer>
  );
};
