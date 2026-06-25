'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS, type ProgramType } from '@/lib/constants'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react'
import Link from 'next/link'

interface Batch {
  id: string
  name: string
  description: string | null
  course_id: string | null
  program_type: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  courses?: { title: string } | null
  student_count?: number
}

interface BatchManagerProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function BatchManager({ open, onClose, onComplete }: BatchManagerProps) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course_id: '',
    program_type: 'online_course' as ProgramType,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (open) {
      fetchBatches()
      fetchCourses()
    }
  }, [open])

  async function fetchBatches() {
    setLoading(true)
    try {
      const data = await getRecords('batches', undefined, undefined, '*, courses(title)')
      if (data) {
        const withCounts = data.map((b: any) => ({
          ...b,
          student_count: 0,
        }))
        setBatches(withCounts)
      }
    } catch {
      notify.genericError('Failed to load batches')
    }
    setLoading(false)
  }

  async function fetchCourses() {
    const data = await getRecords('courses')
    if (data) {
      setCourses(
        data
          .filter((c: Record<string, unknown>) => c.is_active !== false)
          .map((c: Record<string, unknown>) => ({
            id: c.id as string,
            title: c.title as string,
          }))
      )
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      course_id: '',
      program_type: 'online_course',
      start_date: '',
      end_date: '',
    })
  }

  function handleEdit(batch: Batch) {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      description: batch.description || '',
      course_id: batch.course_id || '',
      program_type: (batch.program_type as ProgramType) || 'online_course',
      start_date: batch.start_date || '',
      end_date: batch.end_date || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      notify.genericError('Batch name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        course_id: formData.course_id || null,
        program_type: formData.program_type,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      if (editingBatch) {
        await updateRecord('batches', editingBatch.id, payload)
        notify.batchUpdated()
      } else {
        await createRecord('batches', payload)
        notify.batchCreated()
      }
      setShowForm(false)
      setEditingBatch(null)
      resetForm()
      fetchBatches()
    } catch (err: any) {
      notify.genericError(editingBatch ? 'Failed to update batch' : 'Failed to create batch')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deletingBatch) return
    try {
      await deleteRecord('batches', deletingBatch.id)
      notify.batchDeleted()
    } catch {
      notify.genericError('Failed to delete batch')
    }
    setShowDeleteConfirm(false)
    setDeletingBatch(null)
    fetchBatches()
  }

  function handleClose() {
    setShowForm(false)
    setEditingBatch(null)
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Batches</DialogTitle>
          <DialogDescription>Create, edit, and organize student batches</DialogDescription>
        </DialogHeader>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-700">Batch Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Web Dev Batch 2025"
                className="border-slate-300 mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-slate-700">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this batch"
                className="border-slate-300 mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700">Course</Label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No specific course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700">Program Type</Label>
                <select
                  value={formData.program_type}
                  onChange={(e) => setFormData({ ...formData, program_type: e.target.value as ProgramType })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROGRAM_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>{pt.icon} {pt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700">Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="border-slate-300 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-700">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="border-slate-300 mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingBatch(null); resetForm() }}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingBatch ? 'Update Batch' : 'Create Batch'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => { resetForm(); setEditingBatch(null); setShowForm(true) }}
              >
                <Plus className="h-4 w-4" /> New Batch
              </Button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-lg font-medium">No batches yet</p>
                <p className="text-sm mt-1">Create your first batch to organize students</p>
              </div>
            ) : (
              <div className="space-y-3">
                {batches.map((batch) => {
                  const ptColor = PROGRAM_TYPE_COLORS[batch.program_type] || 'bg-slate-100 text-slate-700'
                  return (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin-place/students/batch/${batch.id}`}
                            className="text-sm font-semibold text-blue-600 hover:underline truncate"
                          >
                            {batch.name}
                          </Link>
                          <Badge variant="outline" className={`text-xs ${ptColor}`}>
                            {PROGRAM_TYPES.find((p) => p.id === batch.program_type)?.label || batch.program_type}
                          </Badge>
                          {!batch.is_active && (
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700">Inactive</Badge>
                          )}
                        </div>
                        {batch.description && (
                          <p className="text-xs text-slate-500 mt-1 truncate">{batch.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {batch.courses?.title && <span>Course: {batch.courses.title}</span>}
                          {batch.start_date && <span>Start: {batch.start_date}</span>}
                          {batch.end_date && <span>End: {batch.end_date}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{batch.student_count || 0}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(batch)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDeletingBatch(batch); setShowDeleteConfirm(true) }}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </DialogContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingBatch?.name}</span>?
              Students in this batch will not be deleted, but will lose their batch assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeletingBatch(null) }} className="border-slate-300">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
