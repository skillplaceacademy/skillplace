-- ============================================================
-- SAMPLE DATA FOR SKILLPLACE ACADEMY
-- Run this in Supabase Dashboard SQL Editor
-- Run the branch migration SQL first if not already done
-- ============================================================

-- 1. Insert Categories
INSERT INTO public.categories (name, slug, description, icon, order_index) VALUES
  ('Civil Engineering', 'civil', 'Civil design, drafting, and execution courses', 'HardHat', 1),
  ('Mechanical Engineering', 'mechanical', 'Mechanical design and manufacturing courses', 'Wrench', 2),
  ('Electrical Engineering', 'electrical', 'Electrical systems and design courses', 'Zap', 3),
  ('Electronics', 'electronics', 'Industrial electronics and automation courses', 'Cpu', 4),
  ('Soft Skills', 'soft-skills', 'Career and communication skills graduation', 'Users', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Branches (if not already inserted by migration)
INSERT INTO public.branches (name, slug, description) VALUES
  ('Civil Engineering', 'civil', 'Civil engineering courses including AutoCAD, Revit, Quantity Estimation, and Site Execution'),
  ('Mechanical Engineering', 'mechanical', 'Mechanical engineering courses including SolidWorks, GD&T, and Production Drawing'),
  ('Electrical Engineering', 'electrical', 'Electrical engineering courses including LT/HT Systems, Panel Design, Solar Design, and PLC'),
  ('Electronics', 'electronics', 'Electronics courses including PLC Programming, HMI, SCADA, VFD, and Industrial Networking')
ON CONFLICT (slug) DO NOTHING;

-- 3. Get branch and category IDs (we'll use subqueries)
-- Civil courses
INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'AutoCAD 2D',
  'autocad-2d',
  'Master 2D drafting with AutoCAD. Learn to create floor plans, sections, and engineering drawings.',
  'Complete 2D drafting course for civil and mechanical engineers',
  4999,
  40,
  'beginner',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'autocad-2d');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'AutoCAD 3D',
  'autocad-3d',
  'Learn 3D modeling in AutoCAT. Create 3D building models and structural components.',
  '3D modeling with AutoCAD for all engineering branches',
  5999,
  50,
  'intermediate',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'autocad-3d');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'Revit Architecture',
  'revit-architecture',
  'Master BIM with Revit Architecture. Design 3D buildings with parametric components.',
  'Complete Revit Architecture BIM course for civil engineers',
  7999,
  60,
  'intermediate',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'revit-architecture');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'Quantity Estimation',
  'quantity-estimation',
  'Learn to estimate quantities for construction projects. Material takeoff and cost calculation.',
  'Quantity estimation and material takeoff for civil engineers',
  3999,
  30,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'quantity-estimation');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'BOQ Preparation',
  'boq-preparation',
  'Prepare Bill of Quantities for construction tenders. Rate analysis and pricing.',
  'BOQ and rate analysis for civil engineering projects',
  4499,
  25,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'boq-preparation');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'civil' LIMIT 1),
  'Site Execution Basics',
  'site-execution-basics',
  'Understand construction site execution. Foundation, RCC, masonry, and quality control.',
  'Site execution fundamentals for civil engineers',
  5499,
  35,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'site-execution-basics');

-- Mechanical courses
INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'mechanical' LIMIT 1),
  'AutoCAD Mechanical',
  'autocad-mechanical',
  'Mechanical drafting with AutoCAD. Create machine parts, assemblies, and production drawings.',
  'Professional mechanical drafting with AutoCAD',
  4999,
  40,
  'beginner',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'autocad-mechanical');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'mechanical' LIMIT 1),
  'SolidWorks',
  'solidworks',
  '3D CAD modeling with SolidWorks. Part design, assemblies, sheet metal, and simulation.',
  'Complete SolidWorks 3D modeling course for mechanical engineers',
  8999,
  70,
  'intermediate',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'solidworks');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'mechanical' LIMIT 1),
  'GD&T Basics',
  'gdt-basics',
  'Geometric Dimensioning and Tolerancing for mechanical design drawings.',
  'GD&T fundamentals for mechanical engineers',
  3499,
  20,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'gdt-basics');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'mechanical' LIMIT 1),
  'Production Drawing Reading',
  'production-drawing-reading',
  'Read and interpret production drawings. GD&T, tolerances, surface finish symbols.',
  'Learn to read production drawings for manufacturing',
  2999,
  15,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'production-drawing-reading');

