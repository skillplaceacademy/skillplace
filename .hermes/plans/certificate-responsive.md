## Task: Responsive Certificate Print Design

**Project location:** D:\web software developement\skillplaceacademy\skillplace
**File to modify:** src/app/api/certificates/[id]/route.ts (the `generateCertificateHTML` function)

### Problem
The certificate HTML is currently a fixed 1056px × 748px layout that doesn't adapt to different screen sizes. It needs to be fully responsive and look identical on any device.

### Requirements

1. **Responsive Layout**: Redesign the certificate to use percentage-based sizing and `vw`/`vh` units so it scales properly on any screen size (mobile, tablet, desktop, print).

2. **Aspect Ratio**: Maintain a consistent landscape aspect ratio (approximately 3:2 or 1056:748) across all viewports. Use CSS `aspect-ratio` or viewport units to achieve this.

3. **Print Compatibility**: The certificate must print correctly on A4/Letter landscape paper. Add proper `@page` rules (`size: A4 landscape`, margins) and ensure the content fits within printable area.

4. **Fixed Sizes on Print**: When printing, the certificate should be a fixed physical size. Use `@media print` to set fixed dimensions in `cm` or `mm` for print output.

5. **Same Design Elements**: Keep ALL existing design elements:
   - Outer and inner borders
   - Corner decorations
   - Logo circle with "S"
   - Academy name "Skillplace Academy"
   - Tagline "Learn | Practice | Get Placed"
   - "Certificate" title
   - "of Course Completion" subtitle
   - Student name (recipient)
   - Course title
   - Certificate number, date issued, duration details
   - Watermark "SKILLPLACE"
   - Print button (hidden when printing)

6. **Scaling Strategy**: 
   - On screen: certificate should be ~90vw wide (max 1056px) and scale proportionally
   - Font sizes should use `clamp()` or responsive units
   - All padding, margins, and element sizes should use `em`, `%`, or viewport units
   - On print: fixed A4 landscape, all elements fit exactly

7. **No External Dependencies**: Pure HTML + inline CSS only.

### After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
