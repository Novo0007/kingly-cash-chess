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
}
