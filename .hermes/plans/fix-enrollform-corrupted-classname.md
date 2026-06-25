# Fix: EnrollForm.tsx Corrupted className on line 112

## Error Description
After fixing the duplicate `"use client"`, TypeScript reports errors at lines 107, 109, 284, 392 — all caused by ONE corrupted line.

## Root Cause
Line 112 has a garbled className value:
```
i === step ? 'bg-blue-600\"r-600 text-white' :
```

The `\"r-600` is corruption — it should just be a continuation of the class string. The correct value should be:
```
i === step ? 'bg-blue-600 text-white' :
```

(This matches the pattern of the line above: `i < step ? 'bg-blue-600 text-white' :`)

## Fix Required

**File: `src/app/programs/[programType]/enroll/EnrollForm.tsx`, line 112**

Change:
```
i === step ? 'bg-blue-600\"r-600 text-white' :
```

To:
```
i === step ? 'bg-blue-600 text-white' :
```

## After Completion
1. Run `npx tsc --noEmit` — should show zero errors for this file
2. Do NOT git push
