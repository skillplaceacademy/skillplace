## Task: Create Learning Page for Enrolled Users

### Overview
Create a learning experience for users enrolled in programs. When user visits `/programs/[slug]/learn`, they see course content, lessons, and can take tests.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`

### IMPORTANT RULES
1. Use ONLY Tailwind CSS — no inline style={{}}
2. All components must be client components ('use client')
3. Use existing lucide-react icons
4. Do NOT modify database schema
5. Do NOT git push
6. Run `npx tsc --noEmit` after and fix ALL errors

### Database Tables (existing)
- `program_courses` (program_id, course_id, sort_order)
- `courses` (id, title, slug, description, thumbnail_url)
- `modules` (id, course_id, title, description, sort_order)
- `lessons` (id, module_id, title, content, video_url, duration_minutes, sort_order)
- `tests` (id, lesson_id, title, description, duration_minutes, passing_score)
- `test_questions` (id, test_id, question, options TEXT[], correct_answer INTEGER, explanation, sort_order)
- `test_attempts` (id, user_id, test_id, score, answers JSONB, started_at, completed_at)
- `lesson_progress` (id, user_id, lesson_id, is_completed, watched_seconds, completed_at)
- `enrollments` (id, user_id, program_id, status)

### Files to Create

#### 1. `src/app/programs/[slug]/learn/page.tsx` (Server Component)
- Check enrollment: query `enrollments` where user_id = auth user id AND program_id = program id
- If not enrolled, redirect to `/programs`
- Fetch program details + courses via program_courses join
- Render course list with links to `/programs/[slug]/learn/${course.slug}`

#### 2. `src/app/programs/[slug]/learn/[courseSlug]/page.tsx` (Server Component)
- Verify enrollment
- Fetch course with modules and lessons (join modules → lessons)
- Render the CourseLearnClient component

#### 3. `src/app/programs/[slug]/learn/[courseSlug]/CourseLearnClient.tsx` (Client Component)
- Show sidebar with modules and lessons
- Main content area showing current lesson (video player)
- "Take Test" button if test exists for current lesson
- "Mark Complete" button that saves to lesson_progress
- Navigation between lessons (prev/next)

#### 4. `src/app/programs/[slug]/learn/[courseSlug]/[lessonId]/test/page.tsx` (Server + Client)
- Fetch test with questions
- Render TestPlayer component
- On submit: calculate score, insert into test_attempts, show results

#### 5. `src/components/course/TestPlayer.tsx` (Client Component)
- Props: testId, questions[], onSubmit
- Show one question at a time
- Radio button selection for answers
- Submit button
- Show results after submit (score, correct/incorrect)

#### 6. `src/components/course/LessonPlayer.tsx` (Client Component)
- Props: lessonId, videoUrl, title, content, onComplete
- HTML5 video element with controlsList="nodownload noplaybackrate"
- Mark Complete button

### Type Definitions
Define all types inline in the files. Do NOT create separate type files.

### Styling
- Sidebar: `w-72 border-r border-slate-200 bg-slate-50 h-screen overflow-y-auto`
- Main content: `flex-1 p-8 overflow-y-auto`
- Video player: `w-full aspect-video rounded-xl overflow-hidden bg-black`
- Cards: `bg-white rounded-xl border border-slate-200 p-6`
- Buttons: use existing Button component from @/components/ui/button

### After Completion
1. Run `npx tsc --noEmit` — fix ALL errors
2. Do NOT git push
