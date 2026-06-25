import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseLearnClient from './CourseLearnClient'

export const dynamic = 'force-dynamic'

export default async function CourseLearnServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: course } = await adminSupabase
    .from('courses')
    .select('*, branches(*)')
    .eq('slug', slug)
    .single()

  if (!course) {
    notFound()
  }

  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }))

  return <CourseLearnClient course={course} modules={sortedModules} enrollmentCount={0} />
}
