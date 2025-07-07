import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trophy,
  Target,
  Crown,
  Zap,
  Star,
  ArrowRight,
  Brain,
  Timer,
  Grid3x3,
} from "lucide-react";

interface Game2048LobbyProps {
  onStartGame: (difficulty: "classic" | "challenge" | "expert") => void;
  onShowRules: () => void;
  onShowLeaderboard: () => void;
}

export const Game2048Lobby: React.FC<Game2048LobbyProps> = ({
  onStartGame,
  onShowRules,
  onShowLeaderboard,
}) => {
  const difficulties = [
    {
      id: "classic" as const,
      title: "Classic Mode",
      description: "Original 2048 experience on a 4x4 grid",
      target: "Reach 2048",
      boardSize: "4x4",
      icon: Zap,
      emoji: "🟦",
      color: "blue",
      gradient: "from-blue-600 to-blue-700",
      lightGradient: "from-blue-100 to-blue-200",
      difficulty: "Beginner",
      estimatedTime: "5-15 min",
      features: [
        "4x4 grid board",
        "Reach 2048 tile",
        "Classic rules",
        "Perfect for beginners",
      ],
    },
    {
      id: "challenge" as const,
      title: "Challenge Mode",
      description: "Enhanced challenge on a larger 5x5 grid",
      target: "Reach 4096",
      boardSize: "5x5",
      icon: Target,
      emoji: "🟨",
      color: "yellow",
      gradient: "from-yellow-600 to-orange-600",
      lightGradient: "from-yellow-100 to-orange-200",
      difficulty: "Intermediate",
      estimatedTime: "10-25 min",
      features: [
        "5x5 grid board",
        "Reach 4096 tile",
        "More strategy required",
        "Extended gameplay",
      ],
    },
    {
      id: "expert" as const,
      title: "Expert Mode",
      description: "Ultimate challenge on a massive 6x6 grid",
      target: "Reach 8192",
      boardSize: "6x6",
      icon: Crown,
      emoji: "🟥",
      color: "red",
      gradient: "from-red-600 to-purple-600",
      lightGradient: "from-red-100 to-purple-200",
      difficulty: "Expert",
      estimatedTime: "15-45 min",
      features: [
        "6x6 grid board",
        "Reach 8192 tile",
        "Maximum complexity",
        "For puzzle masters",
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 border-0 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full"></div>

        <CardHeader className="relative text-center pb-6">
          <CardTitle>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Grid3x3 className="h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  🎯
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">
                  2048 PUZZLE
                </h1>
                <p className="text-lg font-medium text-white/90">
                  🧩 Combine tiles to reach the target number - completely FREE!
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="h-5 w-5" />
                <span className="font-bold">Brain Training</span>
              </div>
              <p className="text-sm text-white/80">
                Improve logic and planning skills
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">Free Leaderboards</span>
              </div>
              <p className="text-sm text-white/80">
                Compete with players worldwide
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5" />
                <span className="font-bold">Multiple Modes</span>
              </div>
              <p className="text-sm text-white/80">
                From beginner to expert levels
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onShowRules}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              📚 How to Play
            </Button>
            <Button
              onClick={onShowLeaderboard}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              🏆 Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {difficulties.map((mode, index) => (
          <Card
            key={mode.id}
            className="group relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50"
          >
            {/* Background decoration */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${mode.lightGradient} rounded-bl-full opacity-30`}
            ></div>

            {/* Difficulty badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge
                className={`bg-gradient-to-r ${mode.gradient} text-white border-0 font-bold`}
              >
                {mode.difficulty}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-3 bg-gradient-to-r ${mode.gradient} rounded-xl text-white shadow-lg`}
                >
                  <mode.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {mode.title}
                    <span className="text-xl">{mode.emoji}</span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {mode.description}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Game Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold text-gray-800">
                    {mode.target}
                  </div>
                  <div className="text-xs text-gray-500">Target</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Grid3x3 className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-semibold text-gray-800">
                    {mode.boardSize}
                  </div>
                  <div className="text-xs text-gray-500">Board</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {mode.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Star className={`h-3 w-3 text-${mode.color}-500`} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Estimated time */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <Timer className="h-4 w-4" />
                <span>Estimated time: {mode.estimatedTime}</span>
              </div>

              {/* Play button */}
              <Button
                onClick={() => onStartGame(mode.id)}
                className={`w-full bg-gradient-to-r ${mode.gradient} hover:${mode.gradient} text-white border-0 py-3 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>PLAY {mode.title.toUpperCase()}</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold mb-1">🆓</div>
              <div className="text-sm text-gray-300">Completely Free</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">🧠</div>
              <div className="text-sm text-gray-300">Brain Training</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">🏆</div>
              <div className="text-sm text-gray-300">Global Leaderboards</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">📱</div>
              <div className="text-sm text-gray-300">Mobile Friendly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
