-- Program Enrollment System Migration
-- Run this SQL in your Supabase Dashboard SQL Editor

-- Add program_type column to enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Add status column with proper enum
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));

-- Add notes column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add program_type to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON enrollments(program_type);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
