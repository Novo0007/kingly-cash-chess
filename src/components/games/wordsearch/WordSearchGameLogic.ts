/**
 * Word Search Game Logic
 * Handles grid generation, word placement, and game mechanics
 */

export interface Position {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string;
  start: Position;
  end: Position;
  direction: "horizontal" | "vertical" | "diagonal";
}

export interface FoundWord {
  word: string;
  start: Position;
  end: Position;
  direction: "horizontal" | "vertical" | "diagonal";
  foundBy?: string; // player ID who found it
  timestamp?: number;
}

export interface GridCell {
  letter: string;
  isHighlighted: boolean;
  isFound: boolean;
  wordId?: string;
  hintHighlight?: boolean;
}

export interface Player {
  id: string;
  username: string;
  score: number;
  wordsFound: string[];
  hintsUsed: number;
  isOnline: boolean;
}

export interface GameState {
  grid: GridCell[][];
  gridSize: number;
  words: string[];
  wordPlacements: WordPlacement[];
  foundWords: FoundWord[];
  players: Player[];
  currentPlayer?: string;
  gameStatus: "waiting" | "active" | "completed" | "paused";
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // in seconds
  startTime?: number;
  endTime?: number;
  isMultiplayer: boolean;
  entryFee: number;
  prizePool: number;
}

export interface WordSearchMove {
  playerId: string;
  word: string;
  start: Position;
  end: Position;
  direction: "horizontal" | "vertical" | "diagonal";
  timestamp: number;
}

// Word lists for different difficulties
const WORD_LISTS = {
  easy: [
    "CAT",
    "DOG",
    "SUN",
    "MOON",
    "TREE",
    "BIRD",
    "FISH",
    "BOOK",
    "CAKE",
    "LOVE",
    "HAPPY",
    "WATER",
    "HOUSE",
    "CHAIR",
    "TABLE",
    "PHONE",
    "MUSIC",
    "DANCE",
    "SMILE",
    "HEART",
    "FLOWER",
    "GARDEN",
    "WINTER",
    "SUMMER",
    "SPRING",
    "ORANGE",
    "PURPLE",
    "YELLOW",
    "FRIEND",
    "FAMILY",
  ],
  medium: [
    "PUZZLE",
    "DRAGON",
    "CASTLE",
    "BRIDGE",
    "PLANET",
    "ROCKET",
    "WIZARD",
    "KNIGHT",
    "FOREST",
    "OCEAN",
    "MOUNTAIN",
    "RAINBOW",
    "THUNDER",
    "LIGHTNING",
    "ELEPHANT",
    "GIRAFFE",
    "PENGUIN",
    "DOLPHIN",
    "BUTTERFLY",
    "DRAGONFLY",
    "ADVENTURE",
    "TREASURE",
    "MYSTERY",
    "JOURNEY",
    "DISCOVERY",
    "FANTASTIC",
    "WONDERFUL",
    "BEAUTIFUL",
    "INCREDIBLE",
    "AMAZING",
  ],
  hard: [
    "MAGNIFICENT",
    "EXTRAORDINARY",
    "CONSTELLATION",
    "METAMORPHOSIS",
    "PHOTOGRAPHER",
    "ENCYCLOPEDIA",
    "ARCHITECTURE",
    "PSYCHOLOGY",
    "PHILOSOPHY",
    "TECHNOLOGY",
    "TRANSPORTATION",
    "COMMUNICATION",
    "IMAGINATION",
    "CELEBRATION",
    "ORGANIZATION",
    "DEVELOPMENT",
    "INTERNATIONAL",
    "ENVIRONMENTAL",
    "REVOLUTIONARY",
    "SOPHISTICATED",
    "CRYSTALLIZATION",
    "ELECTROCARDIOGRAM",
    "INCOMPREHENSIBLE",
    "ANTIDISESTABLISHMENTARIANISM",
    "FLOCCINAUCINIHILIPILIFICATION",
  ],
};

export class WordSearchGameLogic {
  private gameState: GameState;

  constructor(
    difficulty: "easy" | "medium" | "hard" = "medium",
    gridSize: number = 15,
    wordCount: number = 10,
    isMultiplayer: boolean = false,
    entryFee: number = 10,
  ) {
    this.gameState = {
      grid: [],
      gridSize,
      words: [],
      wordPlacements: [],
      foundWords: [],
      players: [],
      gameStatus: "waiting",
      difficulty,
      timeLimit: this.getTimeLimit(difficulty),
      isMultiplayer,
      entryFee,
      prizePool: 0,
    };

    this.initializeGame(wordCount);
  }

