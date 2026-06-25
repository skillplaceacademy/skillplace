## Task: Replace window.print() with Direct PDF Download using jsPDF + html2canvas

**Project location:** D:\web software developement\skillplaceacademy\skillplace
**Junction path (use this for Write operations):** C:\auto_skillplace\skillplace

### Problem
The certificate page at `/api/certificates/[id]` currently uses `window.print()` which opens the browser's native Windows print dialog. We need to replace this with a direct PDF download using jsPDF + html2canvas.

### Files to Modify

1. **`src/app/api/certificates/[id]/route.ts`** — The API route that generates certificate HTML
2. **`src/app/admin-place/certificates/page.tsx`** — The admin list page with the "PDF" link/button

### Requirements

1. **Install dependencies:**
   ```
   npm install jspdf html2canvas
   ```

2. **Modify `src/app/api/certificates/[id]/route.ts`:**
   - Keep the responsive certificate HTML design (all CSS stays the same)
   - Remove `@media print` rules (no longer needed)
   - Replace the `onclick="window.print()"` on the button with `onclick="downloadPDF()"`
   - Add a `<script>` tag that includes the download function (inline, no external script needed)
   - The download function should:
     a. Show loading state: change button text to "Generating..." and disable it
     b. Use `html2canvas` to capture the `.certificate` div: `html2canvas(document.querySelector('.certificate'), { scale: 2, useCORS: true, logging: false })`
     c. Create jsPDF landscape A4: `new jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })`
     d. Convert canvas to image: `canvas.toDataURL('image/jpeg', 0.92)`
     e. A4 landscape is 297mm x 210mm. Calculate position to center certificate image maintaining aspect ratio (1056/748 = 1.412)
     f. Add image to PDF filling the page with small margins: `pdf.addImage(imgData, 'JPEG', 10, 10, 277, 190)`
     g. Save: `pdf.save('certificate-${certNumber}.pdf')`
     h. Restore button text on completion
   - Remove `Content-Disposition` header (not a download, it's HTML page with PDF button)

3. **Update admin page buttons:**
   - In `src/app/admin-place/certificates/page.tsx`: Change the PDF link from `<a href="/api/certificates/...">` to open in new tab: `target="_blank" rel="noopener noreferrer"`

4. **Button changes:**
   - Change button text from "🖨️ Print / Save as PDF" to "📥 Download PDF"
   - Keep fixed position and blue styling

### Technical Notes
- jsPDF CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`
- html2canvas CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>`
- Load these in the `<head>` or at the end of `<body>` with `defer`
- Use `window.jspdf.jsPDF` for instantiation
- The function must be global (on window object) so inline onclick works

### After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
