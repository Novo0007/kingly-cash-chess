import { supabase } from "@/integrations/supabase/client";
import { MathLevel, LevelProgress } from "./MathLevelSystem";

export interface SupabaseMathProgress {
  id: string;
  user_id: string;
  current_level: number;
  highest_level_reached: number;
  total_score: number;
  total_questions_answered: number;
  total_correct_answers: number;
  streak: number;
  longest_streak: number;
  last_played_at: string;
  created_at: string;
  updated_at: string;
}

export interface MathLevelCompletion {
  id: string;
  user_id: string;
  level_number: number;
  score: number;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  time_taken: number;
  points_multiplier: number;
  final_score: number;
  completed_at: string;
}

export interface MathGameSession {
  id: string;
  user_id: string;
  level_number: number;
  start_time: string;
  end_time?: string;
  questions_answered: number;
  correct_answers: number;
  score: number;
  eliminated: boolean;
  elimination_reason?: string;
  completed: boolean;
  game_data?: any;
}

export class MathLevelSystemSupabase {
  private levels: MathLevel[] = [];
  private progress: LevelProgress | null = null;
  private maxLevel = 99;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.initializeLevels();
  }

  private initializeLevels(): void {
    // Same level generation logic as original MathLevelSystem
    for (let i = 1; i <= this.maxLevel; i++) {
      const level = this.generateLevel(i);
      this.levels.push(level);
    }
  }

  private generateLevel(levelNumber: number): MathLevel {
    // Same logic as original MathLevelSystem.generateLevel()
    let difficulty: "easy" | "medium" | "hard";
    let baseOperations: MathLevel["operations"];

    if (levelNumber <= 20) {
      difficulty = "easy";
      baseOperations = ["addition", "subtraction"];
    } else if (levelNumber <= 60) {
      difficulty = "medium";
      baseOperations = [
        "addition",
        "subtraction",
        "multiplication",
        "division",
      ];
    } else {
      difficulty = "hard";
      baseOperations = [
        "addition",
        "subtraction",
        "multiplication",
        "division",
        "missing",
        "pattern",
      ];
    }

    let operations = [...baseOperations];
    if (levelNumber > 10 && !operations.includes("multiplication")) {
      operations.push("multiplication");
    }
    if (levelNumber > 15 && !operations.includes("division")) {
      operations.push("division");
    }
    if (levelNumber > 30 && !operations.includes("missing")) {
      operations.push("missing");
    }
    if (levelNumber > 50 && !operations.includes("pattern")) {
      operations.push("pattern");
    }

    const baseTime =
      difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 8;
    const timeReduction = Math.floor(levelNumber / 10);
    const timePerQuestion = Math.max(5, baseTime - timeReduction);
    const questionsRequired = Math.min(20, 3 + Math.floor(levelNumber / 5));
    const eliminationMode = levelNumber > 20;
    const maxErrors = eliminationMode
      ? 0
      : Math.max(1, 3 - Math.floor(levelNumber / 10));
    const pointsMultiplier = 1 + (levelNumber - 1) * 0.1;

    const { name, description } = this.generateLevelNameAndDescription(
      levelNumber,
      difficulty,
      eliminationMode,
    );

    return {
      level: levelNumber,
      name,
      description,
      questionsRequired,
      timePerQuestion,
      difficulty,
      eliminationMode,
      pointsMultiplier,
      maxErrors,
      unlocked: levelNumber === 1,
      operations,
    };
  }

  private generateLevelNameAndDescription(
    level: number,
    difficulty: string,
    eliminationMode: boolean,
  ): { name: string; description: string } {
    // Same logic as original MathLevelSystem
    const themes = [
      { name: "Arithmetic Academy", desc: "Master the basics of calculation" },
      {
        name: "Number Navigator",
        desc: "Navigate through numerical challenges",
      },
      { name: "Math Warrior", desc: "Battle against complex problems" },
      {
        name: "Calculation Champion",
        desc: "Prove your computational prowess",
      },
      {
        name: "Logic Master",
        desc: "Master the art of mathematical reasoning",
      },
      { name: "Pattern Seeker", desc: "Discover hidden mathematical patterns" },
      { name: "Speed Calculator", desc: "Calculate at lightning speed" },
      { name: "Brain Challenger", desc: "Challenge your mental abilities" },
      { name: "Math Genius", desc: "Showcase your mathematical genius" },
      { name: "Ultimate Solver", desc: "Solve the ultimate math challenges" },
    ];

    const milestoneNames = {
      1: "Getting Started",
      5: "First Steps",
      10: "Building Momentum",
      15: "Making Progress",
      20: "Reaching Heights",
      25: "Advanced Player",
      30: "Math Expert",
      40: "Calculation Master",
      50: "Logic Genius",
      60: "Pattern Expert",
      70: "Speed Demon",
      80: "Math Wizard",
      90: "Ultimate Challenger",
      99: "Grand Master",
    };

    const milestoneName = milestoneNames[level as keyof typeof milestoneNames];
    if (milestoneName) {
      return {
        name: `Level ${level}: ${milestoneName}`,
        description: eliminationMode
          ? `${milestoneName} - No mistakes allowed! One wrong answer eliminates you.`
          : `${milestoneName} - Build your foundation with ${difficulty} difficulty.`,
      };
    }

    const themeIndex = Math.floor((level - 1) / 10) % themes.length;
    const theme = themes[themeIndex];

    return {
      name: `Level ${level}: ${theme.name}`,
      description: eliminationMode
        ? `${theme.desc} - Elimination mode: One mistake ends the game!`
        : `${theme.desc} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty.`,
    };
  }

  // Database operations
  public async initializeUserProgress(): Promise<LevelProgress | null> {
    try {
      // Initialize progress in database if it doesn't exist
      const { data, error } = await supabase.rpc("initialize_math_progress", {
        target_user_id: this.userId,
      });

      if (error) {
        console.error("Error initializing math progress:", error);
        return null;
      }

      // Fetch user progress
      const progressData = await this.fetchUserProgress();
      return progressData;
    } catch (error) {
      console.error("Error in initializeUserProgress:", error);
      return null;
    }
  }

  public async fetchUserProgress(): Promise<LevelProgress | null> {
    try {
      const { data, error } = await supabase
        .from("math_user_progress")
        .select("*")
        .eq("user_id", this.userId)
        .single();

      if (error) {
        console.error("Error fetching math progress:", error);
        return null;
      }

      if (!data) return null;

      // Fetch completed levels
      const { data: completions, error: completionsError } = await supabase
        .from("math_level_completions")
        .select("level_number")
        .eq("user_id", this.userId);

      if (completionsError) {
        console.error("Error fetching level completions:", completionsError);
      }

      const levelsCompleted = completions?.map((c) => c.level_number) || [];

      const progress: LevelProgress = {
        currentLevel: data.current_level,
        highestLevelReached: data.highest_level_reached,
        totalScore: data.total_score,
        totalQuestionsAnswered: data.total_questions_answered,
        totalCorrectAnswers: data.total_correct_answers,
        streak: data.streak,
        longestStreak: data.longest_streak,
        levelsCompleted,
        lastPlayedAt: data.last_played_at,
      };

      this.progress = progress;
      this.updateUnlockedLevels();
      return progress;
    } catch (error) {
      console.error("Error in fetchUserProgress:", error);
      return null;
    }
  }

  public async startGameSession(levelNumber: number): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc("start_math_session", {
        target_user_id: this.userId,
        level_num: levelNumber,
      });

      if (error) {
        console.error("Error starting game session:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in startGameSession:", error);
      return null;
    }
  }

  public async endGameSession(
    sessionId: string,
    questionsAnswered: number,
    correctAnswers: number,
    score: number,
    eliminated: boolean = false,
    eliminationReason?: string,
    gameData?: any,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("end_math_session", {
        session_uuid: sessionId,
        questions_count: questionsAnswered,
        correct_count: correctAnswers,
        session_score: score,
        was_eliminated: eliminated,
        elimination_reason: eliminationReason,
        session_data: gameData,
      });

      if (error) {
        console.error("Error ending game session:", error);
        return false;
      }

      return data;
    } catch (error) {
      console.error("Error in endGameSession:", error);
      return false;
    }
  }

  public async completeLevel(
    levelNumber: number,
    score: number,
    questionsAnswered: number,
    correctAnswers: number,
    timeSpent: number,
  ): Promise<boolean> {
    try {
      const level = this.getLevel(levelNumber);
      if (!level) return false;

      const { data, error } = await supabase.rpc("complete_math_level", {
        target_user_id: this.userId,
        level_num: levelNumber,
        level_score: score,
        questions_count: questionsAnswered,
        correct_count: correctAnswers,
        time_seconds: timeSpent,
        multiplier: level.pointsMultiplier,
      });

      if (error) {
        console.error("Error completing level:", error);
        return false;
      }

      // Refresh progress after completion
      await this.fetchUserProgress();
      return data;
    } catch (error) {
      console.error("Error in completeLevel:", error);
      return false;
    }
  }

  public async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc("get_top_math_users", {
        limit_count: limit,
      });

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getLeaderboard:", error);
      return [];
    }
  }

  public async getUserRank(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc("get_user_math_rank", {
        target_user_id: this.userId,
      });

      if (error) {
        console.error("Error fetching user rank:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("Error in getUserRank:", error);
      return 0;
    }
  }

  // Local methods (same as original)
  private updateUnlockedLevels(): void {
    if (!this.progress) return;

    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      level.unlocked = level.level <= this.progress.highestLevelReached + 1;
    }
  }

  public getLevel(levelNumber: number): MathLevel | null {
    return this.levels.find((l) => l.level === levelNumber) || null;
  }

  public getCurrentLevel(): MathLevel | null {
    if (!this.progress) return null;
    return this.getLevel(this.progress.currentLevel);
  }

  public getUnlockedLevels(): MathLevel[] {
    return this.levels.filter((l) => l.unlocked);
  }

  public getAllLevels(): MathLevel[] {
    return [...this.levels];
  }

  public getProgress(): LevelProgress | null {
    return this.progress ? { ...this.progress } : null;
  }

  public setCurrentLevel(levelNumber: number): boolean {
    if (!this.progress) return false;

    const level = this.getLevel(levelNumber);
    if (!level || !level.unlocked) {
      return false;
    }

    this.progress.currentLevel = levelNumber;
    this.progress.lastPlayedAt = new Date().toISOString();
    return true;
  }

  public getAccuracy(): number {
    if (!this.progress || this.progress.totalQuestionsAnswered === 0) return 0;
    return (
      this.progress.totalCorrectAnswers / this.progress.totalQuestionsAnswered
    );
  }

  public getLevelProgress(levelNumber: number): {
    completed: boolean;
    unlocked: boolean;
  } {
    if (!this.progress) return { completed: false, unlocked: false };

    const level = this.getLevel(levelNumber);
    return {
      completed: this.progress.levelsCompleted.includes(levelNumber),
      unlocked: level?.unlocked || false,
    };
  }

  public getCompletionRate(): number {
    if (!this.progress) return 0;
    return this.progress.levelsCompleted.length / this.maxLevel;
  }

  public getRankTitle(): string {
    const completionRate = this.getCompletionRate();
    const accuracy = this.getAccuracy();

    if (completionRate >= 1.0 && accuracy >= 0.95) return "🏆 Grandmaster";
    if (completionRate >= 0.9 && accuracy >= 0.9) return "👑 Master";
    if (completionRate >= 0.8 && accuracy >= 0.85) return "⭐ Expert";
    if (completionRate >= 0.6 && accuracy >= 0.8) return "🔥 Advanced";
    if (completionRate >= 0.4 && accuracy >= 0.75) return "📈 Skilled";
    if (completionRate >= 0.2 && accuracy >= 0.7) return "🎯 Intermediate";
    if (completionRate >= 0.1 && accuracy >= 0.6) return "📚 Beginner";
    return "🌱 Novice";
  }
}
