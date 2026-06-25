# Rewrite Payments Management Page — Complete Rebuild

## Task
Delete `src/app/admin-place/payments/page.tsx` and rewrite from scratch to match the `purchases` table schema.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Delete and Rewrite
`src/app/admin-place/payments/page.tsx`

## Database Schema (MUST FOLLOW EXACTLY)

### purchases table:
```sql
CREATE TABLE purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NULL DEFAULT 'INR',
  razorpay_order_id text NULL,
  razorpay_payment_id text NULL,
  razorpay_signature text NULL,
  status text NULL DEFAULT 'pending',
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  CHECK (status = ANY (ARRAY['pending', 'completed', 'failed', 'refunded']))
);
```

### profiles table:
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text NULL,
  phone text NULL,
  role text DEFAULT 'student',
  is_active boolean DEFAULT true
);
```

### courses table:
```sql
CREATE TABLE courses (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  price integer NOT NULL DEFAULT 0
);
```

## Requirements

### 1. Data Fetching
- Fetch purchases with joins: `getRecords('purchases', undefined, undefined, 'profiles(full_name,email),courses(title)')`
- Sort by `created_at` descending (newest first)
- Handle errors with try-catch

### 2. Search
- Search by student name or course title
- Null-safe: `(p.profiles?.full_name || '').toLowerCase()`

### 3. Stats Cards
- Total Revenue (completed purchases)
- Completed count
- Pending count
- This Month revenue (completed)
- Amount display: `₹{(amount / 100).toLocaleString()}` (amount is in paise)

### 4. Table Columns
Student | Course | Amount | Razorpay Order ID | Status | Date

### 5. Status Badges
- completed: green (`bg-green-100 text-green-700`)
- pending: yellow (`bg-yellow-100 text-yellow-700`)
- failed: red (`bg-red-100 text-red-700`)
- refunded: gray (`bg-slate-100 text-slate-700`)

### 6. CSV Export
- Export filtered payments to CSV
- Columns: Student, Email, Course, Amount, Status, Date

### 7. UI/UX — User Friendly
- Clean layout with stats cards
- Search bar
- Export CSV button
- Responsive table
- Empty state message
- Loading spinner

### 8. Null Safety — ZERO ERRORS
- All strings: `(value || '')`
- All `.toLowerCase()`: `(str || '').toLowerCase()`
- All `.sort()`: null-safe comparison
- All optional chaining for nullable fields

### 9. Type Safety
- Define `Purchase` interface matching `purchases` schema
- No `any` types
- `npx tsc --noEmit` MUST pass

### 10. Key Prop Fix for Turbopack
**CRITICAL**: Turbopack's jsxDEV runtime strips `key` from DOM elements inside `.map()`. 
Always use `React.Fragment` with key:
```tsx
{purchases.map((p) => (
  <React.Fragment key={p.id}>
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
- Do NOT use `payments` table — use `purchases`
- Do NOT use the UI library Dialog component
- Do NOT use `any` types

## CRITICAL INSTRUCTIONS
1. Write the ENTIRE file from scratch — do not patch the old file
2. Field names MUST match the `purchases` schema exactly
3. Write production-ready code that compiles and runs without errors
4. Run `npx tsc --noEmit` after writing and fix ALL errors
5. No shortcuts, no TODOs, no partial fixes, no console.log
6. The code must be fully functional: list, search, export
7. All data must be null-safe
8. Use `React.Fragment key={id}` for all `.map()` calls

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify the file has no lint issues
