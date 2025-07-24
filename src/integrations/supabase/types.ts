export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          is_active: boolean
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          is_active?: boolean
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          is_active?: boolean
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      fourpics_progress: {
        Row: {
          created_at: string | null
          current_level: number | null
          highest_level_reached: number | null
          id: string
          total_coins_earned: number | null
          total_coins_spent: number | null
          total_hints_used: number | null
          total_levels_completed: number | null
          total_time_played: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          highest_level_reached?: number | null
          id?: string
          total_coins_earned?: number | null
          total_coins_spent?: number | null
          total_hints_used?: number | null
          total_levels_completed?: number | null
          total_time_played?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          highest_level_reached?: number | null
          id?: string
          total_coins_earned?: number | null
          total_coins_spent?: number | null
          total_hints_used?: number | null
          total_levels_completed?: number | null
          total_time_played?: number | null
          updated_at?: string | null
          user_id?: string
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
          game_type: string | null
          id: string
          ludo_game_id: string | null
          status: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_fee: number
          expires_at?: string | null
          from_user_id: string
          game_id: string
          game_type?: string | null
          id?: string
          ludo_game_id?: string | null
          status?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          entry_fee?: number
          expires_at?: string | null
          from_user_id?: string
          game_id?: string
          game_type?: string | null
          id?: string
          ludo_game_id?: string | null
          status?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_invitations_from_user_id_profiles_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invitations_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "chess_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invitations_to_user_id_profiles_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      global_chat: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      ludo_games: {
        Row: {
          created_at: string
          creator_id: string
          current_players: number
          current_turn: string | null
          entry_fee: number
          game_name: string | null
          game_state: Json | null
          game_status: string
          id: string
          is_friend_challenge: boolean | null
          max_players: number
          player1_id: string
          player2_id: string | null
          player3_id: string | null
          player4_id: string | null
          prize_amount: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_players?: number
          current_turn?: string | null
          entry_fee?: number
          game_name?: string | null
          game_state?: Json | null
          game_status?: string
          id?: string
          is_friend_challenge?: boolean | null
          max_players?: number
          player1_id: string
          player2_id?: string | null
          player3_id?: string | null
          player4_id?: string | null
          prize_amount?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_players?: number
          current_turn?: string | null
          entry_fee?: number
          game_name?: string | null
          game_state?: Json | null
          game_status?: string
          id?: string
          is_friend_challenge?: boolean | null
          max_players?: number
          player1_id?: string
          player2_id?: string | null
          player3_id?: string | null
          player4_id?: string | null
          prize_amount?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      ludo_moves: {
        Row: {
          created_at: string
          game_id: string
          id: string
          move_data: Json
          move_number: number
          player_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          move_data: Json
          move_number: number
          player_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          move_data?: Json
          move_number?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ludo_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "ludo_games"
            referencedColumns: ["id"]
          },
        ]
      }
      math_game_sessions: {
        Row: {
          completed: boolean
          correct_answers: number
          eliminated: boolean
          elimination_reason: string | null
          end_time: string | null
          game_data: Json | null
          id: string
          level_number: number
          questions_answered: number
          score: number
          start_time: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          correct_answers?: number
          eliminated?: boolean
          elimination_reason?: string | null
          end_time?: string | null
          game_data?: Json | null
          id?: string
          level_number: number
          questions_answered?: number
          score?: number
          start_time?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          correct_answers?: number
          eliminated?: boolean
          elimination_reason?: string | null
          end_time?: string | null
          game_data?: Json | null
          id?: string
          level_number?: number
          questions_answered?: number
          score?: number
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      math_level_completions: {
        Row: {
          accuracy: number
          completed_at: string
          correct_answers: number
          final_score: number
          id: string
          level_number: number
          points_multiplier: number
          questions_answered: number
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          accuracy: number
          completed_at?: string
          correct_answers: number
          final_score: number
          id?: string
          level_number: number
          points_multiplier: number
          questions_answered: number
          score: number
          time_taken: number
          user_id: string
        }
        Update: {
          accuracy?: number
          completed_at?: string
          correct_answers?: number
          final_score?: number
          id?: string
          level_number?: number
          points_multiplier?: number
          questions_answered?: number
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      math_level_progress: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          highest_level_reached: number | null
          id: string
          last_played_at: string | null
          levels_completed: number[] | null
          longest_streak: number | null
          overall_accuracy: number | null
          rank_title: string | null
          total_correct_answers: number | null
          total_questions_answered: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          highest_level_reached?: number | null
          id?: string
          last_played_at?: string | null
          levels_completed?: number[] | null
          longest_streak?: number | null
          overall_accuracy?: number | null
          rank_title?: string | null
          total_correct_answers?: number | null
          total_questions_answered?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          highest_level_reached?: number | null
          id?: string
          last_played_at?: string | null
          levels_completed?: number[] | null
          longest_streak?: number | null
          overall_accuracy?: number | null
          rank_title?: string | null
          total_correct_answers?: number | null
          total_questions_answered?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      math_scores: {
        Row: {
          completed_at: string
          correct_answers: number
          created_at: string
          difficulty: string
          elimination_mode: boolean | null
          final_accuracy: number | null
          game_mode: string
          hints_used: number
          id: string
          level_completed: boolean | null
          level_number: number | null
          max_streak: number
          score: number
          skips_used: number
          time_taken: number
          total_questions: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          completed_at?: string
          correct_answers?: number
          created_at?: string
          difficulty: string
          elimination_mode?: boolean | null
          final_accuracy?: number | null
          game_mode: string
          hints_used?: number
          id?: string
          level_completed?: boolean | null
          level_number?: number | null
          max_streak?: number
          score?: number
          skips_used?: number
          time_taken: number
          total_questions?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          completed_at?: string
          correct_answers?: number
          created_at?: string
          difficulty?: string
          elimination_mode?: boolean | null
          final_accuracy?: number | null
          game_mode?: string
          hints_used?: number
          id?: string
          level_completed?: boolean | null
          level_number?: number | null
          max_streak?: number
          score?: number
          skips_used?: number
          time_taken?: number
          total_questions?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      math_user_progress: {
        Row: {
          created_at: string
          current_level: number
          highest_level_reached: number
          id: string
          last_played_at: string
          longest_streak: number
          streak: number
          total_correct_answers: number
          total_questions_answered: number
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          highest_level_reached?: number
          id?: string
          last_played_at?: string
          longest_streak?: number
          streak?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          highest_level_reached?: number
          id?: string
          last_played_at?: string
          longest_streak?: number
          streak?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      tournament_participants: {
        Row: {
          entry_fee_paid: number
          id: string
          joined_at: string
          tournament_id: string
          user_id: string
          username: string
        }
        Insert: {
          entry_fee_paid?: number
          id?: string
          joined_at?: string
          tournament_id: string
          user_id: string
          username: string
        }
        Update: {
          entry_fee_paid?: number
          id?: string
          joined_at?: string
          tournament_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rewards: {
        Row: {
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          rank: number
          reward_amount: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          rank: number
          reward_amount?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          rank?: number
          reward_amount?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rewards_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_scores: {
        Row: {
          game_data: Json | null
          game_reference_id: string | null
          id: string
          is_best_score: boolean
          score: number
          submitted_at: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          game_data?: Json | null
          game_reference_id?: string | null
          id?: string
          is_best_score?: boolean
          score?: number
          submitted_at?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          game_data?: Json | null
          game_reference_id?: string | null
          id?: string
          is_best_score?: boolean
          score?: number
          submitted_at?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_scores_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          current_participants: number
          description: string | null
          end_time: string
          entry_fee: number
          game_type: string
          id: string
          max_participants: number
          prize_amount: number
          registration_deadline: string | null
          start_time: string
          status: string
          title: string
          total_prize_pool: number
          updated_at: string
          winner_id: string | null
          winner_score: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_participants?: number
          description?: string | null
          end_time: string
          entry_fee?: number
          game_type: string
          id?: string
          max_participants?: number
          prize_amount?: number
          registration_deadline?: string | null
          start_time: string
          status?: string
          title: string
          total_prize_pool?: number
          updated_at?: string
          winner_id?: string | null
          winner_score?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_participants?: number
          description?: string | null
          end_time?: string
          entry_fee?: number
          game_type?: string
          id?: string
          max_participants?: number
          prize_amount?: number
          registration_deadline?: string | null
          start_time?: string
          status?: string
          title?: string
          total_prize_pool?: number
          updated_at?: string
          winner_id?: string | null
          winner_score?: number | null
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
        Relationships: [
          {
            foreignKeyName: "fk_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_wallets_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_ranking_badges: {
        Row: {
          badge_type: string
          created_at: string
          game_type: string
          id: string
          rank: number
          score: number
          user_id: string
          week_start: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          game_type?: string
          id?: string
          rank: number
          score?: number
          user_id: string
          week_start: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          game_type?: string
          id?: string
          rank?: number
          score?: number
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      word_search_coins: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string
          game_id: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description: string
          game_id?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string
          game_id?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_search_coins_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "word_search_games"
            referencedColumns: ["id"]
          },
        ]
      }
      word_search_games: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_id: string
          current_players: number
          difficulty: string
          entry_fee: number
          game_name: string | null
          game_state: Json
          game_status: string
          grid_size: number
          id: string
          max_players: number
          player1_id: string | null
          player2_id: string | null
          player3_id: string | null
          player4_id: string | null
          prize_pool: number
          started_at: string | null
          time_limit: number
          updated_at: string
          winner_id: string | null
          word_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_id: string
          current_players?: number
          difficulty?: string
          entry_fee?: number
          game_name?: string | null
          game_state?: Json
          game_status?: string
          grid_size?: number
          id?: string
          max_players?: number
          player1_id?: string | null
          player2_id?: string | null
          player3_id?: string | null
          player4_id?: string | null
          prize_pool?: number
          started_at?: string | null
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
          word_count?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          current_players?: number
          difficulty?: string
          entry_fee?: number
          game_name?: string | null
          game_state?: Json
          game_status?: string
          grid_size?: number
          id?: string
          max_players?: number
          player1_id?: string | null
          player2_id?: string | null
          player3_id?: string | null
          player4_id?: string | null
          prize_pool?: number
          started_at?: string | null
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
          word_count?: number
        }
        Relationships: []
      }
      word_search_hints: {
        Row: {
          coins_spent: number
          created_at: string
          game_id: string | null
          hint_type: string
          id: string
          used_at: string
          user_id: string
          word_target: string
        }
        Insert: {
          coins_spent?: number
          created_at?: string
          game_id?: string | null
          hint_type: string
          id?: string
          used_at?: string
          user_id: string
          word_target: string
        }
        Update: {
          coins_spent?: number
          created_at?: string
          game_id?: string | null
          hint_type?: string
          id?: string
          used_at?: string
          user_id?: string
          word_target?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_search_hints_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "word_search_games"
            referencedColumns: ["id"]
          },
        ]
      }
      word_search_moves: {
        Row: {
          created_at: string
          direction: string
          end_position: Json
          game_id: string
          id: string
          start_position: Json
          timestamp: string
          user_id: string
          word_found: string
        }
        Insert: {
          created_at?: string
          direction: string
          end_position: Json
          game_id: string
          id?: string
          start_position: Json
          timestamp?: string
          user_id: string
          word_found: string
        }
        Update: {
          created_at?: string
          direction?: string
          end_position?: Json
          game_id?: string
          id?: string
          start_position?: Json
          timestamp?: string
          user_id?: string
          word_found?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_search_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "word_search_games"
            referencedColumns: ["id"]
          },
        ]
      }
      word_search_scores: {
        Row: {
          coins_spent: number
          coins_won: number
          completed_at: string
          created_at: string
          difficulty: string
          game_id: string | null
          game_mode: string
          grid_size: number
          hints_used: number
          id: string
          is_solo_game: boolean
          score: number
          time_taken: number
          total_words: number
          updated_at: string
          user_id: string
          username: string
          words_found: number
        }
        Insert: {
          coins_spent?: number
          coins_won?: number
          completed_at?: string
          created_at?: string
          difficulty: string
          game_id?: string | null
          game_mode: string
          grid_size: number
          hints_used?: number
          id?: string
          is_solo_game?: boolean
          score?: number
          time_taken: number
          total_words: number
          updated_at?: string
          user_id: string
          username: string
          words_found?: number
        }
        Update: {
          coins_spent?: number
          coins_won?: number
          completed_at?: string
          created_at?: string
          difficulty?: string
          game_id?: string | null
          game_mode?: string
          grid_size?: number
          hints_used?: number
          id?: string
          is_solo_game?: boolean
          score?: number
          time_taken?: number
          total_words?: number
          updated_at?: string
          user_id?: string
          username?: string
          words_found?: number
        }
        Relationships: [
          {
            foreignKeyName: "word_search_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "word_search_games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      math_level_leaderboard: {
        Row: {
          completed_levels_count: number | null
          current_level: number | null
          highest_level_reached: number | null
          last_played_at: string | null
          longest_streak: number | null
          overall_accuracy: number | null
          rank: number | null
          rank_title: string | null
          total_score: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      weekly_leaderboard: {
        Row: {
          completed_at: string | null
          difficulty: string | null
          rank: number | null
          score: number | null
          user_id: string | null
          username: string | null
          week_start: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_invite_admins: {
        Args: { user_email?: string }
        Returns: boolean
      }
      claim_tournament_reward: {
        Args: { reward_id_param: string; user_id_param: string }
        Returns: Json
      }
      complete_fourpics_level: {
        Args: {
          user_id_param: string
          level_id_param: string
          level_number_param: number
          word_param: string
          attempts_param: number
          hints_used_param: Json
          time_taken_param: number
          coins_spent_param: number
        }
        Returns: Json
      }
      complete_math_level: {
        Args: {
          target_user_id: string
          level_num: number
          level_score: number
          questions_count: number
          correct_count: number
          time_seconds: number
          multiplier: number
        }
        Returns: boolean
      }
      end_math_session: {
        Args: {
          session_uuid: string
          questions_count: number
          correct_count: number
          session_score: number
          was_eliminated?: boolean
          elimination_reason?: string
          session_data?: Json
        }
        Returns: boolean
      }
      get_fourpics_progress: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string | null
          current_level: number | null
          highest_level_reached: number | null
          id: string
          total_coins_earned: number | null
          total_coins_spent: number | null
          total_hints_used: number | null
          total_levels_completed: number | null
          total_time_played: number | null
          updated_at: string | null
          user_id: string
        }
      }
      get_top_math_users: {
        Args: { limit_count?: number }
        Returns: {
          user_id: string
          username: string
          total_score: number
          highest_level_reached: number
          total_questions_answered: number
          total_correct_answers: number
          accuracy: number
          rank: number
        }[]
      }
      get_user_math_rank: {
        Args: { target_user_id: string }
        Returns: number
      }
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
      initialize_math_progress: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          current_level: number
          highest_level_reached: number
          id: string
          last_played_at: string
          longest_streak: number
          streak: number
          total_correct_answers: number
          total_questions_answered: number
          total_score: number
          updated_at: string
          user_id: string
        }
      }
      is_admin: {
        Args: { user_email?: string }
        Returns: boolean
      }
      join_tournament: {
        Args: {
          tournament_id_param: string
          user_id_param: string
          username_param: string
        }
        Returns: Json
      }
      start_math_session: {
        Args: { target_user_id: string; level_num: number }
        Returns: string
      }
      submit_tournament_score: {
        Args: {
          tournament_id_param: string
          user_id_param: string
          score_param: number
          game_data_param?: Json
          game_reference_id_param?: string
        }
        Returns: Json
      }
      update_math_level_progress: {
        Args: {
          p_user_id: string
          p_current_level: number
          p_highest_level: number
          p_score_delta: number
          p_questions_delta: number
          p_correct_delta: number
          p_new_streak: number
          p_max_streak: number
          p_completed_levels: number[]
          p_rank_title: string
        }
        Returns: undefined
      }
      use_fourpics_hint: {
        Args: {
          user_id_param: string
          level_id_param: string
          hint_type_param: string
        }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
