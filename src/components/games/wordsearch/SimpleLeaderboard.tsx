import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Star, Crown, RefreshCw } from "lucide-react";
import {
  getWordSearchLeaderboard,
  WordSearchScoreRecord,
} from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useTheme } from "@/contexts/ThemeContext";

interface SimpleLeaderboardProps {
  onBack: () => void;
}

export const SimpleLeaderboard: React.FC<SimpleLeaderboardProps> = ({
  onBack,
}) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [scores, setScores] = useState<WordSearchScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHighScores = useCallback(async () => {
    try {
      const result = await getWordSearchLeaderboard(undefined, undefined, 50);
      if (result.success && result.scores) {
        // Sort by score descending and take top scores
        const sortedScores = result.scores
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);
        setScores(sortedScores);
      } else {
        console.error("Failed to fetch leaderboard:", result.error);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHighScores();
  }, [fetchHighScores]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHighScores();
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
                High Scores
              </CardTitle>
              <p className="text-white/80">Top Word Search Players</p>
            </div>
          </CardHeader>
        </Card>

        {/* High Scores List */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading high scores...</p>
              </div>
            </CardContent>
          </Card>
        ) : scores.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Scores Yet
                </h3>
                <p className="text-muted-foreground">
                  Be the first to set a high score!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {scores.map((score, index) => {
              const rank = index + 1;
              const accuracy =
                score.total_words > 0
                  ? Math.round((score.words_found / score.total_words) * 100)
                  : 0;

              return (
                <Card
                  key={score.id}
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
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge
                            className={getDifficultyColor(score.difficulty)}
                          >
                            {score.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              rank === 1 ? "border-white/30 text-white/80" : ""
                            }
                          >
                            Level {score.level || 1}
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
                            rank === 1
                              ? "text-white/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div>
                            {score.words_found}/{score.total_words} ({accuracy}
                            %)
                          </div>
                          <div>
                            {Math.floor(score.time_taken / 60)}:
                            {(score.time_taken % 60)
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
        )}

        {/* Summary Stats */}
        {scores.length > 0 && (
          <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-primary/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">
                    {scores.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Players</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {Math.max(...scores.map((s) => s.score)).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Best Score
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {Math.round(
                      scores.reduce(
                        (sum, s) =>
                          sum +
                          (s.total_words > 0
                            ? (s.words_found / s.total_words) * 100
                            : 0),
                        0,
                      ) / scores.length,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileContainer>
  );
};
