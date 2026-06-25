# Rebuild Programs Page: Branch-Based Program Listing + Detail Page

## Overview
The current programs page doesn't match the user's requirement. Need to rebuild with:

1. **Branch-based filtering**: User selects branch (Civil, Mechanical, Electrical, Electronics) first
2. **Program cards per branch**: Show available programs (Online, Offline, Hybrid) for that branch
3. **Program Detail Page**: After clicking a program, show full details (courses included, features, pricing, duration) with option to choose program type and enroll

---

## Flow

### Step 1: Branch Selection (Default: Civil)
- Show branch tabs/cards at top: Civil | Mechanical | Electrical | Electronics
- Default selected: Civil
- On branch change, filter programs

### Step 2: Program Cards Grid
For selected branch, show program cards:
```
┌─────────────────────────────────┐
│ 🏷️ OFFLINE                     │
│ Civil Engineering Offline       │
│ ₹49,999  ·  52 weeks            │
│                                 │
│ ✅ 100% Job Assistance          │
│ ✅ Soft Skills Training         │
│ ✅ Site Visits                  │
│ ✅ +5 more features             │
│                                 │
│ [View Details]                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🏷️ ONLINE                      │
│ Civil Engineering Online        │
│ ₹29,999  ·  24 weeks            │
│ ...                             │
└─────────────────────────────────┘
```

### Step 3: Program Detail Page (/programs/[slug])
Full details of a single program:
- Hero: Program name, branch badge, price, duration
- Features list (all features from DB)
- Courses included (fetched from program_courses → courses)
- Program type selector (if multiple types exist for same branch)
- "Enroll Now" button → /programs/[slug]/enroll

---

## Changes Required

### Task 1: Rewrite `src/app/programs/page.tsx`

Replace with branch-based listing:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Check, Wifi, Users, MapPin } from 'lucide-react'
import { getRecords } from '@/lib/supabase/queries'

interface Branch {
  id: string
  name: string
  slug: string
  icon: string
}

interface TrainingProgram {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  branches: { name: string; slug: string } | null
}

const programTypeConfig = {
  online: { label: 'Online', icon: Wifi, color: 'bg-purple-100 text-purple-700' },
  offline: { label: 'Offline', icon: Users, color: 'bg-blue-100 text-blue-700' },
  hybrid: { label: 'Hybrid', icon: MapPin, color: 'bg-amber-100 text-amber-700' },
}

