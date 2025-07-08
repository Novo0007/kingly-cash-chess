export interface ScrabbleTile {
  letter: string;
  value: number;
  id: string;
}

export interface BoardCell {
  tile: ScrabbleTile | null;
  multiplier: {
    type: "letter" | "word" | null;
    value: number;
  };
  position: { row: number; col: number };
}

export interface Player {
  id: string;
  username: string;
  rack: ScrabbleTile[];
  score: number;
  coins: number;
}

export interface PlacedWord {
  tiles: { tile: ScrabbleTile; position: { row: number; col: number } }[];
  word: string;
  score: number;
  direction: "horizontal" | "vertical";
}

export interface GameMove {
  playerId: string;
  type: "place_word" | "exchange_tiles" | "pass";
  placedTiles?: {
    tile: ScrabbleTile;
    position: { row: number; col: number };
  }[];
  exchangedTiles?: ScrabbleTile[];
  score?: number;
  timestamp: number;
}

export interface ScrabbleGameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  board: BoardCell[][];
  tileBag: ScrabbleTile[];
  gameStatus: "waiting" | "active" | "completed" | "paused";
  moves: GameMove[];
  timePerTurn: number;
  currentTurnStartTime: number;
  gameSettings: {
    entryCost: number;
    prizePot: number;
    maxPlayers: number;
    isPrivate: boolean;
    isSinglePlayer?: boolean;
  };
  winner?: string;
  gameResult?: "completed" | "abandoned" | "timeout";
}

// Letter distribution and values (standard Scrabble)
export const LETTER_DISTRIBUTION: {
  [key: string]: { count: number; value: number };
} = {
  A: { count: 9, value: 1 },
  B: { count: 2, value: 3 },
  C: { count: 2, value: 3 },
  D: { count: 4, value: 2 },
  E: { count: 12, value: 1 },
  F: { count: 2, value: 4 },
  G: { count: 3, value: 2 },
  H: { count: 2, value: 4 },
  I: { count: 9, value: 1 },
  J: { count: 1, value: 8 },
  K: { count: 1, value: 5 },
  L: { count: 4, value: 1 },
  M: { count: 2, value: 3 },
  N: { count: 6, value: 1 },
  O: { count: 8, value: 1 },
  P: { count: 2, value: 3 },
  Q: { count: 1, value: 10 },
  R: { count: 6, value: 1 },
  S: { count: 4, value: 1 },
  T: { count: 6, value: 1 },
  U: { count: 4, value: 1 },
  V: { count: 2, value: 4 },
  W: { count: 2, value: 4 },
  X: { count: 1, value: 8 },
  Y: { count: 2, value: 4 },
  Z: { count: 1, value: 10 },
  "": { count: 2, value: 0 }, // Blank tiles
};

// Board multipliers (15x15 standard Scrabble board)
export const BOARD_MULTIPLIERS: {
  [key: string]: { type: "letter" | "word"; value: number };
} = {
  "0,0": { type: "word", value: 3 },
  "0,7": { type: "word", value: 3 },
  "0,14": { type: "word", value: 3 },
  "7,0": { type: "word", value: 3 },
  "7,14": { type: "word", value: 3 },
  "14,0": { type: "word", value: 3 },
  "14,7": { type: "word", value: 3 },
  "14,14": { type: "word", value: 3 },

  "1,1": { type: "word", value: 2 },
  "2,2": { type: "word", value: 2 },
  "3,3": { type: "word", value: 2 },
  "4,4": { type: "word", value: 2 },
  "1,13": { type: "word", value: 2 },
  "2,12": { type: "word", value: 2 },
  "3,11": { type: "word", value: 2 },
  "4,10": { type: "word", value: 2 },
  "13,1": { type: "word", value: 2 },
  "12,2": { type: "word", value: 2 },
  "11,3": { type: "word", value: 2 },
  "10,4": { type: "word", value: 2 },
  "13,13": { type: "word", value: 2 },
  "12,12": { type: "word", value: 2 },
  "11,11": { type: "word", value: 2 },
  "10,10": { type: "word", value: 2 },

  "1,5": { type: "letter", value: 3 },
  "1,9": { type: "letter", value: 3 },
  "5,1": { type: "letter", value: 3 },
  "5,5": { type: "letter", value: 3 },
  "5,9": { type: "letter", value: 3 },
  "5,13": { type: "letter", value: 3 },
  "9,1": { type: "letter", value: 3 },
  "9,5": { type: "letter", value: 3 },
  "9,9": { type: "letter", value: 3 },
  "9,13": { type: "letter", value: 3 },
  "13,5": { type: "letter", value: 3 },
  "13,9": { type: "letter", value: 3 },

  "0,3": { type: "letter", value: 2 },
  "0,11": { type: "letter", value: 2 },
  "2,6": { type: "letter", value: 2 },
  "2,8": { type: "letter", value: 2 },
  "3,0": { type: "letter", value: 2 },
  "3,7": { type: "letter", value: 2 },
  "3,14": { type: "letter", value: 2 },
  "6,2": { type: "letter", value: 2 },
  "6,6": { type: "letter", value: 2 },
  "6,8": { type: "letter", value: 2 },
  "6,12": { type: "letter", value: 2 },
  "7,3": { type: "letter", value: 2 },
  "7,11": { type: "letter", value: 2 },
  "8,2": { type: "letter", value: 2 },
  "8,6": { type: "letter", value: 2 },
  "8,8": { type: "letter", value: 2 },
  "8,12": { type: "letter", value: 2 },
  "11,0": { type: "letter", value: 2 },
  "11,7": { type: "letter", value: 2 },
  "11,14": { type: "letter", value: 2 },
  "12,6": { type: "letter", value: 2 },
  "12,8": { type: "letter", value: 2 },
  "14,3": { type: "letter", value: 2 },
  "14,11": { type: "letter", value: 2 },
};

