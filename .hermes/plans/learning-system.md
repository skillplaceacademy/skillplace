## Task: Create Learning Page with Course Listing + Lesson Viewer + Tests

### Overview
Build a full learning experience for enrolled users. When a user enrolls in a program and accesses `/programs/[slug]/learn`, they should see:
1. Course listing (all courses in the program)
2. Lesson viewer (video player + content)
3. Tests/quizzes after lessons

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Real path: `D:\web software developement\skillplaceacademy\skillplace`

### Database Schema (existing tables)
```sql
-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test questions table
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[], -- array of answer options
  correct_answer INTEGER, -- index of correct option
  explanation TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Test attempts table
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER,
  answers JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Program courses (junction table)
CREATE TABLE program_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0
);

-- Enrollments table (updated schema)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  notes TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  program_type TEXT
);
```

### Files to Create/Modify

#### 1. `src/app/programs/[slug]/learn/page.tsx` — Main learning page (Server Component)

This page should:
- Check if user is enrolled in the program (query enrollments table)
- If not enrolled, redirect to program page
- Fetch program details + linked courses via `program_courses` join
- Show course list with progress
- Use client component for the interactive learning part

#### 2. `src/app/programs/[slug]/learn/[courseSlug]/page.tsx` — Course learning page

This page should:
- Show course modules and lessons sidebar
- Display video player for current lesson
- Show "Take Test" button after lesson completion
- Track lesson progress in `lesson_progress` table

#### 3. `src/app/programs/[slug]/learn/[courseSlug]/[lessonSlug]/test/page.tsx` — Test page

This page should:
- Fetch test questions for the lesson
- Show questions one by one or all at once
- Submit answers and calculate score
- Store result in `test_attempts` table
- Show results with correct/incorrect answers

#### 4. `src/components/course/LearningLayout.tsx` — Layout component

- Sidebar with course modules/lessons
- Progress indicator
- Navigation between lessons

#### 5. `src/components/course/LessonPlayer.tsx` - Video player component

- HTML5 video player with `controlsList="nodownload noplaybackrate"`
- Progress tracking (saves to `lesson_progress`)
- Mark complete button

#### 6. `src/components/course/TestPlayer.tsx` - Quiz component

- Renders questions one at a time
- Timer support
- Submit handler
- Results display

### Key Implementation Details

1. **Auth check**: Verify enrollment before showing content
2. **Progress tracking**: Use `lesson_progress` table to track watched lessons
3. **Test flow**: Fetch questions → render → submit → show results
4. **Navigation**: Sidebar shows all lessons, current lesson highlighted
5. **Video protection**: `controlsList="nodownload noplaybackrate"` + `disablePictureInPicture`

### DO NOT
- Do NOT modify existing database tables
- Do NOT break the existing programs page
- Do NOT add new npm packages (use existing lucide-react icons)
- Do NOT git push

### After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Do NOT git push
