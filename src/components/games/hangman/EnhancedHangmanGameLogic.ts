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
  streak: number;
  multiplier: number;
  powerUpsUsed: PowerUp[];
  availablePowerUps: PowerUp[];
  revealedPositions: number[];
  freezeTimeRemaining: number;
  doublePointsRemaining: number;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type:
    | "reveal_letter"
    | "extra_life"
    | "freeze_time"
    | "double_points"
    | "category_hint"
    | "vowel_reveal";
  duration?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  perfectGames: number;
  totalTimeSpent: number;
  streakRecord: number;
  wordsGuessed: number;
  categoriesMastered: string[];
  achievementsUnlocked: string[];
}

export class EnhancedHangmanGameLogic {
  private gameState: GameState;
  private onStateChange?: (state: GameState) => void;
  private timer?: NodeJS.Timeout;
  private powerUpTimer?: NodeJS.Timeout;

  // Enhanced word categories with more variety
  private static WORD_CATEGORIES = {
    animals: {
      easy: [
        "CAT",
        "DOG",
        "PIG",
        "COW",
        "BEE",
        "ANT",
        "BAT",
        "FOX",
        "OWL",
        "RAM",
      ],
      medium: [
        "TIGER",
        "HORSE",
        "SHEEP",
        "MOUSE",
        "SNAKE",
        "WHALE",
        "EAGLE",
        "ZEBRA",
        "PANDA",
        "KOALA",
      ],
      hard: [
        "ELEPHANT",
        "GIRAFFE",
        "RHINOCEROS",
        "PENGUIN",
        "BUTTERFLY",
        "CROCODILE",
        "KANGAROO",
        "HIPPOPOTAMUS",
      ],
      hints: {
        easy: "Small and common animals you might see every day",
        medium: "Wild animals from around the world",
        hard: "Exotic animals with unique characteristics",
      },
    },
    technology: {
      easy: ["PHONE", "MOUSE", "WIFI", "CODE", "DATA", "CHIP", "BYTE"],
      medium: [
        "LAPTOP",
        "ROUTER",
        "CODING",
        "SERVER",
        "BROWSER",
        "PYTHON",
        "GAMING",
      ],
      hard: [
        "ALGORITHM",
        "DATABASE",
        "PROGRAMMING",
        "CYBERSECURITY",
        "ARTIFICIAL",
        "BLOCKCHAIN",
      ],
      hints: {
        easy: "Basic tech items you use daily",
        medium: "Computer and internet related terms",
        hard: "Advanced technology and programming concepts",
      },
    },
    nature: {
      easy: ["TREE", "LEAF", "ROCK", "SAND", "RAIN", "SNOW", "WIND"],
      medium: [
        "FOREST",
        "RIVER",
        "MOUNTAIN",
        "DESERT",
        "OCEAN",
        "VALLEY",
        "CANYON",
      ],
      hard: [
        "ECOSYSTEM",
        "BIODIVERSITY",
        "PHOTOSYNTHESIS",
        "ATMOSPHERE",
        "GEOLOGICAL",
      ],
      hints: {
        easy: "Natural elements around us",
        medium: "Landscapes and natural formations",
        hard: "Scientific terms about nature",
      },
    },
    space: {
      easy: ["SUN", "MOON", "STAR", "MARS", "EARTH", "COMET"],
      medium: ["PLANET", "GALAXY", "ROCKET", "SATURN", "JUPITER", "NEBULA"],
      hard: [
        "CONSTELLATION",
        "SUPERNOVA",
        "TELESCOPE",
        "ASTRONAUT",
        "SPACECRAFT",
      ],
      hints: {
        easy: "Basic celestial bodies",
        medium: "Solar system objects",
        hard: "Advanced astronomy terms",
      },
    },
    sports: {
      easy: ["BALL", "GOAL", "TEAM", "GAME", "WIN", "PLAY", "RUN"],
      medium: [
        "SOCCER",
        "TENNIS",
        "BOXING",
        "HOCKEY",
        "RUGBY",
        "GOLF",
        "RACING",
      ],
      hard: [
        "BASKETBALL",
        "VOLLEYBALL",
        "BADMINTON",
        "SWIMMING",
        "ATHLETICS",
        "GYMNASTICS",
      ],
      hints: {
        easy: "Basic sports terms",
        medium: "Popular sports around the world",
        hard: "Olympic and competitive sports",
      },
    },
    food: {
      easy: ["BREAD", "MILK", "EGG", "RICE", "MEAT", "FISH", "CAKE"],
      medium: [
        "PIZZA",
        "BURGER",
        "PASTA",
        "SALAD",
        "CHEESE",
        "CHICKEN",
        "BANANA",
      ],
      hard: [
        "SPAGHETTI",
        "SANDWICH",
        "CHOCOLATE",
        "STRAWBERRY",
        "PINEAPPLE",
        "RESTAURANT",
      ],
      hints: {
        easy: "Basic food items",
        medium: "Popular dishes and ingredients",
        hard: "Complex foods and dining",
      },
    },
  };

