import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  Crown,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  getMergedLeaderboard,
  getWeeklyRankingStats,
  WordSearchScoreRecord,
} from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useTheme } from "@/contexts/ThemeContext";

interface EnhancedLeaderboardProps {
  onBack: () => void;
}

type LeaderboardTab = "weekly" | "all-time";

export const EnhancedLeaderboard: React.FC<EnhancedLeaderboardProps> = ({
  onBack,
}) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("weekly");
  const [allTimeScores, setAllTimeScores] = useState<WordSearchScoreRecord[]>(
    [],
  );
  const [weeklyScores, setWeeklyScores] = useState<WordSearchScoreRecord[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboards = useCallback(async () => {
    try {
      const [mergedResult, statsResult] = await Promise.all([
        getMergedLeaderboard(20),
        getWeeklyRankingStats(),
      ]);

      if (mergedResult.success) {
        setAllTimeScores(mergedResult.allTime || []);
        setWeeklyScores(mergedResult.weekly || []);
      } else {
        console.error("Failed to fetch leaderboards:", mergedResult.error);
      }

      if (statsResult.success) {
        setWeeklyStats(statsResult.stats);
      }
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboards();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">#{rank}</span>
          </div>
        );
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg`;
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300";
      default:
        return "bg-card border-border hover:bg-muted/50";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "expert":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderLeaderboard = (
    scores: WordSearchScoreRecord[],
    isWeekly: boolean = false,
  ) => {
    if (scores.length === 0) {
      return (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Scores Yet
              </h3>
              <p className="text-muted-foreground">
                {isWeekly
                  ? "Be the first to score this week!"
                  : "Be the first to set a record!"}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-2">
        {scores.map((score, index) => {
          const rank = index + 1;
          const accuracy =
            score.total_words > 0
              ? Math.round((score.words_found / score.total_words) * 100)
              : 0;

          return (
            <Card
              key={`${isWeekly ? "weekly" : "alltime"}-${score.id}`}
              className={`${getRankClass(rank)} transition-all duration-200 hover:shadow-md border`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">{getRankIcon(rank)}</div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-bold text-lg truncate ${rank === 1 ? "text-white" : "text-foreground"}`}
                      >
                        {score.username}
                      </h3>
                      {rank <= 3 && rank !== 1 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      {isWeekly && (
                        <Badge variant="secondary" className="text-xs">
                          This Week
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge className={getDifficultyColor(score.difficulty)}>
                        {score.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          rank === 1 ? "border-white/30 text-white/80" : ""
                        }
                      >
                        Level {(score as any).level || 1}
                      </Badge>
                      <span
                        className={`${rank === 1 ? "text-white/60" : "text-muted-foreground"}`}
                      >
                        {formatDate(score.completed_at)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        rank === 1 ? "text-white" : "text-primary"
                      }`}
                    >
                      {score.score.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs space-y-1 ${
                        rank === 1 ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      <div>
                        {score.words_found}/{score.total_words} ({accuracy}
                        %)
                      </div>
                      <div>
                        {Math.floor(Math.floor(score.time_taken) / 60)}:
                        {(Math.floor(score.time_taken) % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <MobileContainer>
      <div className="space-y-4">
        {/* Header */}
        <Card
          className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div className="text-center">
              <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6" />
                Rankings
              </CardTitle>
              <p className="text-white/80">Weekly & All-Time Champions</p>
              {weeklyStats && (
                <div className="mt-2 text-sm text-white/70">
                  Current Week: {weeklyStats.currentWeek} •{" "}
                  {weeklyStats.totalPlayers} Players Active
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Stats Card */}
        {weeklyStats && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-800">Weekly Stats</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Rankings reset every Monday at midnight
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {weeklyStats.totalPlayers}
                  </div>
                  <div className="text-xs text-blue-700">Active Players</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {weeklyStats.gamesThisWeek}
                  </div>
                  <div className="text-xs text-green-700">Games Played</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {weeklyStats.topScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-700">Top Score</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {weeklyStats.averageScore.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-700">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading rankings...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as LeaderboardTab)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Week
              </TabsTrigger>
              <TabsTrigger value="all-time" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                All-Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="mt-4">
              {renderLeaderboard(weeklyScores, true)}
            </TabsContent>

            <TabsContent value="all-time" className="mt-4">
              {renderLeaderboard(allTimeScores, false)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileContainer>
  );
};
