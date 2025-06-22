
-- Function to increment integer columns
CREATE OR REPLACE FUNCTION public.increment(
  table_name TEXT,
  row_id UUID,
  column_name TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE id = $2', 
    table_name, column_name, column_name)
  USING increment_value, row_id;
END;
$$;

-- Function to increment decimal columns
CREATE OR REPLACE FUNCTION public.increment_decimal(
  table_name TEXT,
  row_id UUID,
  column_name TEXT,
  increment_value DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE id = $2', 
    table_name, column_name, column_name)
  USING increment_value, row_id;
END;
$$;

-- Function to increment wallet balance by user_id
CREATE OR REPLACE FUNCTION public.increment_decimal(
  table_name TEXT,
  row_id UUID,
  column_name TEXT,
  increment_value DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'wallets' THEN
    EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE user_id = $2', 
      table_name, column_name, column_name)
    USING increment_value, row_id;
  ELSE
    EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE id = $2', 
      table_name, column_name, column_name)
    USING increment_value, row_id;
  END IF;
END;
$$;
