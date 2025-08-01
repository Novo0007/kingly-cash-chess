import {
  MathGameLogic,
  MathQuestion,
  MathGameState,
  MathGameScore,
} from "./MathGameLogic";
import { MathLevelSystem, MathLevel, LevelProgress } from "./MathLevelSystem";

export interface LevelGameState
  extends Omit<MathGameState, "difficulty" | "gameMode"> {
  currentLevel: MathLevel;
  levelSystem: MathLevelSystem;
  errorsInLevel: number;
  isEliminated: boolean;
  levelCompleted: boolean;
  canContinue: boolean;
}

export interface LevelGameScore extends MathGameScore {
  level_number: number;
  elimination_mode: boolean;
  level_completed: boolean;
  final_accuracy: number;
}

export class MathLevelGameLogic {
  private state: LevelGameState;
  private questions: MathQuestion[] = [];
  private levelSystem: MathLevelSystem;

  constructor(levelSystem: MathLevelSystem, levelNumber?: number) {
    this.levelSystem = levelSystem;

    // Use provided level or current level from system
    const targetLevel = levelNumber || levelSystem.getProgress().currentLevel;
    const level = levelSystem.getLevel(targetLevel);

    if (!level || !level.unlocked) {
      throw new Error(`Level ${targetLevel} is not available or unlocked`);
    }

    this.state = {
      id: this.generateId(),
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: level.questionsRequired,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      maxStreak: 0,
  gameStatus: "waiting",
  startTime: Date.now(),
  timeRemaining: level.timePerQuestion,
      hintsUsed: 0,
      skipsUsed: 0,
      maxHints: level.eliminationMode ? 0 : level.difficulty === "easy" ? 2 : 1,
      maxSkips: level.eliminationMode ? 0 : 1,
      // Level-specific properties
      currentLevel: level,
      levelSystem: levelSystem,
      errorsInLevel: 0,
      isEliminated: false,
      levelCompleted: false,
      canContinue: true,
    };

    this.generateLevelQuestions();
    this.nextQuestion();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateLevelQuestions(): void {
    const level = this.state.currentLevel;

    for (let i = 0; i < level.questionsRequired; i++) {
      // Randomly select operation type from level's allowed operations
      const operationType =
        level.operations[Math.floor(Math.random() * level.operations.length)];
      const question = this.generateQuestionForLevel(operationType, level, i);
      this.questions.push(question);
    }
  }

  private generateQuestionForLevel(
    type: MathQuestion["type"],
    level: MathLevel,
    index: number,
  ): MathQuestion {
    const id = `level-${level.level}-q-${index}-${this.generateId()}`;
    const timeLimit = level.timePerQuestion;

    // Increase difficulty based on level number
    const difficultyMultiplier = 1 + (level.level - 1) * 0.1;

    switch (type) {
      case "addition":
        return this.generateLevelAddition(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      case "subtraction":
        return this.generateLevelSubtraction(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      case "multiplication":
        return this.generateLevelMultiplication(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      case "division":
        return this.generateLevelDivision(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      case "missing":
        return this.generateLevelMissing(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      case "pattern":
        return this.generateLevelPattern(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
      default:
        return this.generateLevelAddition(
          id,
          timeLimit,
          level.level,
          difficultyMultiplier,
        );
    }
  }

  private generateLevelAddition(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    let a: number, b: number;

    if (levelNum <= 10) {
      a = Math.floor(Math.random() * (10 * multiplier)) + 1;
      b = Math.floor(Math.random() * (10 * multiplier)) + 1;
    } else if (levelNum <= 30) {
      a = Math.floor(Math.random() * (50 * multiplier)) + 10;
      b = Math.floor(Math.random() * (50 * multiplier)) + 10;
    } else {
      a = Math.floor(Math.random() * (200 * multiplier)) + 50;
      b = Math.floor(Math.random() * (200 * multiplier)) + 50;
    }

    const correct = a + b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} + ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "addition",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateLevelSubtraction(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    let a: number, b: number;

    if (levelNum <= 10) {
      a = Math.floor(Math.random() * (20 * multiplier)) + 10;
      b = Math.floor(Math.random() * (15 * multiplier)) + 1;
    } else if (levelNum <= 30) {
      a = Math.floor(Math.random() * (100 * multiplier)) + 30;
      b = Math.floor(Math.random() * (70 * multiplier)) + 10;
    } else {
      a = Math.floor(Math.random() * (500 * multiplier)) + 100;
      b = Math.floor(Math.random() * (300 * multiplier)) + 50;
    }

    if (b > a) [a, b] = [b, a];

    const correct = a - b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} - ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "subtraction",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateLevelMultiplication(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    let a: number, b: number;

    if (levelNum <= 20) {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
    } else if (levelNum <= 50) {
      a = Math.floor(Math.random() * (15 * multiplier)) + 3;
      b = Math.floor(Math.random() * (15 * multiplier)) + 3;
    } else {
      a = Math.floor(Math.random() * (25 * multiplier)) + 5;
      b = Math.floor(Math.random() * (25 * multiplier)) + 5;
    }

    const correct = a * b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} × ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "multiplication",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateLevelDivision(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    let divisor: number, quotient: number;

    if (levelNum <= 20) {
      divisor = Math.floor(Math.random() * 8) + 2;
      quotient = Math.floor(Math.random() * 12) + 2;
    } else if (levelNum <= 50) {
      divisor = Math.floor(Math.random() * (12 * multiplier)) + 3;
      quotient = Math.floor(Math.random() * (20 * multiplier)) + 3;
    } else {
      divisor = Math.floor(Math.random() * (20 * multiplier)) + 5;
      quotient = Math.floor(Math.random() * (30 * multiplier)) + 5;
    }

    const dividend = divisor * quotient;
    const options = this.generateOptions(quotient, 4);

    return {
      id,
      question: `${dividend} ÷ ${divisor} = ?`,
      correctAnswer: quotient,
      options,
      type: "division",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateLevelMissing(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    const operations = ["+", "-", "×"];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let a: number, b: number, result: number, missing: number;
    const range = Math.min(50, 10 + levelNum * multiplier);

    switch (op) {
      case "+":
        a = Math.floor(Math.random() * range) + 1;
        b = Math.floor(Math.random() * range) + 1;
        result = a + b;
        missing = Math.random() < 0.5 ? a : b;
        break;
      case "-":
        result = Math.floor(Math.random() * range) + 10;
        b = Math.floor(Math.random() * (range / 2)) + 1;
        a = result + b;
        missing = Math.random() < 0.5 ? a : b;
        break;
      case "×":
        a = Math.floor(Math.random() * (10 + levelNum)) + 2;
        b = Math.floor(Math.random() * (10 + levelNum)) + 2;
        result = a * b;
        missing = Math.random() < 0.5 ? a : b;
        break;
      default:
        a = 5;
        b = 3;
        result = 8;
        missing = a;
    }

    let question: string;
    if (op === "+" && missing === a) {
      question = `? + ${b} = ${result}`;
    } else if (op === "+" && missing === b) {
      question = `${a} + ? = ${result}`;
    } else if (op === "-" && missing === a) {
      question = `? - ${b} = ${result}`;
    } else if (op === "-" && missing === b) {
      question = `${a} - ? = ${result}`;
    } else if (op === "×" && missing === a) {
      question = `? × ${b} = ${result}`;
    } else {
      question = `${a} × ? = ${result}`;
    }

    const options = this.generateOptions(missing, 4);

    return {
      id,
      question,
      correctAnswer: missing,
      options,
      type: "missing",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateLevelPattern(
    id: string,
    timeLimit: number,
    levelNum: number,
    multiplier: number,
  ): MathQuestion {
    const patterns = [
      // Arithmetic sequences with increasing complexity
      () => {
        const start = Math.floor(Math.random() * (10 + levelNum)) + 1;
        const diff =
          Math.floor(Math.random() * (5 + Math.floor(levelNum / 10))) + 2;
        const sequence = [
          start,
          start + diff,
          start + 2 * diff,
          start + 3 * diff,
        ];
        const next = start + 4 * diff;
        return { question: `${sequence.join(", ")}, ?`, answer: next };
      },
      // Multiplication sequences
      () => {
        const start = Math.floor(Math.random() * 5) + 2;
        const mult = Math.floor(Math.random() * 3) + 2;
        const sequence = [start, start * mult, start * mult * mult];
        const next = start * mult * mult * mult;
        return { question: `${sequence.join(", ")}, ?`, answer: next };
      },
      // Fibonacci-like sequences
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const c = a + b;
        const d = b + c;
        const next = c + d;
        return { question: `${a}, ${b}, ${c}, ${d}, ?`, answer: next };
      },
      // Square sequences (for higher levels)
      () => {
        if (levelNum < 40) return patterns[0](); // Fallback for lower levels
        const base = Math.floor(Math.random() * 8) + 2;
        const sequence = [
          base * base,
          (base + 1) * (base + 1),
          (base + 2) * (base + 2),
        ];
        const next = (base + 3) * (base + 3);
        return { question: `${sequence.join(", ")}, ?`, answer: next };
      },
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)]();
    const options = this.generateOptions(pattern.answer, 4);

    return {
      id,
      question: pattern.question,
      correctAnswer: pattern.answer,
      options,
      type: "pattern",
      difficulty: this.state.currentLevel.difficulty,
      timeLimit,
    };
  }

  private generateOptions(correct: number, count: number): number[] {
    const options = new Set<number>();
    options.add(correct);

    const range = Math.max(10, Math.abs(correct) * 0.3);

    while (options.size < count) {
      const offset = Math.floor(Math.random() * range * 2) - range;
      const option = Math.max(0, correct + offset);
      if (option !== correct) {
        options.add(option);
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  public startGame(): void {
    this.state.gameStatus = "playing";
    this.state.startTime = Date.now();
  }

  public pauseGame(): void {
    if (this.state.gameStatus === "playing") {
      this.state.gameStatus = "paused";
    }
  }

  public resumeGame(): void {
    if (this.state.gameStatus === "paused") {
      this.state.gameStatus = "playing";
    }
  }

  public answerQuestion(selectedAnswer: number): boolean {
    if (!this.state.currentQuestion || this.state.gameStatus !== "playing") {
      return false;
    }

    const isCorrect =
      selectedAnswer === this.state.currentQuestion.correctAnswer;

    if (isCorrect) {
      this.state.correctAnswers++;
      this.state.streak++;
      this.state.maxStreak = Math.max(this.state.maxStreak, this.state.streak);

      // Score calculation with level multiplier
      let points = 10;
      if (this.state.streak >= 5) points += 5;
      if (
        this.state.timeRemaining >
        this.state.currentQuestion.timeLimit * 0.7
      ) {
        points += 3;
      }

      // Apply level multiplier
      points *= this.state.currentLevel.pointsMultiplier;
      this.state.score += Math.floor(points);
    } else {
      this.state.incorrectAnswers++;
      this.state.errorsInLevel++;
      this.state.streak = 0;

      // Check elimination
      if (
        this.state.currentLevel.eliminationMode ||
        this.state.errorsInLevel > this.state.currentLevel.maxErrors
      ) {
        this.state.isEliminated = true;
        this.state.canContinue = false;
        this.endGame();
        return isCorrect;
      }
    }

    return isCorrect;
  }

  public nextQuestion(): boolean {
    if (this.state.questionIndex >= this.questions.length) {
      // Level completed successfully
      this.state.levelCompleted = true;
      this.endGame();
      return false;
    }

    this.state.currentQuestion = this.questions[this.state.questionIndex];
    this.state.questionIndex++;
    this.state.timeRemaining = this.state.currentQuestion.timeLimit;

    return true;
  }

  public useHint(): string | null {
    if (
      this.state.hintsUsed >= this.state.maxHints ||
      !this.state.currentQuestion ||
      this.state.currentLevel.eliminationMode
    ) {
      return null;
    }

    this.state.hintsUsed++;

    const wrongOptions = this.state.currentQuestion.options.filter(
      (opt) => opt !== this.state.currentQuestion!.correctAnswer,
    );

    if (wrongOptions.length > 0) {
      const optionToRemove =
        wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      return `Eliminate option: ${optionToRemove}`;
    }

    return "The answer is one of the middle values";
  }

  public skipQuestion(): boolean {
    if (
      this.state.skipsUsed >= this.state.maxSkips ||
      this.state.currentLevel.eliminationMode
    ) {
      return false;
    }

    this.state.skipsUsed++;
    this.state.streak = 0;
    return this.nextQuestion();
  }

  public updateTime(timeRemaining: number): void {
    this.state.timeRemaining = timeRemaining;

    if (timeRemaining <= 0) {
      // Time's up counts as wrong answer
      this.state.incorrectAnswers++;
      this.state.errorsInLevel++;
      this.state.streak = 0;

      if (
        this.state.currentLevel.eliminationMode ||
        this.state.errorsInLevel > this.state.currentLevel.maxErrors
      ) {
        this.state.isEliminated = true;
        this.state.canContinue = false;
        this.endGame();
      } else if (!this.nextQuestion()) {
        this.endGame();
      }
    }
  }

  public endGame(): void {
    this.state.gameStatus = "finished";
    this.state.endTime = Date.now();

    // Update level system progress if level was completed
    if (this.state.levelCompleted && !this.state.isEliminated) {
      this.levelSystem.completeLevel(
        this.state.currentLevel.level,
        this.state.score,
        this.state.questionIndex - 1,
        this.state.correctAnswers,
      );
    }
  }

  public getState(): LevelGameState {
    return { ...this.state };
  }

  public getProgress(): number {
    return this.state.questionIndex / this.state.totalQuestions;
  }

  public calculateFinalScore(): LevelGameScore {
    const timeTaken = this.state.endTime
      ? this.state.endTime - this.state.startTime
      : Date.now() - this.state.startTime;

    const accuracy =
      this.state.questionIndex > 1
        ? this.state.correctAnswers / (this.state.questionIndex - 1)
        : 0;

    return {
      id: this.state.id,
      user_id: "",
      username: "",
      score: this.state.score,
      correct_answers: this.state.correctAnswers,
      total_questions: this.state.questionIndex - 1,
      time_taken: timeTaken,
      difficulty: this.state.currentLevel.difficulty,
      game_mode: "practice" as const,
      max_streak: this.state.maxStreak,
      hints_used: this.state.hintsUsed,
      skips_used: this.state.skipsUsed,
      completed_at: new Date().toISOString(),
      // Level-specific fields
      level_number: this.state.currentLevel.level,
      elimination_mode: this.state.currentLevel.eliminationMode,
      level_completed: this.state.levelCompleted,
      final_accuracy: accuracy,
    };
  }
}
