/*
  # Add Analytics Events and Atomic Coin Functions

  ## New Tables
  1. **analytics_events**
     - Tracks user actions and AI usage
     - Event type, metadata, and timestamps
     - Used for usage analytics and monitoring

  ## New Functions
  1. **charge_user_coins**
     - Atomic coin deduction with balance check
     - Creates transaction record
     - Prevents negative balances
     - Security definer for proper authorization

  2. **grant_user_coins**
     - Atomic coin addition
     - Creates transaction record
     - Used for subscriptions and bonuses

  3. **reset_monthly_coins**
     - Resets coins monthly based on subscription tier
     - Called by scheduled function or cron

  ## Security
  - Analytics events accessible only to owner
  - Coin functions use SECURITY DEFINER for atomic operations
  - Proper error handling for insufficient funds
*/

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);

-- Enable RLS on analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Atomic coin charge function
CREATE OR REPLACE FUNCTION public.charge_user_coins(
  p_user UUID,
  p_amount INT,
  p_type TEXT,
  p_description TEXT
)
RETURNS void AS $$
DECLARE
  v_balance INT;
BEGIN
  SELECT coin_balance INTO v_balance
  FROM profiles
  WHERE id = p_user
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_coins';
  END IF;

  UPDATE profiles
  SET coin_balance = coin_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_user;

  INSERT INTO coin_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    created_at
  ) VALUES (
    p_user,
    -p_amount,
    p_type,
    p_description,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic coin grant function
CREATE OR REPLACE FUNCTION public.grant_user_coins(
  p_user UUID,
  p_amount INT,
  p_type TEXT,
  p_description TEXT
)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user FOR UPDATE) THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  UPDATE profiles
  SET coin_balance = coin_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_user;

  INSERT INTO coin_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    created_at
  ) VALUES (
    p_user,
    p_amount,
    p_type,
    p_description,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly coins
CREATE OR REPLACE FUNCTION public.reset_monthly_coins()
RETURNS void AS $$
DECLARE
  v_profile RECORD;
  v_coins_to_grant INT;
BEGIN
  FOR v_profile IN
    SELECT id, subscription_tier, subscription_end_date
    FROM profiles
    WHERE subscription_end_date > NOW()
  LOOP
    v_coins_to_grant := CASE v_profile.subscription_tier
      WHEN 'free' THEN 10
      WHEN 'plus' THEN 50
      WHEN 'pro' THEN 150
      WHEN 'ultra' THEN 500
      ELSE 10
    END;

    UPDATE profiles
    SET coin_balance = v_coins_to_grant,
        updated_at = NOW()
    WHERE id = v_profile.id;

    INSERT INTO coin_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      created_at
    ) VALUES (
      v_profile.id,
      v_coins_to_grant,
      'subscription',
      'Monthly coin grant for ' || v_profile.subscription_tier || ' tier',
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
