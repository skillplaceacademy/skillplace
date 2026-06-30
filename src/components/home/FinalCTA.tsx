import Link from 'next/link'
import SectionReveal from './SectionReveal'

export default function FinalCTA() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden">
      <SectionReveal>
        <div className="relative max-w-container-max mx-auto rounded-[2rem] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#091425]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />

          {/* Decorative elements */}
          <div className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-3xl" />

          {/* Floating shapes */}
          <div className="absolute top-8 right-12 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 rotate-12 animate-float" />
          <div className="absolute bottom-8 left-12 w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-float-delayed" />

          {/* Content */}
          <div className="relative z-10 p-12 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-blue-200">Limited Seats Available</span>
            </div>

            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white mb-6 leading-tight">
              Ready to Build Your
              <br />
              <span className="gradient-text">Dream Career?</span>
            </h2>
            <p className="font-body-lg text-body-lg text-blue-100/70 mb-10 max-w-2xl mx-auto">
              Don't just earn a certificate. Build skills that companies value. Join 2,000+ students who transformed their future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="shimmer-btn glow-secondary bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-2xl shadow-blue-600/30"
              >
                Enroll Today
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/courses"
                className="glass text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
              >
                View All Courses
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap text-sm text-blue-300">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                No payment required to explore
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                EMI options available
              </span>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
