import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChessBoard } from "./ChessBoard";
import { ChatSystem } from "../chat/ChatSystem";
import { MobileGameReactions } from "./MobileGameReactions";
import { GameReactions } from "./GameReactions";
import { TimeControl } from "./TimeControl";
import { DisconnectionTracker } from "./DisconnectionTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Crown,
  Clock,
  ArrowLeft,
  Users,
  Lock,
  Trophy,
  Handshake,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { Chess } from "chess.js";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type ChessGame = Tables<"chess_games"> & {
  white_player?: Profile | null;
  black_player?: Profile | null;
};

interface GamePageProps {
  gameId: string;
  onBackToLobby: () => void;
}

export const GamePage = ({ gameId, onBackToLobby }: GamePageProps) => {
  const [game, setGame] = useState<ChessGame | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamePassword, setGamePassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [gameEndType, setGameEndType] = useState<"win" | "draw" | "disconnect">("win");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    getCurrentUser();
    fetchGame();

    // Faster refresh intervals for better responsiveness
    const refreshInterval = isMobile ? 3000 : 2000; // Much faster refresh
    const autoRefreshInterval = setInterval(() => {
      if (!loading && !isUpdating) {
        fetchGame();
      }
    }, refreshInterval);

    const gameSubscription = supabase
      .channel(`game_${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chess_games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log("Real-time game update received:", payload);
          if (payload.new) {
            // Immediate update for real-time changes
            fetchGame();
          }
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(gameSubscription);
    };
  }, [gameId, loading, isUpdating, isMobile]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const handleTimeUp = async (player: 'white' | 'black') => {
    if (!game || game.game_status !== 'active') return;

    const winnerId = player === 'white' ? game.black_player_id : game.white_player_id;
    const loserId = player === 'white' ? game.white_player_id : game.black_player_id;

    await completeGame(winnerId, loserId, player === 'white' ? 'black_wins' : 'white_wins');

    setGameEndType("win");
    setGameEndMessage(`${player === 'white' ? 'White' : 'Black'} ran out of time! ${player === 'white' ? 'Black' : 'White'} wins!`);
    setShowGameEndDialog(true);
    toast.success(`${player === 'white' ? 'Black' : 'White'} wins on time!`);
  };

  const handlePlayerDisconnected = async (playerId: string) => {
    if (!game || game.game_status !== 'active') return;

    const winnerId = playerId === game.white_player_id ? game.black_player_id : game.white_player_id;
    
    await completeGame(winnerId, playerId, 'abandoned');

    setGameEndType("disconnect");
    setGameEndMessage(playerId === currentUser ? "You forfeited the game!" : "Opponent forfeited! You win!");
    setShowGameEndDialog(true);
    toast.success("Game won by forfeit!");
  };

  const completeGame = async (
    winnerId: string | null,
    loserId: string | null,
    gameResult: "white_wins" | "black_wins" | "draw" | "abandoned",
  ) => {
    if (!game) return;

    try {
      const { error: gameError } = await supabase
        .from("chess_games")
        .update({
          game_status: "completed" as any,
          winner_id: winnerId,
          game_result: gameResult as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (gameError) {
        console.error("Error updating game:", gameError);
        return;
      }

      // Update player statistics and process winnings
      const promises = [];

      // Update winner's stats and add winnings
      if (winnerId) {
        // Get current winner stats
        const { data: winnerProfile } = await supabase
          .from("profiles")
          .select("games_played, games_won, total_earnings")
          .eq("id", winnerId)
          .single();

        if (winnerProfile) {
          // Update winner's profile
          promises.push(
            supabase
              .from("profiles")
              .update({
                games_played: (winnerProfile.games_played || 0) + 1,
                games_won: (winnerProfile.games_won || 0) + 1,
                total_earnings:
                  (winnerProfile.total_earnings || 0) + game.prize_amount,
                updated_at: new Date().toISOString(),
              })
              .eq("id", winnerId),
          );
        }

        // Get current wallet balance
        const { data: winnerWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", winnerId)
          .single();

        if (winnerWallet) {
          // Add winnings to wallet
          promises.push(
            supabase
              .from("wallets")
              .update({
                balance: (winnerWallet.balance || 0) + game.prize_amount,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", winnerId),
          );
        }

        // Create winning transaction
        promises.push(
          supabase.from("transactions").insert({
            user_id: winnerId,
            transaction_type: "game_winning",
            amount: game.prize_amount,
            status: "completed",
            description: `Won game: ${game.game_name || "Chess Game"}`,
          }),
        );
      }

      // Update loser's stats (only games played)
      if (loserId) {
        const { data: loserProfile } = await supabase
          .from("profiles")
          .select("games_played")
          .eq("id", loserId)
          .single();

        if (loserProfile) {
          promises.push(
            supabase
              .from("profiles")
              .update({
                games_played: (loserProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("id", loserId),
          );
        }
      }

      // If it's a draw, update both players' stats
      if (
        gameResult === "draw" &&
        game.white_player_id &&
        game.black_player_id
      ) {
        // Get both players' current stats
        const { data: whiteProfile } = await supabase
          .from("profiles")
          .select("games_played")
          .eq("id", game.white_player_id)
          .single();

        const { data: blackProfile } = await supabase
          .from("profiles")
          .select("games_played")
          .eq("id", game.black_player_id)
          .single();

        // Update both players' games played
        if (whiteProfile) {
          promises.push(
            supabase
              .from("profiles")
              .update({
                games_played: (whiteProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("id", game.white_player_id),
          );
        }

        if (blackProfile) {
          promises.push(
            supabase
              .from("profiles")
              .update({
                games_played: (blackProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("id", game.black_player_id),
          );
        }

        // Get both players' wallet balances
        const { data: whiteWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", game.white_player_id)
          .single();

        const { data: blackWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", game.black_player_id)
          .single();

        // Return entry fees to both players
        const refundAmount = game.entry_fee;

        if (whiteWallet) {
          promises.push(
            supabase
              .from("wallets")
              .update({
                balance: (whiteWallet.balance || 0) + refundAmount,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", game.white_player_id),
          );
        }

        if (blackWallet) {
          promises.push(
            supabase
              .from("wallets")
              .update({
                balance: (blackWallet.balance || 0) + refundAmount,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", game.black_player_id),
          );
        }

        // Create refund transactions
        promises.push(
          supabase.from("transactions").insert({
            user_id: game.white_player_id,
            transaction_type: "refund",
            amount: refundAmount,
            status: "completed",
            description: `Draw refund: ${game.game_name || "Chess Game"}`,
          }),
        );
        promises.push(
          supabase.from("transactions").insert({
            user_id: game.black_player_id,
            transaction_type: "refund",
            amount: refundAmount,
            status: "completed",
            description: `Draw refund: ${game.game_name || "Chess Game"}`,
          }),
        );
      }

      await Promise.all(promises);
      console.log("Game completion processing finished successfully");
    } catch (error) {
      console.error("Error processing game completion:", error);
    }
  };

  const fetchGame = async () => {
    if (isUpdating) return; // Prevent concurrent updates
    
    try {
      console.log("Fetching game data for:", gameId);
      const { data: gameData, error } = await supabase
        .from("chess_games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (error) {
        console.error("Error fetching game:", error);
        toast.error("Error loading game");
        return;
      }

      const gameWithPlayers: ChessGame = { ...gameData };

      // Fetch player data in parallel for faster loading
      const playerPromises = [];
      
      if (gameData.white_player_id) {
        playerPromises.push(
          supabase
            .from("profiles")
            .select("*")
            .eq("id", gameData.white_player_id)
            .single()
            .then(({ data }) => ({ type: 'white', data }))
        );
      }

      if (gameData.black_player_id) {
        playerPromises.push(
          supabase
            .from("profiles")
            .select("*")
            .eq("id", gameData.black_player_id)
            .single()
            .then(({ data }) => ({ type: 'black', data }))
        );
      }

      const playerResults = await Promise.all(playerPromises);
      
      playerResults.forEach(result => {
        if (result.type === 'white') {
          gameWithPlayers.white_player = result.data;
        } else {
          gameWithPlayers.black_player = result.data;
        }
      });

      setGame(gameWithPlayers);

      // Check for game end conditions
      if (gameWithPlayers.game_status === "completed" && !showGameEndDialog) {
        let message = "";
        let type: "win" | "draw" | "disconnect" = "win";

        if (gameWithPlayers.game_result === "draw") {
          message = "Game ended in a draw!";
          type = "draw";
        } else if (gameWithPlayers.game_result === "abandoned") {
          message =
            gameWithPlayers.winner_id === currentUser
              ? "Opponent abandoned the game. You win!"
              : "You abandoned the game. Opponent wins!";
          type = "disconnect";
        } else if (gameWithPlayers.winner_id === currentUser) {
          message = "Congratulations! You won! 🎉";
          type = "win";
        } else {
          message = "Game over. Better luck next time!";
          type = "win";
        }

        setGameEndMessage(message);
        setGameEndType(type);
        setShowGameEndDialog(true);
      }

      // Auto-start game if both players are present and status is still waiting
      if (
        gameWithPlayers.game_status === "waiting" &&
        gameWithPlayers.white_player_id &&
        gameWithPlayers.black_player_id
      ) {
        console.log("Both players present, starting game...");
        await supabase
          .from("chess_games")
          .update({
            game_status: "active" as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", gameId);
      }
    } catch (error) {
      console.error("Error fetching game:", error);
      toast.error("Error loading game");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!game) return;

    // For demo purposes, accept any password. In production, you'd verify against a stored hash
    if (gamePassword.length >= 4) {
      setShowPasswordDialog(false);
      toast.success("Password accepted!");
    } else {
      toast.error("Password must be at least 4 characters");
    }
  };

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!game || !currentUser || isUpdating) {
      console.log("No game, user found, or update in progress");
      return;
    }

    setIsUpdating(true); // Prevent concurrent updates

    const isWhitePlayer = currentUser === game.white_player_id;
    const isBlackPlayer = currentUser === game.black_player_id;

    if (!isWhitePlayer && !isBlackPlayer) {
      toast.error("You are not a player in this game");
      setIsUpdating(false);
      return;
    }

    const isPlayerTurn =
      (game.current_turn === "white" && isWhitePlayer) ||
      (game.current_turn === "black" && isBlackPlayer);

    if (!isPlayerTurn) {
      toast.error("Not your turn");
      setIsUpdating(false);
      return;
    }

    if (game.game_status !== "active") {
      if (game.game_status === "waiting") {
        toast.error("Waiting for another player to join");
      } else {
        toast.error("Game is not active");
      }
      setIsUpdating(false);
      return;
    }

    try {
      const chess = new Chess(game.board_state || undefined);
      const moves = chess.moves({ verbose: true });
      let validMove = moves.find((m) => m.from === from && m.to === to);

      if (!validMove && promotion) {
        validMove = moves.find(
          (m) => m.from === from && m.to === to && m.promotion === promotion,
        );
      }

      if (!validMove) {
        toast.error("Invalid move");
        setIsUpdating(false);
        return;
      }

      const moveOptions: { from: string; to: string; promotion?: string } = { from, to };
      if (promotion) {
        moveOptions.promotion = promotion;
      }

      const move = chess.move(moveOptions);
      if (!move) {
        toast.error("Move failed");
        setIsUpdating(false);
        return;
      }

      const moveNotation = promotion ? `${from}-${to}=${promotion}` : `${from}-${to}`;
      const newMoveHistory = [...(game.move_history || []), moveNotation];
      const nextTurn = game.current_turn === "white" ? "black" : "white";
      const newBoardState = chess.fen();

      // Reduced time penalty for faster gameplay
      const timeUsed = isMobile ? 1 : 2; // Much less time penalty
      const newWhiteTime = game.current_turn === "white" 
        ? Math.max(0, (game.white_time_remaining || 600) - timeUsed)
        : game.white_time_remaining || 600;
      const newBlackTime = game.current_turn === "black" 
        ? Math.max(0, (game.black_time_remaining || 600) - timeUsed)
        : game.black_time_remaining || 600;

      let gameStatus: "waiting" | "active" | "completed" | "cancelled" = game.game_status;
      let winnerId = null;
      let gameResult = null;

      // Check for time flag
      if (newWhiteTime <= 0 || newBlackTime <= 0) {
        gameStatus = "completed";
        winnerId = newWhiteTime <= 0 ? game.black_player_id : game.white_player_id;
        gameResult = newWhiteTime <= 0 ? "black_wins" : "white_wins";
        toast.success(`${newWhiteTime <= 0 ? "White" : "Black"} flagged! ${newWhiteTime <= 0 ? "Black" : "White"} wins!`);
      } else if (chess.isCheckmate()) {
        gameStatus = "completed";
        winnerId = game.current_turn === "white" ? game.white_player_id : game.black_player_id;
        gameResult = game.current_turn === "white" ? "white_wins" : "black_wins";
        toast.success(`Checkmate! ${game.current_turn === "white" ? "White" : "Black"} wins!`);
      } else if (chess.isDraw()) {
        gameStatus = "completed";
        gameResult = "draw";
        toast.success("Game ended in a draw!");
      } else if (chess.isCheck()) {
        toast.info(`${nextTurn === "white" ? "White" : "Black"} is in check!`);
      }

      // Optimistic update - update local state immediately
      setGame(prevGame => {
        if (!prevGame) return prevGame;
        return {
          ...prevGame,
          move_history: newMoveHistory,
          current_turn: nextTurn as any,
          board_state: newBoardState,
          white_time_remaining: newWhiteTime,
          black_time_remaining: newBlackTime,
          game_status: gameStatus as any,
          winner_id: winnerId,
          game_result: gameResult as any,
        };
      });

      const { error } = await supabase
        .from("chess_games")
        .update({
          move_history: newMoveHistory,
          current_turn: nextTurn,
          board_state: newBoardState,
          white_time_remaining: newWhiteTime,
          black_time_remaining: newBlackTime,
          game_status: gameStatus as any,
          winner_id: winnerId,
          game_result: gameResult as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (error) {
        toast.error("Failed to make move");
        console.error("Move error:", error);
        // Revert optimistic update on error
        fetchGame();
      } else {
        console.log("Move successfully saved to database");
      }
    } catch (error) {
      console.error("Error making move:", error);
      toast.error("Failed to make move");
      // Revert optimistic update on error
      fetchGame();
    } finally {
      setIsUpdating(false);
    }
  };

  const isSpectator = () => {
    if (!game || !currentUser) return true;
    return currentUser !== game.white_player_id && currentUser !== game.black_player_id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl font-bold bg-gradient-to-r from-black to-purple-900 px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            Loading Chess Game...
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
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 font-bold text-lg px-6 py-3 rounded-lg border-2 border-yellow-400 text-white shadow-xl"
        >
          Back to Lobby
        </Button>
      </div>
    );
  }

  const playerCount = (game.white_player_id ? 1 : 0) + (game.black_player_id ? 1 : 0);

  return (
    <div className="space-y-2 sm:space-y-4 pb-16 sm:pb-20 px-1 sm:px-2">
      {/* Game End Dialog */}
      <Dialog open={showGameEndDialog} onOpenChange={setShowGameEndDialog}>
        <DialogContent className="text-center w-[90vw] sm:w-[95vw] max-w-sm mx-auto bg-gradient-to-br from-black to-purple-900 border-2 border-yellow-400 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl text-white font-bold">
              {gameEndType === "win" && <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />}
              {gameEndType === "draw" && <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />}
              {gameEndType === "disconnect" && <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />}
              Game Over!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className={`text-sm sm:text-lg font-bold p-3 rounded-lg border-2 ${
              gameEndType === "win" ? "text-yellow-300 bg-yellow-900/30 border-yellow-400" :
              gameEndType === "draw" ? "text-purple-300 bg-purple-900/30 border-purple-400" :
              "text-yellow-300 bg-yellow-900/30 border-yellow-400"
            }`}>
              {gameEndMessage}
            </div>
            <Button
              onClick={() => {
                setShowGameEndDialog(false);
                onBackToLobby();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 font-bold text-sm sm:text-base py-2 rounded-lg border-2 border-yellow-400 text-white shadow-lg"
            >
              Return to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with Connection Status - Mobile Optimized */}
      <div className="flex items-center justify-between bg-gradient-to-r from-black to-purple-900 p-2 sm:p-3 rounded-lg shadow-lg border-2 border-yellow-400">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          className="text-white hover:bg-purple-800/50 font-bold text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 border-yellow-400 hover:border-purple-400"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex items-center gap-1 sm:gap-2">
          <DisconnectionTracker
            gameId={gameId}
            currentUser={currentUser}
            whitePlayerId={game.white_player_id}
            blackPlayerId={game.black_player_id}
            gameStatus={game.game_status}
            onPlayerDisconnected={handlePlayerDisconnected}
          />
          <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold px-1 sm:px-2 py-1 text-xs border-2 border-yellow-400 shadow-lg">
            <Zap className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            {game.game_status}
          </Badge>
          <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-black font-bold px-1 sm:px-2 py-1 text-xs border-2 border-white shadow-lg">
            <Users className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            {playerCount}/2
          </Badge>
          {isMobile && (
            <Button
              onClick={() => setShowMobileChat(!showMobileChat)}
              variant="ghost"
              size="sm"
              className="p-1 text-white border-2 border-yellow-400 hover:border-purple-400 hover:bg-purple-800/50"
            >
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Chat */}
      {isMobile && showMobileChat && (
        <div className="bg-gradient-to-br from-black to-purple-900 rounded-lg shadow-lg border-2 border-yellow-400 p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs sm:text-sm text-white">Game Chat</h3>
            <Button
              onClick={() => setShowMobileChat(false)}
              variant="ghost"
              size="sm"
              className="p-1 text-xs text-white hover:bg-purple-800/50"
            >
              Close
            </Button>
          </div>
          <div className="h-32 sm:h-40">
            <ChatSystem gameId={gameId} />
          </div>
        </div>
      )}

      {/* Time Controls */}
      {game.game_status === 'active' && (
        <TimeControl
          whiteTime={game.white_time_remaining || 600}
          blackTime={game.black_time_remaining || 600}
          currentTurn={game.current_turn as 'white' | 'black'}
          gameStatus={game.game_status}
          onTimeUp={handleTimeUp}
          isActive={!isSpectator()}
        />
      )}

      {/* Game Info - Mobile Optimized */}
      <Card className="bg-gradient-to-br from-black to-purple-900 border-2 border-yellow-400 shadow-2xl rounded-lg">
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-400" />
            <span className="truncate text-xs sm:text-sm md:text-base bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
              {game.game_name || "Chess Game"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-white font-medium text-xs sm:text-sm">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-1 sm:p-2 rounded border-2 border-white shadow-lg">
              <p className="text-xs text-gray-400 font-medium">⚪ White</p>
              <p className="font-bold truncate text-white text-xs sm:text-sm">
                {game.white_player?.username || "Waiting..."}
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-1 sm:p-2 rounded border-2 border-white shadow-lg">
              <p className="text-xs text-gray-400 font-medium">⚫ Black</p>
              <p className="font-bold truncate text-white text-xs sm:text-sm">
                {game.black_player?.username || "Waiting..."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 p-1 sm:p-2 rounded border-2 border-yellow-400 text-center shadow-lg">
              <p className="text-yellow-300 font-medium text-xs">Entry</p>
              <p className="font-bold text-yellow-200 text-xs">₹{game.entry_fee}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-1 sm:p-2 rounded border-2 border-purple-400 text-center shadow-lg">
              <p className="text-purple-300 font-medium text-xs">Prize</p>
              <p className="font-bold text-purple-200 text-xs">₹{game.prize_amount}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-1 sm:p-2 rounded border-2 border-white text-center shadow-lg">
              <p className="text-gray-300 font-medium text-xs">Turn</p>
              <p className="font-bold text-white text-xs">
                {game.current_turn === "white" ? "⚪" : "⚫"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chess Board with Reactions */}
      <div className="relative">
        <div className="w-full" key={`${game.board_state}-${game.current_turn}-${Date.now()}`}>
          <ChessBoard
            fen={game.board_state}
            onMove={handleMove}
            playerColor={currentUser === game.white_player_id ? "white" : "black"}
            disabled={game.game_status !== "active" || isSpectator() || isUpdating}
            isPlayerTurn={
              ((game.current_turn === "white" && currentUser === game.white_player_id) ||
               (game.current_turn === "black" && currentUser === game.black_player_id)) &&
              game.game_status === "active" && !isSpectator() && !isUpdating
            }
          />
        </div>
        
        {/* Mobile-optimized Reactions */}
        {game.game_status === "active" && !isSpectator() && (
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-30">
            <MobileGameReactions gameId={gameId} />
          </div>
        )}
      </div>

      {/* Desktop Reactions */}
      {!isMobile && game.game_status === "active" && !isSpectator() && (
        <div className="flex justify-center">
          <GameReactions gameId={gameId} />
        </div>
      )}

      {/* Desktop Chat */}
      {!isMobile && !isSpectator() && (
        <div className="max-w-md mx-auto">
          <ChatSystem gameId={gameId} />
        </div>
      )}

      {/* Game Status Messages - Mobile Optimized */}
      {game.game_status === "waiting" && playerCount < 2 && (
        <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-2 border-yellow-400 shadow-lg rounded-lg">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-yellow-200 font-bold text-xs sm:text-sm">
              Waiting for player... ({playerCount}/2)
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === "active" && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-white shadow-lg rounded-lg">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-white font-bold text-xs sm:text-sm">
              {isSpectator() ? "Spectating" : `${game.current_turn} to move`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
