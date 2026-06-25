# Program Enrollment System — Full Feature Plan

## Project Location
D:\web software developement\skillplaceacademy\skillplace

## Overview
Build a complete "Our Programs" enrollment system where:
1. Students browse programs (Online, Offline, Hybrid, Single Course)
2. Students apply/join a program via enrollment form
3. Admin manages programs and student enrollments
4. Course pages show enrollment options
5. Different program types with different join flows

---

## Program Types

### 1. Online Program
- Fully online learning
- Features: Course access, online doubt sessions, certificate, resume building, interview prep

### 2. Offline Program (Most Popular)
- In-person classes with placement support
- Features: 100% job assistance, soft skills, live classes, site visits, internship

### 3. Hybrid Program
- Online + In-person combined
- Features: Best of both worlds, flexible schedule, offline practicals

### 4. Single Course
- Individual course enrollment
- Features: Course certificate, project work, doubt sessions

---

## Pages to Create/Modify

### 1. `src/app/programs/page.tsx` (NEW — Programs listing page)

A dedicated page (accessible from Navbar "Programs" link):
- Hero section with title
- Grid of 4 program cards (Online, Offline, Hybrid, Single Course)
- Each card shows: icon, name, description, features list, price, "Join This Program" button
- "Join This Program" opens an enrollment modal/form

### 2. `src/app/programs/[programType]/page.tsx` (NEW — Program detail page)

Dynamic route for each program type:
- Detailed program info
- What's included
- Curriculum/topics covered
- Duration
- Career outcomes
- "Join Now" button (sticky at bottom on mobile)
- FAQ section

### 3. `src/components/programs/EnrollModal.tsx` (NEW — Enrollment form modal)

A modal/form that opens when student clicks "Join This Program":
- **Step 1 — Personal Info:**
  - Full Name (required)
  - Email (required)
  - Phone (required)
  - Location (optional)
- **Step 2 — Program Details:**
  - Program Type (pre-selected, shown as readonly)
  - Course selection (dropdown — relevant courses for this program type)
  - Start Date preference (dropdown: immediate, next batch)
  - Any specific goal/notes (textarea)
- **Step 3 — Confirmation:**
  - Summary of selections
  - Terms acceptance checkbox
  - "Submit Application" button

On submit:
- Create/update profile with program_type
- Create enrollment record
- Show success message
- Optionally send confirmation email

### 4. `src/app/courses/[slug]/page.tsx` (MODIFY)

Add program enrollment section on course pages:
- Sidebar or CTA section: "Want to join a full program?"
- Show related programs that include this course
- "Explore Programs" link

### 5. `src/app/api/programs/enroll/route.ts` (NEW — Enrollment API)

POST endpoint that:
- Accepts enrollment data (name, email, phone, location, program_type, course_id, notes)
- Creates or updates profile with program_type
- Creates enrollment record linking student to course
- Returns success with enrollment ID

### 6. `src/app/api/programs/[programType]/route.ts` (NEW)

GET endpoint that:
- Returns program details (features, courses included, duration)
- Used for program detail page

### 7. Admin: `src/app/admin-place/programs/page.tsx` (NEW — Admin Programs Management)

- View all programs
- Create/edit programs
- View enrollments per program
- Approve/reject applications
- Export student list

### 8. Admin: `src/app/admin-place/enrollments/page.tsx` (NEW — Admin Enrollments)

- View all program enrollments
- Filter by program type, status
- Update enrollment status (pending → active → completed)
- View student details

---

## Database Changes (SQL)

```sql
-- Add program_type to profiles (if not already added)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Create enrollments table with program tracking (if not exists)
-- Note: enrollments table already exists in this project
-- Add program_type column to enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS program_type TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON enrollments(program_type);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
```

---

## SQL to Run in Supabase Dashboard

```sql
-- Add program_type column to enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS program_type TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add program_type to profiles if not already present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON enrollments(program_type);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
```

---

## Files to Modify

1. `src/app/page.tsx` — Update "Our Programs" section: make cards clickable, link to /programs
2. `src/app/courses/[slug]/page.tsx` — Add program enrollment CTA
3. `src/app/placements/page.tsx` — Link to programs (if relevant)
4. `src/components/layout/Navbar.tsx` — Add "Programs" link to navigation

---

## Files to Create

1. `src/app/programs/page.tsx`
2. `src/app/programs/[programType]/page.tsx`
3. `src/app/api/programs/enroll/route.ts`
4. `src/components/programs/EnrollModal.tsx`
5. `src/app/admin-place/enrollments/page.tsx`
6. `src/lib/program-data.ts` (program definitions with features, courses)

---

## UI/UX Design Notes

1. **Program Cards**: Dark gradient background, icon, feature list, "Join Program" CTA button
2. **Enrollment Modal**: Multi-step wizard with progress indicator
3. **Form**: White background, rounded inputs, clear error messages
4. **Mobile**: Full-screen modal on mobile, stacked cards
5. **Success State**: Green checkmark + "Application Submitted" message + next steps

---

## After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
