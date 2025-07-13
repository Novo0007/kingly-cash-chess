import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Coins,
  Flame,
  Target,
  TrendingUp,
  Users,
  Award,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { LeaderboardEntry, LANGUAGES } from "./CodeLearnTypes";
import { CodeLearnProgressManager } from "./CodeLearnProgress";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeLearnLeaderboardProps {
  currentUserId?: string;
  onClose?: () => void;
}

type LeaderboardType = "xp" | "coins" | "streak" | "accuracy" | "lessons";
type TimePeriod = "daily" | "weekly" | "monthly" | "all-time";

export const CodeLearnLeaderboard: React.FC<CodeLearnLeaderboardProps> = ({
  currentUserId,
  onClose,
}) => {
  const { currentTheme } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("xp");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all-time");
  const [loading, setLoading] = useState(false);
  const [progressManager] = useState(() =>
    CodeLearnProgressManager.getInstance(),
  );

  useEffect(() => {
    generateMockLeaderboard();
  }, [leaderboardType, timePeriod]);

  // Generate mock leaderboard data (in real app, this would come from Supabase)
  const generateMockLeaderboard = () => {
    setLoading(true);

    // Mock data - in real app, this would be fetched from the database
    const mockUsers = [
      {
        username: "CodeMaster",
        totalXP: 12500,
        coins: 3200,
        streak: 25,
        accuracy: 0.95,
        lessons: 85,
      },
      {
        username: "PyProgrammer",
        totalXP: 11800,
        coins: 2900,
        streak: 18,
        accuracy: 0.92,
        lessons: 78,
      },
      {
        username: "JSNinja",
        totalXP: 11200,
        coins: 2750,
        streak: 22,
        accuracy: 0.89,
        lessons: 72,
      },
      {
        username: "ReactDev",
        totalXP: 10900,
        coins: 2600,
        streak: 15,
        accuracy: 0.94,
        lessons: 69,
      },
      {
        username: "CppGuru",
        totalXP: 10500,
        coins: 2400,
        streak: 12,
        accuracy: 0.88,
        lessons: 65,
      },
      {
        username: "TypeScriptPro",
        totalXP: 10200,
        coins: 2350,
        streak: 19,
        accuracy: 0.91,
        lessons: 63,
      },
      {
        username: "JavaExpert",
        totalXP: 9800,
        coins: 2200,
        streak: 14,
        accuracy: 0.87,
        lessons: 58,
      },
      {
        username: "WebDevWiz",
        totalXP: 9500,
        coins: 2100,
        streak: 16,
        accuracy: 0.9,
        lessons: 55,
      },
      {
        username: "CodeNewbie",
        totalXP: 9200,
        coins: 2000,
        streak: 11,
        accuracy: 0.85,
        lessons: 52,
      },
      {
        username: "AlgoAce",
        totalXP: 8900,
        coins: 1900,
        streak: 13,
        accuracy: 0.86,
        lessons: 49,
      },
    ];

    // Add current user if provided
    if (currentUserId) {
      const userProgress = progressManager.getUserProgress();
      if (userProgress) {
        mockUsers.push({
          username: "You",
          totalXP: userProgress.totalXP,
          coins: userProgress.availableCoins,
          streak: userProgress.currentStreak,
          accuracy: 0.87, // Would calculate from actual data
          lessons: userProgress.completedLessons,
        });
      }
    }

    // Sort by the selected criteria
    let sortedUsers = [...mockUsers];
    switch (leaderboardType) {
      case "xp":
        sortedUsers.sort((a, b) => b.totalXP - a.totalXP);
        break;
      case "coins":
        sortedUsers.sort((a, b) => b.coins - a.coins);
        break;
      case "streak":
        sortedUsers.sort((a, b) => b.streak - a.streak);
        break;
      case "accuracy":
        sortedUsers.sort((a, b) => b.accuracy - a.accuracy);
        break;
      case "lessons":
        sortedUsers.sort((a, b) => b.lessons - a.lessons);
        break;
    }

    // Convert to LeaderboardEntry format
    const entries: LeaderboardEntry[] = sortedUsers.map((user, index) => ({
      userId: `user-${index}`,
      username: user.username,
      avatar: undefined,
      xp: user.totalXP,
      coins: user.coins,
      level: Math.floor(user.totalXP / 1000) + 1,
      streak: user.streak,
      rank: index + 1,
      completedLessons: user.lessons,
      accuracy: user.accuracy,
    }));

    setLeaderboardData(entries);

    // Find current user rank
    if (currentUserId) {
      const userEntry = entries.find((entry) => entry.username === "You");
      setCurrentUserRank(userEntry?.rank || null);
    }

    setTimeout(() => setLoading(false), 500);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            {rank}
          </div>
        );
    }
  };

  const getRankBgColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "bg-primary/20 border-primary/30";
    }

    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-yellow-600/10 border-amber-600/20";
      default:
        return "bg-card border-border";
    }
  };

  const getLeaderboardValue = (entry: LeaderboardEntry) => {
    switch (leaderboardType) {
      case "xp":
        return `${entry.xp.toLocaleString()} XP`;
      case "coins":
        return `${entry.coins.toLocaleString()} coins`;
      case "streak":
        return `${entry.streak} days`;
      case "accuracy":
        return `${Math.round(entry.accuracy * 100)}%`;
      case "lessons":
        return `${entry.completedLessons} lessons`;
      default:
        return "";
    }
  };

  const getLeaderboardIcon = (type: LeaderboardType) => {
    switch (type) {
      case "xp":
        return <Star className="w-4 h-4" />;
      case "coins":
        return <Coins className="w-4 h-4" />;
      case "streak":
        return <Flame className="w-4 h-4" />;
      case "accuracy":
        return <Target className="w-4 h-4" />;
      case "lessons":
        return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card
        className={`bg-gradient-to-r ${currentTheme.gradients.primary}/10 border border-primary/20 rounded-2xl`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-xl flex items-center justify-center`}
              >
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">CodeMaster Leaderboard</h2>
                <p className="text-sm text-muted-foreground">
                  Compete with fellow coders and climb the ranks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={generateMockLeaderboard}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm">
                  Close
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current User Rank */}
      {currentUserRank && (
        <Card className="bg-primary/10 border border-primary/20 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-medium">Your Current Rank</div>
                  <div className="text-sm text-muted-foreground">
                    You're #{currentUserRank} in {leaderboardType} rankings
                  </div>
                </div>
              </div>
              <Badge
                className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white text-lg px-3 py-1`}
              >
                #{currentUserRank}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs
        value={leaderboardType}
        onValueChange={(value) => setLeaderboardType(value as LeaderboardType)}
      >
        <TabsList className="grid w-full grid-cols-5 bg-muted p-2 rounded-2xl">
          <TabsTrigger value="xp" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            XP
          </TabsTrigger>
          <TabsTrigger value="coins" className="flex items-center gap-1">
            <Coins className="w-4 h-4" />
            Coins
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            Accuracy
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value={leaderboardType} className="mt-6">
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getLeaderboardIcon(leaderboardType)}
                Top Learners by{" "}
                {leaderboardType.charAt(0).toUpperCase() +
                  leaderboardType.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                      <div className="h-4 bg-muted rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboardData.map((entry, index) => {
                    const isCurrentUser = entry.username === "You";

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBgColor(entry.rank, isCurrentUser)} hover:shadow-md transition-all duration-200`}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar and Name */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div
                              className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}
                            >
                              {entry.username}
                              {isCurrentUser && (
                                <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Level {entry.level}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {getLeaderboardValue(entry)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.xp.toLocaleString()} XP • {entry.coins} coins
                          </div>
                        </div>

                        {/* Rank Change (mock) */}
                        <div className="w-6 flex justify-center">
                          {Math.random() > 0.5 ? (
                            <ChevronUp className="w-4 h-4 text-green-500" />
                          ) : Math.random() > 0.5 ? (
                            <ChevronDown className="w-4 h-4 text-red-500" />
                          ) : null}
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

      {/* Stats Footer */}
      <Card className="bg-muted/20 border border-muted/30 rounded-2xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {leaderboardData.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Learners
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {leaderboardData
                  .reduce((sum, entry) => sum + entry.xp, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total XP Earned
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(
                  (leaderboardData.reduce(
                    (sum, entry) => sum + entry.accuracy,
                    0,
                  ) /
                    leaderboardData.length) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">
                Average Accuracy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
