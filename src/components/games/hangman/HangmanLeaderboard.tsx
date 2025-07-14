import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Crown,
  Star,
  Medal,
  Target,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HangmanScore } from "./HangmanGameLogic";
import { useDeviceType } from "@/hooks/use-mobile";

interface HangmanLeaderboardProps {
  onBack: () => void;
  currentUser?: any;
}

export const HangmanLeaderboard: React.FC<HangmanLeaderboardProps> = ({
  onBack,
  currentUser,
}) => {
  const { isMobile } = useDeviceType();
  const [scores, setScores] = useState<HangmanScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("hangman_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(100);

      // Add time filter
      if (timeFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("created_at", today.toISOString());
      } else if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      setScores(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStats = () => {
    if (scores.length === 0)
      return { totalPlayers: 0, avgScore: 0, topScore: 0 };

    return {
      totalPlayers: scores.length,
      avgScore: Math.round(
        scores.reduce((sum, score) => sum + score.score, 0) / scores.length,
      ),
      topScore: scores[0]?.score || 0,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 border-0 text-white">
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
                🏆 Hangman Champions
              </CardTitle>
              <p className="text-white/90 mt-2">
                See who's mastered the word game
              </p>
            </div>
            <div className="w-10"></div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Total Players</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalPlayers}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Average Score
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats.avgScore}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Top Score</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.topScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Filter */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Filter Rankings</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setTimeFilter("all")}
                variant={timeFilter === "all" ? "default" : "outline"}
                size="sm"
                className={timeFilter === "all" ? "bg-blue-600 text-white" : ""}
              >
                All Time
              </Button>
              <Button
                onClick={() => setTimeFilter("week")}
                variant={timeFilter === "week" ? "default" : "outline"}
                size="sm"
                className={
                  timeFilter === "week" ? "bg-blue-600 text-white" : ""
                }
              >
                This Week
              </Button>
              <Button
                onClick={() => setTimeFilter("today")}
                variant={timeFilter === "today" ? "default" : "outline"}
                size="sm"
                className={
                  timeFilter === "today" ? "bg-blue-600 text-white" : ""
                }
              >
                Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading leaderboard...</div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Scores Yet
              </h3>
              <p className="text-gray-600">Be the first to set a high score!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 - Special Design */}
              {scores.slice(0, 3).map((score, index) => {
                const rank = index + 1;
                const isCurrentUser =
                  currentUser && score.user_id === currentUser.id;

                return (
                  <Card
                    key={score.id}
                    className={`${getRankBadgeColor(rank)} border-2 ${
                      isCurrentUser ? "ring-2 ring-blue-400" : ""
                    } transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-lg ${rank <= 3 ? "text-white" : "text-gray-800"}`}
                              >
                                {score.username}
                              </span>
                              {isCurrentUser && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span
                                className={`flex items-center gap-1 ${rank <= 3 ? "text-white/90" : "text-gray-600"}`}
                              >
                                <Target className="h-3 w-3" />
                                Level {score.level}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${rank <= 3 ? "text-white/90" : "text-gray-600"}`}
                              >
                                <Zap className="h-3 w-3" />
                                {score.words_solved} words
                              </span>
                              <span
                                className={`flex items-center gap-1 ${rank <= 3 ? "text-white/90" : "text-gray-600"}`}
                              >
                                <Clock className="h-3 w-3" />
                                {formatTime(score.time_taken)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${rank <= 3 ? "text-white" : "text-gray-800"}`}
                          >
                            {score.score}
                          </div>
                          <div
                            className={`text-sm ${rank <= 3 ? "text-white/90" : "text-gray-600"}`}
                          >
                            points
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Rest of the rankings */}
              {scores.slice(3).map((score, index) => {
                const rank = index + 4;
                const isCurrentUser =
                  currentUser && score.user_id === currentUser.id;

                return (
                  <Card
                    key={score.id}
                    className={`bg-gray-50 border-gray-200 ${
                      isCurrentUser ? "ring-2 ring-blue-400 bg-blue-50" : ""
                    } transition-all duration-300 hover:bg-gray-100`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                            <span className="text-sm font-bold text-gray-600">
                              #{rank}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {score.username}
                              </span>
                              {isCurrentUser && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Lvl {score.level}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {score.words_solved}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(score.time_taken)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">
                            {score.score}
                          </div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-3 px-8 text-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Lobby
        </Button>
      </div>
    </div>
  );
};
