-- ============================================
-- Table: lessons
-- Individual video/content lessons within modules
-- Rows: 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  video_id TEXT,
  r2_source_key TEXT,
  r2_original_filename TEXT,
  stream_status TEXT DEFAULT 'pending',
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists (idempotent migration)
DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_id TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_source_key TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_original_filename TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS stream_status TEXT DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_video_id ON public.lessons(video_id) WHERE video_id IS NOT NULL;
