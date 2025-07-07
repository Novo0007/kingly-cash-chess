import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Timer,
  Target,
  TrendingUp,
  RefreshCw,
  User,
  Calendar,
  Zap,
  Brain,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MathGameScore } from "./MathGameLogic";
import { toast } from "sonner";

interface MathLeaderboardProps {
  currentUserScore?: MathGameScore | null;
  onRefresh: () => void;
}

export const MathLeaderboard: React.FC<MathLeaderboardProps> = ({
  currentUserScore,
  onRefresh,
}) => {
  const [scores, setScores] = useState<MathGameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");
  const [selectedMode, setSelectedMode] = useState<
    "all" | "practice" | "timed" | "endless"
  >("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDifficulty, selectedMode]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("math_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(100);

      if (selectedDifficulty !== "all") {
        query = query.eq("difficulty", selectedDifficulty);
      }

      if (selectedMode !== "all") {
        query = query.eq("game_mode", selectedMode);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching math leaderboard:", error);
        toast.error("Failed to load leaderboard");
        return;
      }

      setScores(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard();
    onRefresh();
  };

  // Get highest score per player
  const getHighestScorePerPlayer = (allScores: MathGameScore[]) => {
    const playerBestScores = new Map<string, MathGameScore>();

    allScores.forEach((score) => {
      const existingBest = playerBestScores.get(score.username);
      if (!existingBest || score.score > existingBest.score) {
        playerBestScores.set(score.username, score);
      }
    });

    return Array.from(playerBestScores.values()).sort(
      (a, b) => b.score - a.score,
    );
  };

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {position}
          </div>
        );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "endless":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "timed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const calculateAccuracy = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const getTopScores = () => {
    const grouped = scores.reduce(
      (acc, score) => {
        const key = `${score.difficulty}-${score.game_mode}`;
        if (!acc[key] || acc[key].score < score.score) {
          acc[key] = score;
        }
        return acc;
      },
      {} as Record<string, MathGameScore>,
    );

    return Object.values(grouped)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Math Leaderboard
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              🏆 Top performers in Math: Brain Puzzles
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Leaderboard
        </Button>
      </div>

      {/* Current User Score */}
      {currentUserScore && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-blue-600" />
              Your Latest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentUserScore.score}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {calculateAccuracy(
                    currentUserScore.correct_answers,
                    currentUserScore.total_questions,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentUserScore.max_streak}
                </div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(currentUserScore.time_taken)}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">🔍 Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Difficulty
              </label>
              <Tabs
                value={selectedDifficulty}
                onValueChange={(value: any) => setSelectedDifficulty(value)}
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="easy">Easy</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="hard">Hard</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Game Mode
              </label>
              <Tabs
                value={selectedMode}
                onValueChange={(value: any) => setSelectedMode(value)}
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="timed">Timed</TabsTrigger>
                  <TabsTrigger value="endless">Endless</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Leaderboard */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Scores</TabsTrigger>
          <TabsTrigger value="top">Top Records</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Top 10 Players (Best Scores)
                {selectedDifficulty !== "all" || selectedMode !== "all" ? (
                  <Badge variant="outline" className="ml-2">
                    Filtered Results
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getHighestScorePerPlayer(scores).length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    No players found for the selected filters.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Be the first to set a record!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getHighestScorePerPlayer(scores)
                    .slice(0, 10)
                    .map((score, index) => (
                      <div
                        key={score.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                            : "bg-gray-50"
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(index + 1)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-800 truncate">
                              {score.username}
                            </span>
                            <Badge
                              className={getDifficultyColor(score.difficulty)}
                            >
                              {score.difficulty}
                            </Badge>
                            <Badge className={getModeColor(score.game_mode)}>
                              {score.game_mode}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(score.completed_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {formatTime(score.time_taken)}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {score.score}
                            </div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {calculateAccuracy(
                                score.correct_answers,
                                score.total_questions,
                              )}
                              %
                            </div>
                            <div className="text-xs text-gray-500">
                              Accuracy
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600">
                              {score.max_streak}
                            </div>
                            <div className="text-xs text-gray-500">Streak</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-600">
                              {score.correct_answers}/{score.total_questions}
                            </div>
                            <div className="text-xs text-gray-500">
                              Questions
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-600" />
                Top Records by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getTopScores().length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {getTopScores().map((score, index) => (
                    <div
                      key={score.id}
                      className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getRankIcon(index + 1)}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {score.username}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getDifficultyColor(score.difficulty)}
                            >
                              {score.difficulty}
                            </Badge>
                            <Badge className={getModeColor(score.game_mode)}>
                              {score.game_mode}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {score.score}
                          </div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="font-semibold text-green-600">
                            {calculateAccuracy(
                              score.correct_answers,
                              score.total_questions,
                            )}
                            %
                          </div>
                          <div className="text-gray-500">Accuracy</div>
                        </div>
                        <div>
                          <div className="font-semibold text-purple-600">
                            {score.max_streak}
                          </div>
                          <div className="text-gray-500">Streak</div>
                        </div>
                        <div>
                          <div className="font-semibold text-orange-600">
                            {formatTime(score.time_taken)}
                          </div>
                          <div className="text-gray-500">Time</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Leaderboard Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {getHighestScorePerPlayer(scores).length}
              </div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {getHighestScorePerPlayer(scores).length > 0
                  ? Math.max(
                      ...getHighestScorePerPlayer(scores).map((s) => s.score),
                    ).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {getHighestScorePerPlayer(scores).length > 0
                  ? Math.max(
                      ...getHighestScorePerPlayer(scores).map(
                        (s) => s.max_streak,
                      ),
                    )
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                {getHighestScorePerPlayer(scores).length > 0
                  ? Math.round(
                      getHighestScorePerPlayer(scores).reduce(
                        (acc, s) =>
                          acc +
                          calculateAccuracy(
                            s.correct_answers,
                            s.total_questions,
                          ),
                        0,
                      ) / getHighestScorePerPlayer(scores).length,
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Avg Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
