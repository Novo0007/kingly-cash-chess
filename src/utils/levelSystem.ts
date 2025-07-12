export interface Level {
  level: number;
  gridSize: number;
  wordCount: number;
  timeLimit: number; // in seconds
  difficulty: "easy" | "medium" | "hard" | "expert";
  requiredScore: number;
  wordsPool: string[];
  theme: string;
  description: string;
}

// Generate 99 unique levels with increasing difficulty
export const generateLevels = (): Level[] => {
  const levels: Level[] = [];

  const themes = [
    "Animals",
    "Food",
    "Countries",
    "Sports",
    "Technology",
    "Nature",
    "Music",
    "Movies",
    "Science",
    "History",
    "Space",
    "Ocean",
    "Mountains",
    "Cities",
    "Colors",
    "Weather",
    "Transportation",
    "Professions",
    "Emotions",
    "Body Parts",
    "Clothing",
    "Furniture",
    "Kitchen",
    "Garden",
    "School",
    "Hospital",
    "Library",
    "Park",
    "Beach",
    "Forest",
    "Desert",
    "Arctic",
    "Jungle",
    "Mythology",
    "Literature",
    "Art",
    "Architecture",
    "Fashion",
    "Beauty",
    "Health",
    "Fitness",
    "Travel",
    "Adventure",
    "Mystery",
    "Romance",
    "Horror",
    "Comedy",
    "Drama",
    "Action",
    "Fantasy",
  ];

  const wordPools = {
    Animals: [
      "CAT",
      "DOG",
      "LION",
      "TIGER",
      "ELEPHANT",
      "GIRAFFE",
      "MONKEY",
      "ZEBRA",
      "BEAR",
      "WOLF",
      "FOX",
      "RABBIT",
      "DEER",
      "HORSE",
      "COW",
      "PIG",
      "SHEEP",
      "GOAT",
      "CHICKEN",
      "DUCK",
      "EAGLE",
      "HAWK",
      "OWL",
      "PARROT",
      "PENGUIN",
      "DOLPHIN",
      "WHALE",
      "SHARK",
      "FISH",
      "OCTOPUS",
    ],
    Food: [
      "APPLE",
      "BANANA",
      "ORANGE",
      "GRAPE",
      "STRAWBERRY",
      "PIZZA",
      "BURGER",
      "PASTA",
      "RICE",
      "BREAD",
      "CHEESE",
      "MILK",
      "CHICKEN",
      "BEEF",
      "FISH",
      "SALAD",
      "SOUP",
      "CAKE",
      "COOKIE",
      "CHOCOLATE",
      "ICE",
      "COFFEE",
      "TEA",
      "WATER",
      "JUICE",
      "SANDWICH",
      "TACO",
      "SUSHI",
      "NOODLES",
      "HONEY",
    ],
    Countries: [
      "USA",
      "CANADA",
      "MEXICO",
      "BRAZIL",
      "ARGENTINA",
      "FRANCE",
      "GERMANY",
      "ITALY",
      "SPAIN",
      "RUSSIA",
      "CHINA",
      "JAPAN",
      "INDIA",
      "AUSTRALIA",
      "EGYPT",
      "NIGERIA",
      "KENYA",
      "MOROCCO",
      "NORWAY",
      "SWEDEN",
      "POLAND",
      "GREECE",
      "TURKEY",
      "ISRAEL",
      "THAILAND",
      "VIETNAM",
      "KOREA",
      "INDONESIA",
      "MALAYSIA",
      "SINGAPORE",
    ],
    Sports: [
      "FOOTBALL",
      "BASKETBALL",
      "BASEBALL",
      "SOCCER",
      "TENNIS",
      "GOLF",
      "SWIMMING",
      "RUNNING",
      "CYCLING",
      "BOXING",
      "WRESTLING",
      "VOLLEYBALL",
      "BADMINTON",
      "CRICKET",
      "HOCKEY",
      "SKIING",
      "SNOWBOARDING",
      "SURFING",
      "SKATEBOARDING",
      "CLIMBING",
      "HIKING",
      "DANCING",
      "YOGA",
      "KARATE",
      "JUDO",
      "GYMNASTICS",
      "TRACK",
      "MARATHON",
      "TRIATHLON",
      "RACING",
    ],
    Technology: [
      "COMPUTER",
      "PHONE",
      "TABLET",
      "LAPTOP",
      "KEYBOARD",
      "MOUSE",
      "MONITOR",
      "PRINTER",
      "SCANNER",
      "CAMERA",
      "ROBOT",
      "DRONE",
      "INTERNET",
      "WIFI",
      "BLUETOOTH",
      "SOFTWARE",
      "HARDWARE",
      "CODING",
      "PROGRAMMING",
      "ALGORITHM",
      "DATABASE",
      "NETWORK",
      "SERVER",
      "CLOUD",
      "ARTIFICIAL",
      "INTELLIGENCE",
      "MACHINE",
      "LEARNING",
      "VIRTUAL",
      "REALITY",
    ],
  };

  for (let i = 1; i <= 99; i++) {
    const levelGroup = Math.floor((i - 1) / 25); // 0-3 for 4 difficulty groups
    const themeIndex = (i - 1) % themes.length;
    const theme = themes[themeIndex];

    let difficulty: "easy" | "medium" | "hard" | "expert";
    let gridSize: number;
    let wordCount: number;
    let timeLimit: number;

    if (i <= 15) {
      difficulty = "easy";
      gridSize = Math.min(8 + Math.floor(i / 3), 12);
      wordCount = Math.min(3 + Math.floor(i / 2), 8);
      timeLimit = Math.max(180 - i * 5, 120);
    } else if (i <= 35) {
      difficulty = "medium";
      gridSize = Math.min(10 + Math.floor((i - 15) / 3), 15);
      wordCount = Math.min(5 + Math.floor((i - 15) / 2), 12);
      timeLimit = Math.max(150 - (i - 15) * 3, 90);
    } else if (i <= 65) {
      difficulty = "hard";
      gridSize = Math.min(12 + Math.floor((i - 35) / 3), 18);
      wordCount = Math.min(7 + Math.floor((i - 35) / 2), 16);
      timeLimit = Math.max(120 - (i - 35) * 2, 60);
    } else {
      difficulty = "expert";
      gridSize = Math.min(15 + Math.floor((i - 65) / 3), 20);
      wordCount = Math.min(10 + Math.floor((i - 65) / 2), 20);
      timeLimit = Math.max(100 - (i - 65), 45);
    }

    // Calculate required score based on new progression:
    // Level 1: 100, increases by 75 until level 15
    // Level 16-36: increases by 95
    // Level 37+: increases by 120
    let requiredScore: number;

    if (i === 1) {
      requiredScore = 100;
    } else if (i <= 15) {
      // Levels 2-15: start from 100, increase by 75 each level
      requiredScore = 100 + (i - 1) * 75;
    } else if (i <= 36) {
      // Levels 16-36: continue from level 15, increase by 95 each level
      const level15Score = 100 + 14 * 75; // 1150
      requiredScore = level15Score + (i - 15) * 95;
    } else {
      // Levels 37+: continue from level 36, increase by 120 each level
      const level15Score = 100 + 14 * 75; // 1150
      const level36Score = level15Score + 21 * 95; // 3145
      requiredScore = level36Score + (i - 36) * 120;
    }
    const availableWords =
      wordPools[theme as keyof typeof wordPools] || wordPools["Animals"];

    levels.push({
      level: i,
      gridSize,
      wordCount,
      timeLimit,
      difficulty,
      requiredScore,
      wordsPool: availableWords,
      theme,
      description: `Level ${i}: Find ${wordCount} ${theme.toLowerCase()} words in a ${gridSize}x${gridSize} grid within ${Math.floor(timeLimit / 60)}:${(timeLimit % 60).toString().padStart(2, "0")} minutes`,
    });
  }

  return levels;
};

