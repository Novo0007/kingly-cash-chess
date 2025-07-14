export interface FourPicsLevel {
  id: string;
  level_number: number;
  word: string;
  image_urls: string[];
  difficulty: "easy" | "medium" | "hard";
  hint_letter_cost: number;
  hint_image_cost: number;
  hint_word_cost: number;
  coins_reward: number;
  created_at: string;
  updated_at: string;
}

export interface FourPicsProgress {
  id: string;
  user_id: string;
  current_level: number;
  total_levels_completed: number;
  total_coins_earned: number;
  total_coins_spent: number;
  total_hints_used: number;
  total_time_played: number;
  highest_level_reached: number;
  created_at: string;
  updated_at: string;
}

export interface FourPicsScore {
  id: string;
  user_id: string;
  level_id: string;
  level_number: number;
  word: string;
  attempts: number;
  hints_used: HintType[];
  time_taken: number;
  coins_spent: number;
  coins_earned: number;
  completed_at: string;
  created_at: string;
}

export type HintType = "letter" | "image" | "word";

export interface GameHint {
  type: HintType;
  cost: number;
  description: string;
  used: boolean;
}

export interface GameState {
  level: FourPicsLevel;
  userInput: string;
  attempts: number;
  hintsUsed: HintType[];
  startTime: number;
  timeElapsed: number;
  isCompleted: boolean;
  coinsSpent: number;
  availableHints: GameHint[];
  revealedLetters: Set<number>;
  highlightedImages: Set<number>;
  showWordLength: boolean;
}

export class FourPicsGameLogic {
  private gameState: GameState;
  private onStateChange?: (state: GameState) => void;
  private timer?: NodeJS.Timeout;

