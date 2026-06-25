# Program Enrollment — Separate Page with Pre-filled User Data

## Project Location
D:\web software developement\skillplaceacademy\skillplace

## Overview
Replace the enrollment popup modal with a separate enrollment page that:
1. Fetches logged-in user's name, email from Supabase auth on the server side
2. Pre-fills the enrollment form with user data
3. Uses a dedicated route: `/programs/[programType]/enroll`

## Files to Create/Modify

### 1. `src/app/programs/[programType]/enroll/page.tsx` (NEW — Server Component)

This is a **server component** that:
- Uses `createServerClient` from `@supabase/ssr` to fetch user server-side
- If user is not logged in, redirect to `/login?redirect=/programs/[programType]/enroll`
- Fetches user profile from `profiles` table (name, email, phone, location)
- Passes user data as props to a client component (EnrollForm)

```tsx
// Server component
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EnrollForm from './EnrollForm'
import { getProgramBySlug } from '@/lib/program-data'

export default async function EnrollPage({ params }: { params: Promise<{ programType: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, location')
    .eq('id', user.id)
    .single()
  
  const { programType } = await params
  const program = getProgramBySlug(programType)
  
  if (!program) redirect('/programs')
  
  const userData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    email: profile?.email || user.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
  }
  
  return <EnrollForm program={program} userData={userData} />
}
```

### 2. `src/app/programs/[programType]/enroll/EnrollForm.tsx` (NEW — Client Component)

The enrollment form (client component with `'use client'`):
- Receives `program` and `userData` as props
- Pre-fills form with user's name, email, phone, location (read-only for name/email if logged in)
- Additional fields:
  - Course selection dropdown (courses relevant to this program)
  - Start date preference (Immediate / Next Batch / Specific Date)
  - Goal/notes (textarea)
  - Terms acceptance checkbox
- Submit button

On submit:
- POST to `/api/programs/enroll` with all form data
- On success: redirect to `/student/dashboard` or `/student/my-courses` with success toast
- On error: show error message

### 3. `src/app/programs/[programType]/enroll/EnrollForm.tsx` — Full Layout

Design:
- Two-column layout on desktop
- **Left column (40%)**: Program summary card
  - Program name, icon, description
  - Duration
  - Key features (5-6 items)
  - "Admissions Open" badge
- **Right column (60%)**: Enrollment form
  - Step 1: Personal Info (pre-filled, email read-only)
  - Step 2: Program selection
  - Step 3: Goals & submit
  - Success/error states

### 4. `src/app/programs/[programType]/page.tsx` (MODIFY)

- Change "Join Now" buttons from opening modal to linking to `/programs/[programType]/enroll`
- Remove `EnrollModal` import and usage
- Replace button: `<Link href={\`/programs/${programType}/enroll\`}>Join Now</Link>`

### 5. `src/app/api/programs/enroll/route.ts` (MODIFY)

Enhance to:
- Get authenticated user from request (use server-side supabase client with service role)
- Accept all form fields
- Create/update profile with program_type
- Create enrollment record
- Return success with enrollment ID

### 6. `src/lib/supabase/server.ts` or `createServerClient` helper

Ensure there's a server-side supabase client that supports cookie-based auth:

```ts
// src/lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { /* cookie config */ }
  )
```

---

## After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
