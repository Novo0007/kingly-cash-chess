export interface Position {
  x: number;
  y: number;
}

export interface MazeCell {
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
}

export interface MazeGameState {
  id: string;
  maze: MazeCell[][];
  playerPosition: Position;
  startPosition: Position;
  endPosition: Position;
  gameStatus: "waiting" | "playing" | "completed" | "abandoned";
  startTime: number;
  endTime?: number;
  score: number;
  difficulty: "easy" | "medium" | "hard";
  size: number;
}

export interface MazeScore {
  id: string;
  user_id: string;
  username: string;
  score: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  maze_size: number;
  completed_at: string;
}

export class MazeGenerator {
  private maze: MazeCell[][];
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.maze = this.initializeMaze();
  }

  private initializeMaze(): MazeCell[][] {
    const maze: MazeCell[][] = [];
    for (let i = 0; i < this.size; i++) {
      maze[i] = [];
      for (let j = 0; j < this.size; j++) {
        maze[i][j] = {
          isWall: true,
          isVisited: false,
          isPath: false,
        };
      }
    }
    return maze;
  }

  private getNeighbors(x: number, y: number): Position[] {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -2 }, // Up
      { x: 2, y: 0 }, // Right
      { x: 0, y: 2 }, // Down
      { x: -2, y: 0 }, // Left
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (
        newX >= 0 &&
        newX < this.size &&
        newY >= 0 &&
        newY < this.size &&
        !this.maze[newY][newX].isVisited
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  private removeWall(current: Position, next: Position): void {
    const wallX = (current.x + next.x) / 2;
    const wallY = (current.y + next.y) / 2;
    this.maze[wallY][wallX].isWall = false;
    this.maze[wallY][wallX].isPath = true;
  }

  public generateMaze(): MazeCell[][] {
    const stack: Position[] = [];
    const start: Position = { x: 1, y: 1 };

    // Mark start as visited and path
    this.maze[start.y][start.x].isVisited = true;
    this.maze[start.y][start.x].isWall = false;
    this.maze[start.y][start.x].isPath = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getNeighbors(current.x, current.y);

      if (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const next = neighbors[randomIndex];

        this.maze[next.y][next.x].isVisited = true;
        this.maze[next.y][next.x].isWall = false;
        this.maze[next.y][next.x].isPath = true;

        this.removeWall(current, next);
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Ensure end position is accessible
    const endX = this.size - 2;
    const endY = this.size - 2;
    this.maze[endY][endX].isWall = false;
    this.maze[endY][endX].isPath = true;

    return this.maze;
  }
}

export class MazeGameLogic {
  public static getDifficultyConfig(difficulty: "easy" | "medium" | "hard") {
    switch (difficulty) {
      case "easy":
        return { size: 15, baseScore: 100 };
      case "medium":
        return { size: 25, baseScore: 200 };
      case "hard":
        return { size: 35, baseScore: 300 };
      default:
        return { size: 15, baseScore: 100 };
    }
  }

  public static createNewGame(
    difficulty: "easy" | "medium" | "hard",
  ): MazeGameState {
    const config = this.getDifficultyConfig(difficulty);
    const generator = new MazeGenerator(config.size);
    const maze = generator.generateMaze();

    return {
      id: Math.random().toString(36).substr(2, 9),
      maze,
      playerPosition: { x: 1, y: 1 },
      startPosition: { x: 1, y: 1 },
      endPosition: { x: config.size - 2, y: config.size - 2 },
      gameStatus: "waiting",
      startTime: Date.now(),
      score: config.baseScore,
      difficulty,
      size: config.size,
    };
  }

  public static canMoveTo(
    maze: MazeCell[][],
    position: Position,
    direction: "up" | "down" | "left" | "right",
  ): Position | null {
    const { x, y } = position;
    let newX = x;
    let newY = y;

    switch (direction) {
      case "up":
        newY = y - 1;
        break;
      case "down":
        newY = y + 1;
        break;
      case "left":
        newX = x - 1;
        break;
      case "right":
        newX = x + 1;
        break;
    }

    // Check bounds
    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
      return null;
    }

    // Check if it's a wall
    if (maze[newY][newX].isWall) {
      return null;
    }

    return { x: newX, y: newY };
  }

  public static calculateScore(
    gameState: MazeGameState,
    timeTaken: number,
  ): number {
    const config = this.getDifficultyConfig(gameState.difficulty);
    const timeBonus = Math.max(0, 300 - Math.floor(timeTaken / 1000)); // Bonus for speed
    const difficultyMultiplier =
      gameState.difficulty === "hard"
        ? 3
        : gameState.difficulty === "medium"
          ? 2
          : 1;

    return (config.baseScore + timeBonus) * difficultyMultiplier;
  }

  public static isGameComplete(
    playerPosition: Position,
    endPosition: Position,
  ): boolean {
    return (
      playerPosition.x === endPosition.x && playerPosition.y === endPosition.y
    );
  }
}
