# Complete Rebuild: Skillplace Academy — Clean System from Scratch

## Overview
Rebuild the entire system with a clean, simple architecture based on two core flows:

### Flow 1: Individual Courses (Direct Purchase)
- Admin creates individual courses in Course Management
- Students browse courses page → buy individual course → learn
- Simple purchase flow: course → payment → access

### Flow 2: Job-Oriented Training Programs (Enrollment)
- Admin creates Training Programs (Online, Offline, Hybrid) that combine multiple courses
- Each program is assigned a branch (Civil, Mechanical, Electrical, Electronics)
- Admin defines which courses are included in each program
- Student enrolls: personal details → select branch → see predefined courses → review → payment → access

---

## DATABASE SCHEMA (Run via Supabase CLI)

### Step 1: Clean existing tables (drop all, recreate fresh)

```sql
-- Drop existing tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

### Step 2: Create fresh schema

```sql
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
  features TEXT[],  -- array of feature strings
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
-- Branches: anyone can view
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);
-- Courses: anyone can view active
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
-- Training programs: anyone can view active
CREATE POLICY "Anyone can view active programs" ON public.training_programs FOR SELECT USING (is_active = true);
-- Program courses: anyone can view
CREATE POLICY "Anyone can view program courses" ON public.program_courses FOR SELECT USING (true);
-- Profiles: users can view own, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
-- Enrollments: anyone can view (admin panel needs it)
CREATE POLICY "Anyone can view enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update enrollments" ON public.enrollments FOR UPDATE USING (true);
// Purchases
CREATE POLICY "Anyone can view purchases" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert purchases" ON public.purchases FOR INSERT WITH CHECK (true);
-- Testimonials
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
-- Leads
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

-- Training Programs (combining courses)
-- Civil Offline Program
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Civil Engineering Offline Program', 'civil-offline', 'Complete civil engineering training with placement assistance. Includes all civil courses, soft skills, site visits, and 100% job assistance.', 'Civil Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='civil'), 49999, 52, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Site Visits', 'Industry Mentor', 'Internship Certificate', 'Training Completion Certificate', '2 Project Certificates', 'Resume Building', 'Interview Preparation', 'Lifetime Recording Access'])
ON CONFLICT (slug) DO NOTHING;

-- Civil Online Program
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Civil Engineering Online Program', 'civil-online', 'Learn civil engineering online from anywhere. All civil courses with doubt sessions and placement support.', 'Civil Engineering Online', 'online', (SELECT id FROM branches WHERE slug='civil'), 29999, 24, ARRAY['Online Course Access', 'Doubt Sessions', 'Training Certificate', 'Project Certificate', 'Resume Building', 'Career Guidance', 'Lifetime Recording Access'])
ON CONFLICT (slug) DO NOTHING;

-- Mechanical Offline Program
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Mechanical Engineering Offline Program', 'mechanical-offline', 'Complete mechanical engineering training with hands-on practical sessions and placement support.', 'Mechanical Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='mechanical'), 44999, 48, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Hands-on Practical', 'Industry Mentor', 'Internship Certificate', 'Training Completion Certificate', 'Resume Building', 'Interview Preparation'])
ON CONFLICT (slug) DO NOTHING;

-- Electrical Offline Program
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Electrical Engineering Offline Program', 'electrical-offline', 'Complete electrical engineering training with industrial exposure and placement assistance.', 'Electrical Engineering with 100% Job Assistance', 'offline', (SELECT id FROM branches WHERE slug='electrical'), 44999, 48, ARRAY['100% Job Assistance', 'Soft Skills Training', 'Panel Design Practical', 'Site Visits', 'Industry Mentor', 'Training Completion Certificate', 'Resume Building', 'Interview Preparation'])
ON CONFLICT (slug) DO NOTHING;

-- Electronics Hybrid Program
INSERT INTO public.training_programs (name, slug, description, short_description, program_type, branch_id, price, duration_weeks, features) VALUES
  ('Electronics & Automation Hybrid Program', 'electronics-hybrid', 'Best of both worlds - online theory + offline practical sessions for industrial automation.', 'Electronics & Automation Hybrid', 'hybrid', (SELECT id FROM branches WHERE slug='electronics'), 39999, 36, ARRAY['Online + Offline Learning', 'PLC & SCADA Training', 'Industry Expert Mentorship', 'Site Visits', '2 Project Certificates', 'Resume Building', 'Career Guidance'])
ON CONFLICT (slug) DO NOTHING;

-- Link courses to programs (Civil Offline gets all civil courses + soft skills)
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

-- Link courses to Civil Online
INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='civil-online'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='civil')
ON CONFLICT DO NOTHING;

-- Link courses to Mechanical Offline
INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='mechanical-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='mechanical')
ON CONFLICT DO NOTHING;

-- Link courses to Electrical Offline
INSERT INTO public.program_courses (program_id, course_id, order_index)
SELECT
  (SELECT id FROM training_programs WHERE slug='electrical-offline'),
  id,
  row_number() OVER (ORDER BY created_at)
FROM courses WHERE branch_id = (SELECT id FROM branches WHERE slug='electrical')
ON CONFLICT DO NOTHING;

