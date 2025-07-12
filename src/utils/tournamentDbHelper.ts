import { supabase } from "@/integrations/supabase/client";

export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  game_type: string;
  entry_fee: number;
  prize_amount: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  end_time: string;
  registration_deadline: string | null;
  status: "upcoming" | "active" | "completed" | "cancelled";
  winner_id: string | null;
  winner_score: number | null;
  total_prize_pool: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
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

// Tournament Management Functions
export const tournamentDbHelper = {
  async getTournaments(filters?: {
    status?: string;
    game_type?: string;
    limit?: number;
  }): Promise<Tournament[]> {
    try {
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
        // Check if it's a "table doesn't exist" error
        if (
          error.message.includes("relation") &&
          error.message.includes("does not exist")
        ) {
          console.warn(
            "Tournaments table not found - feature not yet available",
          );
          return [];
        }
        console.error("Error fetching tournaments:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTournaments:", error);
      return [];
    }
  },

  async getActiveTournaments(gameType?: string): Promise<Tournament[]> {
    return this.getTournaments({
      status: "active",
      game_type: gameType,
      limit: 10,
    });
  },

  async isUserRegistered(
    userId: string,
    tournamentId: string,
  ): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error("Error in isUserRegistered:", error);
      return false;
    }
  },

  async joinTournament(
    tournamentId: string,
    userId: string,
    username: string,
  ): Promise<JoinTournamentResult> {
    try {
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
    } catch (error) {
      console.error("Error in joinTournament:", error);
      return { success: false, error: "Failed to join tournament" };
    }
  },

  async submitScore(
    tournamentId: string,
    userId: string,
    score: number,
    gameData?: any,
    gameReferenceId?: string,
  ): Promise<SubmitScoreResult> {
    try {
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
    } catch (error) {
      console.error("Error in submitScore:", error);
      return { success: false, error: "Failed to submit score" };
    }
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
