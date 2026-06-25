import { Laptop, Users, Globe, BookOpen } from 'lucide-react'

export type ProgramType = 'online' | 'offline' | 'hybrid' | 'single-course'

export interface ProgramData {
  id: ProgramType
  name: string
  slug: string
  iconName: string
  popular: boolean
  description: string
  features: string[]
  courses: string[]
  duration: string
  careerOutcomes: string[]
  curriculum: string[]
  faqs: { question: string; answer: string }[]
}

export const programs: ProgramData[] = [
  {
    id: 'online',
    name: 'Online Program',
    slug: 'online',
    iconName: 'laptop',
    popular: false,
    description: 'Fully online learning from the comfort of your home. Access world-class training with flexible scheduling and lifetime recording access.',
    features: [
      'Course access',
      'Online doubt sessions',
      'Training certificate',
      'Project completion certificate',
      'Resume building',
      'Career guidance',
      'Lifetime recording access',
      'Interview preparation',
    ],
    courses: [
      'AutoCAD 3D Modeling',
      'Revit Architecture',
      'STAAD Pro Structural',
      'ETABS Structural',
      'ANSYS Mechanical',
      'SolidWorks Design',
      'Embedded Systems',
      'PCB Design',
    ],
    duration: '3-6 months',
    careerOutcomes: [
      'Junior CAD Designer',
      'Structural Analyst',
      'Design Engineer',
      'Freelance Consultant',
      'Remote Engineering Roles',
    ],
    curriculum: [
      'Foundation concepts and software basics',
      'Intermediate techniques and workflows',
      'Advanced features and optimization',
      'Real-world project applications',
      'Portfolio building and resume preparation',
      'Interview preparation and mock sessions',
    ],
    faqs: [
      { question: 'Do I need any prior experience?', answer: 'No prior experience is required. Our online program is designed for beginners and covers everything from scratch.' },
      { question: 'Will I get a certificate?', answer: 'Yes, you will receive a training completion certificate and a project completion certificate upon successful completion.' },
      { question: 'How are doubt sessions conducted?', answer: 'Doubt sessions are conducted live via video calls with instructors, scheduled at convenient times for online students.' },
    ],
  },
  {
    id: 'offline',
    name: 'Offline Program',
    slug: 'offline',
    iconName: 'users',
    popular: true,
    description: 'In-person classes with 100% job assistance. Learn directly from industry experts with hands-on practical training and placement support.',
    features: [
      '100% Job assistance',
      'Soft skills training',
      'Doubt sessions',
      'Live offline classes with recorded video',
      'Site visits',
      'Industry expert mentorship',
      'Internship certificate',
      'Training completion certificate',
      '2 project certificates',
      'Year-gap solution',
      'Resume building',
      'Lifetime recording access',
      'Interview preparation',
    ],
    courses: [
      'AutoCAD 3D Modeling',
      'Revit Architecture',
      'STAAD Pro Structural',
      'ETABS Structural',
      'ANSYS Mechanical',
      'SolidWorks Design',
      'Embedded Systems',
      'PCB Design',
      'HVAC Design',
      'Fire Fighting Systems',
    ],
    duration: '6-12 months',
    careerOutcomes: [
      'Site Engineer',
      'CAD Designer',
      'Structural Engineer',
      'Project Manager',
      'Design Consultant',
      'Industry-ready Professional',
    ],
    curriculum: [
      'Industry-oriented foundation training',
      'Hands-on practical sessions with live projects',
      'Software mastery with real-time applications',
      'Site visits and industrial exposure',
      'Soft skills and personality development',
      'Resume building and portfolio creation',
      'Mock interviews and placement preparation',
    ],
    faqs: [
      { question: 'Is job placement guaranteed?', answer: 'We provide 100% job assistance including resume preparation, mock interviews, and direct referrals to our partner companies.' },
      { question: 'What are the class timings?', answer: 'We offer flexible batches - morning, afternoon, and evening slots to accommodate different schedules.' },
      { question: 'Do you provide internship?', answer: 'Yes, our offline program includes an internship with our partner companies for real-world experience.' },
    ],
  },
  {
    id: 'hybrid',
    name: 'Hybrid Program',
    slug: 'hybrid',
    iconName: 'globe',
    popular: false,
    description: 'Best of both worlds - online learning with offline practical sessions. Perfect for students who want flexibility with hands-on experience.',
    features: [
      'Online course access',
      'Training completion certificate',
      'Industry expert mentorship',
      'Site visits',
      '2 Project completion certificates',
      'Job assistance (final-year students)',
      'Access to both online and offline resources',
      'Resume building',
      'Career guidance',
      'Lifetime recording access',
      'Interview preparation',
    ],
    courses: [
      'AutoCAD 3D Modeling',
      'Revit Architecture',
      'STAAD Pro Structural',
      'ETABS Structural',
      'ANSYS Mechanical',
      'SolidWorks Design',
    ],
    duration: '4-8 months',
    careerOutcomes: [
      'CAD Professional',
      'Junior Structural Engineer',
      'Design Analyst',
      'Freelance Consultant',
      'Industry Professional',
    ],
    curriculum: [
      'Online theoretical foundations',
      'Offline practical lab sessions',
      'Software training with guided exercises',
      'Project-based learning modules',
      'Industry site visits',
      'Career guidance and placement support',
    ],
    faqs: [
      { question: 'How does hybrid learning work?', answer: 'You learn theory online at your own pace and attend scheduled offline sessions for practical training and project work.' },
      { question: 'Can I switch between online and offline?', answer: 'Yes, you can attend offline sessions as per the schedule while accessing all online content simultaneously.' },
      { question: 'Is job assistance available?', answer: 'Job assistance is available for final-year students and graduates who complete the program with required certifications.' },
    ],
  },
  
]

export function getProgramBySlug(slug: string): ProgramData | undefined {
  return programs.find(p => p.slug === slug)
}

export function getProgramById(id: ProgramType): ProgramData | undefined {
  return programs.find(p => p.id === id)
}

const iconMap: Record<string, React.ElementType> = {
  laptop: Laptop,
  users: Users,
  globe: Globe,
  book: BookOpen,
}

export function getProgramIcon(iconName: string): React.ElementType {
  return iconMap[iconName] || Laptop
}