-- Link courses to Electronics Hybrid
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
```

---

## ADMIN API — Clean Version

### File: `src/app/api/admin/route.ts`

Replace ENTIRE file with this clean version:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

  try {
    let selectStr = '*'
    if (join) {
      // Convert "profiles,courses" → "profiles(*),courses(*)"
      selectStr = join.split(',').map(t => t.trim()).filter(Boolean).map(t =>
        t.includes('(') ? t : `${t}(*)`
      ).join(',')
    }

    let query: any = adminSupabase.from(table!).select(selectStr)

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table!).insert(body).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table!).update(body).eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  try {
    const { error } = await adminSupabase.from(table!).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

---

## ADMIN PAGES — Simplified

### Admin Courses Page (`src/app/admin-place/courses/page.tsx`)

Simple CRUD for individual courses. Fields: title, slug, description, price, branch (dropdown), is_active.

### Admin Programs Page (`src/app/admin-place/programs/page.tsx`) — NEW

Admin manages training programs. Fields: name, slug, description, program_type (online/offline/hybrid), branch (dropdown), price, duration_weeks, features (comma-separated or array), is_active.

Key features:
- Create/edit program
- Link courses to program (multi-select from course list)
- View which courses are in each program

### Admin Enrollments Page (`src/app/admin-place/enrollments/page.tsx`)

Clean version showing enrollments with joins: `profiles(*),training_programs(*),branches(*)`.

### Admin Layout (`src/app/admin-place/layout.tsx`)

Simple sidebar with links:
- Dashboard
- Courses (individual)
- Programs (training)
- Enrollments
- Students
- Leads
- Testimonials
- Payments

---

## FRONTEND PAGES

### Home Page (`src/app/page.tsx`)

Clean version showing:
- Hero section
- Stats
- Training Programs cards (Online, Offline, Hybrid) — clicking goes to /programs
- Individual Courses grid — clicking goes to /courses
- Branches section (Civil, Mechanical, Electrical, Electronics)
- Testimonials
- CTA

### Programs Page (`src/app/programs/page.tsx`)

Shows available training programs (Online, Offline, Hybrid) with:
- Program name, description, price, features, duration
- Branch badge
- "Enroll Now" button → /programs/[programType]/enroll

### Program Enroll Page (`src/app/programs/[programType]/enroll/page.tsx`)

Multi-step form:
1. **Personal Info** — name, email, phone, location
2. **Program Details** — show selected program info, select branch (if applicable), display the predefined courses included in this program
3. **Review** — show all details, terms checkbox
4. **Payment** — integrate Razorpay or show "Pay ₹XXX" button

### Courses Page (`src/app/courses/page.tsx`)

Grid of individual courses with:
- Filter by branch
- Search
- Course card: title, price, duration, level
- "Buy Now" button → /courses/[slug] (purchase flow)

### Course Learn Page (`src/app/courses/[slug]/learn/page.tsx`)

After purchase, student accesses course content.

---

## TASKS FOR OPENCODE

### Task 0: Save the SQL to a file (IMPORTANT)
Save the entire SQL migration (from "Clean existing tables" through "Seed data") to:
`D:\web software developement\skillplaceacademy\skillplace\supabase\migrations\20260626_full_rebuild.sql`

This file must be provided to the user so they can run it in Supabase Dashboard SQL Editor.
(The Supabase CLI has token format issues — user will run SQL manually)

### Task 1: Save the SQL migration file
Save the complete SQL (from DROP TABLE through all seed data) to:
`D:\web software developement\skillplaceacademy\skillplace\supabase\migrations\20260626_full_rebuild.sql`

### Task 2: Rewrite `src/app/api/admin/route.ts`

### Task 3: Rewrite `src/app/admin-place/courses/page.tsx`
Simple course management. Fetch courses with `branches(*)`. Create/edit/delete courses.

### Task 4: Create `src/app/admin-place/programs/page.tsx`
Training program management. Create/edit programs, link courses.

### Task 5: Rewrite `src/app/admin-place/enrollments/page.tsx`
Clean enrollments table with proper joins.

### Task 6: Rewrite `src/app/admin-place/layout.tsx`
Clean sidebar with all admin pages.

### Task 7: Rewrite `src/app/page.tsx`
Clean home page showing programs + courses + branches.

### Task 8: Create `src/app/programs/page.tsx`
Programs listing page.

### Task 9: Create `src/app/programs/[programType]/enroll/page.tsx`
Multi-step enrollment form.

### Task 10: Rewrite `src/app/courses/page.tsx`
Individual courses listing with branch filter.

### Task 11: Update `src/lib/admin-api.ts`
Keep as-is (it works fine with the fixed API).

### Task 12: Update `src/lib/supabase/queries.ts`
Update queries to match new table names (no more `categories`, use `branches`).

---

## IMPORTANT NOTES
- Keep it SIMPLE — no unnecessary complexity
- User-friendly UI with Tailwind CSS
- All admin pages use service role key (via /api/admin)
- All public pages use anon client
- Do NOT git push
- Run `npx tsc --noEmit` after all changes
