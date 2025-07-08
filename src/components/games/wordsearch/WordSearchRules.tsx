import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Clock,
  Users,
  Coins,
  Lightbulb,
  Trophy,
  Star,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface WordSearchRulesProps {
  onBack?: () => void;
}

export const WordSearchRules: React.FC<WordSearchRulesProps> = ({ onBack }) => {
  const { isMobile } = useDeviceType();

  const gameFeatures = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Multiple Difficulties",
      description:
        "Easy, Medium, and Hard levels with different word complexities",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Multiplayer Mode",
      description: "Compete with up to 4 players in real-time",
    },
    {
      icon: <Coins className="h-5 w-5" />,
      title: "Coin System",
      description: "Earn and spend coins for entry fees and hints",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Smart Hints",
      description: "Three types of hints to help you find words",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Leaderboards",
      description: "Compete for top rankings in different categories",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Timed Challenges",
      description: "Race against time to find all words",
    },
  ];

  const scoringRules = [
    {
      title: "Word Length Bonus",
      description: "Longer words give more points (10 points per letter)",
    },
    {
      title: "Difficulty Multiplier",
      description: "Easy: 1x, Medium: 1.5x, Hard: 2x points",
    },
    {
      title: "Speed Bonus",
      description: "Find words quickly for additional points",
    },
    {
      title: "Perfect Game",
      description: "Find all words for a completion bonus",
    },
  ];

  const hintTypes = [
    {
      name: "First Letter Highlight",
      cost: 5,
      description: "Highlights the first letter of a random unfound word",
      icon: "🔍",
    },
    {
      name: "Word Location",
      cost: 5,
      description: "Highlights the entire word location for 3 seconds",
      icon: "📍",
    },
    {
      name: "Direction Hint",
      cost: 5,
      description:
        "Tells you the direction of a word (horizontal/vertical/diagonal)",
      icon: "🧭",
    },
  ];

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          {onBack && (
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          <div className="text-center">
            <CardTitle className="text-3xl mb-2 flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8" />
              Word Search Rules
            </CardTitle>
            <p className="text-purple-100">
              Everything you need to know to master the game
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* How to Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Gameplay</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Find Hidden Words</h4>
                    <p className="text-sm text-gray-600">
                      Words are hidden in the grid horizontally, vertically, and
                      diagonally
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Select Words</h4>
                    <p className="text-sm text-gray-600">
                      Click and drag from the first letter to the last letter of
                      a word
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Race Against Time</h4>
                    <p className="text-sm text-gray-600">
                      Find all words before time runs out to maximize your score
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Word Directions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-2">→</div>
                    <p className="text-sm font-medium">Horizontal</p>
                    <p className="text-xs text-gray-600">Left to right</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">↓</div>
                    <p className="text-sm font-medium">Vertical</p>
                    <p className="text-xs text-gray-600">Top to bottom</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">↘</div>
                    <p className="text-sm font-medium">Diagonal</p>
                    <p className="text-xs text-gray-600">Any diagonal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6" />
            Game Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-blue-600 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="font-medium mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                How Points are Calculated
              </h3>
              <div className="space-y-3">
                {scoringRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">{rule.title}</h4>
                      <p className="text-sm text-gray-600">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Difficulty Levels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <Badge className="bg-green-100 text-green-800 mb-1">
                      Easy
                    </Badge>
                    <p className="text-sm">
                      3-6 letter words, 10 minute time limit
                    </p>
                  </div>
                  <div className="text-right text-sm text-green-600 font-medium">
                    1x Points
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <Badge className="bg-yellow-100 text-yellow-800 mb-1">
                      Medium
                    </Badge>
                    <p className="text-sm">
                      4-10 letter words, 5 minute time limit
                    </p>
                  </div>
                  <div className="text-right text-sm text-yellow-600 font-medium">
                    1.5x Points
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <Badge className="bg-red-100 text-red-800 mb-1">Hard</Badge>
                    <p className="text-sm">
                      6-25 letter words, 3 minute time limit
                    </p>
                  </div>
                  <div className="text-right text-sm text-red-600 font-medium">
                    2x Points
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hint System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Hint System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-gray-600">
              Need help finding a word? Use coins to purchase hints that will
              help you locate hidden words.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hintTypes.map((hint, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-3">{hint.icon}</div>
                  <h3 className="font-bold mb-2">{hint.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-yellow-600">
                      {hint.cost} coins
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{hint.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multiplayer Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Multiplayer Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Game Setup</h3>
              <div className="space-y-2 text-sm">
                <p>• 2-4 players can join a game</p>
                <p>• Entry fee creates the prize pool</p>
                <p>• All players see the same word grid</p>
                <p>• Game starts when lobby is full or creator starts</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Competition Rules</h3>
              <div className="space-y-2 text-sm">
                <p>• First player to find a word gets the points</p>
                <p>• No sharing of word locations</p>
                <p>• Hints only help the purchasing player</p>
                <p>• Game ends when time runs out or all words found</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Prize Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-1">🥇</div>
                <p className="font-medium">1st Place</p>
                <p className="text-blue-600">50-70% of prize pool</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🥈</div>
                <p className="font-medium">2nd Place</p>
                <p className="text-blue-600">20-30% of prize pool</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🥉</div>
                <p className="font-medium">3rd Place</p>
                <p className="text-blue-600">10-20% of prize pool</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips and Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Tips and Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Finding Words Efficiently
              </h3>
              <div className="space-y-2 text-sm">
                <p>• Start with longer words as they're often easier to spot</p>
                <p>• Look for common letter patterns and endings</p>
                <p>
                  • Scan systematically: horizontal, then vertical, then
                  diagonal
                </p>
                <p>• Use word list to focus on specific words</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Multiplayer Strategy
              </h3>
              <div className="space-y-2 text-sm">
                <p>• Balance speed with accuracy</p>
                <p>• Use hints strategically on difficult words</p>
                <p>• Focus on words others might miss</p>
                <p>• Consider time management in competitive games</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
