import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LudoBoardEnhanced } from "./LudoBoardEnhanced";
import { LudoBoardModern } from "./LudoBoardModern";
import { LudoGameReactions } from "./LudoGameReactions";
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
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
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

        // Handle table not found error gracefully
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          console.warn("Ludo games table does not exist yet.");
          toast.error(
            "Ludo games are not available yet. Please try again later.",
          );
          onBackToLobby();
          return;
        }

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

      // Fixed auto-start logic - only attempt once per game load
      if (
        gameWithPlayers.game_status === "waiting" &&
        gameWithPlayers.current_players >= 2 &&
        !autoStartAttempted
      ) {
        console.log(
          "🚀 Auto-starting Ludo game with",
          gameWithPlayers.current_players,
          "players",
        );

        setAutoStartAttempted(true); // Prevent multiple attempts

        try {
          // Initialize game state properly
          const initialGameState = initializeGameState(
            gameWithPlayers.current_players,
          );

          const { error: startError } = await supabase
            .from("ludo_games")
            .update({
              game_status: "active",
              game_state: initialGameState,
              current_turn: "red", // Red player always starts
              updated_at: new Date().toISOString(),
            })
            .eq("id", gameId);

          if (startError) {
            console.error("❌ Error starting game:", startError);
            toast.error("Failed to start game");
            setAutoStartAttempted(false); // Allow retry on error
          } else {
            console.log("✅ Game started successfully!");
            toast.success("🎮 Game started! Red player goes first.");
          }
        } catch (error) {
          console.error("❌ Exception starting game:", error);
          setAutoStartAttempted(false); // Allow retry on exception
        }
      }

      // Reset auto-start flag if game is no longer waiting
      if (gameWithPlayers.game_status !== "waiting" && autoStartAttempted) {
        setAutoStartAttempted(false);
      }
    } catch (error) {
      console.error("Error fetching ludo game:", error);
      toast.error("Error loading game");
    } finally {
      setLoading(false);
    }
  };

  const initializeGameState = (playerCount: number) => {
    console.log(
      "🔧 Initializing enhanced game state for",
      playerCount,
      "players",
    );

    const availableColors = ["red", "blue", "green", "yellow"];
    const activeColors = availableColors.slice(0, playerCount);

    const pieces: any = {};

    activeColors.forEach((color) => {
      const homePos = getHomePosition(color);
      pieces[color] = Array(4)
        .fill(null)
        .map((_, index) => ({
          id: index,
          position: "home",
          row: homePos[0] + Math.floor(index / 2),
          col: homePos[1] + (index % 2),
          isOut: false,
          pathPosition: -1,
        }));
    });

    const gameState = {
      pieces,
      currentPlayer: "red",
      diceValue: null,
      gamePhase: "rolling",
      playerColors: activeColors,
      moveHistory: [],
      lastRoll: null,
      consecutiveSixes: 0,
      turnStartTime: Date.now(),
    };

    console.log("🎯 Initialized enhanced game state:", gameState);
    return gameState;
  };

  const getHomePosition = (color: string): [number, number] => {
    const positions: Record<string, [number, number]> = {
      red: [2, 2],
      blue: [2, 12],
      green: [12, 12],
      yellow: [12, 2],
    };
    return positions[color] || [2, 2];
  };

  const getStartPosition = (color: string): [number, number] => {
    const positions: Record<string, [number, number]> = {
      red: [6, 1],
      blue: [1, 8],
      green: [8, 13],
      yellow: [13, 6],
    };
    return positions[color] || [6, 1];
  };

  const COLOR_PATHS: Record<string, [number, number][]> = {
    red: [
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 6],
      [5, 6],
      [4, 6],
      [3, 6],
      [2, 6],
      [1, 6],
      [1, 7],
      [1, 8],
      [2, 8],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8],
      [6, 9],
      [6, 10],
      [6, 11],
      [6, 12],
      [6, 13],
      [7, 13],
      [8, 13],
      [8, 12],
      [8, 11],
      [8, 10],
      [8, 9],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8],
      [12, 8],
      [13, 8],
      [13, 7],
      [13, 6],
      [12, 6],
      [11, 6],
      [10, 6],
      [9, 6],
      [8, 6],
      [8, 5],
      [8, 4],
      [8, 3],
      [8, 2],
      [8, 1],
      [7, 1],
      [7, 2],
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ],
    blue: [
      [1, 8],
      [2, 8],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8],
      [6, 9],
      [6, 10],
      [6, 11],
      [6, 12],
      [6, 13],
      [7, 13],
      [8, 13],
      [8, 12],
      [8, 11],
      [8, 10],
      [8, 9],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8],
      [12, 8],
      [13, 8],
      [13, 7],
      [13, 6],
      [12, 6],
      [11, 6],
      [10, 6],
      [9, 6],
      [8, 6],
      [8, 5],
      [8, 4],
      [8, 3],
      [8, 2],
      [8, 1],
      [7, 1],
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 6],
      [5, 6],
      [4, 6],
      [3, 6],
      [2, 6],
      [1, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [7, 7],
    ],
    green: [
      [8, 13],
      [8, 12],
      [8, 11],
      [8, 10],
      [8, 9],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8],
      [12, 8],
      [13, 8],
      [13, 7],
      [13, 6],
      [12, 6],
      [11, 6],
      [10, 6],
      [9, 6],
      [8, 6],
      [8, 5],
      [8, 4],
      [8, 3],
      [8, 2],
      [8, 1],
      [7, 1],
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 6],
      [5, 6],
      [4, 6],
      [3, 6],
      [2, 6],
      [1, 6],
      [1, 7],
      [1, 8],
      [2, 8],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8],
      [6, 9],
      [6, 10],
      [6, 11],
      [6, 12],
      [6, 13],
      [7, 13],
      [7, 12],
      [7, 11],
      [7, 10],
      [7, 9],
      [7, 8],
      [7, 7],
    ],
    yellow: [
      [13, 6],
      [12, 6],
      [11, 6],
      [10, 6],
      [9, 6],
      [8, 6],
      [8, 5],
      [8, 4],
      [8, 3],
      [8, 2],
      [8, 1],
      [7, 1],
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [6, 6],
      [5, 6],
      [4, 6],
      [3, 6],
      [2, 6],
      [1, 6],
      [1, 7],
      [1, 8],
      [2, 8],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8],
      [6, 9],
      [6, 10],
      [6, 11],
      [6, 12],
      [6, 13],
      [7, 13],
      [8, 13],
      [8, 12],
      [8, 11],
      [8, 10],
      [8, 9],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 8],
      [12, 8],
      [13, 8],
      [13, 7],
      [12, 7],
      [11, 7],
      [10, 7],
      [9, 7],
      [8, 7],
      [7, 7],
    ],
  };

  const calculateNewPosition = (
    color: string,
    currentPathPosition: number,
    steps: number,
  ): [number, number] | null => {
    const path = COLOR_PATHS[color];
    const newPathPosition = currentPathPosition + steps;

    if (newPathPosition >= path.length) {
      return null; // Can't move beyond finish
    }

    return path[newPathPosition];
  };

  const canCapture = (
    fromPos: [number, number],
    toPos: [number, number],
    targetColor: string,
    movingColor: string,
  ): boolean => {
    if (targetColor === movingColor) return false; // Can't capture own piece

    // Safe positions
    const SAFE_POSITIONS = [
      [1, 6],
      [6, 1],
      [8, 1],
      [13, 6],
      [13, 8],
      [8, 13],
      [6, 13],
      [1, 8],
      [6, 2],
      [2, 8],
      [8, 12],
      [12, 6],
    ];

    return !SAFE_POSITIONS.some(([r, c]) => r === toPos[0] && c === toPos[1]);
  };

  const handleMove = async (
    playerId: string,
    pieceId: number,
    steps: number,
  ) => {
    if (!game || !currentUser || !game.game_state) return;

    if (game.current_turn !== getPlayerColor()) {
      toast.error("Not your turn!");
      return;
    }

    try {
      console.log(
        `🎯 Enhanced move: ${playerId} piece ${pieceId} by ${steps} steps`,
      );

      const newGameState = JSON.parse(JSON.stringify(game.game_state)); // Deep clone
      const piece = newGameState.pieces[playerId]?.[pieceId];

      if (!piece) {
        toast.error("Invalid piece!");
        return;
      }

      let bonusTurn = false;
      let capturedPiece = false;

      // Handle moving out of home
      if (piece.position === "home" && steps === 6) {
        const startPos = getStartPosition(playerId);

        // Check if start position is occupied by opponent
        const occupant = findPieceAtPosition(
          newGameState,
          startPos[0],
          startPos[1],
        );
        if (occupant && occupant.color !== playerId) {
          // Capture the piece
          sendPieceHome(newGameState, occupant);
          capturedPiece = true;
          toast.success(`Captured ${occupant.color} piece!`);
        }

        piece.position = "active";
        piece.row = startPos[0];
        piece.col = startPos[1];
        piece.pathPosition = 0;
        piece.isOut = true;

        toast.success("Moved piece out of home!");
      }
      // Handle moving active pieces
      else if (piece.position === "active") {
        const newPos = calculateNewPosition(
          playerId,
          piece.pathPosition,
          steps,
        );

        if (!newPos) {
          toast.error("Cannot move beyond finish line!");
          return;
        }

        const newPathPosition = piece.pathPosition + steps;

        // Check if reached home (center)
        if (newPathPosition >= COLOR_PATHS[playerId].length - 1) {
          piece.position = "finished";
          piece.row = 7;
          piece.col = 7;
          piece.pathPosition = COLOR_PATHS[playerId].length - 1;

          toast.success("🏠 Piece reached home!");

          // Check win condition
          const finishedCount = newGameState.pieces[playerId].filter(
            (p: any) => p.position === "finished",
          ).length;

          if (finishedCount === 4) {
            await completeGame(currentUser, "normal");
            toast.success("🎉 You won the game!");
            return;
          }
        } else {
          // Check for capture
          const occupant = findPieceAtPosition(
            newGameState,
            newPos[0],
            newPos[1],
          );
          if (
            occupant &&
            occupant.color !== playerId &&
            canCapture([piece.row, piece.col], newPos, occupant.color, playerId)
          ) {
            sendPieceHome(newGameState, occupant);
            capturedPiece = true;
            bonusTurn = true; // Capturing gives bonus turn
            toast.success(`💥 Captured ${occupant.color} piece!`);
          }

          // Move piece to new position
          piece.pathPosition = newPathPosition;
          piece.row = newPos[0];
          piece.col = newPos[1];
        }
      } else {
        toast.error("Invalid move!");
        return;
      }

      // Handle bonus turns
      if (steps === 6) {
        bonusTurn = true;
        newGameState.consecutiveSixes =
          (newGameState.consecutiveSixes || 0) + 1;

        if (newGameState.consecutiveSixes >= 3) {
          bonusTurn = false;
          newGameState.consecutiveSixes = 0;
          toast.warning("Three sixes! Turn forfeited.");
        } else {
          toast.success("🎲 Six rolled! You get another turn!");
        }
      } else {
        newGameState.consecutiveSixes = 0;
      }

      // Determine next player
      let nextPlayer = playerId;
      if (!bonusTurn) {
        const activeColors =
          newGameState.playerColors ||
          ["red", "blue", "green", "yellow"].slice(0, game.current_players);
        const currentIndex = activeColors.indexOf(game.current_turn);
        nextPlayer = activeColors[(currentIndex + 1) % activeColors.length];
      }

      // Add to move history
      newGameState.moveHistory = newGameState.moveHistory || [];
      newGameState.moveHistory.push({
        player: playerId,
        piece: pieceId,
        steps: steps,
        timestamp: Date.now(),
        bonusTurn: bonusTurn,
        captured: capturedPiece,
      });

      // Clear dice value for database
      newGameState.diceValue = null;

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
        console.error("❌ Enhanced move error:", error);
      } else {
        console.log(`✅ Enhanced move completed! Next: ${nextPlayer}`);
      }
    } catch (error) {
      console.error("❌ Error in enhanced move:", error);
      toast.error("Failed to make move");
    }
  };

  const handleTurnEnd = async () => {
    if (!game || !currentUser || !game.game_state) return;

    try {
      const activeColors =
        game.game_state?.playerColors ||
        ["red", "blue", "green", "yellow"].slice(0, game.current_players);
      const currentIndex = activeColors.indexOf(game.current_turn);
      const nextPlayer = activeColors[(currentIndex + 1) % activeColors.length];

      const { error } = await supabase
        .from("ludo_games")
        .update({
          current_turn: nextPlayer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (error) {
        console.error("❌ Error ending turn:", error);
        toast.error("Failed to end turn");
      } else {
        console.log(`✅ Turn ended! Next: ${nextPlayer}`);
      }
    } catch (error) {
      console.error("❌ Error in turn end:", error);
    }
  };

  const findPieceAtPosition = (gameState: any, row: number, col: number) => {
    if (!gameState?.pieces) return null;

    for (const [color, pieces] of Object.entries(gameState.pieces)) {
      if (!Array.isArray(pieces)) continue;

      for (const [index, piece] of pieces.entries()) {
        if (
          piece &&
          piece.row === row &&
          piece.col === col &&
          piece.position === "active"
        ) {
          return { ...piece, color, index };
        }
      }
    }
    return null;
  };

  const sendPieceHome = (gameState: any, capturedPiece: any) => {
    if (!gameState?.pieces?.[capturedPiece.color]?.[capturedPiece.index])
      return;

    const piece = gameState.pieces[capturedPiece.color][capturedPiece.index];
    const homePos = getHomePosition(capturedPiece.color);

    piece.position = "home";
    piece.row = homePos[0] + Math.floor(capturedPiece.index / 2);
    piece.col = homePos[1] + (capturedPiece.index % 2);
    piece.pathPosition = -1;
    piece.isOut = false;
  };

  const completeGame = async (winnerId: string | null, gameResult: string) => {
    if (!game) return;

    console.log("🎯 Starting Ludo game completion process", {
      winnerId,
      gameResult,
      prizeAmount: game.prize_amount,
    });

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
        console.error("❌ Error updating ludo game:", gameError);
        return;
      }

      console.log("✅ Ludo game status updated successfully");

      // Process winnings similar to chess
      if (winnerId && game.prize_amount > 0) {
        console.log("💰 Processing Ludo winner rewards for:", winnerId);

        // Update winner's stats and wallet
        const { data: winnerProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("games_played, games_won, total_earnings")
          .eq("id", winnerId)
          .single();

        if (profileFetchError) {
          console.error(
            "❌ Error fetching Ludo winner profile:",
            profileFetchError,
          );
        } else {
          console.log("📊 Current Ludo winner stats:", winnerProfile);

          const { error: profileUpdateError } = await supabase
            .from("profiles")
            .update({
              games_played: (winnerProfile.games_played || 0) + 1,
              games_won: (winnerProfile.games_won || 0) + 1,
              total_earnings:
                (winnerProfile.total_earnings || 0) + game.prize_amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", winnerId);

          if (profileUpdateError) {
            console.error(
              "❌ Error updating Ludo winner profile:",
              profileUpdateError,
            );
          } else {
            console.log("✅ Ludo winner profile updated successfully");
          }
        }

        // Add winnings to wallet
        const { data: winnerWallet, error: walletFetchError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", winnerId)
          .single();

        if (walletFetchError) {
          console.error(
            "❌ Error fetching Ludo winner wallet:",
            walletFetchError,
          );
          toast.error("Failed to update wallet");
        } else {
          console.log(
            "💳 Current Ludo winner wallet balance:",
            winnerWallet.balance,
          );

          const newBalance = (winnerWallet.balance || 0) + game.prize_amount;
          const { error: walletUpdateError } = await supabase
            .from("wallets")
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", winnerId);

          if (walletUpdateError) {
            console.error(
              "❌ Error updating Ludo winner wallet:",
              walletUpdateError,
            );
            toast.error("Failed to add Ludo winnings to wallet");
          } else {
            console.log(
              "✅ Ludo winner wallet updated successfully. New balance:",
              newBalance,
            );

            if (winnerId === currentUser) {
              toast.success(
                `🎉 ₹${game.prize_amount} added to your wallet from Ludo win!`,
              );
            }
          }
        }

        // Create winning transaction
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            user_id: winnerId,
            transaction_type: "game_winning",
            amount: game.prize_amount,
            status: "completed",
            description: `Won Ludo game: ${game.game_name || "Ludo Game"}`,
          });

        if (transactionError) {
          console.error(
            "❌ Error creating Ludo winning transaction:",
            transactionError,
          );
        } else {
          console.log("✅ Ludo winning transaction created successfully");
        }
      }

      console.log("🎉 Ludo game completion processing finished successfully");

      // Show success message
      if (winnerId === currentUser) {
        toast.success(
          `🏆 Congratulations! You won ₹${game.prize_amount} in Ludo!`,
        );
      }
    } catch (error) {
      console.error("💥 Error processing Ludo game completion:", error);
      toast.error("Failed to process Ludo game completion");
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

      {/* Header with Emoji Reactions */}
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
          {/* Emoji Reactions */}
          <LudoGameReactions gameId={gameId} isMobile={isMobile} />
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
              {game.game_name || "Enhanced Ludo Game"}
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

      {/* Modern Ludo Board */}
      {game.game_status === "active" && game.game_state && (
        <LudoBoardModern
          gameState={game.game_state}
          onMove={handleMove}
          onTurnEnd={handleTurnEnd}
          playerColor={getPlayerColor()}
          currentPlayer={game.current_turn}
          isPlayerTurn={isPlayerTurn()}
          disabled={isSpectator()}
          onGameEnd={(winner) => {
            toast.success(`🎉 ${winner} wins the game!`);
            setTimeout(() => onBackToLobby(), 3000);
          }}
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
              Game will auto-start when 2+ players join
            </p>
            {game.current_players >= 2 && (
              <p className="text-green-300 text-xs mt-1 font-bold">
                ✓ Ready to start! Game will begin shortly...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
