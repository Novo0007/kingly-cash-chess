import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Clock,
  Trophy,
  Star,
  Heart,
  Lightbulb,
  Crown,
  Zap,
  BookOpen,
  Play,
} from "lucide-react";

interface HangmanRulesProps {
  onBack: () => void;
  onStartGame: () => void;
}

export const HangmanRules: React.FC<HangmanRulesProps> = ({
  onBack,
  onStartGame,
}) => {
  const rules = [
    {
      icon: Target,
      title: "Objective",
      description:
        "Guess the hidden word by selecting letters before the hangman drawing is completed.",
      details: [
        "Each word belongs to a category (Animals, Technology, or Food)",
        "Use the category hint to help narrow down possibilities",
        "Complete the word to advance to the next level",
      ],
    },
    {
      icon: Heart,
      title: "Lives System",
      description:
        "You have 7 chances to make wrong guesses before the game ends.",
      details: [
        "Each wrong letter guess adds a part to the hangman drawing",
        "7 wrong guesses = complete hangman = game over",
        "Correct guesses don't count against your lives",
      ],
    },
    {
      icon: Clock,
      title: "Time Limit",
      description: "You have 3 minutes (180 seconds) to guess each word.",
      details: [
        "Timer starts when the word is displayed",
        "Time bonus points for finishing early",
        "Game ends automatically when time runs out",
      ],
    },
    {
      icon: Lightbulb,
      title: "Hints System",
      description: "Get helpful clues about the word, but it costs points.",
      details: [
        "Each hint costs 5 points",
        "Hints provide context about the word",
        "Use hints strategically for harder words",
      ],
    },
  ];

  const scoringRules = [
    {
      action: "Correct Letter",
      points: "10 × Current Level",
      description: "Points for each correct letter guess",
      color: "bg-green-100 text-green-800",
    },
    {
      action: "Word Completion",
      points: "50 × Current Level",
      description: "Bonus for completing the entire word",
      color: "bg-blue-100 text-blue-800",
    },
    {
      action: "Time Bonus",
      points: "+1 per 10 seconds left",
      description: "Extra points for finishing quickly",
      color: "bg-purple-100 text-purple-800",
    },
    {
      action: "Using Hint",
      points: "-5 points",
      description: "Cost for getting a helpful hint",
      color: "bg-red-100 text-red-800",
    },
  ];

  const difficultyLevels = [
    {
      level: "1-3",
      difficulty: "Easy",
      description: "Short words (3-5 letters)",
      examples: "CAT, DOG, PIZZA",
      color: "bg-green-100 text-green-800",
    },
    {
      level: "4-6",
      difficulty: "Medium",
      description: "Medium words (6-8 letters)",
      examples: "ELEPHANT, SMARTPHONE",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      level: "7+",
      difficulty: "Hard",
      description: "Long words (9+ letters)",
      examples: "RHINOCEROS, CRYPTOCURRENCY",
      color: "bg-red-100 text-red-800",
    },
  ];

  const strategies = [
    {
      title: "Start with Vowels",
      tip: "Begin with common vowels: A, E, I, O, U",
      icon: "🔤",
    },
    {
      title: "Common Consonants",
      tip: "Try frequent consonants: R, S, T, L, N",
      icon: "📝",
    },
    {
      title: "Use Category Clues",
      tip: "Think about words that fit the given category",
      icon: "🏷️",
    },
    {
      title: "Letter Patterns",
      tip: "Look for common word endings and patterns",
      icon: "🧩",
    },
    {
      title: "Strategic Hints",
      tip: "Save hints for longer, more difficult words",
      icon: "💡",
    },
    {
      title: "Time Management",
      tip: "Don't spend too long thinking - make educated guesses",
      icon: "⏰",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-2xl md:text-3xl font-black">
                🎪 Hangman Rules
              </CardTitle>
              <p className="text-white/90 mt-2">
                Master the classic word-guessing game
              </p>
            </div>
            <div className="w-10"></div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Rules */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <rule.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-800">{rule.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {rule.description}
                </p>
                <ul className="space-y-1">
                  {rule.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringRules.map((rule, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {rule.action}
                  </span>
                  <Badge className={rule.color}>{rule.points}</Badge>
                </div>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="h-6 w-6 text-purple-600" />
            Difficulty Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyLevels.map((level, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 hover:border-purple-300 transition-all duration-300"
              >
                <CardContent className="p-4 text-center">
                  <Badge className={`${level.color} mb-3`}>
                    Level {level.level}
                  </Badge>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">
                    {level.difficulty}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {level.description}
                  </p>
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                    {level.examples}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategies */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Crown className="h-6 w-6 text-green-600" />
            Winning Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{strategy.icon}</span>
                  <h4 className="font-bold text-gray-800">{strategy.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{strategy.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Word Categories */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Word Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🐾</div>
              <h4 className="font-bold text-gray-800 mb-2">Animals</h4>
              <p className="text-sm text-gray-600">
                From cats and dogs to elephants and chameleons
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💻</div>
              <h4 className="font-bold text-gray-800 mb-2">Technology</h4>
              <p className="text-sm text-gray-600">
                Phones, computers, and modern innovations
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🍕</div>
              <h4 className="font-bold text-gray-800 mb-2">Food</h4>
              <p className="text-sm text-gray-600">
                From pizza and apples to exotic cuisines
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Play className="h-5 w-5 mr-2" />
          Start Playing Now
        </Button>

        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-3 px-8 text-lg transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Lobby
        </Button>
      </div>
    </div>
  );
};
