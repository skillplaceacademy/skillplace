# Fix: Admin API Join Syntax + Duplicate Category Keys on Home Page

## Error 1: `column enrollments.profiles does not exist`
## Error 2: `column courses.categories does not exist`

### Root Cause
The admin API (`src/app/api/admin/route.ts`) passes the `join` parameter directly to Supabase's `.select()` method. But the frontend passes `'profiles,courses'` (comma-separated) which is invalid Supabase syntax.

Supabase requires: `'profiles(*)'` or `'profiles(full_name,email,phone),courses(title)'`

### Fix: `src/app/api/admin/route.ts`

Replace the GET handler's join logic. Instead of passing the raw join string, convert it:

```ts
// Apply joins if specified
if (join) {
  // Convert "profiles,courses" → "profiles(*),courses(*)"
  const joinTables = join.split(',').map(t => t.trim()).filter(Boolean)
  const selectStr = joinTables.map(t => {
    // If already has parentheses or is *, leave as-is
    if (t.includes('(') || t === '*') return t
    // Otherwise add (*)
    return `${t}(*)`
  }).join(',')
  query = adminSupabase.from(table!).select(selectStr)
}
```

---

## Error 3: Duplicate keys on Home page (`Civil Engineering`, `Mechanical Engineering`, etc.)

### Root Cause
The home page maps over `categories` from the database to create `departments`. The seed data likely inserted duplicate categories (the original migration already had some, and the sample data added more with the same names/slugs). Since `ON CONFLICT (slug) DO NOTHING` should prevent duplicates, the issue is likely that the original categories had different slugs or the categories table had pre-existing data.

### Fix: `src/app/page.tsx`

Change the `departments` mapping to deduplicate by name:

```ts
const departments = categories
  .filter((cat, index, self) => self.findIndex(c => c.name === cat.name) === index)
  .map((cat) => {
    // ... existing map logic
  })
```

This ensures only the first occurrence of each category name is used.

---

## Tasks

### Task 1: Fix admin API join syntax in `src/app/api/admin/route.ts`
Replace the join block (lines ~22-24) with the conversion logic above.

### Task 2: Fix duplicate categories in `src/app/page.tsx`
Add `.filter()` before `.map()` on line 73 to deduplicate by `cat.name`.

### Task 3: Fix admin enrollments page join call
In `src/app/admin-place/enrollments/page.tsx`, change:
```ts
const data = await getRecords('enrollments', undefined, undefined, 'profiles,courses')
```
To:
```ts
const data = await getRecords('enrollments', undefined, undefined, 'profiles(full_name,email,phone),courses(title)')
```

### Task 4: Fix admin courses page join call
In `src/app/admin-place/courses/page.tsx`, change:
```ts
const data = await getRecords('courses', undefined, undefined, 'categories')
```
To:
```ts
const data = await getRecords('courses', undefined, undefined, 'categories(name)')
```

## After Completion
1. Run `npx tsc --noEmit`
2. Do NOT git push