  private getTimeLimit(difficulty: "easy" | "medium" | "hard"): number {
    switch (difficulty) {
      case "easy":
        return 600; // 10 minutes
      case "medium":
        return 300; // 5 minutes
      case "hard":
        return 180; // 3 minutes
      default:
        return 300;
    }
  }

  private initializeGame(wordCount: number): void {
    // Select random words based on difficulty
    const wordList = WORD_LISTS[this.gameState.difficulty];
    this.gameState.words = this.selectRandomWords(wordList, wordCount);

    // Initialize empty grid
    this.initializeGrid();

    // Place words in grid
    this.placeWords();

    // Fill empty cells with random letters
    this.fillEmptyCells();
  }

  private selectRandomWords(wordList: string[], count: number): string[] {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, wordList.length));
  }

  private initializeGrid(): void {
    this.gameState.grid = Array(this.gameState.gridSize)
      .fill(null)
      .map(() =>
        Array(this.gameState.gridSize)
          .fill(null)
          .map(() => ({
            letter: "",
            isHighlighted: false,
            isFound: false,
            hintHighlight: false,
          })),
      );
  }

  private placeWords(): void {
    const directions = [
      { dr: 0, dc: 1, name: "horizontal" as const }, // horizontal
      { dr: 1, dc: 0, name: "vertical" as const }, // vertical
      { dr: 1, dc: 1, name: "diagonal" as const }, // diagonal down-right
      { dr: 1, dc: -1, name: "diagonal" as const }, // diagonal down-left
    ];

    for (const word of this.gameState.words) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * this.gameState.gridSize);
        const startCol = Math.floor(Math.random() * this.gameState.gridSize);

        if (this.canPlaceWord(word, startRow, startCol, direction)) {
          this.placeWord(word, startRow, startCol, direction);
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }
  }

  private canPlaceWord(
    word: string,
    startRow: number,
    startCol: number,
    direction: {
      dr: number;
      dc: number;
      name: "horizontal" | "vertical" | "diagonal";
    },
  ): boolean {
    const endRow = startRow + (word.length - 1) * direction.dr;
    const endCol = startCol + (word.length - 1) * direction.dc;

    // Check if word fits in grid
    if (
      endRow < 0 ||
      endRow >= this.gameState.gridSize ||
      endCol < 0 ||
      endCol >= this.gameState.gridSize
    ) {
      return false;
    }

    // Check if all cells are empty or contain the same letter
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * direction.dr;
      const col = startCol + i * direction.dc;
      const cell = this.gameState.grid[row][col];

      if (cell.letter !== "" && cell.letter !== word[i]) {
        return false;
      }
    }

    return true;
  }

  private placeWord(
    word: string,
    startRow: number,
    startCol: number,
    direction: {
      dr: number;
      dc: number;
      name: "horizontal" | "vertical" | "diagonal";
    },
  ): void {
    const placement: WordPlacement = {
      word,
      start: { row: startRow, col: startCol },
      end: {
        row: startRow + (word.length - 1) * direction.dr,
        col: startCol + (word.length - 1) * direction.dc,
      },
      direction: direction.name,
    };

    this.gameState.wordPlacements.push(placement);

    // Place letters in grid
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * direction.dr;
      const col = startCol + i * direction.dc;
      this.gameState.grid[row][col].letter = word[i];
    }
  }

  private fillEmptyCells(): void {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let row = 0; row < this.gameState.gridSize; row++) {
      for (let col = 0; col < this.gameState.gridSize; col++) {
        if (this.gameState.grid[row][col].letter === "") {
          const randomLetter =
            letters[Math.floor(Math.random() * letters.length)];
          this.gameState.grid[row][col].letter = randomLetter;
        }
      }
    }
  }

  // Public methods for game interaction
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public startGame(): void {
    this.gameState.gameStatus = "active";
    this.gameState.startTime = Date.now();
  }

  public addPlayer(player: Player): boolean {
    if (!this.gameState.isMultiplayer) {
      this.gameState.players = [player];
      return true;
    }

    if (this.gameState.players.length >= 4) {
      return false; // Max 4 players
    }

    this.gameState.players.push(player);
    this.gameState.prizePool += this.gameState.entryFee;
    return true;
  }

  public findWord(
    playerId: string,
    start: Position,
    end: Position,
  ): { success: boolean; word?: string; points?: number } {
    // Determine direction and extract letters
    const direction = this.determineDirection(start, end);
    const letters = this.extractLetters(start, end);
    const word = letters.join("");

    // Check if word exists in our word list and hasn't been found yet
    const targetWord = this.gameState.words.find(
      (w) => w === word || w === word.split("").reverse().join(""),
    );

    if (!targetWord) {
      return { success: false };
    }

    // Check if word already found
    const alreadyFound = this.gameState.foundWords.some(
      (fw) => fw.word === targetWord,
    );
    if (alreadyFound) {
      return { success: false };
    }

    // Mark word as found
    const foundWord: FoundWord = {
      word: targetWord,
      start,
      end,
      direction,
      foundBy: playerId,
      timestamp: Date.now(),
    };

    this.gameState.foundWords.push(foundWord);

    // Update player score
    const player = this.gameState.players.find((p) => p.id === playerId);
    if (player) {
      const points = this.calculatePoints(targetWord);
      player.score += points;
      player.wordsFound.push(targetWord);

      // Mark cells as found
      this.markCellsAsFound(start, end);

      return { success: true, word: targetWord, points };
    }

    return { success: false };
  }

  private determineDirection(
    start: Position,
    end: Position,
  ): "horizontal" | "vertical" | "diagonal" {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    if (rowDiff === 0) return "horizontal";
    if (colDiff === 0) return "vertical";
    return "diagonal";
  }

  private extractLetters(start: Position, end: Position): string[] {
    const letters: string[] = [];
    const rowStep = end.row === start.row ? 0 : end.row > start.row ? 1 : -1;
    const colStep = end.col === start.col ? 0 : end.col > start.col ? 1 : -1;

    let currentRow = start.row;
    let currentCol = start.col;

    while (true) {
      letters.push(this.gameState.grid[currentRow][currentCol].letter);

      if (currentRow === end.row && currentCol === end.col) break;

      currentRow += rowStep;
      currentCol += colStep;
    }

    return letters;
  }

  private markCellsAsFound(start: Position, end: Position): void {
    const rowStep = end.row === start.row ? 0 : end.row > start.row ? 1 : -1;
    const colStep = end.col === start.col ? 0 : end.col > start.col ? 1 : -1;

    let currentRow = start.row;
    let currentCol = start.col;

    while (true) {
      this.gameState.grid[currentRow][currentCol].isFound = true;

      if (currentRow === end.row && currentCol === end.col) break;

      currentRow += rowStep;
      currentCol += colStep;
    }
  }

  private calculatePoints(word: string): number {
    // Base points based on word length
    let points = word.length * 10;

    // Bonus based on difficulty
    switch (this.gameState.difficulty) {
      case "easy":
        points *= 1;
        break;
      case "medium":
        points *= 1.5;
        break;
      case "hard":
        points *= 2;
        break;
    }

    return Math.round(points);
  }

  public useHint(
    playerId: string,
    hintType: "letter_highlight" | "word_location" | "direction_hint",
    targetWord: string,
  ): boolean {
    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.hintsUsed++;

    // Apply hint based on type
    switch (hintType) {
      case "letter_highlight":
        this.highlightFirstLetter(targetWord);
        break;
      case "word_location":
        this.highlightWordArea(targetWord);
        break;
      case "direction_hint":
        // This would show direction information in UI
        break;
    }

    return true;
  }

  private highlightFirstLetter(word: string): void {
    const placement = this.gameState.wordPlacements.find(
      (p) => p.word === word,
    );
    if (placement) {
      this.gameState.grid[placement.start.row][
        placement.start.col
      ].hintHighlight = true;
    }
  }

  private highlightWordArea(word: string): void {
    const placement = this.gameState.wordPlacements.find(
      (p) => p.word === word,
    );
    if (!placement) return;

    const rowStep =
      placement.end.row === placement.start.row
        ? 0
        : placement.end.row > placement.start.row
          ? 1
          : -1;
    const colStep =
      placement.end.col === placement.start.col
        ? 0
        : placement.end.col > placement.start.col
          ? 1
          : -1;

    let currentRow = placement.start.row;
    let currentCol = placement.start.col;

    for (let i = 0; i < word.length; i++) {
      this.gameState.grid[currentRow][currentCol].hintHighlight = true;
      currentRow += rowStep;
      currentCol += colStep;
    }
  }

  public isGameComplete(): boolean {
    return this.gameState.foundWords.length === this.gameState.words.length;
  }

  public getTimeRemaining(): number {
    if (!this.gameState.startTime) return this.gameState.timeLimit;

    const elapsed = (Date.now() - this.gameState.startTime) / 1000;
    return Math.max(0, this.gameState.timeLimit - elapsed);
  }

  public endGame(): void {
    this.gameState.gameStatus = "completed";
    this.gameState.endTime = Date.now();
  }

  public getLeaderboard(): Player[] {
    return [...this.gameState.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.hintsUsed - b.hintsUsed; // Fewer hints used is better
    });
  }

  public clearHints(): void {
    for (let row = 0; row < this.gameState.gridSize; row++) {
      for (let col = 0; col < this.gameState.gridSize; col++) {
        this.gameState.grid[row][col].hintHighlight = false;
      }
    }
  }
}
