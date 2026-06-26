-- Add course_id to enrollments to support both program and course enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add index for course enrollment lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- RLS policy for course enrollments
CREATE POLICY "Users can view course enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Users can insert course enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
