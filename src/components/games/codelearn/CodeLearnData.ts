import {
  CodeLanguage,
  CodeUnit,
  CodeLesson,
  Exercise,
  LANGUAGES,
} from "./CodeLearnTypes";
import {
  addCoinRewardsToLessons,
  setupCoinRewards,
} from "./coinRewardDefaults";

export class CodeLearnDataService {
  private static instance: CodeLearnDataService;
  private units: Map<string, CodeUnit[]> = new Map();
  private lessons: Map<string, CodeLesson[]> = new Map();

  public static getInstance(): CodeLearnDataService {
    if (!CodeLearnDataService.instance) {
      CodeLearnDataService.instance = new CodeLearnDataService();
      CodeLearnDataService.instance.initializeData();
    }
    return CodeLearnDataService.instance;
  }

  private initializeData(): void {
    this.initializeJavaScriptCourse();
    this.initializePythonCourse();
    this.initializeJavaCourse();
    this.initializeReactCourse();

    // Setup coin rewards for all courses
    setupCoinRewards();
    this.addCoinRewardsToAllCourses();
  }

  private addCoinRewardsToAllCourses(): void {
    // Process all units and lessons to add coin rewards
    for (const [languageId, units] of this.units.entries()) {
      for (const unit of units) {
        const lessons = this.lessons.get(unit.id) || [];
        const updatedLessons = addCoinRewardsToLessons(lessons);
        this.lessons.set(unit.id, updatedLessons);
      }
    }
  }

  public getLanguages(): CodeLanguage[] {
    return LANGUAGES;
  }

  public getUnitsForLanguage(languageId: string): CodeUnit[] {
    return this.units.get(languageId) || [];
  }

  public getLessonsForUnit(unitId: string): CodeLesson[] {
    return this.lessons.get(unitId) || [];
  }

  private initializeJavaScriptCourse(): void {
    const jsUnits: CodeUnit[] = [
      {
        id: "js-basics",
        languageId: "javascript",
        title: "JavaScript Basics",
        description: "Learn variables, data types, and basic syntax",
        icon: "📚",
        order: 1,
        color: "#4CAF50",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 8,
      },
      {
        id: "js-functions",
        languageId: "javascript",
        title: "Functions & Scope",
        description: "Master functions, parameters, and variable scope",
        icon: "⚡",
        order: 2,
        color: "#2196F3",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 6,
      },
      {
        id: "js-objects",
        languageId: "javascript",
        title: "Objects & Arrays",
        description: "Work with complex data structures",
        icon: "📦",
        order: 3,
        color: "#FF9800",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 7,
      },
      {
        id: "js-dom",
        languageId: "javascript",
        title: "DOM Manipulation",
        description: "Interact with web pages dynamically",
        icon: "🌐",
        order: 4,
        color: "#9C27B0",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 5,
      },
    ];

    this.units.set("javascript", jsUnits);

    // JavaScript Basics Lessons
    const jsBasicsLessons: CodeLesson[] = [
      {
        id: "js-variables",
        languageId: "javascript",
        unitId: "js-basics",
        title: "Variables and Data Types",
        description: "Learn to store and work with data",
        type: "concept",
        difficulty: 1,
        xpReward: 20,
        coinReward: 10,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "Variables are containers for storing data values. In JavaScript, you can create variables using 'let', 'const', or 'var'.",
          codeExample: `let name = "Alice";
const age = 25;
var city = "New York";

console.log(name); // Alice
console.log(age);  // 25`,
          exercises: [
            {
              id: "js-var-1",
              type: "multiple-choice",
              question:
                "Which keyword should you use to declare a variable that won't change?",
              options: ["var", "let", "const", "static"],
              correctAnswer: "const",
              explanation:
                "'const' is used for variables that won't be reassigned after declaration.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "js-var-2",
              type: "fill-blank",
              question:
                "Complete the code to declare a variable named 'score' with value 100:",
              code: "_____ score = 100;",
              correctAnswer: "let",
              explanation:
                "'let' is the modern way to declare variables that may change.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "js-var-3",
              type: "code-completion",
              question:
                "Create a constant variable named 'PI' with the value 3.14159:",
              code: "// Write your code here",
              correctAnswer: "const PI = 3.14159;",
              explanation:
                "Use 'const' for mathematical constants that never change.",
              points: 15,
              coinReward: 8,
            },
          ],
          hints: [
            "Remember: const for constants, let for variables that change",
            "Variable names should be descriptive and follow camelCase",
            "Don't forget the semicolon at the end of statements!",
          ],
        },
      },
      {
        id: "js-operators",
        languageId: "javascript",
        unitId: "js-basics",
        title: "Operators and Expressions",
        description: "Perform calculations and comparisons",
        type: "practice",
        difficulty: 1,
        xpReward: 25,
        coinReward: 12,
        order: 2,
        prerequisiteIds: ["js-variables"],
        isCompleted: false,
        isUnlocked: false,
        attempts: 0,
        content: {
          explanation:
            "Operators allow you to perform operations on variables and values. JavaScript has arithmetic, comparison, and logical operators.",
          codeExample: `// Arithmetic operators
let sum = 5 + 3;        // 8
let product = 4 * 2;    // 8
let remainder = 10 % 3; // 1

// Comparison operators
let isEqual = (5 === 5);    // true
let isGreater = (10 > 5);   // true

// Logical operators
let bothTrue = true && true;   // true
let eitherTrue = true || false; // true`,
          exercises: [
            {
              id: "js-op-1",
              type: "multiple-choice",
              question: "What is the result of 15 % 4?",
              options: ["3", "4", "3.75", "0"],
              correctAnswer: "3",
              explanation:
                "The modulo operator (%) returns the remainder after division. 15 ÷ 4 = 3 remainder 3.",
              points: 10,
            },
            {
              id: "js-op-2",
              type: "write-function",
              question:
                "Write an expression that checks if a number 'x' is between 10 and 20 (inclusive):",
              code: "let x = 15;\nlet result = // Your expression here",
              correctAnswer: "x >= 10 && x <= 20",
              explanation:
                "Use && (AND) to combine two conditions: x >= 10 AND x <= 20.",
              points: 20,
            },
          ],
          hints: [
            "% is the modulo operator - it gives the remainder",
            "&& means 'and', || means 'or'",
            "=== checks for exact equality (recommended over ==)",
          ],
        },
      },
    ];

