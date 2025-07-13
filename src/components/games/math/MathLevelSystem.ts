export interface MathLevel {
  level: number;
  name: string;
  description: string;
  questionsRequired: number;
  timePerQuestion: number;
  difficulty: "easy" | "medium" | "hard";
  eliminationMode: boolean;
  pointsMultiplier: number;
  maxErrors: number;
  unlocked: boolean;
  operations: (
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division"
    | "missing"
    | "pattern"
  )[];
}

export interface LevelProgress {
  currentLevel: number;
  highestLevelReached: number;
  totalScore: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  streak: number;
  longestStreak: number;
  levelsCompleted: number[];
  lastPlayedAt: string;
}

export class MathLevelSystem {
  private levels: MathLevel[] = [];
  private progress: LevelProgress;
  private maxLevel = 99;

  constructor(savedProgress?: Partial<LevelProgress>) {
    this.initializeLevels();
    this.progress = {
      currentLevel: 1,
      highestLevelReached: 1,
      totalScore: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      streak: 0,
      longestStreak: 0,
      levelsCompleted: [],
      lastPlayedAt: new Date().toISOString(),
      ...savedProgress,
    };
    this.updateUnlockedLevels();
  }

  private initializeLevels(): void {
    // Generate 99 levels with progressive difficulty
    for (let i = 1; i <= this.maxLevel; i++) {
      const level = this.generateLevel(i);
      this.levels.push(level);
    }
  }

  private generateLevel(levelNumber: number): MathLevel {
    // Determine difficulty tier based on level
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

    // Add more operations as levels progress
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

    // Calculate time per question (gets harder as levels increase)
    const baseTime =
      difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 8;
    const timeReduction = Math.floor(levelNumber / 10);
    const timePerQuestion = Math.max(5, baseTime - timeReduction);

    // Questions required increases with level
    const questionsRequired = Math.min(20, 3 + Math.floor(levelNumber / 5));

    // Elimination mode starts at level 21
    const eliminationMode = levelNumber > 20;

    // Max errors allowed (elimination mode = 0 errors)
    const maxErrors = eliminationMode
      ? 0
      : Math.max(1, 3 - Math.floor(levelNumber / 10));

    // Points multiplier increases with level
    const pointsMultiplier = 1 + (levelNumber - 1) * 0.1;

    // Generate level name and description
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
      unlocked: levelNumber === 1, // Only first level unlocked by default
      operations,
    };
  }

  private generateLevelNameAndDescription(
    level: number,
    difficulty: string,
    eliminationMode: boolean,
  ): { name: string; description: string } {
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

    // Check for milestone names
    const milestoneName = milestoneNames[level as keyof typeof milestoneNames];
    if (milestoneName) {
      return {
        name: `Level ${level}: ${milestoneName}`,
        description: eliminationMode
          ? `${milestoneName} - No mistakes allowed! One wrong answer eliminates you.`
          : `${milestoneName} - Build your foundation with ${difficulty} difficulty.`,
      };
    }

    // Generate themed name based on level range
    const themeIndex = Math.floor((level - 1) / 10) % themes.length;
    const theme = themes[themeIndex];

    return {
      name: `Level ${level}: ${theme.name}`,
      description: eliminationMode
        ? `${theme.desc} - Elimination mode: One mistake ends the game!`
        : `${theme.desc} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty.`,
    };
  }

  private updateUnlockedLevels(): void {
    // Unlock levels based on progress
    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      // Unlock if it's within the reached level + 1
      level.unlocked = level.level <= this.progress.highestLevelReached + 1;
    }
  }

  public getLevel(levelNumber: number): MathLevel | null {
    return this.levels.find((l) => l.level === levelNumber) || null;
  }

  public getCurrentLevel(): MathLevel | null {
    return this.getLevel(this.progress.currentLevel);
  }

  public getUnlockedLevels(): MathLevel[] {
    return this.levels.filter((l) => l.unlocked);
  }

  public getAllLevels(): MathLevel[] {
    return [...this.levels];
  }

  public getProgress(): LevelProgress {
    return { ...this.progress };
  }

  public setCurrentLevel(levelNumber: number): boolean {
    const level = this.getLevel(levelNumber);
    if (!level || !level.unlocked) {
      return false;
    }

    this.progress.currentLevel = levelNumber;
    this.progress.lastPlayedAt = new Date().toISOString();
    return true;
  }

  public completeLevel(
    levelNumber: number,
    score: number,
    questionsAnswered: number,
    correctAnswers: number,
  ): boolean {
    const level = this.getLevel(levelNumber);
    if (!level) return false;

    // Check if level requirements are met
    const accuracyRequired = level.eliminationMode ? 1.0 : 0.6; // 100% for elimination, 60% for others
    const accuracy = correctAnswers / questionsAnswered;

    if (
      accuracy < accuracyRequired ||
      questionsAnswered < level.questionsRequired
    ) {
      return false;
    }

    // Update progress
    if (!this.progress.levelsCompleted.includes(levelNumber)) {
      this.progress.levelsCompleted.push(levelNumber);
    }

    // Update stats
    this.progress.totalScore += Math.floor(score * level.pointsMultiplier);
    this.progress.totalQuestionsAnswered += questionsAnswered;
    this.progress.totalCorrectAnswers += correctAnswers;

    // Update streak
    if (accuracy === 1.0) {
      this.progress.streak++;
      this.progress.longestStreak = Math.max(
        this.progress.longestStreak,
        this.progress.streak,
      );
    } else {
      this.progress.streak = 0;
    }

    // Unlock next level
    if (levelNumber >= this.progress.highestLevelReached) {
      this.progress.highestLevelReached = Math.min(
        this.maxLevel,
        levelNumber + 1,
      );
      this.progress.currentLevel = Math.min(this.maxLevel, levelNumber + 1);
      this.updateUnlockedLevels();
    }

    this.progress.lastPlayedAt = new Date().toISOString();
    return true;
  }

  public resetProgress(): void {
    this.progress = {
      currentLevel: 1,
      highestLevelReached: 1,
      totalScore: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      streak: 0,
      longestStreak: 0,
      levelsCompleted: [],
      lastPlayedAt: new Date().toISOString(),
    };
    this.updateUnlockedLevels();
  }

  public getAccuracy(): number {
    if (this.progress.totalQuestionsAnswered === 0) return 0;
    return (
      this.progress.totalCorrectAnswers / this.progress.totalQuestionsAnswered
    );
  }

  public getLevelProgress(levelNumber: number): {
    completed: boolean;
    unlocked: boolean;
  } {
    const level = this.getLevel(levelNumber);
    return {
      completed: this.progress.levelsCompleted.includes(levelNumber),
      unlocked: level?.unlocked || false,
    };
  }

  public getCompletionRate(): number {
    return this.progress.levelsCompleted.length / this.maxLevel;
  }

  public exportProgress(): string {
    return JSON.stringify(this.progress);
  }

  public importProgress(progressData: string): boolean {
    try {
      const data = JSON.parse(progressData);
      this.progress = { ...this.progress, ...data };
      this.updateUnlockedLevels();
      return true;
    } catch {
      return false;
    }
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
