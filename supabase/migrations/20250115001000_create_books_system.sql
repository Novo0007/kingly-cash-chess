-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  description text,
  cover_url text,
  content text NOT NULL,
  genre text NOT NULL,
  price_coins integer NOT NULL DEFAULT 100,
  pages integer DEFAULT 1,
  reading_time_minutes integer DEFAULT 30,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_books table (for purchased books)
CREATE TABLE IF NOT EXISTS user_books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reading_progress integer DEFAULT 0, -- percentage (0-100)
  last_read_at timestamp with time zone,
  is_favorite boolean DEFAULT false,
  UNIQUE(user_id, book_id)
);

-- Create user_coins table (for coin management)
CREATE TABLE IF NOT EXISTS user_coins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance integer DEFAULT 1000, -- Starting coins
  total_earned integer DEFAULT 1000,
  total_spent integer DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS books_genre_idx ON books(genre);
CREATE INDEX IF NOT EXISTS books_featured_idx ON books(is_featured);
CREATE INDEX IF NOT EXISTS books_price_idx ON books(price_coins);
CREATE INDEX IF NOT EXISTS user_books_user_id_idx ON user_books(user_id);
CREATE INDEX IF NOT EXISTS user_books_book_id_idx ON user_books(book_id);
CREATE INDEX IF NOT EXISTS user_coins_user_id_idx ON user_coins(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for books (public read access)
CREATE POLICY "Books are viewable by everyone" ON books
  FOR SELECT USING (true);

-- Create RLS policies for user_books
CREATE POLICY "Users can view their own purchased books" ON user_books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own book purchases" ON user_books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book progress" ON user_books
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_coins
CREATE POLICY "Users can view their own coins" ON user_coins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin record" ON user_coins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" ON user_coins
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample books
INSERT INTO books (title, author, description, genre, price_coins, pages, reading_time_minutes, difficulty_level, is_featured, content) VALUES
('The Art of Strategy', 'Sun Tzu', 'Master the ancient art of strategic thinking and apply it to modern life and games.', 'strategy', 150, 12, 45, 'intermediate', true, 
'# Chapter 1: Understanding Strategy

Strategy is not just about winning battles, but about understanding the battlefield itself. In games, as in life, those who can see three moves ahead will always triumph over those who react to the present moment.

## The Foundation of Strategic Thinking

Every great strategist begins with observation. Watch your opponent, understand their patterns, and learn their weaknesses. This principle applies whether you''re playing chess, planning a business venture, or navigating social situations.

## Key Principles:

1. **Know Yourself**: Understand your strengths and limitations
2. **Know Your Opponent**: Study their habits and tendencies  
3. **Control the Environment**: Shape the battlefield to your advantage
4. **Adapt and Overcome**: Be flexible in your approach

The greatest victories are won before the battle begins. By positioning yourself advantageously and forcing your opponent into unfavorable situations, you create opportunities for success.

Remember: Strategy without action is just dreaming, but action without strategy is just chaos.'),

('Programming for Beginners', 'Jane Code', 'Start your journey into the wonderful world of programming with this beginner-friendly guide.', 'technology', 200, 15, 60, 'beginner', true,
'# Welcome to Programming!

Programming is like learning a new language - one that allows you to communicate with computers and bring your ideas to life. Don''t worry if it seems intimidating at first; every expert was once a beginner.

## What is Programming?

Programming is the process of creating instructions for computers to follow. These instructions, called code, tell the computer exactly what to do step by step.

## Your First Program

Let''s start with the classic "Hello, World!" program:


print("Hello, World!")
```

This simple line tells the computer to display the text "Hello, World!" on the screen. Congratulations - you''ve just learned your first programming concept!

## Basic Concepts:

1. **Variables**: Containers that store data
2. **Functions**: Reusable blocks of code
3. **Loops**: Instructions that repeat
4. **Conditionals**: Code that makes decisions

## Getting Started:

1. Choose a programming language (Python is great for beginners)
2. Set up your development environment
3. Practice writing small programs
4. Join programming communities
5. Build projects you''re passionate about

Remember: Programming is about solving problems creatively. Start small, be patient with yourself, and celebrate every victory!'),

('Mindfulness in Daily Life', 'Dr. Sarah Peace', 'Discover the power of mindfulness and learn practical techniques for a more peaceful, focused life.', 'health', 120, 10, 35, 'beginner', false,
'# The Journey to Mindfulness

Mindfulness is the practice of being fully present in the moment, aware of where you are and what you''re doing, without being overwhelmed by what''s happening around you.

## What is Mindfulness?

Mindfulness is a basic human ability to be fully present, aware of where we are and what we''re doing, and not overly reactive or overwhelmed by what''s happening around us.

## Simple Mindfulness Exercises:

### 1. Breathing Meditation
- Find a comfortable position
- Focus on your breath
- When your mind wanders, gently return to your breath
- Start with just 5 minutes daily

### 2. Body Scan
- Lie down comfortably
- Focus attention on different parts of your body
- Notice sensations without judgment
- Move from toes to head systematically

### 3. Mindful Walking
- Walk slowly and deliberately
- Pay attention to each step
- Notice the sensation of your feet touching the ground
- Be aware of your surroundings

## Benefits of Regular Practice:

- Reduced stress and anxiety
- Improved focus and concentration
- Better emotional regulation
- Enhanced self-awareness
- Improved relationships

## Making it a Habit:

Start small - even 5 minutes a day can make a difference. The key is consistency, not duration. Set a regular time each day for your practice.

Remember: Mindfulness is not about emptying your mind, but about being aware of what''s in it.'),

('Creative Writing Secrets', 'Alex Story', 'Unlock your creative potential and learn the secrets that professional writers use to craft compelling stories.', 'writing', 180, 14, 50, 'intermediate', true,
'# The Writer''s Craft

Every great story begins with a single word, but behind that word lies technique, practice, and an understanding of what makes readers turn the page.

## The Foundation of Great Writing

Good writing is rewriting. Your first draft is just the beginning of the journey. The magic happens in the revision process, where you refine your ideas and polish your prose.

## Essential Elements of Storytelling:

### Character Development
Your characters should feel like real people with:
- Clear motivations and goals
- Flaws and strengths
- Unique voices and perspectives
- Character arcs that show growth

### Plot Structure
A compelling plot includes:
- Inciting incident that starts the story
- Rising action that builds tension
- Climax where everything comes together
- Resolution that satisfies the reader

### Setting and Atmosphere
Create immersive worlds by:
- Using sensory details
- Establishing mood through description
- Making the setting feel authentic
- Using location to enhance the story

## Writing Techniques:

1. **Show, Don''t Tell**: Use action and dialogue to reveal information
2. **Write What You Know**: Draw from personal experience
3. **Read Widely**: Learn from other writers
4. **Establish a Routine**: Write regularly, even if it''s just 15 minutes
5. **Join a Writing Community**: Get feedback and support

## Overcoming Writer''s Block:

- Change your environment
- Try writing exercises or prompts
- Take breaks and let ideas marinate
- Don''t aim for perfection in first drafts

Remember: Every published author was once unpublished. Keep writing, keep improving, and believe in your unique voice.'),

('Healthy Cooking Made Easy', 'Chef Maria', 'Learn to create delicious, nutritious meals with simple ingredients and easy-to-follow recipes.', 'lifestyle', 100, 8, 25, 'beginner', false,
'# Cooking Your Way to Health

Healthy eating doesn''t have to be complicated or boring. With the right knowledge and techniques, you can create meals that are both nutritious and delicious.

## Kitchen Basics

Before we dive into recipes, let''s set up your kitchen for success:

### Essential Tools:
- Sharp chef''s knife
- Cutting board
- Non-stick pan
- Measuring cups and spoons
- Mixing bowls

### Pantry Staples:
- Olive oil and coconut oil
- Whole grains (quinoa, brown rice)
- Legumes (beans, lentils)
- Herbs and spices
- Nuts and seeds

## Healthy Cooking Principles:

### 1. Color Your Plate
Aim for a rainbow of colors in your meals:
- Red: tomatoes, peppers, strawberries
- Orange: carrots, sweet potatoes, oranges
- Green: leafy greens, broccoli, avocados
- Purple: eggplant, berries, cabbage

### 2. Choose Whole Foods
Focus on foods that are minimally processed:
- Fresh fruits and vegetables
- Whole grains over refined grains
- Lean proteins
- Healthy fats

### 3. Cooking Methods That Preserve Nutrients:
- Steaming vegetables
- Grilling or baking proteins
- Raw preparations (salads, smoothies)
- Light sautéing with minimal oil

## Simple Recipe: Mediterranean Bowl

**Ingredients:**
- 1 cup cooked quinoa
- Mixed greens
- Cherry tomatoes
- Cucumber
- Feta cheese
- Olives
- Olive oil and lemon dressing

**Instructions:**
1. Arrange quinoa in a bowl
2. Top with fresh vegetables
3. Add feta and olives
4. Drizzle with dressing

This balanced meal provides protein, healthy fats, and plenty of nutrients!

## Meal Planning Tips:

- Plan your meals for the week
- Prep ingredients in advance
- Cook in batches
- Keep healthy snacks ready

Remember: Small changes add up to big results. Start with one healthy meal a day and build from there!');

-- Initialize coins for existing users (if any)
INSERT INTO user_coins (user_id, balance, total_earned, total_spent)
SELECT id, 1000, 1000, 0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Function to automatically create coin record for new users
CREATE OR REPLACE FUNCTION create_user_coins()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_coins (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 1000, 1000, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create coin record when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_coins();

-- Function to handle book purchases
CREATE OR REPLACE FUNCTION purchase_book(user_id_param uuid, book_id_param uuid)
RETURNS json AS $$
DECLARE
  book_price integer;
  user_balance integer;
  result json;
BEGIN
  -- Get book price
  SELECT price_coins INTO book_price FROM books WHERE id = book_id_param;
  
  -- Get user balance
  SELECT balance INTO user_balance FROM user_coins WHERE user_id = user_id_param;
  
  -- Check if user has enough coins
  IF user_balance < book_price THEN
    result := json_build_object(
      'success', false,
      'message', 'Insufficient coins',
      'required', book_price,
      'available', user_balance
    );
    RETURN result;
  END IF;
  
  -- Check if user already owns the book
  IF EXISTS (SELECT 1 FROM user_books WHERE user_id = user_id_param AND book_id = book_id_param) THEN
    result := json_build_object(
      'success', false,
      'message', 'Book already owned'
    );
    RETURN result;
  END IF;
  
  -- Deduct coins
  UPDATE user_coins 
  SET balance = balance - book_price,
      total_spent = total_spent + book_price,
      last_updated = NOW()
  WHERE user_id = user_id_param;
  
  -- Add book to user's library
  INSERT INTO user_books (user_id, book_id, purchased_at)
  VALUES (user_id_param, book_id_param, NOW());
  
  result := json_build_object(
    'success', true,
    'message', 'Book purchased successfully',
    'new_balance', user_balance - book_price
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
