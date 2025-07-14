import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Timer,
  Trophy,
  Star,
  Heart,
  Lightbulb,
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
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    </div>
  );
};