-- Electrical courses
INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electrical' LIMIT 1),
  'AutoCAD Electrical',
  'autocad-electrical',
  'Electrical schematic design with AutoCAD Electrical. Control panels and wiring diagrams.',
  'Electrical schematic and panel design with AutoCAD',
  5499,
  40,
  'beginner',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'autocad-electrical');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electrical' LIMIT 1),
  'LT/HT Systems',
  'lt-ht-systems',
  'Low Tension and High Tension power systems. Distribution, protection, and switchgear.',
  'LT/HT power distribution and protection systems',
  6499,
  45,
  'intermediate',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'lt-ht-systems');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electrical' LIMIT 1),
  'Panel Design',
  'panel-design',
  'Design electrical control panels. Layout, component selection, and wiring.',
  'Electrical control panel design course',
  5999,
  35,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'panel-design');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electrical' LIMIT 1),
  'Solar Design',
  'solar-design',
  'Design solar PV systems. Panel sizing, inverter selection, and grid-tie configuration.',
  'Solar PV system design for electrical engineers',
  4999,
  30,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'solar-design');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electrical' LIMIT 1),
  'PLC Basics',
  'plc-basics',
  'Programmable Logic Controllers for industrial automation. Ladder logic programming.',
  'PLC programming fundamentals for electrical engineers',
  5499,
  40,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'plc-basics');

-- Electronics courses
INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'PLC Programming',
  'plc-programming',
  'Advanced PLC programming. Structured text, function blocks, and industrial communication.',
  'Advanced PLC programming for industrial automation',
  6999,
  50,
  'intermediate',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'plc-programming');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'HMI',
  'hmi',
  'Human Machine Interface design. Screen development, alarms, and data logging.',
  'HMI design and development for industrial automation',
  5499,
  30,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'hmi');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'SCADA',
  'scada',
  'Supervisory Control and Data Acquisition. SCADA system design and deployment.',
  'SCADA system design for industrial monitoring',
  7499,
  45,
  'advanced',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'scada');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'Industrial Sensors',
  'industrial-sensors',
  'Industrial sensors and instrumentation. Proximity, temperature, pressure sensors.',
  'Industrial sensors and instrumentation course',
  3999,
  25,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'industrial-sensors');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'VFD',
  'vfd',
  'Variable Frequency Drives for motor control. Parameter setting and troubleshooting.',
  'VFD motor control fundamentals',
  4499,
  20,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'vfd');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
  'Industrial Networking',
  'industrial-networking',
  'Industrial communication protocols. Modbus, Profinet, Ethernet/IP, and MQTT.',
  'Industrial networking and communication protocols',
  5999,
  35,
  'advanced',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'industrial-networking');

-- Soft Skills courses
INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'soft-skills' LIMIT 1),
  'Resume Building',
  'resume-building',
  'Create an ATS-friendly resume that stands out to recruiters and hiring managers.',
  'Professional resume building course',
  1999,
  10,
  'beginner',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'resume-building');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'soft-skills' LIMIT 1),
  'Interview Preparation',
  'interview-preparation',
  'Master technical and HR interview rounds. Common questions and answer strategies.',
  'Complete interview preparation course',
  2499,
  15,
  'beginner',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'interview-preparation');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'soft-skills' LIMIT 1),
  'Communication Skills',
  'communication-skills',
  'Professional communication for engineers. Email writing, presentations, and meetings.',
  'Professional communication skills for engineers',
  1499,
  8,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'communication-skills');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'soft-skills' LIMIT 1),
  'LinkedIn Profile',
  'linkedin-profile',
  'Build a professional LinkedIn profile that attracts recruiters and opportunities.',
  'LinkedIn profile optimization course',
  1299,
  5,
  'beginner',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'linkedin-profile');

