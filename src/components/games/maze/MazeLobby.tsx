import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trophy,
  Target,
  Clock,
  Star,
  Crown,
  Zap,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { MazeGameLogic } from "./MazeGameLogic";
import { useDeviceType } from "@/hooks/use-mobile";

interface MazeLobbyProps {
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void;
  onShowRules: () => void;
  onShowLeaderboard: () => void;
}

export const MazeLobby: React.FC<MazeLobbyProps> = ({
  onStartGame,
  onShowRules,
  onShowLeaderboard,
}) => {
  const { isMobile } = useDeviceType();
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");

  const difficulties = [
    {
      id: "easy" as const,
      title: "Easy Explorer",
      description: "Perfect for beginners and quick games",
      icon: Zap,
      emoji: "🌱",
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      lightGradient: "from-green-100 to-emerald-100",
      size: "15×15",
      estimatedTime: "1-3 min",
      baseScore: 100,
      features: ["Quick solve", "Simple paths", "Great for practice"],
    },
    {
      id: "medium" as const,
      title: "Maze Runner",
      description: "Balanced challenge for strategy lovers",
      icon: Target,
      emoji: "🎯",
      color: "yellow",
      gradient: "from-yellow-500 to-orange-600",
      lightGradient: "from-yellow-100 to-orange-100",
      size: "25×25",
      estimatedTime: "3-7 min",
      baseScore: 200,
      features: ["Moderate complexity", "Strategic thinking", "Good rewards"],
    },
    {
      id: "hard" as const,
      title: "Labyrinth Master",
      description: "Ultimate challenge for puzzle experts",
      icon: Crown,
      emoji: "👑",
      color: "red",
      gradient: "from-red-500 to-rose-600",
      lightGradient: "from-red-100 to-rose-100",
      size: "35×35",
      estimatedTime: "7-15 min",
      baseScore: 300,
      features: ["Complex maze", "Expert level", "Maximum points"],
    },
  ];

  const selectedDifficultyData = difficulties.find(
    (d) => d.id === selectedDifficulty,
  )!;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full"></div>

        <CardHeader className="relative text-center pb-6 pt-8">
          <CardTitle>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Target className="h-10 w-10 md:h-12 md:w-12 text-white" />
                </div>
              </div>
              <div className="text-center">
                <span className="block text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg">
                  🧩 MAZE CHALLENGE
                </span>
                <span className="block text-lg md:text-xl text-white/90 font-medium mt-2">
                  Navigate • Explore • Conquer • Earn Points!
                </span>
              </div>
            </div>

            <p className="text-white/90 text-base md:text-lg font-medium max-w-2xl mx-auto">
              Test your puzzle-solving skills in challenging mazes. No money
              required - just pure brain power!
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-white font-bold text-lg md:text-xl">
                  FREE
                </div>
                <div className="text-white/80 text-xs">To Play</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-bold text-lg md:text-xl">∞</div>
                <div className="text-white/80 text-xs">Attempts</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-bold text-lg md:text-xl">
                  24/7
                </div>
                <div className="text-white/80 text-xs">Available</div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="relative bg-gradient-to-br from-blue-500 to-cyan-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">How to Play</h4>
                  <p className="text-white/90 text-sm">
                    Learn the rules and strategies
                  </p>
                </div>
              </div>
              <Button
                onClick={onShowRules}
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                Rules
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-purple-500 to-pink-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Leaderboard</h4>
                  <p className="text-white/90 text-sm">
                    See top puzzle masters
                  </p>
                </div>
              </div>
              <Button
                onClick={onShowLeaderboard}
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
              >
                Rankings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Selection */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Award className="h-6 w-6 text-purple-600" />
              <span className="text-2xl font-bold text-gray-800">
                Choose Your Challenge
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium">
              Select difficulty level and start your maze adventure
            </p>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Difficulty Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {difficulties.map((difficulty) => (
              <div
                key={difficulty.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedDifficulty === difficulty.id
                    ? "transform scale-105"
                    : "hover:scale-[1.02]"
                }`}
                onClick={() => setSelectedDifficulty(difficulty.id)}
              >
                {/* Glow Effect */}
                {selectedDifficulty === difficulty.id && (
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${difficulty.gradient} rounded-2xl blur-lg opacity-50`}
                  ></div>
                )}

                <Card
                  className={`relative border-2 transition-all duration-300 ${
                    selectedDifficulty === difficulty.id
                      ? `border-${difficulty.color}-300 bg-${difficulty.color}-50`
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-3 bg-gradient-to-r ${difficulty.gradient} rounded-xl text-white shadow-lg`}
                      >
                        <difficulty.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800">
                            {difficulty.title}
                          </h3>
                          <span className="text-xl">{difficulty.emoji}</span>
                        </div>
                        <Badge
                          className={`mt-1 bg-gradient-to-r ${difficulty.gradient} text-white border-0 text-xs`}
                        >
                          {difficulty.size}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {difficulty.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-3 w-3" />
                          Time
                        </span>
                        <span className="font-semibold text-gray-800">
                          {difficulty.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Star className="h-3 w-3" />
                          Base Score
                        </span>
                        <span className="font-semibold text-gray-800">
                          {difficulty.baseScore}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-1">
                      {difficulty.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <div
                            className={`w-1.5 h-1.5 bg-${difficulty.color}-500 rounded-full`}
                          ></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selection Indicator */}
                    {selectedDifficulty === difficulty.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div
                          className={`flex items-center gap-2 text-${difficulty.color}-600 font-semibold text-sm`}
                        >
                          <Target className="h-4 w-4" />
                          Selected Challenge
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Start Game Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">
                  Ready to start {selectedDifficultyData.title}?
                </h3>
                <p className="text-white/90 text-sm">
                  {selectedDifficultyData.size} maze •{" "}
                  {selectedDifficultyData.estimatedTime} •{" "}
                  {selectedDifficultyData.baseScore} base points
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Free to play
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Earn points
                  </span>
                  <span className="flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Join leaderboard
                  </span>
                </div>
              </div>

              <Button
                onClick={() => onStartGame(selectedDifficulty)}
                className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Game
              </Button>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">No Cost</h4>
              <p className="text-gray-600 text-sm">
                Play unlimited games without spending money
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Earn Points</h4>
              <p className="text-gray-600 text-sm">
                Score points based on speed and difficulty
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Leaderboard</h4>
              <p className="text-gray-600 text-sm">
                Compete for top spots with other players
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
