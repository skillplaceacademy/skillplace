## Task: Certificate Types & Theme System

**Project location:** D:\web software developement\skillplaceacademy\skillplace
**Junction path (use this for all write operations):** C:uto_skillplace\skillplace

### Overview
Build a certificate generator system where admins can:
1. Select from multiple certificate types (Course Completion, Internship, Training, Experience, Achievement, Participation, Excellence, Other)
2. Choose from multiple visual themes/templates for each certificate
3. Preview the certificate before issuing
4. Download certificate as PDF (already implemented with jsPDF+html2canvas)

### Database Changes — Run this SQL in Supabase Dashboard:

```sql
-- Add certificate_type column to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'course_completion';

-- Add theme column  
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'classic_blue';

-- Add additional fields for different certificate types
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS custom_message TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);
```

### Files to Create/Modify

#### 1. **`src/lib/certificate-types.ts`** (NEW FILE)
Define all certificate types and themes as TypeScript constants/types:

```ts
// Certificate types with labels, icons, required fields
export const CERTIFICATE_TYPES = [
  { 
    id: 'course_completion', 
    label: 'Course Completion', 
    icon: '🎓',
    description: 'Awarded for successfully completing a course',
    fields: ['course_id', 'user_id', 'certificate_number']
  },
  { 
    id: 'internship', 
    label: 'Internship', 
    icon: '💼',
    description: 'Certificate for completing an internship program'
    fields: ['user_id', 'certificate_number', 'organization_name']
  },
  { 
    id: 'training', 
    label: 'Training', 
    icon: '📚',
    description: 'Certificate for completing training/workshop',
    fields: ['user_id', 'certificate_number', 'organization_name']
  },
  { 
    id: 'experience', 
    label: 'Experience', 
    icon: '⭐',
    description: 'Work experience verification certificate',
    fields: ['user_id', 'certificate_number', 'organization_name']
  },
  { 
    id: 'achievement', 
    label: 'Achievement', 
    icon: '🏆',
    description: 'Special achievement recognition',
    fields: ['user_id', 'certificate_number', 'custom_message']
  },
  { 
    id: 'participation', 
    label: 'Participation', 
    icon: '📋',
    description: 'Event/program participation certificate',
    fields: ['user_id', 'certificate_number']
  },
  { 
    id: 'excellence', 
    label: 'Excellence', 
    icon: '🌟',
    description: 'Outstanding excellence award',
    fields: ['user_id', 'certificate_number', 'custom_message']
  },
  { 
    id: 'other', 
    label: 'Other', 
    icon: '📜',
    description: 'Custom certificate with flexible fields',
    fields: ['user_id', 'certificate_number', 'custom_message']
  },
] as const

// Theme definitions — each theme has a name, description, and color scheme
export const CERTIFICATE_THEMES = [
  {
    id: 'classic_blue',
    label: 'Classic Blue',
    description: 'Professional navy blue and gold accents',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#d4af37',
    bg: '#f8fafc',
    borderOuter: '#1e40af',
    borderInner: '#bfdbfe',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
  {
    id: 'elegant_green',
    label: 'Elegant Green',
    description: 'Sophisticated emerald and gold',
    primary: '#065f46',
    secondary: '#10b981',
    accent: '#d97706',
    bg: '#f0fdf4',
    borderOuter: '#065f46',
    borderInner: '#a7f3d0',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
  {
    id: 'royal_purple',
    label: 'Royal Purple',
    description: 'Regal purple and silver',
    primary: '#5b21b6',
    secondary: '#8b5cf6',
    accent: '#94a3b8',
    bg: '#faf5ff',
    borderOuter: '#5b21b6',
    borderInner: '#ddd6fe',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
  {
    id: 'modern_dark',
    label: 'Modern Dark',
    description: 'Sleek dark theme with gold',
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#eab308',
    bg: '#f1f5f9',
    borderOuter: '#0f172a',
    borderInner: '#cbd5e1',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
  {
    id: 'warm_sunset',
    label: 'Warm Sunset',
    description: 'Warm orange and red tones',
    primary: '#c2410c',
    secondary: '#f97316',
    accent: '#ca8a04',
    bg: '#fff7ed',
    borderOuter: '#c2410c',
    borderInner: '#fed7aa',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
  {
    id: 'ocean_teal',
    label: 'Ocean Teal',
    description: 'Cool teal and aqua vibes',
    primary: '#115e59',
    secondary: '#14b8a6',
    accent: '#a3e635',
    bg: '#f0fdfa',
    borderOuter: '#115e59',
    borderInner: '#99f6e4',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
    pattern: 'none',
  },
] as const

export type CertificateType = typeof CERTIFICATE_TYPES[number]['id']
export type CertificateTheme = typeof CERTIFICATE_THEMES[number]['id']
```

#### 2. **`src/components/admin/CertificateGenerator.tsx`** (NEW FILE)
A multi-step certificate generation component:

**Step 1 — Certificate Type Selection:**
- Grid of cards showing each certificate type with icon and description
- Radio button / clickable card to select

**Step 2 — Theme Selection:**
- Grid of 6 theme preview cards showing mini certificate preview with theme colors
- Each card shows theme name, description, and a color swatch

**Step 3 — Fill Details:**
- Dynamic form based on selected certificate type
- Common fields: Student selector, Certificate number (auto-generated)
- Conditional fields: Course selector (for course_completion), Organization name (internship/training/experience), Custom message (achievement/excellence/other)
- Date issued (default: today)

**Step 4 — Preview & Generate:**
- Live preview of certificate combining selected theme + type content
- "Generate & Download PDF" button
- "Save to Database" button

**Component API:**
- Must be a `'use client'` component
- Use Tailwind CSS for all styling (light theme, white backgrounds, slate text)
- Import `createRecord`, `getRecords` from `@/lib/admin-api`
- Import `notify` from `@/lib/notifications`
- Reuse the certificate HTML generation logic from the API route

#### 3. **Modify `src/app/admin-place/certificates/page.tsx`:**
- Replace the existing "Issue Certificate" form with the new `<CertificateGenerator>` component
- Keep the existing table of issued certificates
- Add certificate_type column to the table (show badge with icon + label)
- Update `fetchData` to include `certificate_type` in the select query: `'*,profiles(full_name,email),courses(title,duration_hours),enrollments(*)'`

#### 4. **Update `src/app/api/certificates/[id]/route.ts`:**
- Update the certificate HTML generation to accept `certificate_type` and `theme` parameters
- Modify the certificate content based on type:
  - course_completion: "Certificate of Course Completion" / "has successfully completed the course"
  - internship: "Certificate of Internship" / "has successfully completed internship at [organization]"
  - training: "Certificate of Training" / "has successfully completed the training program"
  - experience: "Certificate of Experience" / "has gained work experience at [organization]"
  - achievement: "Certificate of Achievement" / [custom_message]
  - participation: "Certificate of Participation" / "has actively participated in the program"
  - excellence: "Certificate of Excellence" / [custom_message]
  - other: "Certificate" / [custom_message]
- Apply theme colors to the certificate (use the theme object colors for borders, logos, text accents, recipient name color)
- Include `organization_name` field if present
- All responsive CSS from previous implementation stays the same

### Technical Requirements

1. **All TypeScript** — no `any` types for new code
2. **Tailwind CSS only** — no inline styles, no CSS-in-JS
3. **No external UI libraries** — use existing shadcn components from `@/components/ui/`
4. **Download PDF** — reuse the same jsPDF + html2canvas approach from the API route
5. **State management** — React useState (no external state library)
6. **Responsive** — works on desktop, tablet, and mobile

### After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
