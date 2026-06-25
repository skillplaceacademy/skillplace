# Fix: Admin Courses Page Null Title + Enrollments Join Error

## Error 1: `Cannot read properties of undefined (reading 'toLowerCase')` — Courses Page

### Root Cause
Some courses in the database have `null` or undefined `title` values. The filter on line 129-131 calls `c.title.toLowerCase()` without null-checking.

### Fix: `src/app/admin-place/courses/page.tsx`, line 129-131

Change:
```ts
const filteredCourses = courses.filter((c) =>
  c.title.toLowerCase().includes(search.toLowerCase())
)
```

To:
```ts
const filteredCourses = courses.filter((c) =>
  (c.title || '').toLowerCase().includes(search.toLowerCase())
)
```

---

## Error 2: `Could not find a relationship between 'profiles' and 'email'` — Enrollments Page

### Root Cause
The Supabase join syntax `profiles(full_name,email,phone)` requires that the foreign key relationship is properly recognized. The `enrollments` table has `user_id UUID REFERENCES public.profiles(id)`, so the join should work as `profiles(*)`.

However, the error mentions `'email'` — this suggests Supabase is interpreting `profiles(full_name,email,phone)` incorrectly because `email` is not a foreign key column. The safest approach is to use `profiles(*)` instead of listing specific columns.

### Fix: `src/app/admin-place/enrollments/page.tsx`, line 38

Change:
```ts
const data = await getRecords('enrollments', undefined, undefined, 'profiles(full_name,email,phone),courses(title)')
```

To:
```ts
const data = await getRecords('enrollments', undefined, undefined, 'profiles(*),courses(*)')
```

---

## Tasks

### Task 1: Fix null title in courses filter
Add null-safety check with `(c.title || '')`.

### Task 2: Fix enrollments join to use wildcard
Use `profiles(*),courses(*)` instead of listing specific columns.

## After Completion
1. Do NOT git push
