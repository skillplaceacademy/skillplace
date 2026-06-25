# Update EnrollForm.tsx — Branch-Based Course Selection

## Overview
The enrollment form currently shows courses from `program.courses` (a flat list of all courses across all branches). The admin wants courses to be **predefined and grouped by branch** so that when a student enrolls, they see only the courses relevant to their selected program/branch.

## Course Data — Predefined by Branch

Replace the current course selection with this structured data. Add this as a constant in the file (after the imports, before the interfaces):

```ts
interface CourseBranch {
  name: string
  courses: string[]
}

const programCourses: Record<string, CourseBranch[]> = {
  civil: [
    { name: 'Civil Engineering', courses: ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution Basics'] },
  ],
  mechanical: [
    { name: 'Mechanical', courses: ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing Reading'] },
  ],
  electrical: [
    { name: 'Electrical', courses: ['AutoCAD Electrical', 'LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'] },
  ],
  electronics: [
    { name: 'Electronics', courses: ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD', 'Industrial Networking'] },
  ],
  hybrid: [
    { name: 'Civil Engineering', courses: ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution Basics'] },
    { name: 'Mechanical', courses: ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing Reading'] },
    { name: 'Electrical', courses: ['AutoCAD Electrical', 'LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'] },
    { name: 'Electronics', courses: ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD', 'Industrial Networking'] },
  ],
  'single-course': [
    { name: 'Civil Engineering', courses: ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution Basics'] },
    { name: 'Mechanical', courses: ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing Reading'] },
    { name: 'Electrical', courses: ['AutoCAD Electrical', 'LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'] },
    { name: 'Electronics', courses: ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD', 'Industrial Networking'] },
  ],
}

// Common module available for ALL branches
const softSkillsCourses = ['Resume Building', 'Interview Preparation', 'Communication Skills', 'LinkedIn Profile', 'Mock Interviews']
```

## Changes Required

### Task 1: Add the course data constant
Add the `programCourses` constant and `softSkillsCourses` array after the imports (after line 10) and before the `UserData` interface.

### Task 2: Update the `canProceed` function for step 1
Currently checks `formData.courseId !== ''`. No change needed unless you want to validate that a branch is also selected.

### Task 3: Replace the course selection UI in `renderProgramDetails()`

Currently the form has:
- Select Course dropdown (showing `program.courses`)
- Preferred Start Date dropdown
- Goals/Notes textarea

Replace the **single course dropdown** with a **two-step selection**:
1. **First dropdown: Select Branch** — options come from the keys of `programCourses` (filtered by program.id). Show branch names like "Civil Engineering", "Mechanical", etc.
2. **Second dropdown: Select Course** — shows courses within the selected branch, including "Soft Skills" as the last group.

Logic:
- When program is `offline` or `online` → show branches for that program (use `programCourses` based on program.id)
- When program is `hybrid` → show the hybrid branches
- When program is `single-course` → show single-course branches
- Soft Skills is always shown as an additional option group

### Task 4: Update form state
- Keep `courseId` as the selected course name string
- Add a new field `branch` to track the selected branch
- When branch changes, reset `courseId` to `''`

Updated FormData interface:
```ts
interface FormData {
  fullName: string
  email: string
  phone: string
  location: string
  branch: string        // NEW
  courseId: string
  startDate: string
  notes: string
  acceptTerms: boolean
}
```

Update initial state to include `branch: ''`.

### Task 5: Update the review section
Show the selected branch alongside the course in the review summary.

### Task 6: Update the submit payload
Include `branch` field in the POST body sent to `/api/programs/enroll`.

## Implementation Details

### UI Layout for Course Selection
```
[Select Branch]  ← dropdown with branch names
    ↓ (after branch selected)
[Select Course]  ← dropdown with courses in that branch + "Soft Skills" group
```

Use a clean section header label above each dropdown. When no branch is selected, show a disabled/placeholder message: "Please select a branch first".

### Dropdown Styling
Use the same Tailwind classes as the existing select elements:
```
w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

## After Completion
1. Run `npx tsc --noEmit` — fix any type errors
2. Do NOT git push
