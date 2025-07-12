import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  Users,
  Coins,
  Star,
  Crown,
  Timer,
  Target,
  Zap,
  Calendar,
  Medal,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  tournamentDbHelper,
  formatTournamentTime,
  getTournamentTimeStatus,
} from "@/utils/tournamentDbHelper";
import type { Tournament } from "@/utils/tournamentDbHelper";

interface TournamentCardProps {
  tournament: Tournament;
  onJoin: () => void;
  currentUserId: string | null;
  showLeaderboard?: boolean;
  showResults?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  currentUserId,
  showLeaderboard = false,
  showResults = false,
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeStatus, setTimeStatus] = useState(
    getTournamentTimeStatus(tournament),
  );

  useEffect(() => {
    checkRegistration();

    // Update time status every minute
    const interval = setInterval(() => {
      setTimeStatus(getTournamentTimeStatus(tournament));
    }, 60000);

    return () => clearInterval(interval);
  }, [tournament, currentUserId]);

  const checkRegistration = async () => {
    if (!currentUserId) return;

    try {
      const registered = await tournamentDbHelper.isUserRegistered(
        currentUserId,
        tournament.id,
      );
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case "chess":
        return "♛";
      case "ludo":
        return "🎲";
      case "maze":
        return "🧩";
      case "game2048":
        return "🎯";
      case "math":
        return "🧮";
      case "wordsearch":
        return "📝";
      default:
        return "🎮";
    }
  };

  const getGameTypeColor = (gameType: string) => {
    switch (gameType) {
      case "chess":
        return "from-amber-500 to-orange-600";
      case "ludo":
        return "from-green-500 to-emerald-600";
      case "maze":
        return "from-purple-500 to-indigo-600";
      case "game2048":
        return "from-cyan-500 to-blue-600";
      case "math":
        return "from-pink-500 to-rose-600";
      case "wordsearch":
        return "from-emerald-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusBadge = () => {
    switch (tournament.status) {
      case "upcoming":
        return (
          <Badge className="bg-blue-500 text-white">
            <Calendar className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-500 text-white animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-gray-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const canJoin = () => {
    return (
      tournament.status === "upcoming" &&
      !isRegistered &&
      tournament.current_participants < tournament.max_participants &&
      timeStatus.status === "upcoming"
    );
  };

  const getActionButton = () => {
    if (tournament.status === "completed" && showResults) {
      return (
        <Button variant="outline" className="w-full" disabled>
          <Trophy className="h-4 w-4 mr-2" />
          View Results
        </Button>
      );
    }

    if (tournament.status === "active" && isRegistered) {
      return (
        <Button
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Participating
        </Button>
      );
    }

    if (tournament.status === "active" && !isRegistered) {
      return (
        <Button variant="outline" className="w-full" disabled>
          <AlertCircle className="h-4 w-4 mr-2" />
          Registration Closed
        </Button>
      );
    }

    if (isRegistered) {
      return (
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Registered
        </Button>
      );
    }

    if (!canJoin()) {
      const reason =
        tournament.current_participants >= tournament.max_participants
          ? "Full"
          : "Closed";
      return (
        <Button variant="outline" className="w-full" disabled>
          <AlertCircle className="h-4 w-4 mr-2" />
          {reason}
        </Button>
      );
    }

    return (
      <Button
        onClick={onJoin}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Crown className="h-4 w-4 mr-2" />
        Join Tournament
      </Button>
    );
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Background Pattern */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getGameTypeColor(tournament.game_type)} opacity-10 rounded-bl-full`}
      ></div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">{getStatusBadge()}</div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-3">
          <div className="relative">
            <div
              className={`p-3 bg-gradient-to-br ${getGameTypeColor(tournament.game_type)} rounded-xl text-white shadow-lg`}
            >
              <span className="text-2xl">
                {getGameTypeIcon(tournament.game_type)}
              </span>
            </div>
            {tournament.status === "active" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {tournament.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {tournament.game_type.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600 capitalize">
                {tournament.game_type} Tournament
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tournament Description */}
        {tournament.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {tournament.description}
          </p>
        )}

        {/* Time Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {tournament.status === "upcoming"
                ? "Starts:"
                : tournament.status === "active"
                  ? "Ends:"
                  : "Ended:"}
            </span>
            <span className="font-medium">
              {tournament.status === "upcoming"
                ? formatTournamentTime(tournament.start_time)
                : formatTournamentTime(tournament.end_time)}
            </span>
          </div>

          {timeStatus.timeLeft && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                {timeStatus.message}
              </span>
            </div>
          )}
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                {tournament.current_participants}/{tournament.max_participants}
              </div>
              <div className="text-xs text-gray-500">Players</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                ₹{tournament.entry_fee}
              </div>
              <div className="text-xs text-gray-500">Entry Fee</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                ₹{tournament.prize_amount}
              </div>
              <div className="text-xs text-gray-500">Winner Prize</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">
                ₹{tournament.total_prize_pool}
              </div>
              <div className="text-xs text-gray-500">Prize Pool</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Registration Progress</span>
            <span>
              {Math.round(
                (tournament.current_participants /
                  tournament.max_participants) *
                  100,
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getGameTypeColor(tournament.game_type)} transition-all duration-300`}
              style={{
                width: `${Math.min((tournament.current_participants / tournament.max_participants) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Winner Information (for completed tournaments) */}
        {tournament.status === "completed" && tournament.winner_id && (
          <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">
                  Tournament Winner
                </div>
                <div className="text-yellow-700">
                  Score: {tournament.winner_score} • Prize: ₹
                  {tournament.prize_amount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">{getActionButton()}</div>
      </CardContent>
    </Card>
  );
};
