# CERTIFICATE SYSTEM — FULL FEATURE PLAN

## SQL to run FIRST in Supabase Dashboard:
```sql
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'course_completion';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'classic';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS custom_message TEXT;
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);
-- enrollments.status already exists in this project, no change needed
```

---

## PART 1: CERTIFICATE TYPES (8 types)

Each type has DIFFERENT TEXT CONTENT and LAYOUT STRUCTURE (not just colors):

### 1. Course Completion
- Title: "Certificate of Course Completion"
- Body: "has successfully completed the course"
- Fields: Student Name, Course Name, Duration, Date, Cert#
- Layout: Classic centered, formal double border

### 2. Internship
- Title: "Certificate of Internship"
- Body: "has successfully completed internship at [Organization]"
- Fields: Student Name, Organization, Duration, Date, Cert#
- Layout: Modern, professional, left-accent bar

### 3. Training
- Title: "Certificate of Training"
- Body: "has successfully completed the training program on [Topic]"
- Fields: Student Name, Training Topic, Duration, Date, Cert#
- Layout: Bold, geometric header pattern

### 4. Experience
- Title: "Certificate of Experience"
- Body: "has gained work experience as [Role] at [Organization]"
- Fields: Student Name, Role, Organization, Duration, Date, Cert#
- Layout: Minimal, clean, elegant

### 5. Achievement
- Title: "Certificate of Achievement"
- Body: "is recognized for outstanding achievement in [Category]"
- Fields: Student Name, Category/Custom message, Date, Cert#
- Layout: Celebration style, decorative, award-feel

### 6. Participation
- Title: "Certificate of Participation"
- Body: "has actively participated in [Event/Program]"
- Fields: Student Name, Event/Program, Date, Cert#
- Layout: Simple, clean, modern

### 7. Excellence
- Title: "Certificate of Excellence"
- Body: "has demonstrated exceptional excellence in [Subject]"
- Fields: Student Name, Subject/Custom message, Date, Cert#
- Layout: Premium, gold-accented, prestigious

### 8. Other (Custom)
- Title: "Certificate" (editable)
- Body: [Custom message]
- Fields: Student Name, Custom fields, Date, Cert#
- Layout: Flexible, adaptable template

---

## PART 2: THEME SYSTEM (6 DESIGN THEMES)

Each theme is a COMPLETELY DIFFERENT DESIGN — different structure, text content, decorative elements, and layout flow. NOT just color swaps.

### 1. Classic (Traditional Formal)
- **Structure**: Fully centered, symmetrical
- **Border**: Double ornamental border with decorative inner line
- **Header**: Logo → Academy Name → Title → Subtitle (all centered)
- **Body**: "has successfully completed" text → Recipient Name (large, serif, underlined) → Course/Subject
- **Footer**: Date + Cert # inline, signature line
- **Decorative**: Corner brackets, formal watermark, subtle background pattern
- **Title text**: "Certificate of Completion" (formal serif)

### 2. Modern (Clean Minimal)
- **Structure**: Left accent bar (colored stripe 8px left), content left-aligned with indent
- **Border**: Single thin border, no decorations
- **Header**: Small logo left-aligned → Title (bold sans-serif) → subtitle
- **Body**: Casual modern text → Recipient Name (bold, modern sans) → Details on right
- **Footer**: Minimal date/cert#, no signature
- **Decorative**: Geometric accent shapes, subtle dot pattern
- **Title text**: "Certificate of Achievement" (bold sans-serif)

### 3. Academic (Educational Institution)
- **Structure**: Centered with shield/badge at top
- **Border**: Thick academic-style border with institutional seal
- **Header**: Shield/crest (SVG) → Institution name → "Department of Education"
- **Body**: "This is to certify that" → Recipient name (formal) → "has completed studies in"
- **Footer**: Dean signature + seal, institutional stamp area
- **Decorative**: Academic columns, institutional crest, laurel wreath SVG
- **Title text**: "Academic Certificate" (institutional serif)

