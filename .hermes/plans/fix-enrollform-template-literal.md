# Fix: EnrollForm.tsx Turbopack Parse Error — Template Literal in JSX href

## Error Description
```
./src/app/programs/[programType]/enroll/EnrollForm.tsx:284:31
Expected '</', got '{'
Parsing ecmascript source code failed
```

This is a known Turbopack bug: template literals (`${...}`) inside JSX attribute positions (like `href={...}`) can fail to parse even though the code is syntactically valid.

## Root Cause
Line 284:
```tsx
<Link
  href={`/programs/${program.slug}`}
  ...
>
```

Turbopack's parser incorrectly interprets the `${` in the template literal as JSX expression boundaries.

## Fix Required

**File: `src/app/programs/[programType]/enroll/EnrollForm.tsx`**

### Step 1: Add a variable before the `return` statement (around line 277)

After line 277 (`}`) and before `return (`, add:
```tsx
  const backUrl = `/programs/${program.slug}`
```

### Step 2: Replace the template literal in the href

Change line 284 from:
```tsx
href={`/programs/${program.slug}`}
```

To:
```tsx
href={backUrl}
```

## After Completion
1. Run `npx tsc --noEmit` — should pass
2. Restart dev server, verify `/programs/offline/enroll` loads
3. Do NOT git push
