import { Exercise, CodeLesson } from "./CodeLearnTypes";

// Utility functions to add coin rewards to existing lessons and exercises
export const addCoinRewardsToExercise = (exercise: Exercise): Exercise => {
  // If coin reward is already set, don't override it
  if ("coinReward" in exercise && exercise.coinReward !== undefined) {
    return exercise;
  }

  // Calculate coin reward based on exercise points and type
  let coinReward = Math.floor(exercise.points * 0.5); // Base: 50% of points as coins

  // Type-based bonuses
  switch (exercise.type) {
    case "code-completion":
    case "write-function":
      coinReward = Math.floor(coinReward * 1.5); // 50% bonus for coding exercises
      break;
    case "debug":
      coinReward = Math.floor(coinReward * 1.3); // 30% bonus for debugging
      break;
    case "multiple-choice":
    case "fill-blank":
      coinReward = Math.floor(coinReward * 1.0); // Base rate
      break;
    case "match-pairs":
      coinReward = Math.floor(coinReward * 1.2); // 20% bonus for matching
      break;
  }

  // Minimum coin reward
  coinReward = Math.max(coinReward, 1);

  return {
    ...exercise,
    coinReward,
  };
};

export const addCoinRewardsToLesson = (lesson: CodeLesson): CodeLesson => {
  // If coin reward is already set, don't override it
  if ("coinReward" in lesson && lesson.coinReward !== undefined) {
    return {
      ...lesson,
      content: {
        ...lesson.content,
        exercises: lesson.content.exercises.map(addCoinRewardsToExercise),
      },
    };
  }

  // Calculate lesson coin reward based on XP reward and difficulty
  let coinReward = Math.floor(lesson.xpReward * 0.5); // Base: 50% of XP as coins

  // Difficulty-based multiplier
  switch (lesson.difficulty) {
    case 1:
      coinReward = Math.floor(coinReward * 1.0); // Base rate for easy
      break;
    case 2:
      coinReward = Math.floor(coinReward * 1.2); // 20% bonus for medium
      break;
    case 3:
      coinReward = Math.floor(coinReward * 1.4); // 40% bonus for hard
      break;
    case 4:
      coinReward = Math.floor(coinReward * 1.6); // 60% bonus for expert
      break;
    case 5:
      coinReward = Math.floor(coinReward * 1.8); // 80% bonus for master
      break;
  }

  // Type-based bonuses
  switch (lesson.type) {
    case "challenge":
    case "project":
      coinReward = Math.floor(coinReward * 1.5); // 50% bonus for challenges/projects
      break;
    case "quiz":
      coinReward = Math.floor(coinReward * 1.3); // 30% bonus for quizzes
      break;
    case "practice":
      coinReward = Math.floor(coinReward * 1.2); // 20% bonus for practice
      break;
    case "concept":
      coinReward = Math.floor(coinReward * 1.0); // Base rate for concepts
      break;
  }

  // Minimum coin reward
  coinReward = Math.max(coinReward, 5);

  return {
    ...lesson,
    coinReward,
    content: {
      ...lesson.content,
      exercises: lesson.content.exercises.map(addCoinRewardsToExercise),
    },
  };
};

// Helper to process all lessons in a course
export const addCoinRewardsToLessons = (
  lessons: CodeLesson[],
): CodeLesson[] => {
  return lessons.map(addCoinRewardsToLesson);
};

// Quick setup for existing data - can be called in data service initialization
export const setupCoinRewards = () => {
  console.log("📋 Setting up coin rewards for all lessons and exercises...");
  console.log("💰 Coin rewards are now calculated based on:");
  console.log("  • Exercise points (50% base rate)");
  console.log("  • Exercise type (coding exercises get 50% bonus)");
  console.log("  • Lesson difficulty (higher difficulty = more coins)");
  console.log("  • Lesson type (challenges and projects get 50% bonus)");
  console.log("✅ Coin system ready!");
};
