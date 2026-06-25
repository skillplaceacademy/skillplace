'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_THEMES,
  type CertificateRecord,
} from '@/lib/certificate-types'
import { getRecords } from '@/lib/admin-api'
import BulkCertificateIssuer from '@/components/admin/BulkCertificateIssuer'

export default function BulkCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showBulkIssuer, setShowBulkIssuer] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    setLoading(true)
    const data = await getRecords(
      'certificates',
      undefined,
      undefined,
      '*,profiles(full_name,email),courses(title,duration_hours)'
    )
    setCertificates(
      (data || []).sort(
        (a: CertificateRecord, b: CertificateRecord) =>
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
      )
    )
    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <Link href="/admin-place/certificates" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Certificate Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Issue certificates to multiple students at once
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowBulkIssuer(true)}>
          <Download className="h-4 w-4" /> Bulk Issue Certificates
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">How Bulk Issue Works</h2>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>Select a course to see all enrolled students</li>
          <li>Check the students you want to issue certificates for</li>
          <li>Choose a certificate type and theme (applies to entire batch)</li>
          <li>Preview a sample certificate</li>
          <li>Click &quot;Issue Certificates&quot; to generate all certificates at once</li>
        </ol>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Recent Certificates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Theme</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Certificate #</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Issued</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No certificates found. Issue your first certificate!
                  </td>
                </tr>
              ) : (
                certificates.slice(0, 50).map((cert) => {
                  const typeInfo = CERTIFICATE_TYPES.find((t) => t.id === cert.certificate_type)
                  const themeInfo = CERTIFICATE_THEMES.find((t) => t.id === cert.theme)
                  return (
                    <tr key={cert.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">{(cert.profiles?.full_name || 'U').charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">{cert.profiles?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {typeInfo ? (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Course</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {themeInfo ? (
                          <Badge variant="outline" className="text-xs gap-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: themeInfo.primary }} />
                            {themeInfo.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{cert.courses?.title || '-'}</td>
                      <td className="px-5 py-3.5 text-sm font-mono font-medium text-slate-900">{cert.certificate_number}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1 hover:bg-blue-50 hover:text-blue-600">
                            <Download className="h-4 w-4" /> PDF
                          </Button>
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkCertificateIssuer
        open={showBulkIssuer}
        onClose={() => setShowBulkIssuer(false)}
        onComplete={() => {
          setShowBulkIssuer(false)
          fetchCertificates()
        }}
      />
    </div>
  )
}
