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
  Target,
  Clock,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  getWordSearchLeaderboard,
  WordSearchScoreRecord,
} from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface WordSearchLeaderboardProps {
  onBack: () => void;
}

type LeaderboardTab =
  | "overall"
  | "easy"
  | "medium"
  | "hard"
  | "solo"
  | "multiplayer";

export const WordSearchLeaderboard: React.FC<WordSearchLeaderboardProps> = ({
  onBack,
}) => {
  const { isMobile } = useDeviceType();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("overall");
  const [scores, setScores] = useState<WordSearchScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(
    async (
      difficulty?: "easy" | "medium" | "hard",
      gameMode?: "solo" | "multiplayer" | "practice",
    ) => {
      try {
        const result = await getWordSearchLeaderboard(
          difficulty,
          gameMode,
          100,
        );
        if (result.success && result.scores) {
          setScores(result.scores);
        } else {
          console.error("Failed to fetch leaderboard:", result.error);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    setLoading(true);

    switch (activeTab) {
      case "overall":
        fetchLeaderboard();
        break;
      case "easy":
        fetchLeaderboard("easy");
        break;
      case "medium":
        fetchLeaderboard("medium");
        break;
      case "hard":
        fetchLeaderboard("hard");
        break;
      case "solo":
        fetchLeaderboard(undefined, "solo");
        break;
      case "multiplayer":
        fetchLeaderboard(undefined, "multiplayer");
        break;
    }
  }, [activeTab, fetchLeaderboard]);

  const handleRefresh = () => {
    setRefreshing(true);

    switch (activeTab) {
      case "overall":
        fetchLeaderboard();
        break;
      case "easy":
        fetchLeaderboard("easy");
        break;
      case "medium":
        fetchLeaderboard("medium");
        break;
      case "hard":
        fetchLeaderboard("hard");
        break;
      case "solo":
        fetchLeaderboard(undefined, "solo");
        break;
      case "multiplayer":
        fetchLeaderboard(undefined, "multiplayer");
        break;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300";
      default:
        return "bg-white border-gray-200";
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

  const getGameModeIcon = (gameMode: string) => {
    switch (gameMode) {
      case "solo":
        return "🎯";
      case "multiplayer":
        return "👥";
      case "practice":
        return "📚";
      default:
        return "🎮";
    }
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds); // Ensure no decimals
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateAccuracy = (wordsFound: number, totalWords: number) => {
    return totalWords > 0 ? Math.round((wordsFound / totalWords) * 100) : 0;
  };

  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
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
              <CardTitle className="text-3xl mb-2 flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8" />
                Leaderboard
              </CardTitle>
              <p className="text-yellow-100">Top Word Search Players</p>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as LeaderboardTab)}
        >
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overall" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="easy" className="text-xs">
              Easy
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-xs">
              Medium
            </TabsTrigger>
            <TabsTrigger value="hard" className="text-xs">
              Hard
            </TabsTrigger>
            <TabsTrigger value="solo" className="text-xs">
              Solo
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="text-xs">
              Multi
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading leaderboard...</p>
                  </div>
                </CardContent>
              </Card>
            ) : scores.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Scores Yet
                    </h3>
                    <p className="text-gray-600">
                      Be the first to set a record in this category!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scores.map((score, index) => {
                  const rank = index + 1;
                  const accuracy = calculateAccuracy(
                    score.words_found,
                    score.total_words,
                  );

                  return (
                    <Card
                      key={score.id}
                      className={`${getRankClass(rank)} transition-all duration-200 hover:shadow-md`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-12 flex justify-center">
                            {getRankIcon(rank)}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg truncate">
                                {score.username}
                              </h3>
                              {rank <= 3 && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge
                                className={getDifficultyColor(score.difficulty)}
                              >
                                {score.difficulty}
                              </Badge>
                              <Badge variant="outline">
                                {getGameModeIcon(score.game_mode)}{" "}
                                {score.game_mode}
                              </Badge>
                              <span className="text-gray-500">
                                {formatDate(score.completed_at)}
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {score.score.toLocaleString()}
                            </div>

                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-1 justify-end">
                                <Target className="h-3 w-3" />
                                {score.words_found}/{score.total_words} (
                                {accuracy}%)
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                {formatTime(score.time_taken)}
                              </div>
                              {score.hints_used > 0 && (
                                <div className="flex items-center gap-1 justify-end">
                                  💡 {score.hints_used} hints
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Stats for Top 3 */}
                        {rank <= 3 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-center text-xs">
                              <div>
                                <div className="font-bold text-blue-600">
                                  {score.grid_size}x{score.grid_size}
                                </div>
                                <div className="text-gray-500">Grid Size</div>
                              </div>
                              <div>
                                <div className="font-bold text-purple-600">
                                  {score.coins_won > 0
                                    ? `+${score.coins_won}`
                                    : "—"}
                                </div>
                                <div className="text-gray-500">Coins Won</div>
                              </div>
                              <div>
                                <div className="font-bold text-orange-600">
                                  {Math.floor(
                                    (score.score / score.time_taken) * 60,
                                  )}
                                </div>
                                <div className="text-gray-500">Score/Min</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Statistics Summary */}
        {scores.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {scores.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Players</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...scores.map((s) => s.score)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Top Score</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      scores.reduce(
                        (sum, s) =>
                          sum + calculateAccuracy(s.words_found, s.total_words),
                        0,
                      ) / scores.length,
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Avg Accuracy</div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatTime(
                      Math.round(
                        scores.reduce((sum, s) => sum + s.time_taken, 0) /
                          scores.length,
                      ),
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileContainer>
  );
};
