-- Drop ALL existing tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS public.test_questions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.employee_permissions CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.program_courses CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.training_programs CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- BRANCHES (Civil, Mechanical, etc.)
-- =============================================
CREATE TABLE public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COURSES (Individual courses for direct sale)
-- =============================================
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  duration_hours INTEGER,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRAINING PROGRAMS (Job-oriented programs)
-- =============================================
CREATE TABLE public.training_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  program_type TEXT NOT NULL CHECK (program_type IN ('online', 'offline', 'hybrid')),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  duration_weeks INTEGER,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROGRAM COURSES (Which courses belong to which program)
-- =============================================
CREATE TABLE public.program_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(program_id, course_id)
);

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENROLLMENTS (For training programs)
-- =============================================
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  notes TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);

-- =============================================
-- INDIVIDUAL COURSE PURCHASES
-- =============================================
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TESTIMONIALS
-- =============================================
CREATE TABLE public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_photo TEXT,
  course_name TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEADS
-- =============================================
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE RLS
-- =============================================
-- Drop all policies if they exist (for idempotent migration)
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active programs" ON public.training_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view program courses" ON public.program_courses FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Anyone can view enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update enrollments" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Anyone can view purchases" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_courses_branch ON public.courses(branch_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_branch ON public.training_programs(branch_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_type ON public.training_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_program_courses_program ON public.program_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON public.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON public.purchases(course_id);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO public.branches (name, slug, description, icon) VALUES
  ('Civil Engineering', 'civil', 'Civil design, drafting, and execution courses', 'HardHat'),
  ('Mechanical Engineering', 'mechanical', 'Mechanical design and manufacturing courses', 'Wrench'),
  ('Electrical Engineering', 'electrical', 'Electrical systems and design courses', 'Zap'),
  ('Electronics', 'electronics', 'Industrial electronics and automation courses', 'Cpu')
ON CONFLICT (slug) DO NOTHING;

-- Civil courses
INSERT INTO public.courses (title, slug, description, short_description, price, duration_hours, level, branch_id) VALUES
  ('AutoCAD 2D', 'autocad-2d', 'Master 2D drafting with AutoCAD. Learn floor plans, sections, and engineering drawings.', 'Complete 2D drafting course', 4999, 40, 'beginner', (SELECT id FROM branches WHERE slug='civil')),
  ('AutoCAD 3D', 'autocad-3d', 'Learn 3D modeling in AutoCAD. Create 3D building models and structural components.', '3D modeling with AutoCAD', 5999, 50, 'intermediate', (SELECT id FROM branches WHERE slug='civil')),
  ('Revit Architecture', 'revit-architecture', 'Master BIM with Revit Architecture. Design 3D buildings with parametric components.', 'Complete Revit BIM course', 7999, 60, 'intermediate', (SELECT id FROM branches WHERE slug='civil')),
  ('Quantity Estimation', 'quantity-estimation', 'Estimate quantities for construction projects. Material takeoff and cost calculation.', 'Quantity estimation and takeoff', 3999, 30, 'beginner', (SELECT id FROM branches WHERE slug='civil')),
  ('BOQ Preparation', 'boq-preparation', 'Prepare Bill of Quantities for construction tenders. Rate analysis and pricing.', 'BOQ and rate analysis', 4499, 25, 'intermediate', (SELECT id FROM branches WHERE slug='civil')),
  ('Site Execution Basics', 'site-execution-basics', 'Understand construction site execution. Foundation, RCC, masonry, quality control.', 'Site execution fundamentals', 5499, 35, 'beginner', (SELECT id FROM branches WHERE slug='civil'))
ON CONFLICT (slug) DO NOTHING;

-- Mechanical courses
INSERT INTO public.courses (title, slug, description, short_description, price, duration_hours, level, branch_id) VALUES
  ('AutoCAD Mechanical', 'autocad-mechanical', 'Mechanical drafting with AutoCAD. Machine parts, assemblies, production drawings.', 'Professional mechanical drafting', 4999, 40, 'beginner', (SELECT id FROM branches WHERE slug='mechanical')),
  ('SolidWorks', 'solidworks', '3D CAD modeling with SolidWorks. Part design, assemblies, sheet metal, simulation.', 'Complete SolidWorks 3D modeling', 8999, 70, 'intermediate', (SELECT id FROM branches WHERE slug='mechanical')),
  ('GD&T Basics', 'gdt-basics', 'Geometric Dimensioning and Tolerancing for mechanical design drawings.', 'GD&T fundamentals', 3499, 20, 'intermediate', (SELECT id FROM branches WHERE slug='mechanical')),
  ('Production Drawing Reading', 'production-drawing-reading', 'Read and interpret production drawings. GD&T, tolerances, surface finish.', 'Read production drawings', 2999, 15, 'beginner', (SELECT id FROM branches WHERE slug='mechanical'))
ON CONFLICT (slug) DO NOTHING;

-- Electrical courses
INSERT INTO public.courses (title, slug, description, short_description, price, duration_hours, level, branch_id) VALUES
  ('AutoCAD Electrical', 'autocad-electrical', 'Electrical schematic design with AutoCAD Electrical. Control panels and wiring.', 'Electrical schematic design', 5499, 40, 'beginner', (SELECT id FROM branches WHERE slug='electrical')),
  ('LT/HT Systems', 'lt-ht-systems', 'Low Tension and High Tension power systems. Distribution, protection, switchgear.', 'LT/HT power distribution', 6499, 45, 'intermediate', (SELECT id FROM branches WHERE slug='electrical')),
  ('Panel Design', 'panel-design', 'Design electrical control panels. Layout, component selection, wiring.', 'Control panel design', 5999, 35, 'intermediate', (SELECT id FROM branches WHERE slug='electrical')),
  ('Solar Design', 'solar-design', 'Design solar PV systems. Panel sizing, inverter selection, grid-tie configuration.', 'Solar PV system design', 4999, 30, 'beginner', (SELECT id FROM branches WHERE slug='electrical')),
  ('PLC Basics', 'plc-basics', 'Programmable Logic Controllers. Ladder logic programming for industrial automation.', 'PLC programming fundamentals', 5499, 40, 'intermediate', (SELECT id FROM branches WHERE slug='electrical'))
ON CONFLICT (slug) DO NOTHING;

-- Electronics courses
INSERT INTO public.courses (title, slug, description, short_description, price, duration_hours, level, branch_id) VALUES
  ('PLC Programming', 'plc-programming', 'Advanced PLC programming. Structured text, function blocks, industrial comms.', 'Advanced PLC programming', 6999, 50, 'intermediate', (SELECT id FROM branches WHERE slug='electronics')),
  ('HMI', 'hmi', 'Human Machine Interface design. Screen development, alarms, data logging.', 'HMI design for automation', 5499, 30, 'intermediate', (SELECT id FROM branches WHERE slug='electronics')),
  ('SCADA', 'scada', 'Supervisory Control and Data Acquisition. SCADA system design and deployment.', 'SCADA system design', 7499, 45, 'advanced', (SELECT id FROM branches WHERE slug='electronics')),
  ('Industrial Sensors', 'industrial-sensors', 'Industrial sensors and instrumentation. Proximity, temperature, pressure.', 'Industrial sensors course', 3999, 25, 'beginner', (SELECT id FROM branches WHERE slug='electronics')),
  ('VFD', 'vfd', 'Variable Frequency Drives for motor control. Parameter setting and troubleshooting.', 'VFD motor control', 4499, 20, 'intermediate', (SELECT id FROM branches WHERE slug='electronics')),
  ('Industrial Networking', 'industrial-networking', 'Industrial protocols. Modbus, Profinet, Ethernet/IP, MQTT.', 'Industrial networking', 5999, 35, 'advanced', (SELECT id FROM branches WHERE slug='electronics'))
ON CONFLICT (slug) DO NOTHING;

-- Soft Skills courses
INSERT INTO public.courses (title, slug, description, short_description, price, duration_hours, level, branch_id) VALUES
  ('Resume Building', 'resume-building', 'Create an ATS-friendly resume that stands out to recruiters.', 'Professional resume building', 1999, 10, 'beginner', NULL),
  ('Interview Preparation', 'interview-preparation', 'Master technical and HR interview rounds. Common questions and strategies.', 'Interview preparation', 2499, 15, 'beginner', NULL),
  ('Communication Skills', 'communication-skills', 'Professional communication. Email writing, presentations, meetings.', 'Communication skills for engineers', 1499, 8, 'beginner', NULL),
  ('LinkedIn Profile', 'linkedin-profile', 'Build a professional LinkedIn profile that attracts opportunities.', 'LinkedIn profile optimization', 1299, 5, 'beginner', NULL),
  ('Mock Interviews', 'mock-interviews', 'Practice mock interviews with industry professionals. Get feedback.', 'Mock interview sessions', 2999, 20, 'intermediate', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Training Programs
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Civil Engineering Offline Program', 'civil-offline', 'Complete civil engineering training with placement assistance. Includes all civil courses, soft skills, site visits, and 100% job assistance.', 'Civil Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='civil'), 49999, 52, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Site Visits', 'Industry Mentor', 'Internship Certificate', 'Training Completion Certificate', '2 Project Certificates', 'Resume Building', 'Interview Preparation', 'Lifetime Recording Access'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Civil Engineering Online Program', 'civil-online', 'Learn civil engineering online from anywhere. All civil courses with doubt sessions and placement support.', 'Civil Engineering Online', 'online', (SELECT id FROM branches WHERE slug='civil'), 29999, 24, ARRAY['Online Course Access', 'Doubt Sessions', 'Training Certificate', 'Project Certificate', 'Resume Building', 'Career Guidance', 'Lifetime Recording Access'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Mechanical Engineering Offline Program', 'mechanical-offline', 'Complete mechanical engineering training with hands-on practical sessions and placement support.', 'Mechanical Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='mechanical'), 44999, 48, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Hands-on Practical', 'Industry Mentor', 'Internship Certificate', 'Training Completion Certificate', 'Resume Building', 'Interview Preparation'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Electrical Engineering Offline Program', 'electrical-offline', 'Complete electrical engineering training with industrial exposure and placement assistance.', 'Electrical Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='electrical'), 44999, 48, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Panel Design Practical', 'Site Visits', 'Industry Mentor', 'Training Completion Certificate', 'Resume Building', 'Interview Preparation'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Electronics & Automation Hybrid Program', 'electronics-hybrid', 'Best of both worlds - online theory + offline practical sessions for industrial automation.', 'Electronics & Automation Hybrid', 'hybrid', (SELECT id FROM branches WHERE slug='electronics'), 39999, 36, ARRAY['Online + Offline Learning', 'PLC & SCADA Training', 'Industry Expert Mentorship', 'Site Visits', '2 Project Certificates', 'Resume Building', 'Career Guidance'])
ON CONFLICT (slug) DO NOTHING;

-- Link courses to programs
INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='civil-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='civil')
ON CONFLICT DO NOTHING;

INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='civil-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE slug IN ('resume-building','interview-preparation','communication-skills','linkedin-profile','mock-interviews')
ON CONFLICT DO NOTHING;

INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='civil-online'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='civil')
ON CONFLICT DO NOTHING;

INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='mechanical-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='mechanical')
ON CONFLICT DO NOTHING;

INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='electrical-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='electrical')
ON CONFLICT DO NOTHING;

INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='electronics-hybrid'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='electronics')
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO public.testimonials (student_name, course_name, rating, review, is_featured) VALUES
  ('Rahul Verma', 'AutoCAD 3D', 5, 'Excellent course! Got placed in a design firm within 2 months.', true),
  ('Priya Sharma', 'Revit Architecture', 5, 'Best Revit course in Bilaspur. Real project training made all the difference.', true),
  ('Amit Kumar', 'SolidWorks', 4, 'Very comprehensive. Good placement support.', true),
  ('Sneha Patel', 'PLC Programming', 5, 'From zero to confident PLC programming in 3 months.', true),
  ('Vikram Singh', 'AutoCAD Electrical', 4, 'Great course for electrical engineers.', false),
  ('Neha Gupta', 'Resume Building', 5, 'Got 10+ interview calls after this course.', false),
  ('Arjun Mehta', 'SCADA', 5, 'Advanced course with real industrial projects.', true),
  ('Kavita Dubey', 'Interview Preparation', 4, 'Mock interviews boosted my confidence.', false)
ON CONFLICT DO NOTHING;

-- Leads
INSERT INTO public.leads (name, email, phone, message, source, status) VALUES
  ('Rohit Tiwari', 'rohit.t@email.com', '9876543210', 'Interested in AutoCAD 3D course.', 'website', 'new'),
  ('Anita Desai', 'anita.d@email.com', '9123456789', 'Looking for SolidWorks weekend batch.', 'website', 'new'),
  ('Manish Kumar', 'manish.k@email.com', '9988776655', 'Want to enroll in Civil Offline Program.', 'website', 'contacted'),
  ('Pooja Bhatia', 'pooja.b@email.com', '9765432108', 'Short-term Quantity Estimation course?', 'website', 'new'),
  ('Suresh Raut', 'suresh.r@email.com', '9876501234', 'Electrical program placement assistance?', 'website', 'converted')
ON CONFLICT DO NOTHING;

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
  options TEXT[],
  correct_answer INTEGER,
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
  department TEXT,
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