export default function ProgramsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [selectedBranch, setSelectedBranch] = useState('civil')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchPrograms()
  }, [selectedBranch])

  async function fetchBranches() {
    const data = await getRecords('branches')
    setBranches(data || [])
  }

  async function fetchPrograms() {
    setLoading(true)
    const branch = branches.find(b => b.slug === selectedBranch)
    if (!branch) { setLoading(false); return }
    const data = await getRecords('training_programs', 'branch_id', branch.id)
    setPrograms(data || [])
    setLoading(false)
  }

  const groupedPrograms = programs.reduce((acc, p) => {
    if (!acc[p.program_type]) acc[p.program_type] = []
    acc[p.program_type].push(p)
    return acc
  }, {} as Record<string, TrainingProgram[]>)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Job-Oriented Training Programs</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Choose your branch and program type. Each program is designed by industry experts with placement assistance.
          </p>
        </div>

        {/* Branch Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {branches.map((branch) => (
            <button
              key={branch.slug}
              onClick={() => setSelectedBranch(branch.slug)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedBranch === branch.slug
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {branch.name}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No programs available for this branch yet.</div>
        ) : (
          <div className="space-y-12">
            {/* Group by program type: offline, online, hybrid */}
            {['offline', 'online', 'hybrid'].map((type) => {
              const typePrograms = groupedPrograms[type]
              if (!typePrograms || typePrograms.length === 0) return null
              const config = programTypeConfig[type as keyof typeof programTypeConfig]
              const Icon = config.icon

              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{config.label} Programs</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typePrograms.map((program) => (
                      <div key={program.id} className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className={`${config.color} border-0`}>
                              {config.label}
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-600 border-0">
                              {program.branches?.name}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-2">{program.name}</h3>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{program.short_description}</p>

                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {program.duration_weeks} weeks
                            </span>
                          </div>

                          <div className="space-y-2 mb-5">
                            {(program.features || []).slice(0, 5).map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                                {feature}
                              </div>
                            ))}
                            {(program.features || []).length > 5 && (
                              <p className="text-sm text-blue-600 font-medium">
                                + {(program.features || []).length - 5} more features
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                              {program.discount_price ? (
                                <>
                                  <span className="text-2xl font-bold text-slate-900">₹{program.discount_price.toLocaleString()}</span>
                                  <span className="text-sm text-slate-400 line-through ml-2">₹{program.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-slate-900">₹{program.price.toLocaleString()}</span>
                              )}
                            </div>
                            <Link href={`/programs/${program.slug}`}>
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Task 2: Create `src/app/programs/[slug]/page.tsx`

Program detail page:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, Clock, Wifi, Users, MapPin, BookOpen } from 'lucide-react'
import { getRecords } from '@/lib/supabase/queries'

interface ProgramDetail {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  branches: { name: string; slug: string } | null
}

interface Course {
  id: string
  title: string
  slug: string
  duration_hours: number
  level: string
}

const programTypeConfig = {
  online: { label: 'Online', icon: Wifi, color: 'bg-purple-100 text-purple-700' },
  offline: { label: 'Offline', icon: Users, color: 'bg-blue-100 text-blue-700' },
  hybrid: { label: 'Hybrid', icon: MapPin, color: 'bg-amber-100 text-amber-700' },
}

export default function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgram()
  }, [slug])

  async function fetchProgram() {
    setLoading(true)
    const programs = await getRecords('training_programs', 'slug', slug, 'branches(*)')
    if (!programs || programs.length === 0) { setLoading(false); return }
    const prog = programs[0]
    setProgram(prog)

    // Fetch linked courses
    const programCourses = await getRecords('program_courses', 'program_id', prog.id, 'courses(*)')
    setCourses((programCourses || []).map((pc: any) => pc.courses).filter(Boolean))
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Program Not Found</h2>
          <Link href="/programs">
            <Button>Back to Programs</Button>
          </Link>
        </div>
      </div>
    )
  }

  const config = programTypeConfig[program.program_type as keyof typeof programTypeConfig]
  const Icon = config?.icon || BookOpen

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${config?.color || ''} border-0`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config?.label || program.program_type}
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-0">
                  {program.branches?.name}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{program.name}</h1>
              <p className="text-slate-600 text-lg">{program.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What You Get</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(program.features || []).map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses Included */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Courses Included ({courses.length})
                </h2>
                <div className="space-y-3">
                  {courses.map((course, i) => (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.duration_hours}h · {course.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Enroll Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                {program.discount_price ? (
                  <>
                    <p className="text-sm text-slate-400 line-through">₹{program.price.toLocaleString()}</p>
                    <p className="text-4xl font-bold text-slate-900">₹{program.discount_price.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-slate-900">₹{program.price.toLocaleString()}</p>
                )}
                <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {program.duration_weeks} weeks
                </p>
              </div>

              <Link href={`/programs/${program.slug}/enroll`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                  Enroll Now
                </Button>
              </Link>

              <p className="text-xs text-slate-400 text-center mt-3">
                Secure payment · Instant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 3: Update `src/app/programs/[programType]/enroll/page.tsx`

Update the enroll page to fetch program details from DB instead of using the old `program-data.ts` hardcoded data. The enroll page should:
1. Fetch program by slug from DB
2. Show program name, branch, price
3. Personal info form
4. Review & submit

### Task 4: Update Home Page program section

Update the home page to link programs to the new `/programs/[slug]` detail page instead of `/programs/${p.slug}`.

### Task 5: Run `npx tsc --noEmit`

## After Completion
1. Do NOT git push
