# Rewrite Student Management Page — Complete Rebuild

## Task
Delete `src/app/admin-place/students/page.tsx` and rewrite from scratch. Match the database schema exactly.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Delete and Rewrite
`src/app/admin-place/students/page.tsx`

## Database Schema (MUST FOLLOW EXACTLY)

### profiles table:
```sql
CREATE TABLE profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NULL,
  phone text NULL,
  avatar_url text NULL,
  role text NULL DEFAULT 'student',
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  program_type text NULL,
  PRIMARY KEY (id),
  CHECK (role = ANY (ARRAY['student', 'admin']))
);
```

**IMPORTANT:**
- The table is called `profiles`, NOT `students`
- Students are profiles with `role = 'student'`
- Columns: `id`, `email`, `full_name`, `phone`, `avatar_url`, `role`, `is_active`, `created_at`, `updated_at`, `program_type`
- There is NO `location`, `batch_id`, `enrollments`, or `batches` table
- `program_type` is a free text field (not an enum)
- `id` is provided by the client (use `crypto.randomUUID()`) since it's not auto-generated

## Requirements

### 1. Data Fetching
- Fetch students: `getRecords('profiles', 'role', 'student')` — no joins needed
- Sort by `created_at` descending (newest first)
- Handle errors with try-catch

### 2. Search & Filter
- Search by `full_name`, `email`, `phone`
- Filter by `program_type` (distinct values from fetched data)
- Null-safe: `(s.full_name || '').toLowerCase()`

### 3. CRUD Operations
- **Create**: `createRecord('profiles', { id: crypto.randomUUID(), ...data, role: 'student' })`
- **Update**: `updateRecord('profiles', id, data)`
- **Delete**: `deleteRecord('profiles', id)` — confirm dialog first
- Toggle active/inactive status

### 4. Form Fields
- Full Name (required)
- Email (required)
- Phone (optional)
- Program Type (text input, optional)
- Active status (toggle, default true)

### 5. Table Columns
Checkbox | Name | Email | Phone | Program Type | Status | Actions

### 6. UI/UX — User Friendly
- Clean layout with search bar and filters
- Add Student button
- Status badge (green=active, gray=inactive)
- Edit and Delete icon buttons
- Bulk select with batch operations (optional)
- Empty state message
- Loading spinner

### 7. Dialog Implementation
**DO NOT use the UI library Dialog component** — it causes key warnings in Turbopack.
Use a simple div-based modal overlay instead:

```tsx
{showForm && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
      {/* dialog content with single child div */}
    </div>
  </div>
)}
```

### 8. Null Safety — ZERO ERRORS
- All strings: `(value || '')`
- All `.toLowerCase()`: `(str || '').toLowerCase()`
- All `.sort()`: null-safe comparison
- All optional chaining for nullable fields

### 9. Type Safety
- Define `Student` interface matching `profiles` schema
- No `any` types
- `npx tsc --noEmit` MUST pass

### 10. Key Prop Fix for Turbopack
**CRITICAL**: Turbopack's jsxDEV runtime strips `key` from DOM elements inside `.map()`. 
Always use `React.Fragment` with key:
```tsx
{students.map((student) => (
  <React.Fragment key={student.id}>
    <tr className="...">...</tr>
  </React.Fragment>
))}
```
Import React: `import React, { useState, useEffect } from 'react'`

### 11. Code Quality
- No TODO, FIXME, HACK comments
- No console.log
- No unused imports
- Clean, consistent code
- All async ops have try-catch

## DO NOT
- Do NOT reference `enrollments`, `batches`, `courses`, or `batches` tables
- Do NOT use `location` or `batch_id` fields
- Do NOT use the UI library `Dialog` component
- Do NOT use `StudentBatchImport` or `BatchManager` components
- Do NOT use `PROGRAM_TYPES` or `PROGRAM_TYPE_COLORS` constants (just use plain text input for program_type)

## CRITICAL INSTRUCTIONS
1. Write the ENTIRE file from scratch — do not patch the old file
2. Field names MUST match the `profiles` schema exactly
3. Write production-ready code that compiles and runs without errors
4. Run `npx tsc --noEmit` after writing and fix ALL errors
5. No shortcuts, no TODOs, no partial fixes, no console.log
6. The code must be fully functional: list, search, create, update, delete
7. All data must be null-safe
8. Use `React.Fragment key={id}` for all `.map()` calls

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify the file has no lint issues
