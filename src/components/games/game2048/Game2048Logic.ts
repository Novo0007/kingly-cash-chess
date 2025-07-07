export interface Position {
  x: number;
  y: number;
}

export interface GameTile {
  id: string;
  value: number;
  position: Position;
  merged?: boolean;
  isNew?: boolean;
}

export interface Game2048State {
  id: string;
  board: (GameTile | null)[][];
  score: number;
  bestScore: number;
  moves: number;
  gameStatus: "playing" | "won" | "lost" | "continue";
  startTime: number;
  endTime?: number;
  difficulty: "classic" | "challenge" | "expert";
  boardSize: number;
  targetTile: number;
}

export interface Game2048Score {
  id: string;
  user_id: string;
  username: string;
  score: number;
  moves: number;
  time_taken: number;
  difficulty: "classic" | "challenge" | "expert";
  board_size: number;
  target_reached: number;
  completed_at: string;
}

export class Game2048Logic {
  private state: Game2048State;
  private tileIdCounter: number = 0;

  constructor(difficulty: "classic" | "challenge" | "expert" = "classic") {
    const boardSize = this.getBoardSize(difficulty);
    const targetTile = this.getTargetTile(difficulty);

    this.state = {
      id: this.generateId(),
      board: this.createEmptyBoard(boardSize),
      score: 0,
      bestScore: this.loadBestScore(),
      moves: 0,
      gameStatus: "playing",
      startTime: Date.now(),
      difficulty,
      boardSize,
      targetTile,
    };

    this.addRandomTile();
    this.addRandomTile();
  }

  private getBoardSize(difficulty: string): number {
    switch (difficulty) {
      case "challenge":
        return 5;
      case "expert":
        return 6;
      default:
        return 4;
    }
  }

