import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  Crown,
  RefreshCw,
  TrendingUp,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useTheme } from "@/contexts/ThemeContext";
import type { User } from "@supabase/supabase-js";

interface PlayerRanking {
  user_id: string;
  username: string;
  total_score: number;
  games_played: number;
  avg_score: number;
  best_score: number;
  chess_score: number;
  ludo_score: number;
  maze_score: number;
  game2048_score: number;
  math_score: number;
  wordsearch_score: number;
  last_played: string;
}

interface GlobalRankingsProps {
  user: User;
}

type RankingTab =
  | "overall"
  | "chess"
  | "ludo"
  | "maze"
  | "2048"
  | "math"
  | "wordsearch";

export const GlobalRankings: React.FC<GlobalRankingsProps> = ({ user }) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<RankingTab>("overall");
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchGlobalRankings = useCallback(async () => {
    try {
      setLoading(true);

      // Get all scores from different game tables and aggregate
      const [
        chessScores,
        ludoScores,
        mazeScores,
        game2048Scores,
        mathScores,
        wordsearchScores,
      ] = await Promise.all([
        supabase.from("chess_games").select("white_player_id, black_player_id, winner_id, prize_amount"),
        supabase.from("ludo_games").select("player1_id, player2_id, player3_id, player4_id, winner_id, prize_amount"),
        supabase.from("maze_scores").select("user_id, score"),
        supabase.from("game2048_scores").select("user_id, score"),
        supabase.from("math_scores").select("user_id, score"),
        supabase
          .from("word_search_scores")
          .select("user_id, score, completed_at"),
      ]);

      // Get user profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username");

      const profileMap = new Map(
        profiles?.map((p) => [p.id, p.username]) || [],
      );

      // Aggregate scores by user
      const userScores = new Map<
        string,
        {
          chess: number;
          ludo: number;
          maze: number;
          game2048: number;
          math: number;
          wordsearch: number;
          games_played: number;
          last_played: string;
        }
      >();

      // Process chess scores
      chessScores.data?.forEach((game) => {
        // Add scores for both players who participated
        [game.white_player_id, game.black_player_id].forEach((playerId) => {
          if (!playerId) return;

          const current = userScores.get(playerId) || {
            chess: 0,
            ludo: 0,
            maze: 0,
            game2048: 0,
            math: 0,
            wordsearch: 0,
            games_played: 0,
            last_played: new Date().toISOString(),
          };

          // Winner gets the full prize, loser gets participation points
          const isWinner = playerId === game.winner_id;
          current.chess += isWinner ? (game.prize_amount || 0) : Math.floor((game.prize_amount || 0) * 0.1);
          current.games_played += 1;
          userScores.set(playerId, current);
        });
      });

      // Process ludo scores
      ludoScores.data?.forEach((game) => {
        // Add scores for all players who participated
        [game.player1_id, game.player2_id, game.player3_id, game.player4_id].forEach((playerId) => {
          if (!playerId) return;

          const current = userScores.get(playerId) || {
            chess: 0,
            ludo: 0,
            maze: 0,
            game2048: 0,
            math: 0,
            wordsearch: 0,
            games_played: 0,
            last_played: new Date().toISOString(),
          };

          // Winner gets the full prize, others get participation points
          const isWinner = playerId === game.winner_id;
          current.ludo += isWinner ? (game.prize_amount || 0) : Math.floor((game.prize_amount || 0) * 0.1);
          current.games_played += 1;
          userScores.set(playerId, current);
        });
      });

      // Process maze scores
      mazeScores.data?.forEach((score) => {
        if (!score.user_id) return;

        const current = userScores.get(score.user_id) || {
          chess: 0,
          ludo: 0,
          maze: 0,
          game2048: 0,
          math: 0,
          wordsearch: 0,
          games_played: 0,
          last_played: new Date().toISOString(),
        };

        current.maze = Math.max(current.maze, score.score || 0);
        current.games_played += 1;
        userScores.set(score.user_id, current);
      });

      // Process 2048 scores
      game2048Scores.data?.forEach((score) => {
        if (!score.user_id) return;

        const current = userScores.get(score.user_id) || {
          chess: 0,
          ludo: 0,
          maze: 0,
          game2048: 0,
          math: 0,
          wordsearch: 0,
          games_played: 0,
          last_played: new Date().toISOString(),
        };

        current.game2048 = Math.max(current.game2048, score.score || 0);
        current.games_played += 1;
        userScores.set(score.user_id, current);
      });

      // Process math scores
      mathScores.data?.forEach((score) => {
        if (!score.user_id) return;

        const current = userScores.get(score.user_id) || {
          chess: 0,
          ludo: 0,
          maze: 0,
          game2048: 0,
          math: 0,
          wordsearch: 0,
          games_played: 0,
          last_played: new Date().toISOString(),
        };

        current.math = Math.max(current.math, score.score || 0);
        current.games_played += 1;
        userScores.set(score.user_id, current);
      });

      // Process wordsearch scores
      wordsearchScores.data?.forEach((score) => {
        if (!score.user_id) return;

        const current = userScores.get(score.user_id) || {
          chess: 0,
          ludo: 0,
          maze: 0,
          game2048: 0,
          math: 0,
          wordsearch: 0,
          games_played: 0,
          last_played: new Date().toISOString(),
        };

        current.wordsearch = Math.max(current.wordsearch, score.score || 0);
        current.games_played += 1;
        if (score.completed_at) {
          current.last_played = score.completed_at;
        }
        userScores.set(score.user_id, current);
      });

      // Convert to ranking format
      const playerRankings: PlayerRanking[] = Array.from(userScores.entries())
        .map(([userId, scores]) => {
          const total_score =
            scores.chess +
            scores.ludo +
            scores.maze +
            scores.game2048 +
            scores.math +
            scores.wordsearch;
          const best_score = Math.max(
            scores.chess,
            scores.ludo,
            scores.maze,
            scores.game2048,
            scores.math,
            scores.wordsearch,
          );

          return {
            user_id: userId,
            username: profileMap.get(userId) || "Anonymous",
            total_score,
            games_played: scores.games_played,
            avg_score:
              scores.games_played > 0
                ? Math.round(total_score / scores.games_played)
                : 0,
            best_score,
            chess_score: scores.chess,
            ludo_score: scores.ludo,
            maze_score: scores.maze,
            game2048_score: scores.game2048,
            math_score: scores.math,
            wordsearch_score: scores.wordsearch,
            last_played: scores.last_played,
          };
        })
        .filter((player) => player.total_score > 0)
        .sort((a, b) => b.total_score - a.total_score);

      setRankings(playerRankings);

      // Find user's rank
      const userRankIndex = playerRankings.findIndex(
        (p) => p.user_id === user.id,
      );
      setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchGlobalRankings();
  }, [fetchGlobalRankings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGlobalRankings();
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

  const getRankClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return `bg-gradient-to-r ${currentTheme.gradients.accent} text-white shadow-lg border-2 border-primary`;
    }

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

  const getFilteredRankings = () => {
    if (activeTab === "overall") return rankings;

    return [...rankings]
      .sort((a, b) => {
        switch (activeTab) {
          case "chess":
            return b.chess_score - a.chess_score;
          case "ludo":
            return b.ludo_score - a.ludo_score;
          case "maze":
            return b.maze_score - a.maze_score;
          case "2048":
            return b.game2048_score - a.game2048_score;
          case "math":
            return b.math_score - a.math_score;
          case "wordsearch":
            return b.wordsearch_score - a.wordsearch_score;
          default:
            return 0;
        }
      })
      .filter((player) => {
        switch (activeTab) {
          case "chess":
            return player.chess_score > 0;
          case "ludo":
            return player.ludo_score > 0;
          case "maze":
            return player.maze_score > 0;
          case "2048":
            return player.game2048_score > 0;
          case "math":
            return player.math_score > 0;
          case "wordsearch":
            return player.wordsearch_score > 0;
          default:
            return true;
        }
      })
      .slice(0, 50);
  };

  const getScoreForTab = (player: PlayerRanking) => {
    switch (activeTab) {
      case "chess":
        return player.chess_score;
      case "ludo":
        return player.ludo_score;
      case "maze":
        return player.maze_score;
      case "2048":
        return player.game2048_score;
      case "math":
        return player.math_score;
      case "wordsearch":
        return player.wordsearch_score;
      default:
        return player.total_score;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredRankings = getFilteredRankings();

  return (
    <MobileContainer>
      <div className="space-y-4">
        {/* Header */}
        <Card
          className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                <CardTitle className="text-xl">Global Rankings</CardTitle>
              </div>

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

            {userRank && (
              <div className="text-center bg-white/10 rounded-lg p-3 mt-2">
                <p className="text-white/80 text-sm">Your Global Rank</p>
                <p className="text-2xl font-bold text-white">#{userRank}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Game Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as RankingTab)}
        >
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="overall" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="chess" className="text-xs">
              ♟️
            </TabsTrigger>
            <TabsTrigger value="ludo" className="text-xs">
              🎲
            </TabsTrigger>
            <TabsTrigger value="maze" className="text-xs">
              🌀
            </TabsTrigger>
            <TabsTrigger value="2048" className="text-xs">
              🔢
            </TabsTrigger>
            <TabsTrigger value="math" className="text-xs">
              ➕
            </TabsTrigger>
            <TabsTrigger value="wordsearch" className="text-xs">
              🔤
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading rankings...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredRankings.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Rankings Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Be the first to play and set a score!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredRankings.map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser = player.user_id === user.id;
                  const score = getScoreForTab(player);

                  return (
                    <Card
                      key={player.user_id}
                      className={`${getRankClass(rank, isCurrentUser)} transition-all duration-200 hover:shadow-md border`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            {getRankIcon(rank)}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-bold text-lg truncate ${
                                  rank === 1 || isCurrentUser
                                    ? "text-white"
                                    : "text-foreground"
                                }`}
                              >
                                {player.username}
                                {isCurrentUser && " (You)"}
                              </h3>
                              {rank <= 3 && !isCurrentUser && rank !== 1 && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                              {isCurrentUser && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className={
                                  rank === 1 || isCurrentUser
                                    ? "border-white/30 text-white/80"
                                    : ""
                                }
                              >
                                {player.games_played} games
                              </Badge>
                              <span
                                className={`${
                                  rank === 1 || isCurrentUser
                                    ? "text-white/60"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Avg: {player.avg_score.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold mb-1 ${
                                rank === 1 || isCurrentUser
                                  ? "text-white"
                                  : "text-primary"
                              }`}
                            >
                              {score.toLocaleString()}
                            </div>
                            {activeTab === "overall" && (
                              <div
                                className={`text-xs ${
                                  rank === 1 || isCurrentUser
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Best: {player.best_score.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        {filteredRankings.length > 0 && (
          <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-primary/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">
                    {filteredRankings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Players</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {Math.max(
                      ...filteredRankings.map((p) => getScoreForTab(p)),
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Top Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">
                    {Math.round(
                      filteredRankings.reduce(
                        (sum, p) => sum + p.avg_score,
                        0,
                      ) / filteredRankings.length,
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileContainer>
  );
};
