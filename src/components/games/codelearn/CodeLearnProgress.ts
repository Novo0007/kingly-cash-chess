import {
  UserProgress,
  LanguageProgress,
  Achievement,
  CodeSession,
  DEFAULT_ACHIEVEMENTS,
  CoinTransaction,
  CoinReward,
} from "./CodeLearnTypes";

export class CodeLearnProgressManager {
  private static instance: CodeLearnProgressManager;
  private userProgress: UserProgress | null = null;

  public static getInstance(): CodeLearnProgressManager {
    if (!CodeLearnProgressManager.instance) {
      CodeLearnProgressManager.instance = new CodeLearnProgressManager();
    }
    return CodeLearnProgressManager.instance;
  }

  public initializeUserProgress(userId: string): UserProgress {
    const today = new Date().toISOString().split("T")[0];

    this.userProgress = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0,
      totalCoins: 0,
      availableCoins: 0,
      coinsSpent: 0,
      level: 1,
      completedLessons: 0,
      totalTimeSpent: 0,
      lastActiveDate: today,
      languageProgress: {},
      achievements: DEFAULT_ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
      })),
      dailyGoalXP: 100,
      todayXP: 0,
      dailyGoalCoins: 50,
      todayCoins: 0,
    };

    this.loadProgressFromStorage(userId);
    return this.userProgress;
  }

  public getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  public updateProgress(session: CodeSession): void {
    if (!this.userProgress) return;

    const today = new Date().toISOString().split("T")[0];
    const isNewDay = this.userProgress.lastActiveDate !== today;

    // Update streak
    if (isNewDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (this.userProgress.lastActiveDate === yesterdayStr) {
        this.userProgress.currentStreak++;
      } else {
        this.userProgress.currentStreak = 1;
      }

      this.userProgress.longestStreak = Math.max(
        this.userProgress.longestStreak,
        this.userProgress.currentStreak,
      );

      this.userProgress.lastActiveDate = today;
      this.userProgress.todayXP = 0;
      this.userProgress.todayCoins = 0;
    }

    // Update XP and level
    this.userProgress.totalXP += session.xpEarned;
    this.userProgress.todayXP += session.xpEarned;
    this.userProgress.level = this.calculateLevel(this.userProgress.totalXP);

    // Update coins
    this.userProgress.totalCoins += session.coinsEarned;
    this.userProgress.availableCoins += session.coinsEarned;
    this.userProgress.todayCoins += session.coinsEarned;

    // Update session stats
    this.userProgress.completedLessons++;
    this.userProgress.totalTimeSpent += session.timeSpent;

    // Update language-specific progress
    this.updateLanguageProgress(session);

    // Check for achievements
    this.checkAchievements(session);

    // Save to storage
    this.saveProgressToStorage();
  }

  private updateLanguageProgress(session: CodeSession): void {
    if (!this.userProgress) return;

    const lesson = this.getLessonById(session.lessonId);
    if (!lesson) return;

    const languageId = lesson.languageId;

    if (!this.userProgress.languageProgress[languageId]) {
      this.userProgress.languageProgress[languageId] = {
        languageId,
        level: 1,
        xp: 0,
        coins: 0,
        completedUnits: 0,
        totalUnits: this.getTotalUnitsForLanguage(languageId),
        completedLessons: 0,
        totalLessons: this.getTotalLessonsForLanguage(languageId),
        accuracy: 0,
        currentUnit: this.getFirstUnitForLanguage(languageId),
        timeSpent: 0,
        startDate: new Date().toISOString().split("T")[0],
        lastActiveDate: new Date().toISOString().split("T")[0],
      };
    }

    const langProgress = this.userProgress.languageProgress[languageId];
    langProgress.xp += session.xpEarned;
    langProgress.coins += session.coinsEarned;
    langProgress.completedLessons++;
    langProgress.timeSpent += session.timeSpent;
    langProgress.lastActiveDate = new Date().toISOString().split("T")[0];

    // Calculate accuracy (weighted average)
    const totalSessions = langProgress.completedLessons;
    const newAccuracy = session.accuracy;
    langProgress.accuracy =
      (langProgress.accuracy * (totalSessions - 1) + newAccuracy) /
      totalSessions;

    langProgress.level = this.calculateLevel(langProgress.xp);
  }

  private checkAchievements(session: CodeSession): void {
    if (!this.userProgress) return;

    this.userProgress.achievements.forEach((achievement) => {
      if (achievement.isUnlocked) return;

      let shouldUnlock = false;
      let progress = achievement.progress;

      switch (achievement.requirement.type) {
        case "lessons-completed":
          progress = this.userProgress!.completedLessons;
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "daily-streak":
          progress = this.userProgress!.currentStreak;
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "perfect-lessons":
          if (session.accuracy === 1.0) {
            progress = achievement.progress + 1;
          }
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "fast-completion":
          if (session.timeSpent <= 180) {
            // 3 minutes
            progress = achievement.progress + 1;
          }
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "languages-tried":
          const languagesTried = Object.keys(
            this.userProgress!.languageProgress,
          ).length;
          progress = languagesTried;
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "units-completed":
          const totalUnitsCompleted = Object.values(
            this.userProgress!.languageProgress,
          ).reduce((sum, lang) => sum + lang.completedUnits, 0);
          progress = totalUnitsCompleted;
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "coins-earned":
          progress = this.userProgress!.totalCoins;
          shouldUnlock = progress >= achievement.requirement.value;
          break;

        case "coins-spent":
          progress = this.userProgress!.coinsSpent;
          shouldUnlock = progress >= achievement.requirement.value;
          break;
      }

      achievement.progress = progress;

      if (shouldUnlock && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        this.userProgress!.totalXP += achievement.xpReward;
        this.userProgress!.totalCoins += achievement.coinReward;
        this.userProgress!.availableCoins += achievement.coinReward;

        // Show achievement notification
        this.showAchievementNotification(achievement);
      }
    });
  }

  private showAchievementNotification(achievement: Achievement): void {
    // This would trigger a notification in the UI
    console.log(`🏆 Achievement Unlocked: ${achievement.title}!`);

    // You could emit an event here that the UI listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("achievementUnlocked", {
          detail: achievement,
        }),
      );
    }
  }

  public calculateLevel(xp: number): number {
    // XP needed for each level increases exponentially
    // Level 1: 0-100 XP
    // Level 2: 100-250 XP
    // Level 3: 250-450 XP
    // And so on...

    let level = 1;
    let xpNeeded = 0;
    let increment = 100;

    while (xp >= xpNeeded + increment) {
      xpNeeded += increment;
      level++;
      increment = Math.floor(increment * 1.2); // 20% increase each level
    }

    return level;
  }

  public getXPForNextLevel(currentXP: number): {
    current: number;
    needed: number;
    total: number;
  } {
    const currentLevel = this.calculateLevel(currentXP);

    let xpForCurrentLevel = 0;
    let increment = 100;

    for (let i = 1; i < currentLevel; i++) {
      xpForCurrentLevel += increment;
      increment = Math.floor(increment * 1.2);
    }

    const xpForNextLevel = xpForCurrentLevel + increment;

    return {
      current: currentXP - xpForCurrentLevel,
      needed: increment,
      total: increment,
    };
  }

  public getDailyGoalProgress(): {
    current: number;
    goal: number;
    percentage: number;
  } {
    if (!this.userProgress) return { current: 0, goal: 100, percentage: 0 };

    const current = this.userProgress.todayXP;
    const goal = this.userProgress.dailyGoalXP;
    const percentage = Math.min((current / goal) * 100, 100);

    return { current, goal, percentage };
  }

  public getStreakInfo(): {
    current: number;
    longest: number;
    daysUntilMilestone: number;
  } {
    if (!this.userProgress)
      return { current: 0, longest: 0, daysUntilMilestone: 0 };

    const current = this.userProgress.currentStreak;
    const longest = this.userProgress.longestStreak;

    // Calculate days until next streak milestone
    const milestones = [3, 7, 14, 30, 50, 100];
    const nextMilestone = milestones.find((m) => m > current) || current + 50;
    const daysUntilMilestone = nextMilestone - current;

    return { current, longest, daysUntilMilestone };
  }

  public getUnlockedAchievements(): Achievement[] {
    if (!this.userProgress) return [];
    return this.userProgress.achievements.filter((a) => a.isUnlocked);
  }

  public getAchievementProgress(): Achievement[] {
    if (!this.userProgress) return [];
    return this.userProgress.achievements.filter(
      (a) => !a.isUnlocked && a.progress > 0,
    );
  }

  // Coin-related methods
  public spendCoins(amount: number, source: string, sourceId: string): boolean {
    if (!this.userProgress || this.userProgress.availableCoins < amount) {
      return false;
    }

    this.userProgress.availableCoins -= amount;
    this.userProgress.coinsSpent += amount;

    // Record transaction
    this.recordCoinTransaction({
      id: this.generateTransactionId(),
      userId: this.userProgress.userId,
      type: "spent",
      amount: -amount,
      source: source as any,
      sourceId,
      description: `Spent ${amount} coins on ${source}`,
      timestamp: new Date().toISOString(),
    });

    this.saveProgressToStorage();
    return true;
  }

  public earnCoins(
    amount: number,
    source: string,
    sourceId: string,
    description?: string,
  ): void {
    if (!this.userProgress) return;

    this.userProgress.totalCoins += amount;
    this.userProgress.availableCoins += amount;
    this.userProgress.todayCoins += amount;

    // Record transaction
    this.recordCoinTransaction({
      id: this.generateTransactionId(),
      userId: this.userProgress.userId,
      type: "earned",
      amount,
      source: source as any,
      sourceId,
      description: description || `Earned ${amount} coins from ${source}`,
      timestamp: new Date().toISOString(),
    });

    this.saveProgressToStorage();
  }

  public getCoinBalance(): number {
    return this.userProgress?.availableCoins || 0;
  }

  public getTotalCoinsEarned(): number {
    return this.userProgress?.totalCoins || 0;
  }

  public getDailyCoinProgress(): {
    current: number;
    goal: number;
    percentage: number;
  } {
    if (!this.userProgress) return { current: 0, goal: 50, percentage: 0 };

    const current = this.userProgress.todayCoins;
    const goal = this.userProgress.dailyGoalCoins;
    const percentage = Math.min((current / goal) * 100, 100);

    return { current, goal, percentage };
  }

  private recordCoinTransaction(transaction: CoinTransaction): void {
    try {
      const transactions = this.getCoinTransactions();
      transactions.unshift(transaction); // Add to beginning

      // Keep only last 100 transactions
      const limitedTransactions = transactions.slice(0, 100);

      localStorage.setItem(
        `codelearn_transactions_${this.userProgress?.userId}`,
        JSON.stringify(limitedTransactions),
      );
    } catch (error) {
      console.error("Failed to record coin transaction:", error);
    }
  }

  public getCoinTransactions(): CoinTransaction[] {
    try {
      const transactions = localStorage.getItem(
        `codelearn_transactions_${this.userProgress?.userId}`,
      );
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error("Failed to get coin transactions:", error);
      return [];
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public calculateCoinReward(
    exercisePoints: number,
    accuracy: number,
    timeBonus: boolean = false,
    streakMultiplier: number = 1,
  ): CoinReward {
    // Base coin reward calculation
    let baseAmount = Math.floor(exercisePoints * 0.5);

    // Accuracy bonus
    if (accuracy >= 1.0) {
      baseAmount = Math.floor(baseAmount * 1.5); // 50% bonus for perfect
    } else if (accuracy >= 0.8) {
      baseAmount = Math.floor(baseAmount * 1.2); // 20% bonus for 80%+
    }

    // Time bonus
    if (timeBonus) {
      baseAmount = Math.floor(baseAmount * 1.3); // 30% bonus for quick completion
    }

    // Streak multiplier
    baseAmount = Math.floor(baseAmount * streakMultiplier);

    return {
      amount: Math.max(baseAmount, 1), // Minimum 1 coin
      source: "exercise",
      multiplier: streakMultiplier,
      bonus: timeBonus || accuracy >= 1.0,
    };
  }

  private saveProgressToStorage(): void {
    if (!this.userProgress) return;

    try {
      localStorage.setItem(
        `codelearn_progress_${this.userProgress.userId}`,
        JSON.stringify(this.userProgress),
      );
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }

  private loadProgressFromStorage(userId: string): void {
    try {
      const saved = localStorage.getItem(`codelearn_progress_${userId}`);
      if (saved) {
        const savedProgress = JSON.parse(saved);
        this.userProgress = { ...this.userProgress!, ...savedProgress };
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage:", error);
    }
  }

  // Helper methods (these would normally query your data service)
  private getLessonById(lessonId: string): any {
    // This would get lesson from CodeLearnDataService
    return { languageId: "javascript" }; // Placeholder
  }

  private getTotalUnitsForLanguage(languageId: string): number {
    // This would get from CodeLearnDataService
    return 4; // Placeholder
  }

  private getTotalLessonsForLanguage(languageId: string): number {
    // This would get from CodeLearnDataService
    return 20; // Placeholder
  }

  private getFirstUnitForLanguage(languageId: string): string {
    // This would get from CodeLearnDataService
    return `${languageId}-basics`; // Placeholder
  }

  public resetProgress(): void {
    if (!this.userProgress) return;

    const userId = this.userProgress.userId;
    this.userProgress = this.initializeUserProgress(userId);
    localStorage.removeItem(`codelearn_progress_${userId}`);
  }

  public exportProgress(): string {
    if (!this.userProgress) return "{}";
    return JSON.stringify(this.userProgress, null, 2);
  }

  public importProgress(progressData: string): boolean {
    try {
      const imported = JSON.parse(progressData);
      this.userProgress = imported;
      this.saveProgressToStorage();
      return true;
    } catch (error) {
      console.error("Failed to import progress:", error);
      return false;
    }
  }
}
