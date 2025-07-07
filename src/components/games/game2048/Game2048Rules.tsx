import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3x3,
  Target,
  Crown,
  Lightbulb,
  Trophy,
  Smartphone,
  Keyboard,
} from "lucide-react";

interface Game2048RulesProps {
  className?: string;
}

export const Game2048Rules: React.FC<Game2048RulesProps> = ({ className }) => {
  const gameModes = [
    {
      name: "Classic Mode",
      board: "4x4",
      target: "2048",
      color: "blue",
      difficulty: "Beginner",
    },
    {
      name: "Challenge Mode",
      board: "5x5",
      target: "4096",
      color: "yellow",
      difficulty: "Intermediate",
    },
    {
      name: "Expert Mode",
      board: "6x6",
      target: "8192",
      color: "red",
      difficulty: "Expert",
    },
  ];

  const strategies = [
    {
      title: "Keep the highest tile in a corner",
      description:
        "Choose a corner and try to keep your highest value tile there throughout the game.",
      icon: "🏠",
    },
    {
      title: "Build in one direction",
      description:
        "Focus on building your tiles in one direction (usually towards your chosen corner).",
      icon: "➡️",
    },
    {
      title: "Don't chase small tiles",
      description:
        "Focus on combining larger tiles rather than chasing small 2s and 4s around the board.",
      icon: "🎯",
    },
    {
      title: "Plan your moves",
      description:
        "Think ahead about where tiles will move and what new combinations will be possible.",
      icon: "🧠",
    },
    {
      title: "Keep options open",
      description:
        "Try to maintain multiple possible moves rather than getting stuck with only one direction.",
      icon: "🔄",
    },
  ];

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 border-0 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20"></div>
        <CardHeader className="relative text-center">
          <CardTitle>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Grid3x3 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">
                  HOW TO PLAY 2048
                </h1>
                <p className="text-lg font-medium text-white/90 mt-2">
                  🧩 Master the puzzle game that's taking the world by storm!
                </p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Basic Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Game Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">🎯 Main Goal</h3>
            <p className="text-blue-700">
              Combine numbered tiles by moving them in four directions to create
              a tile with the target number. The target depends on the game mode
              you choose!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gameModes.map((mode, index) => (
              <div
                key={index}
                className={`bg-${mode.color}-50 border border-${mode.color}-200 rounded-lg p-4 text-center`}
              >
                <h4 className={`font-bold text-${mode.color}-800 mb-2`}>
                  {mode.name}
                </h4>
                <div className="space-y-1">
                  <p className={`text-sm text-${mode.color}-700`}>
                    Board: {mode.board}
                  </p>
                  <p className={`text-sm text-${mode.color}-700`}>
                    Target: {mode.target}
                  </p>
                  <Badge
                    className={`bg-${mode.color}-200 text-${mode.color}-800`}
                  >
                    {mode.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-6 w-6 text-green-600" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step by step */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Step by Step:</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Start with two tiles</p>
                    <p className="text-sm text-gray-600">
                      The game begins with two random tiles (2 or 4) on the
                      board.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Move tiles</p>
                    <p className="text-sm text-gray-600">
                      Use arrow keys or swipe to move all tiles in one
                      direction.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Combine tiles</p>
                    <p className="text-sm text-gray-600">
                      When two tiles with the same number touch, they merge into
                      one.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className="font-semibold">New tiles appear</p>
                    <p className="text-sm text-gray-600">
                      After each move, a new tile (2 or 4) appears randomly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Reach the target!</p>
                    <p className="text-sm text-gray-600">
                      Win by creating the target tile, but you can continue
                      playing!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Example:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Two tiles with the same number:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-orange-300 rounded flex items-center justify-center font-bold text-white">
                      2
                    </div>
                    <span className="text-xl">+</span>
                    <div className="w-12 h-12 bg-orange-300 rounded flex items-center justify-center font-bold text-white">
                      2
                    </div>
                    <span className="text-xl">→</span>
                    <div className="w-12 h-12 bg-orange-400 rounded flex items-center justify-center font-bold text-white">
                      4
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Continue combining:
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span>4 + 4 = 8</span>
                    <span>→</span>
                    <span>8 + 8 = 16</span>
                    <span>→</span>
                    <span>16 + 16 = 32</span>
                    <span>→</span>
                    <span>...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-6 w-6 text-purple-600" />
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Desktop Controls */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Desktop Controls
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ArrowUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold">Up Arrow</p>
                    <p className="text-sm text-gray-600">or W key</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ArrowDown className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold">Down Arrow</p>
                    <p className="text-sm text-gray-600">or S key</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ArrowLeft className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold">Left Arrow</p>
                    <p className="text-sm text-gray-600">or A key</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold">Right Arrow</p>
                    <p className="text-sm text-gray-600">or D key</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    👆
                  </div>
                  <div>
                    <p className="font-semibold">Swipe Up</p>
                    <p className="text-sm text-gray-600">Move tiles up</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    👇
                  </div>
                  <div>
                    <p className="font-semibold">Swipe Down</p>
                    <p className="text-sm text-gray-600">Move tiles down</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    👈
                  </div>
                  <div>
                    <p className="font-semibold">Swipe Left</p>
                    <p className="text-sm text-gray-600">Move tiles left</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    👉
                  </div>
                  <div>
                    <p className="font-semibold">Swipe Right</p>
                    <p className="text-sm text-gray-600">Move tiles right</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            Winning Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="text-2xl">{strategy.icon}</div>
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">
                    {strategy.title}
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {strategy.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring and Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-orange-600" />
            Scoring & Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">📊 Scoring System</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Points earned:</strong> Equal to the value of the new
                  tile created
                </p>
                <p className="text-sm">
                  <strong>Example:</strong> Combining two 8s = 16 points
                </p>
                <p className="text-sm">
                  <strong>Goal:</strong> Achieve the highest possible score!
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">💡 Pro Tips</h3>
              <div className="space-y-2 text-sm">
                <p>• Don't rush - take time to plan your moves</p>
                <p>
                  • Focus on building larger tiles rather than clearing small
                  ones
                </p>
                <p>
                  • Practice with Classic mode before trying harder difficulties
                </p>
                <p>• Watch for patterns and develop your own strategy</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-800 mb-2">🎯 Remember:</h4>
            <p className="text-green-700 text-sm">
              2048 is completely free to play! Enjoy the puzzle, compete on
              leaderboards, and challenge yourself across different difficulty
              modes. There are no hidden costs or premium features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
