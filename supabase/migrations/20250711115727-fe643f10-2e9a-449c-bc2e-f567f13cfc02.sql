-- Create global chat table
CREATE TABLE public.global_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_chat ENABLE ROW LEVEL SECURITY;

-- Create policies for global chat
CREATE POLICY "Anyone can view global chat" ON public.global_chat
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.global_chat
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable real-time
ALTER TABLE public.global_chat REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_chat;