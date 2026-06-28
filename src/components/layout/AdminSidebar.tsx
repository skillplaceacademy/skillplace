'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, CreditCard, MessageSquare, LogOut, GraduationCap, Briefcase, Star, FileText, UserCog, Tag, Bell, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin-place', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-place/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin-place/programs', label: 'Programs', icon: Briefcase },
  { href: '/admin-place/content', label: 'Content', icon: FileText },
  { href: '/admin-place/enrollments', label: 'Enrollments', icon: GraduationCap },
  { href: '/admin-place/placements', label: 'Placements', icon: GraduationCap },
  { href: '/admin-place/schedule', label: 'Schedule', icon: Calendar },
  { href: '/admin-place/students', label: 'Students', icon: Users },
  { href: '/admin-place/employees', label: 'Employees', icon: UserCog },
  { href: '/admin-place/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin-place/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin-place/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin-place/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin-place/payments', label: 'Payments', icon: CreditCard },
]

export default function AdminSidebar({ isAdmin, isOpen, onToggle }: { isAdmin?: boolean; isOpen?: boolean; onToggle?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "sticky top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col shrink-0 transition-transform duration-300",
      "md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">skillplace</span>
              <span className="text-xs text-blue-600 font-semibold">ADMIN</span>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={onToggle}
          >
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
