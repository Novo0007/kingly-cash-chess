export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          is_active: boolean;
          permissions: Json | null;
          role: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          is_active?: boolean;
          permissions?: Json | null;
          role?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          is_active?: boolean;
          permissions?: Json | null;
          role?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      chess_games: {
        Row: {
          black_player_id: string | null;
          black_time_remaining: number | null;
          board_state: string | null;
          created_at: string | null;
          current_turn: string | null;
          entry_fee: number;
          game_name: string | null;
          game_result: Database["public"]["Enums"]["game_result"] | null;
          game_status: Database["public"]["Enums"]["game_status"] | null;
          id: string;
          is_friend_challenge: boolean | null;
          move_history: string[] | null;
          prize_amount: number;
          time_control: number | null;
          updated_at: string | null;
          white_player_id: string | null;
          white_time_remaining: number | null;
          winner_id: string | null;
        };
        Insert: {
          black_player_id?: string | null;
          black_time_remaining?: number | null;
          board_state?: string | null;
          created_at?: string | null;
          current_turn?: string | null;
          entry_fee?: number;
          game_name?: string | null;
          game_result?: Database["public"]["Enums"]["game_result"] | null;
          game_status?: Database["public"]["Enums"]["game_status"] | null;
          id?: string;
          is_friend_challenge?: boolean | null;
          move_history?: string[] | null;
          prize_amount?: number;
          time_control?: number | null;
          updated_at?: string | null;
          white_player_id?: string | null;
          white_time_remaining?: number | null;
          winner_id?: string | null;
        };
        Update: {
          black_player_id?: string | null;
          black_time_remaining?: number | null;
          board_state?: string | null;
          created_at?: string | null;
          current_turn?: string | null;
          entry_fee?: number;
          game_name?: string | null;
          game_result?: Database["public"]["Enums"]["game_result"] | null;
          game_status?: Database["public"]["Enums"]["game_status"] | null;
          id?: string;
          is_friend_challenge?: boolean | null;
          move_history?: string[] | null;
          prize_amount?: number;
          time_control?: number | null;
          updated_at?: string | null;
          white_player_id?: string | null;
          white_time_remaining?: number | null;
          winner_id?: string | null;
        };
        Relationships: [];
      };
      game2048_scores: {
        Row: {
          board_state: Json | null;
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          moves_count: number | null;
          score: number;
          user_id: string;
        };
        Insert: {
          board_state?: Json | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          moves_count?: number | null;
          score: number;
          user_id: string;
        };
        Update: {
          board_state?: Json | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          moves_count?: number | null;
          score?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      ludo_scores: {
        Row: {
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          moves_count: number | null;
          score: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          moves_count?: number | null;
          score: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          moves_count?: number | null;
          score?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      math_scores: {
        Row: {
          created_at: string | null;
          difficulty_level: number | null;
          duration_seconds: number | null;
          id: string;
          score: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          difficulty_level?: number | null;
          duration_seconds?: number | null;
          id?: string;
          score: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          difficulty_level?: number | null;
          duration_seconds?: number | null;
          id?: string;
          score?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      maze_scores: {
        Row: {
          created_at: string | null;
          difficulty_level: number | null;
          duration_seconds: number | null;
          id: string;
          score: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          difficulty_level?: number | null;
          duration_seconds?: number | null;
          id?: string;
          score: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          difficulty_level?: number | null;
          duration_seconds?: number | null;
          id?: string;
          score?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          chess_rating: number | null;
          created_at: string | null;
          email: string | null;
          games_played: number | null;
          games_won: number | null;
          id: string;
          total_earnings: number | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          chess_rating?: number | null;
          created_at?: string | null;
          email?: string | null;
          games_played?: number | null;
          games_won?: number | null;
          id: string;
          total_earnings?: number | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          chess_rating?: number | null;
          created_at?: string | null;
          email?: string | null;
          games_played?: number | null;
          games_won?: number | null;
          id?: string;
          total_earnings?: number | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      tournaments: {
        Row: {
          created_at: string;
          created_by: string | null;
          current_participants: number;
          description: string | null;
          end_time: string;
          entry_fee: number;
          game_type: string;
          id: string;
          max_participants: number;
          prize_amount: number;
          registration_deadline: string | null;
          start_time: string;
          status: "upcoming" | "active" | "completed" | "cancelled";
          title: string;
          total_prize_pool: number;
          updated_at: string;
          winner_id: string | null;
          winner_score: number | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          current_participants?: number;
          description?: string | null;
          end_time: string;
          entry_fee?: number;
          game_type: string;
          id?: string;
          max_participants?: number;
          prize_amount?: number;
          registration_deadline?: string | null;
          start_time: string;
          status?: "upcoming" | "active" | "completed" | "cancelled";
          title: string;
          total_prize_pool?: number;
          updated_at?: string;
          winner_id?: string | null;
          winner_score?: number | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          current_participants?: number;
          description?: string | null;
          end_time?: string;
          entry_fee?: number;
          game_type?: string;
          id?: string;
          max_participants?: number;
          prize_amount?: number;
          registration_deadline?: string | null;
          start_time?: string;
          status?: "upcoming" | "active" | "completed" | "cancelled";
          title?: string;
          total_prize_pool?: number;
          updated_at?: string;
          winner_id?: string | null;
          winner_score?: number | null;
        };
        Relationships: [];
      };
      tournament_participants: {
        Row: {
          entry_fee_paid: number;
          id: string;
          joined_at: string;
          tournament_id: string;
          user_id: string;
          username: string;
        };
        Insert: {
          entry_fee_paid?: number;
          id?: string;
          joined_at?: string;
          tournament_id: string;
          user_id: string;
          username: string;
        };
        Update: {
          entry_fee_paid?: number;
          id?: string;
          joined_at?: string;
          tournament_id?: string;
          user_id?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      tournament_scores: {
        Row: {
          game_data: Json | null;
          game_reference_id: string | null;
          id: string;
          score: number;
          submitted_at: string;
          tournament_id: string;
          user_id: string;
        };
        Insert: {
          game_data?: Json | null;
          game_reference_id?: string | null;
          id?: string;
          score: number;
          submitted_at?: string;
          tournament_id: string;
          user_id: string;
        };
        Update: {
          game_data?: Json | null;
          game_reference_id?: string | null;
          id?: string;
          score?: number;
          submitted_at?: string;
          tournament_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_scores_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          status: string;
          transaction_type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          status: string;
          transaction_type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          status?: string;
          transaction_type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          balance: number | null;
          created_at: string | null;
          id: string;
          locked_balance: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          balance?: number | null;
          created_at?: string | null;
          id?: string;
          locked_balance?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          balance?: number | null;
          created_at?: string | null;
          id?: string;
          locked_balance?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      wordsearch_levels: {
        Row: {
          created_at: string | null;
          difficulty: string;
          grid_size: number;
          id: string;
          level_number: number;
          time_limit: number | null;
          words: string[];
        };
        Insert: {
          created_at?: string | null;
          difficulty?: string;
          grid_size?: number;
          id?: string;
          level_number: number;
          time_limit?: number | null;
          words: string[];
        };
        Update: {
          created_at?: string | null;
          difficulty?: string;
          grid_size?: number;
          id?: string;
          level_number?: number;
          time_limit?: number | null;
          words?: string[];
        };
        Relationships: [];
      };
      wordsearch_scores: {
        Row: {
          accuracy_percentage: number | null;
          coins_earned: number | null;
          completed_at: string | null;
          created_at: string | null;
          duration_seconds: number | null;
          id: string;
          level_id: string;
          score: number;
          user_id: string;
          words_found: number | null;
        };
        Insert: {
          accuracy_percentage?: number | null;
          coins_earned?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          level_id: string;
          score: number;
          user_id: string;
          words_found?: number | null;
        };
        Update: {
          accuracy_percentage?: number | null;
          coins_earned?: number | null;
          completed_at?: string | null;
          created_at?: string | null;
          duration_seconds?: number | null;
          id?: string;
          level_id?: string;
          score?: number;
          user_id?: string;
          words_found?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "wordsearch_scores_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "wordsearch_levels";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment: {
        Args: {
          column_name: string;
          increment_value: number;
          row_id: string;
          table_name: string;
        };
        Returns: undefined;
      };
      increment_decimal: {
        Args: {
          column_name: string;
          increment_value: number;
          row_id: string;
          table_name: string;
        };
        Returns: undefined;
      };
      join_tournament: {
        Args: {
          tournament_id_param: string;
          user_id_param: string;
          username_param: string;
        };
        Returns: {
          success: boolean;
          participant_id: string;
          entry_fee_paid: number;
          error: string;
        };
      };
      submit_tournament_score: {
        Args: {
          tournament_id_param: string;
          user_id_param: string;
          score_param: number;
          game_data_param?: Json;
          game_reference_id_param?: string;
        };
        Returns: {
          success: boolean;
          score_id: string;
          is_new_best: boolean;
          current_best: number;
          error: string;
        };
      };
    };
    Enums: {
      game_result: "white_wins" | "black_wins" | "draw" | "abandoned";
      game_status: "waiting" | "active" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
