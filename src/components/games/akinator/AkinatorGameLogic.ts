export interface Character {
  id: string;
  name: string;
  description: string;
  attributes: Record<string, boolean>;
  category: string;
  image?: string;
  difficulty: number; // 1-5 scale
  hints: string[];
}

export interface Question {
  id: string;
  text: string;
  attribute: string;
  difficulty: number; // 1-5 scale
  category: string;
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
  difficulty: "easy" | "medium" | "hard" | "expert";
  streakCount: number;
  perfectGames: number;
  hintsUsed: number;
  maxHints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: any) => boolean;
  icon: string;
  points: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  perfectGames: number;
  averageQuestions: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  totalHintsUsed: number;
  achievements: string[];
  difficultiesCompleted: Record<string, number>;
}

export class AkinatorGameLogic {
  private characters: Character[] = [];
  private questions: Question[] = [];
  private gameState: GameState;
  private onStateChange: (state: GameState) => void;
  private startTime: number;
  private timerInterval: NodeJS.Timeout | null = null;
  private achievements: Achievement[] = [];
  private gameStats: GameStats;

  constructor(
    onStateChange: (state: GameState) => void,
    difficulty: "easy" | "medium" | "hard" | "expert" = "medium",
  ) {
    this.onStateChange = onStateChange;
    this.startTime = Date.now();
    this.initializeCharacters();
    this.initializeQuestions();
    this.initializeAchievements();
    this.gameStats = this.loadGameStats();
    this.gameState = this.getInitialGameState(difficulty);
    this.startTimer();
  }

