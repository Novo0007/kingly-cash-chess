import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  Clock,
  Trophy,
  Coins,
  Star,
  Users,
  Brain,
  Zap,
} from "lucide-react";

export const ScrabbleRules: React.FC = () => {
  const letterValues = [
    { letters: "A, E, I, O, U, L, N, S, T, R", value: 1 },
    { letters: "D, G", value: 2 },
    { letters: "B, C, M, P", value: 3 },
    { letters: "F, H, V, W, Y", value: 4 },
    { letters: "K", value: 5 },
    { letters: "J, X", value: 8 },
    { letters: "Q, Z", value: 10 },
    { letters: "Blank tiles", value: 0 },
  ];

  const specialSquares = [
    {
      type: "Triple Word Score (TW)",
      color: "Red",
      description: "Triples the score of the entire word",
    },
    {
      type: "Double Word Score (DW)",
      color: "Pink",
      description: "Doubles the score of the entire word",
    },
    {
      type: "Triple Letter Score (TL)",
      color: "Blue",
      description: "Triples the value of the letter",
    },
    {
      type: "Double Letter Score (DL)",
      color: "Light Blue",
      description: "Doubles the value of the letter",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <BookOpen className="h-8 w-8" />
            Scrabble / Words with Friends Rules
          </CardTitle>
          <p className="text-blue-100">
            Master the art of word-building and strategy!
          </p>
        </CardHeader>
      </Card>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">2-4</div>
            <div className="text-xs opacity-90">Players</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">5 min</div>
            <div className="text-xs opacity-90">Per Turn</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">7</div>
            <div className="text-xs opacity-90">Tiles per Player</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">50</div>
            <div className="text-xs opacity-90">Bonus for 7 tiles</div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-700">
                🎯 Objective
              </h3>
              <p className="text-gray-700 mb-4">
                Score the most points by forming words on the game board using
                letter tiles.
              </p>

              <h3 className="font-bold text-lg mb-3 text-blue-700">
                🎮 Game Setup
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Each player draws 7 letter tiles</li>
                <li>• 100 tiles total in the game</li>
                <li>• 15×15 game board with special squares</li>
                <li>• First word must cross the center star</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-purple-700">
                ⚡ Turn Actions
              </h3>
              <p className="text-gray-700 mb-2">On your turn, you can:</p>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • <strong>Play Word:</strong> Place tiles to form a valid word
                </li>
                <li>
                  • <strong>Exchange Tiles:</strong> Swap tiles with the bag
                  (lose turn)
                </li>
                <li>
                  • <strong>Pass:</strong> Skip your turn (no penalty)
                </li>
              </ul>

              <h3 className="font-bold text-lg mb-3 mt-4 text-orange-700">
                🏆 Scoring
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Sum of all letter values in words formed</li>
                <li>• Multipliers apply only to new tiles</li>
                <li>• +50 bonus for using all 7 tiles</li>
                <li>• Game ends when tiles run out or no moves possible</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Letter Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-600" />
            Letter Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {letterValues.map((group, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium text-gray-700">
                  {group.letters}
                </span>
                <Badge
                  variant={
                    group.value <= 1
                      ? "secondary"
                      : group.value <= 4
                        ? "default"
                        : "destructive"
                  }
                  className="font-bold"
                >
                  {group.value} {group.value === 1 ? "point" : "points"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Squares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Special Board Squares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialSquares.map((square, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor:
                        square.color === "Red"
                          ? "#ef4444"
                          : square.color === "Pink"
                            ? "#ec4899"
                            : square.color === "Blue"
                              ? "#3b82f6"
                              : "#06b6d4",
                    }}
                  ></div>
                  <span className="font-bold">{square.type}</span>
                </div>
                <p className="text-sm text-gray-600">{square.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Multipliers only apply to newly placed
              tiles in that turn, not to existing tiles on the board.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coin System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-600" />
            Coin System & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-800 mb-2">🆓 Free Games</h3>
              <p className="text-sm text-green-700">
                Play without entry fees to practice and improve your skills.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">💰 Coin Games</h3>
              <p className="text-sm text-blue-700">
                Entry fee games where winners take the entire prize pool.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2">🎁 Daily Bonus</h3>
              <p className="text-sm text-purple-700">
                Get free coins daily just for playing and staying active.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Starting Package</h3>
            <p className="text-sm text-gray-700">
              • New players get 1000 free coins to start playing
              <br />
              • Practice in free games to learn strategies
              <br />• Buy more coins anytime to join premium games
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-700">
                🎯 Scoring Tips
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Look for high-value letters (J, Q, X, Z)</li>
                <li>• Use multiplier squares strategically</li>
                <li>• Try to use all 7 tiles for 50-point bonus</li>
                <li>• Form multiple words in one turn when possible</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-700">
                🧠 Advanced Strategy
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Keep a balanced rack of vowels and consonants</li>
                <li>• Block opponents from premium squares</li>
                <li>• Save blank tiles for high-scoring opportunities</li>
                <li>• Learn common 2-letter words (QI, XI, etc.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game End */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Game End & Winning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Game Ends When:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>A player uses all their tiles (and tile bag is empty)</li>
                <li>No player can make a valid move</li>
                <li>All players pass their turn consecutively</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Final Scoring:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Subtract remaining tile values from each player's score</li>
                <li>Player with the highest score wins</li>
                <li>Winner receives the entire prize pool (in coin games)</li>
                <li>Ties are broken by who finished first</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
