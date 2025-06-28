import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LudoBoard } from "./LudoBoard";
import { ChatSystem } from "../../chat/ChatSystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Dice1,
  ArrowLeft,
  Users,
  Trophy,
  Crown,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
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
  current_turn: string;
  game_state: any;
  player1?: Profile | null;
  player2?: Profile | null;
  player3?: Profile | null;
  player4?: Profile | null;
};

interface LudoGameProps {
  gameId: string;
  onBackToLobby: () => void;
}

export const LudoGame = ({ gameId, onBackToLobby }: LudoGameProps) => {
  const [game, setGame] = useState<LudoGame | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [abandonmentTimer, setAbandonmentTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [showAbandonmentWarning, setShowAbandonmentWarning] = useState(false);
  const [abandonmentCountdown, setAbandonmentCountdown] = useState(10);
  const [presenceTracked, setPresenceTracked] = useState(false);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    getCurrentUser();
    fetchGame();

    // Auto-refresh game state
    const autoRefreshInterval = setInterval(() => {
      if (!loading) {
        fetchGame();
      }
    }, 3000);

    // Subscribe to real-time game changes
    const gameSubscription = supabase
      .channel(`ludo_game_${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ludo_games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log("Real-time ludo game update:", payload);
          if (payload.new) {
            fetchGame();
          }
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(gameSubscription);
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer);
      }
    };
  }, [gameId, loading]);

  useEffect(() => {
    if (!currentUser || !game) return;

    const isPlayer = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ].includes(currentUser);

    if (!isPlayer || game.game_status !== "active") return;

    // Track user presence for abandonment detection
    const presenceChannel = supabase
      .channel(`ludo_presence_${gameId}`)
      .on("presence", { event: "sync" }, () => {
        console.log("Ludo presence synced");
        if (abandonmentTimer) {
          clearTimeout(abandonmentTimer);
          setAbandonmentTimer(null);
          setShowAbandonmentWarning(false);
          toast.success("Player reconnected!");
        }
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Ludo user joined:", key, newPresences);
        if (abandonmentTimer) {
          clearTimeout(abandonmentTimer);
          setAbandonmentTimer(null);
          setShowAbandonmentWarning(false);
          toast.success("Player reconnected!");
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Ludo user left:", key, leftPresences);

        const leftUser = leftPresences[0];
        if (
          leftUser &&
          [
            game.player1_id,
            game.player2_id,
            game.player3_id,
            game.player4_id,
          ].includes(leftUser.user_id)
        ) {
          startAbandonmentTimer(leftUser.user_id);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUser && !presenceTracked) {
          await presenceChannel.track({
            user_id: currentUser,
            online_at: new Date().toISOString(),
            last_seen: Date.now(),
          });
          setPresenceTracked(true);
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
      setPresenceTracked(false);
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer);
        setAbandonmentTimer(null);
        setShowAbandonmentWarning(false);
      }
    };
  }, [currentUser, game?.id, game?.game_status]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const startAbandonmentTimer = (leftUserId: string) => {
    if (!game || game.game_status !== "active") return;
    if (leftUserId === currentUser) return;

    console.log("Starting ludo abandonment timer for user:", leftUserId);
    setShowAbandonmentWarning(true);
    setAbandonmentCountdown(10);

    const countdownInterval = setInterval(() => {
      setAbandonmentCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(async () => {
      clearInterval(countdownInterval);
      setShowAbandonmentWarning(false);
      await handlePlayerAbandonment(leftUserId);
    }, 10000);

    setAbandonmentTimer(timer);
  };

  const handlePlayerAbandonment = async (abandonedUserId: string) => {
    if (!game || !currentUser) return;

    console.log("Ludo player abandoned:", abandonedUserId);

    // For Ludo, we can continue with remaining players or end the game
    // For simplicity, let's end the game and distribute prizes among remaining players
    const remainingPlayers = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ].filter((id) => id && id !== abandonedUserId);

    if (remainingPlayers.length === 1) {
      // Only one player left, they win
      await completeGame(remainingPlayers[0], "abandoned");
    } else {
      // Multiple players remaining, continue game or distribute equally
      toast.info("Player left the game. Continuing with remaining players...");
    }
  };

  const fetchGame = async () => {
    try {
      const { data: gameData, error } = await supabase
        .from("ludo_games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) {
        console.error("Error fetching ludo game:", error);
        toast.error("Error loading game");
        return;
      }

      // Fetch player profiles
      const gameWithPlayers: LudoGame = { ...gameData };
      const playerIds = [
        gameData.player1_id,
        gameData.player2_id,
        gameData.player3_id,
        gameData.player4_id,
      ].filter(Boolean);

      if (playerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", playerIds);

        if (profiles) {
          gameWithPlayers.player1 =
            profiles.find((p) => p.id === gameData.player1_id) || null;
          gameWithPlayers.player2 =
            profiles.find((p) => p.id === gameData.player2_id) || null;
          gameWithPlayers.player3 =
            profiles.find((p) => p.id === gameData.player3_id) || null;
          gameWithPlayers.player4 =
            profiles.find((p) => p.id === gameData.player4_id) || null;
        }
      }

      setGame(gameWithPlayers);

      // Check for game end
      if (gameWithPlayers.game_status === "completed" && !showGameEndDialog) {
        let message = "";
        if (gameWithPlayers.winner_id === currentUser) {
          message = "Congratulations! You won! 🎉";
        } else {
          message = "Game over. Better luck next time!";
        }
        setGameEndMessage(message);
        setShowGameEndDialog(true);
      }

      // Auto-start game if enough players
      if (
        gameWithPlayers.game_status === "waiting" &&
        gameWithPlayers.current_players >= 2 // Minimum 2 players to start
      ) {
        console.log(
          "Starting ludo game with",
          gameWithPlayers.current_players,
          "players",
        );
        await supabase
          .from("ludo_games")
          .update({
            game_status: "active",
            game_state: initializeGameState(gameWithPlayers.current_players),
            current_turn: "red", // Red starts first
            updated_at: new Date().toISOString(),
          })
          .eq("id", gameId);
      }
    } catch (error) {
      console.error("Error fetching ludo game:", error);
      toast.error("Error loading game");
    } finally {
      setLoading(false);
    }
  };

  const initializeGameState = (playerCount: number) => {
    const colors = ["red", "blue", "green", "yellow"].slice(0, playerCount);
    const pieces: any = {};

    colors.forEach((color) => {
      pieces[color] = Array(4)
        .fill(null)
        .map((_, index) => ({
          id: index,
          position: "home",
          row: null,
          col: null,
        }));
    });

    return {
      pieces,
      currentPlayer: "red",
      diceValue: null,
      gamePhase: "rolling", // rolling, moving, ended
    };
  };

  const completeGame = async (winnerId: string | null, gameResult: string) => {
    if (!game) return;

    try {
      // Update game status
      const { error: gameError } = await supabase
        .from("ludo_games")
        .update({
          game_status: "completed",
          winner_id: winnerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (gameError) {
        console.error("Error updating ludo game:", gameError);
        return;
      }

      // Process winnings similar to chess
      if (winnerId) {
        // Update winner's stats and wallet
        const { data: winnerProfile } = await supabase
          .from("profiles")
          .select("games_played, games_won, total_earnings")
          .eq("id", winnerId)
          .single();

        if (winnerProfile) {
          await supabase
            .from("profiles")
            .update({
              games_played: (winnerProfile.games_played || 0) + 1,
              games_won: (winnerProfile.games_won || 0) + 1,
              total_earnings:
                (winnerProfile.total_earnings || 0) + game.prize_amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", winnerId);
        }

        // Add winnings to wallet
        const { data: winnerWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", winnerId)
          .single();

        if (winnerWallet) {
          await supabase
            .from("wallets")
            .update({
              balance: (winnerWallet.balance || 0) + game.prize_amount,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", winnerId);
        }

        // Create winning transaction
        await supabase.from("transactions").insert({
          user_id: winnerId,
          transaction_type: "game_winning",
          amount: game.prize_amount,
          status: "completed",
          description: `Won Ludo game: ${game.game_name || "Ludo Game"}`,
        });
      }

      console.log("Ludo game completion processing finished");
    } catch (error) {
      console.error("Error processing ludo game completion:", error);
    }
  };

  const handleMove = async (
    playerId: string,
    pieceId: number,
    steps: number,
  ) => {
    if (!game || !currentUser) return;

    // Validate turn
    if (game.current_turn !== getPlayerColor()) {
      toast.error("Not your turn!");
      return;
    }

    try {
      // Process the move (simplified for demo)
      const newGameState = { ...game.game_state };

      // Update piece position (simplified logic)
      const piece = newGameState.pieces[playerId][pieceId];
      // Add actual Ludo movement logic here

      // Determine next player
      const colors = ["red", "blue", "green", "yellow"];
      const currentIndex = colors.indexOf(game.current_turn);
      const nextPlayer = colors[(currentIndex + 1) % colors.length];

      // Update game in database
      const { error } = await supabase
        .from("ludo_games")
        .update({
          game_state: newGameState,
          current_turn: nextPlayer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (error) {
        toast.error("Failed to make move");
        console.error("Ludo move error:", error);
      }
    } catch (error) {
      console.error("Error making ludo move:", error);
      toast.error("Failed to make move");
    }
  };

  const getPlayerColor = (): "red" | "blue" | "green" | "yellow" => {
    if (!game || !currentUser) return "red";

    if (currentUser === game.player1_id) return "red";
    if (currentUser === game.player2_id) return "blue";
    if (currentUser === game.player3_id) return "green";
    if (currentUser === game.player4_id) return "yellow";

    return "red";
  };

  const isPlayerTurn = () => {
    if (!game || !currentUser) return false;
    return game.current_turn === getPlayerColor();
  };

  const isSpectator = () => {
    if (!game || !currentUser) return true;
    return ![
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ].includes(currentUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 px-6 py-3 rounded-lg shadow-lg border-2 border-blue-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Loading Ludo Game...
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center pb-20">
        <h2 className="text-2xl font-bold mb-4 text-white">Game Not Found</h2>
        <Button
          onClick={onBackToLobby}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold text-lg px-6 py-3 rounded-lg border-2 border-blue-400"
        >
          Back to Lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 px-1 sm:px-2">
      {/* Abandonment Warning Dialog */}
      <Dialog open={showAbandonmentWarning} onOpenChange={() => {}}>
        <DialogContent className="text-center w-[95vw] max-w-sm mx-auto bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-400 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl text-white font-bold">
              <Clock className="h-6 w-6 text-orange-400" />
              Player Disconnected!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-orange-200 font-medium">
              A player has left the game.
              <br />
              <span className="text-2xl font-bold text-orange-400">
                {abandonmentCountdown}
              </span>
              <br />
              seconds until they forfeit...
            </div>
            <div className="w-full bg-orange-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(abandonmentCountdown / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game End Dialog */}
      <Dialog open={showGameEndDialog} onOpenChange={setShowGameEndDialog}>
        <DialogContent className="text-center w-[95vw] max-w-sm mx-auto bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-400 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl text-white font-bold">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Game Over!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-lg font-bold p-3 rounded-lg border-2 text-blue-200 bg-blue-900/30 border-blue-400">
              {gameEndMessage}
            </div>
            <Button
              onClick={() => {
                setShowGameEndDialog(false);
                onBackToLobby();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold border-2 border-blue-400"
            >
              Return to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-purple-900 p-3 rounded-lg shadow-lg border-2 border-blue-400">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          className="text-white hover:bg-blue-800/50 font-bold border-2 border-blue-400 hover:border-purple-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold border-2 border-blue-400">
            {game.game_status}
          </Badge>
          <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-black font-bold border-2 border-white">
            <Users className="h-3 w-3 mr-1" />
            {game.current_players}/4
          </Badge>
          {isMobile && (
            <Button
              onClick={() => setShowMobileChat(!showMobileChat)}
              variant="ghost"
              size="sm"
              className="p-1 text-white border-2 border-blue-400 hover:border-purple-400 hover:bg-blue-800/50"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Chat */}
      {isMobile && showMobileChat && (
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg shadow-lg border-2 border-blue-400 p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-white">Game Chat</h3>
            <Button
              onClick={() => setShowMobileChat(false)}
              variant="ghost"
              size="sm"
              className="p-1 text-xs text-white hover:bg-blue-800/50"
            >
              Close
            </Button>
          </div>
          <div className="h-40">
            <ChatSystem gameId={gameId} />
          </div>
        </div>
      )}

      {/* Game Info */}
      <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-400 shadow-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Dice1 className="h-5 w-5 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {game.game_name || "Ludo Game"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Players */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { player: game.player1, color: "red", name: "Red" },
              { player: game.player2, color: "blue", name: "Blue" },
              { player: game.player3, color: "green", name: "Green" },
              { player: game.player4, color: "yellow", name: "Yellow" },
            ].map((slot, index) => (
              <div
                key={index}
                className={`p-2 rounded border-2 text-center transition-all ${
                  slot.player
                    ? `bg-${slot.color}-500 border-white`
                    : "bg-gray-600 border-gray-400"
                } ${
                  game.current_turn === slot.color
                    ? "ring-2 ring-yellow-400"
                    : ""
                }`}
              >
                <p className="text-xs text-white font-medium">{slot.name}</p>
                <p className="text-xs font-bold text-white truncate">
                  {slot.player?.username || "Empty"}
                </p>
              </div>
            ))}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-800/30 p-2 rounded border border-blue-400 text-center">
              <p className="text-blue-300 font-medium">Entry Fee</p>
              <p className="font-bold text-blue-200">₹{game.entry_fee}</p>
            </div>
            <div className="bg-yellow-800/30 p-2 rounded border border-yellow-400 text-center">
              <p className="text-yellow-300 font-medium">Prize Pool</p>
              <p className="font-bold text-yellow-200">₹{game.prize_amount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ludo Board */}
      {game.game_status === "active" && game.game_state && (
        <LudoBoard
          gameState={game.game_state}
          onMove={handleMove}
          playerColor={getPlayerColor()}
          currentPlayer={game.current_turn}
          isPlayerTurn={isPlayerTurn()}
          disabled={isSpectator()}
        />
      )}

      {/* Desktop Chat */}
      {!isMobile && !isSpectator() && (
        <div className="max-w-md mx-auto">
          <ChatSystem gameId={gameId} />
        </div>
      )}

      {/* Game Status Messages */}
      {game.game_status === "waiting" && (
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-800/30 border-2 border-yellow-400">
          <CardContent className="p-3 text-center">
            <p className="text-yellow-200 font-bold text-sm">
              Waiting for players... ({game.current_players}/4)
            </p>
            <p className="text-yellow-300 text-xs mt-1">
              Game starts with minimum 2 players
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
