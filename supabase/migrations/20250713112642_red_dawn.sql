/*
  # Math Level System Database Schema

  1. New Tables
    - `math_user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `current_level` (integer, default 1)
      - `highest_level_reached` (integer, default 1)
      - `total_score` (bigint, default 0)
      - `total_questions_answered` (integer, default 0)
      - `total_correct_answers` (integer, default 0)
      - `streak` (integer, default 0)
      - `longest_streak` (integer, default 0)
      - `last_played_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `math_level_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `level_number` (integer)
      - `score` (integer)
      - `questions_answered` (integer)
      - `correct_answers` (integer)
      - `accuracy` (numeric)
      - `time_taken` (integer)
      - `points_multiplier` (numeric)
      - `final_score` (integer)
      - `completed_at` (timestamp)

    - `math_game_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `level_number` (integer)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `questions_answered` (integer)
      - `correct_answers` (integer)
      - `score` (integer)
      - `eliminated` (boolean)
      - `elimination_reason` (text)
      - `completed` (boolean)
      - `game_data` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add admin policies for system management

  3. Functions
    - `initialize_math_progress` - Initialize user progress
    - `start_math_session` - Start a game session
    - `end_math_session` - End a game session
    - `complete_math_level` - Complete a level
    - `get_top_math_users` - Get leaderboard
    - `get_user_math_rank` - Get user rank
*/

-- Create math_user_progress table
CREATE TABLE IF NOT EXISTS public.math_user_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level integer DEFAULT 1 NOT NULL,
    highest_level_reached integer DEFAULT 1 NOT NULL,
    total_score bigint DEFAULT 0 NOT NULL,
    total_questions_answered integer DEFAULT 0 NOT NULL,
    total_correct_answers integer DEFAULT 0 NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_played_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Create math_level_completions table
CREATE TABLE IF NOT EXISTS public.math_level_completions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_number integer NOT NULL,
    score integer NOT NULL,
    questions_answered integer NOT NULL,
    correct_answers integer NOT NULL,
    accuracy numeric(5,4) NOT NULL,
    time_taken integer NOT NULL,
    points_multiplier numeric(5,2) NOT NULL,
    final_score integer NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, level_number)
);

-- Create math_game_sessions table
CREATE TABLE IF NOT EXISTS public.math_game_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_number integer NOT NULL,
    start_time timestamp with time zone DEFAULT now() NOT NULL,
    end_time timestamp with time zone,
    questions_answered integer DEFAULT 0 NOT NULL,
    correct_answers integer DEFAULT 0 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    eliminated boolean DEFAULT false NOT NULL,
    elimination_reason text,
    completed boolean DEFAULT false NOT NULL,
    game_data jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.math_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_level_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.math_game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for math_user_progress
DROP POLICY IF EXISTS "Users can read their own math progress" ON public.math_user_progress;
CREATE POLICY "Users can read their own math progress" ON public.math_user_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own math progress" ON public.math_user_progress;
CREATE POLICY "Users can insert their own math progress" ON public.math_user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own math progress" ON public.math_user_progress;
CREATE POLICY "Users can update their own math progress" ON public.math_user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for math_level_completions
DROP POLICY IF EXISTS "Users can read their own level completions" ON public.math_level_completions;
CREATE POLICY "Users can read their own level completions" ON public.math_level_completions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own level completions" ON public.math_level_completions;
CREATE POLICY "Users can insert their own level completions" ON public.math_level_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for math_game_sessions
DROP POLICY IF EXISTS "Users can read their own game sessions" ON public.math_game_sessions;
CREATE POLICY "Users can read their own game sessions" ON public.math_game_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own game sessions" ON public.math_game_sessions;
CREATE POLICY "Users can insert their own game sessions" ON public.math_game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own game sessions" ON public.math_game_sessions;
CREATE POLICY "Users can update their own game sessions" ON public.math_game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_math_user_progress_user_id ON public.math_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_math_user_progress_highest_level ON public.math_user_progress(highest_level_reached DESC);
CREATE INDEX IF NOT EXISTS idx_math_user_progress_total_score ON public.math_user_progress(total_score DESC);

CREATE INDEX IF NOT EXISTS idx_math_level_completions_user_id ON public.math_level_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_math_level_completions_level ON public.math_level_completions(level_number);
CREATE INDEX IF NOT EXISTS idx_math_level_completions_completed_at ON public.math_level_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_math_game_sessions_user_id ON public.math_game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_math_game_sessions_level ON public.math_game_sessions(level_number);
CREATE INDEX IF NOT EXISTS idx_math_game_sessions_start_time ON public.math_game_sessions(start_time DESC);

-- Create the initialize_math_progress function
CREATE OR REPLACE FUNCTION public.initialize_math_progress(target_user_id uuid)
RETURNS public.math_user_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_progress public.math_user_progress;
BEGIN
    -- Check if a record already exists for the user
    SELECT * INTO user_progress FROM public.math_user_progress WHERE user_id = target_user_id;

    -- If no record exists, create a new one with default values
    IF user_progress IS NULL THEN
        INSERT INTO public.math_user_progress (
            user_id,
            current_level,
            highest_level_reached,
            total_score,
            total_questions_answered,
            total_correct_answers,
            streak,
            longest_streak,
            last_played_at
        ) VALUES (
            target_user_id,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            NOW()
        )
        RETURNING * INTO user_progress;
    END IF;

    RETURN user_progress;
