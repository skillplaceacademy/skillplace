'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import SectionReveal from './SectionReveal'

/* ─────────── DATA ─────────── */

const journeyMilestones = [
  {
    phase: '01',
    title: 'Assess',
    tagline: 'Know Where You Stand',
    description: 'We start with a deep-dive assessment of your current skills, interests, and career aspirations. No guesswork — just clarity.',
    details: [
      'One-on-one career consultation',
      'Skills gap analysis',
      'Personalized learning roadmap',
    ],
    icon: 'psychology',
    color: { from: '#3b82f6', to: '#2563eb', glow: '#3b82f620' },
  },
  {
    phase: '02',
    title: 'Build',
    tagline: 'Master In-Demand Skills',
    description: 'Structured, project-based curriculum designed to take you from beginner to job-ready. Learn by doing, not just watching.',
    details: [
      'Industry-aligned curriculum',
      'Real-world project labs',
      'Expert mentor sessions',
    ],
    icon: 'construction',
    color: { from: '#6366f1', to: '#4f46e5', glow: '#6366f120' },
  },
  {
    phase: '03',
    title: 'Showcase',
    tagline: 'Prove Your Expertise',
    description: 'Build a portfolio that speaks louder than any certificate. Recruiters want to see what you can do — we make sure they can.',
    details: [
      'Portfolio-grade projects',
      'GitHub contribution streak',
      'Technical blog & case studies',
    ],
    icon: 'deployed_code',
    color: { from: '#8b5cf6', to: '#7c3aed', glow: '#8b5cf620' },
  },
  {
    phase: '04',
    title: 'Connect',
    tagline: 'Get Discovered',
    description: 'We don\'t just prepare you — we introduce you. Access our hiring partner network and get placed in roles that match your potential.',
    details: [
      'Direct hiring partner introductions',
      'Resume & LinkedIn optimization',
      'Interview coaching & mock rounds',
    ],
    icon: 'handshake',
    color: { from: '#a855f7', to: '#9333ea', glow: '#a855f720' },
  },
]

const outcomes = [
  { value: '87%', label: 'Placement Rate', sublabel: 'within 6 months', icon: 'trending_up' },
  { value: '2,400+', label: 'Students Placed', sublabel: 'across 50+ companies', icon: 'groups' },
  { value: '4.8★', label: 'Mentor Rating', sublabel: 'from 1,200+ reviews', icon: 'star' },
  { value: '₹4.2L', label: 'Avg Starting CTC', sublabel: 'for fresh graduates', icon: 'payments' },
]

const trustSignals = [
  { icon: 'verified', text: 'Industry-recognized certifications' },
  { icon: 'support_agent', text: 'Dedicated career support team' },
  { icon: 'gpp_good', text: 'Job assurance program' },
  { icon: 'groups_3', text: 'Active alumni network of 2,000+' },
]

/* ─────────── COMPONENT ─────────── */

