import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Trophy,
  Star,
  Clock,
  Zap,
  Crown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Gamepad2,
  Award,
  TrendingUp,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface MazeRulesProps {
  onStartGame?: () => void;
  onBack?: () => void;
}

export const MazeRules: React.FC<MazeRulesProps> = ({
  onStartGame,
  onBack,
}) => {
  const { isMobile } = useDeviceType();

  const difficulties = [
    {
      name: "Easy Explorer",
      emoji: "🌱",
      size: "15×15",
      time: "1-3 min",
      score: 100,
      color: "green",
      description: "Perfect for beginners and quick games",
    },
    {
      name: "Maze Runner",
      emoji: "🎯",
      size: "25×25",
      time: "3-7 min",
      score: 200,
      color: "yellow",
      description: "Balanced challenge for strategy lovers",
    },
    {
      name: "Labyrinth Master",
      emoji: "👑",
      size: "35×35",
      time: "7-15 min",
      score: 300,
      color: "red",
      description: "Ultimate challenge for puzzle experts",
    },
  ];

  const controls = [
    { key: "Arrow Keys", description: "Move in all directions", icon: "⌨️" },
    { key: "WASD", description: "Alternative movement keys", icon: "🎮" },
    { key: "Space", description: "Pause/Resume game", icon: "⏸️" },
    { key: "Touch", description: "Tap controls (mobile)", icon: "📱" },
  ];

  const scoringFactors = [
    {
      factor: "Base Score",
      description: "Points for completing the maze",
      icon: "🏆",
    },
    {
      factor: "Time Bonus",
      description: "Extra points for fast completion",
      icon: "⚡",
    },
    {
      factor: "Difficulty Multiplier",
      description: "Higher rewards for harder mazes",
      icon: "🔥",
    },
    {
      factor: "Move Efficiency",
      description: "Bonus for finding optimal paths",
      icon: "🎯",
    },
  ];

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
                  🧩 MAZE RULES
                </span>
                <span className="block text-lg md:text-xl text-white/90 font-medium mt-2">
                  Master the Art of Maze Navigation
                </span>
              </div>
            </div>

            <p className="text-white/90 text-base md:text-lg font-medium max-w-2xl mx-auto">
              Learn how to play, score points, and climb the leaderboards in our
              exciting maze challenges!
            </p>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* How to Play */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              How to Play
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objective */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Game Objective
            </h3>
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <p className="text-gray-700 text-base leading-relaxed">
                Navigate from the{" "}
                <span className="font-semibold text-blue-600">
                  🏁 start position
                </span>{" "}
                to the
                <span className="font-semibold text-yellow-600">
                  {" "}
                  🏆 finish trophy
                </span>{" "}
                by finding your way through the maze walls. The goal is to
                complete the maze as quickly as possible while earning maximum
                points!
              </p>
            </div>
          </div>

          {/* Controls */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              Controls & Movement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desktop Controls */}
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  💻 Desktop Controls
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="grid grid-cols-3 gap-1 max-w-32">
                      <div></div>
                      <div className="bg-gray-100 border border-gray-300 rounded p-2 text-center text-sm font-mono">
                        <ArrowUp className="h-4 w-4 mx-auto" />
                      </div>
                      <div></div>
                      <div className="bg-gray-100 border border-gray-300 rounded p-2 text-center text-sm font-mono">
                        <ArrowLeft className="h-4 w-4 mx-auto" />
                      </div>
                      <div className="bg-gray-100 border border-gray-300 rounded p-2 text-center text-sm font-mono">
                        <ArrowDown className="h-4 w-4 mx-auto" />
                      </div>
                      <div className="bg-gray-100 border border-gray-300 rounded p-2 text-center text-sm font-mono">
                        <ArrowRight className="h-4 w-4 mx-auto" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Arrow keys for movement</div>
                    <div>• WASD keys also work</div>
                    <div>• Spacebar to pause/resume</div>
                  </div>
                </div>
              </div>

              {/* Mobile Controls */}
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📱 Mobile Controls
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-center mb-3">
                    <div className="grid grid-cols-3 gap-1 max-w-32">
                      <div></div>
                      <button className="bg-blue-100 border border-blue-300 rounded p-2 text-center text-sm font-bold">
                        ↑
                      </button>
                      <div></div>
                      <button className="bg-blue-100 border border-blue-300 rounded p-2 text-center text-sm font-bold">
                        ←
                      </button>
                      <div className="bg-gray-100 rounded p-1 flex items-center justify-center">
                        🎮
                      </div>
                      <button className="bg-blue-100 border border-blue-300 rounded p-2 text-center text-sm font-bold">
                        →
                      </button>
                      <div></div>
                      <button className="bg-blue-100 border border-blue-300 rounded p-2 text-center text-sm font-bold">
                        ↓
                      </button>
                      <div></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Tap directional buttons</div>
                    <div>• Swipe gestures supported</div>
                    <div>• Touch controls overlay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Difficulty Levels
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficulties.map((difficulty, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{difficulty.emoji}</div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {difficulty.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {difficulty.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Maze Size</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {difficulty.size}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. Time</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {difficulty.time}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base Score</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {difficulty.score}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-yellow-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Scoring System
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How Points Are Calculated
            </h3>
            <div className="text-gray-700 space-y-2">
              <div className="font-mono bg-gray-50 p-3 rounded text-sm">
                <strong>
                  Final Score = (Base Score + Time Bonus) × Difficulty
                  Multiplier
                </strong>
              </div>
              <div className="text-sm">
                • <strong>Time Bonus:</strong> Up to 300 points for completing
                quickly
                <br />• <strong>Difficulty Multipliers:</strong> Easy ×1, Medium
                ×2, Hard ×3
                <br />• <strong>Maximum possible scores:</strong> Easy: 400pts,
                Medium: 1000pts, Hard: 1800pts
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringFactors.map((factor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{factor.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {factor.factor}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {factor.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Strategies */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Tips & Strategies
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                🎯 Winning Strategies
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Follow the Right Wall
                  </div>
                  <div className="text-sm text-gray-600">
                    Keep your right hand on the wall and follow it - this
                    classic technique guarantees finding the exit!
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Look Ahead
                  </div>
                  <div className="text-sm text-gray-600">
                    Plan your route by looking several moves ahead to avoid dead
                    ends.
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Speed vs Accuracy
                  </div>
                  <div className="text-sm text-gray-600">
                    Balance quick movement with careful planning to maximize
                    your score.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                ⚡ Pro Tips
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Use Pause Wisely
                  </div>
                  <div className="text-sm text-gray-600">
                    Take breaks to study the maze layout without time pressure.
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Practice Makes Perfect
                  </div>
                  <div className="text-sm text-gray-600">
                    Start with easy mazes to build your navigation skills before
                    tackling harder challenges.
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-gray-800 mb-1">
                    Trail Memory
                  </div>
                  <div className="text-sm text-gray-600">
                    Remember your path to avoid revisiting the same areas
                    unnecessarily.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard & Achievements */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Leaderboard & Competition
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🏆 Leaderboard Features
              </h3>
              <div className="space-y-2 text-gray-700">
                <div>• Separate rankings for each difficulty level</div>
                <div>• Overall champions across all difficulties</div>
                <div>• Real-time score updates</div>
                <div>• Your personal best tracking</div>
                <div>• Daily and weekly top performers</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🎖️ Achievement System
              </h3>
              <div className="space-y-2 text-gray-700">
                <div>• Speed Runner: Complete in record time</div>
                <div>• Maze Master: Perfect scores on hard mode</div>
                <div>• Consistent Player: Daily completion streaks</div>
                <div>• Explorer: Complete all difficulty levels</div>
                <div>• Champion: Reach top 10 leaderboard</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6" />
              <div>
                <h4 className="font-bold">Compete with Players Worldwide</h4>
                <p className="text-pink-100 text-sm">
                  Join thousands of maze enthusiasts and prove your
                  puzzle-solving skills!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="px-8 py-3 text-lg font-semibold"
          >
            ← Back to Lobby
          </Button>
        )}

        {onStartGame && (
          <Button
            onClick={onStartGame}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Playing Now!
          </Button>
        )}
      </div>
    </div>
  );
};
