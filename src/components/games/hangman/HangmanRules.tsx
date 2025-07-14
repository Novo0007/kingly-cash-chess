import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Clock,
=======
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Timer,

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

  Award,
  Zap,
  Crown,
  CheckCircle,
} from "lucide-react";

export const HangmanRules: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-bold mb-2">How to Play Hangman</h1>
          <p className="text-blue-100 text-lg">
            Master the classic word guessing game with our comprehensive guide
          </p>
        </CardContent>
      </Card>

      {/* Basic Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Basic Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Objective</h4>
                  <p className="text-gray-600 text-sm">
                    Guess the hidden word by selecting letters before the
                    hangman drawing is complete.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Word Display</h4>
                  <p className="text-gray-600 text-sm">
                    The word appears as blanks (underscores) representing each
                    letter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Letter Guessing</h4>
                  <p className="text-gray-600 text-sm">
                    Choose letters one at a time. Correct guesses reveal all
                    instances of that letter.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-red-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Wrong Guesses</h4>
                  <p className="text-gray-600 text-sm">
                    Incorrect letters add parts to the hangman drawing. Limited
                    wrong guesses allowed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Winning</h4>
                  <p className="text-gray-600 text-sm">
                    Complete the word before running out of guesses to win the
                    game.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-orange-600 font-bold">6</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Losing</h4>
                  <p className="text-gray-600 text-sm">
                    If the hangman drawing is completed, the game ends and you
                    lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Difficulty Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Easy */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Easy</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  <span className="text-sm">8 wrong guesses allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-green-600" />
                  <span className="text-sm">3 minutes time limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm">4-6 letter words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span className="text-sm">10 base points</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800 text-xs font-medium">
                  Perfect for beginners and casual players
                </p>
              </div>
            </div>

            {/* Medium */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-yellow-700">Medium</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">6 wrong guesses allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">2 minutes time limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">5-8 letter words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">20 base points</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800 text-xs font-medium">
                  Balanced challenge with good rewards
                </p>
              </div>
            </div>

            {/* Hard */}
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-700">Hard</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm">5 wrong guesses allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-red-600" />
                  <span className="text-sm">90 seconds time limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-red-600" />
                  <span className="text-sm">7-12 letter words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-red-600" />
                  <span className="text-sm">30 base points</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-red-800 text-xs font-medium">
                  For experts seeking maximum challenge
                </p>
              </div>
            </div>
 main
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}

      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Base Scoring</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Easy Mode</span>
                  <Badge className="bg-blue-100 text-blue-800">10 points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Medium Mode</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    20 points
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Hard Mode</span>
                  <Badge className="bg-red-100 text-red-800">30 points</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Bonus Points</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">+10 per unused wrong guess</span>
                </div>
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">+2 per remaining second</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">
                    +50 for perfect game (no mistakes)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">-5 per hint used</span>
                </div>
              </div>
            </div>

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

      {/* Strategy Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            Winning Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                Letter Priority
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Start with Vowels
                  </h4>
                  <p className="text-green-700 text-sm">
                    A, E, I, O, U appear in most words
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Common Consonants
                  </h4>
                  <p className="text-blue-700 text-sm">
                    R, S, T, L, N are frequently used
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Avoid Rare Letters
                  </h4>
                  <p className="text-purple-700 text-sm">
                    Q, X, Z, J are less common
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Advanced Tips</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Pattern Recognition
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    Look for common word patterns and endings
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-800 mb-2">
                    Category Awareness
                  </h4>
                  <p className="text-indigo-700 text-sm">
                    Use the category hint to narrow possibilities
                  </p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-medium text-pink-800 mb-2">
                    Time Management
                  </h4>
                  <p className="text-pink-700 text-sm">
                    Think quickly but don't rush into mistakes
                  </p>
                </div>
              </div>
            </div>

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
=======
      {/* Word Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600" />
            Word Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Animals</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    CAT
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    TIGER
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ELEPHANT
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Domestic pets to wild creatures
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Fruits</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    APPLE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    BANANA
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    PINEAPPLE
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Common and exotic fruits
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Colors</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    RED
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    PURPLE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    TURQUOISE
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Basic and complex color names
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Countries</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    USA
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    FRANCE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    SWITZERLAND
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Nations around the world
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Sports</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    SOCCER
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    BASKETBALL
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    BADMINTON
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Popular sports and activities
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">And More!</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    NATURE
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    FOOD
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    OBJECTS
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Many other exciting categories
                </p>
              </div>
            </div>

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

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Game Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    Type
                  </span>
                  <span>Enter letters using keyboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    Click
                  </span>
                  <span>Tap alphabet buttons to guess</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    Enter
                  </span>
                  <span>Submit your letter guess</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    Hint
                  </span>
                  <span>Reveal a random letter (-5 points)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Remember</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Each letter can only be guessed once</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Wrong guesses add to hangman drawing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Time limit varies by difficulty</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Perfect games earn bonus points</span>
                </div>
              </div>

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
