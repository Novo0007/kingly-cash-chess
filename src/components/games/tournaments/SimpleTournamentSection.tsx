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
  Calendar,
  Target,
  Zap,
  Gift,
  Timer,
} from "lucide-react";
import {
  tournamentDbHelper,
  formatTournamentTime,
  getTournamentTimeStatus,
} from "@/utils/tournamentDbHelper";
import type { Tournament } from "@/utils/tournamentDbHelper";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const SimpleTournamentSection: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchTournaments();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const allTournaments = await tournamentDbHelper.getTournaments({
        limit: 10,
      });
      setTournaments(allTournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournament: Tournament) => {
    if (!currentUser) {
      toast.error("Please log in to join tournaments");
      return;
    }

    try {
      // Get user profile for username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      const result = await tournamentDbHelper.joinTournament(
        tournament.id,
        currentUser,
        profile.username,
      );

      if (result.success) {
        toast.success(
          `Successfully joined "${tournament.title}"! Entry fee: ₹${result.entry_fee_paid}`,
        );
        fetchTournaments(); // Refresh tournaments
      } else {
        toast.error(result.error || "Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast.error("Failed to join tournament");
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

  const getStatusBadge = (tournament: Tournament) => {
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
            <Trophy className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-8">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl"></div>

        <Card className="relative bg-transparent border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-black text-white">
                🏆 Tournament Arena
              </CardTitle>
            </div>
            <p className="text-white/90 text-lg font-medium">
              ₹5 Entry Fee • ₹50 Prize • 3 Hour Duration
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tournament List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Tournaments Available
              </h3>
              <p className="text-gray-600">
                Check back later for new tournaments!
              </p>
            </CardContent>
          </Card>
        ) : (
          tournaments.map((tournament) => {
            const timeStatus = getTournamentTimeStatus(tournament);
            return (
              <Card
                key={tournament.id}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {getStatusBadge(tournament)}
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="flex items-start gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg">
                      <span className="text-2xl">
                        {getGameTypeIcon(tournament.game_type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {tournament.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {tournament.game_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
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
                          {tournament.current_participants}/
                          {tournament.max_participants}
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
                        <div className="text-xs text-gray-500">
                          Winner Prize
                        </div>
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
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300"
                        style={{
                          width: `${Math.min((tournament.current_participants / tournament.max_participants) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {tournament.status === "upcoming" ? (
                      <Button
                        onClick={() => handleJoinTournament(tournament)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Join Tournament
                      </Button>
                    ) : tournament.status === "active" ? (
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-green-700"
                        disabled
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Tournament Active
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Trophy className="h-4 w-4 mr-2" />
                        Tournament Ended
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
