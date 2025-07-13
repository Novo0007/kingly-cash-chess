import {
  LudoGameState,
  LudoPiece,
  initializeLudoGame,
  getNextPlayer,
} from "./LudoGameLogic";

export interface EnhancedLudoGameState extends LudoGameState {
  gameMode: "classic" | "quick" | "tournament";
  timePerTurn: number;
  autoSkipTimer: boolean;
  allowSpectators: boolean;
  gameStartTime: number;
  totalMoves: number;
  capturedPieces: Record<string, number>;
  playerStats: Record<
    string,
    {
      totalMoves: number;
      capturedPieces: number;
      piecesReachedHome: number;
      averageTurnTime: number;
      longestStreak: number;
      totalRolls: number;
      sixes: number;
    }
  >;
  powerUps?: {
    doubleMove: boolean;
    skipOpponent: boolean;
    safePiece: boolean;
  };
}

export interface LudoGameEffects {
  diceRollAnimation: boolean;
  pieceMovementAnimation: boolean;
  captureEffect: boolean;
  winnerCelebration: boolean;
  soundEffects: boolean;
}

export class EnhancedLudoGameEngine {
  private state: EnhancedLudoGameState;
  private effects: LudoGameEffects;
  private turnTimer: NodeJS.Timeout | null = null;

  constructor(
    playerCount: number = 4,
    gameMode: "classic" | "quick" | "tournament" = "classic",
  ) {
    const baseState = initializeLudoGame(playerCount);

    this.state = {
      ...baseState,
      gameMode,
      timePerTurn: gameMode === "quick" ? 15 : 30,
      autoSkipTimer: true,
      allowSpectators: true,
      gameStartTime: Date.now(),
      totalMoves: 0,
      capturedPieces: {},
      playerStats: {},
      powerUps: {
        doubleMove: false,
        skipOpponent: false,
        safePiece: false,
      },
    };

    // Initialize player stats
    this.state.playerColors.forEach((color) => {
      this.state.playerStats[color] = {
        totalMoves: 0,
        capturedPieces: 0,
        piecesReachedHome: 0,
        averageTurnTime: 0,
        longestStreak: 0,
        totalRolls: 0,
        sixes: 0,
      };
      this.state.capturedPieces[color] = 0;
    });

    this.effects = {
      diceRollAnimation: true,
      pieceMovementAnimation: true,
      captureEffect: true,
      winnerCelebration: true,
      soundEffects: true,
    };
  }

  // Enhanced dice roll with effects
  public rollDice(playerId: string): Promise<number> {
    return new Promise((resolve) => {
      if (this.state.currentPlayer !== playerId) {
        throw new Error("Not your turn!");
      }

      // Start animation effect
      if (this.effects.diceRollAnimation) {
        this.triggerDiceRollAnimation();
      }

      // Simulate dice roll delay
      setTimeout(
        () => {
          const value = Math.floor(Math.random() * 6) + 1;

          // Update player stats
          this.state.playerStats[playerId].totalRolls++;
          if (value === 6) {
            this.state.playerStats[playerId].sixes++;
          }

          this.state.diceValue = value;
          this.state.lastRoll = value;

          // Handle consecutive sixes
          if (value === 6) {
            this.state.consecutiveSixes++;
            if (this.state.consecutiveSixes >= 3) {
              // Skip turn after 3 sixes
              this.endTurn();
            }
          } else {
            this.state.consecutiveSixes = 0;
          }

          resolve(value);
        },
        this.effects.diceRollAnimation ? 1000 : 100,
      );
    });
  }

  // Enhanced piece movement with validation and effects
  public async movePiece(
    playerId: string,
    pieceId: number,
    steps: number,
  ): Promise<boolean> {
    if (this.state.currentPlayer !== playerId || !this.state.diceValue) {
      return false;
    }

    const playerPieces = this.state.pieces[playerId];
    const piece = playerPieces[pieceId];

    if (!piece) return false;

    // Validate move
    if (!this.isValidMove(piece, steps)) {
      return false;
    }

    // Execute move with animation
    if (this.effects.pieceMovementAnimation) {
      await this.animatePieceMovement(piece, steps);
    }

    const result = this.executePieceMove(playerId, piece, steps);

    if (result.success) {
      // Update stats
      this.state.playerStats[playerId].totalMoves++;
      this.state.totalMoves++;

      // Handle captures
      if (result.capturedOpponent) {
        this.state.playerStats[playerId].capturedPieces++;
        this.state.capturedPieces[playerId]++;

        if (this.effects.captureEffect) {
          this.triggerCaptureEffect(result.capturedOpponent);
        }
      }

      // Check for home arrival
      if (result.reachedHome) {
        this.state.playerStats[playerId].piecesReachedHome++;
      }

      // Check win condition
      if (this.checkWinCondition(playerId)) {
        this.handleGameWin(playerId);
        return true;
      }

      // End turn if not a 6
      if (this.state.diceValue !== 6) {
        this.endTurn();
      } else {
        // Reset dice for another roll
        this.state.diceValue = null;
      }
    }

    return result.success;
  }

  private isValidMove(piece: LudoPiece, steps: number): boolean {
    // Home pieces can only move out with a 6
    if (piece.position === "home") {
      return steps === 6;
    }

    // Finished pieces cannot move
    if (piece.position === "finished") {
      return false;
    }

    // Check if the move would exceed the path
    if (piece.position === "active") {
      const newPosition = piece.pathPosition + steps;
      return newPosition <= 57; // Max path position
    }

    return false;
  }