END;
$$;

-- Create the start_math_session function
CREATE OR REPLACE FUNCTION public.start_math_session(target_user_id uuid, level_num integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_id uuid;
BEGIN
    INSERT INTO public.math_game_sessions (
        user_id,
        level_number,
        start_time
    ) VALUES (
        target_user_id,
        level_num,
        NOW()
    )
    RETURNING id INTO session_id;

    RETURN session_id;
END;
$$;

-- Create the end_math_session function
CREATE OR REPLACE FUNCTION public.end_math_session(
    session_uuid uuid,
    questions_count integer,
    correct_count integer,
    session_score integer,
    was_eliminated boolean DEFAULT false,
    elimination_reason text DEFAULT NULL,
    session_data jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.math_game_sessions
    SET 
        end_time = NOW(),
        questions_answered = questions_count,
        correct_answers = correct_count,
        score = session_score,
        eliminated = was_eliminated,
        elimination_reason = elimination_reason,
        completed = true,
        game_data = session_data
    WHERE id = session_uuid;

    RETURN FOUND;
END;
$$;

-- Create the complete_math_level function
CREATE OR REPLACE FUNCTION public.complete_math_level(
    target_user_id uuid,
    level_num integer,
    level_score integer,
    questions_count integer,
    correct_count integer,
    time_seconds integer,
    multiplier numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    accuracy_val numeric;
    final_score_val integer;
    current_progress public.math_user_progress;
BEGIN
    -- Calculate accuracy
    accuracy_val := CASE 
        WHEN questions_count > 0 THEN correct_count::numeric / questions_count::numeric
        ELSE 0
    END;
    
    -- Calculate final score
    final_score_val := ROUND(level_score * multiplier);

    -- Insert or update level completion
    INSERT INTO public.math_level_completions (
        user_id,
        level_number,
        score,
        questions_answered,
        correct_answers,
        accuracy,
        time_taken,
        points_multiplier,
        final_score
    ) VALUES (
        target_user_id,
        level_num,
        level_score,
        questions_count,
        correct_count,
        accuracy_val,
        time_seconds,
        multiplier,
        final_score_val
    )
    ON CONFLICT (user_id, level_number) 
    DO UPDATE SET
        score = GREATEST(math_level_completions.score, EXCLUDED.score),
        questions_answered = EXCLUDED.questions_answered,
        correct_answers = EXCLUDED.correct_answers,
        accuracy = EXCLUDED.accuracy,
        time_taken = EXCLUDED.time_taken,
        points_multiplier = EXCLUDED.points_multiplier,
        final_score = GREATEST(math_level_completions.final_score, EXCLUDED.final_score),
        completed_at = NOW();

    -- Update user progress
    SELECT * INTO current_progress FROM public.math_user_progress WHERE user_id = target_user_id;
    
    IF current_progress IS NOT NULL THEN
        UPDATE public.math_user_progress
        SET 
            current_level = GREATEST(current_level, level_num + 1),
            highest_level_reached = GREATEST(highest_level_reached, level_num),
            total_score = total_score + final_score_val,
            total_questions_answered = total_questions_answered + questions_count,
            total_correct_answers = total_correct_answers + correct_count,
            last_played_at = NOW(),
            updated_at = NOW()
        WHERE user_id = target_user_id;
    ELSE
        -- Initialize progress if it doesn't exist
        PERFORM public.initialize_math_progress(target_user_id);
        
        UPDATE public.math_user_progress
        SET 
            current_level = GREATEST(current_level, level_num + 1),
            highest_level_reached = GREATEST(highest_level_reached, level_num),
            total_score = total_score + final_score_val,
            total_questions_answered = total_questions_answered + questions_count,
            total_correct_answers = total_correct_answers + correct_count,
            last_played_at = NOW(),
            updated_at = NOW()
        WHERE user_id = target_user_id;
    END IF;

    RETURN true;
END;
$$;

-- Create the get_top_math_users function
CREATE OR REPLACE FUNCTION public.get_top_math_users(limit_count integer DEFAULT 10)
RETURNS TABLE (
    user_id uuid,
    username text,
    total_score bigint,
    highest_level_reached integer,
    total_questions_answered integer,
    total_correct_answers integer,
    accuracy numeric,
    rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        COALESCE(pr.username, 'Anonymous') as username,
        p.total_score,
        p.highest_level_reached,
        p.total_questions_answered,
        p.total_correct_answers,
        CASE 
            WHEN p.total_questions_answered > 0 THEN 
                ROUND(p.total_correct_answers::numeric / p.total_questions_answered::numeric, 4)
            ELSE 0
        END as accuracy,
        ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.highest_level_reached DESC) as rank
    FROM public.math_user_progress p
    LEFT JOIN public.profiles pr ON p.user_id = pr.id
    ORDER BY p.total_score DESC, p.highest_level_reached DESC
    LIMIT limit_count;
END;
$$;

-- Create the get_user_math_rank function
CREATE OR REPLACE FUNCTION public.get_user_math_rank(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_rank integer;
BEGIN
    SELECT rank INTO user_rank
    FROM (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_score DESC, highest_level_reached DESC) as rank
        FROM public.math_user_progress
    ) ranked
    WHERE user_id = target_user_id;

    RETURN COALESCE(user_rank, 0);
END;
$$;