import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "Skillplace Academy - Become Job Ready Engineer in 90 Days",
  description: "Learn Civil, Mechanical, Electrical, Electronics skills with live classes, projects, and placement assistance.",
  keywords: ["engineering courses", "civil engineering", "mechanical engineering", "electrical engineering", "electronics", "AutoCAD", "Revit", "SolidWorks", "PLC training", "Bilaspur"],
  authors: [{ name: "Skillplace Academy" }],
  openGraph: {
    title: "Skillplace Academy - Become Job Ready Engineer in 90 Days",
    description: "Learn Civil, Mechanical, Electrical, Electronics skills with live classes, projects, and placement assistance.",
    type: "website",
    locale: "en_IN",
    siteName: "Skillplace Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillplace Academy - Become Job Ready Engineer in 90 Days",
    description: "Learn engineering skills with live classes, projects, and placement assistance.",
  },
  alternates: {
    canonical: "https://skillplaceacademy.com",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.className} ${jakarta.className}`}>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
