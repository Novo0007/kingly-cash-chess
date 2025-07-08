import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Coins,
  Target,
  TrendingUp,
  RefreshCw,
  User,
  Calendar,
  Zap,
  Brain,
  Award,
  Users,
} from "lucide-react";
import {
  getTopPlayersByScore,
  getTopPlayersByCoinsWon,
  getUserLeaderboardStats,
} from "@/utils/scrabbleDbHelper";
import { toast } from "sonner";

interface ScrabbleLeaderboardProps {
  currentUserId?: string;
  onRefresh?: () => void;
}

export const ScrabbleLeaderboard: React.FC<ScrabbleLeaderboardProps> = ({
  currentUserId,
  onRefresh,
}) => {
  const [topPlayersByScore, setTopPlayersByScore] = useState<any[]>([]);
  const [topPlayersByCoins, setTopPlayersByCoins] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboardData();
  }, [currentUserId]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      // Load top players by score
      const scoreResult = await getTopPlayersByScore();
      if (scoreResult.success && scoreResult.players) {
        setTopPlayersByScore(scoreResult.players);
      }

      // Load top players by coins won
      const coinsResult = await getTopPlayersByCoinsWon();
      if (coinsResult.success && coinsResult.players) {
        setTopPlayersByCoins(coinsResult.players);
      }

      // Load current user stats if provided
      if (currentUserId) {
        const statsResult = await getUserLeaderboardStats(currentUserId);
        if (statsResult.success && statsResult.stats) {
          setUserStats(statsResult.stats);
        }
      }
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
    onRefresh?.();
    toast.success("Leaderboard refreshed!");
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

  const getRankBadgeColor = (position: number) => {
    switch (position) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-8 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Scrabble Leaderboard
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              🏆 Top word masters and coin champions
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Leaderboard
        </Button>
      </div>

      {/* User Stats */}
      {userStats && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-blue-600" />
              Your Stats & Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.highestScore}
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
                <div className="text-xs text-blue-500">
                  Rank #{userStats.scoreRank || "Unranked"}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userStats.totalCoinsWon}
                </div>
                <div className="text-sm text-gray-600">Coins Won</div>
                <div className="text-xs text-green-500">
                  Rank #{userStats.coinsRank || "Unranked"}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.winRate}%
                </div>
                <div className="text-sm text-gray-600">Win Rate</div>
                <div className="text-xs text-purple-500">
                  {userStats.totalWins}/{userStats.totalGames}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.averageScore}
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
                <div className="text-xs text-orange-500">
                  {userStats.totalGames} games
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scores">Top 10 Highest Scores</TabsTrigger>
          <TabsTrigger value="coins">Top 3 Coin Winners</TabsTrigger>
        </TabsList>

        {/* Top 10 Highest Scores */}
        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-600" />
                Top 10 Highest Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPlayersByScore.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    No scores yet. Be the first to play!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayersByScore.map((player, index) => (
                    <div
                      key={`${player.user_id}-${index}`}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        index < 3
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                          : "bg-gray-50 border-gray-200"
                      } ${
                        player.user_id === currentUserId
                          ? "ring-2 ring-blue-400"
                          : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-800 truncate">
                            {player.username}
                          </span>
                          {player.user_id === currentUserId && (
                            <Badge className="bg-blue-100 text-blue-800">
                              You
                            </Badge>
                          )}
                          <Badge className={getRankBadgeColor(index + 1)}>
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(player.created_at)}
                          </span>
                          {player.is_winner && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Crown className="h-3 w-3" />
                              Winner
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {player.score}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top 3 Coin Winners */}
        <TabsContent value="coins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-600" />
                Top 3 Coin Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPlayersByCoins.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    No coin winners yet. Start playing to earn your first coins!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topPlayersByCoins.map((player, index) => {
                    const position = index + 1;
                    return (
                      <div
                        key={`${player.user_id}-coins`}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                          position === 1
                            ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400"
                            : position === 2
                              ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400"
                              : "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400"
                        } ${
                          player.user_id === currentUserId
                            ? "ring-4 ring-blue-400"
                            : ""
                        }`}
                      >
                        {/* Crown for first place */}
                        {position === 1 && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-yellow-500 text-white p-2 rounded-full">
                              <Crown className="h-6 w-6" />
                            </div>
                          </div>
                        )}

                        <div className="text-center space-y-4">
                          {/* Rank */}
                          <div className="flex justify-center">
                            {getRankIcon(position)}
                          </div>

                          {/* User Info */}
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {player.username}
                            </h3>
                            {player.user_id === currentUserId && (
                              <Badge className="bg-blue-100 text-blue-800">
                                You
                              </Badge>
                            )}
                          </div>

                          {/* Coins Won */}
                          <div>
                            <div className="text-3xl font-black text-yellow-600 mb-1">
                              {player.total_coins_won.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Total Coins Won
                            </div>
                          </div>

                          {/* Achievement Badge */}
                          <div className="pt-2">
                            <Badge
                              className={`${
                                position === 1
                                  ? "bg-yellow-500 text-white"
                                  : position === 2
                                    ? "bg-gray-400 text-white"
                                    : "bg-amber-500 text-white"
                              } px-3 py-1`}
                            >
                              <Award className="h-3 w-3 mr-1" />
                              {position === 1
                                ? "Coin Master"
                                : position === 2
                                  ? "Silver Collector"
                                  : "Bronze Winner"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            Leaderboard Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {topPlayersByScore.length}
              </div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {topPlayersByScore.length > 0
                  ? Math.max(
                      ...topPlayersByScore.map((p) => p.score),
                    ).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">
                {topPlayersByCoins.length > 0
                  ? Math.max(
                      ...topPlayersByCoins.map((p) => p.total_coins_won),
                    ).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Most Coins Won</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {topPlayersByScore.length > 0
                  ? Math.round(
                      topPlayersByScore.reduce((sum, p) => sum + p.score, 0) /
                        topPlayersByScore.length,
                    ).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      {topPlayersByScore.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Ready to climb the leaderboard?
            </h3>
            <p className="text-green-700 mb-4">
              Join the competition and show off your word-building skills! Earn
              coins and claim your spot among the top players.
            </p>
            <div className="flex justify-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                🎯 Compete for top scores
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                💰 Win real coins
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                🏆 Earn achievements
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
