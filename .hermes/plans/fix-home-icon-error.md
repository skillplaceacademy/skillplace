# Fix: Home Page "Element type is invalid: expected a string but got: undefined" Error

## Error Description
Runtime error on the Home page (`src/app/page.tsx`):
```
Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.
Check the render method of `Home`.
```

Error occurs at line 169 in `src/app/page.tsx` — the `<Icon>` component renders as `undefined`.

## Root Cause
In `src/app/page.tsx`, line 153:
```tsx
const Icon = p.icon
```

The `ProgramData` type (from `src/lib/program-data.ts`) has `iconName: string` — it does NOT have an `icon` property that holds a React component. So `p.icon` is `undefined`.

The `program-data.ts` exports a helper function `getProgramIcon(iconName: string): React.ElementType` that maps the string icon name to the actual Lucide icon component.

## Fix Required

**File: `src/app/page.tsx`**

### Task 1: Update the import

Change line 23 from:
```tsx
import { programs as programData } from '@/lib/program-data'
```

To:
```tsx
import { programs as programData, getProgramIcon } from '@/lib/program-data'
```

### Task 2: Fix the icon resolution

In the Programs section (Section 3), change line 153 from:
```tsx
const Icon = p.icon
```

To:
```tsx
const Icon = getProgramIcon(p.iconName)
```

This is the ONLY place `p.icon` is used incorrectly. The other icon usages (`s.icon`, `d.icon`, `item.icon`, `c.icon`) reference objects that already have `icon` as a React component (e.g., `const stats = [{ value: '2000+', label: 'Students Trained', icon: Users }]`), so those are fine.

## After Completion
1. Run `npx tsc --noEmit` to confirm no TypeScript errors
2. Run `git log --oneline -3` to confirm no unexpected commits
3. Do NOT git push
