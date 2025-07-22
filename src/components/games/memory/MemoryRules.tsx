import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Brain,
  Target,
  Timer,
  AlertTriangle,
  Trophy,
  Eye,
  RotateCcw,
  Zap,
  Star,
} from "lucide-react";

interface MemoryRulesProps {
  onStartGame: () => void;
  onBack: () => void;
}

export const MemoryRules: React.FC<MemoryRulesProps> = ({
  onStartGame,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Memory Flip Game Rules
                </h1>
                <p className="text-gray-600">Learn how to play and win!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Objective */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Game Objective
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">
            Flip two cards at a time to find matching pairs. Your goal is to match all pairs 
            with the fewest moves possible or within the shortest time.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              🎯 Win by finding all matching pairs before running out of moves or time!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Choose Your Difficulty</h4>
                <p className="text-gray-600 text-sm">
                  Select Easy (3×2), Medium (4×4), or Hard (6×6) grid size.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Flip the First Card</h4>
                <p className="text-gray-600 text-sm">
                  Click on any face-down card to reveal its symbol.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Flip the Second Card</h4>
                <p className="text-gray-600 text-sm">
                  Click on another card to see if it matches the first one.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Match or Continue</h4>
                <p className="text-gray-600 text-sm">
                  If cards match, they stay revealed. If not, they flip back after a short delay.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 font-bold text-sm">5</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Repeat Until Complete</h4>
                <p className="text-gray-600 text-sm">
                  Continue flipping cards until all pairs are matched or you run out of moves/time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Difficulty Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Easy</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Grid:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">3×2 (6 cards)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Max Moves:</span>
                  <span className="font-medium text-green-900">20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Time Limit:</span>
                  <span className="font-medium text-green-900">60s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Max Wrong:</span>
                  <span className="font-medium text-green-900">5</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Medium</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Grid:</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">4×4 (16 cards)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Max Moves:</span>
                  <span className="font-medium text-yellow-900">35</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Time Limit:</span>
                  <span className="font-medium text-yellow-900">120s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Max Wrong:</span>
                  <span className="font-medium text-yellow-900">8</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">Hard</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Grid:</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800">6×6 (36 cards)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Max Moves:</span>
                  <span className="font-medium text-red-900">60</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Time Limit:</span>
                  <span className="font-medium text-red-900">180s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Max Wrong:</span>
                  <span className="font-medium text-red-900">12</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elimination Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Elimination Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-3">
              ⚠️ You will be eliminated if you exceed any of these limits:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Too many moves (varies by difficulty)</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Time limit exceeded</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Too many wrong moves</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Memory Techniques</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Try to remember the position of cards you've seen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Create mental associations between symbols and positions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Start from corners and work your way inward</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Strategic Tips</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Don't rush - take time to remember what you've seen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Try to flip cards systematically rather than randomly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Practice on easier levels before attempting harder ones</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onStartGame} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
          <Play className="w-4 h-4" />
          Start Playing
        </Button>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Button>
      </div>
    </div>
  );
};
