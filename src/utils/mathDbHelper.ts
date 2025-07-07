import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for Math game database operations
 */

export const createMathScoresTable = async () => {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabase
      .from("math_scores")
      .select("id")
      .limit(1);

    // If table exists, return success
    if (!checkError) {
      console.log("math_scores table already exists");
      return { success: true, message: "Table already exists" };
    }

    // If table doesn't exist, we need to create it via SQL
    const createTableSQL = `
      -- Create math_scores table for tracking Math Brain Puzzles game scores and leaderboards
      CREATE TABLE IF NOT EXISTS public.math_scores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 0,
          correct_answers INTEGER NOT NULL DEFAULT 0,
          total_questions INTEGER NOT NULL DEFAULT 0,
          time_taken INTEGER NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
          game_mode TEXT NOT NULL CHECK (game_mode IN ('practice', 'timed', 'endless')),
          max_streak INTEGER NOT NULL DEFAULT 0,
          hints_used INTEGER NOT NULL DEFAULT 0,
          skips_used INTEGER NOT NULL DEFAULT 0,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_math_scores_user_id ON public.math_scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_math_scores_difficulty ON public.math_scores(difficulty);
      CREATE INDEX IF NOT EXISTS idx_math_scores_game_mode ON public.math_scores(game_mode);
      CREATE INDEX IF NOT EXISTS idx_math_scores_score ON public.math_scores(score DESC);
      CREATE INDEX IF NOT EXISTS idx_math_scores_completed_at ON public.math_scores(completed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_math_scores_difficulty_mode_score ON public.math_scores(difficulty, game_mode, score DESC);

      -- Enable Row Level Security (RLS)
      ALTER TABLE public.math_scores ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "Users can insert their own math scores" ON public.math_scores;
      CREATE POLICY "Users can insert their own math scores" ON public.math_scores
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view their own math scores" ON public.math_scores;
      CREATE POLICY "Users can view their own math scores" ON public.math_scores
          FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can view leaderboard math scores" ON public.math_scores;
      CREATE POLICY "Users can view leaderboard math scores" ON public.math_scores
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
    console.error("Error setting up math_scores table:", error);
    return { success: false, message: "Error checking table", error };
  }
};

export const insertMathScore = async (scoreData: {
  user_id: string;
  username: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  game_mode: "practice" | "timed" | "endless";
  max_streak: number;
  hints_used: number;
  skips_used: number;
}) => {
  try {
    const { data, error } = await supabase
      .from("math_scores")
      .insert([scoreData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting math score:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error inserting math score:", error);
    return { success: false, error };
  }
};

export const getMathLeaderboard = async (
  difficulty?: "easy" | "medium" | "hard",
  gameMode?: "practice" | "timed" | "endless",
  limit: number = 50,
) => {
  try {
    let query = supabase
      .from("math_scores")
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
      console.error("Error fetching math leaderboard:", error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching math leaderboard:", error);
    return { success: false, error };
  }
};

export const getUserMathStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("math_scores")
      .select("*")
      .eq("user_id", userId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Error fetching user math stats:", error);
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

    const gameModeStats = {
      practice: scores.filter((s) => s.game_mode === "practice").length,
      timed: scores.filter((s) => s.game_mode === "timed").length,
      endless: scores.filter((s) => s.game_mode === "endless").length,
    };

    const bestStreak =
      scores.length > 0 ? Math.max(...scores.map((s) => s.max_streak)) : 0;

    const totalCorrectAnswers = scores.reduce(
      (sum, s) => sum + s.correct_answers,
      0,
    );
    const totalQuestions = scores.reduce(
      (sum, s) => sum + s.total_questions,
      0,
    );
    const overallAccuracy =
      totalQuestions > 0
        ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
        : 0;

    return {
      success: true,
      data: {
        scores,
        bestScore,
        totalGames,
        averageScore,
        difficultyStats,
        gameModeStats,
        bestStreak,
        overallAccuracy,
        totalCorrectAnswers,
        totalQuestions,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching user math stats:", error);
    return { success: false, error };
  }
};

export const getMathTopRecords = async () => {
  try {
    // Get top score for each difficulty/mode combination
    const difficulties = ["easy", "medium", "hard"];
    const modes = ["practice", "timed", "endless"];
    const topRecords = [];

    for (const difficulty of difficulties) {
      for (const mode of modes) {
        const { data, error } = await supabase
          .from("math_scores")
          .select("*")
          .eq("difficulty", difficulty)
          .eq("game_mode", mode)
          .order("score", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          topRecords.push(data[0]);
        }
      }
    }

    return { success: true, data: topRecords };
  } catch (error) {
    console.error("Unexpected error fetching math top records:", error);
    return { success: false, error };
  }
};
