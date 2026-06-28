-- =====================================================
-- login_attempts table
-- Tracks login attempts for rate limiting and audit
-- =====================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- RLS: no client access
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'login_attempts' AND policyname = 'login_attempts_service_only'
  ) THEN
    CREATE POLICY login_attempts_service_only ON login_attempts
      FOR ALL USING (false);
  END IF;
END $$;
