export interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  position: { row: number; col: number };
}

export interface MemoryGameState {
  cards: Card[];
  flippedCards: Card[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  wrongMoves: number;
  timeElapsed: number;
  isGameOver: boolean;
  isWon: boolean;
  isEliminated: boolean;
  eliminationReason?: string;
  gridSize: { rows: number; cols: number };
}

export interface MemoryGameScore {
  moves: number;
  timeElapsed: number;
  difficulty: string;
  isWon: boolean;
  eliminationReason?: string;
}

type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyConfig {
  rows: number;
  cols: number;
  maxMoves: number;
  timeLimit: number; // in seconds
  maxWrongMoves: number;
}

export class MemoryGameLogic {
  private gameState: MemoryGameState;
  private difficulty: DifficultyLevel;
  private difficultyConfig: DifficultyConfig;
  private gameTimer: NodeJS.Timeout | null = null;
  private symbols = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐸", "🐵", "🐧", "🐺", "🦉",
    "🐝", "🦋", "🐞", "🐛", "🦗", "🕷️", "🦂", "🐢",
    "🐍", "🦎", "🐙", "🦑", "🦐", "🦀", "🐠", "🐟",
    "🐡", "🐬", "🐳", "🐋", "🦈", "🐊", "🦏", "🦛"
  ];

  constructor(difficulty: DifficultyLevel = "easy") {
    this.difficulty = difficulty;
    this.difficultyConfig = this.getDifficultyConfig(difficulty);
    this.gameState = this.initializeGame();
    this.startTimer();
  }

  private getDifficultyConfig(difficulty: DifficultyLevel): DifficultyConfig {
    switch (difficulty) {
      case "easy":
        return { rows: 2, cols: 3, maxMoves: 20, timeLimit: 60, maxWrongMoves: 5 };
      case "medium":
        return { rows: 4, cols: 4, maxMoves: 35, timeLimit: 120, maxWrongMoves: 8 };
      case "hard":
        return { rows: 6, cols: 6, maxMoves: 60, timeLimit: 180, maxWrongMoves: 12 };
      default:
        return { rows: 2, cols: 3, maxMoves: 20, timeLimit: 60, maxWrongMoves: 5 };
    }
  }

  private initializeGame(): MemoryGameState {
    const { rows, cols } = this.difficultyConfig;
    const totalCards = rows * cols;
    const totalPairs = totalCards / 2;

    // Select random symbols for this game
    const selectedSymbols = this.shuffleArray([...this.symbols]).slice(0, totalPairs);
    
    // Create pairs of cards
    const cardSymbols = [...selectedSymbols, ...selectedSymbols];
    const shuffledSymbols = this.shuffleArray(cardSymbols);

    // Create cards with positions
    const cards: Card[] = [];
    let cardId = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cards.push({
          id: cardId,
          symbol: shuffledSymbols[cardId],
          isFlipped: false,
          isMatched: false,
          position: { row, col }
        });
        cardId++;
      }
    }

    return {
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs,
      moves: 0,
      wrongMoves: 0,
      timeElapsed: 0,
      isGameOver: false,
      isWon: false,
      isEliminated: false,
      gridSize: { rows, cols }
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private startTimer(): void {
    this.gameTimer = setInterval(() => {
      if (!this.gameState.isGameOver) {
        this.gameState.timeElapsed++;
        
        // Check time limit elimination
        if (this.gameState.timeElapsed >= this.difficultyConfig.timeLimit) {
          this.eliminatePlayer("Time limit exceeded");
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  private eliminatePlayer(reason: string): void {
    this.gameState.isEliminated = true;
    this.gameState.isGameOver = true;
    this.gameState.eliminationReason = reason;
    this.stopTimer();
  }

  private checkWinCondition(): void {
    if (this.gameState.matchedPairs === this.gameState.totalPairs) {
      this.gameState.isWon = true;
      this.gameState.isGameOver = true;
      this.stopTimer();
    }
  }

  private checkEliminationConditions(): void {
    // Check moves limit
    if (this.gameState.moves >= this.difficultyConfig.maxMoves) {
      this.eliminatePlayer("Maximum moves exceeded");
      return;
    }

    // Check wrong moves limit
    if (this.gameState.wrongMoves >= this.difficultyConfig.maxWrongMoves) {
      this.eliminatePlayer("Too many wrong moves");
      return;
    }
  }

  public flipCard(cardId: number): boolean {
    if (this.gameState.isGameOver) return false;

    const card = this.gameState.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return false;

    // If two cards are already flipped, flip them back first
    if (this.gameState.flippedCards.length === 2) {
      this.gameState.flippedCards.forEach(flippedCard => {
        if (!flippedCard.isMatched) {
          flippedCard.isFlipped = false;
        }
      });
      this.gameState.flippedCards = [];
    }

    // Flip the selected card
    card.isFlipped = true;
    this.gameState.flippedCards.push(card);

    // If this is the second card flipped, check for match
    if (this.gameState.flippedCards.length === 2) {
      this.gameState.moves++;
      
      const [firstCard, secondCard] = this.gameState.flippedCards;
      
      if (firstCard.symbol === secondCard.symbol) {
        // Match found!
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        this.gameState.matchedPairs++;
        this.gameState.flippedCards = [];
        
        // Check win condition
        this.checkWinCondition();
      } else {
        // No match
        this.gameState.wrongMoves++;
        // Cards will be flipped back on next card flip or after delay
      }

      // Check elimination conditions
      this.checkEliminationConditions();
    }

    return true;
  }

  public getGameState(): MemoryGameState {
    return { ...this.gameState };
  }

  public getScore(): MemoryGameScore {
    return {
      moves: this.gameState.moves,
      timeElapsed: this.gameState.timeElapsed,
      difficulty: this.difficulty,
      isWon: this.gameState.isWon,
      eliminationReason: this.gameState.eliminationReason
    };
  }

  public restart(): void {
    this.stopTimer();
    this.gameState = this.initializeGame();
    this.startTimer();
  }

  public getDifficultyInfo() {
    return {
      difficulty: this.difficulty,
      config: this.difficultyConfig
    };
  }

  public cleanup(): void {
    this.stopTimer();
  }
}
