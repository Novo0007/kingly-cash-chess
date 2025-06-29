
// Ludo game logic utilities
export interface LudoPiece {
  id: number;
  position: "home" | "active" | "finished";
  row: number;
  col: number;
  pathPosition: number;
  isOut: boolean;
}

export interface LudoGameState {
  pieces: Record<string, LudoPiece[]>;
  currentPlayer: string;
  diceValue: number | null;
  gamePhase: "rolling" | "moving" | "ended";
  playerColors: string[];
  moveHistory: any[];
  lastRoll: number | null;
  consecutiveSixes: number;
  turnStartTime: number;
}

// Board configuration
export const BOARD_SIZE = 15;
export const COLORS = ["red", "blue", "green", "yellow"];
export const MAX_PATH_POSITION = 57;

// Starting positions for each color
export const HOME_POSITIONS: Record<string, [number, number]> = {
  red: [2, 2],
  blue: [2, 12],
  green: [12, 12],
  yellow: [12, 2],
};

export const START_POSITIONS: Record<string, [number, number]> = {
  red: [6, 1],
  blue: [1, 8],
  green: [8, 13],
  yellow: [13, 6],
};

// Safe positions on the board
export const SAFE_POSITIONS: [number, number][] = [
  [1, 6], [6, 1], [8, 1], [13, 6],
  [13, 8], [8, 13], [6, 13], [1, 8],
  [6, 2], [2, 8], [8, 12], [12, 6], // Starting positions are also safe
];

// Path for each color (simplified - full path around the board)
export const COLOR_PATHS: Record<string, [number, number][]> = {
  red: [
    // Starting from red start position and going clockwise
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [1, 7], [1, 8],
    [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
    [7, 13], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [8, 8],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [13, 7], [13, 6],
    [12, 6], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7] // Home stretch to center
  ],
  blue: [
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [7, 13], [8, 13],
    [8, 12], [8, 11], [8, 10], [8, 9], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
    [13, 7], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [7, 1], [6, 1],
    [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]
  ],
  green: [
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [8, 8],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [13, 7], [13, 6],
    [12, 6], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
    [7, 1], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [1, 7], [1, 8],
    [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8], [7, 7]
  ],
  yellow: [
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [7, 1], [6, 1],
    [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
    [1, 7], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [7, 13], [8, 13],
    [8, 12], [8, 11], [8, 10], [8, 9], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7], [7, 7]
  ],
};

export const canMovePieceOut = (diceValue: number): boolean => {
  return diceValue === 6;
};

export const canCapture = (fromPos: [number, number], toPos: [number, number]): boolean => {
  // Can't capture on safe positions
  return !SAFE_POSITIONS.some(([r, c]) => r === toPos[0] && c === toPos[1]);
};

export const calculateNewPosition = (
  color: string,
  currentPathPosition: number,
  steps: number
): [number, number] | null => {
  const path = COLOR_PATHS[color];
  const newPathPosition = currentPathPosition + steps;
  
  if (newPathPosition >= path.length) {
    return null; // Invalid move
  }
  
  return path[newPathPosition];
};

export const isWinCondition = (pieces: LudoPiece[]): boolean => {
  return pieces.filter(piece => piece.position === "finished").length === 4;
};

export const getNextPlayer = (currentPlayer: string, playerColors: string[]): string => {
  const currentIndex = playerColors.indexOf(currentPlayer);
  return playerColors[(currentIndex + 1) % playerColors.length];
};

export const initializeLudoGame = (playerCount: number): LudoGameState => {
  const activeColors = COLORS.slice(0, playerCount);
  const pieces: Record<string, LudoPiece[]> = {};

  activeColors.forEach((color) => {
    const homePos = HOME_POSITIONS[color];
    pieces[color] = Array(4).fill(null).map((_, index) => ({
      id: index,
      position: "home" as const,
      row: homePos[0] + Math.floor(index / 2),
      col: homePos[1] + (index % 2),
      pathPosition: -1,
      isOut: false,
    }));
  });

  return {
    pieces,
    currentPlayer: "red",
    diceValue: null,
    gamePhase: "rolling",
    playerColors: activeColors,
    moveHistory: [],
    lastRoll: null,
    consecutiveSixes: 0,
    turnStartTime: Date.now(),
  };
};