    this.lessons.set("js-basics", jsBasicsLessons);

    // JavaScript Functions Lessons
    const jsFunctionsLessons: CodeLesson[] = [
      {
        id: "js-func-basics",
        languageId: "javascript",
        unitId: "js-functions",
        title: "Function Declarations",
        description: "Create reusable blocks of code",
        type: "concept",
        difficulty: 2,
        xpReward: 30,
        order: 1,
        prerequisiteIds: ["js-operators"],
        isCompleted: false,
        isUnlocked: false,
        attempts: 0,
        content: {
          explanation:
            "Functions are reusable blocks of code that perform specific tasks. They can take inputs (parameters) and return outputs.",
          codeExample: `// Function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

// Function call
let message = greet("Alice");
console.log(message); // Hello, Alice!

// Arrow function (modern syntax)
const add = (a, b) => a + b;
console.log(add(5, 3)); // 8`,
          exercises: [
            {
              id: "js-func-1",
              type: "write-function",
              question:
                "Create a function called 'multiply' that takes two parameters and returns their product:",
              code: "// Write your function here",
              correctAnswer: "function multiply(a, b) {\n    return a * b;\n}",
              explanation:
                "Functions use the 'function' keyword, followed by name, parameters in parentheses, and code in curly braces.",
              points: 25,
            },
          ],
          hints: [
            "Functions start with the 'function' keyword",
            "Parameters go inside parentheses ()",
            "Use 'return' to send a value back from the function",
          ],
        },
      },
    ];

