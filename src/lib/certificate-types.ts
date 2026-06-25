export const CERTIFICATE_TYPES = [
  {
    id: 'course_completion',
    label: 'Course Completion',
    icon: '\ud83c\udf93',
    description: 'Awarded for successfully completing a course',
    fields: ['course_id', 'user_id', 'certificate_number'] as string[],
  },
  {
    id: 'internship',
    label: 'Internship',
    icon: '\ud83d\udcbc',
    description: 'Certificate for completing an internship program',
    fields: ['user_id', 'certificate_number', 'organization_name'] as string[],
  },
  {
    id: 'training',
    label: 'Training',
    icon: '\ud83d\udcda',
    description: 'Certificate for completing training/workshop',
    fields: ['user_id', 'certificate_number', 'organization_name'] as string[],
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: '\u2b50',
    description: 'Work experience verification certificate',
    fields: ['user_id', 'certificate_number', 'organization_name'] as string[],
  },
  {
    id: 'achievement',
    label: 'Achievement',
    icon: '\ud83c\udfc6',
    description: 'Special achievement recognition',
    fields: ['user_id', 'certificate_number', 'custom_message'] as string[],
  },
  {
    id: 'participation',
    label: 'Participation',
    icon: '\ud83d\udccb',
    description: 'Event/program participation certificate',
    fields: ['user_id', 'certificate_number'] as string[],
  },
  {
    id: 'excellence',
    label: 'Excellence',
    icon: '\ud83c\udf1f',
    description: 'Outstanding excellence award',
    fields: ['user_id', 'certificate_number', 'custom_message'] as string[],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '\ud83d\udcdc',
    description: 'Custom certificate with flexible fields',
    fields: ['user_id', 'certificate_number', 'custom_message'] as string[],
  },
] as const

export const CERTIFICATE_THEMES = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Traditional formal, centered layout with ornamental borders',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#d4af37',
    bg: '#f8fafc',
    borderOuter: '#1e40af',
    borderInner: '#bfdbfe',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean minimal with left accent bar',
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#3b82f6',
    bg: '#ffffff',
    borderOuter: '#e2e8f0',
    borderInner: '#e2e8f0',
    textColor: '#1e293b',
    headerFont: 'Inter',
    bodyFont: 'Inter',
  },
  {
    id: 'academic',
    label: 'Academic',
    description: 'Educational institution style with shield crest',
    primary: '#7c2d12',
    secondary: '#dc2626',
    accent: '#d4af37',
    bg: '#fefce8',
    borderOuter: '#7c2d12',
    borderInner: '#fde68a',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Business professional with bold header bar',
    primary: '#1e3a5f',
    secondary: '#2563eb',
    accent: '#1e293b',
    bg: '#ffffff',
    borderOuter: '#e2e8f0',
    borderInner: '#e2e8f0',
    textColor: '#1e293b',
    headerFont: 'Inter',
    bodyFont: 'Inter',
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Artistic award style with decorative left panel',
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#f59e0b',
    bg: '#faf5ff',
    borderOuter: '#7c3aed',
    borderInner: '#ddd6fe',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Premium luxury with ultra-clean whitespace',
    primary: '#0f172a',
    secondary: '#475569',
    accent: '#d4af37',
    bg: '#ffffff',
    borderOuter: '#0f172a',
    borderInner: '#cbd5e1',
    textColor: '#1e293b',
    headerFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
] as const

export type CertificateType = (typeof CERTIFICATE_TYPES)[number]['id']
export type CertificateTheme = (typeof CERTIFICATE_THEMES)[number]['id']

export interface CertificateRecord {
  id: string
  certificate_number: string
  issued_at: string
  certificate_type: string | null
  theme: string | null
  organization_name: string | null
  custom_message: string | null
  user_id: string
  course_id: string | null
  profiles: { full_name: string | null; email: string } | null
  courses: { title: string; duration_hours: number | null } | null
}
