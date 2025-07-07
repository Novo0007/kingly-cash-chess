export interface MathQuestion {
  id: string;
  question: string;
  correctAnswer: number;
  options: number[];
  type:
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division"
    | "missing"
    | "pattern";
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // in seconds
}

export interface MathGameState {
  id: string;
  currentQuestion: MathQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  maxStreak: number;
  gameStatus: "waiting" | "playing" | "paused" | "finished" | "timeUp";
  startTime: number;
  endTime?: number;
  timeRemaining: number;
  difficulty: "easy" | "medium" | "hard";
  gameMode: "practice" | "timed" | "endless";
  hintsUsed: number;
  skipsUsed: number;
  maxHints: number;
  maxSkips: number;
}

export interface MathGameScore {
  id: string;
  user_id: string;
  username: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  game_mode: "practice" | "timed" | "endless";
  max_streak: number;
  hints_used: number;
  skips_used: number;
  completed_at: string;
}

export class MathGameLogic {
  private state: MathGameState;
  private questions: MathQuestion[] = [];

  constructor(
    difficulty: "easy" | "medium" | "hard" = "easy",
    gameMode: "practice" | "timed" | "endless" = "practice",
  ) {
    const questionCount = this.getQuestionCount(gameMode);
    const timeLimit = this.getTimeLimit(difficulty);

    this.state = {
      id: this.generateId(),
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: questionCount,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      maxStreak: 0,
      gameStatus: "waiting",
      startTime: Date.now(),
      timeRemaining: timeLimit,
      difficulty,
      gameMode,
      hintsUsed: 0,
      skipsUsed: 0,
      maxHints: difficulty === "easy" ? 3 : difficulty === "medium" ? 2 : 1,
      maxSkips: difficulty === "easy" ? 2 : 1,
    };

    this.generateQuestions();
    this.nextQuestion();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getQuestionCount(gameMode: string): number {
    switch (gameMode) {
      case "timed":
        return 20;
      case "endless":
        return 999;
      default:
        return 10;
    }
  }

  private getTimeLimit(difficulty: string): number {
    // Time per question in seconds
    switch (difficulty) {
      case "hard":
        return 8;
      case "medium":
        return 12;
      default:
        return 15;
    }
  }

  private generateQuestions(): void {
    const questionTypes: MathQuestion["type"][] = ["addition", "subtraction"];

    if (this.state.difficulty !== "easy") {
      questionTypes.push("multiplication", "division", "missing");
    }

    if (this.state.difficulty === "hard") {
      questionTypes.push("pattern");
    }

    for (let i = 0; i < this.state.totalQuestions; i++) {
      const type =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];
      this.questions.push(this.generateQuestion(type, i));
    }
  }

  private generateQuestion(
    type: MathQuestion["type"],
    index: number,
  ): MathQuestion {
    const id = `q-${index}-${this.generateId()}`;
    const timeLimit = this.getTimeLimit(this.state.difficulty);

    switch (type) {
      case "addition":
        return this.generateAdditionQuestion(id, timeLimit);
      case "subtraction":
        return this.generateSubtractionQuestion(id, timeLimit);
      case "multiplication":
        return this.generateMultiplicationQuestion(id, timeLimit);
      case "division":
        return this.generateDivisionQuestion(id, timeLimit);
      case "missing":
        return this.generateMissingNumberQuestion(id, timeLimit);
      case "pattern":
        return this.generatePatternQuestion(id, timeLimit);
      default:
        return this.generateAdditionQuestion(id, timeLimit);
    }
  }

