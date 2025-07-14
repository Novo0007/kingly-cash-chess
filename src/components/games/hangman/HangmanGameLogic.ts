
export interface HangmanGameState {
  word: string;
  guessedWord: string[];
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  isGameOver: boolean;
  isWon: boolean;
  score: number;
  level: number;
  hint?: string;
  category: string;
  timeLeft: number;
  gameStartTime: number;
}

export interface HangmanScore {
  id?: string;
  user_id: string;
  username: string;
  score: number;
  level: number;
  words_solved: number;
  time_taken: number;
  created_at?: string;
}

export class HangmanGameLogic {
  private wordCategories = {
    animals: {
      easy: [
        { word: "CAT", hint: "A small pet that purrs" },
        { word: "DOG", hint: "Man's best friend" },
        { word: "BIRD", hint: "Can fly in the sky" },
        { word: "FISH", hint: "Lives in water" },
        { word: "BEAR", hint: "Large furry animal" },
      ],
      medium: [
        { word: "ELEPHANT", hint: "Largest land animal" },
        { word: "GIRAFFE", hint: "Has a very long neck" },
        { word: "PENGUIN", hint: "Black and white bird that can't fly" },
        { word: "DOLPHIN", hint: "Intelligent marine mammal" },
        { word: "BUTTERFLY", hint: "Colorful insect with wings" },
      ],
      hard: [
        { word: "RHINOCEROS", hint: "Large animal with a horn" },
        { word: "CHIMPANZEE", hint: "Our closest animal relative" },
        { word: "HIPPOPOTAMUS", hint: "Large water-loving African animal" },
        { word: "KANGAROO", hint: "Australian animal that hops" },
        { word: "CHAMELEON", hint: "Lizard that changes colors" },
      ],
    },
    technology: {
      easy: [
        { word: "PHONE", hint: "Device for calling people" },
        { word: "LAPTOP", hint: "Portable computer" },
        { word: "MOUSE", hint: "Computer pointing device" },
        { word: "WIFI", hint: "Wireless internet connection" },
        { word: "EMAIL", hint: "Digital message" },
      ],
      medium: [
        { word: "SMARTPHONE", hint: "Mobile device with apps" },
        { word: "BLUETOOTH", hint: "Short-range wireless technology" },
        { word: "ALGORITHM", hint: "Set of rules for solving problems" },
        { word: "DATABASE", hint: "Organized collection of data" },
        { word: "SOFTWARE", hint: "Computer programs" },
      ],
      hard: [
        {
          word: "CRYPTOCURRENCY",
          hint: "Digital currency secured by cryptography",
        },
        { word: "ARTIFICIAL", hint: "Made by humans, not natural" },
        { word: "BLOCKCHAIN", hint: "Distributed ledger technology" },
        { word: "CYBERSECURITY", hint: "Protection of digital systems" },
        { word: "QUANTUM", hint: "Related to very small particles" },
      ],
    },
    food: {
      easy: [
        { word: "PIZZA", hint: "Italian dish with cheese and toppings" },
        { word: "APPLE", hint: "Red or green fruit" },
        { word: "BREAD", hint: "Baked food made from flour" },
        { word: "CAKE", hint: "Sweet dessert for celebrations" },
        { word: "MILK", hint: "White drink from cows" },
      ],
      medium: [
        { word: "CHOCOLATE", hint: "Sweet brown confection" },
        { word: "SANDWICH", hint: "Food between two slices of bread" },
        { word: "SPAGHETTI", hint: "Long thin pasta" },
        { word: "HAMBURGER", hint: "Meat patty in a bun" },
        { word: "PANCAKE", hint: "Flat round breakfast food" },
      ],
      hard: [
        { word: "CAPPUCCINO", hint: "Italian coffee drink with foam" },
        { word: "QUESADILLA", hint: "Mexican dish with cheese in tortilla" },
        { word: "BRUSCHETTA", hint: "Italian appetizer with tomatoes" },
        { word: "RATATOUILLE", hint: "French vegetable stew" },
        { word: "GUACAMOLE", hint: "Mexican avocado dip" },
      ],
    },
  };

  private hangmanStages = [
    "", // 0 wrong guesses
    "  +---+\n      |\n      |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========", // Game over
  ];

  private getDifficultyLevel(level: number): "easy" | "medium" | "hard" {
    if (level <= 3) return "easy";
    if (level <= 6) return "medium";
    return "hard";
  }

