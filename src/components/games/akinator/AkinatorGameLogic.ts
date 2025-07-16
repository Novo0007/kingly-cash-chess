export interface Character {
  id: string;
  name: string;
  description: string;
  attributes: Record<string, boolean>;
  category: string;
  image?: string;
}

export interface Question {
  id: string;
  text: string;
  attribute: string;
}

export interface GameState {
  currentQuestion: Question | null;
  remainingCharacters: Character[];
  askedQuestions: string[];
  answers: Record<string, boolean>;
  questionCount: number;
  isGameComplete: boolean;
  guessedCharacter: Character | null;
  gameStatus: "playing" | "won" | "lost" | "restart";
  timeElapsed: number;
  score: number;
}

export class AkinatorGameLogic {
  private characters: Character[] = [];
  private questions: Question[] = [];
  private gameState: GameState;
  private onStateChange: (state: GameState) => void;
  private startTime: number;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(onStateChange: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.startTime = Date.now();
    this.initializeCharacters();
    this.initializeQuestions();
    this.gameState = this.getInitialGameState();
    this.startTimer();
  }

  private initializeCharacters(): void {
    this.characters = [
      // Famous Characters
      {
        id: "harry_potter",
        name: "Harry Potter",
        description: "The Boy Who Lived, wizard with a lightning bolt scar",
        category: "Movies & Books",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: true,
          hasScars: true,
          isYoung: true,
          isFromUK: true,
          canFly: true,
          isOrphan: true,
        },
      },
      {
        id: "superman",
        name: "Superman",
        description: "Man of Steel, superhero from Krypton",
        category: "Comics & Movies",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: true,
          isOrphan: true,
        },
      },
      {
        id: "hermione",
        name: "Hermione Granger",
        description: "Brilliant witch and Harry Potter's best friend",
        category: "Movies & Books",
        attributes: {
          isReal: false,
          isMale: false,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: true,
          isFromUK: true,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "batman",
        name: "Batman",
        description: "Dark Knight of Gotham City",
        category: "Comics & Movies",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: true,
        },
      },
      {
        id: "wonder_woman",
        name: "Wonder Woman",
        description: "Amazonian princess and superhero",
        category: "Comics & Movies",
        attributes: {
          isReal: false,
          isMale: false,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: true,
          isOrphan: false,
        },
      },
      {
        id: "pikachu",
        name: "Pikachu",
        description: "Electric-type Pokémon, Ash's partner",
        category: "Anime & Games",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: true,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "sherlock_holmes",
        name: "Sherlock Holmes",
        description: "World's greatest consulting detective",
        category: "Movies & Books",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: true,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "naruto",
        name: "Naruto Uzumaki",
        description: "Ninja with the Nine-Tailed Fox spirit",
        category: "Anime & Games",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: true,
          isYoung: true,
          isFromUK: false,
          canFly: false,
          isOrphan: true,
        },
      },
      {
        id: "elsa",
        name: "Elsa",
        description: "Snow Queen from Frozen",
        category: "Disney & Animation",
        attributes: {
          isReal: false,
          isMale: false,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: true,
        },
      },
      {
        id: "iron_man",
        name: "Iron Man",
        description: "Tony Stark, genius billionaire superhero",
        category: "Comics & Movies",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: true,
          isOrphan: true,
        },
      },
      {
        id: "goku",
        name: "Goku",
        description: "Saiyan warrior from Dragon Ball",
        category: "Anime & Games",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: true,
          isOrphan: false,
        },
      },
      {
        id: "mickey_mouse",
        name: "Mickey Mouse",
        description: "Disney's iconic mouse character",
        category: "Disney & Animation",
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: true,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
      // Historical Figures
      {
        id: "albert_einstein",
        name: "Albert Einstein",
        description: "Theoretical physicist, theory of relativity",
        category: "Historical",
        attributes: {
          isReal: true,
          isMale: true,
          isFromMovies: false,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: true,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "marie_curie",
        name: "Marie Curie",
        description: "Nobel Prize-winning scientist",
        category: "Historical",
        attributes: {
          isReal: true,
          isMale: false,
          isFromMovies: false,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "leonardo_da_vinci",
        name: "Leonardo da Vinci",
        description: "Renaissance artist and inventor",
        category: "Historical",
        attributes: {
          isReal: true,
          isMale: true,
          isFromMovies: false,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
      {
        id: "cleopatra",
        name: "Cleopatra",
        description: "Last pharaoh of Ancient Egypt",
        category: "Historical",
        attributes: {
          isReal: true,
          isMale: false,
          isFromMovies: false,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
        },
      },
    ];
  }

  private initializeQuestions(): void {
    this.questions = [
      {
        id: "q1",
        text: "Is your character real (a real person)?",
        attribute: "isReal",
      },
      {
        id: "q2",
        text: "Is your character male?",
        attribute: "isMale",
      },
      {
        id: "q3",
        text: "Does your character appear in movies?",
        attribute: "isFromMovies",
      },
      {
        id: "q4",
        text: "Does your character appear in books?",
        attribute: "isFromBooks",
      },
      {
        id: "q5",
        text: "Does your character have magical or supernatural powers?",
        attribute: "hasMagicalPowers",
      },
      {
        id: "q6",
        text: "Is your character considered a hero?",
        attribute: "isHero",
      },
      {
        id: "q7",
        text: "Does your character wear glasses?",
        attribute: "wearGlasses",
      },
      {
        id: "q8",
        text: "Does your character have visible scars?",
        attribute: "hasScars",
      },
      {
        id: "q9",
        text: "Is your character young (under 25)?",
        attribute: "isYoung",
      },
      {
        id: "q10",
        text: "Is your character from the UK?",
        attribute: "isFromUK",
      },
      {
        id: "q11",
        text: "Can your character fly?",
        attribute: "canFly",
      },
      {
        id: "q12",
        text: "Is your character an orphan?",
        attribute: "isOrphan",
      },
    ];
  }

  private getInitialGameState(): GameState {
    return {
      currentQuestion: this.getBestQuestion(this.characters),
      remainingCharacters: [...this.characters],
      askedQuestions: [],
      answers: {},
      questionCount: 0,
      isGameComplete: false,
      guessedCharacter: null,
      gameStatus: "playing",
      timeElapsed: 0,
      score: 1000,
    };
  }

  private getBestQuestion(characters: Character[]): Question | null {
    if (characters.length <= 1) return null;

    const availableQuestions = this.questions.filter(
      (q) => !(this.gameState?.askedQuestions?.includes(q.id) ?? false),
    );

    if (availableQuestions.length === 0) return null;

    // Find the question that best splits the remaining characters
    let bestQuestion = availableQuestions[0];
    let bestScore = Infinity;

    for (const question of availableQuestions) {
      const trueCount = characters.filter(
        (char) => char.attributes[question.attribute],
      ).length;
      const falseCount = characters.length - trueCount;

      // We want the question that splits most evenly
      const score = Math.abs(trueCount - falseCount);

      if (score < bestScore) {
        bestScore = score;
        bestQuestion = question;
      }
    }

    return bestQuestion;
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.gameState.timeElapsed = Math.floor(
        (Date.now() - this.startTime) / 1000,
      );
      this.onStateChange({ ...this.gameState });
    }, 1000);
  }

  public answerQuestion(answer: boolean): {
    success: boolean;
    message: string;
    nextQuestion?: Question | null;
  } {
    if (!this.gameState.currentQuestion) {
      return { success: false, message: "No current question to answer" };
    }

    const currentQuestion = this.gameState.currentQuestion;

    // Record the answer
    this.gameState.answers[currentQuestion.attribute] = answer;
    this.gameState.askedQuestions.push(currentQuestion.id);
    this.gameState.questionCount++;

    // Filter remaining characters based on the answer
    this.gameState.remainingCharacters =
      this.gameState.remainingCharacters.filter(
        (char) => char.attributes[currentQuestion.attribute] === answer,
      );

    // Reduce score based on number of questions asked
    this.gameState.score = Math.max(
      100,
      1000 - this.gameState.questionCount * 50,
    );

    // Check if we can make a guess
    if (this.gameState.remainingCharacters.length === 1) {
      this.gameState.guessedCharacter = this.gameState.remainingCharacters[0];
      this.gameState.isGameComplete = true;
      this.gameState.gameStatus = "won";
      this.stopTimer();
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        message: `I think your character is ${this.gameState.guessedCharacter.name}!`,
      };
    } else if (
      this.gameState.remainingCharacters.length === 0 ||
      this.gameState.questionCount >= 20
    ) {
      this.gameState.isGameComplete = true;
      this.gameState.gameStatus = "lost";
      this.stopTimer();
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        message: "I give up! You stumped me this time!",
      };
    }

    // Get the next best question
    const nextQuestion = this.getBestQuestion(
      this.gameState.remainingCharacters,
    );
    this.gameState.currentQuestion = nextQuestion;

    this.onStateChange({ ...this.gameState });

    return {
      success: true,
      message: answer ? "Yes! 🎯" : "No! ❌",
      nextQuestion,
    };
  }

  public makeGuess(character: Character): {
    success: boolean;
    isCorrect: boolean;
    message: string;
  } {
    this.gameState.guessedCharacter = character;
    this.gameState.isGameComplete = true;
    this.stopTimer();

    // For now, we'll assume the guess is correct if it's in the remaining characters
    const isCorrect = this.gameState.remainingCharacters.some(
      (char) => char.id === character.id,
    );

    if (isCorrect) {
      this.gameState.gameStatus = "won";
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        isCorrect: true,
        message: `Yes! I guessed ${character.name} correctly! 🎉`,
      };
    } else {
      this.gameState.gameStatus = "lost";
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        isCorrect: false,
        message: `No, that wasn't your character. You stumped me! 😅`,
      };
    }
  }

  public restartGame(): void {
    this.stopTimer();
    this.startTime = Date.now();
    this.gameState = this.getInitialGameState();
    this.startTimer();
    this.onStateChange({ ...this.gameState });
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getRemainingCharacterCount(): number {
    return this.gameState.remainingCharacters.length;
  }

  public getPossibleCharacters(): Character[] {
    return [...this.gameState.remainingCharacters];
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  public getCompletionStats() {
    return {
      questionsAsked: this.gameState.questionCount,
      timeElapsed: this.gameState.timeElapsed,
      score: this.gameState.score,
      guessedCharacter: this.gameState.guessedCharacter,
      gameStatus: this.gameState.gameStatus,
    };
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public cleanup(): void {
    this.stopTimer();
  }
}
