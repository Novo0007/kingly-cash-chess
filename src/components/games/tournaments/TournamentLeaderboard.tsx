import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { tournamentDbHelper } from "@/utils/tournamentDbHelper";
import type { TournamentLeaderboard as LeaderboardType } from "@/utils/tournamentDbHelper";

interface TournamentLeaderboardProps {
  tournamentId: string;
  showTop?: number;
  compact?: boolean;
}

export const TournamentLeaderboard: React.FC<TournamentLeaderboardProps> = ({
  tournamentId,
  showTop = 10,
  compact = false,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const subscription = tournamentDbHelper.subscribeLeaderboardUpdates(
      tournamentId,
      () => {
        fetchLeaderboard();
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data =
        await tournamentDbHelper.getTournamentLeaderboard(tournamentId);
      setLeaderboard(data.slice(0, showTop));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            🥇 1st
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white">
            🥈 2nd
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">
            🥉 3rd
          </Badge>
        );
      default:
        return <Badge variant="secondary">#{rank}</Badge>;
    }
  };

  const getScoreColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 font-bold";
      case 2:
        return "text-gray-500 font-semibold";
      case 3:
        return "text-amber-600 font-semibold";
      default:
        return "text-gray-700 font-medium";
    }
  };

  if (loading) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardHeader className={compact ? "pb-3" : ""}>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No scores yet!</p>
          <p className="text-sm text-gray-500 mt-1">
            Be the first to play and climb the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="border-0 shadow-none bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              Live Leaderboard
            </div>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {leaderboard.length} players
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.slice(0, 3).map((player) => (
            <div
              key={player.user_id}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border"
            >
              <div className="flex items-center gap-2">
                {getRankIcon(player.rank)}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {player.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {player.username}
                </div>
                <div className="text-xs text-gray-500">
                  {player.games_played} games
                </div>
              </div>
              <div className={`text-lg ${getScoreColor(player.rank)}`}>
                {player.best_score?.toLocaleString() || 0}
              </div>
            </div>
          ))}
          {leaderboard.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                +{leaderboard.length - 3} more players
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-500" />
            Live Tournament Leaderboard
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Users className="h-4 w-4 mr-1" />
              {leaderboard.length} players
            </Badge>
            <Badge className="bg-green-500 text-white animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-6">
            <div className="flex items-end justify-center gap-4 mb-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-white text-gray-700">
                        {leaderboard[1]?.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-300 to-gray-500 text-white text-xs">
                    2nd
                  </Badge>
                </div>
                <div className="font-medium text-sm truncate max-w-20">
                  {leaderboard[1]?.username}
                </div>
                <div className="text-lg font-bold text-gray-500">
                  {leaderboard[1]?.best_score?.toLocaleString() || 0}
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-white text-yellow-700">
                        {leaderboard[0]?.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                    👑
                  </Badge>
                </div>
                <div className="font-bold text-base truncate max-w-24">
                  {leaderboard[0]?.username}
                </div>
                <div className="text-xl font-bold text-yellow-600">
                  {leaderboard[0]?.best_score?.toLocaleString() || 0}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-white text-amber-700">
                        {leaderboard[2]?.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-xs">
                    3rd
                  </Badge>
                </div>
                <div className="font-medium text-sm truncate max-w-20">
                  {leaderboard[2]?.username}
                </div>
                <div className="text-lg font-bold text-amber-600">
                  {leaderboard[2]?.best_score?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <div
              key={player.user_id}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                index < 3
                  ? "bg-gradient-to-r from-gray-50 to-white border-gray-200"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(player.rank)}
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {player.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {player.username}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{player.games_played} games played</span>
                  {player.last_game_at && (
                    <span>
                      Last: {new Date(player.last_game_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl ${getScoreColor(player.rank)}`}>
                  {player.best_score?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500">best score</div>
              </div>

              {index < 3 && (
                <div className="text-2xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
              )}
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No scores yet!</p>
            <p className="text-sm text-gray-500 mt-1">
              Play the game to appear on the leaderboard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
