# Student Management Enhancement — Batches, Program Types & Certificate Issuance

## Project Location
D:\web software developement\skillplaceacademy\skillplace

## Overview
Enhance the admin student management system with:
1. Extended student fields (mobile, location, course, batch, program type)
2. Batch/Group system for organizing students
3. Batch certificate issuance (issue to all students in a batch)
4. Program type tracking (Online, Offline, Hybrid, Single Course)

---

## SQL Migrations (Run in Supabase Dashboard first)

```sql
-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_type TEXT DEFAULT 'online_course' 
  CHECK (program_type IN ('online_course', 'offline', 'hybrid', 'single_course'));

-- Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  program_type TEXT DEFAULT 'online_course' CHECK (program_type IN ('online_course', 'offline', 'hybrid', 'single_course')),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_batch_id ON profiles(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches(course_id);

-- RLS for batches
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'employee'))
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Everyone can view batches" ON public.batches FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

---

## Program Types

| Type | Description |
|------|-------------|
| `online_course` | Fully online learning |
| `offline` | In-person classes only |
| `hybrid` | Online + In-person combined |
| `single_course` | One standalone course |

---

## Files to Modify/Create

### 1. `src/lib/constants.ts` (or create if doesn't exist)

Add program type constants:

```ts
export const PROGRAM_TYPES = [
  { id: 'online_course', label: 'Online Course', icon: '💻', color: 'blue' },
  { id: 'offline', label: 'Offline', icon: '🏫', color: 'green' },
  { id: 'hybrid', label: 'Hybrid', icon: '🔄', color: 'purple' },
  { id: 'single_course', label: 'Single Course', icon: '📖', color: 'orange' },
] as const

export type ProgramType = typeof PROGRAM_TYPES[number]['id']
```

### 2. `src/app/admin-place/students/page.tsx` — MAJOR UPDATE

**Student Form Fields (updated):**
- Full Name (required)
- Email (required)
- Phone (optional)
- Location (optional — city/address)
- Course (dropdown — existing courses)
- Program Type (dropdown: Online, Offline, Hybrid, Single Course)
- Batch (dropdown — existing batches)

**Student Table Columns:**
- Name | Email | Phone | Location | Course | Program Type | Batch | Status | Actions

**New Features:**
- **Batch Add Button**: Opens `StudentBatchImport` component (CSV/text paste)
- **Filter by Batch**: Dropdown filter to show students in a specific batch
- **Filter by Program Type**: Dropdown filter
- **Select Checkbox**: Each row has a checkbox for bulk selection
- **Bulk Actions Bar**: When students are selected, show action bar with:
  - "Assign to Batch" — move selected students to a batch
  - "Issue Certificates" — opens certificate form for selected students
  - "Delete Selected" — bulk delete

**Data fetching:**
- Fetch profiles with: `*, batches(name), courses(title)`
- Filter by role = 'student'
- Support batch and program_type filters

### 3. `src/components/admin/StudentBatchImport.tsx` — NEW

A dialog component for batch student import:
- Textarea for CSV paste: `full_name, email, phone, location, program_type`
- Or simple line-by-line: just name + email per line
- Optional course enrollment dropdown
- Optional batch assignment dropdown
- Parse and validate before submit
- Show preview of students to be created
- Submit creates profile records + enrollments
- Show results: success count, duplicates skipped, errors

### 4. `src/components/admin/BatchManager.tsx` — NEW

A dialog for managing batches:
- List existing batches with student count
- Create new batch: name, description, course, program_type, start_date, end_date
- Edit/delete batches
- Click batch name to see students in it

### 5. `src/app/admin-place/students/batch/[batchId]/page.tsx` — NEW

Batch detail page:
- Show batch info (name, course, program type, dates)
- List all students in the batch
- "Issue Certificates for Batch" button — opens certificate wizard pre-filled for all batch students
- "Add Students" button — add more students to this batch
- Student table with: Name, Email, Phone, Enrollment Status, Certificate Status

### 6. `src/app/admin-place/students/page.tsx` — Add Batch Column

Update the existing students page to show batch info and program type badges.

### 7. `src/app/api/students/route.ts` — NEW (or modify existing)

API endpoint for:
- POST: Create student with all fields (phone, location, batch_id, program_type)
- POST bulk: Create multiple students at once
- GET: List students with filters (batch_id, program_type)
- PUT: Update student fields including batch assignment
- DELETE: Delete student

### 8. `src/app/api/batches/route.ts` — NEW

API for batch CRUD:
- GET: List all batches with student count
- POST: Create batch
- PUT: Update batch
- DELETE: Delete batch

### 9. `src/app/api/batches/[batchId]/students/route.ts` — NEW

- GET: List students in a specific batch

---

## UI/UX Design Notes

1. **Program Type Badges**: Show colored badges — blue (Online), green (Offline), purple (Hybrid), orange (Single Course)
2. **Batch Tags**: Show batch name as a small tag/badge next to student name
3. **Table Filters**: Top of table — two dropdowns (Batch, Program Type) + Search
4. **Bulk Select**: Checkbox in header row selects all visible students
5. **Mobile**: Cards view instead of table on small screens
6. **All Tailwind CSS** — no inline styles, no CSS-in-JS
7. **Toast notifications** for all actions (created, assigned, deleted, certificates issued)

---

## After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
