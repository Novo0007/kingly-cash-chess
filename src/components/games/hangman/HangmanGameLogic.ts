export interface HangmanLevel {
  id: string;
  level_number: number;
  word: string;
  category: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  max_wrong_guesses: number;
  points_reward: number;
  time_limit?: number;
  created_at: string;
  updated_at: string;
}

export interface HangmanProgress {
  id: string;
  user_id: string;
  current_level: number;
  total_levels_completed: number;
  total_points_earned: number;
  total_wrong_guesses: number;
  total_time_played: number;
  highest_level_reached: number;
  words_guessed: number;
  perfect_games: number;
  created_at: string;
  updated_at: string;
}

export interface HangmanScore {
  id: string;
  user_id: string;
  level_id: string;
  level_number: number;
  word: string;
  category: string;
  guessed_letters: string[];
  wrong_guesses: number;
  time_taken: number;
  points_earned: number;
  is_perfect: boolean;
  completed_at: string;
  created_at: string;
}

export interface GameState {
  level: HangmanLevel;
  word: string;
  guessedLetters: Set<string>;
  wrongGuesses: string[];
  correctGuesses: string[];
  currentWordDisplay: string[];
  gameStatus: "playing" | "won" | "lost";
  startTime: number;
  timeElapsed: number;
  timeLimit?: number;
  isCompleted: boolean;
  score: number;
  hintsUsed: number;
  maxWrongGuesses: number;
}

export class HangmanGameLogic {
  private gameState: GameState;
  private onStateChange?: (state: GameState) => void;
  private timer?: NodeJS.Timeout;

  // Common word categories with varying difficulties
  private static WORD_CATEGORIES = {
    animals: {
      easy: ["CAT", "DOG", "PIG", "COW", "BEE", "ANT", "BAT", "FOX"],
      medium: [
        "TIGER",
        "HORSE",
        "SHEEP",
        "MOUSE",
        "SNAKE",
        "WHALE",
        "EAGLE",
        "ZEBRA",
      ],
      hard: [
        "ELEPHANT",
        "GIRAFFE",
        "RHINOCEROS",
        "PENGUIN",
        "BUTTERFLY",
        "CROCODILE",
      ],
    },
    fruits: {
      easy: ["APPLE", "GRAPE", "LEMON", "PEACH", "PLUM"],
      medium: ["BANANA", "ORANGE", "CHERRY", "MANGO", "PAPAYA"],
      hard: ["PINEAPPLE", "STRAWBERRY", "WATERMELON", "BLUEBERRY"],
    },
    colors: {
      easy: ["RED", "BLUE", "GREEN", "PINK", "GOLD"],
      medium: ["PURPLE", "YELLOW", "ORANGE", "SILVER", "BROWN"],
      hard: ["TURQUOISE", "MAGENTA", "CRIMSON", "LAVENDER"],
    },
    countries: {
      easy: ["USA", "UK", "CHINA", "JAPAN", "INDIA"],
      medium: ["FRANCE", "BRAZIL", "RUSSIA", "CANADA", "ITALY"],
      hard: ["SWITZERLAND", "NETHERLANDS", "AUSTRALIA", "ARGENTINA"],
    },
    sports: {
      easy: ["SOCCER", "TENNIS", "GOLF", "BOXING"],
      medium: ["BASKETBALL", "FOOTBALL", "BASEBALL", "CRICKET"],
      hard: ["BADMINTON", "VOLLEYBALL", "SWIMMING", "CYCLING"],
    },
  };

  constructor(level: HangmanLevel, onStateChange?: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.gameState = {
      level,
      word: level.word.toUpperCase(),
      guessedLetters: new Set(),
      wrongGuesses: [],
      correctGuesses: [],
      currentWordDisplay: level.word.split("").map(() => "_"),
      gameStatus: "playing",
      startTime: Date.now(),
      timeElapsed: 0,
      timeLimit: level.time_limit,
      isCompleted: false,
      score: 0,
      hintsUsed: 0,
      maxWrongGuesses: level.max_wrong_guesses,
    };

    this.startTimer();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.gameState.gameStatus === "playing") {
        this.gameState.timeElapsed = Math.floor(
          (Date.now() - this.gameState.startTime) / 1000,
        );

        // Check time limit
        if (
          this.gameState.timeLimit &&
          this.gameState.timeElapsed >= this.gameState.timeLimit
        ) {
          this.gameState.gameStatus = "lost";
          this.gameState.isCompleted = true;
          this.stopTimer();
        }

        this.notifyStateChange();
      }
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