export const LEVELS = generateLevels();

export const getLevelInfo = (level: number): Level | null => {
  return LEVELS.find((l) => l.level === level) || null;
};

export const getNextLevel = (currentLevel: number): Level | null => {
  if (currentLevel >= 99) return null;
  return getLevelInfo(currentLevel + 1);
};

export const calculateLevelScore = (
  level: Level,
  timeTaken: number,
  wordsFound: number,
  hintsUsed: number,
): number => {
  const baseScore = wordsFound * 100;
  const timeBonus = Math.max(0, (level.timeLimit - timeTaken) * 10);
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3,
  }[level.difficulty];
  const hintPenalty = hintsUsed * 50;

  return Math.floor(
    (baseScore + timeBonus) * difficultyMultiplier - hintPenalty,
  );
};

export const shouldUnlockNextLevel = (score: number, level: Level): boolean => {
  return score >= level.requiredScore;
};

export const calculatePlayerLevel = (totalScore: number): number => {
  // Calculate player level based on new scoring progression
  // Level 1: 100 points
  // Level 2-15: increases by 75 each level
  // Level 16-36: increases by 95 each level
  // Level 37+: increases by 120 each level

  if (totalScore < 100) return 1;

  // Check levels 1-15 (increases by 75)
  for (let level = 1; level <= 15; level++) {
    const requiredScore = 100 + (level - 1) * 75;
    if (totalScore < requiredScore) {
      return Math.max(1, level - 1);
    }
  }

  // Check levels 16-36 (increases by 95)
  const level15Score = 100 + 14 * 75; // 1150
  for (let level = 16; level <= 36; level++) {
    const requiredScore = level15Score + (level - 15) * 95;
    if (totalScore < requiredScore) {
      return level - 1;
    }
  }

  // Check levels 37+ (increases by 120)
  const level36Score = level15Score + 21 * 95; // 3145
  let level = 37;

  while (level <= 99) {
    const requiredScore = level36Score + (level - 36) * 120;
    if (totalScore < requiredScore) {
      return level - 1;
    }
    level++;
  }

  return 99; // Cap at level 99
};