  // Available power-ups
  private static POWER_UPS: PowerUp[] = [
    {
      id: "reveal_letter",
      name: "Reveal Letter",
      description: "Reveals a random unguessed letter",
      icon: "🔍",
      cost: 100,
      type: "reveal_letter",
    },
    {
      id: "extra_life",
      name: "Extra Life",
      description: "Adds one more wrong guess allowance",
      icon: "❤️",
      cost: 150,
      type: "extra_life",
    },
    {
      id: "freeze_time",
      name: "Freeze Time",
      description: "Stops the timer for 30 seconds",
      icon: "⏰",
      cost: 80,
      type: "freeze_time",
      duration: 30,
    },
    {
      id: "double_points",
      name: "Double Points",
      description: "Double points for 60 seconds",
      icon: "💰",
      cost: 120,
      type: "double_points",
      duration: 60,
    },
    {
      id: "category_hint",
      name: "Category Hint",
      description: "Shows detailed category hint",
      icon: "💡",
      cost: 50,
      type: "category_hint",
    },
    {
      id: "vowel_reveal",
      name: "Vowel Reveal",
      description: "Reveals all vowels in the word",
      icon: "🅰️",
      cost: 200,
      type: "vowel_reveal",
    },
  ];

  constructor(level: HangmanLevel, onStateChange?: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.gameState = this.initializeGameState(level);
    this.startTimer();
    this.startPowerUpTimer();
  }

  private initializeGameState(level: HangmanLevel): GameState {
    const wordArray = level.word.split("");
    const displayArray = wordArray.map(() => "_");

    return {
      level,
      word: level.word,
      guessedLetters: new Set(),
      wrongGuesses: [],
      correctGuesses: [],
      currentWordDisplay: displayArray,
      gameStatus: "playing",
      startTime: Date.now(),
      timeElapsed: 0,
      timeLimit: level.time_limit,
      isCompleted: false,
      score: 0,
      hintsUsed: 0,
      maxWrongGuesses: level.max_wrong_guesses,
      streak: 0,
      multiplier: 1,
      powerUpsUsed: [],
      availablePowerUps: [...EnhancedHangmanGameLogic.POWER_UPS],
      revealedPositions: [],
      freezeTimeRemaining: 0,
      doublePointsRemaining: 0,
    };
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.gameState.gameStatus === "playing") {
        if (this.gameState.freezeTimeRemaining > 0) {
          this.gameState.freezeTimeRemaining -= 1;
        } else {
          this.gameState.timeElapsed = Math.floor(
            (Date.now() - this.gameState.startTime) / 1000,
          );
        }

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

  private startPowerUpTimer(): void {
    this.powerUpTimer = setInterval(() => {
      if (this.gameState.doublePointsRemaining > 0) {
        this.gameState.doublePointsRemaining -= 1;
        if (this.gameState.doublePointsRemaining <= 0) {
          this.gameState.multiplier = 1;
        }
      }
      this.notifyStateChange();
    }, 1000);
  }

  public guessLetter(letter: string): {
    success: boolean;
    isCorrect: boolean;
    message: string;
  } {
    if (this.gameState.gameStatus !== "playing") {
      return {
        success: false,
        isCorrect: false,
        message: "Game is not active",
      };
    }

    const upperLetter = letter.toUpperCase();

    if (this.gameState.guessedLetters.has(upperLetter)) {
      return {
        success: false,
        isCorrect: false,
        message: "Letter already guessed!",
      };
    }

    this.gameState.guessedLetters.add(upperLetter);

    if (this.gameState.word.includes(upperLetter)) {
      this.gameState.correctGuesses.push(upperLetter);

      // Update word display
      for (let i = 0; i < this.gameState.word.length; i++) {
        if (this.gameState.word[i] === upperLetter) {
          this.gameState.currentWordDisplay[i] = upperLetter;
        }
      }

      // Calculate points based on letter frequency and multiplier
      const basePoints = this.calculateLetterPoints(upperLetter);
      const points = Math.floor(basePoints * this.gameState.multiplier);
      this.gameState.score += points;

      // Check if word is complete
      if (!this.gameState.currentWordDisplay.includes("_")) {
        this.gameState.gameStatus = "won";
        this.gameState.isCompleted = true;
        this.gameState.streak += 1;

        // Bonus points for completion
        const timeBonus = Math.max(0, 500 - this.gameState.timeElapsed * 10);
        const streakBonus = this.gameState.streak * 100;
        this.gameState.score += timeBonus + streakBonus;

        this.stopTimer();
      }

      this.notifyStateChange();
      return {
        success: true,
        isCorrect: true,
        message: `Great! +${points} points! ${this.gameState.multiplier > 1 ? "(Double Points!)" : ""}`,
      };
    } else {
      this.gameState.wrongGuesses.push(upperLetter);
      this.gameState.streak = 0; // Reset streak on wrong guess

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
        isCorrect: false,
        message: `Wrong! ${this.getRemainingGuesses()} guesses left`,
      };
    }
  }

