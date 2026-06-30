import Link from 'next/link'
import { getCourses, getTestimonials, getTrainingPrograms } from '@/lib/supabase/queries'
import { getProgramImage } from '@/lib/utils'
import ScrollProgress from '@/components/home/ScrollProgress'
import TrustIndicators from '@/components/home/TrustIndicators'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import StudentJourney from '@/components/home/StudentJourney'
import SkillsToCareer from '@/components/home/SkillsToCareer'
import CareerOpportunities from '@/components/home/CareerOpportunities'
import CareerGuidance from '@/components/home/CareerGuidance'
import IndustryPartners from '@/components/home/IndustryPartners'
import MeetMentors from '@/components/home/MeetMentors'
import StudentSuccess from '@/components/home/StudentSuccess'
import WhyTrustUs from '@/components/home/WhyTrustUs'
import FAQ from '@/components/home/FAQ'
import FinalCTA from '@/components/home/FinalCTA'

import HeroSection from '@/components/home/HeroSection'
import CareerPathQuiz from '@/components/home/CareerPathQuiz'
import ConsultationBooking from '@/components/home/ConsultationBooking'
import JobCoursesSection from '@/components/home/JobCoursesSection'

export const dynamic = 'force-dynamic'

const renderBadge = (type: string) => {
  switch (type) {
    case 'online':
      return (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
        </div>
      )
    case 'offline':
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
        </div>
      )
    case 'hybrid':
      return (
        <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
        </div>
      )
    default:
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">{type}</span>
        </div>
      )
  }
}

const getCoursesList = (dbCourses: string[], fallbacks: string[]) => {
  return dbCourses.length > 0 ? dbCourses : fallbacks
}

const displayReview = (review: string) => {
  let clean = review.trim()
  if (clean.startsWith('\u201C') || clean.startsWith('"')) {
    clean = clean.slice(1)
  }
  if (clean.endsWith('\u201D') || clean.endsWith('"')) {
    clean = clean.slice(0, -1)
  }
  return `\u201C${clean}\u201D`
}