  constructor(
    level: FourPicsLevel,
    onStateChange?: (state: GameState) => void,
  ) {
    this.onStateChange = onStateChange;
    this.gameState = {
      level,
      userInput: "",
      attempts: 0,
      hintsUsed: [],
      startTime: Date.now(),
      timeElapsed: 0,
      isCompleted: false,
      coinsSpent: 0,
      availableHints: [
        {
          type: "letter",
          cost: level.hint_letter_cost,
          description: "Reveal a letter",
          used: false,
        },
        {
          type: "image",
          cost: level.hint_image_cost,
          description: "Highlight related images",
          used: false,
        },
        {
          type: "word",
          cost: level.hint_word_cost,
          description: "Show word length",
          used: false,
        },
      ],
      revealedLetters: new Set(),
      highlightedImages: new Set(),
      showWordLength: false,
    };

    this.startTimer();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.gameState.timeElapsed = Math.floor(
        (Date.now() - this.gameState.startTime) / 1000,
      );
      this.notifyStateChange();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState });
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public updateUserInput(input: string): void {
    if (this.gameState.isCompleted) return;

    this.gameState.userInput = input.toUpperCase();
    this.notifyStateChange();
  }

  public submitAnswer(): {
    success: boolean;
    message: string;
    coinsEarned?: number;
  } {
    if (this.gameState.isCompleted) {
      return { success: false, message: "Game already completed" };
    }

    this.gameState.attempts++;

    if (this.gameState.userInput.trim() === this.gameState.level.word) {
      this.gameState.isCompleted = true;
      this.stopTimer();

      // Calculate coins earned based on performance
      let coinsEarned = this.gameState.level.coins_reward;

      // Bonus for completing without hints
      if (this.gameState.hintsUsed.length === 0) {
        coinsEarned += 5;
      }

      // Bonus for completing quickly (under 30 seconds)
      if (this.gameState.timeElapsed < 30) {
        coinsEarned += 3;
      }

      // Bonus for fewer attempts
      if (this.gameState.attempts === 1) {
        coinsEarned += 2;
      }

      this.notifyStateChange();
      return {
        success: true,
        message: "Congratulations! You solved it!",
        coinsEarned,
      };
    } else {
      this.notifyStateChange();
      return {
        success: false,
        message: `Incorrect! Try again. (Attempt ${this.gameState.attempts})`,
      };
    }
  }

  public useHint(hintType: HintType): {
    success: boolean;
    message: string;
    cost: number;
  } {
    if (this.gameState.isCompleted) {
      return { success: false, message: "Game already completed", cost: 0 };
    }

    const hint = this.gameState.availableHints.find((h) => h.type === hintType);
    if (!hint) {
      return { success: false, message: "Invalid hint type", cost: 0 };
    }

    if (hint.used) {
      return { success: false, message: "Hint already used", cost: 0 };
    }

    // Mark hint as used
    hint.used = true;
    this.gameState.hintsUsed.push(hintType);
    this.gameState.coinsSpent += hint.cost;

    let message = "";

    switch (hintType) {
      case "letter":
        this.revealRandomLetter();
        message = "A letter has been revealed!";
        break;
      case "image":
        this.highlightRelevantImages();
        message = "Related images are highlighted!";
        break;
      case "word":
        this.gameState.showWordLength = true;
        message = `The word has ${this.gameState.level.word.length} letters!`;
        break;
    }

    this.notifyStateChange();
    return { success: true, message, cost: hint.cost };
  }

  private revealRandomLetter(): void {
    const word = this.gameState.level.word;
    const unrevealedPositions = [];

    for (let i = 0; i < word.length; i++) {
      if (!this.gameState.revealedLetters.has(i)) {
        unrevealedPositions.push(i);
      }
    }

    if (unrevealedPositions.length > 0) {
      const randomIndex =
        unrevealedPositions[
          Math.floor(Math.random() * unrevealedPositions.length)
        ];
      this.gameState.revealedLetters.add(randomIndex);
    }
  }

  private highlightRelevantImages(): void {
    // Highlight all images for now (in a real game, you might want more sophisticated logic)
    for (let i = 0; i < this.gameState.level.image_urls.length; i++) {
      this.gameState.highlightedImages.add(i);
    }
  }

  public getHintStatus(hintType: HintType): {
    available: boolean;
    cost: number;
    used: boolean;
  } {
    const hint = this.gameState.availableHints.find((h) => h.type === hintType);
    if (!hint) {
      return { available: false, cost: 0, used: true };
    }
    return { available: !hint.used, cost: hint.cost, used: hint.used };
  }

  public getWordWithRevealedLetters(): string {
    const word = this.gameState.level.word;
    return word
      .split("")
      .map((letter, index) => {
        if (this.gameState.revealedLetters.has(index)) {
          return letter;
        }
        return "_";
      })
      .join(" ");
  }

  public getCompletionStats(): {
    attempts: number;
    timeElapsed: number;
    hintsUsed: number;
    coinsSpent: number;
    difficulty: string;
  } {
    return {
      attempts: this.gameState.attempts,
      timeElapsed: this.gameState.timeElapsed,
      hintsUsed: this.gameState.hintsUsed.length,
      coinsSpent: this.gameState.coinsSpent,
      difficulty: this.gameState.level.difficulty,
    };
  }

  public cleanup(): void {
    this.stopTimer();
  }

  public resetGame(): void {
    this.stopTimer();
    this.gameState = {
      ...this.gameState,
      userInput: "",
      attempts: 0,
      hintsUsed: [],
      startTime: Date.now(),
      timeElapsed: 0,
      isCompleted: false,
      coinsSpent: 0,
      availableHints: [
        {
          type: "letter",
          cost: this.gameState.level.hint_letter_cost,
          description: "Reveal a letter",
          used: false,
        },
        {
          type: "image",
          cost: this.gameState.level.hint_image_cost,
          description: "Highlight related images",
          used: false,
        },
        {
          type: "word",
          cost: this.gameState.level.hint_word_cost,
          description: "Show word length",
          used: false,
        },
      ],
      revealedLetters: new Set(),
      highlightedImages: new Set(),
      showWordLength: false,
    };
    this.startTimer();
    this.notifyStateChange();
  }

  public static generateAlphabet(): string[] {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  }

  public static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public static getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  public static getDifficultyDescription(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "Simple words, clear images";
      case "medium":
        return "Moderate challenge, some abstract concepts";
      case "hard":
        return "Complex words, challenging imagery";
      default:
        return "Unknown difficulty";
    }
  }

  public static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}
