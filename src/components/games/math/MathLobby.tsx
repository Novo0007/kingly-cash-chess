import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Clock,
  Trophy,
  Target,
  Zap,
  Star,
  Play,
  BookOpen,
  TrendingUp,
  Timer,
  Users,
  Award,
  Infinity,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface MathLobbyProps {
  onStartGame: (
    difficulty: "easy" | "medium" | "hard",
    gameMode: "practice" | "timed" | "endless",
  ) => void;
  onShowRules: () => void;
  onShowLeaderboard: () => void;
}

export const MathLobby: React.FC<MathLobbyProps> = ({
  onStartGame,
  onShowRules,
  onShowLeaderboard,
}) => {
  const { currentTheme } = useTheme();
  const difficulties = [
    {
      id: "easy" as const,
      title: "Easy Mode",
      description: "Basic addition and subtraction with simple numbers",
      icon: Target,
      color: "from-green-500 to-green-600",
      lightColor: "from-green-100 to-green-200",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      features: [
        "➕ Simple Addition (1-20)",
        "➖ Basic Subtraction",
        "⏱️ 15 seconds per question",
        "💡 3 hints available",
        "⏭️ 2 skips allowed",
      ],
      timeLimit: "15s per question",
      difficulty: "★☆☆",
    },
    {
      id: "medium" as const,
      title: "Medium Mode",
      description: "Mixed operations with moderate complexity",
      icon: Brain,
      color: "from-yellow-500 to-orange-500",
      lightColor: "from-yellow-100 to-orange-200",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      features: [
        "➕➖ Addition & Subtraction",
        "✖️➗ Multiplication & Division",
        "🔢 Missing numbers",
        "⏱️ 12 seconds per question",
        "💡 2 hints available",
      ],
      timeLimit: "12s per question",
      difficulty: "★★☆",
    },
    {
      id: "hard" as const,
      title: "Hard Mode",
      description: "Complex patterns and challenging calculations",
      icon: Zap,
      color: "from-red-500 to-purple-600",
      lightColor: "from-red-100 to-purple-200",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      features: [
        "🧮 All operations",
        "🔁 Number patterns",
        "📈 Large numbers",
        "⏱️ 8 seconds per question",
        "💡 1 hint only",
      ],
      timeLimit: "8s per question",
      difficulty: "★★★",
    },
  ];

  const gameModes = [
    {
      id: "practice" as const,
      title: "Practice Mode",
      description: "10 questions to practice your skills",
      icon: Target,
      color: "bg-blue-500",
      questions: "10 Questions",
      time: "No time pressure",
    },
    {
      id: "timed" as const,
      title: "Timed Challenge",
      description: "20 questions with time pressure",
      icon: Timer,
      color: "bg-orange-500",
      questions: "20 Questions",
      time: "Beat the clock",
    },
    {
      id: "endless" as const,
      title: "Endless Mode",
      description: "Keep going until you make a mistake",
      icon: Infinity,
      color: "bg-purple-500",
      questions: "Unlimited",
      time: "Until first error",
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Header - Mobile Optimized */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl">
            <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              Math: Brain Puzzles
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">
              🧠 Improve your arithmetic skills with fun, timed puzzles!
            </p>
          </div>
        </div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              🆓
            </div>
            <div className="text-xs sm:text-sm text-blue-800 font-semibold">
              Free to Play
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              🧮
            </div>
            <div className="text-xs sm:text-sm text-green-800 font-semibold">
              6 Question Types
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              ⚡
            </div>
            <div className="text-xs sm:text-sm text-purple-800 font-semibold">
              Quick Games
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4 sm:mb-6">
          🎮 Choose Your Game Mode
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {gameModes.map((mode) => (
            <Card
              key={mode.id}
              className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 ${mode.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                >
                  <mode.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">
                  {mode.title}
                </CardTitle>
                <p className="text-gray-600 text-sm">{mode.description}</p>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Questions:</span>
                    <Badge variant="outline">{mode.questions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Challenge:</span>
                    <Badge variant="outline">{mode.time}</Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-3">
                    Select difficulty level to start
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Difficulty Selection - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
          🎯 Select Difficulty Level
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {difficulties.map((diff) => (
            <Card
              key={diff.id}
              className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${diff.lightColor} rounded-bl-[50px] opacity-30`}
              ></div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-r ${diff.color} rounded-xl`}
                  >
                    <diff.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    className={`${diff.textColor} bg-white ${diff.borderColor} border`}
                  >
                    {diff.difficulty}
                  </Badge>
                </div>

                <CardTitle className="text-xl text-gray-800 mb-2">
                  {diff.title}
                </CardTitle>
                <p className="text-gray-600 text-sm">{diff.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {diff.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Game Mode Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center mb-3">
                    Choose game mode:
                  </p>
                  {gameModes.map((mode) => (
                    <Button
                      key={mode.id}
                      onClick={() => onStartGame(diff.id, mode.id)}
                      className={`w-full bg-gradient-to-r ${diff.color} hover:opacity-90 text-white border-0 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]`}
                      size="sm"
                    >
                      <mode.icon className="h-4 w-4" />
                      <span className="font-semibold">{mode.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons - Mobile Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        <Button
          onClick={onShowRules}
          variant="outline"
          size="lg"
          className="h-12 sm:h-16 text-sm sm:text-base font-semibold border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 w-full"
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          📚 Game Rules & Tips
        </Button>

        <Button
          onClick={onShowLeaderboard}
          variant="outline"
          size="lg"
          className="h-12 sm:h-16 text-sm sm:text-base font-semibold border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 w-full"
        >
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          🏆 View Leaderboard
        </Button>
      </div>

      {/* Features Highlight */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🌟 Game Features
          </h3>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">➕</div>
              <div className="text-sm font-semibold text-gray-700">
                Addition
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">➖</div>
              <div className="text-sm font-semibold text-gray-700">
                Subtraction
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✖️</div>
              <div className="text-sm font-semibold text-gray-700">
                Multiplication
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">➗</div>
              <div className="text-sm font-semibold text-gray-700">
                Division
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔢</div>
              <div className="text-sm font-semibold text-gray-700">
                Missing Numbers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔁</div>
              <div className="text-sm font-semibold text-gray-700">
                Patterns
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm font-semibold text-gray-700">
                Timed Challenge
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-semibold text-gray-700">
                Leaderboards
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
