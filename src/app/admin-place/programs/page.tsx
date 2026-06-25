'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, X, Link as LinkIcon } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface Branch {
  id: string
  name: string
  slug: string
}

interface Course {
  id: string
  title: string
  slug: string
}

interface TrainingProgram {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string | null
  price: number
  discount_price: number | null
  duration_weeks: number | null
  features: string[] | null
  is_active: boolean
  branches?: { name: string } | null
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [programCourses, setProgramCourses] = useState<Record<string, string[]>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [featuresText, setFeaturesText] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    program_type: 'offline',
    branch_id: '',
    price: 0,
    discount_price: 0,
    duration_weeks: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [programsData, branchesData, coursesData] = await Promise.all([
      getRecords('training_programs', undefined, undefined, 'branches(name)'),
      getRecords('branches'),
      getRecords('courses'),
    ])
    setPrograms((programsData || []).sort((a: TrainingProgram, b: TrainingProgram) => (a as any).created_at?.localeCompare((b as any).created_at) || 0))
    setBranches((branchesData || []).filter((b: Branch) => (b as any).is_active !== false))
    setCourses(coursesData || [])

    const pcMap: Record<string, string[]> = {}
    const pcData = await getRecords('program_courses')
    if (pcData) {
      for (const pc of pcData) {
        const progId = (pc as any).program_id
        const courseId = (pc as any).course_id
        if (!pcMap[progId]) pcMap[progId] = []
        pcMap[progId].push(courseId)
      }
    }
    setProgramCourses(pcMap)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const features = featuresText.split(',').map(f => f.trim()).filter(Boolean)
    const body = { ...formData, features }

    if (editingProgram) {
      await updateRecord('training_programs', editingProgram.id, body)
    } else {
      await createRecord('training_programs', body)
    }

    if (editingProgram) {
      const existingCourses = programCourses[editingProgram.id] || []
      const toAdd = selectedCourses.filter(c => !existingCourses.includes(c))
      const toRemove = existingCourses.filter(c => !selectedCourses.includes(c))

      for (const courseId of toAdd) {
        await createRecord('program_courses', { program_id: editingProgram.id, course_id: courseId })
      }
      for (const courseId of toRemove) {
        const pcList = await getRecords('program_courses')
        const pc = (pcList || []).find((p: any) => p.program_id === editingProgram.id && p.course_id === courseId)
        if (pc) await deleteRecord('program_courses', pc.id)
      }
    }

    setShowForm(false)
    setEditingProgram(null)
    resetForm()
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this program?')) return
    await deleteRecord('training_programs', id)
    fetchData()
  }

  function handleEdit(program: TrainingProgram) {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      slug: program.slug,
      description: program.description || '',
      short_description: program.short_description || '',
      program_type: program.program_type,
      branch_id: program.branch_id || '',
      price: program.price,
      discount_price: program.discount_price || 0,
      duration_weeks: program.duration_weeks || 0,
      is_active: program.is_active,
    })
    setFeaturesText((program.features || []).join(', '))
    setSelectedCourses(programCourses[program.id] || [])
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      program_type: 'offline',
      branch_id: '',
      price: 0,
      discount_price: 0,
      duration_weeks: 0,
      is_active: true,
    })
    setFeaturesText('')
    setSelectedCourses([])
  }

  function toggleCourse(courseId: string) {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
    )
  }

  const filteredPrograms = programs.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Training Programs</h1>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm()
            setEditingProgram(null)
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Program
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Short Description</label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Program Type</label>
              <select
                value={formData.program_type}
                onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Price (₹)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Discount Price (₹)</label>
              <Input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Duration (weeks)</label>
              <Input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: Number(e.target.value) })}
                className="border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Features (comma-separated)</label>
              <Input
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="100% Job Assistance, Resume Building, Mock Interviews"
                className="border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Link Courses to Program</label>
              <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                {courses.length === 0 ? (
                  <p className="text-sm text-slate-400">No courses available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {courses.map((course) => (
                      <label key={course.id} className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {course.title}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search programs..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Type</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Branch</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Price</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Duration</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Courses</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">No programs found.</td>
              </tr>
            ) : (
              filteredPrograms.map((program) => (
                <tr key={program.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{program.name}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={
                      program.program_type === 'offline' ? 'bg-blue-100 text-blue-700 border-0' :
                      program.program_type === 'online' ? 'bg-purple-100 text-purple-700 border-0' :
                      'bg-amber-100 text-amber-700 border-0'
                    }>
                      {program.program_type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{program.branches?.name || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">₹{program.price}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{program.duration_weeks ? `${program.duration_weeks}w` : 'N/A'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{(programCourses[program.id] || []).length}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={program.is_active ? 'default' : 'secondary'} className={program.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-slate-100 text-slate-600 border-0'}>
                      {program.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(program)} className="hover:bg-blue-50 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)} className="hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
