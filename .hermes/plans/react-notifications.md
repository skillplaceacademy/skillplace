# Add React Notifications (Toast) to Entire Application

## Goal
Add user-friendly toast notifications throughout the application using the already-installed `sonner` library. Every user action should provide instant visual feedback.

## Current State
- `sonner` v2.0.7 is installed in package.json but NOT used anywhere
- No Toaster component exists
- No toast calls exist in any file
- Users get no feedback after actions like login, enroll, download, errors

## What is Sonner?
Sonner is a lightweight React toast notification library. Usage:
```tsx
import { toast } from 'sonner'
toast.success('Logged in!')
toast.error('Something went wrong')
toast.info('Check your email')
toast.warning('Session expiring soon')
```

## Implementation Plan

### Step 1: Add Toaster Provider to Root Layout

In `src/app/layout.tsx`, add the `<Toaster />` component from sonner:

```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Step 2: Create Notification Utility

Create `src/lib/notifications.ts` with helper functions for consistent notifications:

```ts
import { toast } from 'sonner'

export const notify = {
  // Auth
  loginSuccess: (name?: string) => toast.success(`Welcome back, ${name || 'Student'}!`),
  loginError: (msg?: string) => toast.error(msg || 'Login failed. Please check your credentials.'),
  registerSuccess: () => toast.success('Account created successfully! Please check your email.'),
  registerError: (msg?: string) => toast.error(msg || 'Registration failed. Please try again.'),
  logoutSuccess: () => toast.success('Logged out successfully!'),
  
  // Enrollment & Payment
  enrollSuccess: (courseName?: string) => toast.success(`Successfully enrolled${courseName ? ` in ${courseName}` : ''}!`),
  enrollError: (msg?: string) => toast.error(msg || 'Enrollment failed. Please try again.'),
  paymentSuccess: () => toast.success('Payment successful! You now have access to the course.'),
  paymentError: (msg?: string) => toast.error(msg || 'Payment failed. Please try again.'),
  paymentCancelled: () => toast.info('Payment cancelled.'),
  
  // Course Learning
  lessonComplete: (title?: string) => toast.success(`Lesson completed: ${title || 'Great job!'}`),
  quizSubmitted: (score?: number) => toast.success(`Quiz submitted! Score: ${score}%`),
  quizFailed: () => toast.error('Quiz not passed. Please try again.'),
  noteSaved: () => toast.success('Notes saved!'),
  progressSaved: () => toast.success('Progress saved!'),
  
  // Certificates
  certificateDownloaded: () => toast.success('Certificate downloaded!'),
  certificateError: () => toast.error('Failed to download certificate.'),
  
  // Admin
  courseCreated: () => toast.success('Course created successfully!'),
  courseUpdated: () => toast.success('Course updated!'),
  courseDeleted: () => toast.success('Course deleted.'),
  moduleCreated: () => toast.success('Module created!'),
  lessonCreated: () => toast.success('Lesson created!'),
  videoUploaded: () => toast.success('Video uploaded successfully!'),
  employeeAdded: () => toast.success('Employee added!'),
  settingsSaved: () => toast.success('Settings saved!'),
  
  // Errors
  networkError: () => toast.error('Network error. Please check your connection.'),
  serverError: () => toast.error('Server error. Please try again later.'),
  unauthorized: () => toast.error('Please login to continue.'),
  sessionExpired: () => toast.warning('Session expired. Please login again.'),
  
  // Info
  loading: () => toast.info('Loading...'),
  comingSoon: () => toast.info('Coming soon!'),
  copied: () => toast.success('Copied to clipboard!'),
}
```

### Step 3: Add Notifications to All Pages

#### Login Page (`src/app/login/page.tsx`)
- On success: `notify.loginSuccess(user.email)`
- On error: `notify.loginError(error.message)`
- On register link: no toast

#### Register Page (`src/app/register/page.tsx`)
- On success: `notify.registerSuccess()`
- On error: `notify.registerError(error.message)`

#### Navbar (`src/components/layout/Navbar.tsx`)
- On logout: `notify.logoutSuccess()`

#### Course Detail Page (`src/app/courses/[slug]/page.tsx`)
- No change (EnrollButton handles its own toasts)

#### EnrollButton (`src/components/courses/EnrollButton.tsx`)
- On free enroll success: `notify.enrollSuccess(courseTitle)`
- On payment start: `notify.info('Redirecting to payment...')`
- On payment error: `notify.paymentError(error.message)`
- On not logged in: `notify.unauthorized()`

#### Course Learning Page (`src/app/courses/[slug]/learn/CourseLearnClient.tsx`)
- On lesson complete: `notify.lessonComplete(lessonTitle)`
- On quiz submit: `notify.quizSubmitted(score)`
- On note save: `notify.noteSaved()`
- On enrollment overlay payment: `notify.paymentSuccess()`

#### Student Certificates (`src/app/student/certificates/page.tsx`)
- On download: `notify.certificateDownloaded()`

#### Admin Dashboard (`src/app/admin-place/page.tsx`)
- No change (admin pages handle their own toasts)

#### Admin Courses (`src/app/admin-place/courses/page.tsx`)
- On create: `notify.courseCreated()`
- On update: `notify.courseUpdated()`
- On delete: `notify.courseDeleted()`

#### Admin Content Pages (modules, lessons, tests)
- On create: `notify.moduleCreated()` / `notify.lessonCreated()`
- On video upload: `notify.videoUploaded()`

#### Admin Employees (`src/app/admin-place/employees/page.tsx`)
- On add: `notify.employeeAdded()`

#### Payment Webhook/API
- On payment success: `notify.paymentSuccess()` (if user is on page)

### Step 4: Add Toast Types for Different Scenarios

Use these toast styles:
- `toast.success()` — Green, checkmark icon
- `toast.error()` — Red, X icon  
- `toast.info()` — Blue, info icon
- `toast.warning()` — Yellow, warning icon
- `toast.loading()` — Spinner (for async operations)
- `toast.promise()` — For async operations with loading → success/error

### Step 5: Special Toast Patterns

#### Promise Toast (for async operations)
```ts
toast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save.',
  }
)
```

#### Dismissible Toast with Action
```ts
toast('Course enrolled', {
  action: {
    label: 'Go to Course',
    onClick: () => router.push('/courses/learn'),
  },
})
```

#### Persistent Toast (doesn't auto-dismiss)
```ts
toast.error('Session expired', { duration: Infinity })
```

## Files to Modify (25+ files)

### Core
1. `src/app/layout.tsx` — Add `<Toaster />`
2. `src/lib/notifications.ts` — NEW: notification utility

### Auth Pages
3. `src/app/login/page.tsx`
4. `src/app/register/page.tsx`

### Navigation
5. `src/components/layout/Navbar.tsx`

### Course Pages
6. `src/app/courses/[slug]/page.tsx`
7. `src/app/courses/[slug]/learn/CourseLearnClient.tsx`
8. `src/components/courses/EnrollButton.tsx`

### Student Pages
9. `src/app/student/certificates/page.tsx`
10. `src/app/student/dashboard/page.tsx`

### Admin Pages
11. `src/app/admin-place/page.tsx`
12. `src/app/admin-place/courses/page.tsx`
13. `src/app/admin-place/courses/[id]/page.tsx`
14. `src/app/admin-place/content/[courseId]/page.tsx`
15. `src/app/admin-place/content/[courseId]/modules/page.tsx`
16. `src/app/admin-place/content/[courseId]/lessons/page.tsx`
17. `src/app/admin-place/content/[courseId]/tests/page.tsx`
18. `src/app/admin-place/employees/page.tsx`
19. `src/app/admin-place/payments/page.tsx`
20. `src/app/admin-place/certificates/page.tsx`
21. `src/app/admin-place/students/page.tsx`
22. `src/app/admin-place/leads/page.tsx`

### Components
23. `src/components/course/QuizPlayer.tsx`
24. `src/components/course/StudentNotes.tsx`
25. `src/components/courses/PurchasedCourses.tsx`

## DO NOT
- Do NOT run git push
- Do NOT install new packages (sonner is already installed)
- Do NOT change existing functionality — only add toast calls
- Do NOT add toasts to every single line — only key user-facing actions

## After Completion
- Run `npx tsc --noEmit` — zero errors
- Every user action shows a toast notification
- Login shows "Welcome back!"
- Logout shows "Logged out successfully!"
- Enrollment shows "Successfully enrolled!"
- Payment shows "Payment successful!"
- Certificate download shows "Certificate downloaded!"
- Errors show clear error messages
- Admin CRUD operations show success/error toasts
- Toast position: top-right, auto-dismiss after 4 seconds, close button enabled
