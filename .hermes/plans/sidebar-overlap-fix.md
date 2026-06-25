## Task: Fix Admin Sidebar Overlapping with Root Navbar

**Project location:** D:\web software developement\skillplaceacademy\skillplace
**Junction path:** C:\auto_skillplace\skillplace

### Problem
The admin sidebar (`AdminSidebar.tsx`) uses `fixed left-0 top-0 h-full z-40` which positions it at the very top of the viewport. However, the root layout (`src/app/layout.tsx`) renders a sticky `<Navbar />` at the top with `h-16` (64px height). This causes the sidebar to render BEHIND/UNDER the root navbar, making the top portion of the sidebar invisible and overlapping.

### Root Cause
- Root layout renders `<Navbar />` (h-16, sticky top-0, z-40) for ALL pages
- Admin layout renders inside `{children}` which is below the navbar
- But the sidebar inside admin layout uses `fixed top-0` — this positions relative to viewport, not parent
- Result: sidebar starts at viewport top (behind navbar), top 64px hidden

### Fix Required

**File: `src/components/layout/AdminSidebar.tsx`**

Change the sidebar positioning from:
```tsx
"fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300"
```

To:
```tsx
"fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300"
```

This makes the sidebar start right below the root navbar (top-16 = 4rem = 64px) and height adjusts to fill remaining viewport.

### After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
