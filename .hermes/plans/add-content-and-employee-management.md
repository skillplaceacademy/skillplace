# Add Back Missing Admin Features: Content Management + Employee Management

## Overview
The previous rebuild removed Content Management and Employee Management from the admin panel. Add them back with clean, simple implementations.

---

## Part 1: Content Management

### Database Tables (add to SQL migration)

Add this to `supabase/migrations/20260626_full_rebuild.sql` (or run separately if migration already ran):

```sql
-- =============================================
-- CONTENT MANAGEMENT (Courses → Modules → Lessons → Tests)
-- =============================================

-- Modules (sections within a course)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (individual items within a module)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests/Quizzes
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Questions
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[],  -- array of answer choices
  correct_answer INTEGER,  -- index of correct option
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view tests" ON public.tests FOR SELECT USING (true);
CREATE POLICY "Anyone can view test questions" ON public.test_questions FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_tests_course ON public.tests(course_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);

-- Seed sample content for AutoCAD 2D course
DO $$
DECLARE
  v_course_id UUID;
  v_module_id UUID;
  v_test_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'autocad-2d' LIMIT 1;
  
  IF v_course_id IS NOT NULL THEN
    -- Module 1: Introduction
    INSERT INTO modules (course_id, title, description, order_index) VALUES
      (v_course_id, 'Introduction to AutoCAD 2D', 'Getting started with AutoCAD 2D interface and basic commands', 1)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, order_index, is_free) VALUES
      (v_module_id, 'AutoCAD Interface Overview', 'Learn the AutoCAD workspace, ribbon, toolbars, and navigation.', 1, true),
      (v_module_id, 'Drawing Commands - Line & Circle', 'Master basic drawing commands: LINE, CIRCLE, ARC, and POLYGON.', 2, false),
      (v_module_id, 'Editing Commands - Trim & Extend', 'Use TRIM, EXTEND, MOVE, COPY, and SCALE to edit drawings.', 3, false);
    
    -- Module 2: Advanced Drawing
    INSERT INTO modules (course_id, title, description, order_index) VALUES
      (v_course_id, 'Advanced Drawing Techniques', 'Layers, blocks, dimensions, and annotations', 2)
    RETURNING id INTO v_module_id;
    
    INSERT INTO lessons (module_id, title, content, order_index, is_free) VALUES
      (v_module_id, 'Working with Layers', 'Create and manage layers for organized drawings.', 1, false),
      (v_module_id, 'Blocks and References', 'Create reusable blocks and external references.', 2, false),
      (v_module_id, 'Dimensions and Annotations', 'Add dimensions, text, and hatch patterns.', 3, false);
    
    -- Test
    INSERT INTO tests (course_id, title, description, passing_score) VALUES
      (v_course_id, 'AutoCAD 2D Final Assessment', 'Test your knowledge of AutoCAD 2D fundamentals', 70)
    RETURNING id INTO v_test_id;
    
    INSERT INTO test_questions (test_id, question, options, correct_answer, order_index) VALUES
      (v_test_id, 'Which command is used to draw a straight line?', ARRAY['CIRCLE', 'LINE', 'ARC', 'POLYGON'], 1, 1),
      (v_test_id, 'What is the shortcut for TRIM?', ARRAY['T', 'TR', 'TM', 'TRIM'], 1, 2),
      (v_test_id, 'Which panel contains layer properties?', ARRAY['Home', 'Insert', 'Annotate', 'View'], 0, 3);
  END IF;
END $$;
```

---

## Part 2: Employee Management

### Database Tables