  private getTargetTile(difficulty: string): number {
    switch (difficulty) {
      case "challenge":
        return 4096;
      case "expert":
        return 8192;
      default:
        return 2048;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadBestScore(): number {
    try {
      return parseInt(localStorage.getItem("game2048-best-score") || "0");
    } catch {
      return 0;
    }
  }

  private saveBestScore(): void {
    try {
      localStorage.setItem(
        "game2048-best-score",
        this.state.bestScore.toString(),
      );
    } catch {
      // Ignore localStorage errors
    }
  }

  private createEmptyBoard(size: number): (GameTile | null)[][] {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
  }

  private getEmptyPositions(): Position[] {
    const positions: Position[] = [];
    for (let x = 0; x < this.state.boardSize; x++) {
      for (let y = 0; y < this.state.boardSize; y++) {
        if (!this.state.board[x][y]) {
          positions.push({ x, y });
        }
      }
    }
    return positions;
  }

  private addRandomTile(): boolean {
    const emptyPositions = this.getEmptyPositions();
    if (emptyPositions.length === 0) return false;

    const randomPosition =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const value = Math.random() < 0.9 ? 2 : 4;

    const tile: GameTile = {
      id: `tile-${this.tileIdCounter++}`,
      value,
      position: randomPosition,
      isNew: true,
    };

    this.state.board[randomPosition.x][randomPosition.y] = tile;
    return true;
  }

  private clearMergedFlags(): void {
    for (let x = 0; x < this.state.boardSize; x++) {
      for (let y = 0; y < this.state.boardSize; y++) {
        const tile = this.state.board[x][y];
        if (tile) {
          tile.merged = false;
          tile.isNew = false;
        }
      }
    }
  }

  private moveTiles(direction: "up" | "down" | "left" | "right"): boolean {
    let moved = false;
    const newBoard = this.createEmptyBoard(this.state.boardSize);

    // Define movement vectors
    const vectors = {
      up: { x: -1, y: 0 },
      down: { x: 1, y: 0 },
      left: { x: 0, y: -1 },
      right: { x: 0, y: 1 },
    };

    const vector = vectors[direction];

    // Define traversal order based on direction
    const buildTraversals = () => {
      const traversals = { x: [] as number[], y: [] as number[] };

      for (let pos = 0; pos < this.state.boardSize; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
      }

      if (vector.x === 1) traversals.x.reverse();
      if (vector.y === 1) traversals.y.reverse();

      return traversals;
    };

    const traversals = buildTraversals();

    // Clear merged flags
    this.clearMergedFlags();

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const tile = this.state.board[x][y];
        if (tile) {
          const positions = this.findFarthestPosition({ x, y }, vector);
          const next = positions.next;

          // Check if next position has a tile that can be merged
          if (
            next &&
            this.state.board[next.x] &&
            this.state.board[next.x][next.y] &&
            this.state.board[next.x][next.y]!.value === tile.value &&
            !this.state.board[next.x][next.y]!.merged
          ) {
            // Merge tiles
            const mergedTile: GameTile = {
              ...tile,
              value: tile.value * 2,
              position: next,
              merged: true,
            };

            newBoard[next.x][next.y] = mergedTile;
            this.state.score += mergedTile.value;

            // Check for win condition
            if (
              mergedTile.value === this.state.targetTile &&
              this.state.gameStatus === "playing"
            ) {
              this.state.gameStatus = "won";
            }

            moved = true;
          } else {
            // Move tile to farthest position
            const farthest = positions.farthest;
            if (farthest.x !== x || farthest.y !== y) {
              moved = true;
            }

            newBoard[farthest.x][farthest.y] = {
              ...tile,
              position: farthest,
            };
          }
        }
      });
    });

    this.state.board = newBoard;
    return moved;
  }

  private findFarthestPosition(
    cell: Position,
    vector: { x: number; y: number },
  ) {
    let previous: Position;
    let current = cell;

    do {
      previous = current;
      current = {
        x: previous.x + vector.x,
        y: previous.y + vector.y,
      };
    } while (this.withinBounds(current) && this.cellAvailable(current));

    return {
      farthest: previous,
      next: current,
    };
  }

  private withinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.state.boardSize &&
      position.y >= 0 &&
      position.y < this.state.boardSize
    );
  }

  private cellAvailable(position: Position): boolean {
    return !this.cellOccupied(position);
  }

  private cellOccupied(position: Position): boolean {
    return !!this.state.board[position.x][position.y];
  }

  private isMovesAvailable(): boolean {
    return this.getEmptyPositions().length > 0 || this.tileMatchesAvailable();
  }

  private tileMatchesAvailable(): boolean {
    for (let x = 0; x < this.state.boardSize; x++) {
      for (let y = 0; y < this.state.boardSize; y++) {
        const tile = this.state.board[x][y];
        if (tile) {
          for (const direction of [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
          ]) {
            const neighbor = {
              x: x + direction.x,
              y: y + direction.y,
            };

            if (this.withinBounds(neighbor)) {
              const neighborTile = this.state.board[neighbor.x][neighbor.y];
              if (neighborTile && neighborTile.value === tile.value) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  public move(direction: "up" | "down" | "left" | "right"): boolean {
    if (
      this.state.gameStatus !== "playing" &&
      this.state.gameStatus !== "continue"
    ) {
      return false;
    }

    const moved = this.moveTiles(direction);

    if (moved) {
      this.state.moves++;
      this.addRandomTile();

      if (!this.isMovesAvailable()) {
        this.state.gameStatus = "lost";
        this.state.endTime = Date.now();
      }

      // Update best score
      if (this.state.score > this.state.bestScore) {
        this.state.bestScore = this.state.score;
        this.saveBestScore();
      }
    }

    return moved;
  }

  public continueGame(): void {
    if (this.state.gameStatus === "won") {
      this.state.gameStatus = "continue";
    }
  }

  public restart(): Game2048State {
    const newLogic = new Game2048Logic(this.state.difficulty);
    this.state = newLogic.state;
    return this.state;
  }

  public getState(): Game2048State {
    return { ...this.state };
  }

  public getAllTiles(): GameTile[] {
    const tiles: GameTile[] = [];
    for (let x = 0; x < this.state.boardSize; x++) {
      for (let y = 0; y < this.state.boardSize; y++) {
        const tile = this.state.board[x][y];
        if (tile) {
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }

  public calculateFinalScore(): Game2048Score {
    const timeTaken = this.state.endTime
      ? this.state.endTime - this.state.startTime
      : Date.now() - this.state.startTime;
    const highestTile = Math.max(
      ...this.getAllTiles().map((tile) => tile.value),
    );

    return {
      id: this.state.id,
      user_id: "",
      username: "",
      score: this.state.score,
      moves: this.state.moves,
      time_taken: timeTaken,
      difficulty: this.state.difficulty,
      board_size: this.state.boardSize,
      target_reached: highestTile,
      completed_at: new Date().toISOString(),
    };
  }
}
