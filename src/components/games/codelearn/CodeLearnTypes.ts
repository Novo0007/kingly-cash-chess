export interface CodeLanguage {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalLessons: number;
  estimatedHours: number;
}

export interface CodeLesson {
  id: string;
  languageId: string;
  unitId: string;
  title: string;
  description: string;
  type: "concept" | "practice" | "challenge" | "project" | "quiz";
  difficulty: number; // 1-5
  xpReward: number;
  coinReward: number;
  order: number;
  prerequisiteIds: string[];
  content: LessonContent;
  isCompleted: boolean;
  isUnlocked: boolean;
  bestScore?: number;
  attempts: number;
}

export interface LessonContent {
  explanation?: string;
  codeExample?: string;
  exercises: Exercise[];
  hints?: string[];
  resources?: Resource[];
}

export interface Exercise {
  id: string;
  type:
    | "multiple-choice"
    | "fill-blank"
    | "code-completion"
    | "debug"
    | "write-function"
    | "match-pairs";
  question: string;
  code?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  coinReward: number;
}

export interface Resource {
  title: string;
  type: "article" | "video" | "documentation" | "example" | "pdf";
  url: string;
}

export interface CodeUnit {
  id: string;
  languageId: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  color: string;
  lessons: CodeLesson[];
  isUnlocked: boolean;
  completedLessons: number;
  totalLessons: number;
}

export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  totalCoins: number;
  availableCoins: number;
  coinsSpent: number;
  level: number;
  completedLessons: number;
  totalTimeSpent: number; // in minutes
  lastActiveDate: string;
  languageProgress: Record<string, LanguageProgress>;
  achievements: Achievement[];
  dailyGoalXP: number;
  todayXP: number;
  dailyGoalCoins: number;
  todayCoins: number;
}

export interface LanguageProgress {
  languageId: string;
  level: number;
  xp: number;
  coins: number;
  completedUnits: number;
  totalUnits: number;
  completedLessons: number;
  totalLessons: number;
  accuracy: number;
  currentUnit: string;
  timeSpent: number;
  startDate: string;
  lastActiveDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | "streak"
    | "completion"
    | "accuracy"
    | "speed"
    | "exploration"
    | "milestone";
  requirement: {
    type: string;
    value: number;
    languageId?: string;
  };
  xpReward: number;
  coinReward: number;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  languageId: string;
  category: string;
  timeLimit?: number; // in minutes
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  xpReward: number;
  coinReward: number;
  hints: string[];
  isCompleted: boolean;
  bestTime?: number;
  attempts: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface DailyChallenge {
  id: string;
  date: string;
  challenge: CodeChallenge;
  xpBonus: number;
  participantCount: number;
  isCompleted: boolean;
}

export interface Leaderboard {
  period: "daily" | "weekly" | "monthly" | "all-time";
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  rank: number;
  country?: string;
  completedLessons: number;
  accuracy: number;
}

export interface CodeSession {
  id: string;
  userId: string;
  lessonId: string;
  startTime: number;
  endTime?: number;
  score: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  exerciseResults: ExerciseResult[];
  timeSpent: number;
  hintsUsed: number;
  completed: boolean;
}

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
  hintsUsed: number;
  answer: string;
}

// Coin system interfaces
export interface CoinTransaction {
  id: string;
  userId: string;
  type: "earned" | "spent" | "bonus" | "penalty";
  amount: number;
  source:
    | "lesson"
    | "exercise"
    | "achievement"
    | "daily_bonus"
    | "purchase"
    | "hint"
    | "skip";
  sourceId: string;
  description: string;
  timestamp: string;
}

export interface CoinReward {
  amount: number;
  source: string;
  multiplier?: number;
  bonus?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: "hint" | "skip" | "unlock" | "theme" | "boost" | "cosmetic";
  category: string;
  isUnlocked: boolean;
  isPurchased: boolean;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effect: {
    type:
      | "xp_multiplier"
      | "coin_multiplier"
      | "hint_reveal"
      | "skip_exercise"
      | "unlock_lesson";
    value: number;
    duration?: number; // in minutes, for temporary effects
  };
  isActive: boolean;
  expiresAt?: string;
}

