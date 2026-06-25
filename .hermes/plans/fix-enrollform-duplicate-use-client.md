# Fix: EnrollForm.tsx Build Error — "Expected '</', got '{'"

## Error Description
Build error in `./src/app/programs/[programType]/enroll/EnrollForm.tsx`:
```
Expected '</', got '{'
Parsing ecmascript source code failed
```

## Root Cause
The file has DUPLICATE `'use client'` directives:
- Line 1: `'use client'` (single quotes)
- Line 3: `"use client"` (double quotes)

Turbopack's parser fails when it encounters the second `"use client"` string literal — it treats JSX content after the first directive as already started, and the second directive breaks parsing.

## Fix Required

**File: `src/app/programs/[programType]/enroll/EnrollForm.tsx`**

Remove the duplicate `"use client"` on line 3 (the one with double quotes). Keep line 1 (`'use client'`).

The result should be:
```
'use client'

import { useState } from 'react'
```

(No extra `"use client"` between them.)

## After Completion
1. Run `npx tsc --noEmit` to confirm the parse error is gone
2. Start the dev server and verify `/programs/offline/enroll` (or any programType) loads
3. Do NOT git push
