import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  BookOpen,
  Trophy,
  Brain,
  Clock,
  Target,
  Star,
  Zap,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface MemoryLobbyProps {
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void;
  onShowRules: () => void;
  onShowLeaderboard: () => void;
}

export const MemoryLobby: React.FC<MemoryLobbyProps> = ({
  onStartGame,
  onShowRules,
  onShowLeaderboard,
}) => {
  const { isMobile } = useDeviceType();

  const difficultyLevels = [
    {
      id: "easy" as const,
      name: "Easy",
      description: "Perfect for beginners",
      grid: "3×2 (6 cards)",
      maxMoves: 20,
      timeLimit: "60s",
      maxWrongMoves: 5,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      icon: Star,
    },
    {
      id: "medium" as const,
      name: "Medium", 
      description: "Good challenge for most players",
      grid: "4×4 (16 cards)",
      maxMoves: 35,
      timeLimit: "120s",
      maxWrongMoves: 8,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50 to-orange-50",
      icon: Zap,
    },
    {
      id: "hard" as const,
      name: "Hard",
      description: "Ultimate memory challenge",
      grid: "6×6 (36 cards)",
      maxMoves: 60,
      timeLimit: "180s",
      maxWrongMoves: 12,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-50 to-pink-50",
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Memory Flip Game
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Test your memory skills by flipping cards to find matching pairs. 
                Challenge yourself with different difficulty levels!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onShowRules} variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                How to Play
              </Button>
              <Button onClick={onShowLeaderboard} variant="outline" className="gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Choose Your Challenge
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          {difficultyLevels.map((level) => (
            <Card
              key={level.id}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onStartGame(level.id)}
            >
              <CardContent className={`p-6 bg-gradient-to-br ${level.bgColor} h-full`}>
                <div className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 bg-gradient-to-r ${level.color} rounded-xl`}>
                      <level.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge 
                      variant="outline"
                      className="bg-white/80 text-gray-700 border-gray-300"
                    >
                      {level.grid}
                    </Badge>
                  </div>

                  {/* Level Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {level.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {level.description}
                    </p>
                  </div>

                  {/* Level Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Max Moves:</span>
                      </div>
                      <span className="font-medium text-gray-900">{level.maxMoves}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Time Limit:</span>
                      </div>
                      <span className="font-medium text-gray-900">{level.timeLimit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Max Wrong:</span>
                      </div>
                      <span className="font-medium text-gray-900">{level.maxWrongMoves}</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button 
                    className={`w-full bg-gradient-to-r ${level.color} hover:opacity-90 text-white border-0 gap-2 group-hover:scale-105 transition-transform`}
                  >
                    <Play className="w-4 h-4" />
                    Play {level.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Game Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Game Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Memory Training</div>
                <div className="text-xs text-gray-500">Improve your memory</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Time Challenge</div>
                <div className="text-xs text-gray-500">Beat the clock</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Move Counter</div>
                <div className="text-xs text-gray-500">Track efficiency</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Achievements</div>
                <div className="text-xs text-gray-500">Unlock rewards</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
