-- =====================================================
-- revoked_tokens table
-- Stores revoked session tokens for logout/session invalidation
-- =====================================================

CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'logout',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens(user_id);

-- RLS: only admins/service role can read
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage revoked tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'revoked_tokens' AND policyname = 'revoked_tokens_service_only'
  ) THEN
    CREATE POLICY revoked_tokens_service_only ON revoked_tokens
      FOR ALL USING (false);
  END IF;
END $$;
