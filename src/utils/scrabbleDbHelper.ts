import { supabase } from "@/integrations/supabase/client";
import {
  ScrabbleGameState,
  GameMove,
  Player,
} from "@/components/games/scrabble/ScrabbleGameLogic";

export interface ScrabbleGameRecord {
  id: string;
  creator_id: string;
  game_name: string | null;
  game_state: ScrabbleGameState;
  game_status: "waiting" | "active" | "completed" | "cancelled";
  player1_id: string;
  player2_id: string | null;
  player3_id: string | null;
  player4_id: string | null;
  current_players: number;
  max_players: number;
  entry_fee: number;
  prize_amount: number;
  winner_id: string | null;
  is_friend_challenge: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScrabbleMoveRecord {
  id: string;
  game_id: string;
  player_id: string;
  move_number: number;
  move_data: GameMove;
  created_at: string;
}

export interface UserCoins {
  user_id: string;
  coins: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

/**
 * Create a new Scrabble game in the database
 */
export const createScrabbleGame = async (
  creatorId: string,
  gameName: string,
  maxPlayers: number,
  entryFee: number,
  isFriendChallenge: boolean = false,
): Promise<{ success: boolean; gameId?: string; error?: string }> => {
  try {
    // Check if user has enough coins
    const userCoins = await getUserCoins(creatorId);
    if (!userCoins.success || userCoins.coins < entryFee) {
      return { success: false, error: "Insufficient coins" };
    }

    const gameId = `scrabble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const gameRecord: Partial<ScrabbleGameRecord> = {
      id: gameId,
      creator_id: creatorId,
      game_name: gameName,
      game_status: "waiting",
      player1_id: creatorId,
      player2_id: null,
      player3_id: null,
      player4_id: null,
      current_players: 1,
      max_players: maxPlayers,
      entry_fee: entryFee,
      prize_amount: entryFee, // Initial prize pool
      winner_id: null,
      is_friend_challenge: isFriendChallenge,
      game_state: null, // Will be set when game starts
    };

    const { data, error } = await supabase
      .from("scrabble_games")
      .insert([gameRecord])
      .select()
      .single();

    if (error) {
      console.error("Error creating Scrabble game:", error);
      return { success: false, error: error.message };
    }

    // Deduct entry fee from user's coins
    await updateUserCoins(creatorId, -entryFee, "game_entry");

    return { success: true, gameId: data.id };
  } catch (error) {
    console.error("Unexpected error creating Scrabble game:", error);
    return { success: false, error: "Failed to create game" };
  }
};

/**
 * Join an existing Scrabble game
 */
export const joinScrabbleGame = async (
  gameId: string,
  playerId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current game state
    const { data: game, error: fetchError } = await supabase
      .from("scrabble_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !game) {
      return { success: false, error: "Game not found" };
    }

    if (game.game_status !== "waiting") {
      return { success: false, error: "Game is not accepting players" };
    }

    if (game.current_players >= game.max_players) {
      return { success: false, error: "Game is full" };
    }

    // Check if user has enough coins
    const userCoins = await getUserCoins(playerId);
    if (!userCoins.success || userCoins.coins < game.entry_fee) {
      return { success: false, error: "Insufficient coins" };
    }

    // Check if player is already in game
    const playerIds = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ];
    if (playerIds.includes(playerId)) {
      return { success: false, error: "Already in this game" };
    }

    // Find next available player slot
    let updateData: any = {
      current_players: game.current_players + 1,
      prize_amount: game.prize_amount + game.entry_fee,
      updated_at: new Date().toISOString(),
    };

    if (!game.player2_id) {
      updateData.player2_id = playerId;
    } else if (!game.player3_id) {
      updateData.player3_id = playerId;
    } else if (!game.player4_id) {
      updateData.player4_id = playerId;
    }

    // Update game
    const { error: updateError } = await supabase
      .from("scrabble_games")
      .update(updateData)
      .eq("id", gameId);

    if (updateError) {
      console.error("Error joining Scrabble game:", updateError);
      return { success: false, error: updateError.message };
    }

    // Deduct entry fee from user's coins
    await updateUserCoins(playerId, -game.entry_fee, "game_entry");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error joining Scrabble game:", error);
    return { success: false, error: "Failed to join game" };
  }
};

/**
 * Update game state in database
 */
export const updateScrabbleGameState = async (
  gameId: string,
  gameState: ScrabbleGameState,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData = {
      game_state: gameState,
      game_status: gameState.gameStatus,
      winner_id: gameState.winner || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("scrabble_games")
      .update(updateData)
      .eq("id", gameId);

    if (error) {
      console.error("Error updating Scrabble game state:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating Scrabble game state:", error);
    return { success: false, error: "Failed to update game state" };
  }
};

/**
 * Save a game move
 */
export const saveScrabbleMove = async (
  gameId: string,
  playerId: string,
  moveNumber: number,
  moveData: GameMove,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const move: Partial<ScrabbleMoveRecord> = {
      game_id: gameId,
      player_id: playerId,
      move_number: moveNumber,
      move_data: moveData,
    };

    const { error } = await supabase.from("scrabble_moves").insert([move]);

    if (error) {
      console.error("Error saving Scrabble move:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error saving Scrabble move:", error);
    return { success: false, error: "Failed to save move" };
  }
};

/**
 * Get all available Scrabble games
 */
export const getAvailableScrabbleGames = async (): Promise<{
  success: boolean;
  games?: ScrabbleGameRecord[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("scrabble_games")
      .select("*")
      .in("game_status", ["waiting", "active"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching Scrabble games:", error);
      return { success: false, error: error.message };
    }

    return { success: true, games: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching Scrabble games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
};

/**
 * Get a specific Scrabble game
 */
export const getScrabbleGame = async (
  gameId: string,
): Promise<{
  success: boolean;
  game?: ScrabbleGameRecord;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("scrabble_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) {
      console.error("Error fetching Scrabble game:", error);
      return { success: false, error: error.message };
    }

    return { success: true, game: data };
  } catch (error) {
    console.error("Unexpected error fetching Scrabble game:", error);
    return { success: false, error: "Failed to fetch game" };
  }
};

/**
 * Get user's coin balance
 */
export const getUserCoins = async (
  userId: string,
): Promise<{
  success: boolean;
  coins: number;
  totalEarned?: number;
  totalSpent?: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("user_coins")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user coins:", error);
      return { success: false, coins: 0, error: error.message };
    }

    if (!data) {
      // Create initial coin record for user with bonus for first-time players
      const startingCoins = 1000; // Base starting coins
      const firstTimeBonus = 300; // Bonus for first-time players
      const totalStartingCoins = startingCoins + firstTimeBonus;

      const { data: newRecord, error: createError } = await supabase
        .from("user_coins")
        .insert([
          {
            user_id: userId,
            coins: totalStartingCoins,
            total_earned: totalStartingCoins,
            total_spent: 0,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating user coins record:", createError);
        return { success: false, coins: 0, error: createError.message };
      }

      return {
        success: true,
        coins: newRecord.coins,
        totalEarned: newRecord.total_earned,
        totalSpent: newRecord.total_spent,
      };
    }

    return {
      success: true,
      coins: data.coins,
      totalEarned: data.total_earned,
      totalSpent: data.total_spent,
    };
  } catch (error) {
    console.error("Unexpected error fetching user coins:", error);
    return { success: false, coins: 0, error: "Failed to fetch coins" };
  }
};

/**
 * Update user's coin balance
 */
export const updateUserCoins = async (
  userId: string,
  amount: number,
  transactionType: "game_entry" | "game_winning" | "purchase" | "reward",
): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
  try {
    // Get current balance
    const currentCoins = await getUserCoins(userId);
    if (!currentCoins.success) {
      return { success: false, error: currentCoins.error };
    }

    const newBalance = currentCoins.coins + amount;
    if (newBalance < 0) {
      return { success: false, error: "Insufficient coins" };
    }

    // Update coins and transaction totals
    let updateData: any = {
      coins: newBalance,
      updated_at: new Date().toISOString(),
    };

    if (amount > 0) {
      updateData.total_earned = (currentCoins.totalEarned || 0) + amount;
    } else {
      updateData.total_spent =
        (currentCoins.totalSpent || 0) + Math.abs(amount);
    }

    const { error } = await supabase
      .from("user_coins")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating user coins:", error);
      return { success: false, error: error.message };
    }

    // Log transaction
    await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount: amount,
        transaction_type: transactionType,
        description: `${transactionType.replace("_", " ")} - ${amount > 0 ? "+" : ""}${amount} coins`,
        balance_after: newBalance,
      },
    ]);

    return { success: true, newBalance };
  } catch (error) {
    console.error("Unexpected error updating user coins:", error);
    return { success: false, error: "Failed to update coins" };
  }
};

/**
 * Purchase coins (top-up system)
 */
export const purchaseCoins = async (
  userId: string,
  coinPackage: { coins: number; price: number; bonus?: number },
): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
  try {
    const totalCoins = coinPackage.coins + (coinPackage.bonus || 0);

    // In a real app, you would integrate with a payment gateway here
    // For now, we'll just add the coins directly

    const result = await updateUserCoins(userId, totalCoins, "purchase");
    if (!result.success) {
      return result;
    }

    // Log the purchase transaction
    await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount: totalCoins,
        transaction_type: "purchase",
        description: `Purchased ${coinPackage.coins} coins${coinPackage.bonus ? ` (+${coinPackage.bonus} bonus)` : ""} for ₹${coinPackage.price}`,
        balance_after: result.newBalance,
      },
    ]);

    return result;
  } catch (error) {
    console.error("Unexpected error purchasing coins:", error);
    return { success: false, error: "Failed to purchase coins" };
  }
};

/**
 * Get user's coin transaction history
 */
export const getCoinTransactions = async (
  userId: string,
  limit: number = 50,
): Promise<{
  success: boolean;
  transactions?: any[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching coin transactions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, transactions: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching coin transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
};

/**
 * Complete a Scrabble game and distribute prizes
 */
export const completeScrabbleGame = async (
  gameId: string,
  winnerId: string,
  finalScores: { playerId: string; score: number }[],
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get game data
    const gameResult = await getScrabbleGame(gameId);
    if (!gameResult.success || !gameResult.game) {
      return { success: false, error: "Game not found" };
    }

    const game = gameResult.game;

    // Update game status
    const { error: updateError } = await supabase
      .from("scrabble_games")
      .update({
        game_status: "completed",
        winner_id: winnerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error completing Scrabble game:", updateError);
      return { success: false, error: updateError.message };
    }

    // Award prize to winner
    if (game.prize_amount > 0) {
      await updateUserCoins(winnerId, game.prize_amount, "game_winning");
    }

    // Save final scores
    for (const scoreData of finalScores) {
      await supabase.from("scrabble_scores").insert([
        {
          game_id: gameId,
          user_id: scoreData.playerId,
          score: scoreData.score,
          is_winner: scoreData.playerId === winnerId,
          coins_won: scoreData.playerId === winnerId ? game.prize_amount : 0,
        },
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error completing Scrabble game:", error);
    return { success: false, error: "Failed to complete game" };
  }
};
