# Fix: Program Detail Page - Error Handling + Graceful Fallback

## Issues
1. Program detail page crashes (Internal Server Error) when `training_programs` table doesn't exist
2. Back button also crashes because programs listing page fails
3. `getRecords` throws uncaught errors when table doesn't exist

## Root Cause
- The SQL migration hasn't been run yet, so `training_programs`, `program_courses`, `branches` tables don't exist
- `getRecords()` throws on API error, and the error isn't caught in the component
- Next.js 16 shows Internal Server Error when a client component throws during render

## Fix

### Task 1: Fix `src/app/programs/page.tsx`

Add try-catch around data fetching:

```tsx
async function fetchPrograms() {
  setLoading(true)
  try {
    const branch = branches.find(b => b.slug === selectedBranch)
    if (!branch) { setPrograms([]); setLoading(false); return }
    const data = await getRecords('training_programs', 'branch_id', branch.id)
    setPrograms(data || [])
  } catch (err) {
    console.error('Failed to fetch programs:', err)
    setPrograms([])
  }
  setLoading(false)
}
```

### Task 2: Fix `src/app/programs/[slug]/page.tsx`

Add try-catch and graceful error state:

```tsx
async function fetchProgram() {
  setLoading(true)
  setError(null)
  try {
    const programs = await getRecords('training_programs', 'slug', slug, 'branches(*)')
    if (!programs || programs.length === 0) { setLoading(false); return }
    const prog = programs[0]
    setProgram(prog)

    try {
      const programCourses = await getRecords('program_courses', 'program_id', prog.id, 'courses(*)')
      setCourses((programCourses || []).map((pc: any) => pc.courses).filter(Boolean))
    } catch (e) {
      console.error('Failed to fetch courses:', e)
      setCourses([])
    }
  } catch (err) {
    console.error('Failed to fetch program:', err)
    setError('Failed to load program. Please try again.')
  }
  setLoading(false)
}
```

And add an error state UI:
```tsx
if (error) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-4">{error}</p>
        <Link href="/programs">
          <Button>Back to Programs</Button>
        </Link>
      </div>
    </div>
  )
}
```

### Task 3: Fix `src/app/programs/[slug]/enroll/page.tsx`

Add same try-catch pattern.

### Task 4: Fix home page programs section

Wrap the programs fetch in try-catch.

### Task 5: Run `npx tsc --noEmit`

## After Completion
1. Do NOT git push
