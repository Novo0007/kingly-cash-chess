import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Timer,
  Target,
  Star,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";

interface MemoryLeaderboardProps {
  onBack: () => void;
  user: any;
}

interface LeaderboardEntry {
  id: string;
  playerName: string;
  moves: number;
  timeElapsed: number;
  difficulty: "easy" | "medium" | "hard";
  completedAt: string;
  rank: number;
}

export const MemoryLeaderboard: React.FC<MemoryLeaderboardProps> = ({
  onBack,
  user,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  // Mock leaderboard data - in a real app, this would come from your backend
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      id: "1",
      playerName: "MemoryMaster",
      moves: 8,
      timeElapsed: 23,
      difficulty: "easy",
      completedAt: "2024-01-15",
      rank: 1,
    },
    {
      id: "2",
      playerName: "QuickThinker",
      moves: 9,
      timeElapsed: 27,
      difficulty: "easy",
      completedAt: "2024-01-14",
      rank: 2,
    },
    {
      id: "3",
      playerName: "CardFlipPro",
      moves: 10,
      timeElapsed: 31,
      difficulty: "easy",
      completedAt: "2024-01-13",
      rank: 3,
    },
    {
      id: "4",
      playerName: "BrainPower",
      moves: 18,
      timeElapsed: 45,
      difficulty: "medium",
      completedAt: "2024-01-15",
      rank: 1,
    },
    {
      id: "5",
      playerName: "MemoryChamp",
      moves: 21,
      timeElapsed: 52,
      difficulty: "medium",
      completedAt: "2024-01-14",
      rank: 2,
    },
    {
      id: "6",
      playerName: "UltimatePlayer",
      moves: 35,
      timeElapsed: 89,
      difficulty: "hard",
      completedAt: "2024-01-15",
      rank: 1,
    },
  ];

  const getFilteredLeaderboard = (difficulty: "easy" | "medium" | "hard") => {
    return mockLeaderboardData
      .filter(entry => entry.difficulty === difficulty)
      .sort((a, b) => {
        // Sort by moves first, then by time
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.timeElapsed - b.timeElapsed;
      })
      .slice(0, 10); // Top 10
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Memory Flip Leaderboard
                </h1>
                <p className="text-gray-600">Top players by difficulty level</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Tabs */}
      <Tabs defaultValue="easy" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="easy" className="gap-2">
              <Star className="w-4 h-4" />
              Easy
            </TabsTrigger>
            <TabsTrigger value="medium" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Medium
            </TabsTrigger>
            <TabsTrigger value="hard" className="gap-2">
              <Trophy className="w-4 h-4" />
              Hard
            </TabsTrigger>
          </TabsList>
        </div>

        {["easy", "medium", "hard"].map((difficulty) => (
          <TabsContent key={difficulty} value={difficulty} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
                  </span>
                  <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                    {difficulty === "easy" && "3×2 Grid"}
                    {difficulty === "medium" && "4×4 Grid"}
                    {difficulty === "hard" && "6×6 Grid"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredLeaderboard(difficulty as "easy" | "medium" | "hard").map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        index < 3 
                          ? "bg-gradient-to-r from-gray-50 to-white border-gray-200 shadow-sm" 
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                          {getRankIcon(index + 1)}
                        </div>

                        {/* Player Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{entry.playerName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {entry.completedAt}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Target className="w-4 h-4" />
                            <span className="font-bold">{entry.moves}</span>
                          </div>
                          <div className="text-xs text-gray-500">moves</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1 text-green-600">
                            <Timer className="w-4 h-4" />
                            <span className="font-bold">{entry.timeElapsed}s</span>
                          </div>
                          <div className="text-xs text-gray-500">time</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {getFilteredLeaderboard(difficulty as "easy" | "medium" | "hard").length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Records Yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Be the first to complete a game on {difficulty} difficulty!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Personal Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Your Personal Best
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-bold text-green-900 text-lg">12 moves</div>
              <div className="text-green-700 text-sm">Best Easy Score</div>
              <div className="text-green-600 text-xs">32s • 2 days ago</div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="font-bold text-yellow-900 text-lg">25 moves</div>
              <div className="text-yellow-700 text-sm">Best Medium Score</div>
              <div className="text-yellow-600 text-xs">78s • 1 week ago</div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-red-600" />
              </div>
              <div className="font-bold text-red-900 text-lg">-</div>
              <div className="text-red-700 text-sm">Best Hard Score</div>
              <div className="text-red-600 text-xs">Not attempted yet</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
