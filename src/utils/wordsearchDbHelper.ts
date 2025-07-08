import { supabase } from "@/integrations/supabase/client";
import {
  GameState,
  Player,
  WordSearchMove,
} from "@/components/games/wordsearch/WordSearchGameLogic";

export interface WordSearchGameRecord {
  id: string;
  creator_id: string;
  game_name: string | null;
  game_state: GameState;
  game_status: "waiting" | "active" | "completed" | "cancelled";
  player1_id: string | null;
  player2_id: string | null;
  player3_id: string | null;
  player4_id: string | null;
  winner_id: string | null;
  max_players: number;
  current_players: number;
  entry_fee: number;
  prize_pool: number;
  difficulty: "easy" | "medium" | "hard";
  grid_size: number;
  word_count: number;
  time_limit: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WordSearchScoreRecord {
  id: string;
  user_id: string;
  username: string;
  game_id: string | null;
  score: number;
  words_found: number;
  total_words: number;
  time_taken: number;
  hints_used: number;
  coins_spent: number;
  coins_won: number;
  difficulty: "easy" | "medium" | "hard";
  game_mode: "solo" | "multiplayer" | "practice";
  grid_size: number;
  is_solo_game: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WordSearchCoinRecord {
  id: string;
  user_id: string;
  transaction_type:
    | "purchase"
    | "game_entry"
    | "hint_purchase"
    | "game_reward"
    | "daily_bonus";
  amount: number;
  balance_after: number;
  game_id: string | null;
  description: string;
  created_at: string;
}

/**
 * Create a new Word Search game in the database
 */
export const createWordSearchGame = async (
  creatorId: string,
  gameName: string,
  gameState: GameState,
  maxPlayers: number = 2,
  entryFee: number = 10,
  difficulty: "easy" | "medium" | "hard" = "medium",
  gridSize: number = 15,
  wordCount: number = 10,
  timeLimit: number = 300,
): Promise<{ success: boolean; gameId?: string; error?: string }> => {
  try {
    console.log("Creating Word Search game...");

    const gameId = `wordsearch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const gameRecord: Partial<WordSearchGameRecord> = {
      id: gameId,
      creator_id: creatorId,
      game_name: gameName,
      game_state: gameState,
      game_status: "waiting",
      player1_id: creatorId,
      max_players: maxPlayers,
      current_players: 1,
      entry_fee: entryFee,
      prize_pool: entryFee, // Creator pays entry fee
      difficulty,
      grid_size: gridSize,
      word_count: wordCount,
      time_limit: timeLimit,
    };

    const { data, error } = await supabase
      .from("word_search_games")
      .insert([gameRecord])
      .select()
      .single();

    if (error) {
      console.error("Error creating Word Search game:", error);
      return { success: false, error: error.message };
    }

    console.log("Word Search game created successfully:", data);
    return { success: true, gameId: data.id };
  } catch (error) {
    console.error("Unexpected error creating Word Search game:", error);
    return { success: false, error: "Failed to create game" };
  }
};

/**
 * Join an existing Word Search game
 */
export const joinWordSearchGame = async (
  gameId: string,
  playerId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: game, error: fetchError } = await supabase
      .from("word_search_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError) {
      console.error("Error fetching Word Search game:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    if (game.game_status !== "waiting") {
      return { success: false, error: "Game is not accepting new players" };
    }

    if (game.current_players >= game.max_players) {
      return { success: false, error: "Game is full" };
    }

    // Check if player is already in the game
    if (
      [
        game.player1_id,
        game.player2_id,
        game.player3_id,
        game.player4_id,
      ].includes(playerId)
    ) {
      return { success: false, error: "You are already in this game" };
    }

    // Find the next available player slot
    let updateData: any = {
      current_players: game.current_players + 1,
      prize_pool: game.prize_pool + game.entry_fee,
    };

    if (!game.player2_id) {
      updateData.player2_id = playerId;
    } else if (!game.player3_id) {
      updateData.player3_id = playerId;
    } else if (!game.player4_id) {
      updateData.player4_id = playerId;
    } else {
      return { success: false, error: "Game is full" };
    }

    const { error: updateError } = await supabase
      .from("word_search_games")
      .update(updateData)
      .eq("id", gameId);

    if (updateError) {
      console.error("Error joining Word Search game:", updateError);
      return { success: false, error: updateError.message };
    }

    // Deduct entry fee from player's coin balance
    await deductCoins(playerId, game.entry_fee, gameId, "Game entry fee");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error joining Word Search game:", error);
    return { success: false, error: "Failed to join game" };
  }
};

/**
 * Update Word Search game state
 */
export const updateWordSearchGameState = async (
  gameId: string,
  gameState: GameState,
  gameStatus?: "waiting" | "active" | "completed" | "cancelled",
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      game_state: gameState,
      updated_at: new Date().toISOString(),
    };

    if (gameStatus) {
      updateData.game_status = gameStatus;
      if (gameStatus === "active" && !gameState.startTime) {
        updateData.started_at = new Date().toISOString();
      } else if (gameStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from("word_search_games")
      .update(updateData)
      .eq("id", gameId);

    if (error) {
      console.error("Error updating Word Search game state:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating Word Search game state:", error);
    return { success: false, error: "Failed to update game state" };
  }
};

/**
 * Save Word Search move
 */
export const saveWordSearchMove = async (
  gameId: string,
  move: WordSearchMove,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const moveRecord = {
      game_id: gameId,
      user_id: move.playerId,
      word_found: move.word,
      start_position: move.start,
      end_position: move.end,
      direction: move.direction,
      timestamp: new Date(move.timestamp).toISOString(),
    };

    const { error } = await supabase
      .from("word_search_moves")
      .insert([moveRecord]);

    if (error) {
      console.error("Error saving Word Search move:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error saving Word Search move:", error);
    return { success: false, error: "Failed to save move" };
  }
};

/**
 * Get all available Word Search games
 */
export const getAvailableWordSearchGames = async (): Promise<{
  success: boolean;
  games?: WordSearchGameRecord[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("word_search_games")
      .select("*")
      .eq("game_status", "waiting")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching Word Search games:", error);
      return { success: false, error: error.message };
    }

    return { success: true, games: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching Word Search games:", error);
    return { success: false, error: "Failed to fetch games" };
  }
};

/**
 * Get a specific Word Search game
 */
export const getWordSearchGame = async (
  gameId: string,
): Promise<{
  success: boolean;
  game?: WordSearchGameRecord;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("word_search_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) {
      console.error("Error fetching Word Search game:", error);
      return { success: false, error: error.message };
    }

    return { success: true, game: data };
  } catch (error) {
    console.error("Unexpected error fetching Word Search game:", error);
    return { success: false, error: "Failed to fetch game" };
  }
};

/**
 * Get user's coin balance
 */
export const getUserCoinBalance = async (
  userId: string,
): Promise<{
  success: boolean;
  balance?: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("word_search_coins")
      .select("balance_after")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching coin balance:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Check if table doesn't exist
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn(
          "Word Search coin tables not created yet. Please run the migration.",
        );
        return { success: true, balance: 100 }; // Default starting balance
      }

      return { success: false, error: error.message || "Database error" };
    }

    const balance = data && data.length > 0 ? data[0].balance_after : 100; // Default starting balance
    return { success: true, balance };
  } catch (error) {
    console.error("Unexpected error fetching coin balance:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: "Failed to fetch balance" };
  }
};

/**
 * Add coins to user's balance
 */
export const addCoins = async (
  userId: string,
  amount: number,
  transactionType: "purchase" | "game_reward" | "daily_bonus",
  description: string,
  gameId?: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
  try {
    // Get current balance
    const balanceResult = await getUserCoinBalance(userId);
    if (!balanceResult.success) {
      return { success: false, error: "Failed to get current balance" };
    }

    const currentBalance = balanceResult.balance || 0;
    const newBalance = currentBalance + amount;

    const coinRecord: Partial<WordSearchCoinRecord> = {
      user_id: userId,
      transaction_type: transactionType,
      amount,
      balance_after: newBalance,
      game_id: gameId || null,
      description,
    };

    const { error } = await supabase
      .from("word_search_coins")
      .insert([coinRecord]);

    if (error) {
      console.error("Error adding coins:", error);
      return { success: false, error: error.message };
    }

    return { success: true, newBalance };
  } catch (error) {
    console.error("Unexpected error adding coins:", error);
    return { success: false, error: "Failed to add coins" };
  }
};

/**
 * Deduct coins from user's balance
 */
export const deductCoins = async (
  userId: string,
  amount: number,
  gameId: string | null,
  description: string,
  transactionType: "game_entry" | "hint_purchase" = "game_entry",
): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
  try {
    // Get current balance
    const balanceResult = await getUserCoinBalance(userId);
    if (!balanceResult.success) {
      return { success: false, error: "Failed to get current balance" };
    }

    const currentBalance = balanceResult.balance || 0;
    if (currentBalance < amount) {
      return { success: false, error: "Insufficient coins" };
    }

    const newBalance = currentBalance - amount;

    const coinRecord: Partial<WordSearchCoinRecord> = {
      user_id: userId,
      transaction_type: transactionType,
      amount: -amount, // negative for deduction
      balance_after: newBalance,
      game_id: gameId,
      description,
    };

    const { error } = await supabase
      .from("word_search_coins")
      .insert([coinRecord]);

    if (error) {
      console.error("Error deducting coins:", error);
      return { success: false, error: error.message };
    }

    return { success: true, newBalance };
  } catch (error) {
    console.error("Unexpected error deducting coins:", error);
    return { success: false, error: "Failed to deduct coins" };
  }
};

/**
 * Save Word Search score
 */
export const saveWordSearchScore = async (scoreData: {
  user_id: string;
  username: string;
  game_id?: string;
  score: number;
  words_found: number;
  total_words: number;
  time_taken: number;
  hints_used: number;
  coins_spent: number;
  coins_won: number;
  difficulty: "easy" | "medium" | "hard";
  game_mode: "solo" | "multiplayer" | "practice";
  grid_size: number;
  is_solo_game: boolean;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("word_search_scores")
      .insert([scoreData]);

    if (error) {
      console.error("Error saving Word Search score:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error saving Word Search score:", error);
    return { success: false, error: "Failed to save score" };
  }
};

/**
 * Get Word Search leaderboard
 */
export const getWordSearchLeaderboard = async (
  difficulty?: "easy" | "medium" | "hard",
  gameMode?: "solo" | "multiplayer" | "practice",
  limit: number = 50,
): Promise<{
  success: boolean;
  scores?: WordSearchScoreRecord[];
  error?: string;
}> => {
  try {
    let query = supabase
      .from("word_search_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    if (gameMode) {
      query = query.eq("game_mode", gameMode);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching Word Search leaderboard:", error);
      return { success: false, error: error.message };
    }

    return { success: true, scores: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching Word Search leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
};

/**
 * Get user's Word Search statistics
 */
export const getUserWordSearchStats = async (
  userId: string,
): Promise<{
  success: boolean;
  stats?: any;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("word_search_scores")
      .select("*")
      .eq("user_id", userId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error fetching user Word Search stats:", error);
      return { success: false, error: error.message };
    }

    const scores = data || [];
    const bestScore = scores.length > 0 ? scores[0].score : 0;
    const totalGames = scores.length;
    const averageScore =
      totalGames > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames)
        : 0;

    const difficultyStats = {
      easy: scores.filter((s) => s.difficulty === "easy").length,
      medium: scores.filter((s) => s.difficulty === "medium").length,
      hard: scores.filter((s) => s.difficulty === "hard").length,
    };

    const gameModeStats = {
      solo: scores.filter((s) => s.game_mode === "solo").length,
      multiplayer: scores.filter((s) => s.game_mode === "multiplayer").length,
      practice: scores.filter((s) => s.game_mode === "practice").length,
    };

    const totalWordsFound = scores.reduce((sum, s) => sum + s.words_found, 0);
    const totalWordsAvailable = scores.reduce(
      (sum, s) => sum + s.total_words,
      0,
    );
    const wordFindRate =
      totalWordsAvailable > 0
        ? Math.round((totalWordsFound / totalWordsAvailable) * 100)
        : 0;

    const totalCoinsWon = scores.reduce((sum, s) => sum + s.coins_won, 0);
    const totalCoinsSpent = scores.reduce((sum, s) => sum + s.coins_spent, 0);

    return {
      success: true,
      stats: {
        scores,
        bestScore,
        totalGames,
        averageScore,
        difficultyStats,
        gameModeStats,
        totalWordsFound,
        totalWordsAvailable,
        wordFindRate,
        totalCoinsWon,
        totalCoinsSpent,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user Word Search stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
};

/**
 * Complete a Word Search game and distribute prizes
 */
export const completeWordSearchGame = async (
  gameId: string,
  finalScores: Array<{
    user_id: string;
    username: string;
    score: number;
    words_found: number;
    total_words: number;
    time_taken: number;
    hints_used: number;
    coins_spent: number;
  }>,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get game data
    const gameResult = await getWordSearchGame(gameId);
    if (!gameResult.success || !gameResult.game) {
      return { success: false, error: "Game not found" };
    }

    const game = gameResult.game;

    // Update game status to completed
    const { error: updateError } = await supabase
      .from("word_search_games")
      .update({
        game_status: "completed",
        completed_at: new Date().toISOString(),
        winner_id: finalScores[0]?.user_id || null,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error completing Word Search game:", updateError);
      return { success: false, error: updateError.message };
    }

    // Calculate and distribute prizes
    const totalPlayers = finalScores.length;
    const prizeDistribution = calculatePrizeDistribution(
      game.prize_pool,
      totalPlayers,
    );

    // Save scores and distribute prizes
    for (let i = 0; i < finalScores.length; i++) {
      const scoreData = finalScores[i];
      const coinsWon = prizeDistribution[i] || 0;

      // Save score
      await supabase.from("word_search_scores").insert([
        {
          ...scoreData,
          game_id: gameId,
          coins_won: coinsWon,
          difficulty: game.difficulty,
          game_mode: "multiplayer",
          grid_size: game.grid_size,
          is_solo_game: false,
        },
      ]);

      // Award coins if any
      if (coinsWon > 0) {
        await addCoins(
          scoreData.user_id,
          coinsWon,
          "game_reward",
          `Word Search game prize - ${i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`} place`,
          gameId,
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error completing Word Search game:", error);
    return { success: false, error: "Failed to complete game" };
  }
};

/**
 * Calculate prize distribution based on total prize pool and number of players
 */
function calculatePrizeDistribution(
  prizePool: number,
  playerCount: number,
): number[] {
  const distribution: number[] = new Array(playerCount).fill(0);

  if (playerCount === 1) {
    distribution[0] = prizePool;
  } else if (playerCount === 2) {
    distribution[0] = Math.round(prizePool * 0.7); // 70% to winner
    distribution[1] = Math.round(prizePool * 0.3); // 30% to second
  } else if (playerCount >= 3) {
    distribution[0] = Math.round(prizePool * 0.5); // 50% to winner
    distribution[1] = Math.round(prizePool * 0.3); // 30% to second
    distribution[2] = Math.round(prizePool * 0.2); // 20% to third
    // 4th place gets nothing in this distribution
  }

  return distribution;
}

/**
 * Record hint usage
 */
export const recordHintUsage = async (
  userId: string,
  gameId: string | null,
  hintType: "letter_highlight" | "word_location" | "direction_hint",
  wordTarget: string,
  coinsSpent: number = 5,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const hintRecord = {
      game_id: gameId,
      user_id: userId,
      hint_type: hintType,
      word_target: wordTarget,
      coins_spent: coinsSpent,
    };

    const { error } = await supabase
      .from("word_search_hints")
      .insert([hintRecord]);

    if (error) {
      console.error("Error recording hint usage:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error recording hint usage:", error);
    return { success: false, error: "Failed to record hint usage" };
  }
};