```sql
-- =============================================
-- EMPLOYEE MANAGEMENT
-- =============================================

-- Employees (staff/instructors)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'instructor' CHECK (role IN ('admin', 'instructor', 'counselor', 'support')),
  department TEXT,  -- civil, mechanical, electrical, electronics, soft-skills
  bio TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Permissions (what each employee can do)
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  can_manage_courses BOOLEAN DEFAULT false,
  can_manage_programs BOOLEAN DEFAULT false,
  can_manage_enrollments BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  can_manage_content BOOLEAN DEFAULT false,
  can_manage_payments BOOLEAN DEFAULT false,
  can_manage_leads BOOLEAN DEFAULT false,
  can_manage_employees BOOLEAN DEFAULT false,
  UNIQUE(employee_id)
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Anyone can view employee_permissions" ON public.employee_permissions FOR SELECT USING (true);

-- Seed sample employees
INSERT INTO public.employees (name, email, phone, role, department, bio) VALUES
  ('Rajesh Kumar', 'rajesh@skillplace.academy', '9876543210', 'admin', 'civil', 'Senior civil engineer with 15+ years experience in structural design and AutoCAD training.'),
  ('Sneha Patel', 'sneha@skillplace.academy', '9123456789', 'instructor', 'electronics', 'Industrial automation expert. Specializes in PLC, SCADA, and HMI systems.'),
  ('Amit Singh', 'amit@skillplace.academy', '9988776655', 'instructor', 'mechanical', 'Mechanical design engineer. Expert in SolidWorks, GD&T, and production drawing.'),
  ('Priya Sharma', 'priya@skillplace.academy', '9765432108', 'counselor', NULL, 'Career counselor and soft skills trainer. Helps students with interview preparation.'),
  ('Vikram Dubey', 'vikram@skillplace.academy', '9876501234', 'instructor', 'electrical', 'Electrical systems designer. Expert in LT/HT, panel design, and solar systems.')
ON CONFLICT (email) DO NOTHING;

-- Assign permissions
INSERT INTO public.employee_permissions (employee_id, can_manage_courses, can_manage_programs, can_manage_enrollments, can_manage_students, can_manage_content, can_manage_payments, can_manage_leads, can_manage_employees)
SELECT id, true, true, true, true, true, true, true, true FROM employees WHERE role = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.employee_permissions (employee_id, can_manage_courses, can_manage_programs, can_manage_enrollments, can_manage_students, can_manage_content, can_manage_payments, can_manage_leads, can_manage_employees)
SELECT id, true, true, true, true, true, false, false, false FROM employees WHERE role = 'instructor'
ON CONFLICT DO NOTHING;

INSERT INTO public.employee_permissions (employee_id, can_manage_courses, can_manage_programs, can_manage_enrollments, can_manage_students, can_manage_content, can_manage_payments, can_manage_leads, can_manage_employees)
SELECT id, false, false, false, false, false, false, true, false FROM employees WHERE role = 'counselor'
ON CONFLICT DO NOTHING;
```

---

## Part 3: Admin Pages

### Content Management Page (`src/app/admin-place/content/page.tsx`)

Simple content management with nested structure:
- **List view**: Shows courses → modules → lessons in a tree/accordion
- **Actions**: Add/Edit/Delete modules and lessons
- **Test Manager**: Create tests with questions

UI Layout:
```
Content Management
├── Course: AutoCAD 2D
│   ├── Module 1: Introduction to AutoCAD 2D
│   │   ├── Lesson: AutoCAD Interface Overview (free)
│   │   ├── Lesson: Drawing Commands
│   │   └── Lesson: Editing Commands
│   ├── Module 2: Advanced Drawing
│   │   ├── Lesson: Working with Layers
│   │   ├── Lesson: Blocks and References
│   │   └── Lesson: Dimensions
│   └── Test: AutoCAD 2D Final Assessment
├── Course: SolidWorks
│   └── ...
```

Features:
- Select course from dropdown
- List modules with drag-or-delete
- Add module → add lessons to each module
- Video URL field for lessons
- Test builder: add questions with multiple choice

### Employee Management Page (`src/app/admin-place/employees/page.tsx`)

Simple employee management:
- **List view**: Table with name, email, role, department, status
- **Create/Edit form**: name, email, phone, role (dropdown), department (dropdown), bio, photo URL
- **Permissions matrix**: Checkboxes for each permission

UI Layout:
```
Employee Management
[Add Employee]
| Name | Email | Role | Department | Status | Actions |
|------|-------|------|------------|--------|---------|
| Rajesh Kumar | rajesh@... | Admin | Civil | Active | Edit |
| Sneha Patel | sneha@... | Instructor | Electronics | Active | Edit |
```

Features:
- Create/edit employee
- Toggle active/inactive
- Manage permissions per employee
- Role-based access (admin, instructor, counselor, support)

---

## Part 4: Update Admin Layout

Add two new links to `src/app/admin-place/layout.tsx` sidebar:
- Content Management
- Employee Management

---

## Tasks

### Task 1: Add SQL for content + employee tables
Add the SQL above to `supabase/migrations/20260626_full_rebuild.sql` (append at end).

### Task 2: Create `src/app/admin-place/content/page.tsx`
Content management page with course → module → lesson hierarchy.

### Task 3: Create `src/app/admin-place/employees/page.tsx`
Employee management page with CRUD and permissions.

### Task 4: Update `src/app/admin-place/layout.tsx`
Add "Content" and "Employees" links to sidebar.

### Task 5: Update `src/app/api/admin/route.ts`
No changes needed — the generic CRUD API already handles new tables.

### Task 6: Run `npx tsc --noEmit`

## After Completion
1. Do NOT git push
2. User needs to run the SQL in Supabase Dashboard
