import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Clock,
  Users,
  Coins,
  Star,
  Crown,
  TrendingUp,
  CalendarDays,
  Timer,
  Medal,
  Target,
  Zap,
  Gift,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import {
  tournamentDbHelper,
  formatTournamentTime,
  getTournamentTimeStatus,
} from "@/utils/tournamentDbHelper";
import type { Tournament } from "@/utils/tournamentDbHelper";
import { TournamentCard } from "./TournamentCard";
import { TournamentLeaderboard } from "./TournamentLeaderboard";
import { CreateTournamentDialog } from "./CreateTournamentDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TournamentSectionProps {
  gameType?: "chess" | "ludo" | "maze" | "game2048" | "math" | "wordsearch";
}

export const TournamentSection: React.FC<TournamentSectionProps> = ({
  gameType,
}) => {
  const { isMobile } = useDeviceType();
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>(
    [],
  );
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [completedTournaments, setCompletedTournaments] = useState<
    Tournament[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    getCurrentUser();
    fetchTournaments();

    // Update tournament statuses periodically
    const statusInterval = setInterval(async () => {
      try {
        await tournamentDbHelper.updateTournamentStatus();
        fetchTournaments();
      } catch (error) {
        console.error("Error updating tournament status:", error);
      }
    }, 60000); // Update every minute

    return () => clearInterval(statusInterval);
  }, [gameType]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      const [upcoming, active, completed] = await Promise.all([
        tournamentDbHelper.getUpcomingTournaments(gameType),
        tournamentDbHelper.getActiveTournaments(gameType),
        tournamentDbHelper.getCompletedTournaments(gameType, 5),
      ]);

      setUpcomingTournaments(upcoming);
      setActiveTournaments(active);
      setCompletedTournaments(completed);
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
      // Check if user is already registered
      const isRegistered = await tournamentDbHelper.isUserRegistered(
        currentUser,
        tournament.id,
      );
      if (isRegistered) {
        toast.info("You're already registered for this tournament");
        return;
      }

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

  const handleCreateTournament = async (tournamentData: any) => {
    try {
      await tournamentDbHelper.createTournament({
        ...tournamentData,
        created_by: currentUser,
      });
      toast.success("Tournament created successfully!");
      setShowCreateDialog(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast.error("Failed to create tournament");
    }
  };

  const getTournamentStats = () => {
    const totalActive = activeTournaments.length;
    const totalUpcoming = upcomingTournaments.length;
    const totalParticipants = activeTournaments.reduce(
      (sum, t) => sum + t.current_participants,
      0,
    );
    const totalPrizePool = activeTournaments.reduce(
      (sum, t) => sum + t.total_prize_pool,
      0,
    );

    return {
      totalActive,
      totalUpcoming,
      totalParticipants,
      totalPrizePool,
    };
  };

  const stats = getTournamentStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-orange-600/90 rounded-2xl"></div>

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
              {gameType
                ? `${gameType.toUpperCase()} Tournaments`
                : "All Game Tournaments"}{" "}
              • ₹5 Entry Fee • ₹50 Prize • 3 Hour Duration
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CalendarDays className="h-5 w-5" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalUpcoming}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Players</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="h-5 w-5" />
              <span className="text-sm font-medium">Prize Pool</span>
            </div>
            <div className="text-xl font-bold">₹{stats.totalPrizePool}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Upcoming ({upcomingTournaments.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
          >
            <Zap className="h-4 w-4 mr-2" />
            Live ({activeTournaments.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Completed ({completedTournaments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingTournaments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Upcoming Tournaments
                </h3>
                <p className="text-gray-600 mb-4">
                  {gameType
                    ? `No upcoming ${gameType} tournaments at the moment.`
                    : "No upcoming tournaments at the moment."}
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={() => handleJoinTournament(tournament)}
                  currentUserId={currentUser}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeTournaments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Active Tournaments
                </h3>
                <p className="text-gray-600">
                  {gameType
                    ? `No active ${gameType} tournaments right now.`
                    : "No active tournaments right now."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeTournaments.map((tournament) => (
                <div key={tournament.id} className="space-y-4">
                  <TournamentCard
                    tournament={tournament}
                    onJoin={() => handleJoinTournament(tournament)}
                    currentUserId={currentUser}
                    showLeaderboard
                  />
                  <TournamentLeaderboard tournamentId={tournament.id} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTournaments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Completed Tournaments
                </h3>
                <p className="text-gray-600">
                  {gameType
                    ? `No completed ${gameType} tournaments yet.`
                    : "No completed tournaments yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={() => handleJoinTournament(tournament)}
                  currentUserId={currentUser}
                  showResults
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Tournament Dialog */}
      <CreateTournamentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTournament={handleCreateTournament}
        defaultGameType={gameType}
      />
    </div>
  );
};