  public guessLetter(letter: string): {
    success: boolean;
    message: string;
    isCorrect: boolean;
  } {
    if (this.gameState.isCompleted) {
      return {
        success: false,
        message: "Game already completed",
        isCorrect: false,
      };
    }

    const upperLetter = letter.toUpperCase();

    if (this.gameState.guessedLetters.has(upperLetter)) {
      return {
        success: false,
        message: "Letter already guessed!",
        isCorrect: false,
      };
    }

    if (!/^[A-Z]$/.test(upperLetter)) {
      return {
        success: false,
        message: "Please enter a valid letter!",
        isCorrect: false,
      };
    }

    this.gameState.guessedLetters.add(upperLetter);

    if (this.gameState.word.includes(upperLetter)) {
      // Correct guess
      this.gameState.correctGuesses.push(upperLetter);

      // Update word display
      for (let i = 0; i < this.gameState.word.length; i++) {
        if (this.gameState.word[i] === upperLetter) {
          this.gameState.currentWordDisplay[i] = upperLetter;
        }
      }

      // Check if word is complete
      if (!this.gameState.currentWordDisplay.includes("_")) {
        this.gameState.gameStatus = "won";
        this.gameState.isCompleted = true;
        this.gameState.score = this.calculateScore();
        this.stopTimer();
      }

      this.notifyStateChange();
      return {
        success: true,
        message: "Correct! Good guess!",
        isCorrect: true,
      };
    } else {
      // Wrong guess
      this.gameState.wrongGuesses.push(upperLetter);

      if (
        this.gameState.wrongGuesses.length >= this.gameState.maxWrongGuesses
      ) {
        this.gameState.gameStatus = "lost";
        this.gameState.isCompleted = true;
        this.stopTimer();
      }

      this.notifyStateChange();
      return {
        success: true,
        message: `Wrong! ${this.gameState.maxWrongGuesses - this.gameState.wrongGuesses.length} guesses remaining.`,
        isCorrect: false,
      };
    }
  }

  public useHint(): {
    success: boolean;
    message: string;
    letter?: string;
  } {
    if (this.gameState.isCompleted) {
      return { success: false, message: "Game already completed" };
    }

    // Find unguessed letters in the word
    const unguessedLetters = this.gameState.word
      .split("")
      .filter((letter) => !this.gameState.guessedLetters.has(letter))
      .filter((letter, index, array) => array.indexOf(letter) === index); // Remove duplicates

    if (unguessedLetters.length === 0) {
      return { success: false, message: "No more hints available!" };
    }

    // Reveal a random unguessed letter
    const randomLetter =
      unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
    this.gameState.hintsUsed++;

    // Automatically guess the letter
    const result = this.guessLetter(randomLetter);

    return {
      success: true,
      message: `Hint: The letter "${randomLetter}" is in the word!`,
      letter: randomLetter,
    };
  }

  private calculateScore(): number {
    let score = this.gameState.level.points_reward;

    // Bonus for fewer wrong guesses
    const wrongGuessBonus =
      (this.gameState.maxWrongGuesses - this.gameState.wrongGuesses.length) *
      10;
    score += wrongGuessBonus;

    // Time bonus (if time limit exists)
    if (this.gameState.timeLimit) {
      const timeBonus =
        Math.max(0, this.gameState.timeLimit - this.gameState.timeElapsed) * 2;
      score += timeBonus;
    }

    // Perfect game bonus (no wrong guesses)
    if (this.gameState.wrongGuesses.length === 0) {
      score += 50;
    }

    // Hint penalty
    score -= this.gameState.hintsUsed * 5;

    return Math.max(score, 0);
  }

