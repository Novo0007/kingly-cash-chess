-- Lottery System Schema
-- This migration creates the core lottery system tables

-- Create lottery enum types
CREATE TYPE lottery_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('pending', 'active', 'won', 'lost');

-- Create lotteries table
CREATE TABLE IF NOT EXISTS lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_tickets INTEGER NOT NULL DEFAULT 1000,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  winning_numbers INTEGER[] DEFAULT '{}',
  jackpot_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status lottery_status NOT NULL DEFAULT 'active',
  draw_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lottery tickets table
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ticket_number VARCHAR(50) NOT NULL,
  selected_numbers INTEGER[] NOT NULL DEFAULT '{}',
  matched_numbers INTEGER[] DEFAULT '{}',
  prize_amount DECIMAL(10,2) DEFAULT 0.00,
  status ticket_status NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lottery draws table for historical records
CREATE TABLE IF NOT EXISTS lottery_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  draw_date TIMESTAMPTZ NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  total_winners INTEGER DEFAULT 0,
  total_prize_distributed DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_id ON lottery_tickets(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user_id ON lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_status ON lottery_tickets(status);
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_lottery_id ON lottery_draws(lottery_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lotteries_updated_at BEFORE UPDATE ON lotteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lottery_tickets_updated_at BEFORE UPDATE ON lottery_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample lottery data
INSERT INTO lotteries (name, description, ticket_price, max_tickets, jackpot_amount, draw_date, status) VALUES
('Mega Jackpot', 'The biggest jackpot of the year! Pick 6 numbers from 1-49', 10.00, 10000, 1000000.00, NOW() + INTERVAL '7 days', 'active'),
('Weekly Wonder', 'Weekly lottery with amazing prizes! Pick 5 numbers from 1-35', 5.00, 5000, 250000.00, NOW() + INTERVAL '3 days', 'active'),
('Daily Dream', 'Daily draws with instant results! Pick 4 numbers from 1-25', 2.00, 2000, 50000.00, NOW() + INTERVAL '1 day', 'active');

-- RLS (Row Level Security) policies
ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Public can view active lotteries
CREATE POLICY "Public can view active lotteries" ON lotteries
FOR SELECT USING (status = 'active');

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON lottery_tickets
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tickets
CREATE POLICY "Users can insert own tickets" ON lottery_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all data
CREATE POLICY "Admins can view all lotteries" ON lotteries
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all tickets" ON lottery_tickets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all draws" ON lottery_draws
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
  )
);

-- Admins can manage admin roles
CREATE POLICY "Admins can manage admin roles" ON admin_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
  )
);