export default async function Home() {
  const [courses, testimonials, trainingPrograms] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getTrainingPrograms(),
  ])

  // Extract dynamic courses per branch
  const civilCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'civil').slice(0, 6).map((c: any) => c.title)
  const mechanicalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'mechanical').slice(0, 4).map((c: any) => c.title)
  const electricalCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electrical').slice(0, 4).map((c: any) => c.title)
  const electronicsCoursesFromDb = courses.filter((c: any) => c.branches?.slug === 'electronics').slice(0, 5).map((c: any) => c.title)
  const softSkillsCoursesFromDb = courses.filter((c: any) => !c.branches).slice(0, 4).map((c: any) => c.title)

  // Fallbacks
  const civilList = getCoursesList(civilCoursesFromDb, ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution'])
  const mechanicalList = getCoursesList(mechanicalCoursesFromDb, ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing'])
  const electricalList = getCoursesList(electricalCoursesFromDb, ['LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'])
  const electronicsList = getCoursesList(electronicsCoursesFromDb, ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD'])
  const softSkillsList = getCoursesList(softSkillsCoursesFromDb, ['Resume Building', 'Interview Prep', 'LinkedIn Profile', 'Mock Interviews'])

  // Dynamic Testimonials
  const defaultTestimonials = [
    { id: 't1', student_name: 'Kavita Dubey', course_name: 'Interview Preparation', rating: 5, review: 'Mock interviews boosted my confidence. The personalized feedback was the turning point for me.' },
    { id: 't2', student_name: 'Rahul Verma', course_name: 'AutoCAD 3D', rating: 5, review: 'Excellent course! Got placed in a design firm within 2 months of completing the AutoCAD program.' },
    { id: 't3', student_name: 'Priya Sharma', course_name: 'Revit Architecture', rating: 5, review: 'Best Revit course in Bilaspur. Real project training made all the difference in understanding workflow.' },
  ]
  const testimonialsList = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials

  return (
    <>
      <ScrollProgress />

      {/* ═══════════════════════════════════════════
          1. HERO SECTION (Premium Dark)
          ═══════════════════════════════════════════ */}
      <HeroSection />

      {/* ═══════════════════════════════════════════
          2. TRUST INDICATORS
          ═══════════════════════════════════════════ */}
      <TrustIndicators />

      {/* ═══════════════════════════════════════════
          3. WHY CHOOSE SKILLPLACE ACADEMY
          ═══════════════════════════════════════════ */}
      <WhyChooseUs />

      {/* ═══════════════════════════════════════════
          3.5 INTERACTIVE CAREER PATH FINDER QUIZ
          ═══════════════════════════════════════════ */}
      <CareerPathQuiz />

      {/* ═══════════════════════════════════════════
          4. STUDENT JOURNEY TIMELINE
          ═══════════════════════════════════════════ */}
      <StudentJourney />

      {/* ═══════════════════════════════════════════
          5. BUILD SKILLS → BUILD CAREER INFOGRAPHIC
          ═══════════════════════════════════════════ */}
      <SkillsToCareer />

      {/* ═══════════════════════════════════════════
          6. CAREER OPPORTUNITIES
          ═══════════════════════════════════════════ */}
      <CareerOpportunities />

      {/* ═══════════════════════════════════════════
          7. CAREER GUIDANCE
          ═══════════════════════════════════════════ */}
      <CareerGuidance />

      {/* ═══════════════════════════════════════════
          7.5 BOOK A FREE CAREER CONSULTATION
          ═══════════════════════════════════════════ */}
      <ConsultationBooking />

      {/* ═══════════════════════════════════════════
          8. OUR TRAINING PROGRAMS (existing)
          ═══════════════════════════════════════════ */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="programs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">Our Training Programs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Choose the learning format that works best for you. Specialized curriculum tailored for mechanical, civil, and electrical engineers.</p>
          </div>
          <Link href="/programs" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
            View All Programs
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>

        <div 
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trainingPrograms.length > 0 ? (
            trainingPrograms.slice(0, 6).map((p: any) => (
              <Link href={`/programs/${p.slug}`} key={p.id} className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 flex flex-col h-full block min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt={p.name} src={getProgramImage(p.branches?.slug)} />
                  {renderBadge(p.program_type)}
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors line-clamp-2">{p.name}</h3>
                    <ul className="space-y-3 mb-8">
                      {(p.features || []).slice(0, 3).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-auto">
                    <div>
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                      <span className="text-headline-md font-bold text-primary">₹{p.price?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                      <span className="font-bold">{p.duration_weeks} weeks</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <>
              {/* Static Default Fallbacks */}
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Civil Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Civil Engineering Online</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Online Course Access</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Doubt Sessions</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Training Certificate</li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹29,999</span></div>
                    <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">24 weeks</span></div>
                  </div>
                </div>
              </div>
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Mechanical Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-mechanical-engineering.jpg" />
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Mechanical Engineering Offline</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>100% Job Assistance</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Soft Skills Training</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Hands-on Practical</li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹44,999</span></div>
                    <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">48 weeks</span></div>
                  </div>
                </div>
              </div>
              <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
                <div className="relative aspect-video">
                  <img className="w-full h-full object-cover" alt="Electronics & Automation" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-electronics-automation.jpg" />
                  <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
                    <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Electronics &amp; Automation</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>PLC &amp; SCADA Training</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Industry Expert Mentorship</li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Site Visits</li>
                  </ul>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                    <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹39,999</span></div>
                    <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">36 weeks</span></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile Swipe Cue */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
          <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
          <span>Swipe to see all training programs</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. JOB-ORIENTED COURSES (Desktop Bento & Mobile Tabs)
          ═══════════════════════════════════════════ */}
      <JobCoursesSection
        civilList={civilList}
        mechanicalList={mechanicalList}
        electricalList={electricalList}
        electronicsList={electronicsList}
        softSkillsList={softSkillsList}
      />

      {/* ═══════════════════════════════════════════
          10. INDUSTRY PARTNERS
          ═══════════════════════════════════════════ */}
      <IndustryPartners />

      {/* ═══════════════════════════════════════════
          11. MEET OUR MENTORS
          ═══════════════════════════════════════════ */}
      <MeetMentors />

      {/* ═══════════════════════════════════════════
          12. STUDENT SUCCESS
          ═══════════════════════════════════════════ */}
      <StudentSuccess />

      {/* ═══════════════════════════════════════════
          13. WHY STUDENTS TRUST US (Stats)
          ═══════════════════════════════════════════ */}
      <WhyTrustUs />

      {/* ═══════════════════════════════════════════
          14. TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="py-section-gap bg-surface text-on-surface overflow-hidden relative border-b border-border-subtle/40">
        <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">What Our Students Say</h2>
          <p className="font-body-md text-on-surface-variant">Hear from students who transformed their careers at SkillPlace Academy</p>
        </div>
        <div 
          className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonialsList.map((t: any) => (
            <div className="bg-white p-8 rounded-2xl border border-border-subtle hover:border-secondary/30 transition-all flex flex-col justify-between min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always card-shadow" key={t.id}>
              <div>
                <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full w-fit mb-6 shadow-sm">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < (t.rating || 5)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-amber-300/40 fill-none stroke-amber-500/40'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 ml-1">{(t.rating || 5).toFixed(1)}</span>
                </div>
                <p className="font-body-lg text-body-lg mb-10 max-w-2xl text-on-surface-variant">{displayReview(t.review)}</p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary uppercase">
                  {t.student_name ? t.student_name[0] : 'S'}
                </div>
                <div>
                  <p className="font-bold text-on-surface">{t.student_name}</p>
                  <p className="text-caption uppercase text-on-surface-variant">{t.course_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Cue */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold relative z-10">
          <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
          <span>Swipe to see all reviews</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          15. FAQ
          ═══════════════════════════════════════════ */}
      <FAQ />

      {/* ═══════════════════════════════════════════
          16. FINAL CTA
          ═══════════════════════════════════════════ */}
      <FinalCTA />
    </>
  )
}