  private getRandomWord(level: number): {
    word: string;
    hint: string;
    category: string;
  } {
    const categories = Object.keys(this.wordCategories);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const difficulty = this.getDifficultyLevel(level);

    const categoryWords =
      this.wordCategories[randomCategory as keyof typeof this.wordCategories][
        difficulty
      ];
    const randomWord =
      categoryWords[Math.floor(Math.random() * categoryWords.length)];

    return {
      word: randomWord.word,
      hint: randomWord.hint,
      category: randomCategory,
    };
  }

  public createNewGame(level: number = 1): HangmanGameState {
    const { word, hint, category } = this.getRandomWord(level);
    const maxWrongGuesses = 7; // Standard hangman has 7 stages
    const timeLimit = 180; // 3 minutes per word

    return {
      word,
      guessedWord: Array(word.length).fill("_"),
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses,
      isGameOver: false,
      isWon: false,
      score: 0,
      level,
      hint,
      category,
      timeLeft: timeLimit,
      gameStartTime: Date.now(),
    };
  }

  public makeGuess(
    gameState: HangmanGameState,
    letter: string,
  ): HangmanGameState {
    if (gameState.isGameOver || gameState.guessedLetters.includes(letter)) {
      return gameState;
    }

    const newGuessedLetters = [...gameState.guessedLetters, letter];
    const newGuessedWord = [...gameState.guessedWord];
    let newWrongGuesses = gameState.wrongGuesses;
    let newScore = gameState.score;

    if (gameState.word.includes(letter)) {
      // Correct guess
      for (let i = 0; i < gameState.word.length; i++) {
        if (gameState.word[i] === letter) {
          newGuessedWord[i] = letter;
        }
      }
      // Add points for correct guess
      newScore += 10 * gameState.level;
    } else {
      // Wrong guess
      newWrongGuesses++;
    }

    const isWon = !newGuessedWord.includes("_");
    const isGameOver = isWon || newWrongGuesses >= gameState.maxWrongGuesses;

    if (isWon) {
      // Bonus points for completing the word
      const timeBonus = Math.max(0, Math.floor(gameState.timeLeft / 10));
      const levelBonus = gameState.level * 50;
      newScore += levelBonus + timeBonus;
    }

    return {
      ...gameState,
      guessedWord: newGuessedWord,
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      isGameOver,
      isWon,
      score: newScore,
    };
  }

  public updateTimer(gameState: HangmanGameState): HangmanGameState {
    if (gameState.isGameOver || gameState.timeLeft <= 0) {
      return {
        ...gameState,
        timeLeft: 0,
        isGameOver: true,
        isWon: false,
      };
    }

    return {
      ...gameState,
      timeLeft: gameState.timeLeft - 1,
    };
  }

  public getHangmanDrawing(wrongGuesses: number): string {
    return this.hangmanStages[
      Math.min(wrongGuesses, this.hangmanStages.length - 1)
    ];
  }

  public getNextLevelGame(
    currentGameState: HangmanGameState,
  ): HangmanGameState {
    return this.createNewGame(currentGameState.level + 1);
  }

  public calculateFinalScore(gamesPlayed: HangmanGameState[]): {
    totalScore: number;
    wordsCompleted: number;
    averageTime: number;
    accuracy: number;
  } {
    const totalScore = gamesPlayed.reduce((sum, game) => sum + game.score, 0);
    const wordsCompleted = gamesPlayed.filter((game) => game.isWon).length;
    const totalGameTime = gamesPlayed.reduce((sum, game) => {
      const gameTime = (Date.now() - game.gameStartTime) / 1000;
      return sum + gameTime;
    }, 0);
    const averageTime =
      gamesPlayed.length > 0 ? totalGameTime / gamesPlayed.length : 0;

    const totalGuesses = gamesPlayed.reduce(
      (sum, game) => sum + game.guessedLetters.length,
      0,
    );
    const wrongGuesses = gamesPlayed.reduce(
      (sum, game) => sum + game.wrongGuesses,
      0,
    );
    const accuracy =
      totalGuesses > 0
        ? ((totalGuesses - wrongGuesses) / totalGuesses) * 100
        : 0;

    return {
      totalScore,
      wordsCompleted,
      averageTime,
      accuracy,
    };
  }

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
