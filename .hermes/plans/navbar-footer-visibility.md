## Task: Fix Navbar and Footer Visibility Issue — Half Page Not Visible

**Project location:** D:\web software developement\skillplaceacademy\skillplace
**Junction path:** C:uto_skillplace\skillplace

### Problem
Half of the page content is not visible. The navbar and footer are likely causing viewport issues — possibly the `min-h-screen` on `<main>` combined with `sticky` navbar is causing the content area to overflow or the body/html has overflow hidden.

### Root Cause Analysis
Check these common issues:
1. `html { font-size: 16px; }` in globals.css or inline styles may conflict with Tailwind's rem-based sizing
2. The `<main className="min-h-screen">` might not account for the sticky navbar height, causing content to be hidden behind it
3. Body might have `overflow-x: hidden` or height constraints from globals.css
4. The viewport meta tag might be causing issues on certain devices
5. Check if any CSS is causing the page to render at double height or clip content

### Files to Check/Modify

1. **`src/app/globals.css`** — Check for:
   - Any `overflow: hidden` on html/body
   - Any fixed height on body/html
   - Any `!important` overrides on overflow
   - The `font-size: 16px` on html (may conflict with Tailwind)

2. **`src/app/layout.tsx`** — Check:
   - The `<main className="min-h-screen">` — should be `min-h-[calc(100vh-4rem)]` or have `pt-16` to account for sticky navbar
   - Body tag should not have overflow hidden

3. **`src/components/layout/Navbar.tsx`** — Check:
   - The `h-16` on navbar — main content needs top padding to not be hidden behind it

### Fix Requirements

1. Ensure the body/html allows normal scrolling
2. Add `pt-16` (padding-top: 4rem) to the `<main>` element so content doesn't hide behind the sticky navbar
3. Ensure no `overflow: hidden` on body or html in globals.css
4. The footer should render naturally at the bottom of the content flow
5. Test that the full page scrolls properly with navbar at top and footer at bottom

### After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
