import { adminSupabase } from './admin'

export async function getBranches() {
  const { data, error } = await adminSupabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching branches:', error)
    return []
  }
  return data || []
}

export async function getCourses(branchId?: string) {
  let query = adminSupabase
    .from('courses')
    .select('*, branches(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }
  return data || []
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await adminSupabase
    .from('courses')
    .select('*, branches(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching course:', JSON.stringify(error))
    return null
  }
  return data
}

export async function getTrainingPrograms() {
  const { data, error } = await adminSupabase
    .from('training_programs')
    .select('*, branches(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching training programs:', error)
    return []
  }
  return data || []
}

export async function getProgramCourses(programId: string) {
  const { data, error } = await adminSupabase
    .from('program_courses')
    .select('*, courses(*)')
    .eq('program_id', programId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching program courses:', error)
    return []
  }
  return data || []
}

export async function getTestimonials() {
  const { data, error } = await adminSupabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
  return data || []
}

export async function getLeads() {
  const { data, error } = await adminSupabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }
  return data || []
}

export async function getStudents() {
  const { data, error } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }
  return data || []
}

export async function getPayments() {
  const { data, error } = await adminSupabase
    .from('purchases')
    .select('*, profiles(*), courses(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }
  return data || []
}

export async function getDashboardStats() {
  const [studentsRes, coursesRes, purchasesRes, leadsRes] = await Promise.all([
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    adminSupabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
    adminSupabase.from('purchases').select('amount').eq('status', 'completed'),
    adminSupabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  const totalStudents = studentsRes.count || 0
  const activeCourses = coursesRes.count || 0
  const totalRevenue = purchasesRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const newLeads = leadsRes.count || 0

  return {
    totalStudents,
    activeCourses,
    totalRevenue,
    newLeads,
  }
}

export async function getRecentEnrollments() {
  const { data, error } = await adminSupabase
    .from('enrollments')
    .select('*, training_programs(name), profiles(full_name)')
    .order('enrolled_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent enrollments:', error)
    return []
  }
  return data || []
}

export async function getRecentPayments() {
  const { data, error } = await adminSupabase
    .from('purchases')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent payments:', error)
    return []
  }
  return data || []
}

export async function getStudentEnrollments(userId: string) {
  const { data, error } = await adminSupabase
    .from('enrollments')
    .select('*, training_programs(name, slug)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) {
    console.error('Error fetching student enrollments:', error)
    return []
  }
  return data || []
}

export async function getStudentPurchases(userId: string) {
  const { data, error } = await adminSupabase
    .from('purchases')
    .select('*, courses(title, slug, thumbnail_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student purchases:', error)
    return []
  }
  return data || []
}
