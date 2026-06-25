export const PROGRAM_TYPES = [
  { id: 'online_course', label: 'Online Course', icon: '💻', color: 'blue' },
  { id: 'offline', label: 'Offline', icon: '🏫', color: 'green' },
  { id: 'hybrid', label: 'Hybrid', icon: '🔄', color: 'purple' },
  { id: 'single_course', label: 'Single Course', icon: '📖', color: 'orange' },
] as const

export type ProgramType = typeof PROGRAM_TYPES[number]['id']

export const PROGRAM_TYPE_COLORS: Record<string, string> = {
  online_course: 'bg-blue-100 text-blue-700',
  offline: 'bg-green-100 text-green-700',
  hybrid: 'bg-purple-100 text-purple-700',
  single_course: 'bg-orange-100 text-orange-700',
}