  private initializeCharacters(): void {
    this.characters = [
      // Popular Characters (Easy)
      {
        id: "harry_potter",
        name: "Harry Potter",
        description: "The Boy Who Lived, wizard with a lightning bolt scar",
        category: "Movies & Books",
        difficulty: 1,
        hints: ["Has a famous scar", "Plays Quidditch", "Lives with Dursleys"],
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
          isStudent: true,
          hasWeapon: true,
          livesInCastle: true,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "superman",
        name: "Superman",
        description: "Man of Steel, superhero from Krypton",
        category: "Comics & Movies",
        difficulty: 1,
        hints: [
          "From another planet",
          "Wears red cape",
          "Works at Daily Planet",
        ],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "batman",
        name: "Batman",
        description: "Dark Knight of Gotham City",
        category: "Comics & Movies",
        difficulty: 2,
        hints: ["No superpowers", "Very wealthy", "Afraid of bats as child"],
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
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "wonder_woman",
        name: "Wonder Woman",
        description: "Amazonian princess and superhero",
        category: "Comics & Movies",
        difficulty: 2,
        hints: ["From Themyscira", "Has a lasso", "Princess of Amazons"],
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
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "pikachu",
        name: "Pikachu",
        description: "Electric-type Pokémon, Ash's partner",
        category: "Anime & Games",
        difficulty: 1,
        hints: ["Yellow and electric", "Says its own name", "Mouse Pokémon"],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "sherlock_holmes",
        name: "Sherlock Holmes",
        description: "World's greatest consulting detective",
        category: "Movies & Books",
        difficulty: 3,
        hints: ["Lives on Baker Street", "Plays violin", "Uses deduction"],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "naruto",
        name: "Naruto Uzumaki",
        description: "Ninja with the Nine-Tailed Fox spirit",
        category: "Anime & Games",
        difficulty: 2,
        hints: ["Orange jumpsuit", "Ramen lover", "Hokage dream"],
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
          isStudent: true,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "elsa",
        name: "Elsa",
        description: "Snow Queen from Frozen",
        category: "Disney & Animation",
        difficulty: 1,
        hints: ["Ice powers", "Sister to Anna", "Let it go"],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: true,
          hasCompanions: true,
          fightsDarkForces: false,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "iron_man",
        name: "Iron Man",
        description: "Tony Stark, genius billionaire superhero",
        category: "Comics & Movies",
        difficulty: 2,
        hints: ["High-tech suit", "CEO of company", "Arc reactor in chest"],
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
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "goku",
        name: "Goku",
        description: "Saiyan warrior from Dragon Ball",
        category: "Anime & Games",
        difficulty: 2,
        hints: ["Spiky hair", "Loves to fight", "Can transform"],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "mickey_mouse",
        name: "Mickey Mouse",
        description: "Disney's iconic mouse character",
        category: "Disney & Animation",
        difficulty: 1,
        hints: ["Round ears", "Disney mascot", "High voice"],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: false,
          hasSpecialDestiny: false,
        },
      },
      // Historical Figures (Medium-Hard)
      {
        id: "albert_einstein",
        name: "Albert Einstein",
        description: "Theoretical physicist, theory of relativity",
        category: "Historical",
        difficulty: 3,
        hints: [
          "Famous equation E=mc²",
          "Wild white hair",
          "Nobel Prize winner",
        ],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "marie_curie",
        name: "Marie Curie",
        description: "Nobel Prize-winning scientist",
        category: "Historical",
        difficulty: 4,
        hints: [
          "First woman to win Nobel Prize",
          "Studied radioactivity",
          "Polish-French",
        ],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "leonardo_da_vinci",
        name: "Leonardo da Vinci",
        description: "Renaissance artist and inventor",
        category: "Historical",
        difficulty: 4,
        hints: [
          "Painted Mona Lisa",
          "Designed flying machines",
          "Renaissance genius",
        ],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "cleopatra",
        name: "Cleopatra",
        description: "Last pharaoh of Ancient Egypt",
        category: "Historical",
        difficulty: 4,
        hints: [
          "Queen of Egypt",
          "Spoke many languages",
          "Relationship with Caesar",
        ],
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
          isStudent: false,
          hasWeapon: false,
          livesInCastle: true,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: true,
        },
      },
      // Video Game Characters (Medium-Hard)
      {
        id: "link",
        name: "Link",
        description: "Hero of Hyrule from The Legend of Zelda",
        category: "Video Games",
        difficulty: 3,
        hints: ["Green tunic", "Master Sword", "Saves Princess Zelda"],
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: false,
          isFromBooks: false,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: true,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "mario",
        name: "Mario",
        description: "Super Mario Bros plumber hero",
        category: "Video Games",
        difficulty: 1,
        hints: ["Red cap", "Italian plumber", "Jumps on enemies"],
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
          isOrphan: false,
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: false,
        },
      },
      {
        id: "lara_croft",
        name: "Lara Croft",
        description: "Tomb Raider archaeologist adventurer",
        category: "Video Games",
        difficulty: 3,
        hints: ["Dual pistols", "British accent", "Explores tombs"],
        attributes: {
          isReal: false,
          isMale: false,
          isFromMovies: true,
          isFromBooks: false,
          hasMagicalPowers: false,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: true,
          canFly: false,
          isOrphan: false,
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: false,
        },
      },
      // Mythological Characters (Hard-Expert)
      {
        id: "thor",
        name: "Thor",
        description: "Norse god of thunder",
        category: "Mythology & Comics",
        difficulty: 3,
        hints: ["Hammer Mjolnir", "God of thunder", "Long blonde hair"],
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: true,
          isOrphan: false,
          isStudent: false,
          hasWeapon: true,
          livesInCastle: true,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "medusa",
        name: "Medusa",
        description: "Gorgon with snakes for hair",
        category: "Mythology",
        difficulty: 4,
        hints: ["Snake hair", "Turns people to stone", "Greek mythology"],
        attributes: {
          isReal: false,
          isMale: false,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: true,
          isHero: false,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
          isStudent: false,
          hasWeapon: false,
          livesInCastle: false,
          hasCompanions: false,
          fightsDarkForces: false,
          hasSpecialDestiny: true,
        },
      },
      {
        id: "hercules",
        name: "Hercules",
        description: "Greek hero with incredible strength",
        category: "Mythology",
        difficulty: 3,
        hints: ["Twelve labors", "Son of Zeus", "Incredible strength"],
        attributes: {
          isReal: false,
          isMale: true,
          isFromMovies: true,
          isFromBooks: true,
          hasMagicalPowers: true,
          isHero: true,
          wearGlasses: false,
          hasScars: false,
          isYoung: false,
          isFromUK: false,
          canFly: false,
          isOrphan: false,
          isStudent: false,
          hasWeapon: true,
          livesInCastle: false,
          hasCompanions: true,
          fightsDarkForces: true,
          hasSpecialDestiny: true,
        },
      },
    ];
  }

  private initializeQuestions(): void {
    this.questions = [
      // Basic questions (Easy)
      {
        id: "q1",
        text: "Is your character real (a real person)?",
        attribute: "isReal",
        difficulty: 1,
        category: "Basic",
      },
      {
        id: "q2",
        text: "Is your character male?",
        attribute: "isMale",
        difficulty: 1,
        category: "Basic",
      },
      {
        id: "q3",
        text: "Does your character appear in movies?",
        attribute: "isFromMovies",
        difficulty: 1,
        category: "Media",
      },
      {
        id: "q4",
        text: "Does your character appear in books?",
        attribute: "isFromBooks",
        difficulty: 2,
        category: "Media",
      },
      {
        id: "q5",
        text: "Does your character have magical or supernatural powers?",
        attribute: "hasMagicalPowers",
        difficulty: 2,
        category: "Abilities",
      },
      {
        id: "q6",
        text: "Is your character considered a hero?",
        attribute: "isHero",
        difficulty: 2,
        category: "Personality",
      },
      {
        id: "q7",
        text: "Does your character wear glasses?",
        attribute: "wearGlasses",
        difficulty: 3,
        category: "Appearance",
      },
      {
        id: "q8",
        text: "Does your character have visible scars?",
        attribute: "hasScars",
        difficulty: 3,
        category: "Appearance",
      },
      {
        id: "q9",
        text: "Is your character young (under 25)?",
        attribute: "isYoung",
        difficulty: 2,
        category: "Basic",
      },
      {
        id: "q10",
        text: "Is your character from the UK?",
        attribute: "isFromUK",
        difficulty: 3,
        category: "Location",
      },
      {
        id: "q11",
        text: "Can your character fly?",
        attribute: "canFly",
        difficulty: 2,
        category: "Abilities",
      },
      {
        id: "q12",
        text: "Is your character an orphan?",
        attribute: "isOrphan",
        difficulty: 4,
        category: "Background",
      },
      // Advanced questions (Medium-Hard)
      {
        id: "q13",
        text: "Is your character a student?",
        attribute: "isStudent",
        difficulty: 3,
        category: "Background",
      },
      {
        id: "q14",
        text: "Does your character carry a weapon?",
        attribute: "hasWeapon",
        difficulty: 3,
        category: "Equipment",
      },
      {
        id: "q15",
        text: "Does your character live in a castle?",
        attribute: "livesInCastle",
        difficulty: 4,
        category: "Location",
      },
      {
        id: "q16",
        text: "Does your character have close companions or friends?",
        attribute: "hasCompanions",
        difficulty: 3,
        category: "Relationships",
      },
      {
        id: "q17",
        text: "Does your character fight against dark forces or evil?",
        attribute: "fightsDarkForces",
        difficulty: 3,
        category: "Purpose",
      },
      {
        id: "q18",
        text: "Does your character have a special destiny or prophecy?",
        attribute: "hasSpecialDestiny",
        difficulty: 4,
        category: "Background",
      },
    ];
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: "first_win",
        name: "First Victory",
        description: "Win your first game against Akinator",
        condition: (stats) => stats.gamesWon >= 1,
        icon: "🏆",
        points: 100,
      },
      {
        id: "perfect_game",
        name: "Perfect Game",
        description: "Win a game in 10 questions or less",
        condition: (stats) => stats.perfectGames >= 1,
        icon: "⭐",
        points: 200,
      },
      {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Win a game in under 60 seconds",
        condition: (stats) => stats.bestTime <= 60 && stats.bestTime > 0,
        icon: "⚡",
        points: 300,
      },
      {
        id: "streak_master",
        name: "Streak Master",
        description: "Win 5 games in a row",
        condition: (stats) => stats.longestStreak >= 5,
        icon: "🔥",
        points: 400,
      },
      {
        id: "stump_master",
        name: "Stump Master",
        description: "Stump Akinator 10 times",
        condition: (stats) => stats.gamesPlayed - stats.gamesWon >= 10,
        icon: "🧩",
        points: 500,
      },
      {
        id: "no_hints",
        name: "No Help Needed",
        description: "Win a hard game without using hints",
        condition: (stats) =>
          stats.difficultiesCompleted.hard >= 1 && stats.totalHintsUsed === 0,
        icon: "🎯",
        points: 600,
      },
    ];
  }

  private getInitialGameState(
    difficulty: "easy" | "medium" | "hard" | "expert",
  ): GameState {
    const filteredCharacters = this.getCharactersByDifficulty(difficulty);
    const maxHints =
      difficulty === "easy"
        ? 5
        : difficulty === "medium"
          ? 3
          : difficulty === "hard"
            ? 1
            : 0;

    return {
      currentQuestion: this.getBestQuestion(filteredCharacters),
      remainingCharacters: filteredCharacters,
      askedQuestions: [],
      answers: {},
      questionCount: 0,
      isGameComplete: false,
      guessedCharacter: null,
      gameStatus: "playing",
      timeElapsed: 0,
      score: 1000,
      difficulty,
      streakCount: 0,
      perfectGames: 0,
      hintsUsed: 0,
      maxHints,
    };
  }

  private getCharactersByDifficulty(
    difficulty: "easy" | "medium" | "hard" | "expert",
  ): Character[] {
    const difficultyMap = {
      easy: [1, 2],
      medium: [1, 2, 3],
      hard: [2, 3, 4],
      expert: [3, 4, 5],
    };

    return this.characters.filter((char) =>
      difficultyMap[difficulty].includes(char.difficulty),
    );
  }

  private getBestQuestion(characters: Character[]): Question | null {
    if (characters.length <= 1) return null;

    const availableQuestions = this.questions.filter(
      (q) => !(this.gameState?.askedQuestions?.includes(q.id) ?? false),
    );

    if (availableQuestions.length === 0) return null;

    // Filter questions by difficulty if needed
    const difficultyFilter =
      this.gameState?.difficulty === "easy"
        ? availableQuestions.filter((q) => q.difficulty <= 2)
        : availableQuestions;

    const questionsToUse =
      difficultyFilter.length > 0 ? difficultyFilter : availableQuestions;

    // Find the question that best splits the remaining characters
    let bestQuestion = questionsToUse[0];
    let bestScore = Infinity;

    for (const question of questionsToUse) {
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

    // Reduce score based on number of questions asked and difficulty
    const difficultyMultiplier = {
      easy: 30,
      medium: 40,
      hard: 50,
      expert: 60,
    };

    this.gameState.score = Math.max(
      100,
      1000 -
        this.gameState.questionCount *
          difficultyMultiplier[this.gameState.difficulty],
    );

    // Check if we can make a guess
    if (this.gameState.remainingCharacters.length === 1) {
      this.gameState.guessedCharacter = this.gameState.remainingCharacters[0];
      this.gameState.isGameComplete = true;
      this.gameState.gameStatus = "won";
      this.stopTimer();
      this.updateGameStats(true);
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
      this.updateGameStats(false);
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
      this.updateGameStats(true);
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        isCorrect: true,
        message: `Yes! I guessed ${character.name} correctly! 🎉`,
      };
    } else {
      this.gameState.gameStatus = "lost";
      this.updateGameStats(false);
      this.onStateChange({ ...this.gameState });
      return {
        success: true,
        isCorrect: false,
        message: `No, that wasn't your character. You stumped me! 😅`,
      };
    }
  }

  public useHint(): string[] {
    if (this.gameState.hintsUsed >= this.gameState.maxHints) {
      return [];
    }

    if (this.gameState.remainingCharacters.length === 0) {
      return [];
    }

    this.gameState.hintsUsed++;
    this.gameStats.totalHintsUsed++;
    this.saveGameStats();

    // Return hints from the most likely character
    const likelyCharacter = this.gameState.remainingCharacters[0];
    return likelyCharacter.hints.slice(0, 2);
  }

  public restartGame(): void {
    this.stopTimer();
    this.startTime = Date.now();
    this.gameState = this.getInitialGameState(this.gameState.difficulty);
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

  public getGameStats(): GameStats {
    return { ...this.gameStats };
  }

  public getAchievements(): Achievement[] {
    return this.achievements.filter((achievement) =>
      achievement.condition(this.gameStats),
    );
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
      hintsUsed: this.gameState.hintsUsed,
      difficulty: this.gameState.difficulty,
    };
  }

  private updateGameStats(won: boolean): void {
    this.gameStats.gamesPlayed++;

    if (won) {
      this.gameStats.gamesWon++;
      this.gameStats.currentStreak++;
      this.gameStats.longestStreak = Math.max(
        this.gameStats.longestStreak,
        this.gameStats.currentStreak,
      );

      if (this.gameState.questionCount <= 10) {
        this.gameStats.perfectGames++;
      }

      if (
        this.gameStats.bestTime === 0 ||
        this.gameState.timeElapsed < this.gameStats.bestTime
      ) {
        this.gameStats.bestTime = this.gameState.timeElapsed;
      }

      this.gameStats.difficultiesCompleted[this.gameState.difficulty] =
        (this.gameStats.difficultiesCompleted[this.gameState.difficulty] || 0) +
        1;
    } else {
      this.gameStats.currentStreak = 0;
    }

    this.gameStats.totalScore += this.gameState.score;
    this.gameStats.averageQuestions =
      this.gameStats.gamesPlayed > 0
        ? Math.round(
            (this.gameStats.averageQuestions *
              (this.gameStats.gamesPlayed - 1) +
              this.gameState.questionCount) /
              this.gameStats.gamesPlayed,
          )
        : this.gameState.questionCount;

    // Check for new achievements
    const newAchievements = this.achievements
      .filter(
        (achievement) =>
          achievement.condition(this.gameStats) &&
          !this.gameStats.achievements.includes(achievement.id),
      )
      .map((achievement) => achievement.id);

    this.gameStats.achievements.push(...newAchievements);

    this.saveGameStats();
  }

  private loadGameStats(): GameStats {
    try {
      const saved = localStorage.getItem("akinator_game_stats");
      if (saved) {
        const stats = JSON.parse(saved);
        return {
          gamesPlayed: stats.gamesPlayed || 0,
          gamesWon: stats.gamesWon || 0,
          totalScore: stats.totalScore || 0,
          perfectGames: stats.perfectGames || 0,
          averageQuestions: stats.averageQuestions || 0,
          bestTime: stats.bestTime || 0,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0,
          totalHintsUsed: stats.totalHintsUsed || 0,
          achievements: stats.achievements || [],
          difficultiesCompleted: stats.difficultiesCompleted || {},
        };
      }
    } catch (error) {
      console.error("Error loading game stats:", error);
    }

    return {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      perfectGames: 0,
      averageQuestions: 0,
      bestTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalHintsUsed: 0,
      achievements: [],
      difficultiesCompleted: {},
    };
  }

  private saveGameStats(): void {
    try {
      localStorage.setItem(
        "akinator_game_stats",
        JSON.stringify(this.gameStats),
      );
    } catch (error) {
      console.error("Error saving game stats:", error);
    }
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
