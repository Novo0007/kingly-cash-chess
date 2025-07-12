import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Tournament = Tables<"tournaments">;
export type TournamentParticipant = Tables<"tournament_participants">;
export type TournamentScore = Tables<"tournament_scores">;
export type TournamentTransaction = Tables<"tournament_transactions">;

export interface TournamentCreateData extends TablesInsert<"tournaments"> {}

export interface TournamentLeaderboard {
  tournament_id: string;
  user_id: string;
  username: string;
  best_score: number;
  games_played: number;
  joined_at: string;
  last_game_at: string | null;
  rank: number;
  tournament_title: string;
  game_type: string;
  tournament_status: string;
  prize_amount: number;
  end_time: string;
}

export interface JoinTournamentResult {
  success: boolean;
  participant_id?: string;
  entry_fee_paid?: number;
  error?: string;
}

export interface SubmitScoreResult {
  success: boolean;
  score_id?: string;
  is_new_best?: boolean;
  current_best?: number;
  error?: string;
}

export interface FinalizeTournamentResult {
  success: boolean;
  winner_id?: string;
  winner_username?: string;
  winner_score?: number;
  prize_amount?: number;
  error?: string;
}

// Tournament Management Functions
export const tournamentDbHelper = {
  // Create a new tournament
  async createTournament(
    tournamentData: TournamentCreateData,
  ): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from("tournaments")
      .insert(tournamentData)
      .select()
      .single();

    if (error) {
      console.error("Error creating tournament:", error);
      throw new Error(error.message);
    }

    return data;
  },

  // Get all tournaments with optional filtering
  async getTournaments(filters?: {
    status?: string;
    game_type?: string;
    limit?: number;
  }): Promise<Tournament[]> {
    let query = supabase.from("tournaments").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.game_type) {
      query = query.eq("game_type", filters.game_type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order("start_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tournaments:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  // Get upcoming tournaments
  async getUpcomingTournaments(gameType?: string): Promise<Tournament[]> {
    return this.getTournaments({
      status: "upcoming",
      game_type: gameType,
      limit: 10,
    });
  },

  // Get active tournaments
  async getActiveTournaments(gameType?: string): Promise<Tournament[]> {
    return this.getTournaments({
      status: "active",
      game_type: gameType,
      limit: 10,
    });
  },

  // Get completed tournaments
  async getCompletedTournaments(
    gameType?: string,
    limit = 5,
  ): Promise<Tournament[]> {
    return this.getTournaments({
      status: "completed",
      game_type: gameType,
      limit,
    });
  },

  // Get tournament by ID
  async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (error) {
      console.error("Error fetching tournament:", error);
      return null;
    }

    return data;
  },

  // Join a tournament
  async joinTournament(
    tournamentId: string,
    userId: string,
    username: string,
  ): Promise<JoinTournamentResult> {
    const { data, error } = await supabase.rpc("join_tournament", {
      tournament_id_param: tournamentId,
      user_id_param: userId,
      username_param: username,
    });

    if (error) {
      console.error("Error joining tournament:", error);
      return { success: false, error: error.message };
    }

    return data as JoinTournamentResult;
  },

  // Submit a tournament score
  async submitScore(
    tournamentId: string,
    userId: string,
    score: number,
    gameData?: any,
    gameReferenceId?: string,
  ): Promise<SubmitScoreResult> {
    const { data, error } = await supabase.rpc("submit_tournament_score", {
      tournament_id_param: tournamentId,
      user_id_param: userId,
      score_param: score,
      game_data_param: gameData || null,
      game_reference_id_param: gameReferenceId || null,
    });

    if (error) {
      console.error("Error submitting tournament score:", error);
      return { success: false, error: error.message };
    }

    return data as SubmitScoreResult;
  },

  // Get tournament leaderboard
  async getTournamentLeaderboard(
    tournamentId: string,
  ): Promise<TournamentLeaderboard[]> {
    const { data, error } = await supabase
      .from("tournament_leaderboard")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Error fetching tournament leaderboard:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  // Get user's tournament participation
  async getUserTournamentParticipation(
    userId: string,
    tournamentId?: string,
  ): Promise<TournamentParticipant[]> {
    let query = supabase
      .from("tournament_participants")
      .select("*")
      .eq("user_id", userId);

    if (tournamentId) {
      query = query.eq("tournament_id", tournamentId);
    }

    query = query.order("joined_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user tournament participation:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  // Check if user is registered for tournament
  async isUserRegistered(
    userId: string,
    tournamentId: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("tournament_participants")
      .select("id")
      .eq("user_id", userId)
      .eq("tournament_id", tournamentId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking user registration:", error);
      return false;
    }

    return !!data;
  },

  // Get user's tournament scores
  async getUserTournamentScores(
    userId: string,
    tournamentId?: string,
  ): Promise<TournamentScore[]> {
    let query = supabase
      .from("tournament_scores")
      .select("*")
      .eq("user_id", userId);

    if (tournamentId) {
      query = query.eq("tournament_id", tournamentId);
    }

    query = query.order("achieved_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user tournament scores:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  // Get tournament statistics
  async getTournamentStats(tournamentId: string) {
    const [tournament, participants, scores] = await Promise.all([
      this.getTournamentById(tournamentId),
      supabase
        .from("tournament_participants")
        .select("*")
        .eq("tournament_id", tournamentId),
      supabase
        .from("tournament_scores")
        .select("score")
        .eq("tournament_id", tournamentId),
    ]);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const participantData = participants.data || [];
    const scoreData = scores.data || [];

    const stats = {
      tournament,
      totalParticipants: participantData.length,
      totalGamesPlayed: scoreData.length,
      averageScore:
        scoreData.length > 0
          ? Math.round(
              scoreData.reduce((sum, s) => sum + s.score, 0) / scoreData.length,
            )
          : 0,
      highestScore:
        scoreData.length > 0 ? Math.max(...scoreData.map((s) => s.score)) : 0,
      activeParticipants: participantData.filter(
        (p) => !p.is_disqualified && p.games_played > 0,
      ).length,
    };

    return stats;
  },

  // Update tournament status (admin function)
  async updateTournamentStatus(): Promise<void> {
    const { error } = await supabase.rpc("update_tournament_status");

    if (error) {
      console.error("Error updating tournament status:", error);
      throw new Error(error.message);
    }
  },

  // Finalize tournament and distribute prizes
  async finalizeTournament(
    tournamentId: string,
  ): Promise<FinalizeTournamentResult> {
    const { data, error } = await supabase.rpc("finalize_tournament", {
      tournament_id_param: tournamentId,
    });

    if (error) {
      console.error("Error finalizing tournament:", error);
      return { success: false, error: error.message };
    }

    return data as FinalizeTournamentResult;
  },

  // Get tournament transactions for a user
  async getUserTournamentTransactions(
    userId: string,
    tournamentId?: string,
  ): Promise<TournamentTransaction[]> {
    let query = supabase
      .from("tournament_transactions")
      .select("*")
      .eq("user_id", userId);

    if (tournamentId) {
      query = query.eq("tournament_id", tournamentId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tournament transactions:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  // Real-time subscriptions
  subscribeTournamentUpdates(
    tournamentId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_participants",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        callback,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        callback,
      )
      .subscribe();
  },

  subscribeLeaderboardUpdates(
    tournamentId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`leaderboard-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournament_participants",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        callback,
      )
      .subscribe();
  },
};

// Utility functions
export const formatTournamentTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTournamentTimeStatus = (
  tournament: Tournament,
): {
  status: "upcoming" | "active" | "completed" | "registration_closed";
  timeLeft?: string;
  message: string;
} => {
  const now = new Date();
  const startTime = new Date(tournament.start_time);
  const endTime = new Date(tournament.end_time);
  const registrationDeadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : startTime;

  if (now < registrationDeadline) {
    const timeLeft = Math.ceil(
      (registrationDeadline.getTime() - now.getTime()) / 60000,
    );
    return {
      status: "upcoming",
      timeLeft: formatTimeLeft(timeLeft),
      message: `Registration closes in ${formatTimeLeft(timeLeft)}`,
    };
  } else if (now < startTime) {
    const timeLeft = Math.ceil((startTime.getTime() - now.getTime()) / 60000);
    return {
      status: "registration_closed",
      timeLeft: formatTimeLeft(timeLeft),
      message: `Tournament starts in ${formatTimeLeft(timeLeft)}`,
    };
  } else if (now < endTime) {
    const timeLeft = Math.ceil((endTime.getTime() - now.getTime()) / 60000);
    return {
      status: "active",
      timeLeft: formatTimeLeft(timeLeft),
      message: `Tournament ends in ${formatTimeLeft(timeLeft)}`,
    };
  } else {
    return {
      status: "completed",
      message: "Tournament completed",
    };
  }
};

export const formatTimeLeft = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const calculatePrizeDistribution = (
  totalPrizePool: number,
  participantCount: number,
): { winner: number; runnerUp?: number; third?: number } => {
  // For now, winner takes all (₹50)
  // This can be modified to distribute prizes among top 3 players
  return {
    winner: 50, // Fixed prize amount as per requirements
  };
};