  private executePieceMove(
    playerId: string,
    piece: LudoPiece,
    steps: number,
  ): {
    success: boolean;
    capturedOpponent?: string;
    reachedHome?: boolean;
  } {
    // Move piece from home
    if (piece.position === "home" && steps === 6) {
      piece.position = "active";
      piece.pathPosition = 0;
      // Set board position based on color start position
      const startPos = this.getStartPosition(playerId);
      piece.row = startPos[0];
      piece.col = startPos[1];
      return { success: true };
    }

    // Move active piece
    if (piece.position === "active") {
      const newPathPosition = piece.pathPosition + steps;

      // Check if reaching home
      if (newPathPosition >= 57) {
        piece.position = "finished";
        piece.pathPosition = 57;
        return { success: true, reachedHome: true };
      }

      // Normal move
      piece.pathPosition = newPathPosition;
      const newBoardPos = this.getPathPosition(playerId, newPathPosition);
      piece.row = newBoardPos[0];
      piece.col = newBoardPos[1];

      // Check for captures
      const capturedOpponent = this.checkForCapture(playerId, newBoardPos);

      return {
        success: true,
        capturedOpponent: capturedOpponent || undefined,
      };
    }

    return { success: false };
  }

  private checkForCapture(
    playerId: string,
    position: [number, number],
  ): string | null {
    // Check if position is safe
    if (this.isSafePosition(position)) {
      return null;
    }

    // Check for opponent pieces at this position
    for (const [opponentColor, pieces] of Object.entries(this.state.pieces)) {
      if (opponentColor === playerId) continue;

      for (const piece of pieces) {
        if (
          piece.row === position[0] &&
          piece.col === position[1] &&
          piece.position === "active"
        ) {
          // Capture the piece - send it home
          piece.position = "home";
          piece.pathPosition = -1;
          const homePos = this.getHomePosition(opponentColor);
          piece.row = homePos[0];
          piece.col = homePos[1];

          return opponentColor;
        }
      }
    }

    return null;
  }

  private checkWinCondition(playerId: string): boolean {
    const pieces = this.state.pieces[playerId];
    return pieces.filter((p) => p.position === "finished").length === 4;
  }

  private endTurn(): void {
    this.state.currentPlayer = getNextPlayer(
      this.state.currentPlayer,
      this.state.playerColors,
    );
    this.state.diceValue = null;
    this.state.consecutiveSixes = 0;
    this.state.turnStartTime = Date.now();

    // Start turn timer if enabled
    if (this.state.autoSkipTimer) {
      this.startTurnTimer();
    }
  }

  private startTurnTimer(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
    }

    this.turnTimer = setTimeout(() => {
      // Auto-skip turn
      this.endTurn();
    }, this.state.timePerTurn * 1000);
  }

  private handleGameWin(winner: string): void {
    this.state.gamePhase = "ended";

    if (this.effects.winnerCelebration) {
      this.triggerWinnerCelebration(winner);
    }

    // Calculate final stats
    this.calculateFinalStats();
  }

  private calculateFinalStats(): void {
    const gameDuration = Date.now() - this.state.gameStartTime;

    Object.keys(this.state.playerStats).forEach((playerId) => {
      const stats = this.state.playerStats[playerId];
      stats.averageTurnTime = gameDuration / (stats.totalRolls || 1);
    });
  }

  // Helper methods for positions
  private getStartPosition(color: string): [number, number] {
    const positions = {
      red: [6, 1],
      blue: [1, 8],
      green: [8, 13],
      yellow: [13, 6],
    };
    return positions[color as keyof typeof positions] || [0, 0];
  }

  private getHomePosition(color: string): [number, number] {
    const positions = {
      red: [2, 2],
      blue: [2, 12],
      green: [12, 12],
      yellow: [12, 2],
    };
    return positions[color as keyof typeof positions] || [0, 0];
  }

  private getPathPosition(color: string, pathIndex: number): [number, number] {
    // This would map to the actual path positions for each color
    // Simplified for this example
    return [0, 0];
  }

  private isSafePosition(position: [number, number]): boolean {
    const safePositions = [
      [1, 6],
      [6, 1],
      [8, 1],
      [13, 6],
      [13, 8],
      [8, 13],
      [6, 13],
      [1, 8],
      [6, 2],
      [2, 8],
      [8, 12],
      [12, 6],
    ];

    return safePositions.some(
      ([r, c]) => r === position[0] && c === position[1],
    );
  }

  // Animation and effect methods
  private triggerDiceRollAnimation(): void {
    // Implement dice roll animation
  }

  private async animatePieceMovement(
    piece: LudoPiece,
    steps: number,
  ): Promise<void> {
    // Implement piece movement animation
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  private triggerCaptureEffect(capturedPlayer: string): void {
    // Implement capture effect animation
  }

  private triggerWinnerCelebration(winner: string): void {
    // Implement winner celebration animation
  }

  // Public getters
  public getState(): EnhancedLudoGameState {
    return { ...this.state };
  }

  public getEffects(): LudoGameEffects {
    return { ...this.effects };
  }

  public updateEffects(newEffects: Partial<LudoGameEffects>): void {
    this.effects = { ...this.effects, ...newEffects };
  }

  public getPlayerStats(playerId: string) {
    return this.state.playerStats[playerId] || null;
  }

  public getGameDuration(): number {
    return Date.now() - this.state.gameStartTime;
  }

  public cleanup(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
  }
}
