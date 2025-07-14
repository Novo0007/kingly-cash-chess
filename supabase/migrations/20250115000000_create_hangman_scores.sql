-- Create hangman_scores table
CREATE TABLE IF NOT EXISTS hangman_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  words_solved integer NOT NULL DEFAULT 0,
  time_taken integer NOT NULL DEFAULT 0, -- in seconds
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS hangman_scores_user_id_idx ON hangman_scores(user_id);
CREATE INDEX IF NOT EXISTS hangman_scores_score_idx ON hangman_scores(score DESC);
CREATE INDEX IF NOT EXISTS hangman_scores_created_at_idx ON hangman_scores(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE hangman_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all hangman scores" ON hangman_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own hangman scores" ON hangman_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hangman scores" ON hangman_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hangman scores" ON hangman_scores
  FOR DELETE USING (auth.uid() = user_id);