  private generateAdditionQuestion(
    id: string,
    timeLimit: number,
  ): MathQuestion {
    let a: number, b: number;

    switch (this.state.difficulty) {
      case "hard":
        a = Math.floor(Math.random() * 500) + 100;
        b = Math.floor(Math.random() * 500) + 100;
        break;
      case "medium":
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        break;
      default:
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
    }

    const correct = a + b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} + ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "addition",
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generateSubtractionQuestion(
    id: string,
    timeLimit: number,
  ): MathQuestion {
    let a: number, b: number;

    switch (this.state.difficulty) {
      case "hard":
        a = Math.floor(Math.random() * 500) + 200;
        b = Math.floor(Math.random() * 300) + 50;
        break;
      case "medium":
        a = Math.floor(Math.random() * 80) + 20;
        b = Math.floor(Math.random() * 50) + 5;
        break;
      default:
        a = Math.floor(Math.random() * 30) + 10;
        b = Math.floor(Math.random() * 15) + 1;
    }

    // Ensure a > b for positive results
    if (b > a) [a, b] = [b, a];

    const correct = a - b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} - ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "subtraction",
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generateMultiplicationQuestion(
    id: string,
    timeLimit: number,
  ): MathQuestion {
    let a: number, b: number;

    switch (this.state.difficulty) {
      case "hard":
        a = Math.floor(Math.random() * 25) + 6;
        b = Math.floor(Math.random() * 25) + 6;
        break;
      default:
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
    }

    const correct = a * b;
    const options = this.generateOptions(correct, 4);

    return {
      id,
      question: `${a} × ${b} = ?`,
      correctAnswer: correct,
      options,
      type: "multiplication",
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generateDivisionQuestion(
    id: string,
    timeLimit: number,
  ): MathQuestion {
    let divisor: number, quotient: number;

    switch (this.state.difficulty) {
      case "hard":
        divisor = Math.floor(Math.random() * 15) + 3;
        quotient = Math.floor(Math.random() * 20) + 5;
        break;
      default:
        divisor = Math.floor(Math.random() * 10) + 2;
        quotient = Math.floor(Math.random() * 15) + 2;
    }

    const dividend = divisor * quotient;
    const options = this.generateOptions(quotient, 4);

    return {
      id,
      question: `${dividend} ÷ ${divisor} = ?`,
      correctAnswer: quotient,
      options,
      type: "division",
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generateMissingNumberQuestion(
    id: string,
    timeLimit: number,
  ): MathQuestion {
    const operations = ["+", "-", "×"];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let a: number, b: number, result: number, missing: number;

    switch (op) {
      case "+":
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        result = a + b;
        missing = Math.random() < 0.5 ? a : b;
        break;
      case "-":
        result = Math.floor(Math.random() * 30) + 10;
        b = Math.floor(Math.random() * 15) + 1;
        a = result + b;
        missing = Math.random() < 0.5 ? a : b;
        break;
      case "×":
        a = Math.floor(Math.random() * 10) + 2;
        b = Math.floor(Math.random() * 10) + 2;
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
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generatePatternQuestion(id: string, timeLimit: number): MathQuestion {
    const patterns = [
      // Arithmetic sequences
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5) + 2;
        const sequence = [
          start,
          start + diff,
          start + 2 * diff,
          start + 3 * diff,
        ];
        const next = start + 4 * diff;
        return {
          question: `${sequence.join(", ")}, ?`,
          answer: next,
        };
      },
      // Multiplication sequences
      () => {
        const start = Math.floor(Math.random() * 3) + 2;
        const mult = Math.floor(Math.random() * 3) + 2;
        const sequence = [start, start * mult, start * mult * mult];
        const next = start * mult * mult * mult;
        return {
          question: `${sequence.join(", ")}, ?`,
          answer: next,
        };
      },
      // Fibonacci-like
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const c = a + b;
        const d = b + c;
        const next = c + d;
        return {
          question: `${a}, ${b}, ${c}, ${d}, ?`,
          answer: next,
        };
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
      difficulty: this.state.difficulty,
      timeLimit,
    };
  }

  private generateOptions(correct: number, count: number): number[] {
    const options = new Set<number>();
    options.add(correct);

    const range = Math.max(10, Math.abs(correct) * 0.5);

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

      // Score calculation: base points + streak bonus + time bonus
      let points = 10;
      if (this.state.streak >= 5) points += 5; // Streak bonus
      if (
        this.state.timeRemaining >
        this.state.currentQuestion.timeLimit * 0.7
      ) {
        points += 3; // Time bonus
      }
      if (this.state.difficulty === "medium") points *= 1.5;
      if (this.state.difficulty === "hard") points *= 2;

      this.state.score += Math.floor(points);
    } else {
      this.state.incorrectAnswers++;
      this.state.streak = 0;
    }

    return isCorrect;
  }

  public nextQuestion(): boolean {
    if (this.state.questionIndex >= this.questions.length) {
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
      !this.state.currentQuestion
    ) {
      return null;
    }

    this.state.hintsUsed++;

    // Remove one wrong option
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
    if (this.state.skipsUsed >= this.state.maxSkips) {
      return false;
    }

    this.state.skipsUsed++;
    this.state.streak = 0; // Reset streak on skip
    return this.nextQuestion();
  }

  public updateTime(timeRemaining: number): void {
    this.state.timeRemaining = timeRemaining;

    if (timeRemaining <= 0) {
      this.state.incorrectAnswers++;
      this.state.streak = 0;

      if (this.state.gameMode === "endless" || !this.nextQuestion()) {
        this.endGame();
      }
    }
  }

  public endGame(): void {
    this.state.gameStatus = "finished";
    this.state.endTime = Date.now();
  }

  public restartGame(): MathGameState {
    const newLogic = new MathGameLogic(
      this.state.difficulty,
      this.state.gameMode,
    );
    this.state = newLogic.state;
    this.questions = newLogic.questions;
    return this.state;
  }

  public getState(): MathGameState {
    return { ...this.state };
  }

  public getProgress(): number {
    if (this.state.gameMode === "endless") {
      return Math.min(this.state.questionIndex / 50, 1); // Show progress for first 50 questions
    }
    return this.state.questionIndex / this.state.totalQuestions;
  }

  public calculateFinalScore(): MathGameScore {
    const timeTaken = this.state.endTime
      ? this.state.endTime - this.state.startTime
      : Date.now() - this.state.startTime;

    return {
      id: this.state.id,
      user_id: "",
      username: "",
      score: this.state.score,
      correct_answers: this.state.correctAnswers,
      total_questions: this.state.questionIndex - 1,
      time_taken: timeTaken,
      difficulty: this.state.difficulty,
      game_mode: this.state.gameMode,
      max_streak: this.state.maxStreak,
      hints_used: this.state.hintsUsed,
      skips_used: this.state.skipsUsed,
      completed_at: new Date().toISOString(),
    };
  }
}
