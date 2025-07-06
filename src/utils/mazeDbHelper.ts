import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for maze game database operations
 */

export const createMazeScoresTable = async () => {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabase
      .from("maze_scores")
      .select("id")
      .limit(1);

    // If table exists, return success
    if (!checkError) {
      console.log("maze_scores table already exists");
      return { success: true, message: "Table already exists" };
    }

    // If table doesn't exist, we need to create it via SQL
    const createTableSQL = `
      -- Create maze_scores table for tracking maze game scores and leaderboards
      CREATE TABLE IF NOT EXISTS public.maze_scores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 0,
          time_taken INTEGER NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
          maze_size INTEGER NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_maze_scores_user_id ON public.maze_scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_maze_scores_difficulty ON public.maze_scores(difficulty);
      CREATE INDEX IF NOT EXISTS idx_maze_scores_score ON public.maze_scores(score DESC);
      CREATE INDEX IF NOT EXISTS idx_maze_scores_completed_at ON public.maze_scores(completed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_maze_scores_difficulty_score ON public.maze_scores(difficulty, score DESC);

      -- Enable Row Level Security (RLS)
      ALTER TABLE public.maze_scores ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "Users can insert their own maze scores" ON public.maze_scores;
      CREATE POLICY "Users can insert their own maze scores" ON public.maze_scores
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view their own maze scores" ON public.maze_scores;
      CREATE POLICY "Users can view their own maze scores" ON public.maze_scores
          FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view leaderboard maze scores" ON public.maze_scores;
      CREATE POLICY "Users can view leaderboard maze scores" ON public.maze_scores
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
    console.error("Error setting up maze_scores table:", error);
    return { success: false, message: "Error checking table", error };
  }
};

export const insertMazeScore = async (scoreData: {
  user_id: string;
  username: string;
  score: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  maze_size: number;
}) => {
  try {
    const { data, error } = await supabase
      .from("maze_scores")
      .insert([scoreData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting maze score:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error inserting maze score:", error);
    return { success: false, error };
  }
};

export const getMazeLeaderboard = async (
  difficulty?: "easy" | "medium" | "hard",
  limit: number = 10,
) => {
  try {
    let query = supabase
      .from("maze_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching maze leaderboard:", error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching maze leaderboard:", error);
    return { success: false, error };
  }
};

export const getUserMazeStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("maze_scores")
      .select("*")
      .eq("user_id", userId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error fetching user maze stats:", error);
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
      easy: scores.filter((s) => s.difficulty === "easy").length,
      medium: scores.filter((s) => s.difficulty === "medium").length,
      hard: scores.filter((s) => s.difficulty === "hard").length,
    };

    return {
      success: true,
      data: {
        scores,
        bestScore,
        totalGames,
        averageScore,
        difficultyStats,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user maze stats:", error);
    return { success: false, error };
  }
};