  public usePowerUp(powerUpId: string): { success: boolean; message: string } {
    const powerUp = this.gameState.availablePowerUps.find(
      (p) => p.id === powerUpId,
    );

    if (!powerUp) {
      return { success: false, message: "Power-up not available" };
    }

    if (this.gameState.score < powerUp.cost) {
      return {
        success: false,
        message: `Need ${powerUp.cost} points to use this power-up`,
      };
    }

    this.gameState.score -= powerUp.cost;
    this.gameState.powerUpsUsed.push(powerUp);

    switch (powerUp.type) {
      case "reveal_letter":
        return this.revealRandomLetter();
      case "extra_life":
        this.gameState.maxWrongGuesses += 1;
        break;
      case "freeze_time":
        this.gameState.freezeTimeRemaining = powerUp.duration || 30;
        break;
      case "double_points":
        this.gameState.multiplier = 2;
        this.gameState.doublePointsRemaining = powerUp.duration || 60;
        break;
      case "vowel_reveal":
        return this.revealAllVowels();
      case "category_hint":
        return this.showCategoryHint();
    }

    this.notifyStateChange();
    return { success: true, message: `${powerUp.name} activated!` };
  }

  private revealRandomLetter(): { success: boolean; message: string } {
    const unrevealedIndices: number[] = [];

    for (let i = 0; i < this.gameState.word.length; i++) {
      if (this.gameState.currentWordDisplay[i] === "_") {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length === 0) {
      return { success: false, message: "No letters to reveal!" };
    }

    const randomIndex =
      unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const letter = this.gameState.word[randomIndex];

    // Reveal all instances of this letter
    for (let i = 0; i < this.gameState.word.length; i++) {
      if (this.gameState.word[i] === letter) {
        this.gameState.currentWordDisplay[i] = letter;
        this.gameState.revealedPositions.push(i);
      }
    }

    this.gameState.correctGuesses.push(letter);
    this.gameState.guessedLetters.add(letter);

    // Check if word is complete
    if (!this.gameState.currentWordDisplay.includes("_")) {
      this.gameState.gameStatus = "won";
      this.gameState.isCompleted = true;
      this.stopTimer();
    }

    return { success: true, message: `Revealed letter: ${letter}` };
  }

  private revealAllVowels(): { success: boolean; message: string } {
    const vowels = ["A", "E", "I", "O", "U"];
    let revealedAny = false;

    vowels.forEach((vowel) => {
      if (
        this.gameState.word.includes(vowel) &&
        !this.gameState.guessedLetters.has(vowel)
      ) {
        for (let i = 0; i < this.gameState.word.length; i++) {
          if (this.gameState.word[i] === vowel) {
            this.gameState.currentWordDisplay[i] = vowel;
            this.gameState.revealedPositions.push(i);
          }
        }
        this.gameState.correctGuesses.push(vowel);
        this.gameState.guessedLetters.add(vowel);
        revealedAny = true;
      }
    });

    if (!revealedAny) {
      return { success: false, message: "No vowels to reveal!" };
    }

    // Check if word is complete
    if (!this.gameState.currentWordDisplay.includes("_")) {
      this.gameState.gameStatus = "won";
      this.gameState.isCompleted = true;
      this.stopTimer();
    }

    return { success: true, message: "All vowels revealed!" };
  }

  private showCategoryHint(): { success: boolean; message: string } {
    const category = this.gameState.level.category;
    const difficulty = this.gameState.level.difficulty;

    const categoryData =
      EnhancedHangmanGameLogic.WORD_CATEGORIES[
        category as keyof typeof EnhancedHangmanGameLogic.WORD_CATEGORIES
      ];

    if (categoryData && categoryData.hints) {
      const hint =
        categoryData.hints[difficulty as keyof typeof categoryData.hints];
      return { success: true, message: hint };
    }

    return { success: true, message: `This word is related to: ${category}` };
  }

  private calculateLetterPoints(letter: string): number {
    // Points based on letter frequency (less common = more points)
    const letterValues: Record<string, number> = {
      E: 10,
      T: 10,
      A: 10,
      O: 10,
      I: 10,
      N: 10,
      S: 10,
      H: 10,
      R: 10,
      D: 15,
      L: 15,
      C: 15,
      U: 15,
      M: 20,
      W: 20,
      F: 20,
      G: 20,
      Y: 20,
      P: 20,
      B: 20,
      V: 25,
      K: 25,
      J: 25,
      X: 25,
      Q: 30,
      Z: 30,
    };

    return letterValues[letter] || 15;
  }

  public getRemainingGuesses(): number {
    return this.gameState.maxWrongGuesses - this.gameState.wrongGuesses.length;
  }

  public getWordProgress(): string {
    return this.gameState.currentWordDisplay.join(" ");
  }

  public getHangmanDrawing(wrongCount: number): string[] {
    const drawings = [
      ["", "", "", "", "", ""],
      ["  ____", "", "", "", "", ""],
      ["  ____", "  |   ", "", "", "", ""],
      ["  ____", "  |   |", "", "", "", ""],
      ["  ____", "  |   |", "  |   O", "", "", ""],
      ["  ____", "  |   |", "  |   O", "  |   |", "", ""],
      ["  ____", "  |   |", "  |   O", "  |  /|", "", ""],
      ["  ____", "  |   |", "  |   O", "  |  /|\\", "", ""],
      ["  ____", "  |   |", "  |   O", "  |  /|\\", "  |  /", ""],
      ["  ____", "  |   |", "  |   O", "  |  /|\\", "  |  / \\", ""],
    ];

    return drawings[Math.min(wrongCount, drawings.length - 1)];
  }

  public static getAlphabet(): string[] {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  }

  public static getDifficultyColor(difficulty: string): string {
    const colors = {
      easy: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      hard: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  public static generateRandomLevel(
    difficulty: "easy" | "medium" | "hard",
  ): HangmanLevel {
    const categories = Object.keys(EnhancedHangmanGameLogic.WORD_CATEGORIES);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const categoryData =
      EnhancedHangmanGameLogic.WORD_CATEGORIES[
        randomCategory as keyof typeof EnhancedHangmanGameLogic.WORD_CATEGORIES
      ];
    const words = categoryData[difficulty];
    const randomWord = words[Math.floor(Math.random() * words.length)];

    const difficultySettings = {
      easy: { maxGuesses: 8, timeLimit: 180, points: 100 },
      medium: { maxGuesses: 6, timeLimit: 120, points: 200 },
      hard: { maxGuesses: 5, timeLimit: 90, points: 300 },
    };

    const settings = difficultySettings[difficulty];

    return {
      id: `level_${Date.now()}`,
      level_number: 1,
      word: randomWord,
      category: randomCategory,
      hint: `A ${difficulty} word from ${randomCategory}`,
      difficulty,
      max_wrong_guesses: settings.maxGuesses,
      points_reward: settings.points,
      time_limit: settings.timeLimit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  public getCompletionStats() {
    return {
      word: this.gameState.word,
      score: this.gameState.score,
      timeElapsed: this.gameState.timeElapsed,
      wrongGuesses: this.gameState.wrongGuesses.length,
      hintsUsed: this.gameState.hintsUsed,
      powerUpsUsed: this.gameState.powerUpsUsed.length,
      streak: this.gameState.streak,
      isPerfect:
        this.gameState.wrongGuesses.length === 0 &&
        this.gameState.hintsUsed === 0 &&
        this.gameState.powerUpsUsed.length === 0,
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public resetGame(): void {
    this.stopTimer();
    const newLevel = EnhancedHangmanGameLogic.generateRandomLevel(
      this.gameState.level.difficulty,
    );
    this.gameState = this.initializeGameState(newLevel);
    this.startTimer();
    this.startPowerUpTimer();
    this.notifyStateChange();
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.powerUpTimer) {
      clearInterval(this.powerUpTimer);
      this.powerUpTimer = undefined;
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState });
    }
  }

  public cleanup(): void {
    this.stopTimer();
  }
}
