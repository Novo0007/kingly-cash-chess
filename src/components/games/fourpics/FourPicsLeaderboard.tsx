import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Star,
  Coins,
  TrendingUp,
  Medal,
  Crown,
  Target,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { getFourPicsLeaderboard } from "@/utils/fourpicsDbHelper";
import { toast } from "sonner";

interface FourPicsLeaderboardProps {
  onBack: () => void;
}

interface LeaderboardEntry {
  user_id: string;
  total_levels_completed: number;
  total_coins_earned: number;
  highest_level_reached: number;
  total_time_played: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  rank?: number;
}

export const FourPicsLeaderboard: React.FC<FourPicsLeaderboardProps> = ({
  onBack,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("levels");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const result = await getFourPicsLeaderboard();

      if (result.success && result.data) {
        // Add rank to each entry
        const rankedData = result.data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaderboardData(rankedData);
      } else {
        toast.error("Failed to load leaderboard");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedByLevels = [...leaderboardData].sort((a, b) => {
    if (b.highest_level_reached !== a.highest_level_reached) {
      return b.highest_level_reached - a.highest_level_reached;
    }
    return b.total_levels_completed - a.total_levels_completed;
  });

  const sortedByCoins = [...leaderboardData].sort(
    (a, b) => b.total_coins_earned - a.total_coins_earned,
  );

  const sortedBySpeed = [...leaderboardData]
    .filter((entry) => entry.total_levels_completed > 0)
    .sort((a, b) => {
      const avgTimeA = a.total_time_played / a.total_levels_completed;
      const avgTimeB = b.total_time_played / b.total_levels_completed;
      return avgTimeA - avgTimeB;
    });

  const LeaderboardCard = ({
    entries,
    scoreType,
  }: {
    entries: LeaderboardEntry[];
    scoreType: string;
  }) => (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No data available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Be the first to play and appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      ) : (
        entries.slice(0, 50).map((entry, index) => {
          const displayRank = index + 1;
          let primaryScore = "";
          let secondaryScore = "";
          let scoreIcon = <Trophy className="h-4 w-4" />;

          switch (scoreType) {
            case "levels":
              primaryScore = `Level ${entry.highest_level_reached}`;
              secondaryScore = `${entry.total_levels_completed} completed`;
              scoreIcon = <Target className="h-4 w-4 text-blue-600" />;
              break;
            case "coins":
              primaryScore = `${entry.total_coins_earned} coins`;
              secondaryScore = `Level ${entry.highest_level_reached}`;
              scoreIcon = <Coins className="h-4 w-4 text-yellow-600" />;
              break;
            case "speed": {
              const avgTime =
                entry.total_time_played / entry.total_levels_completed;
              primaryScore = `${formatTime(avgTime)} avg`;
              secondaryScore = `${entry.total_levels_completed} levels`;
              scoreIcon = <Clock className="h-4 w-4 text-green-600" />;
              break;
            }
          }

          return (
            <Card
              key={entry.user_id}
              className={`transition-all duration-200 hover:shadow-md ${
                displayRank <= 3 ? "ring-2 ring-opacity-50" : ""
              } ${
                displayRank === 1
                  ? "ring-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100"
                  : displayRank === 2
                    ? "ring-gray-400 bg-gradient-to-r from-gray-50 to-gray-100"
                    : displayRank === 3
                      ? "ring-amber-400 bg-gradient-to-r from-amber-50 to-amber-100"
                      : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getRankIcon(displayRank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {entry.profiles.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">
                        {entry.profiles.username || "Anonymous"}
                      </p>
                      {displayRank <= 3 && (
                        <Badge
                          className={`text-xs ${getRankBadgeColor(displayRank)}`}
                        >
                          #{displayRank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      {scoreIcon}
                      <span className="text-sm">{secondaryScore}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="font-bold text-lg">{primaryScore}</p>
                    {displayRank > 3 && (
                      <p className="text-xs text-gray-500">#{displayRank}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading Leaderboard...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl mb-2">Leaderboard</CardTitle>
              <p className="text-blue-100">Top 4 Pics 1 Word Players</p>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Global Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {leaderboardData.length}
                </div>
                <div className="text-sm text-gray-600">Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(
                    ...leaderboardData.map((e) => e.highest_level_reached),
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600">Highest Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {leaderboardData
                    .reduce((sum, e) => sum + e.total_coins_earned, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Coins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="levels" className="text-xs">
                  <Target className="h-4 w-4 mr-1" />
                  Levels
                </TabsTrigger>
                <TabsTrigger value="coins" className="text-xs">
                  <Coins className="h-4 w-4 mr-1" />
                  Coins
                </TabsTrigger>
                <TabsTrigger value="speed" className="text-xs">
                  <Clock className="h-4 w-4 mr-1" />
                  Speed
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="levels" className="mt-0">
                  <div className="mb-4 text-center">
                    <h3 className="font-semibold text-gray-800">
                      Highest Level Reached
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ranked by progression and completion
                    </p>
                  </div>
                  <LeaderboardCard
                    entries={sortedByLevels}
                    scoreType="levels"
                  />
                </TabsContent>

                <TabsContent value="coins" className="mt-0">
                  <div className="mb-4 text-center">
                    <h3 className="font-semibold text-gray-800">
                      Total Coins Earned
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ranked by total coins accumulated
                    </p>
                  </div>
                  <LeaderboardCard entries={sortedByCoins} scoreType="coins" />
                </TabsContent>

                <TabsContent value="speed" className="mt-0">
                  <div className="mb-4 text-center">
                    <h3 className="font-semibold text-gray-800">
                      Average Completion Time
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ranked by speed per level
                    </p>
                  </div>
                  <LeaderboardCard entries={sortedBySpeed} scoreType="speed" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>1st Place - Champion</span>
              </div>
              <div className="flex items-center gap-3">
                <Medal className="h-5 w-5 text-gray-400" />
                <span>2nd Place - Runner-up</span>
              </div>
              <div className="flex items-center gap-3">
                <Medal className="h-5 w-5 text-amber-600" />
                <span>3rd Place - Third Place</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          {isLoading ? "Refreshing..." : "Refresh Leaderboard"}
        </Button>
      </div>
    </MobileContainer>
  );
};
