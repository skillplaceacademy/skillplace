'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS, type ProgramType } from '@/lib/constants'
import { Search, Plus, Edit, Trash2, Eye, Upload, Users, Filter, X } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import StudentBatchImport from '@/components/admin/StudentBatchImport'
import BatchManager from '@/components/admin/BatchManager'
import Link from 'next/link'

interface Student {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  location: string | null
  batch_id: string | null
  program_type: string | null
  is_active: boolean
  created_at: string
  enrollments: { id: string; courses: { title: string } | null }[]
  batches?: { name: string } | null
}

interface Batch {
  id: string
  name: string
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [search, setSearch] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterProgramType, setFilterProgramType] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [showBatchImport, setShowBatchImport] = useState(false)
  const [showBatchManager, setShowBatchManager] = useState(false)
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [bulkAssignBatchId, setBulkAssignBatchId] = useState('')
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    program_type: 'online_course' as ProgramType,
    batch_id: '',
    is_active: true,
  })

  useEffect(() => {
    fetchStudents()
    fetchBatches()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    let joinStr = '*, enrollments(*, courses(title))'
    let filterField = 'role'
    let filterValue = 'student'

    const data = await getRecords('profiles', filterField, filterValue, joinStr)
    if (data) {
      const enriched = data.map((s: any) => ({
        ...s,
        batches: s.batches || null,
      }))
      setStudents(enriched.sort((a: Student, b: Student) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  async function fetchBatches() {
    const data = await getRecords('batches')
    if (data) {
      setBatches(data.map((b: any) => ({ id: b.id, name: b.name })))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || null,
      location: formData.location || null,
      program_type: formData.program_type,
      batch_id: formData.batch_id || null,
      is_active: formData.is_active,
    }

    if (editingStudent) {
      try {
        await updateRecord('profiles', editingStudent.id, payload)
        notify.studentUpdated()
      } catch (err: any) {
        notify.genericError('Failed to update student.')
        return
      }
    } else {
      try {
        await createRecord('profiles', {
          id: crypto.randomUUID(),
          ...payload,
          role: 'student',
        })
        notify.studentAdded()
      } catch (err: any) {
        notify.genericError('Failed to create student.')
        return
      }
    }
    setShowForm(false)
    setEditingStudent(null)
    resetForm()
    fetchStudents()
  }

  async function handleDelete() {
    if (!deletingStudent) return
    try {
      await deleteRecord('profiles', deletingStudent.id)
      notify.studentDeleted()
    } catch (err: any) {
      notify.genericError('Failed to delete student.')
    }
    setShowDeleteConfirm(false)
    setDeletingStudent(null)
    fetchStudents()
  }

  async function toggleStatus(student: Student) {
    try {
      await updateRecord('profiles', student.id, { is_active: !student.is_active })
      notify.statusToggled(!student.is_active)
    } catch (err: any) {
      notify.genericError('Failed to toggle status.')
      return
    }
    fetchStudents()
  }

  function handleEdit(student: Student) {
    setEditingStudent(student)
    setFormData({
      full_name: student.full_name || '',
      email: student.email,
      phone: student.phone || '',
      location: student.location || '',
      program_type: (student.program_type as ProgramType) || 'online_course',
      batch_id: student.batch_id || '',
      is_active: student.is_active,
    })
    setShowForm(true)
  }

  function handleViewDetail(student: Student) {
    setDetailStudent(student)
    setShowDetail(true)
  }

  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      location: '',
      program_type: 'online_course',
      batch_id: '',
      is_active: true,
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)))
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  async function handleBulkAssign() {
    if (!bulkAssignBatchId || selectedIds.size === 0) return
    try {
      for (const id of selectedIds) {
        await updateRecord('profiles', id, { batch_id: bulkAssignBatchId })
      }
      notify.studentsAssignedToBatch(selectedIds.size)
      setSelectedIds(new Set())
      setShowBulkAssign(false)
      setBulkAssignBatchId('')
      fetchStudents()
    } catch {
      notify.genericError('Failed to assign students to batch')
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    try {
      for (const id of selectedIds) {
        await deleteRecord('profiles', id)
      }
      notify.studentsDeleted(selectedIds.size)
      setSelectedIds(new Set())
      setShowBulkDeleteConfirm(false)
      fetchStudents()
    } catch {
      notify.genericError('Failed to delete selected students')
    }
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
    const matchesBatch = !filterBatch || s.batch_id === filterBatch
    const matchesProgramType = !filterProgramType || s.program_type === filterProgramType
    return matchesSearch && matchesBatch && matchesProgramType
  })

  const hasActiveFilters = filterBatch || filterProgramType
  const allSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {students.length} student{students.length !== 1 ? 's' : ''} total
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-slate-300"
            onClick={() => setShowBatchManager(true)}
          >
            <Users className="h-4 w-4" /> Batches
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-slate-300"
            onClick={() => setShowBatchImport(true)}
          >
            <Upload className="h-4 w-4" /> Batch Add
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              resetForm()
              setEditingStudent(null)
              setShowForm(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name *</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City or address"
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Program Type</label>
              <select
                value={formData.program_type}
                onChange={(e) => setFormData({ ...formData, program_type: e.target.value as ProgramType })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PROGRAM_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.icon} {pt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Batch</label>
              <select
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingStudent ? 'Update Student' : 'Create Student'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingStudent(null); resetForm() }}
                className="border-slate-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, location..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterProgramType}
            onChange={(e) => setFilterProgramType(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Program Types</option>
            {PROGRAM_TYPES.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.icon} {pt.label}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterBatch(''); setFilterProgramType('') }}
              className="gap-1 text-slate-500"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => setShowBulkAssign(true)}
            >
              <Users className="h-3.5 w-3.5" /> Assign to Batch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Phone</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Location</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Program Type</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Batch</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const ptColor = PROGRAM_TYPE_COLORS[student.program_type || 'online_course'] || 'bg-slate-100 text-slate-700'
                  const ptLabel = PROGRAM_TYPES.find((p) => p.id === student.program_type)?.label || student.program_type
                  const batch = batches.find((b) => b.id === student.batch_id)
                  return (
                    <tr key={student.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${selectedIds.has(student.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleSelect(student.id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">{(student.full_name || 'U').charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">{student.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{student.email}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{student.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{student.location || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{student.enrollments?.length || 0}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={`text-xs ${ptColor}`}>
                          {ptLabel}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {batch ? (
                          <Link href={`/admin-place/students/batch/${student.batch_id}`} className="text-xs font-medium text-blue-600 hover:underline">
                            {batch.name}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleStatus(student)} className="cursor-pointer">
                          <Badge variant={student.is_active ? 'default' : 'destructive'} className={student.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                            {student.is_active ? 'active' : 'inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(student)} className="hover:bg-blue-50 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(student)} className="hover:bg-blue-50 hover:text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeletingStudent(student); setShowDeleteConfirm(true) }} className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{detailStudent?.full_name || detailStudent?.email}</span>
            </DialogDescription>
          </DialogHeader>
          {detailStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Full Name</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Program Type</p>
                  <Badge variant="outline" className={`text-xs ${PROGRAM_TYPE_COLORS[detailStudent.program_type || 'online_course']}`}>
                    {PROGRAM_TYPES.find((p) => p.id === detailStudent.program_type)?.label || detailStudent.program_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Batch</p>
                  <p className="text-sm font-medium text-slate-900">
                    {batches.find((b) => b.id === detailStudent.batch_id)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                  <Badge className={detailStudent.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                    {detailStudent.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Joined</p>
                  <p className="text-sm font-medium text-slate-900">{new Date(detailStudent.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {detailStudent.enrollments && detailStudent.enrollments.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Enrolled Courses</p>
                  <div className="space-y-1">
                    {detailStudent.enrollments.map((enroll, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-700">{enroll.courses?.title || 'Unknown Course'}</span>
                        <Badge variant="outline" className="text-xs">active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)} className="border-slate-300">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {deletingStudent?.full_name || deletingStudent?.email}
              </span>
              ? This will also remove all their enrollments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowDeleteConfirm(false); setDeletingStudent(null) }}
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

      <Dialog open={showBulkAssign} onOpenChange={setShowBulkAssign}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Batch</DialogTitle>
            <DialogDescription>
              Assign {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} to a batch
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700">Select Batch</label>
            <select
              value={bulkAssignBatchId}
              onChange={(e) => setBulkAssignBatchId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkAssign(false); setBulkAssignBatchId('') }} className="border-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!bulkAssignBatchId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Selected Students</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentBatchImport
        open={showBatchImport}
        onClose={() => setShowBatchImport(false)}
        onComplete={() => {
          setShowBatchImport(false)
          fetchStudents()
        }}
      />

      <BatchManager
        open={showBatchManager}
        onClose={() => setShowBatchManager(false)}
        onComplete={() => {
          fetchBatches()
          fetchStudents()
        }}
      />
    </div>
  )
}
