
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
=======
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {

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

  Timer,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HangmanScore {
  id: string;
  user_id: string;
  username: string;
  level_number: number;
  word: string;
  category: string;
  guessed_letters: string[];
  wrong_guesses: number;
  time_taken: number;
  points_earned: number;
  is_perfect: boolean;
  completed_at: string;
  created_at: string;
}

interface LeaderboardEntry {
  username: string;
  total_score: number;
  games_played: number;
  games_won: number;
  perfect_games: number;
  avg_score: number;
  best_score: number;
  win_rate: number;
}

interface HangmanLeaderboardProps {
  currentUserScore?: HangmanScore | null;
  onRefresh?: () => void;
}

export const HangmanLeaderboard: React.FC<HangmanLeaderboardProps> = ({
  currentUserScore,
  onRefresh,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentGames, setRecentGames] = useState<HangmanScore[]>([]);
  const [topScores, setTopScores] = useState<HangmanScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "recent" | "top">(
    "leaderboard",
  );

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Since we don't have the hangman_scores table yet, we'll create mock data
      // This will be replaced with actual database queries once the migration is created

      // Mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          username: "WordMaster",
          total_score: 2450,
          games_played: 50,
          games_won: 45,
          perfect_games: 12,
          avg_score: 49,
          best_score: 85,
          win_rate: 90,
        },
        {
          username: "HangmanPro",
          total_score: 2200,
          games_played: 45,
          games_won: 38,
          perfect_games: 8,
          avg_score: 49,
          best_score: 92,
          win_rate: 84,
        },
        {
          username: "LetterGuess",
          total_score: 1980,
          games_played: 42,
          games_won: 35,
          perfect_games: 15,
          avg_score: 47,
          best_score: 78,
          win_rate: 83,
        },
        {
          username: "WordWizard",
          total_score: 1850,
          games_played: 40,
          games_won: 32,
          perfect_games: 6,
          avg_score: 46,
          best_score: 88,
          win_rate: 80,
        },
        {
          username: "AlphabetAce",
          total_score: 1720,
          games_played: 38,
          games_won: 29,
          perfect_games: 9,
          avg_score: 45,
          best_score: 82,
          win_rate: 76,
        },
      ];

      // Mock recent games
      const mockRecentGames: HangmanScore[] = [
        {
          id: "1",
          user_id: "user1",
          username: "WordMaster",
          level_number: 1,
          word: "ELEPHANT",
          category: "animals",
          guessed_letters: ["E", "L", "P", "H", "A", "N", "T"],
          wrong_guesses: 0,
          time_taken: 45,
          points_earned: 85,
          is_perfect: true,
          completed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: "2",
          user_id: "user2",
          username: "HangmanPro",
          level_number: 1,
          word: "BASKETBALL",
          category: "sports",
          guessed_letters: ["B", "A", "S", "K", "E", "T", "L"],
          wrong_guesses: 2,
          time_taken: 67,
          points_earned: 72,
          is_perfect: false,
          completed_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        },
        {
          id: "3",
          user_id: "user3",
          username: "LetterGuess",
          level_number: 1,
          word: "TURQUOISE",
          category: "colors",
          guessed_letters: ["T", "U", "R", "Q", "O", "I", "S", "E"],
          wrong_guesses: 1,
          time_taken: 82,
          points_earned: 68,
          is_perfect: false,
          completed_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        },
      ];

      // Mock top scores (best individual games)
      const mockTopScores: HangmanScore[] = [
        {
          id: "top1",
          user_id: "user2",
          username: "HangmanPro",
          level_number: 1,
          word: "SWITZERLAND",
          category: "countries",
          guessed_letters: [
            "S",
            "W",
            "I",
            "T",
            "Z",
            "E",
            "R",
            "L",
            "A",
            "N",
            "D",
          ],
          wrong_guesses: 0,
          time_taken: 42,
          points_earned: 92,
          is_perfect: true,
          completed_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
          id: "top2",
          user_id: "user4",
          username: "WordWizard",
          level_number: 1,
          word: "PINEAPPLE",
          category: "fruits",
          guessed_letters: ["P", "I", "N", "E", "A", "L"],
          wrong_guesses: 0,
          time_taken: 38,
          points_earned: 88,
          is_perfect: true,
          completed_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
        {
          id: "top3",
          user_id: "user1",
          username: "WordMaster",
          level_number: 1,
          word: "ELEPHANT",
          category: "animals",
          guessed_letters: ["E", "L", "P", "H", "A", "N", "T"],
          wrong_guesses: 0,
          time_taken: 45,
          points_earned: 85,
          is_perfect: true,
          completed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
      ];

      setLeaderboard(mockLeaderboard);
      setRecentGames(mockRecentGames);
      setTopScores(mockTopScores);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      toast.error("Failed to load leaderboard data");
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;

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

        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-500 text-white";

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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading leaderboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold mb-2">Hangman Leaderboard</h1>
          <p className="text-blue-100 text-lg">
            Top players and recent achievements
          </p>
          <Button
            onClick={fetchLeaderboardData}
            variant="outline"
            className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Current User Score */}
      {currentUserScore && (
        <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Your Latest Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentUserScore.points_earned}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentUserScore.word}
                </div>
                <div className="text-sm text-gray-600">Word</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(currentUserScore.time_taken)}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentUserScore.wrong_guesses}
                </div>
                <div className="text-sm text-gray-600">Wrong Guesses</div>
              </div>
            </div>
            {currentUserScore.is_perfect && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-bold">
                    Perfect Game!
                  </span>
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab("leaderboard")}
              variant={activeTab === "leaderboard" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Top Players
            </Button>
            <Button
              onClick={() => setActiveTab("recent")}
              variant={activeTab === "recent" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Recent Games
            </Button>
            <Button
              onClick={() => setActiveTab("top")}
              variant={activeTab === "top" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              Best Scores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Top Players by Total Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`p-4 rounded-lg border ${getRankColor(index + 1)} ${
                    index < 3 ? "shadow-lg" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span
                          className={`text-2xl font-bold ${
                            index < 3 ? "text-white" : "text-gray-700"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            index < 3 ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {entry.username}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span
                            className={
                              index < 3 ? "text-white/90" : "text-gray-600"
                            }
                          >
                            {entry.games_played} games
                          </span>
                          <span
                            className={
                              index < 3 ? "text-white/90" : "text-gray-600"
                            }
                          >
                            {entry.win_rate}% win rate
                          </span>
                          <span
                            className={
                              index < 3 ? "text-white/90" : "text-gray-600"
                            }
                          >
                            {entry.perfect_games} perfect
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          index < 3 ? "text-white" : "text-blue-600"
                        }`}
                      >
                        {entry.total_score.toLocaleString()}
                      </div>
                      <div
                        className={`text-sm ${
                          index < 3 ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        avg: {entry.avg_score}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Games Tab */}
      {activeTab === "recent" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-800">
                        {game.username}
                      </div>
                      {game.is_perfect && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          Perfect
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(game.completed_at)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-blue-600">
                        {game.word}
                      </div>
                      <div className="text-xs text-gray-600">
                        Word ({game.category})
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">
                        {game.points_earned}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-600">
                        {formatTime(game.time_taken)}
                      </div>
                      <div className="text-xs text-gray-600">Time</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-600">
                        {game.wrong_guesses}
                      </div>
                      <div className="text-xs text-gray-600">Wrong</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-600">
                        {game.guessed_letters.length}
                      </div>
                      <div className="text-xs text-gray-600">Letters</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Scores Tab */}
      {activeTab === "top" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Highest Individual Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topScores.map((score, index) => (
                <div
                  key={score.id}
                  className={`p-4 rounded-lg border ${getRankColor(index + 1)} ${
                    index < 3 ? "shadow-lg" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span
                          className={`text-xl font-bold ${
                            index < 3 ? "text-white" : "text-gray-700"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            index < 3 ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {score.username}
                        </h3>
                        <div
                          className={`text-sm ${
                            index < 3 ? "text-white/90" : "text-gray-600"
                          }`}
                        >
                          {formatTimeAgo(score.completed_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${
                          index < 3 ? "text-white" : "text-blue-600"
                        }`}
                      >
                        {score.points_earned}
                      </div>
                      <div
                        className={`text-sm ${
                          index < 3 ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        points
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          index < 3 ? "text-white" : "text-purple-600"
                        }`}
                      >
                        {score.word}
                      </div>
                      <div
                        className={`text-xs ${
                          index < 3 ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        Word ({score.category})
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          index < 3 ? "text-white" : "text-green-600"
                        }`}
                      >
                        {formatTime(score.time_taken)}
                      </div>
                      <div
                        className={`text-xs ${
                          index < 3 ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        Time
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          index < 3 ? "text-white" : "text-orange-600"
                        }`}
                      >
                        {score.wrong_guesses}
                      </div>
                      <div
                        className={`text-xs ${
                          index < 3 ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        Wrong
                      </div>
                    </div>
                  </div>

                  {score.is_perfect && (
                    <div className="mt-3 text-center">
                      <Badge
                        className={`${
                          index < 3
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }`}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Perfect Game
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {leaderboard.reduce(
                  (sum, entry) => sum + entry.games_played,
                  0,
                )}
              </div>
              <div className="text-sm text-blue-700">Total Games</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leaderboard.reduce(
                  (sum, entry) => sum + entry.perfect_games,
                  0,
                )}
              </div>
              <div className="text-sm text-green-700">Perfect Games</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  leaderboard.reduce((sum, entry) => sum + entry.win_rate, 0) /
                    leaderboard.length,
                )}
                %
              </div>
              <div className="text-sm text-purple-700">Avg Win Rate</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(...topScores.map((score) => score.points_earned))}
              </div>
              <div className="text-sm text-yellow-700">Highest Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
