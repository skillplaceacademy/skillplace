'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { getRecords } from '@/lib/admin-api'

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  profiles: { full_name: string | null } | null
  courses: { title: string } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    setLoading(true)
    const data = await getRecords('payments')
    if (data) {
      setPayments(data.sort((a: Payment, b: Payment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  const filteredPayments = payments.filter((p) =>
    p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.courses?.title?.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const completedCount = payments.filter((p) => p.status === 'completed').length
  const pendingCount = payments.filter((p) => p.status === 'pending').length

  const now = new Date()
  const thisMonth = payments.filter((p) => {
    const d = new Date(p.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'completed'
  })
  const revenueThisMonth = thisMonth.reduce((sum, p) => sum + p.amount, 0)

  const courseRevenue: Record<string, number> = {}
  payments
    .filter((p) => p.status === 'completed')
    .forEach((p) => {
      const title = p.courses?.title || 'Unknown'
      courseRevenue[title] = (courseRevenue[title] || 0) + p.amount
    })
  const topCourses = Object.entries(courseRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <Button variant="outline" className="gap-2 border-slate-300 hover:bg-slate-50"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{revenueThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {topCourses.length > 0 && (
        <Card className="border-slate-200 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-900">Top Selling Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCourses.map(([title, revenue]) => (
                <div key={title} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{title}</span>
                  <span className="text-sm font-bold text-slate-900">₹{revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search payments..."
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
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Amount</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No payments found.</td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{(payment.profiles?.full_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{payment.profiles?.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{payment.courses?.title || 'Unknown'}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-900">₹{payment.amount}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        payment.status === 'completed' ? 'default' :
                        payment.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-700 border-0' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-0' :
                        'bg-red-100 text-red-700 border-0'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(payment.created_at).toLocaleDateString()}
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
