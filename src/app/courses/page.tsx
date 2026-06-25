import { getCourses } from '@/lib/supabase/queries'
import CoursesClient from './CoursesClient'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const courses = await getCourses()

  const branches = Array.from(
    new Map(
      courses
        .map((c: any) => c.branches)
        .filter(Boolean)
        .map((b: any) => [b.id, b])
    ).values()
  )

  return <CoursesClient courses={courses} categories={branches} />
}