// Game state interfaces
export interface CodeLearnGameState {
  currentLanguage: CodeLanguage | null;
  currentUnit: CodeUnit | null;
  currentLesson: CodeLesson | null;
  currentExercise: Exercise | null;
  exerciseIndex: number;
  userProgress: UserProgress;
  session: CodeSession | null;
  gameMode: "lesson" | "challenge" | "daily" | "practice";
  isLoading: boolean;
  showHints: boolean;
  showExplanation: boolean;
}

// Study Materials
export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "article" | "interactive";
  language: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  rating: number;
  downloads: number;
  url: string;
  thumbnail?: string;
  topics: string[];
  fileSize?: string;
  lastUpdated?: string;
}

export const LANGUAGES: CodeLanguage[] = [
  {
    id: "study-guide",
    name: "Programming Fundamentals",
    icon: "📖",
    color: "#9C27B0",
    description:
      "Essential programming concepts and best practices for beginners",
    difficulty: "beginner",
    totalLessons: 25,
    estimatedHours: 12,
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    color: "#F7DF1E",
    description:
      "Learn the language of the web with interactive exercises and modern ES6+ features",
    difficulty: "beginner",
    totalLessons: 150,
    estimatedHours: 45,
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#3776AB",
    description:
      "Master Python for data science, web development, AI, and automation",
    difficulty: "beginner",
    totalLessons: 140,
    estimatedHours: 40,
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "#ED8B00",
    description:
      "Build robust enterprise applications with Java's object-oriented programming",
    difficulty: "intermediate",
    totalLessons: 130,
    estimatedHours: 55,
  },
  {
    id: "cpp",
    name: "C++",
    icon: "⚙️",
    color: "#00599C",
    description:
      "Master system programming, game development, and high-performance applications",
    difficulty: "advanced",
    totalLessons: 160,
    estimatedHours: 70,
  },
  {
    id: "csharp",
    name: "C#",
    icon: "🔷",
    color: "#239120",
    description:
      "Develop desktop, web, and mobile applications with Microsoft's C#",
    difficulty: "intermediate",
    totalLessons: 120,
    estimatedHours: 50,
  },
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    color: "#61DAFB",
    description:
      "Build modern, responsive web applications with React and hooks",
    difficulty: "intermediate",
    totalLessons: 100,
    estimatedHours: 35,
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "📘",
    color: "#007ACC",
    description:
      "Add type safety to JavaScript with TypeScript for better development",
    difficulty: "intermediate",
    totalLessons: 90,
    estimatedHours: 30,
  },
  {
    id: "nodejs",
    name: "Node.js",
    icon: "🟢",
    color: "#68A063",
    description: "Build server-side applications and APIs with JavaScript",
    difficulty: "intermediate",
    totalLessons: 85,
    estimatedHours: 32,
  },
  {
    id: "go",
    name: "Go",
    icon: "🔵",
    color: "#00ADD8",
    description:
      "Learn Google's Go language for efficient concurrent programming",
    difficulty: "intermediate",
    totalLessons: 75,
    estimatedHours: 28,
  },
  {
    id: "rust",
    name: "Rust",
    icon: "🦀",
    color: "#CE422B",
    description: "Master memory-safe systems programming with Rust",
    difficulty: "advanced",
    totalLessons: 95,
    estimatedHours: 45,
  },
  {
    id: "swift",
    name: "Swift",
    icon: "🍃",
    color: "#FA7343",
    description: "Develop iOS and macOS applications with Apple's Swift",
    difficulty: "intermediate",
    totalLessons: 110,
    estimatedHours: 42,
  },
  {
    id: "kotlin",
    name: "Kotlin",
    icon: "🔶",
    color: "#7F52FF",
    description: "Modern Android development with Kotlin's concise syntax",
    difficulty: "intermediate",
    totalLessons: 105,
    estimatedHours: 38,
  },
  {
    id: "php",
    name: "PHP",
    icon: "🐘",
    color: "#777BB4",
    description:
      "Build dynamic web applications with PHP and popular frameworks",
    difficulty: "beginner",
    totalLessons: 95,
    estimatedHours: 35,
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "💎",
    color: "#CC342D",
    description: "Learn elegant programming with Ruby and Ruby on Rails",
    difficulty: "beginner",
    totalLessons: 85,
    estimatedHours: 32,
  },
  {
    id: "vue",
    name: "Vue.js",
    icon: "💚",
    color: "#4FC08D",
    description: "Build progressive web applications with Vue.js framework",
    difficulty: "intermediate",
    totalLessons: 80,
    estimatedHours: 30,
  },
  {
    id: "angular",
    name: "Angular",
    icon: "🅰️",
    color: "#DD0031",
    description: "Develop enterprise-scale applications with Angular framework",
    difficulty: "advanced",
    totalLessons: 120,
    estimatedHours: 48,
  },
  {
    id: "sql",
    name: "SQL & Databases",
    icon: "🗄️",
    color: "#336791",
    description:
      "Master database design, queries, and data management with SQL",
    difficulty: "beginner",
    totalLessons: 70,
    estimatedHours: 25,
  },
  {
    id: "algorithms",
    name: "Algorithms & Data Structures",
    icon: "🧮",
    color: "#FF6B6B",
    description:
      "Essential computer science concepts for problem-solving and interviews",
    difficulty: "advanced",
    totalLessons: 100,
    estimatedHours: 50,
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: "🤖",
    color: "#FF9500",
    description:
      "Introduction to AI and machine learning with practical projects",
    difficulty: "advanced",
    totalLessons: 90,
    estimatedHours: 60,
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    category: "milestone",
    requirement: { type: "lessons-completed", value: 1 },
    xpReward: 50,
    coinReward: 25,
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
  },
  {
    id: "streak-3",
    title: "Getting Consistent",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    category: "streak",
    requirement: { type: "daily-streak", value: 3 },
    xpReward: 100,
    coinReward: 50,
    progress: 0,
    maxProgress: 3,
    isUnlocked: false,
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    category: "streak",
    requirement: { type: "daily-streak", value: 7 },
    xpReward: 250,
    coinReward: 100,
    progress: 0,
    maxProgress: 7,
    isUnlocked: false,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete 10 lessons with 100% accuracy",
    icon: "💯",
    category: "accuracy",
    requirement: { type: "perfect-lessons", value: 10 },
    xpReward: 300,
    coinReward: 150,
    progress: 0,
    maxProgress: 10,
    isUnlocked: false,
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete 5 lessons in under 3 minutes each",
    icon: "💨",
    category: "speed",
    requirement: { type: "fast-completion", value: 5 },
    xpReward: 200,
    coinReward: 75,
    progress: 0,
    maxProgress: 5,
    isUnlocked: false,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try 3 different programming languages",
    icon: "🗺️",
    category: "exploration",
    requirement: { type: "languages-tried", value: 3 },
    xpReward: 400,
    coinReward: 200,
    progress: 0,
    maxProgress: 3,
    isUnlocked: false,
  },
  {
    id: "unit-master",
    title: "Unit Master",
    description: "Complete an entire unit",
    icon: "🏆",
    category: "completion",
    requirement: { type: "units-completed", value: 1 },
    xpReward: 500,
    coinReward: 250,
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
  },
  {
    id: "coin-collector",
    title: "Coin Collector",
    description: "Earn 1000 coins total",
    icon: "🪙",
    category: "milestone",
    requirement: { type: "coins-earned", value: 1000 },
    xpReward: 300,
    coinReward: 100,
    progress: 0,
    maxProgress: 1000,
    isUnlocked: false,
  },
  {
    id: "big-spender",
    title: "Big Spender",
    description: "Spend 500 coins in the shop",
    icon: "💰",
    category: "milestone",
    requirement: { type: "coins-spent", value: 500 },
    xpReward: 250,
    coinReward: 150,
    progress: 0,
    maxProgress: 500,
    isUnlocked: false,
  },
];
