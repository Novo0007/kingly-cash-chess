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
}

export interface Resource {
  title: string;
  type: "article" | "video" | "documentation" | "example";
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
  level: number;
  completedLessons: number;
  totalTimeSpent: number; // in minutes
  lastActiveDate: string;
  languageProgress: Record<string, LanguageProgress>;
  achievements: Achievement[];
  dailyGoalXP: number;
  todayXP: number;
}

export interface LanguageProgress {
  languageId: string;
  level: number;
  xp: number;
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
  level: number;
  streak: number;
  rank: number;
  country?: string;
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

export const LANGUAGES: CodeLanguage[] = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    color: "#F7DF1E",
    description: "Learn the language of the web with interactive exercises",
    difficulty: "beginner",
    totalLessons: 120,
    estimatedHours: 40,
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#3776AB",
    description:
      "Master Python for data science, web development, and automation",
    difficulty: "beginner",
    totalLessons: 100,
    estimatedHours: 35,
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "#ED8B00",
    description:
      "Build robust applications with Java's object-oriented programming",
    difficulty: "intermediate",
    totalLessons: 110,
    estimatedHours: 50,
  },
  {
    id: "cpp",
    name: "C++",
    icon: "⚙️",
    color: "#00599C",
    description: "Master system programming and high-performance applications",
    difficulty: "advanced",
    totalLessons: 130,
    estimatedHours: 60,
  },
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    color: "#61DAFB",
    description: "Build modern web applications with React and JSX",
    difficulty: "intermediate",
    totalLessons: 80,
    estimatedHours: 30,
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "���",
    color: "#007ACC",
    description: "Add type safety to JavaScript with TypeScript",
    difficulty: "intermediate",
    totalLessons: 90,
    estimatedHours: 25,
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
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
  },
];