### 4. Corporate (Business Professional)
- **Structure**: Bold colored header bar (full width, 60px), white body section
- **Border**: None — uses header bar as frame
- **Header**: Company logo in header bar → Title in white on colored background
- **Body**: Professional verification text → Recipient name → role/achievement
- **Footer**: Date, cert#, digital signature placeholder
- **Decorative**: Clean lines, corporate typography, barcode placeholder
- **Title text**: "Verification of Completion" (professional sans-serif)

### 5. Creative (Artistic/Award)
- **Structure**: Asymmetric — decorative left panel (1/3 width), content right (2/3)
- **Border**: Rounded corners, colored accents
- **Header**: Large decorative star/seal icon → Creative title
- **Body**: Celebratory text with emojis/icons → Recipient name in stylized font
- **Footer**: Fun decorative footer with confetti-like elements
- **Decorative**: Star icons, colorful accents, dynamic typography
- **Title text**: "Certificate of Excellence" (playful, stylized)

### 6. Elegant (Premium Luxury)
- **Structure**: Ultra-clean, generous whitespace, thin elements
- **Border**: Hairline double border, very thin
- **Header**: Minimal logo → elegant script title → spacing
- **Body**: Sophisticated language → recipient name in script font → details
- **Footer**: Subtle watermark, date in elegant type
- **Decorative**: Gold foil effect, subtle emboss pattern, luxury typography
- **Title text**: "Certificate of Distinction" (elegant script)

---

## PART 3: BULK CERTIFICATE SYSTEM

### How it works:
1. Admin clicks "Bulk Issue Certificates"
2. Selects a course
3. System fetches all enrolled students with status = 'completed' (or all enrolled)
4. Admin sees a table with checkboxes per student
5. Select certificate type + theme (applies to entire batch)
6. Preview one sample
7. Click "Issue Bulk Certificates" → generates all, saves to DB
8. Individual download or batch download all PDFs

### Where:
- New page: `/admin-place/certificates/bulk`
- Accessible via "Bulk Issue" button on certificates page

---

## PART 4: STUDENT BATCH IMPORT

### How it works:
1. Admin clicks "Add Students (Batch)" on students page
2. Dialog with textarea + CSV upload option
3. Format: `full_name, email, phone` (one per line)
4. Optionally select a course to enroll all batch students into
5. System creates profile records (role: student) + enrollments if course selected
6. Returns results: how many created, any duplicates/errors

### Two modes:
- **Import Only**: Just creates student accounts
- **Import + Enroll**: Creates students AND enrolls them in a selected course

---

## FILES TO MODIFY/CREATE

### Modify:
1. `src/app/admin-place/certificates/page.tsx` — Add "Bulk Issue" button
2. `src/app/api/certificates/[id]/route.ts` — Support certificate_type + theme + different layouts
3. `src/app/admin-place/students/page.tsx` — Add "Batch Add" button + dialog

### Create:
1. `src/components/admin/BulkCertificateIssuer.tsx` — Bulk certificate wizard
2. `src/components/admin/StudentBatchImport.tsx` — Batch import dialog
3. `src/app/admin-place/certificates/bulk/page.tsx` — Bulk certificates page
4. `src/app/api/certificates/bulk/route.ts` — POST endpoint for bulk creation
5. `src/lib/certificate-types.ts` — Updated with full design specs (layout, text, structure per type+theme)
6. `src/lib/certificate-templates.ts` — HTML generator per type + theme combination (completely different HTML structures)

---

## TECHNICAL REQUIREMENTS

1. **All TypeScript** — no `any` types for new code
2. **Tailwind CSS only** — no inline styles, no CSS-in-JS
3. **No external UI libraries** — use existing shadcn components from `@/components/ui/`
4. **Download PDF** — reuse the same jsPDF + html2canvas approach from the API route
5. **State management** — React useState (no external state library)
6. **Responsive** — works on desktop, tablet, and mobile
7. **Each theme renders completely different HTML structure** — not just CSS color overrides
