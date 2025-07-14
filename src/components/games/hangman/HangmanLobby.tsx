import React from "react";
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
