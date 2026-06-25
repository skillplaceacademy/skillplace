'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Check, Wifi, Users, MapPin } from 'lucide-react'
import { getRecords } from '@/lib/admin-api'

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
  }, [selectedBranch, branches])

  async function fetchBranches() {
    try {
      const data = await getRecords('branches')
      setBranches(data || [])
    } catch (err) {
      console.error('Failed to fetch branches:', err)
      setBranches([])
    }
  }

  async function fetchPrograms() {
    setLoading(true)
    try {
      const branch = branches.find(b => b.slug === selectedBranch)
      if (!branch) { setLoading(false); return }
      const data = await getRecords('training_programs', 'branch_id', branch.id)
      setPrograms(data || [])
    } catch (err) {
      console.error('Failed to fetch programs:', err)
      setPrograms([])
    }
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
