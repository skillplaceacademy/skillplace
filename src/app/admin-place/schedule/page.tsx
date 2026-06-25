'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Calendar,
  Plus,
  Trash2,
  Eye,
  Search,
  X,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Course {
  id: string
  title: string
  slug: string
  is_active: boolean
}

interface ClassSchedule {
  id: string
  course_id: string
  title: string
  description: string | null
  class_type: 'online' | 'offline' | 'hybrid'
  class_date: string
  start_time: string
  end_time: string
  meeting_link: string | null
  location: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ClassScheduleWithCourse extends ClassSchedule {
  course?: Course | null
}

export default function AdminSchedulePage() {
  const [classes, setClasses] = useState<ClassScheduleWithCourse[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassScheduleWithCourse | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingClass, setDeletingClass] = useState<ClassScheduleWithCourse | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    class_type: 'online' as 'online' | 'offline' | 'hybrid',
    class_date: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
    location: '',
    notes: '',
    is_active: true,
  })

  const [courseSearch, setCourseSearch] = useState('')
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const courseSearchRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [classesData, coursesData] = await Promise.all([
        getRecords('class_schedule'),
        getRecords('courses'),
      ])

      const courseList: Course[] = (coursesData || []).map((c: any) => ({
        id: c.id,
        title: c.title || '',
        slug: c.slug || '',
        is_active: c.is_active !== false,
      }))
      setCourses(courseList)

      const courseMap = new Map(courseList.map((c) => [c.id, c]))

      const enrichedClasses: ClassScheduleWithCourse[] = (classesData || []).map((cls: any) => ({
        ...cls,
        course: courseMap.get(cls.course_id) || null,
      }))

      enrichedClasses.sort(
        (a, b) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime()
      )
      setClasses(enrichedClasses)
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseSearchRef.current && !courseSearchRef.current.contains(event.target as Node)) {
        setCourseDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCourses = courses.filter((c) => {
    const search = courseSearch.toLowerCase().trim()
    if (!search) return true
    return c.title.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search)
  })

  function selectCourse(course: Course) {
    setSelectedCourse(course)
    setFormData({ ...formData, course_id: course.id })
    setCourseSearch('')
    setCourseDropdownOpen(false)
  }

  function clearCourseSelection() {
    setSelectedCourse(null)
    setFormData({ ...formData, course_id: '' })
    setCourseSearch('')
  }

  function openCreate() {
    setEditingClass(null)
    setFormData({
      course_id: '',
      title: '',
      description: '',
      class_type: 'online',
      class_date: '',
      start_time: '',
      end_time: '',
      meeting_link: '',
      location: '',
      notes: '',
      is_active: true,
    })
    setSelectedCourse(null)
    setCourseSearch('')
    setShowForm(true)
  }

  function openEdit(cls: ClassScheduleWithCourse) {
    setEditingClass(cls)
    setFormData({
      course_id: cls.course_id,
      title: cls.title,
      description: cls.description || '',
      class_type: cls.class_type,
      class_date: cls.class_date?.split('T')[0] || '',
      start_time: cls.start_time || '',
      end_time: cls.end_time || '',
      meeting_link: cls.meeting_link || '',
      location: cls.location || '',
      notes: cls.notes || '',
      is_active: cls.is_active !== false,
    })
    if (cls.course) {
      setSelectedCourse(cls.course)
    }
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.course_id || !formData.title || !formData.class_date || !formData.start_time || !formData.end_time) return
    setSaving(true)

    try {
      const payload = {
        course_id: formData.course_id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        class_type: formData.class_type,
        class_date: formData.class_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        meeting_link: (formData.class_type === 'online' || formData.class_type === 'hybrid') ? formData.meeting_link.trim() || null : null,
        location: (formData.class_type === 'offline' || formData.class_type === 'hybrid') ? formData.location.trim() || null : null,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
      }

      if (editingClass) {
        await updateRecord('class_schedule', editingClass.id, payload)
      } else {
        await createRecord('class_schedule', payload)
      }

      setShowForm(false)
      setEditingClass(null)
      fetchData()
    } catch {
      // handled silently
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingClass) return
    try {
      await deleteRecord('class_schedule', deletingClass.id)
      setShowDeleteConfirm(false)
      setDeletingClass(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function toggleActive(id: string, currentValue: boolean) {
    try {
      await updateRecord('class_schedule', id, { is_active: !currentValue })
      fetchData()
    } catch {
      // handled silently
    }
  }

  function isUpcoming(cls: ClassScheduleWithCourse) {
    const now = new Date()
    const classDateTime = new Date(`${cls.class_date}T${cls.start_time}`)
    return classDateTime > now
  }

  function isToday(cls: ClassScheduleWithCourse) {
    const today = new Date().toISOString().split('T')[0]
    return cls.class_date === today
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const todayCount = classes.filter(isToday).length
  const upcomingCount = classes.filter(isUpcoming).length
  const onlineCount = classes.filter((c) => c.class_type === 'online').length
  const offlineCount = classes.filter((c) => c.class_type === 'offline').length
  const hybridCount = classes.filter((c) => c.class_type === 'hybrid').length

  const filteredClasses = classes.filter((cls) => {
    if (filterType !== 'all' && cls.class_type !== filterType) return false
    if (filterMonth) {
      const classMonth = cls.class_date?.substring(0, 7)
      if (classMonth !== filterMonth) return false
    }
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Manage online, offline, and hybrid classes</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Schedule Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{classes.length}</p>
            <p className="text-xs text-slate-500">Total Classes</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
            <p className="text-xs text-slate-500">Upcoming</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{onlineCount}</p>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{offlineCount + hybridCount}</p>
            <p className="text-xs text-slate-500">Offline / Hybrid</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Month:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Class List */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No scheduled classes found.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Schedule Class
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClasses.map((cls) => {
            const upcoming = isUpcoming(cls)
            const today = isToday(cls)
            return (
              <div
                key={cls.id}
                className={`border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors ${
                  !cls.is_active ? 'opacity-50' : ''
                } ${upcoming && cls.is_active ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    cls.class_type === 'online' ? 'bg-blue-100' :
                    cls.class_type === 'offline' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {cls.class_type === 'online' ? (
                      <Video className="h-6 w-6 text-blue-600" />
                    ) : cls.class_type === 'offline' ? (
                      <MapPin className="h-6 w-6 text-green-600" />
                    ) : (
                      <Calendar className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{cls.title}</p>
                      <Badge className={`border-0 text-xs ${
                        cls.class_type === 'online' ? 'bg-blue-100 text-blue-700' :
                        cls.class_type === 'offline' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {cls.class_type}
                      </Badge>
                      {today && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                          Today
                        </Badge>
                      )}
                      {!cls.is_active && (
                        <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{cls.course?.title || 'Unknown Course'}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3" /> {new Date(cls.class_date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" /> {cls.start_time} - {cls.end_time}
                      </span>
                      {cls.meeting_link && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Video className="h-3 w-3" /> Meeting Link
                        </span>
                      )}
                      {cls.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <MapPin className="h-3 w-3" /> {cls.location}
                        </span>
                      )}
                    </div>
                    {cls.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{cls.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(cls.id, cls.is_active)}
                      className={`p-1.5 rounded-lg text-xs ${
                        cls.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={cls.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {cls.is_active ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingClass(cls)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Class' : 'Schedule New Class'}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? 'Update class schedule details'
                : 'Set date, time, and type for the new class'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div ref={courseSearchRef} className="relative">
              <label className="text-sm font-medium text-slate-700">
                Course <span className="text-red-500">*</span>
              </label>
              {selectedCourse ? (
                <div className="mt-1 flex items-center gap-2 p-3 border border-blue-300 bg-blue-50 rounded-xl">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-600">
                      {selectedCourse.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {selectedCourse.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearCourseSelection}
                    className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={courseSearch}
                      onChange={(e) => {
                        setCourseSearch(e.target.value)
                        setCourseDropdownOpen(true)
                      }}
                      onFocus={() => setCourseDropdownOpen(true)}
                      className="pl-10 border-slate-300"
                      placeholder="Search courses by title..."
                    />
                  </div>
                  {courseDropdownOpen && filteredCourses.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => selectCourse(course)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {course.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {course.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {courseDropdownOpen && filteredCourses.length === 0 && courseSearch && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <p className="text-sm text-slate-500">No courses found matching &quot;{courseSearch}&quot;</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. Chapter 1 - Introduction"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="Optional class description"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Class Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_type}
                onChange={(e) => setFormData({ ...formData, class_type: e.target.value as 'online' | 'offline' | 'hybrid' })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.class_date}
                  onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                  className="border-slate-300 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="border-slate-300 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  End Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="border-slate-300 mt-1"
                  required
                />
              </div>
            </div>
            {(formData.class_type === 'online' || formData.class_type === 'hybrid') && (
              <div>
                <label className="text-sm font-medium text-slate-700">Meeting Link</label>
                <Input
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  className="border-slate-300 mt-1"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
            {(formData.class_type === 'offline' || formData.class_type === 'hybrid') && (
              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-slate-300 mt-1"
                  placeholder="e.g. Room 101, Main Campus"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="Optional notes for this class"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
                id="schedule-active"
              />
              <label htmlFor="schedule-active" className="text-sm text-slate-600">
                Active (visible to students)
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.course_id || !formData.title || !formData.class_date || !formData.start_time || !formData.end_time}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? 'Saving...'
                  : editingClass
                    ? 'Update'
                    : 'Schedule Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {deletingClass?.title || 'this class'}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
