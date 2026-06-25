# Certificate Page Enhancement — Issue by Batch

## Project Location
D:\web software developement\skillplaceacademy\skillplace

## Overview
Enhance the certificates admin page (`/admin-place/certificates`) with the ability to issue certificates to students by Batch (group). Also add ability to issue by individual student selection or by course completion.

## Current State
The certificates page at `/admin-place/certificates` currently has:
- "Issue Certificate" button (single certificate wizard)
- "Bulk Issue" link (goes to separate bulk page)
- Table listing all issued certificates

## What to Add

### 1. Add "Quick Issue" Buttons for Batches

On the certificates page header area (next to existing buttons), add a new section:
- **"Quick Issue by Batch" dropdown/button**: Shows list of batches, clicking opens certificate wizard pre-filled for that batch
- **"Quick Issue by Student" button**: Opens a dialog to search/select students across all batches

### 2. New Component: `QuickIssueBatch.tsx` (Create new file)

A dialog component that:
- Shows all existing batches (from `batches` table) in a list
- Each batch shows: name, program type badge, student count, course name
- Clicking a batch opens the certificate wizard pre-filled for all students in that batch
- Option to filter by program type
- Select which certificate type and theme before proceeding

### 3. New Component: `QuickIssueStudent.tsx` (Create new file)

A dialog component that:
- Searchable list of all students (from profiles where role = 'student')
- Show student name, email, batch name, program type
- Multi-select with checkboxes
- Select certificate type and theme
- "Issue Certificates" button creates certificates for selected students

### 4. Update Certificates Page Header

Modify the header area to have 3 action buttons in a row:
1. **"Issue Certificate"** (single — opens CertificateGenerator)
2. **"Issue by Batch"** (opens QuickIssueBatch dialog)
3. **"Issue Student(s)"** (opens QuickIssueStudent dialog)

Keep the existing "Bulk Issue" link but make it smaller/secondary.

### 5. Update `src/app/api/certificates/bulk/route.ts`

Enhance the bulk API to:
- Accept `batch_id` in the request body
- If `batch_id` is provided, fetch all students in that batch and issue certificates to each
- If individual `student_ids` array is provided, issue to those students
- Generate unique certificate numbers for each student
- Return count of certificates created

---

## Files to Create

1. `src/components/admin/QuickIssueBatch.tsx` — Batch selection dialog
2. `src/components/admin/QuickIssueStudent.tsx` — Student selection dialog

## Files to Modify

1. `src/app/admin-place/certificates/page.tsx` — Add Quick Issue buttons and integrate new components
2. `src/app/api/certificates/bulk/route.ts` — Enhance to support batch_id and individual student_ids
3. `src/components/admin/BulkCertificateIssuer.tsx` — Accept pre-filled batch_id or student_ids (optional enhancement)

---

## Technical Notes

- Use existing `getRecords` from `@/lib/admin-api` for fetching batches and students
- Use `generateCertificateHTML` from `@/lib/certificate-templates` for preview
- Use `createRecord` from `@/lib/admin-api` for individual certificate creation, OR use the bulk API endpoint
- Certificate numbers should be unique — use the existing `generateCertificateNumber` pattern
- All Tailwind CSS, no inline styles
- Toast notifications for success/failure

---

## After Completion
- Run: npx tsc --noEmit
- Run: git log --oneline -3
- DO NOT git push
