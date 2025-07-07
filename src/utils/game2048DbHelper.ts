import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for 2048 game database operations
 */

export const createGame2048ScoresTable = async () => {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabase
      .from("game2048_scores")
      .select("id")
      .limit(1);

    // If table exists, return success
    if (!checkError) {
      console.log("game2048_scores table already exists");
      return { success: true, message: "Table already exists" };
    }

    // If table doesn't exist, we need to create it via SQL
    const createTableSQL = `
      -- Create game2048_scores table for tracking 2048 game scores and leaderboards
      CREATE TABLE IF NOT EXISTS public.game2048_scores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 0,
          moves INTEGER NOT NULL DEFAULT 0,
          time_taken INTEGER NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('classic', 'challenge', 'expert')),
          board_size INTEGER NOT NULL,
          target_reached INTEGER NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_game2048_scores_user_id ON public.game2048_scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_game2048_scores_difficulty ON public.game2048_scores(difficulty);
      CREATE INDEX IF NOT EXISTS idx_game2048_scores_score ON public.game2048_scores(score DESC);
      CREATE INDEX IF NOT EXISTS idx_game2048_scores_completed_at ON public.game2048_scores(completed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_game2048_scores_difficulty_score ON public.game2048_scores(difficulty, score DESC);

      -- Enable Row Level Security (RLS)
      ALTER TABLE public.game2048_scores ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "Users can insert their own 2048 scores" ON public.game2048_scores;
      CREATE POLICY "Users can insert their own 2048 scores" ON public.game2048_scores
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view their own 2048 scores" ON public.game2048_scores;
      CREATE POLICY "Users can view their own 2048 scores" ON public.game2048_scores
          FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view leaderboard 2048 scores" ON public.game2048_scores;
      CREATE POLICY "Users can view leaderboard 2048 scores" ON public.game2048_scores
          FOR SELECT USING (true);
    `;

    // Execute the SQL via RPC (if available) or handle gracefully
    console.log("Please execute the following SQL in your Supabase dashboard:");
    console.log(createTableSQL);

    return {
      success: false,
      message:
        "Table creation SQL generated. Please run in Supabase dashboard.",
      sql: createTableSQL,
    };
  } catch (error) {
    console.error("Error setting up game2048_scores table:", error);
    return { success: false, message: "Error checking table", error };
  }
};

export const insertGame2048Score = async (scoreData: {
  user_id: string;
  username: string;
  score: number;
  moves: number;
  time_taken: number;
  difficulty: "classic" | "challenge" | "expert";
  board_size: number;
  target_reached: number;
}) => {
  try {
    const { data, error } = await supabase
      .from("game2048_scores")
      .insert([scoreData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting 2048 score:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error inserting 2048 score:", error);
    return { success: false, error };
  }
};

export const getGame2048Leaderboard = async (
  difficulty?: "classic" | "challenge" | "expert",
  limit: number = 10,
) => {
  try {
    let query = supabase
      .from("game2048_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching 2048 leaderboard:", error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching 2048 leaderboard:", error);
    return { success: false, error };
  }
};

export const getUserGame2048Stats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("game2048_scores")
      .select("*")
      .eq("user_id", userId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error fetching user 2048 stats:", error);
      return { success: false, error };
    }

    // Calculate stats
    const scores = data || [];
    const bestScore = scores.length > 0 ? scores[0].score : 0;
    const totalGames = scores.length;
    const averageScore =
      totalGames > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames)
        : 0;

    const difficultyStats = {
      classic: scores.filter((s) => s.difficulty === "classic").length,
      challenge: scores.filter((s) => s.difficulty === "challenge").length,
      expert: scores.filter((s) => s.difficulty === "expert").length,
    };

    const highestTileReached =
      scores.length > 0 ? Math.max(...scores.map((s) => s.target_reached)) : 0;

    return {
      success: true,
      data: {
        scores,
        bestScore,
        totalGames,
        averageScore,
        difficultyStats,
        highestTileReached,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user 2048 stats:", error);
    return { success: false, error };
  }
};
