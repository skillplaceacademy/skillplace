-- =====================================================
-- scheduled_notifications table
-- Queue for notifications to be sent at a future time
-- =====================================================

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for cron job query
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_target ON scheduled_notifications(target_user_id);

-- RLS: only service role
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_notifications' AND policyname = 'scheduled_notifications_service_only'
  ) THEN
    CREATE POLICY scheduled_notifications_service_only ON scheduled_notifications
      FOR ALL USING (false);
  END IF;
END $$;
