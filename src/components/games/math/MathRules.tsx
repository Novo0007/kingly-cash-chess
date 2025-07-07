import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  Timer,
  Trophy,
  Zap,
  Star,
  Clock,
  Lightbulb,
  SkipForward,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const MathRules: React.FC = () => {
  const questionTypes = [
    {
      icon: "➕",
      name: "Addition",
      description: "Simple addition problems",
      example: "7 + 5 = ?",
      difficulty: "All levels",
    },
    {
      icon: "➖",
      name: "Subtraction",
      description: "Basic subtraction problems",
      example: "15 - 9 = ?",
      difficulty: "All levels",
    },
    {
      icon: "✖️",
      name: "Multiplication",
      description: "Multiplication tables and beyond",
      example: "6 × 7 = ?",
      difficulty: "Medium & Hard",
    },
    {
      icon: "➗",
      name: "Division",
      description: "Division with whole number results",
      example: "36 ÷ 6 = ?",
      difficulty: "Medium & Hard",
    },
    {
      icon: "🔢",
      name: "Missing Numbers",
      description: "Find the missing number in equations",
      example: "? + 4 = 9",
      difficulty: "Medium & Hard",
    },
    {
      icon: "🔁",
      name: "Patterns",
      description: "Number sequences and patterns",
      example: "2, 4, 6, ?",
      difficulty: "Hard only",
    },
  ];

  const difficulties = [
    {
      name: "Easy",
      color: "bg-green-100 text-green-800 border-green-200",
      time: "15 seconds",
      hints: "3 hints",
      skips: "2 skips",
      features: [
        "Simple addition (1-20)",
        "Basic subtraction",
        "Generous time limits",
        "More hints available",
      ],
    },
    {
      name: "Medium",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      time: "12 seconds",
      hints: "2 hints",
      skips: "1 skip",
      features: [
        "All basic operations",
        "Larger numbers",
        "Missing number problems",
        "Moderate time pressure",
      ],
    },
    {
      name: "Hard",
      color: "bg-red-100 text-red-800 border-red-200",
      time: "8 seconds",
      hints: "1 hint",
      skips: "1 skip",
      features: [
        "Complex calculations",
        "Number patterns",
        "Very large numbers",
        "High time pressure",
      ],
    },
  ];

  const gameModes = [
    {
      name: "Practice Mode",
      icon: Target,
      description: "10 questions to practice your skills",
      features: [
        "10 questions total",
        "No time pressure",
        "Perfect for learning",
        "Build confidence",
      ],
    },
    {
      name: "Timed Challenge",
      icon: Timer,
      description: "20 questions with time pressure",
      features: [
        "20 questions total",
        "Beat the clock",
        "Bonus for speed",
        "Competitive scoring",
      ],
    },
    {
      name: "Endless Mode",
      icon: Zap,
      description: "Keep going until you make a mistake",
      features: [
        "Unlimited questions",
        "One mistake ends game",
        "High score challenge",
        "Test your limits",
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Math: Brain Puzzles Rules
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              📚 Learn how to play and master the game!
            </p>
          </div>
        </div>
      </div>

      {/* Game Objective */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Target className="h-7 w-7 text-blue-600" />
            🎯 Game Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg text-gray-800">
            <strong>Goal:</strong> Solve as many math problems as possible by
            choosing the correct answer from multiple choices.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Choose Correctly</div>
              <div className="text-sm text-gray-600">
                Select the right answer
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Timer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold">Beat the Clock</div>
              <div className="text-sm text-gray-600">
                Answer within time limit
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">Earn Points</div>
              <div className="text-sm text-gray-600">Build high scores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="h-7 w-7 text-purple-600" />
            🔢 Types of Math Problems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionTypes.map((type, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{type.icon}</div>
                  <div>
                    <div className="font-bold text-gray-800">{type.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {type.difficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                <div className="bg-gray-50 rounded p-2 text-center font-mono text-lg">
                  {type.example}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Star className="h-7 w-7 text-yellow-600" />✅ Game Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                📋 Basic Rules
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    One question shown at a time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Multiple choice options (3-4 answers)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Only one correct answer per question
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Must answer within time limit
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Score increases for correct answers
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                🎯 Scoring System
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    +10 points for each correct answer
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    +5 bonus for 5+ answer streak
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    +3 bonus for quick answers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    1.5x multiplier for medium mode
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    2x multiplier for hard mode
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">
              ⚠️ Game Ends When:
            </h4>
            <ul className="space-y-1 text-yellow-700">
              <li>• Time runs out on a question</li>
              <li>• You give a wrong answer (in Endless mode)</li>
              <li>• All questions are completed (Practice/Timed modes)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Target className="h-7 w-7 text-green-600" />
            🧩 Difficulty Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficulties.map((diff, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <Badge className={`${diff.color} text-lg px-4 py-2`}>
                    {diff.name}
                  </Badge>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                    <div className="text-center">
                      <Timer className="h-4 w-4 mx-auto text-gray-600" />
                      <div className="font-semibold">{diff.time}</div>
                    </div>
                    <div className="text-center">
                      <Lightbulb className="h-4 w-4 mx-auto text-gray-600" />
                      <div className="font-semibold">{diff.hints}</div>
                    </div>
                    <div className="text-center">
                      <SkipForward className="h-4 w-4 mx-auto text-gray-600" />
                      <div className="font-semibold">{diff.skips}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {diff.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Zap className="h-7 w-7 text-orange-600" />
            🎮 Game Modes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameModes.map((mode, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <mode.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {mode.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{mode.description}</p>
                </div>

                <div className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Power-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Lightbulb className="h-7 w-7 text-yellow-600" />
            🎮 Power-ups & Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                💡 Hints System
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Hint Usage
                    </div>
                    <div className="text-sm text-gray-600">
                      Eliminates one wrong answer option
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Limited Hints
                    </div>
                    <div className="text-sm text-gray-600">
                      Number depends on difficulty level
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                ⏭️ Skip Option
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <SkipForward className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Skip Questions
                    </div>
                    <div className="text-sm text-gray-600">
                      Move to next question without answering
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Streak Reset
                    </div>
                    <div className="text-sm text-gray-600">
                      Skipping resets your answer streak
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Strategies */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <TrendingUp className="h-7 w-7 text-green-600" />
            💡 Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-800">
                🎯 Success Tips
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Start with easy mode to build confidence
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Practice mental math regularly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Use elimination for difficult questions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Don't overthink simple problems
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-800">
                ⚡ Performance Tips
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Answer quickly for time bonuses
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Build streaks for bonus points
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Save hints for harder questions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Timer className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Stay calm under time pressure
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