export default function CareerGuidance() {
  const [activeMilestone, setActiveMilestone] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToMilestone = (idx: number) => {
    setActiveMilestone(idx)
    if (scrollRef.current) {
      const child = scrollRef.current.children[idx] as HTMLElement
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }

  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden bg-surface">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        {/* ═══════════════════════════════════════
            HEADER
            ═══════════════════════════════════════ */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4 font-label-md">
            Career Guidance
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
            We Don&apos;t Just Train.
            <br />
            <span className="gradient-text">We Launch Careers.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            SkillPlace Academy is the bridge between where you are and where you deserve to be. 
            Our career guidance system is designed to get you hired — not just certified.
          </p>
        </SectionReveal>

        {/* ═══════════════════════════════════════
            MOBILE: Horizontal Stepper (snap-scroll)
            ═══════════════════════════════════════ */}
        <div className="lg:hidden mb-12">
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {journeyMilestones.map((m, idx) => (
              <button
                key={idx}
                onClick={() => scrollToMilestone(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 font-label-md ${
                  idx === activeMilestone
                    ? 'bg-secondary text-white shadow-md shadow-secondary/20'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{m.phase}</span>
                <span className="hidden sm:inline">{m.title}</span>
              </button>
            ))}
          </div>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 -mx-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={(e) => {
              const container = e.currentTarget
              const scrollLeft = container.scrollLeft
              const cardWidth = container.children[0]
                ? (container.children[0] as HTMLElement).offsetWidth + 16
                : 0
              if (cardWidth > 0) {
                setActiveMilestone(Math.round(scrollLeft / cardWidth))
              }
            }}
          >
            {journeyMilestones.map((m, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[85vw] sm:w-[70vw] snap-center snap-always"
              >
                <div className="relative h-full p-6 rounded-2xl border border-border-subtle bg-white/80 backdrop-blur-sm overflow-hidden group hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                  {/* Phase badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${m.color.from}, ${m.color.to})`,
                        boxShadow: `0 4px 16px ${m.color.glow}`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                        {m.icon}
                      </span>
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: `${m.color.from}12`, color: m.color.from }}
                      >
                        Phase {m.phase}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{m.title}</h3>
                  <p className="text-sm font-semibold text-secondary mb-2">{m.tagline}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{m.description}</p>

                  <ul className="space-y-2">
                    {m.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                          check_circle
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile swipe cue */}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-caption text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
            <span>Swipe to explore each phase</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            DESKTOP: Timeline Stepper
            ═══════════════════════════════════════ */}
        <div className="hidden lg:block mb-16">
          <SectionReveal stagger>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-purple-500/30" />

              {/* Steps */}
              <div className="grid grid-cols-4 gap-6 relative">
                {journeyMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="group relative cursor-pointer"
                    onMouseEnter={() => setActiveMilestone(idx)}
                  >
                    {/* Step dot */}
                    <div className="flex justify-center mb-6">
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl z-10"
                        style={{
                          background: `linear-gradient(135deg, ${m.color.from}, ${m.color.to})`,
                          boxShadow: `0 4px 24px ${m.color.glow}`,
                        }}
                      >
                        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                          {m.icon}
                        </span>
                        {/* Pulse ring on hover */}
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse-ring transition-opacity duration-300"
                          style={{ boxShadow: `0 0 0 8px ${m.color.glow}` }}
                        />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${
                      idx === activeMilestone
                        ? 'bg-white border-secondary/30 shadow-xl shadow-secondary/5'
                        : 'bg-white/60 border-border-subtle hover:bg-white hover:border-border-subtle hover:shadow-md'
                    }`}>
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 font-label-md"
                        style={{ background: `${m.color.from}12`, color: m.color.from }}
                      >
                        Phase {m.phase}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{m.title}</h3>
                      <p className="text-sm font-semibold text-secondary mb-2">{m.tagline}</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{m.description}</p>

                      <ul className="space-y-2">
                        {m.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                              check_circle
                            </span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* ═══════════════════════════════════════
            OUTCOMES SECTION
            ═══════════════════════════════════════ */}
        <SectionReveal>
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50 mb-16">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.04] via-white/80 to-violet-500/[0.04] backdrop-blur-sm" />
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                  The Results Speak for Themselves
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Our career guidance system delivers measurable outcomes — not empty promises.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {outcomes.map((o, idx) => (
                  <div key={idx} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-3 group-hover:bg-secondary/15 transition-colors">
                      <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                        {o.icon}
                      </span>
                    </div>
                    <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg gradient-text mb-1">
                      {o.value}
                    </div>
                    <div className="text-sm font-semibold text-on-surface mb-0.5">{o.label}</div>
                    <div className="text-xs text-on-surface-variant">{o.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* ═══════════════════════════════════════
            TRUST SIGNALS
            ═══════════════════════════════════════ */}
        <SectionReveal stagger>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {trustSignals.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-border-subtle shadow-sm hover:border-secondary/25 hover:shadow-md transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {t.icon}
                </span>
                <span className="text-sm font-semibold text-on-surface">{t.text}</span>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* ═══════════════════════════════════════
            CTA
            ═══════════════════════════════════════ */}
        <SectionReveal className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="shimmer-btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                rocket_launch
              </span>
              Start Your Career Journey
            </Link>
            <Link
              href="/contact"
              className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-secondary/25 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                calendar_month
              </span>
              Book Free Consultation
            </Link>
          </div>
          <p className="mt-4 text-sm text-on-surface-variant">
            No commitment required. Talk to a career advisor — it&apos;s free.
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
