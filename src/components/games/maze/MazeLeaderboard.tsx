import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Timer,
  Target,
  RefreshCw,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MazeScore } from "./MazeGameLogic";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDeviceType } from "@/hooks/use-mobile";

interface MazeLeaderboardProps {
  currentUserScore?: MazeScore;
  onRefresh?: () => void;
}

export const MazeLeaderboard: React.FC<MazeLeaderboardProps> = ({
  currentUserScore,
  onRefresh,
}) => {
  const { isMobile } = useDeviceType();
  const [leaderboards, setLeaderboards] = useState<{
    easy: MazeScore[];
    medium: MazeScore[];
    hard: MazeScore[];
    overall: MazeScore[];
  }>({
    easy: [],
    medium: [],
    hard: [],
    overall: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overall");

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // Helper function to get top scores per user for a specific difficulty
      const getTopScoresByDifficulty = async (difficulty: string) => {
        const { data, error } = await (supabase as any)
          .from("maze_scores")
          .select("*")
          .eq("difficulty", difficulty)
          .order("score", { ascending: false });

        if (error) throw error;

        // Group by username and get highest score for each user
        const userBestScores = new Map<string, MazeScore>();
        (data || []).forEach((score) => {
          const existing = userBestScores.get(score.username);
          if (!existing || score.score > existing.score) {
            userBestScores.set(score.username, score as any); // Type assertion for database compatibility
          }
        });

        // Convert to array and sort by score, then limit to top 10
        return Array.from(userBestScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      };

      // Fetch scores for each difficulty
      const difficulties = ["easy", "medium", "hard"];
      const leaderboardPromises = difficulties.map(async (difficulty) => {
        const scores = await getTopScoresByDifficulty(difficulty);
        return { difficulty, scores };
      });

      // Fetch overall leaderboard (highest score per user across all difficulties)
      const { data: overallData, error: overallError } = await (supabase as any)
        .from("maze_scores")
        .select("*")
        .order("score", { ascending: false });

      if (overallError) throw overallError;

      // Group by username and get highest score for each user across all difficulties
      const userBestOverallScores = new Map<string, MazeScore>();
      (overallData || []).forEach((score) => {
        const existing = userBestOverallScores.get(score.username);
        if (!existing || score.score > existing.score) {
          userBestOverallScores.set(score.username, score as any); // Type assertion for database compatibility
        }
      });

      const overallTopScores = Array.from(userBestOverallScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      const results = await Promise.all(leaderboardPromises);
      const newLeaderboards = {
        easy: [],
        medium: [],
        hard: [],
        overall: overallTopScores,
      } as any;

      results.forEach(({ difficulty, scores }) => {
        newLeaderboards[difficulty] = scores;
      });

      setLeaderboards(newLeaderboards);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const LeaderboardList = ({
    scores,
    showDifficulty = false,
  }: {
    scores: MazeScore[];
    showDifficulty?: boolean;
  }) => (
    <div className="space-y-3">
      {scores.map((score, index) => (
        <div
          key={score.id}
          className={`flex items-center gap-4 p-4 bg-white rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md ${
            currentUserScore?.id === score.id
              ? "border-blue-300 bg-blue-50"
              : "border-gray-100"
          }`}
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            {getRankIcon(index + 1)}
          </div>

          {/* Avatar and User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {score.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800 truncate">
                  {score.username || "Anonymous"}
                </h4>
                {currentUserScore?.id === score.id && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    You
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {showDifficulty && (
                  <Badge
                    className={`text-xs ${getDifficultyColor(score.difficulty)}`}
                  >
                    {score.difficulty}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatTime(score.time_taken)}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {score.maze_size}×{score.maze_size}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {score.score.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(score.completed_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}

      {scores.length === 0 && !loading && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No scores yet
          </h3>
          <p className="text-gray-500">
            Be the first to complete a maze and set a record!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-200 shadow-xl">
      <CardHeader className="text-center pb-6">
        <CardTitle>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full blur-lg opacity-60"></div>
              <div className="relative p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white shadow-lg">
                <Trophy className="h-8 w-8" />
              </div>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-black text-gray-800">
                🏆 Maze Champions
              </span>
              <p className="text-purple-600 text-sm font-medium">
                Top puzzle solvers and their amazing records
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => {
                fetchLeaderboards();
                onRefresh?.();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="overall" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {isMobile ? "All" : "Overall"}
            </TabsTrigger>
            <TabsTrigger
              value="easy"
              className="flex items-center gap-2 text-green-600"
            >
              <Zap className="h-4 w-4" />
              Easy
            </TabsTrigger>
            <TabsTrigger
              value="medium"
              className="flex items-center gap-2 text-yellow-600"
            >
              <Target className="h-4 w-4" />
              Medium
            </TabsTrigger>
            <TabsTrigger
              value="hard"
              className="flex items-center gap-2 text-red-600"
            >
              <Crown className="h-4 w-4" />
              Hard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Overall Champions
              </h3>
              <p className="text-gray-600 text-sm">
                Top performers across all difficulty levels
              </p>
            </div>
            <LeaderboardList
              scores={leaderboards.overall}
              showDifficulty={true}
            />
          </TabsContent>

          <TabsContent value="easy">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Easy Mode Champions
              </h3>
              <p className="text-gray-600 text-sm">
                Masters of quick thinking and efficient paths
              </p>
            </div>
            <LeaderboardList scores={leaderboards.easy} />
          </TabsContent>

          <TabsContent value="medium">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-600" />
                Medium Mode Champions
              </h3>
              <p className="text-gray-600 text-sm">
                Balanced challengers with strategic thinking
              </p>
            </div>
            <LeaderboardList scores={leaderboards.medium} />
          </TabsContent>

          <TabsContent value="hard">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-red-600" />
                Hard Mode Champions
              </h3>
              <p className="text-gray-600 text-sm">
                Elite puzzle solvers who conquered the ultimate challenge
              </p>
            </div>
            <LeaderboardList scores={leaderboards.hard} />
          </TabsContent>
        </Tabs>

        {/* Your Best Score Section */}
        {currentUserScore && (
          <div className="mt-6 pt-6 border-t border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Your Latest Achievement
            </h3>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {currentUserScore.score.toLocaleString()} Points
                    </div>
                    <div className="text-purple-100 text-sm">
                      {currentUserScore.difficulty} •{" "}
                      {formatTime(currentUserScore.time_taken)} •{" "}
                      {currentUserScore.maze_size}×{currentUserScore.maze_size}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-100 text-sm">Completed</div>
                  <div className="text-white font-semibold">
                    {new Date(
                      currentUserScore.completed_at,
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
