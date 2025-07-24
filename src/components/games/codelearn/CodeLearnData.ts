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
    this.initializeCppCourse();
    this.initializeTypeScriptCourse();
    this.initializeStudyGuideUnit();

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
        totalLessons: 9,
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
        isUnlocked: true,
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
              coinReward: 5,
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
              coinReward: 10,
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

    // Add one more lesson to js-basics
    jsBasicsLessons.push({
      id: "js-conditions",
      languageId: "javascript",
      unitId: "js-basics",
      title: "Conditional Statements",
      description: "Make decisions in your code with if/else statements",
      type: "practice",
      difficulty: 2,
      xpReward: 30,
      coinReward: 15,
      order: 3,
      prerequisiteIds: ["js-operators"],
      isCompleted: false,
      isUnlocked: true,
      attempts: 0,
      content: {
        explanation:
          "Conditional statements allow your program to make decisions based on different conditions. The if statement executes code only when a condition is true.",
        codeExample: `// Simple if statement
let age = 18;
if (age >= 18) {
    console.log("You can vote!");
}

// If-else statement
let weather = "sunny";
if (weather === "sunny") {
    console.log("Wear sunglasses!");
} else {
    console.log("Take an umbrella!");
}

// Multiple conditions
let score = 85;
if (score >= 90) {
    console.log("A grade");
} else if (score >= 80) {
    console.log("B grade");
} else {
    console.log("Keep studying!");
}`,
        exercises: [
          {
            id: "js-if-1",
            type: "multiple-choice",
            question:
              "What happens if the condition in an if statement is false?",
            options: [
              "The code runs anyway",
              "The code inside if is skipped",
              "An error occurs",
              "The program stops",
            ],
            correctAnswer: "The code inside if is skipped",
            explanation:
              "When an if condition is false, JavaScript skips the code block inside the if statement.",
            points: 10,
            coinReward: 5,
          },
          {
            id: "js-if-2",
            type: "code-completion",
            question:
              "Complete the if statement to check if a number is positive:",
            code: "let number = 5;\n_____ (number > 0) {\n    console.log('Positive!');\n}",
            correctAnswer: "if",
            explanation:
              "The 'if' keyword is used to create conditional statements.",
            points: 15,
            coinReward: 8,
          },
          {
            id: "js-if-3",
            type: "write-function",
            question:
              "Write an if-else statement that prints 'Even' if a number is even, 'Odd' if it's odd:",
            code: "let num = 7;\n// Write your if-else statement here",
            correctAnswer:
              "if (num % 2 === 0) {\n    console.log('Even');\n} else {\n    console.log('Odd');\n}",
            explanation:
              "Use the modulo operator (%) to check if a number is divisible by 2.",
            points: 20,
            coinReward: 10,
          },
        ],
        hints: [
          "Use === for exact equality comparison",
          "The modulo operator (%) gives the remainder after division",
          "else if allows you to check multiple conditions",
        ],
      },
    });

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
        coinReward: 15,
        order: 1,
        prerequisiteIds: ["js-operators"],
        isCompleted: false,
        isUnlocked: true,
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
              coinReward: 12,
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
        coinReward: 10,
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
              coinReward: 8,
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
        coinReward: 12,
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
              coinReward: 10,
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
        coinReward: 15,
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
              coinReward: 12,
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

  private initializeCppCourse(): void {
    const cppUnits: CodeUnit[] = [
      {
        id: "cpp-basics",
        languageId: "cpp",
        title: "C++ Fundamentals",
        description: "Learn C++ syntax, variables, and basic operations",
        icon: "🔧",
        order: 1,
        color: "#00599C",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 8,
      },
      {
        id: "cpp-oop",
        languageId: "cpp",
        title: "Object-Oriented Programming",
        description: "Master classes, objects, inheritance, and polymorphism",
        icon: "🏗️",
        order: 2,
        color: "#4CAF50",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 10,
      },
      {
        id: "cpp-memory",
        languageId: "cpp",
        title: "Memory Management",
        description:
          "Learn pointers, references, and dynamic memory allocation",
        icon: "🧠",
        order: 3,
        color: "#FF9800",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 12,
      },
    ];

    this.units.set("cpp", cppUnits);

    const cppBasicsLessons: CodeLesson[] = [
      {
        id: "cpp-hello",
        languageId: "cpp",
        unitId: "cpp-basics",
        title: "Hello World in C++",
        description: "Your first C++ program with input/output",
        type: "concept",
        difficulty: 2,
        xpReward: 25,
        coinReward: 15,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "C++ programs use #include directives for libraries, namespace std for standard library, and main() function as entry point.",
          codeExample: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello, " << name << "!" << endl;

    return 0;
}`,
          exercises: [
            {
              id: "cpp-hello-1",
              type: "multiple-choice",
              question:
                "Which header file is needed for input/output operations in C++?",
              options: ["<stdio.h>", "<iostream>", "<string>", "<cstdlib>"],
              correctAnswer: "<iostream>",
              explanation:
                "<iostream> provides cin, cout, and other I/O stream objects.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "cpp-hello-2",
              type: "code-completion",
              question: "Complete the C++ program to output 'Learning C++':",
              code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    _____ << "Learning C++" << endl;\n    return 0;\n}',
              correctAnswer: "cout",
              explanation: "cout is the standard output stream object in C++.",
              points: 15,
              coinReward: 8,
            },
          ],
          hints: [
            "Include <iostream> for input/output operations",
            "Use 'using namespace std;' to avoid writing std:: prefix",
            "cout is for output, cin is for input",
            "Always return 0 from main() to indicate successful execution",
          ],
        },
      },
      {
        id: "cpp-variables",
        languageId: "cpp",
        unitId: "cpp-basics",
        title: "Variables and Data Types",
        description: "Learn C++ data types, variables, and type safety",
        type: "practice",
        difficulty: 2,
        xpReward: 30,
        coinReward: 18,
        order: 2,
        prerequisiteIds: ["cpp-hello"],
        isCompleted: false,
        isUnlocked: false,
        attempts: 0,
        content: {
          explanation:
            "C++ is a statically typed language. You must declare variables with specific types like int, double, char, string, and bool.",
          codeExample: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Integer types
    int age = 25;
    long population = 7800000000L;

    // Floating point types
    float pi = 3.14f;
    double precise_pi = 3.14159265359;

    // Character and string types
    char grade = 'A';
    string name = "Alice";

    // Boolean type
    bool isStudent = true;

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "Grade: " << grade << endl;
    cout << "Is student: " << isStudent << endl;

    return 0;
}`,
          exercises: [
            {
              id: "cpp-var-1",
              type: "multiple-choice",
              question:
                "Which data type should you use to store a person's age?",
              options: ["char", "int", "float", "string"],
              correctAnswer: "int",
              explanation:
                "int is perfect for whole numbers like age (0-150 range).",
              points: 10,
              coinReward: 5,
            },
            {
              id: "cpp-var-2",
              type: "code-completion",
              question:
                "Declare a variable to store a product price with 2 decimal places:",
              code: "// Declare a variable 'price' with value 19.99\n_____ price = 19.99;",
              correctAnswer: "double",
              explanation:
                "double provides sufficient precision for currency values.",
              points: 15,
              coinReward: 8,
            },
            {
              id: "cpp-var-3",
              type: "write-function",
              question:
                "Write a program that declares variables for student info and prints them:",
              code: `// Create variables for: name (string), student_id (int), gpa (double)
// Print them in a formatted way`,
              correctAnswer: `string name = "John";
int student_id = 12345;
double gpa = 3.75;

cout << "Student: " << name << endl;
cout << "ID: " << student_id << endl;
cout << "GPA: " << gpa << endl;`,
              explanation:
                "Use appropriate data types for each piece of information.",
              points: 25,
              coinReward: 12,
            },
          ],
          hints: [
            "int for whole numbers, double for decimal numbers",
            "string for text, char for single characters",
            "bool for true/false values",
            "Include <string> header when using string type",
          ],
        },
      },
    ];

    this.lessons.set("cpp-basics", cppBasicsLessons);
  }

  private initializeTypeScriptCourse(): void {
    const tsUnits: CodeUnit[] = [
      {
        id: "ts-basics",
        languageId: "typescript",
        title: "TypeScript Fundamentals",
        description: "Learn TypeScript syntax and type annotations",
        icon: "📘",
        order: 1,
        color: "#007ACC",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 6,
      },
      {
        id: "ts-advanced",
        languageId: "typescript",
        title: "Advanced Types",
        description: "Master interfaces, generics, and utility types",
        icon: "🔬",
        order: 2,
        color: "#2196F3",
        lessons: [],
        isUnlocked: false,
        completedLessons: 0,
        totalLessons: 8,
      },
    ];

    this.units.set("typescript", tsUnits);

    const tsBasicsLessons: CodeLesson[] = [
      {
        id: "ts-types",
        languageId: "typescript",
        unitId: "ts-basics",
        title: "Type Annotations",
        description: "Add type safety to JavaScript with TypeScript",
        type: "concept",
        difficulty: 2,
        xpReward: 30,
        coinReward: 18,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation:
            "TypeScript adds optional static typing to JavaScript. You can specify types for variables, function parameters, and return values.",
          codeExample: `// Type annotations for variables
let name: string = "Alice";
let age: number = 25;
let isStudent: boolean = true;
let hobbies: string[] = ["reading", "coding"];

// Function with typed parameters and return type
function greet(name: string, age: number): string {
    return \`Hello \${name}, you are \${age} years old!\`;
}

// Interface for object structure
interface Person {
    name: string;
    age: number;
    email?: string; // Optional property
}

const person: Person = {
    name: "Bob",
    age: 30
};

console.log(greet(person.name, person.age));`,
          exercises: [
            {
              id: "ts-types-1",
              type: "multiple-choice",
              question:
                "What is the correct way to declare an array of numbers in TypeScript?",
              options: [
                "let nums: number",
                "let nums: number[]",
                "let nums: [number]",
                "let nums: Array<number>",
              ],
              correctAnswer: "let nums: number[]",
              explanation:
                "number[] or Array<number> both work, but number[] is more common.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "ts-types-2",
              type: "code-completion",
              question: "Add type annotations to this function:",
              code: "function calculateArea(width, height) {\n    return width * height;\n}",
              correctAnswer:
                "function calculateArea(width: number, height: number): number {\n    return width * height;\n}",
              explanation:
                "Parameters and return value should be typed as numbers.",
              points: 20,
              coinReward: 10,
            },
          ],
          hints: [
            "Use : type after variable names to add type annotations",
            "Arrays can be typed as type[] or Array<type>",
            "Functions can have typed parameters and return types",
            "Optional properties in interfaces use ?",
          ],
        },
      },
    ];

    this.lessons.set("ts-basics", tsBasicsLessons);
  }

  private initializeStudyGuideUnit(): void {
    // Create a special "study-guide" language for the study book
    const studyGuideUnits: CodeUnit[] = [
      {
        id: "programming-basics",
        languageId: "study-guide",
        title: "Programming Fundamentals Study Guide",
        description: "Essential concepts every programmer should know",
        icon: "📚",
        order: 1,
        color: "#8E24AA",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 5,
      },
      {
        id: "problem-solving",
        languageId: "study-guide",
        title: "Problem Solving with Code",
        description: "Learn algorithms and logical thinking patterns",
        icon: "🧩",
        order: 2,
        color: "#E91E63",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 4,
      },
      {
        id: "best-practices",
        languageId: "study-guide",
        title: "Coding Best Practices",
        description: "Write clean, maintainable, and efficient code",
        icon: "⭐",
        order: 3,
        color: "#FF5722",
        lessons: [],
        isUnlocked: true,
        completedLessons: 0,
        totalLessons: 6,
      },
    ];

    this.units.set("study-guide", studyGuideUnits);

    // Programming Basics Study Lessons
    const programmingBasicsLessons: CodeLesson[] = [
      {
        id: "what-is-programming",
        languageId: "study-guide",
        unitId: "programming-basics",
        title: "What is Programming?",
        description: "Understanding the fundamentals of computer programming",
        type: "concept",
        difficulty: 1,
        xpReward: 25,
        coinReward: 15,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation: `Programming is the process of creating instructions for computers to follow. These instructions, called code, tell the computer exactly what to do step by step.

Think of programming like writing a very detailed recipe:
- A recipe tells someone how to cook a dish
- Code tells a computer how to solve a problem

Key Concepts:
1. **Algorithm**: Step-by-step solution to a problem
2. **Syntax**: Rules for writing code in a specific language
3. **Logic**: The reasoning behind your solution
4. **Debugging**: Finding and fixing errors in your code`,
          exercises: [
            {
              id: "prog-concept-1",
              type: "multiple-choice",
              question: "What is an algorithm?",
              options: [
                "A programming language",
                "A step-by-step solution to a problem",
                "A type of computer",
                "A debugging tool",
              ],
              correctAnswer: "A step-by-step solution to a problem",
              explanation:
                "An algorithm is a clear set of instructions that solves a specific problem.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "prog-concept-2",
              type: "multiple-choice",
              question: "Which of these is most like programming?",
              options: [
                "Drawing a picture",
                "Writing a detailed recipe",
                "Singing a song",
                "Playing a game",
              ],
              correctAnswer: "Writing a detailed recipe",
              explanation:
                "Both programming and recipes provide step-by-step instructions to achieve a goal.",
              points: 10,
              coinReward: 5,
            },
          ],
          hints: [
            "Programming is about giving clear instructions",
            "Every program follows logical steps",
            "Practice makes programming easier",
          ],
        },
      },
      {
        id: "variables-explained",
        languageId: "study-guide",
        unitId: "programming-basics",
        title: "Understanding Variables",
        description: "Learn what variables are and why they're essential",
        type: "concept",
        difficulty: 1,
        xpReward: 30,
        coinReward: 18,
        order: 2,
        prerequisiteIds: ["what-is-programming"],
        isCompleted: false,
        isUnlocked: false,
        attempts: 0,
        content: {
          explanation: `Variables are like labeled boxes that store information in your program. Just like you might have a box labeled "books" or "clothes", variables have names and contain data.

Why Variables Matter:
- **Storage**: Keep track of information
- **Reusability**: Use the same data multiple times
- **Flexibility**: Change values as needed
- **Organization**: Keep your code neat and understandable

Types of Data Variables Can Store:
1. **Numbers**: Ages, prices, scores (25, 3.14, -10)
2. **Text**: Names, messages, descriptions ("Alice", "Hello World")
3. **True/False**: Yes/no answers, flags (true, false)
4. **Lists**: Multiple items together ([1, 2, 3], ["apple", "orange"])

Best Practices:
- Use descriptive names (age, not x)
- Be consistent with naming style
- Initialize variables before using them`,
          exercises: [
            {
              id: "var-concept-1",
              type: "multiple-choice",
              question:
                "Which is the best name for a variable storing a person's age?",
              options: ["x", "a", "age", "number1"],
              correctAnswer: "age",
              explanation:
                "Descriptive names make code easier to read and understand.",
              points: 10,
              coinReward: 5,
            },
            {
              id: "var-concept-2",
              type: "multiple-choice",
              question:
                "What type of data would you use to store someone's name?",
              options: ["Number", "Text", "True/False", "List"],
              correctAnswer: "Text",
              explanation: "Names are text (string) data type.",
              points: 10,
              coinReward: 5,
            },
          ],
          hints: [
            "Think of variables as labeled storage containers",
            "Choose names that describe what the variable contains",
            "Different types of data need different variable types",
          ],
        },
      },
      {
        id: "logic-and-decisions",
        languageId: "study-guide",
        unitId: "programming-basics",
        title: "Logic and Decision Making",
        description: "How computers make decisions using if/then logic",
        type: "concept",
        difficulty: 2,
        xpReward: 35,
        coinReward: 20,
        order: 3,
        prerequisiteIds: ["variables-explained"],
        isCompleted: false,
        isUnlocked: false,
        attempts: 0,
        content: {
          explanation: `Computers make decisions using logical conditions - just like you do every day!

Real Life Example:
- IF it's raining, THEN take an umbrella
- IF you're hungry, THEN eat something
- IF it's past bedtime, THEN go to sleep

Programming Logic:
- **Conditions**: Questions that are true or false
- **If Statements**: Do something only if condition is true
- **Else**: What to do when condition is false
- **Comparisons**: Equal to (==), greater than (>), less than (<)

Common Patterns:
1. **Simple Choice**: If hungry, then eat
2. **Either/Or**: If sunny, wear shorts, else wear pants
3. **Multiple Options**: If A then X, else if B then Y, else Z
4. **Combined Conditions**: If hungry AND have money, then buy food`,
          exercises: [
            {
              id: "logic-1",
              type: "multiple-choice",
              question: "Complete the logic: IF temperature > 80, THEN ____",
              options: [
                "wear jacket",
                "wear shorts",
                "stay inside",
                "turn on heater",
              ],
              correctAnswer: "wear shorts",
              explanation: "When it's hot (>80°F), wearing shorts makes sense.",
              points: 15,
              coinReward: 8,
            },
            {
              id: "logic-2",
              type: "multiple-choice",
              question:
                "What happens if the condition in an IF statement is false?",
              options: [
                "The program crashes",
                "The ELSE part runs",
                "The program stops",
                "Nothing happens",
              ],
              correctAnswer: "The ELSE part runs",
              explanation:
                "When IF condition is false, the program runs the ELSE section.",
              points: 15,
              coinReward: 8,
            },
          ],
          hints: [
            "Think about decisions you make daily",
            "Conditions are always true or false",
            "ELSE handles the 'otherwise' case",
          ],
        },
      },
    ];

    this.lessons.set("programming-basics", programmingBasicsLessons);

    // Problem Solving Lessons
    const problemSolvingLessons: CodeLesson[] = [
      {
        id: "breaking-down-problems",
        languageId: "study-guide",
        unitId: "problem-solving",
        title: "Breaking Down Problems",
        description: "Learn to solve complex problems step by step",
        type: "concept",
        difficulty: 2,
        xpReward: 40,
        coinReward: 25,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation: `The key to solving any programming problem is breaking it into smaller, manageable pieces.

The Problem-Solving Process:
1. **Understand**: What exactly are you trying to solve?
2. **Break Down**: Divide the big problem into smaller parts
3. **Plan**: Figure out the steps to solve each part
4. **Code**: Write the solution step by step
5. **Test**: Make sure your solution works
6. **Improve**: Make it better if needed

Example - Making a Simple Calculator:
- Big Problem: "Build a calculator"
- Smaller Parts:
  • Get two numbers from user
  • Ask what operation to perform
  • Do the math (add, subtract, multiply, divide)
  • Show the result

This approach works for any problem, from simple homework to complex software!`,
          exercises: [
            {
              id: "problem-solving-1",
              type: "multiple-choice",
              question:
                "What's the FIRST step in solving a programming problem?",
              options: [
                "Start coding immediately",
                "Understand what you're trying to solve",
                "Look up solutions online",
                "Ask someone else to do it",
              ],
              correctAnswer: "Understand what you're trying to solve",
              explanation:
                "Always understand the problem completely before starting to code.",
              points: 15,
              coinReward: 8,
            },
            {
              id: "problem-solving-2",
              type: "multiple-choice",
              question:
                "Why is it helpful to break big problems into smaller ones?",
              options: [
                "It takes more time",
                "It makes problems harder",
                "It makes problems easier to solve",
                "It's not helpful",
              ],
              correctAnswer: "It makes problems easier to solve",
              explanation:
                "Smaller problems are less overwhelming and easier to tackle one at a time.",
              points: 15,
              coinReward: 8,
            },
          ],
          hints: [
            "Start with understanding, not coding",
            "Every big problem is made of smaller problems",
            "Take it one step at a time",
          ],
        },
      },
    ];

    this.lessons.set("problem-solving", problemSolvingLessons);

    // Best Practices Lessons
    const bestPracticesLessons: CodeLesson[] = [
      {
        id: "clean-code-basics",
        languageId: "study-guide",
        unitId: "best-practices",
        title: "Writing Clean Code",
        description: "Make your code readable and maintainable",
        type: "concept",
        difficulty: 2,
        xpReward: 35,
        coinReward: 20,
        order: 1,
        prerequisiteIds: [],
        isCompleted: false,
        isUnlocked: true,
        attempts: 0,
        content: {
          explanation: `Clean code is code that's easy to read, understand, and modify. It's like keeping your room organized - it helps you and others find things quickly!

Clean Code Principles:
1. **Use Clear Names**: Variables and functions should explain what they do
2. **Keep It Simple**: Don't make code more complex than needed
3. **Be Consistent**: Use the same style throughout your code
4. **Add Comments**: Explain WHY you did something, not just what
5. **Format Properly**: Use proper indentation and spacing

Examples:
❌ Bad: let x = u * 60 * 60;
✅ Good: let secondsInHour = minutes * 60 * 60;

❌ Bad: function calc(a, b) { return a + b; }
✅ Good: function calculateTotal(price, tax) { return price + tax; }

Remember: You write code once, but read it many times!`,
          exercises: [
            {
              id: "clean-code-1",
              type: "multiple-choice",
              question:
                "Which variable name is better for storing a student's grade?",
              options: ["g", "x", "studentGrade", "var1"],
              correctAnswer: "studentGrade",
              explanation:
                "Clear, descriptive names make code easier to understand.",
              points: 15,
              coinReward: 8,
            },
            {
              id: "clean-code-2",
              type: "multiple-choice",
              question: "When should you add comments to your code?",
              options: [
                "Never",
                "For every line",
                "To explain WHY you did something",
                "Only when the code doesn't work",
              ],
              correctAnswer: "To explain WHY you did something",
              explanation:
                "Comments should explain the reasoning behind your code decisions.",
              points: 15,
              coinReward: 8,
            },
          ],
          hints: [
            "Pretend someone else will read your code",
            "Clear names are better than comments",
            "Consistent style makes code professional",
          ],
        },
      },
    ];

    this.lessons.set("best-practices", bestPracticesLessons);

    // Add the study guide as a language
    const studyGuideLanguage: CodeLanguage = {
      id: "study-guide",
      name: "Study Guide",
      icon: "📖",
      color: "#9C27B0",
      description:
        "Essential programming concepts and best practices for beginners",
      difficulty: "beginner",
      totalLessons: 15,
      estimatedHours: 10,
    };

    // We need to add this to the languages array - but since we can't modify the imported LANGUAGES,
    // we'll handle this in the game component
  }
}
