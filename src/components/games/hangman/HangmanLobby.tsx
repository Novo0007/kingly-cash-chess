import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trophy,
  Users,
  Star,
  Target,
  Clock,
  BookOpen,
  Zap,
  Heart,
  Gift,
  Lightbulb,
  Crown,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface HangmanLobbyProps {
  onStartGame: () => void;
  onViewRules: () => void;
  onViewLeaderboard: () => void;
=======
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  BookOpen,
  Trophy,
  Star,
  Timer,
  Heart,
  Target,
  Zap,
  Crown,
  Award,
} from "lucide-react";

interface HangmanLobbyProps {
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void;
  onShowRules: () => void;
  onShowLeaderboard: () => void;

}

export const HangmanLobby: React.FC<HangmanLobbyProps> = ({
  onStartGame,

  onViewRules,
  onViewLeaderboard,
}) => {
  const { isMobile } = useDeviceType();

  const features = [
    {
      icon: Target,
      title: "Multiple Categories",
      description: "Animals, Technology, Food & More",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Progressive Difficulty",
      description: "Easy → Medium → Hard levels",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      title: "Timed Challenges",
      description: "3 minutes per word",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Lightbulb,
      title: "Smart Hints",
      description: "Get help when you need it",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const gameCategories = [
    {
      name: "Animals",
      emoji: "🐾",
      words: "45+ words",
      difficulty: "Easy to Hard",
    },
    {
      name: "Technology",
      emoji: "💻",
      words: "45+ words",
      difficulty: "Easy to Hard",
    },
    {
      name: "Food",
      emoji: "🍕",
      words: "45+ words",
      difficulty: "Easy to Hard",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <CardHeader className="relative z-10 text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4 animate-bounce">🎪</div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-black mb-2">
                Hangman Challenge
              </CardTitle>
              <p className="text-lg text-white/90 font-medium">
                Guess the word before time runs out!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-semibold">500+ Playing</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="font-semibold">4.8 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-300" />
              <span className="font-semibold">Free to Play</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Play className="h-6 w-6 mr-3" />
          Start Playing
        </Button>

        <Button
          onClick={onViewRules}
          variant="outline"
          className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-6 text-lg transition-all duration-300 hover:scale-105"
        >
          <BookOpen className="h-6 w-6 mr-3" />
          How to Play
        </Button>

        <Button
          onClick={onViewLeaderboard}
          variant="outline"
          className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-bold py-6 text-lg transition-all duration-300 hover:scale-105"
        >
          <Trophy className="h-6 w-6 mr-3" />
          Leaderboard
        </Button>
      </div>

      {/* Game Features */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800 mb-2">
            Game Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Categories */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800 mb-2">
            Word Categories
          </CardTitle>
          <p className="text-center text-gray-600">
            Three exciting categories with different difficulty levels
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gameCategories.map((category, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.emoji}</div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">
                    {category.name}
                  </h4>
                  <div className="space-y-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {category.words}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {category.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Score */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800 mb-2">
            <Crown className="h-6 w-6 inline mr-2 text-yellow-600" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 mb-3">Earn Points For:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">
                    Correct letter: <strong>10 × Level points</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">
                    Level completion: <strong>50 × Level bonus</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">
                    Time bonus: <strong>+1 per 10 seconds left</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 mb-3">Game Rules:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">7 wrong guesses = Game Over</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">3 minutes per word</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Use hints (-5 points)</span>
                </div>
              </div>

  onShowRules,
  onShowLeaderboard,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold mb-2">Hangman</h1>
          <p className="text-blue-100 text-lg">
            Guess the hidden word before the drawing is complete!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-white/30">
              <Star className="h-3 w-3 mr-1" />
              Word Puzzle
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              <Trophy className="h-3 w-3 mr-1" />
              Score Based
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              🆓 Free to Play
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Choose Your Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Easy Mode */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-700">
                      Easy Mode
                    </h3>
                    <p className="text-green-600 text-sm">
                      Perfect for beginners
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Beginner
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="font-bold">8</span>
                  </div>
                  <span className="text-xs text-gray-600">Wrong Guesses</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Timer className="h-4 w-4" />
                    <span className="font-bold">3m</span>
                  </div>
                  <span className="text-xs text-gray-600">Time Limit</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="font-bold">10</span>
                  </div>
                  <span className="text-xs text-gray-600">Base Points</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">4-6</span>
                  </div>
                  <span className="text-xs text-gray-600">Word Length</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Common words like:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    CAT
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    DOG
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    APPLE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    HORSE
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => onStartGame("easy")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Easy Game
              </Button>
            </CardContent>
          </Card>

          {/* Medium Mode */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-700">
                      Medium Mode
                    </h3>
                    <p className="text-yellow-600 text-sm">
                      Balanced challenge
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Recommended
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="font-bold">6</span>
                  </div>
                  <span className="text-xs text-gray-600">Wrong Guesses</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Timer className="h-4 w-4" />
                    <span className="font-bold">2m</span>
                  </div>
                  <span className="text-xs text-gray-600">Time Limit</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="font-bold">20</span>
                  </div>
                  <span className="text-xs text-gray-600">Base Points</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">5-8</span>
                  </div>
                  <span className="text-xs text-gray-600">Word Length</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Moderate words like:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    TIGER
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    BANANA
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    PURPLE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    FRANCE
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => onStartGame("medium")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Medium Game
              </Button>
            </CardContent>
          </Card>

          {/* Hard Mode */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                    <Crown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700">
                      Hard Mode
                    </h3>
                    <p className="text-red-600 text-sm">
                      For word masters only
                    </p>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  Expert
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="font-bold">5</span>
                  </div>
                  <span className="text-xs text-gray-600">Wrong Guesses</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <Timer className="h-4 w-4" />
                    <span className="font-bold">90s</span>
                  </div>
                  <span className="text-xs text-gray-600">Time Limit</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="font-bold">30</span>
                  </div>
                  <span className="text-xs text-gray-600">Base Points</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                    <Star className="h-4 w-4" />
                    <span className="font-bold">7-12</span>
                  </div>
                  <span className="text-xs text-gray-600">Word Length</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Challenging words like:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    ELEPHANT
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    PINEAPPLE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    TURQUOISE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    BADMINTON
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => onStartGame("hard")}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Hard Game
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">How to Play</h3>
                <p className="text-gray-600 text-sm">
                  Learn the rules and strategies
                </p>
              </div>
              <Button onClick={onShowRules} variant="outline">
                View Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Leaderboard</h3>
                <p className="text-gray-600 text-sm">
                  See top scores and rankings
                </p>
              </div>
              <Button onClick={onShowLeaderboard} variant="outline">
                View Scores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Game Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-bold text-purple-800">Multiple Categories</h4>
              <p className="text-purple-600 text-sm">
                Animals, fruits, colors, countries & more
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-blue-800">Time Challenge</h4>
              <p className="text-blue-600 text-sm">
                Beat the clock for bonus points
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-bold text-green-800">Smart Scoring</h4>
              <p className="text-green-600 text-sm">
                Earn points based on difficulty & speed
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-bold text-yellow-800">Achievements</h4>
              <p className="text-yellow-600 text-sm">
                Unlock perfect games and streaks
              </p>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-800 mb-4 text-center">
            💡 Pro Tips for Success
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Start with common vowels (A, E, I, O, U)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Try frequent consonants (R, S, T, L, N)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Use category hints to narrow down possibilities</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Save hints for longer, harder words</span>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">💡</span>
              <span>
                Start with common vowels (A, E, I, O, U) to reveal word
                structure
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">🎯</span>
              <span>
                Try frequent consonants like R, S, T, L, N after vowels
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">⚡</span>
              <span>Use hints sparingly - they reduce your final score</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">🏆</span>
              <span>
                Perfect games (no wrong guesses) earn big bonus points
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">⏰</span>
              <span>Speed bonus: faster completion = higher score</span>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
