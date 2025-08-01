import { supabase } from "@/integrations/supabase/client";
import type {
  FourPicsLevel,
  FourPicsProgress,
  FourPicsScore,
  HintType,
} from "@/components/games/fourpics/FourPicsGameLogic";

export interface FourPicsApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get all levels or a specific level
export async function getFourPicsLevels(
  levelNumber?: number,
): Promise<FourPicsApiResult<FourPicsLevel[]>> {
  try {
    let query = supabase
      .from("fourpics_levels")
      .select("*")
      .order("level_number", { ascending: true });

    if (levelNumber) {
      query = query.eq("level_number", levelNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching 4 Pics levels:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Check if it's a missing table error
      if (
        error.code === "42P01" ||
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        return {
          success: false,
          error:
            "4 Pics 1 Word database not set up. Please run the migration: supabase/migrations/20250130000000_create_fourpics_system.sql",
        };
      }

      return {
        success: false,
        error: `Database error: ${error.message}. ${error.hint || ""}`,
      };
    }

    return { 
      success: true, 
      data: (data || []).map(level => ({
        ...level,
        image_urls: Array.isArray(level.images) ? level.images as string[] : [],
        difficulty: level.difficulty === 1 ? "easy" as const : 
                   level.difficulty === 2 ? "medium" as const : 
                   "hard" as const
      }))
    };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics levels:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get a specific level by ID
export async function getFourPicsLevel(
  levelId: string,
): Promise<FourPicsApiResult<FourPicsLevel>> {
  try {
    const { data, error } = await supabase
      .from("fourpics_levels")
      .select("*")
      .eq("id", levelId)
      .single();

    if (error) {
      console.error("Error fetching 4 Pics level:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        success: false,
        error: `Database error: ${error.message}. ${error.hint || ""}`,
      };
    }

    return { 
      success: true, 
      data: {
        ...data,
        image_urls: Array.isArray(data.images) ? data.images as string[] : [],
        difficulty: data.difficulty === 1 ? "easy" as const : 
                   data.difficulty === 2 ? "medium" as const : 
                   "hard" as const
      }
    };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get user progress
export async function getFourPicsProgress(
  userId: string,
): Promise<FourPicsApiResult<FourPicsProgress>> {
  try {
    const { data, error } = await supabase.rpc("get_fourpics_progress", {
      user_id_param: userId,
    });

    if (error) {
      console.error("Error fetching 4 Pics progress:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Check if it's a missing function error
      if (
        error.code === "42883" ||
        error.message.includes("function") ||
        error.message.includes("does not exist")
      ) {
        return {
          success: false,
          error:
            "4 Pics 1 Word database not set up. Please run the migration: supabase/migrations/20250130000000_create_fourpics_system.sql",
        };
      }

      return {
        success: false,
        error: `Database error: ${error.message}. ${error.hint || ""}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Complete a level
export async function completeFourPicsLevel(params: {
  userId: string;
  levelId: string;
  levelNumber: number;
  word: string;
  attempts: number;
  hintsUsed: HintType[];
  timeTaken: number;
  coinsSpent: number;
}): Promise<FourPicsApiResult<{ coins_earned: number; next_level: number }>> {
  try {
    const { data, error } = await supabase.rpc("complete_fourpics_level", {
      user_id_param: params.userId,
      level_id_param: params.levelId,
      level_number_param: params.levelNumber,
      word_param: params.word,
      attempts_param: params.attempts,
      hints_used_param: JSON.stringify(params.hintsUsed),
      time_taken_param: params.timeTaken,
      coins_spent_param: params.coinsSpent,
    });

    if (error) {
      console.error("Error completing 4 Pics level:", error);
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: {
        coins_earned: result.coins_earned,
        next_level: result.next_level,
      },
    };
  } catch (error) {
    console.error("Unexpected error completing 4 Pics level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Use a hint
export async function recordFourPicsHint(
  userId: string,
  levelId: string,
  hintType: HintType,
): Promise<FourPicsApiResult<{ hint_cost: number; hint_type: HintType }>> {
  try {
    const { data, error } = await supabase.rpc("use_fourpics_hint", {
      user_id_param: userId,
      level_id_param: levelId,
      hint_type_param: hintType,
    });

    if (error) {
      console.error("Error using 4 Pics hint:", error);
      return { success: false, error: error.message };
    }

    const result = data as any;
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: {
        hint_cost: result.hint_cost,
        hint_type: result.hint_type,
      },
    };
  } catch (error) {
    console.error("Unexpected error using 4 Pics hint:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get user scores for a specific level
export async function getFourPicsScores(
  userId: string,
  levelNumber?: number,
): Promise<FourPicsApiResult<FourPicsScore[]>> {
  try {
    let query = supabase
      .from("fourpics_scores")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (levelNumber) {
      query = query.eq("level_number", levelNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching 4 Pics scores:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: (data || []).map(score => ({
        ...score,
        hints_used: Array.isArray(score.hints_used) ? score.hints_used as HintType[] : []
      }))
    };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics scores:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get leaderboard
export async function getFourPicsLeaderboard(): Promise<
  FourPicsApiResult<
    {
      user_id: string;
      total_levels_completed: number;
      total_coins_earned: number;
      highest_level_reached: number;
      total_time_played: number;
      profiles: {
        username: string;
        avatar_url: string | null;
      };
    }[]
  >
> {
  try {
    const { data, error } = await supabase
      .from("fourpics_progress")
      .select(
        `
        user_id,
        total_levels_completed,
        total_coins_earned,
        highest_level_reached,
        total_time_played,
        profiles(username, avatar_url)
      `,
      )
      .order("highest_level_reached", { ascending: false })
      .order("total_levels_completed", { ascending: false })
      .order("total_time_played", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching 4 Pics leaderboard:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: (data || []).map(item => ({
        ...item,
        profiles: {
          username: (item.profiles as any)?.username || 'Anonymous',
          avatar_url: (item.profiles as any)?.avatar_url || null
        }
      }))
    };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics leaderboard:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get coin transactions
export async function getFourPicsCoinTransactions(userId: string): Promise<
  FourPicsApiResult<
    {
      id: string;
      user_id: string;
      level_id: string | null;
      transaction_type: string;
      hint_type: string | null;
      amount: number;
      description: string | null;
      created_at: string;
    }[]
  >
> {
  try {
    const { data, error } = await supabase
      .from("fourpics_coin_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching 4 Pics coin transactions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching 4 Pics coin transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Purchase coins function (integrates with existing wallet system)
export async function purchaseFourPicsCoins(
  userId: string,
  amount: number,
  coinPackage: string,
): Promise<FourPicsApiResult<{ new_balance: number }>> {
  try {
    // This would integrate with your existing wallet/coin system
    // For now, we'll use a placeholder implementation
    const { data, error } = await supabase.rpc("increment", {
      table_name: "wallets",
      row_id: userId,
      column_name: "balance",
      increment_value: amount,
    });

    if (error) {
      console.error("Error purchasing coins:", error);
      return { success: false, error: error.message };
    }

    // Record the transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      transaction_type: "deposit",
      amount: amount,
      status: "completed",
      description: `Purchased ${coinPackage} coin package for 4 Pics 1 Word`,
    });

    return {
      success: true,
      data: { new_balance: amount }, // This would be the actual new balance
    };
  } catch (error) {
    console.error("Unexpected error purchasing coins:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get levels by difficulty
export async function getFourPicsLevelsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): Promise<FourPicsApiResult<FourPicsLevel[]>> {
  try {
    const difficultyValue = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    const { data, error } = await supabase
      .from("fourpics_levels")
      .select("*")
      .eq("difficulty", difficultyValue)
      .order("level_number", { ascending: true });

    if (error) {
      console.error("Error fetching 4 Pics levels by difficulty:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: (data || []).map(level => ({
        ...level,
        image_urls: Array.isArray(level.images) ? level.images as string[] : [],
        difficulty: level.difficulty === 1 ? "easy" as const : 
                   level.difficulty === 2 ? "medium" as const : 
                   "hard" as const
      }))
    };
  } catch (error) {
    console.error(
      "Unexpected error fetching 4 Pics levels by difficulty:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Check if user can access level (based on progress)
export async function canAccessFourPicsLevel(
  userId: string,
  levelNumber: number,
): Promise<FourPicsApiResult<boolean>> {
  try {
    const progressResult = await getFourPicsProgress(userId);

    if (!progressResult.success || !progressResult.data) {
      return { success: false, error: "Could not fetch user progress" };
    }

    const canAccess = levelNumber <= progressResult.data.current_level;
    return { success: true, data: canAccess };
  } catch (error) {
    console.error("Unexpected error checking level access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
