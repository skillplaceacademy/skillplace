# Schedule Feature Implementation

## Overview
Add a "Schedule" page to the admin panel that allows admins to schedule classes (online/offline/hybrid) for courses. Each scheduled class has a date, time, duration, type (online/offline/hybrid), meeting link (for online), location (for offline), and optional notes.

## Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Junction to: `D:\web software developement\skillplaceacademy\skillplace`

## Database Schema
Run this SQL in Supabase Dashboard FIRST:

```sql
CREATE TABLE public.class_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  class_type text NOT NULL CHECK (class_type IN ('online', 'offline', 'hybrid')),
  class_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  meeting_link text NULL,
  location text NULL,
  notes text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  CONSTRAINT class_schedule_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_class_schedule_course ON public.class_schedule USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_date ON public.class_schedule USING btree (class_date);
```

## Tasks

### 1. Create Admin Schedule Page
File: `src/app/admin-place/schedule/page.tsx`

Create a full CRUD page for class scheduling with:
- Stats cards (total classes, upcoming, today, by type)
- Filter by class type (online/offline/hybrid) and month
- List of scheduled classes showing: title, course name, date, time, type badge, location/meeting link
- Create/Edit dialog with fields: course selector (searchable), title, description, class type (online/offline/hybrid), date picker, start time, end time, meeting link (shown when online/hybrid), location (shown when offline/hybrid), notes, active toggle
- Delete confirmation dialog
- Quick toggle active/inactive

### 2. Add Sidebar Link
File: `src/components/layout/AdminSidebar.tsx`

Add schedule link after "Placements":
```tsx
{ href: '/admin-place/schedule', label: 'Schedule', icon: Calendar },
```
Also add `Calendar` to the lucide-react imports.

### 3. Use Existing Patterns
- Use `getRecords`, `createRecord`, `updateRecord`, `deleteRecord` from `@/lib/admin-api`
- Use the same card/table styling as other admin pages (border-slate-200, rounded-2xl, etc.)
- Use Tailwind CSS only — no inline styles
- Use lucide-react icons
- Use `'use client'` directive
- Use the same dialog pattern as other pages

### 4. Course Selector
In the create/edit dialog, add a searchable course selector:
- Search courses by title
- Show dropdown with matching results
- Display selected student info card when selected
- Allow clearing selection

### 5. Date/Time Inputs
- Use `<input type="date">` for date
- Use `<input type="time">` for start/end time
- Show these side-by-side in a grid

### 6. Conditional Fields
- Show "Meeting Link" only when class_type is 'online' or 'hybrid'
- Show "Location" only when class_type is 'offline' or 'hybrid'

## Design Requirements
- Light theme (white bg, slate-900 text)
- Stats cards with colored icon backgrounds
- Type badges: online=bg-blue-100 text-blue-700, offline=bg-green-100 text-green-700, hybrid=bg-purple-100 text-purple-700
- Upcoming classes highlighted with left border accent
- Past classes shown with reduced opacity

## DO NOT
- Do NOT git push
- Do NOT modify any other files outside the schedule feature
- Do NOT use inline styles
- Do NOT use any CSS-in-JS

## After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify with `git log --oneline -3`
3. Verify the page loads at `/admin-place/schedule`