    this.lessons.set("js-functions", jsFunctionsLessons);
  }

  private initializePythonCourse(): void {
    const pythonUnits: CodeUnit[] = [
      {
        id: "py-basics",
        languageId: "python",
        title: "Python Fundamentals",
        description: "Variables, strings, and basic operations",
        icon: "🐍",
        order: 1,
        color: "#4CAF50",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 6,
      },
      {
        id: "py-data-structures",
        languageId: "python",
        title: "Lists and Dictionaries",
        description: "Work with Python's powerful data structures",
        icon: "📊",
        order: 2,
        color: "#2196F3",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 8,
      },
    ];

    this.units.set("python", pythonUnits);

    const pyBasicsLessons: CodeLesson[] = [
      {
        id: "py-variables",
        languageId: "python",
        unitId: "py-basics",
        title: "Variables and Print",
        description: "Store data and display output",
        type: "concept",
        difficulty: 1,
        xpReward: 20,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "Python variables are created when you assign a value to them. Use the print() function to display output.",
          codeExample: `name = "Python"
age = 30
height = 5.9

print("Language:", name)
print("Age:", age)
print("Height:", height)`,
          exercises: [
            {
              id: "py-var-1",
              type: "code-completion",
              question:
                "Create a variable 'favorite_color' with the value 'blue' and print it:",
              code: "# Write your code here",
              correctAnswer: "favorite_color = 'blue'\nprint(favorite_color)",
              explanation:
                "Python variables don't need special keywords. Just assign with =",
              points: 15,
            },
          ],
          hints: [
            "Python variables don't need 'let' or 'const'",
            "Use print() to display values",
            "Strings can use single or double quotes",
          ],
        },
      },
    ];

    this.lessons.set("py-basics", pyBasicsLessons);
  }

  private initializeJavaCourse(): void {
    const javaUnits: CodeUnit[] = [
      {
        id: "java-basics",
        languageId: "java",
        title: "Java Fundamentals",
        description: "Classes, objects, and basic syntax",
        icon: "☕",
        order: 1,
        color: "#FF5722",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 10,
      },
    ];

    this.units.set("java", javaUnits);

    const javaBasicsLessons: CodeLesson[] = [
      {
        id: "java-hello",
        languageId: "java",
        unitId: "java-basics",
        title: "Hello World",
        description: "Your first Java program",
        type: "concept",
        difficulty: 2,
        xpReward: 25,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "Every Java program starts with a class and a main method. This is where your program begins execution.",
          codeExample: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
          exercises: [
            {
              id: "java-hello-1",
              type: "fill-blank",
              question: "Complete the Hello World program:",
              code: 'public class HelloWorld {\n    public static void _____(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
              correctAnswer: "main",
              explanation:
                "The main method is the entry point of every Java application.",
              points: 20,
            },
          ],
          hints: [
            "Java programs must be inside a class",
            "main method signature is always the same",
            "Use System.out.println() to print output",
          ],
        },
      },
    ];

    this.lessons.set("java-basics", javaBasicsLessons);
  }

  private initializeReactCourse(): void {
    const reactUnits: CodeUnit[] = [
      {
        id: "react-basics",
        languageId: "react",
        title: "React Components",
        description: "Build your first React components",
        icon: "⚛️",
        order: 1,
        color: "#00BCD4",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 7,
      },
    ];

    this.units.set("react", reactUnits);

    const reactBasicsLessons: CodeLesson[] = [
      {
        id: "react-component",
        languageId: "react",
        unitId: "react-basics",
        title: "Your First Component",
        description: "Create a simple React component",
        type: "concept",
        difficulty: 2,
        xpReward: 30,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "React components are like custom HTML elements. They return JSX, which looks like HTML but is actually JavaScript.",
          codeExample: `function Welcome() {
    return <h1>Hello, React!</h1>;
}

// Using the component
function App() {
    return (
        <div>
            <Welcome />
        </div>
    );
}`,
          exercises: [
            {
              id: "react-comp-1",
              type: "code-completion",
              question:
                "Create a component called 'Greeting' that returns an h2 with 'Welcome to React!':",
              code: "// Write your component here",
              correctAnswer:
                "function Greeting() {\n    return <h2>Welcome to React!</h2>;\n}",
              explanation:
                "React components are functions that return JSX elements.",
              points: 25,
            },
          ],
          hints: [
            "Components are just JavaScript functions",
            "They must return JSX elements",
            "Component names should start with a capital letter",
          ],
        },
      },
    ];

    this.lessons.set("react-basics", reactBasicsLessons);
  }
}