// Word validation dictionary (simplified - in production use a full dictionary)
export const VALID_WORDS = new Set([
  "HELLO",
  "WORLD",
  "GAME",
  "PLAY",
  "WORD",
  "TILE",
  "SCORE",
  "BOARD",
  "LETTERS",
  "FRIENDS",
  "SCRABBLE",
  "PUZZLE",
  "CHALLENGE",
  "STRATEGY",
  "THINK",
  "BRAIN",
  "SMART",
  "WIN",
  "LOSE",
  "TURN",
  "MOVE",
  "PLACE",
  "EXCHANGE",
  "PASS",
  "TIME",
  "RULES",
  "POINTS",
  "BONUS",
  "MULTIPLIER",
  // Add more words as needed for production
]);

export class ScrabbleGameLogic {
  private gameState: ScrabbleGameState;
  private isSinglePlayer: boolean;

  constructor(
    gameId: string,
    settings: {
      entryCost: number;
      maxPlayers: number;
      isPrivate: boolean;
      isSinglePlayer?: boolean;
    },
  ) {
    this.isSinglePlayer = settings.isSinglePlayer || false;
    this.gameState = this.initializeGame(gameId, settings);
  }

  private initializeGame(
    gameId: string,
    settings: { entryCost: number; maxPlayers: number; isPrivate: boolean },
  ): ScrabbleGameState {
    // Create tile bag
    const tileBag: ScrabbleTile[] = [];
    let tileId = 0;

    Object.entries(LETTER_DISTRIBUTION).forEach(
      ([letter, { count, value }]) => {
        for (let i = 0; i < count; i++) {
          tileBag.push({
            id: `tile_${tileId++}`,
            letter,
            value,
          });
        }
      },
    );

    // Shuffle tile bag
    this.shuffleArray(tileBag);

    // Initialize board
    const board: BoardCell[][] = [];
    for (let row = 0; row < 15; row++) {
      board[row] = [];
      for (let col = 0; col < 15; col++) {
        const key = `${row},${col}`;
        const multiplier = BOARD_MULTIPLIERS[key] || { type: null, value: 1 };
        board[row][col] = {
          tile: null,
          multiplier,
          position: { row, col },
        };
      }
    }

    return {
      id: gameId,
      players: [],
      currentPlayerIndex: 0,
      board,
      tileBag,
      gameStatus: "waiting",
      moves: [],
      timePerTurn: 300, // 5 minutes per turn
      currentTurnStartTime: Date.now(),
      gameSettings: {
        entryCost: settings.entryCost,
        prizePot: 0,
        maxPlayers: settings.maxPlayers,
        isPrivate: settings.isPrivate,
        isSinglePlayer: this.isSinglePlayer,
      },
    };
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  addPlayer(playerId: string, username: string, coins: number): boolean {
    if (
      this.gameState.players.length >= this.gameState.gameSettings.maxPlayers
    ) {
      return false;
    }

    if (coins < this.gameState.gameSettings.entryCost) {
      return false;
    }

    // Draw 7 tiles for the new player
    const rack: ScrabbleTile[] = [];
    for (let i = 0; i < 7 && this.gameState.tileBag.length > 0; i++) {
      rack.push(this.gameState.tileBag.pop()!);
    }

    const player: Player = {
      id: playerId,
      username,
      rack,
      score: 0,
      coins: coins - this.gameState.gameSettings.entryCost,
    };

    this.gameState.players.push(player);
    this.gameState.gameSettings.prizePot +=
      this.gameState.gameSettings.entryCost;

    // Start game if we have minimum players (1 for single player, 2 for multiplayer)
    const minPlayers = this.isSinglePlayer ? 1 : 2;
    if (
      this.gameState.players.length >= minPlayers &&
      this.gameState.gameStatus === "waiting"
    ) {
      this.startGame();
    }

    return true;
  }

  private startGame(): void {
    this.gameState.gameStatus = "active";
    this.gameState.currentTurnStartTime = Date.now();
  }

  validateWordPlacement(
    placedTiles: {
      tile: ScrabbleTile;
      position: { row: number; col: number };
    }[],
  ): {
    valid: boolean;
    words: PlacedWord[];
    totalScore: number;
    error?: string;
  } {
    if (placedTiles.length === 0) {
      return {
        valid: false,
        words: [],
        totalScore: 0,
        error: "No tiles placed",
      };
    }

    // Check if tiles are in a line
    const positions = placedTiles.map((pt) => pt.position);
    const isHorizontal = positions.every((pos) => pos.row === positions[0].row);
    const isVertical = positions.every((pos) => pos.col === positions[0].col);

    if (!isHorizontal && !isVertical) {
      return {
        valid: false,
        words: [],
        totalScore: 0,
        error: "Tiles must be placed in a straight line",
      };
    }

    // Check if tiles are contiguous
    if (isHorizontal) {
      positions.sort((a, b) => a.col - b.col);
      for (let i = 0; i < positions.length - 1; i++) {
        const currentCol = positions[i].col;
        const nextCol = positions[i + 1].col;
        for (let col = currentCol + 1; col < nextCol; col++) {
          if (!this.gameState.board[positions[i].row][col].tile) {
            return {
              valid: false,
              words: [],
              totalScore: 0,
              error: "Tiles must be contiguous",
            };
          }
        }
      }
    } else {
      positions.sort((a, b) => a.row - b.row);
      for (let i = 0; i < positions.length - 1; i++) {
        const currentRow = positions[i].row;
        const nextRow = positions[i + 1].row;
        for (let row = currentRow + 1; row < nextRow; row++) {
          if (!this.gameState.board[row][positions[i].col].tile) {
            return {
              valid: false,
              words: [],
              totalScore: 0,
              error: "Tiles must be contiguous",
            };
          }
        }
      }
    }

    // Check if first move uses center square
    const isFirstMove = this.gameState.moves.length === 0;
    if (isFirstMove) {
      const centerUsed = placedTiles.some(
        (pt) => pt.position.row === 7 && pt.position.col === 7,
      );
      if (!centerUsed) {
        return {
          valid: false,
          words: [],
          totalScore: 0,
          error: "First word must use the center square",
        };
      }
    } else {
      // Check if placed tiles connect to existing tiles
      const connectsToExisting = placedTiles.some((pt) => {
        const { row, col } = pt.position;
        return (
          (row > 0 && this.gameState.board[row - 1][col].tile) ||
          (row < 14 && this.gameState.board[row + 1][col].tile) ||
          (col > 0 && this.gameState.board[row][col - 1].tile) ||
          (col < 14 && this.gameState.board[row][col + 1].tile)
        );
      });
      if (!connectsToExisting) {
        return {
          valid: false,
          words: [],
          totalScore: 0,
          error: "New tiles must connect to existing tiles",
        };
      }
    }

    // Find all words formed and calculate score
    const wordsFormed = this.findAllWordsFormed(placedTiles);
    let totalScore = 0;

    for (const word of wordsFormed) {
      if (!VALID_WORDS.has(word.word.toUpperCase())) {
        return {
          valid: false,
          words: [],
          totalScore: 0,
          error: `Invalid word: ${word.word}`,
        };
      }
      totalScore += word.score;
    }

    // Bonus for using all 7 tiles
    if (placedTiles.length === 7) {
      totalScore += 50;
    }

    return { valid: true, words: wordsFormed, totalScore };
  }

  private findAllWordsFormed(
    placedTiles: {
      tile: ScrabbleTile;
      position: { row: number; col: number };
    }[],
  ): PlacedWord[] {
    const words: PlacedWord[] = [];

    // Create a temporary board with the new tiles
    const tempBoard = this.gameState.board.map((row) =>
      row.map((cell) => ({ ...cell })),
    );
    placedTiles.forEach((pt) => {
      tempBoard[pt.position.row][pt.position.col] = {
        ...tempBoard[pt.position.row][pt.position.col],
        tile: pt.tile,
      };
    });

    // Find the main word
    const positions = placedTiles.map((pt) => pt.position);
    const isHorizontal = positions.every((pos) => pos.row === positions[0].row);

    if (isHorizontal) {
      const row = positions[0].row;
      const minCol = Math.min(...positions.map((p) => p.col));
      const maxCol = Math.max(...positions.map((p) => p.col));

      // Extend to find full word
      let startCol = minCol;
      let endCol = maxCol;

      while (startCol > 0 && tempBoard[row][startCol - 1].tile) startCol--;
      while (endCol < 14 && tempBoard[row][endCol + 1].tile) endCol++;

      if (endCol > startCol) {
        const word = this.extractWord(
          tempBoard,
          row,
          startCol,
          row,
          endCol,
          "horizontal",
          placedTiles,
        );
        words.push(word);
      }
    } else {
      const col = positions[0].col;
      const minRow = Math.min(...positions.map((p) => p.row));
      const maxRow = Math.max(...positions.map((p) => p.row));

      let startRow = minRow;
      let endRow = maxRow;

      while (startRow > 0 && tempBoard[startRow - 1][col].tile) startRow--;
      while (endRow < 14 && tempBoard[endRow + 1][col].tile) endRow++;

      if (endRow > startRow) {
        const word = this.extractWord(
          tempBoard,
          startRow,
          col,
          endRow,
          col,
          "vertical",
          placedTiles,
        );
        words.push(word);
      }
    }

    // Find perpendicular words
    placedTiles.forEach((pt) => {
      const { row, col } = pt.position;

      if (isHorizontal) {
        // Check vertical word at this position
        let startRow = row;
        let endRow = row;

        while (startRow > 0 && tempBoard[startRow - 1][col].tile) startRow--;
        while (endRow < 14 && tempBoard[endRow + 1][col].tile) endRow++;

        if (endRow > startRow) {
          const word = this.extractWord(
            tempBoard,
            startRow,
            col,
            endRow,
            col,
            "vertical",
            [pt],
          );
          words.push(word);
        }
      } else {
        // Check horizontal word at this position
        let startCol = col;
        let endCol = col;

        while (startCol > 0 && tempBoard[row][startCol - 1].tile) startCol--;
        while (endCol < 14 && tempBoard[row][endCol + 1].tile) endCol++;

        if (endCol > startCol) {
          const word = this.extractWord(
            tempBoard,
            row,
            startCol,
            row,
            endCol,
            "horizontal",
            [pt],
          );
          words.push(word);
        }
      }
    });

    return words;
  }

  private extractWord(
    board: BoardCell[][],
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    direction: "horizontal" | "vertical",
    newTiles: { tile: ScrabbleTile; position: { row: number; col: number } }[],
  ): PlacedWord {
    const tiles: {
      tile: ScrabbleTile;
      position: { row: number; col: number };
    }[] = [];
    let word = "";
    let score = 0;
    let wordMultiplier = 1;

    if (direction === "horizontal") {
      for (let col = startCol; col <= endCol; col++) {
        const cell = board[startRow][col];
        if (cell.tile) {
          tiles.push({ tile: cell.tile, position: { row: startRow, col } });
          word += cell.tile.letter;

          let letterScore = cell.tile.value;
          const isNewTile = newTiles.some(
            (nt) => nt.position.row === startRow && nt.position.col === col,
          );

          if (isNewTile && cell.multiplier.type === "letter") {
            letterScore *= cell.multiplier.value;
          }
          if (isNewTile && cell.multiplier.type === "word") {
            wordMultiplier *= cell.multiplier.value;
          }

          score += letterScore;
        }
      }
    } else {
      for (let row = startRow; row <= endRow; row++) {
        const cell = board[row][startCol];
        if (cell.tile) {
          tiles.push({ tile: cell.tile, position: { row, col: startCol } });
          word += cell.tile.letter;

          let letterScore = cell.tile.value;
          const isNewTile = newTiles.some(
            (nt) => nt.position.row === row && nt.position.col === startCol,
          );

          if (isNewTile && cell.multiplier.type === "letter") {
            letterScore *= cell.multiplier.value;
          }
          if (isNewTile && cell.multiplier.type === "word") {
            wordMultiplier *= cell.multiplier.value;
          }

          score += letterScore;
        }
      }
    }

    score *= wordMultiplier;

    return { tiles, word, score, direction };
  }

  makeMove(
    playerId: string,
    move: Omit<GameMove, "playerId" | "timestamp">,
  ): {
    success: boolean;
    error?: string;
    newGameState?: ScrabbleGameState;
  } {
    if (this.gameState.gameStatus !== "active") {
      return { success: false, error: "Game is not active" };
    }

    const currentPlayer =
      this.gameState.players[this.gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { success: false, error: "Not your turn" };
    }

    const gameMove: GameMove = {
      ...move,
      playerId,
      timestamp: Date.now(),
    };

    if (move.type === "place_word") {
      if (!move.placedTiles) {
        return { success: false, error: "No tiles specified" };
      }

      // Validate that player has the tiles
      const requiredTiles = move.placedTiles.map((pt) => pt.tile.id);
      const playerTileIds = currentPlayer.rack.map((t) => t.id);

      if (!requiredTiles.every((id) => playerTileIds.includes(id))) {
        return { success: false, error: "Player does not have required tiles" };
      }

      // Validate word placement
      const validation = this.validateWordPlacement(move.placedTiles);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Place tiles on board
      move.placedTiles.forEach((pt) => {
        this.gameState.board[pt.position.row][pt.position.col].tile = pt.tile;
      });

      // Remove tiles from player's rack
      currentPlayer.rack = currentPlayer.rack.filter(
        (tile) => !requiredTiles.includes(tile.id),
      );

      // Add score
      currentPlayer.score += validation.totalScore;
      gameMove.score = validation.totalScore;

      // Draw new tiles
      const tilesToDraw = Math.min(
        7 - currentPlayer.rack.length,
        this.gameState.tileBag.length,
      );
      for (let i = 0; i < tilesToDraw; i++) {
        currentPlayer.rack.push(this.gameState.tileBag.pop()!);
      }
    } else if (move.type === "exchange_tiles") {
      if (
        !move.exchangedTiles ||
        this.gameState.tileBag.length < move.exchangedTiles.length
      ) {
        return { success: false, error: "Cannot exchange tiles" };
      }

      // Remove exchanged tiles from rack and add to bag
      const exchangedIds = move.exchangedTiles.map((t) => t.id);
      currentPlayer.rack = currentPlayer.rack.filter(
        (tile) => !exchangedIds.includes(tile.id),
      );
      this.gameState.tileBag.push(...move.exchangedTiles);

      // Draw new tiles
      for (let i = 0; i < move.exchangedTiles.length; i++) {
        currentPlayer.rack.push(this.gameState.tileBag.pop()!);
      }

      // Shuffle bag
      this.shuffleArray(this.gameState.tileBag);
    }

    // Add move to history
    this.gameState.moves.push(gameMove);

    // Check for game end
    if (
      currentPlayer.rack.length === 0 ||
      this.gameState.tileBag.length === 0
    ) {
      this.endGame();
    } else {
      // Next player's turn
      this.gameState.currentPlayerIndex =
        (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
      this.gameState.currentTurnStartTime = Date.now();
    }

    return { success: true, newGameState: this.gameState };
  }

  private endGame(): void {
    this.gameState.gameStatus = "completed";

    // Calculate final scores (subtract remaining tile values)
    this.gameState.players.forEach((player) => {
      const remainingValue = player.rack.reduce(
        (sum, tile) => sum + tile.value,
        0,
      );
      player.score -= remainingValue;
    });

    // Find winner
    const winner = this.gameState.players.reduce((best, player) =>
      player.score > best.score ? player : best,
    );

    this.gameState.winner = winner.id;
    this.gameState.gameResult = "completed";

    // Distribute prize
    if (this.gameState.gameSettings.prizePot > 0) {
      winner.coins += this.gameState.gameSettings.prizePot;
    }
  }

  getGameState(): ScrabbleGameState {
    return this.gameState;
  }

  updateGameState(newState: ScrabbleGameState): void {
    this.gameState = newState;
  }

  forceStartGame(): void {
    if (this.gameState.gameStatus === "waiting") {
      this.startGame();
    }
  }

  getCurrentPlayer(): Player | null {
    if (this.gameState.players.length === 0) return null;
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  getPlayerById(playerId: string): Player | null {
    return this.gameState.players.find((p) => p.id === playerId) || null;
  }

  getRemainingTime(): number {
    const elapsed = Date.now() - this.gameState.currentTurnStartTime;
    return Math.max(0, this.gameState.timePerTurn * 1000 - elapsed);
  }

  handleTimeOut(): void {
    // Auto-pass for current player
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer && this.gameState.gameStatus === "active") {
      this.makeMove(currentPlayer.id, { type: "pass" });
    }
  }
}
