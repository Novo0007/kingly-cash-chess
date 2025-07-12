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
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useTheme } from "@/contexts/ThemeContext";
import { UserProfileDialog } from "@/components/friends/UserProfileDialog";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

interface PlayerRanking {
  user_id: string;
  username: string;
  highest_score: number;
  games_played: number;
  last_played: string;
  weekly_rank?: number;
  badge_type?: string;
}

interface GlobalRankingsProps {
  user: User;
}

type RankingTab = "weekly" | "all-time";

export const GlobalRankings: React.FC<GlobalRankingsProps> = ({ user }) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<RankingTab>("weekly");
  const [weeklyRankings, setWeeklyRankings] = useState<PlayerRanking[]>([]);
  const [allTimeRankings, setAllTimeRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Tables<'profiles'> | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);

      // Get weekly rankings with proper usernames
      const { data: weeklyData } = await supabase
        .from("word_search_scores")
        .select(`
          user_id, 
          username,
          score, 
          completed_at
        `)
        .gte("completed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("score", { ascending: false });

      // Get all-time rankings (highest score per player)
      const { data: allTimeData } = await supabase
        .from("word_search_scores")
        .select("user_id, username, score, completed_at")
        .order("score", { ascending: false });

      // Get badges for weekly rankings
      const { data: badges } = await supabase
        .from("weekly_ranking_badges")
        .select("user_id, badge_type, rank")
        .gte("week_start", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const badgeMap = new Map(badges?.map(b => [b.user_id, b]) || []);

      // Process weekly rankings (highest score per player)
      const weeklyPlayerMap = new Map<string, PlayerRanking>();
      weeklyData?.forEach((score) => {
        const existing = weeklyPlayerMap.get(score.user_id);
        if (!existing || score.score > existing.highest_score) {
          const badge = badgeMap.get(score.user_id);
          weeklyPlayerMap.set(score.user_id, {
            user_id: score.user_id,
            username: score.username,
            highest_score: score.score,
            games_played: 1,
            last_played: score.completed_at,
            badge_type: badge?.badge_type,
            weekly_rank: badge?.rank,
          });
        }
      });

      const weeklyRankings = Array.from(weeklyPlayerMap.values())
        .sort((a, b) => b.highest_score - a.highest_score);

      // Process all-time rankings (highest score per player)
      const allTimePlayerMap = new Map<string, PlayerRanking>();
      allTimeData?.forEach((score) => {
        const existing = allTimePlayerMap.get(score.user_id);
        if (!existing || score.score > existing.highest_score) {
          allTimePlayerMap.set(score.user_id, {
            user_id: score.user_id,
            username: score.username,
            highest_score: score.score,
            games_played: 1,
            last_played: score.completed_at,
          });
        }
      });

      const allTimeRankings = Array.from(allTimePlayerMap.values())
        .sort((a, b) => b.highest_score - a.highest_score);

      setWeeklyRankings(weeklyRankings);
      setAllTimeRankings(allTimeRankings);

      // Update weekly badges for top 3 players
      if (weeklyRankings.length >= 3) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const badgePromises = weeklyRankings.slice(0, 3).map((player, index) => {
          const badgeType = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
          return supabase
            .from("weekly_ranking_badges")
            .upsert({
              user_id: player.user_id,
              week_start: weekStartStr,
              rank: index + 1,
              badge_type: badgeType,
             game_type: 'word_search',
              score: player.highest_score,
            }, {
              onConflict: 'user_id,week_start,game_type'
            });
        });

        await Promise.all(badgePromises);
      }

      // Find user's rank
      const currentRankings = activeTab === "weekly" ? weeklyRankings : allTimeRankings;
      const userRankIndex = currentRankings.findIndex((p) => p.user_id === user.id);
      setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, activeTab]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  const handlePlayerClick = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        setSelectedProfile(profile);
        setShowProfileDialog(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getRankIcon = (rank: number, badgeType?: string) => {
    if (badgeType) {
      switch (badgeType) {
        case 'gold':
          return <Crown className="h-6 w-6 text-yellow-500" />;
        case 'silver':
          return <Trophy className="h-6 w-6 text-gray-400" />;
        case 'bronze':
          return <Medal className="h-6 w-6 text-amber-600" />;
      }
    }

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

  const getRankClass = (rank: number, isCurrentUser: boolean, badgeType?: string) => {
    if (isCurrentUser) {
      return `bg-gradient-to-r ${currentTheme.gradients.accent} text-white shadow-lg border-2 border-primary`;
    }

    if (badgeType) {
      switch (badgeType) {
        case 'gold':
          return `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg`;
        case 'silver':
          return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
        case 'bronze':
          return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300";
      }
    }

    switch (rank) {
      case 1:
        return `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg`;
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300";
      default:
        return "bg-card border-border hover:bg-muted/50 cursor-pointer";
    }
  };

  const getCurrentRankings = () => {
    return activeTab === "weekly" ? weeklyRankings : allTimeRankings;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const currentRankings = getCurrentRankings();

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
                <p className="text-white/80 text-sm">Your Rank</p>
                <p className="text-2xl font-bold text-white">#{userRank}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Weekly Reset Notice */}
        {activeTab === "weekly" && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-blue-800">Weekly Rankings</h3>
              </div>
              <p className="text-sm text-blue-700">
                Rankings reset every Monday • Top 3 players get exclusive badges
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ranking Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as RankingTab)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="all-time" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              All-Time
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
            ) : currentRankings.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Rankings Yet
                    </h3>
                    <p className="text-muted-foreground">
                      {activeTab === "weekly" 
                        ? "Be the first to score this week!" 
                        : "Be the first to set a record!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {currentRankings.slice(0, 50).map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser = player.user_id === user.id;

                  return (
                    <Card
                      key={`${activeTab}-${player.user_id}`}
                      className={`${getRankClass(rank, isCurrentUser, player.badge_type)} transition-all duration-200 hover:shadow-md border cursor-pointer`}
                      onClick={() => handlePlayerClick(player.user_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            {getRankIcon(rank, player.badge_type)}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-bold text-lg truncate ${
                                  rank === 1 || player.badge_type === 'gold' ? "text-white" : "text-foreground"
                                }`}
                              >
                                {player.username}
                              </h3>
                              {player.badge_type && (
                                <Badge 
                                  className={`text-xs ${
                                    player.badge_type === 'gold' ? 'bg-yellow-500 text-black' :
                                    player.badge_type === 'silver' ? 'bg-gray-400 text-black' :
                                    'bg-amber-600 text-white'
                                  }`}
                                >
                                  Week #{player.weekly_rank} 
                                </Badge>
                              )}
                              {isCurrentUser && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`${
                                  rank === 1 || player.badge_type === 'gold'
                                    ? "text-white/60"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Last played: {formatDate(player.last_played)}
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold mb-1 ${
                                rank === 1 || player.badge_type === 'gold' ? "text-white" : "text-primary"
                              }`}
                            >
                              {player.highest_score.toLocaleString()}
                            </div>
                            <div
                              className={`text-xs ${
                                rank === 1 || player.badge_type === 'gold'
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Highest Score
                            </div>
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
      </div>

      <UserProfileDialog
        profile={selectedProfile}
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </MobileContainer>
  );
};