INSERT INTO public.courses (category_id, title, slug, description, short_description, price, duration_hours, level, is_featured, is_active)
SELECT
  (SELECT id FROM categories WHERE slug = 'soft-skills' LIMIT 1),
  'Mock Interviews',
  'mock-interviews',
  'Practice mock interviews with industry professionals. Get personalized feedback.',
  'Mock interview sessions with feedback',
  2999,
  20,
  'intermediate',
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE slug = 'mock-interviews');

-- 4. Update courses to set branch_id based on category
UPDATE courses SET branch_id = (SELECT id FROM branches WHERE slug = 'civil')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'civil') AND branch_id IS NULL;

UPDATE courses SET branch_id = (SELECT id FROM branches WHERE slug = 'mechanical')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'mechanical') AND branch_id IS NULL;

UPDATE courses SET branch_id = (SELECT id FROM branches WHERE slug = 'electrical')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'electrical') AND branch_id IS NULL;

UPDATE courses SET branch_id = (SELECT id FROM branches WHERE slug = 'electronics')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'electronics') AND branch_id IS NULL;

-- 5. Insert Testimonials
INSERT INTO public.testimonials (student_name, course_name, rating, review, is_featured, is_active) VALUES
  ('Rahul Verma', 'AutoCAD 3D', 5, 'Excellent course! The instructor explained everything clearly and the practical sessions were very helpful. Got placed in a design firm within 2 months of completion.', true, true),
  ('Priya Sharma', 'Revit Architecture', 5, 'Best Revit course in Bilaspur. Real project training made all the difference. Highly recommend for civil students!', true, true),
  ('Amit Kumar', 'SolidWorks', 4, 'Very comprehensive course. The GD&T module was particularly useful. Good placement support too.', true, true),
  ('Sneha Patel', 'PLC Programming', 5, 'From zero knowledge to confident PLC programming in just 3 months. The hands-on labs are amazing.', true, true),
  ('Vikram Singh', 'AutoCAD Electrical', 4, 'Great course for electrical engineers. The panel design module was very practical.', false, true),
  ('Neha Gupta', 'Resume Building', 5, 'This course helped me create a professional resume that got me 10+ interview calls. Thank you Skillplace!', false, true),
  ('Arjun Mehta', 'SCADA', 5, 'Advanced SCADA course with real industrial projects. The trainer has 15+ years of experience.', true, true),
  ('Kavita Dubey', 'Interview Preparation', 4, 'Mock interviews boosted my confidence. Cleared my first attempt at a core company.', false, true)
ON CONFLICT DO NOTHING;

-- 6. Insert Leads (sample inquiries)
INSERT INTO public.leads (name, email, phone, message, source, status) VALUES
  'Rohit Tiwari', 'rohit.tiwari@email.com', '9876543210', 'Interested in AutoCAD 3D course. Please share details and fees.', 'website', 'new'),
  'Anita Desai', 'anita.desai@email.com', '9123456789', 'Looking for SolidWorks course for my son. Is there a weekend batch?', 'website', 'new'),
  'Manish Kumar', 'manish.k@email.com', '9988776655', 'Want to enroll in the Offline Program - Civil Engineering. What are the batch timings?', 'website', 'contacted'),
  'Pooja Bhatia', 'pooja.b@email.com', '9765432108', 'Is there any short-term course on Quantity Estimation? I am a working professional.', 'website', 'new'),
  'Suresh Raut', 'suresh.r@email.com', '9876501234', 'I want to join the Electrical program. Do you provide placement assistance?', 'website', 'converted')
ON CONFLICT DO NOTHING;

-- 7. Verify data
SELECT 'categories' as table_name, count(*) FROM categories
UNION ALL SELECT 'branches', count(*) FROM branches
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'testimonials', count(*) FROM testimonials
UNION ALL SELECT 'leads', count(*) FROM leads;
