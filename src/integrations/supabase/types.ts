export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chess_games: {
        Row: {
          black_player_id: string | null
          black_time_remaining: number | null
          board_state: string | null
          created_at: string | null
          current_turn: string | null
          entry_fee: number
          game_name: string | null
          game_result: Database["public"]["Enums"]["game_result"] | null
          game_status: Database["public"]["Enums"]["game_status"] | null
          id: string
          is_friend_challenge: boolean | null
          move_history: string[] | null
          prize_amount: number
          time_control: number | null
          updated_at: string | null
          white_player_id: string | null
          white_time_remaining: number | null
          winner_id: string | null
        }
        Insert: {
          black_player_id?: string | null
          black_time_remaining?: number | null
          board_state?: string | null
          created_at?: string | null
          current_turn?: string | null
          entry_fee?: number
          game_name?: string | null
          game_result?: Database["public"]["Enums"]["game_result"] | null
          game_status?: Database["public"]["Enums"]["game_status"] | null
          id?: string
          is_friend_challenge?: boolean | null
          move_history?: string[] | null
          prize_amount?: number
          time_control?: number | null
          updated_at?: string | null
          white_player_id?: string | null
          white_time_remaining?: number | null
          winner_id?: string | null
        }
        Update: {
          black_player_id?: string | null
          black_time_remaining?: number | null
          board_state?: string | null
          created_at?: string | null
          current_turn?: string | null
          entry_fee?: number
          game_name?: string | null
          game_result?: Database["public"]["Enums"]["game_result"] | null
          game_status?: Database["public"]["Enums"]["game_status"] | null
          id?: string
          is_friend_challenge?: boolean | null
          move_history?: string[] | null
          prize_amount?: number
          time_control?: number | null
          updated_at?: string | null
          white_player_id?: string | null
          white_time_remaining?: number | null
          winner_id?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: []
      }
      game_invitations: {
        Row: {
          created_at: string | null
          entry_fee: number
          expires_at: string | null
          from_user_id: string
          game_id: string
          id: string
          status: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_fee: number
          expires_at?: string | null
          from_user_id: string
          game_id: string
          id?: string
          status?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          entry_fee?: number
          expires_at?: string | null
          from_user_id?: string
          game_id?: string
          id?: string
          status?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_invitations_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "chess_games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          chess_rating: number | null
          created_at: string | null
          full_name: string | null
          games_played: number | null
          games_won: number | null
          id: string
          total_earnings: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          chess_rating?: number | null
          created_at?: string | null
          full_name?: string | null
          games_played?: number | null
          games_won?: number | null
          id: string
          total_earnings?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          chess_rating?: number | null
          created_at?: string | null
          full_name?: string | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          total_earnings?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          locked_balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          locked_balance?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          locked_balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: {
          table_name: string
          row_id: string
          column_name: string
          increment_value?: number
        }
        Returns: undefined
      }
      increment_decimal: {
        Args: {
          table_name: string
          row_id: string
          column_name: string
          increment_value: number
        }
        Returns: undefined
      }
    }
    Enums: {
      game_result: "white_wins" | "black_wins" | "draw" | "abandoned"
      game_status: "waiting" | "active" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "game_entry"
        | "game_winning"
        | "refund"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_result: ["white_wins", "black_wins", "draw", "abandoned"],
      game_status: ["waiting", "active", "completed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "game_entry",
        "game_winning",
        "refund",
      ],
    },
  },
} as const
