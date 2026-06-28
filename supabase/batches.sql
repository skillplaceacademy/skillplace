-- =====================================================
-- batches table
-- Student batch management for offline/hybrid programs
-- =====================================================

CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  program_type TEXT DEFAULT 'online_course',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for batch queries
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_is_active ON batches(is_active);
CREATE INDEX IF NOT EXISTS idx_batches_program_type ON batches(program_type);

-- RLS policies
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'batches_select'
  ) THEN
    CREATE POLICY batches_select ON batches FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'batches_insert'
  ) THEN
    CREATE POLICY batches_insert ON batches FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'batches_update'
  ) THEN
    CREATE POLICY batches_update ON batches FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'batches_delete'
  ) THEN
    CREATE POLICY batches_delete ON batches FOR DELETE
      USING (true);
  END IF;
END $$;