  public getCompletionStats(): {
    word: string;
    category: string;
    guessedLetters: string[];
    wrongGuesses: number;
    timeElapsed: number;
    score: number;
    isPerfect: boolean;
    hintsUsed: number;
  } {
    return {
      word: this.gameState.word,
      category: this.gameState.level.category,
      guessedLetters: Array.from(this.gameState.guessedLetters),
      wrongGuesses: this.gameState.wrongGuesses.length,
      timeElapsed: this.gameState.timeElapsed,
      score: this.gameState.score,
      isPerfect:
        this.gameState.wrongGuesses.length === 0 &&
        this.gameState.hintsUsed === 0,
      hintsUsed: this.gameState.hintsUsed,
    };
  }

  public cleanup(): void {
    this.stopTimer();
  }

  public resetGame(): void {
    this.stopTimer();
    this.gameState = {
      ...this.gameState,
      guessedLetters: new Set(),
      wrongGuesses: [],
      correctGuesses: [],
      currentWordDisplay: this.gameState.level.word.split("").map(() => "_"),
      gameStatus: "playing",
      startTime: Date.now(),
      timeElapsed: 0,
      isCompleted: false,
      score: 0,
      hintsUsed: 0,
    };
    this.startTimer();
    this.notifyStateChange();
  }

  public getRemainingGuesses(): number {
    return this.gameState.maxWrongGuesses - this.gameState.wrongGuesses.length;
  }

  public getWordProgress(): string {
    return this.gameState.currentWordDisplay.join(" ");
  }

  public static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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

  public static generateRandomLevel(
    difficulty: "easy" | "medium" | "hard" = "medium",
  ): HangmanLevel {
    const categories = Object.keys(this.WORD_CATEGORIES);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const categoryWords =
      this.WORD_CATEGORIES[randomCategory as keyof typeof this.WORD_CATEGORIES][
        difficulty
      ];
    const randomWord =
      categoryWords[Math.floor(Math.random() * categoryWords.length)];

    const difficultySettings = {
      easy: { maxGuesses: 8, points: 10, timeLimit: 180 },
      medium: { maxGuesses: 6, points: 20, timeLimit: 120 },
      hard: { maxGuesses: 5, points: 30, timeLimit: 90 },
    };

    const settings = difficultySettings[difficulty];

    return {
      id: `random-${Date.now()}`,
      level_number: 1,
      word: randomWord,
      category: randomCategory,
      hint: `A ${difficulty} ${randomCategory.slice(0, -1)} word`,
      difficulty,
      max_wrong_guesses: settings.maxGuesses,
      points_reward: settings.points,
      time_limit: settings.timeLimit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  public static getHangmanDrawing(wrongGuesses: number): string[] {
    const drawings = [
      // 0 wrong guesses
      [
        "  +---+",
        "  |   |",
        "      |",
        "      |",
        "      |",
        "      |",
        "=========",
      ],
      // 1 wrong guess
      [
        "  +---+",
        "  |   |",
        "  O   |",
        "      |",
        "      |",
        "      |",
        "=========",
      ],
      // 2 wrong guesses
      [
        "  +---+",
        "  |   |",
        "  O   |",
        "  |   |",
        "      |",
        "      |",
        "=========",
      ],
      // 3 wrong guesses
      [
        "  +---+",
        "  |   |",
        "  O   |",
        " /|   |",
        "      |",
        "      |",
        "=========",
      ],
      // 4 wrong guesses
      [
        "  +---+",
        "  |   |",
        "  O   |",
        " /|\\  |",
        "      |",
        "      |",
        "=========",
      ],
      // 5 wrong guesses
      [
        "  +---+",
        "  |   |",
        "  O   |",
        " /|\\  |",
        " /    |",
        "      |",
        "=========",
      ],
      // 6 wrong guesses (game over)
      [
        "  +---+",
        "  |   |",
        "  O   |",
        " /|\\  |",
        " / \\  |",
        "      |",
        "=========",
      ],
    ];

    return drawings[Math.min(wrongGuesses, drawings.length - 1)];
  }

  public static getAlphabet(): string[] {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  }
}
