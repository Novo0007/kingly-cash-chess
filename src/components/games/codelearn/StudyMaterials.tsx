import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  FileText,
  Search,
  Download,
  Star,
  Clock,
  BookOpen,
  Code,
  Video,
  Link,
  Filter,
  SortDesc,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PDFReader } from "./PDFReader";

interface StudyMaterial {
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
}

interface StudyMaterialsProps {
  onBack: () => void;
}

export const StudyMaterials: React.FC<StudyMaterialsProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPDF, setCurrentPDF] = useState<StudyMaterial | null>(null);

  const studyMaterials: StudyMaterial[] = [
    {
      id: "js-fundamentals",
      title: "JavaScript Fundamentals",
      description:
        "Complete guide to JavaScript basics including variables, functions, and control structures",
      type: "pdf",
      language: "JavaScript",
      difficulty: "beginner",
      duration: "3-4 hours",
      rating: 4.8,
      downloads: 15420,
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      topics: ["Variables", "Functions", "Objects", "Arrays", "Control Flow"],
    },
    {
      id: "python-essentials",
      title: "Python Programming Essentials",
      description:
        "Learn Python from scratch with hands-on examples and projects",
      type: "pdf",
      language: "Python",
      difficulty: "beginner",
      duration: "4-5 hours",
      rating: 4.9,
      downloads: 12800,
      url: "https://docs.python.org/3/tutorial/index.html",
      topics: ["Syntax", "Data Types", "Functions", "Classes", "Modules"],
    },
    {
      id: "react-development",
      title: "Modern React Development",
      description:
        "Build modern web applications with React, hooks, and best practices",
      type: "pdf",
      language: "React",
      difficulty: "intermediate",
      duration: "5-6 hours",
      rating: 4.7,
      downloads: 9650,
      url: "https://react.dev/learn",
      topics: ["Components", "Hooks", "State Management", "Routing", "Testing"],
    },
    {
      id: "algorithms-ds",
      title: "Algorithms & Data Structures",
      description: "Essential computer science concepts for problem solving",
      type: "pdf",
      language: "General",
      difficulty: "advanced",
      duration: "8-10 hours",
      rating: 4.6,
      downloads: 7200,
      url: "https://www.geeksforgeeks.org/data-structures/",
      topics: ["Arrays", "Trees", "Graphs", "Sorting", "Dynamic Programming"],
    },
    {
      id: "java-oop",
      title: "Java Object-Oriented Programming",
      description:
        "Master OOP concepts with Java including inheritance, polymorphism, and design patterns",
      type: "pdf",
      language: "Java",
      difficulty: "intermediate",
      duration: "6-7 hours",
      rating: 4.5,
      downloads: 8900,
      url: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html",
      topics: [
        "Classes",
        "Inheritance",
        "Polymorphism",
        "Encapsulation",
        "Design Patterns",
      ],
    },
    {
      id: "cpp-advanced",
      title: "Advanced C++ Programming",
      description:
        "Deep dive into C++ features including templates, STL, and memory management",
      type: "pdf",
      language: "C++",
      difficulty: "advanced",
      duration: "7-8 hours",
      rating: 4.4,
      downloads: 5400,
      url: "https://en.cppreference.com/w/",
      topics: [
        "Templates",
        "STL",
        "Memory Management",
        "Concurrency",
        "Performance",
      ],
    },
    {
      id: "typescript-guide",
      title: "TypeScript Complete Guide",
      description: "Add type safety to JavaScript projects with TypeScript",
      type: "pdf",
      language: "TypeScript",
      difficulty: "intermediate",
      duration: "4-5 hours",
      rating: 4.7,
      downloads: 11200,
      url: "https://www.typescriptlang.org/docs/",
      topics: [
        "Types",
        "Interfaces",
        "Generics",
        "Decorators",
        "Advanced Types",
      ],
    },
    {
      id: "web-dev-basics",
      title: "Web Development Fundamentals",
      description: "HTML, CSS, and JavaScript basics for web development",
      type: "pdf",
      language: "Web Development",
      difficulty: "beginner",
      duration: "3-4 hours",
      rating: 4.6,
      downloads: 18500,
      url: "https://developer.mozilla.org/en-US/docs/Learn",
      topics: ["HTML", "CSS", "JavaScript", "DOM", "Responsive Design"],
    },
    {
      id: "node-js-guide",
      title: "Node.js Complete Guide",
      description:
        "Server-side JavaScript development with Node.js and Express",
      type: "pdf",
      language: "Node.js",
      difficulty: "intermediate",
      duration: "5-6 hours",
      rating: 4.6,
      downloads: 9200,
      url: "https://nodejs.org/en/docs/guides/",
      topics: ["Express", "NPM", "Modules", "APIs", "Database Integration"],
    },
    {
      id: "go-programming",
      title: "Go Programming Language",
      description: "Learn Go (Golang) for efficient concurrent programming",
      type: "pdf",
      language: "Go",
      difficulty: "intermediate",
      duration: "4-5 hours",
      rating: 4.5,
      downloads: 6800,
      url: "https://go.dev/doc/tutorial/getting-started",
      topics: ["Syntax", "Goroutines", "Channels", "Packages", "Testing"],
    },
    {
      id: "rust-programming",
      title: "Rust Programming Language",
      description: "Memory-safe systems programming with Rust",
      type: "pdf",
      language: "Rust",
      difficulty: "advanced",
      duration: "6-8 hours",
      rating: 4.7,
      downloads: 5200,
      url: "https://doc.rust-lang.org/book/",
      topics: ["Ownership", "Borrowing", "Lifetimes", "Cargo", "Memory Safety"],
    },
    {
      id: "swift-development",
      title: "Swift Programming for iOS",
      description: "Develop iOS and macOS applications with Swift",
      type: "pdf",
      language: "Swift",
      difficulty: "intermediate",
      duration: "5-6 hours",
      rating: 4.4,
      downloads: 7100,
      url: "https://docs.swift.org/swift-book/",
      topics: [
        "Syntax",
        "Optionals",
        "Closures",
        "Protocols",
        "iOS Development",
      ],
    },
    {
      id: "js-pdf-guide",
      title: "JavaScript PDF Reference",
      description: "Comprehensive JavaScript reference with examples",
      type: "pdf",
      language: "JavaScript",
      difficulty: "beginner",
      duration: "2-3 hours",
      rating: 4.8,
      downloads: 25400,
      url: "data:text/html;charset=utf-8,<html><body style='font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;'><h1>JavaScript Reference Guide</h1><h2>Variables</h2><p>JavaScript variables are containers for storing data values.</p><pre><code>let name = 'Alice';\nconst age = 25;\nvar city = 'New York';</code></pre><h2>Functions</h2><p>Functions are blocks of code designed to perform a particular task.</p><pre><code>function greet(name) {\n  return 'Hello, ' + name + '!';\n}\n\n// Arrow function\nconst add = (a, b) => a + b;</code></pre><h2>Objects</h2><p>Objects are collections of key-value pairs.</p><pre><code>const person = {\n  name: 'John',\n  age: 30,\n  city: 'Boston'\n};</code></pre></body></html>",
      topics: ["Variables", "Functions", "Objects", "Arrays", "ES6"],
    },
    {
      id: "python-pdf-guide",
      title: "Python PDF Reference",
      description: "Essential Python concepts and syntax guide",
      type: "pdf",
      language: "Python",
      difficulty: "beginner",
      duration: "2-3 hours",
      rating: 4.9,
      downloads: 18200,
      url: "data:text/html;charset=utf-8,<html><body style='font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;'><h1>Python Reference Guide</h1><h2>Variables and Data Types</h2><p>Python variables are created when you assign a value to them.</p><pre><code>name = 'Python'\nage = 30\nheight = 5.9\nis_programmer = True</code></pre><h2>Lists and Dictionaries</h2><p>Lists and dictionaries are fundamental data structures in Python.</p><pre><code># Lists\nfruits = ['apple', 'banana', 'orange']\n\n# Dictionaries\nperson = {\n  'name': 'Alice',\n  'age': 25,\n  'city': 'Seattle'\n}</code></pre><h2>Functions</h2><p>Functions in Python are defined using the def keyword.</p><pre><code>def greet(name):\n  return f'Hello, {name}!'\n\n# Lambda functions\nadd = lambda x, y: x + y</code></pre></body></html>",
      topics: ["Variables", "Functions", "Lists", "Dictionaries", "Classes"],
    },
  ];

  const languages = [
    "all",
    "JavaScript",
    "Python",
    "React",
    "Java",
    "C++",
    "TypeScript",
    "Web Development",
    "General",
  ];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];
  const types = ["all", "pdf", "video", "article", "interactive"];

  const filteredMaterials = studyMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.topics.some((topic) =>
        topic.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesLanguage =
      selectedLanguage === "all" || material.language === selectedLanguage;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      material.difficulty === selectedDifficulty;
    const matchesType =
      selectedType === "all" || material.type === selectedType;

    return matchesSearch && matchesLanguage && matchesDifficulty && matchesType;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "article":
        return <BookOpen className="h-4 w-4" />;
      case "interactive":
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (currentPDF) {
    return (
      <PDFReader
        pdfUrl={currentPDF.url}
        title={currentPDF.title}
        onBack={() => setCurrentPDF(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Study Materials & Resources
          </CardTitle>
          <p className="text-muted-foreground">
            Access comprehensive study materials, PDFs, and interactive content
            for all programming languages.
          </p>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "all" ? "All Languages" : lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff === "all"
                        ? "All Levels"
                        : diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Types"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredMaterials.length} materials found
              </p>
              {(searchTerm ||
                selectedLanguage !== "all" ||
                selectedDifficulty !== "all" ||
                selectedType !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLanguage("all");
                    setSelectedDifficulty("all");
                    setSelectedType("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card
            key={material.id}
            className="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-2 line-clamp-2">
                    {material.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(material.type)}
                    <Badge variant="outline" className="text-xs">
                      {material.language}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(material.difficulty)}`}
                    >
                      {material.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {material.description}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1">
                {material.topics.slice(0, 3).map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {material.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{material.topics.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {material.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {material.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {material.downloads.toLocaleString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => setCurrentPDF(material)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedLanguage("all");
                setSelectedDifficulty("all");
                setSelectedType("all");
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
