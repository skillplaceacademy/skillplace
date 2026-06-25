# Update Admin Panel for Branch-Based Courses + Add `branch` Column to Enrollments

## Overview
The enrollment system now requires a `branch` field (Civil, Mechanical, Electrical, Electronics) so admin can manage enrollments by branch. This involves a Supabase migration, updated enrollments admin page, and optional course-by-branch management page.

## Part 1: Supabase SQL Migration

Run this SQL in Supabase Dashboard SQL Editor. Add a `branch` column to the `enrollments` table and create a `branches` reference table:

```sql
-- ============================================================
-- BRANCH-BASED ENROLLMENT SYSTEM MIGRATION
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Add branch column to enrollments table
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS branch TEXT;

-- 2. Create index on branch for filtering
CREATE INDEX IF NOT EXISTS idx_enrollments_branch ON enrollments(branch);

-- 3. Create branches reference table (for admin course management)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add branch_id to courses table (if not exists)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- 5. Create index on courses.branch_id
CREATE INDEX IF NOT EXISTS idx_courses_branch ON courses(branch_id);

-- 6. Seed branches data
INSERT INTO public.branches (name, slug, description) VALUES
  ('Civil Engineering', 'civil', 'Civil engineering courses including AutoCAD, Revit, Quantity Estimation, and Site Execution'),
  ('Mechanical Engineering', 'mechanical', 'Mechanical engineering courses including SolidWorks, GD&T, and Production Drawing'),
  ('Electrical Engineering', 'electrical', 'Electrical engineering courses including LT/HT Systems, Panel Design, Solar Design, and PLC'),
  ('Electronics', 'electronics', 'Electronics courses including PLC Programming, HMI, SCADA, VFD, and Industrial Networking')
ON CONFLICT (slug) DO NOTHING;

-- 7. Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for branches (admin-only management)
CREATE POLICY "Anyone can view branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## Part 2: Update Admin Enrollments Page

### File: `src/app/admin-place/enrollments/page.tsx`

Update the enrollments admin page to display and filter by branch.

**Changes:**

### Task 2a: Update the Enrollment interface
Add `branch: string | null` field:
```ts
interface Enrollment {
  id: string
  user_id: string
  course_id: string
  program_type: string | null
  branch: string | null    // NEW
  status: string
  notes: string | null
  enrolled_at: string
  profiles: { full_name: string; email: string; phone: string } | null
  courses: { title: string; branch_id?: string | null } | null
}
```

### Task 2b: Update the table header
Add a "Branch" column between "Program" and "Course":
```tsx
<th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Branch</th>
```

### Task 2c: Add Branch filter dropdown
Add a third filter in the filters row (after Program filter):
```tsx
<select
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
  className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="all">All Branches</option>
  <option value="civil">Civil</option>
  <option value="mechanical">Mechanical</option>
  <option value="electrical">Electrical</option>
  <option value="electronics">Electronics</option>
</select>
```

Add state: `const [branchFilter, setBranchFilter] = useState('all')`

### Task 2d: Update search to include branch
```ts
const matchesBranch = branchFilter === 'all' || e.branch === branchFilter
return matchesSearch && matchesStatus && matchesProgram && matchesBranch
```

### Task 2e: Render Branch in table cell
```tsx
<td className="px-5 py-3.5">
  <Badge className="bg-indigo-100 text-indigo-700 border-0">
    {e.branch || 'N/A'}
  </Badge>
</td>
```

### Task 2f: Update CSV export
Add 'Branch' to headers and rows:
```ts
const headers = ['Name', 'Email', 'Phone', 'Program', 'Branch', 'Course', 'Status', 'Date']
// Add e.branch || '' to rows array
```

## Part 3: New Admin Course Management with Branch Assignment

### File: `src/app/admin-place/courses/page.tsx` — Update existing

**Changes:**

### Task 3a: Add branch interface
```ts
interface Branch {
  id: string
  name: string
  slug: string
  is_active: boolean
}
```

### Task 3b: Fetch branches
In the `fetchData` function, also fetch branches:
```ts
const branchesData = await getRecords('branches')
setCategories(branchesData || [])
setBranches(branchesData || [])  // NEW
```

Add state: `const [branches, setBranches] = useState<Branch[]>([])`

### Task 3c: Add branch column to courses table header
```tsx
<th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Branch</th>
```

### Task 3d: Add branch field to the course form
When creating/editing a course, add a branch selector:
```tsx
<div>
  <label className="text-sm font-medium text-slate-700 mb-1 block">Branch</label>
  <select
    value={formData.branch_id || ''}
    onChange={(e) => updateFormData({ ...formData, branch_id: e.target.value || null })}
    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
  >
    <option value="">Select Branch</option>
    {branches.filter(b => b.is_active).map((b) => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))}
  </select>
</div>
```

Add `branch_id: string | null` to the course interface.

### Task 3e: Render branch in course table cell
Include join: change fetch to include `branches(name)`:
```ts
const data = await getRecords('courses', undefined, undefined, 'categories,branches')
```

Render:
```tsx
<td className="px-5 py-3.5 text-sm text-slate-600">
  {course.branches?.name || 'N/A'}
</td>
```

## After Completion
1. Run `npx tsc --noEmit` — fix any type errors
2. Do NOT git push
3. Provide the SQL code to the user so they can run it in Supabase Dashboard
