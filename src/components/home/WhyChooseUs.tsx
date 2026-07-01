'use client'

import Link from 'next/link'
import SectionReveal from './SectionReveal'

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const comparisonTraditional = [
  'Only theory, no practical work',
  'Outdated tools & methods',
  'No real projects or portfolio',
  'No career guidance',
  'No placement support',
  'No interview preparation',
  'Large batch, no personal attention',
  'Certificate without skills',
]

const comparisonSkillPlace = [
  '70% practical, 30% theory',
  'Industry-standard software & tools',
  'Live client projects during training',
  '1-on-1 career mentorship',
  'Dedicated placement assistance',
  'Mock interviews & resume coaching',
  'Small batches, personal mentorship',
  'Portfolio that proves your skills',
]

const advantages = [
  {
    category: 'Learn Like an Engineer',
    tagline: 'Not a classroom — a launchpad',
    icon: 'construction',
    color: { from: '#3b82f6', to: '#2563eb' },
    items: [
      { label: 'Practical Training', desc: '70% hands-on with real equipment' },
      { label: 'Industry Equipment', desc: 'Work with tools companies actually use' },
      { label: 'Modern Labs', desc: 'Purpose-built training environments' },
    ],
  },
  {
    category: 'Build Real Experience',
    tagline: 'Projects that matter, skills that stick',
    icon: 'rocket_launch',
    color: { from: '#8b5cf6', to: '#7c3aed' },
    items: [
      { label: 'Live Client Projects', desc: 'Solve real business problems' },
      { label: 'Team Collaboration', desc: 'Work like you would in a company' },
      { label: 'Portfolio Creation', desc: 'Graduate with proof of your skills' },
    ],
  },
  {
    category: 'Become Job Ready',
    tagline: 'From learning to earning — seamlessly',
    icon: 'work',
    color: { from: '#10b981', to: '#059669' },
    items: [
      { label: 'Resume Building', desc: 'Get shortlisted, not ignored' },
      { label: 'LinkedIn Optimization', desc: 'Attract recruiters organically' },
      { label: 'Interview Preparation', desc: 'Practice before facing real panels' },
      { label: 'Communication Skills', desc: 'Confidence that lands the offer' },
    ],
  },
  {
    category: 'Launch Your Career',
    tagline: 'Your first step into the industry',
    icon: 'trending_up',
    color: { from: '#f59e0b', to: '#d97706' },
    items: [
      { label: 'Placement Guidance', desc: 'We connect you with hiring partners' },
      { label: 'Freelancing Support', desc: 'Build your own client base' },
      { label: 'Startup Mentorship', desc: 'For those who want to build something new' },
    ],
  },
]

const journeySteps = [
  { icon: 'person', label: 'You', sublabel: 'Ready to start' },
  { icon: 'school', label: 'Training', sublabel: 'Practical skills' },
  { icon: 'build_circle', label: 'Projects', sublabel: 'Real experience' },
  { icon: 'badge', label: 'Portfolio', sublabel: 'Proof of work' },
  { icon: 'record_voice_over', label: 'Interview', sublabel: 'Confidence' },
  { icon: 'work', label: 'Job Offer', sublabel: 'Career launched' },
  { icon: 'rocket_launch', label: 'Growth', sublabel: 'Unlimited potential' },
]

const careerOutcomes = [
  { icon: 'architecture', title: 'Civil CAD Engineer', color: '#3b82f6' },
  { icon: 'schema', title: 'Structural Designer', color: '#6366f1' },
  { icon: 'bolt', title: 'Electrical Design Engineer', color: '#f59e0b' },
  { icon: 'precision_manufacturing', title: 'Automation Engineer', color: '#10b981' },
  { icon: 'memory', title: 'PLC Programmer', color: '#8b5cf6' },
  { icon: 'view_in_ar', title: 'BIM Engineer', color: '#ec4899' },
  { icon: 'settings', title: 'Mechanical Design Engineer', color: '#ef4444' },
  { icon: 'laptop_mac', title: 'Freelancer', color: '#06b6d4' },
  { icon: 'rocket_launch', title: 'Startup Founder', color: '#f97316' },
  { icon: 'engineering', title: 'Project Engineer', color: '#14b8a6' },
]

const trustSignals = [
  { icon: 'group', text: 'Industry Mentors' },
  { icon: 'fitness_center', text: 'Hands-on Labs' },
  { icon: 'code', text: 'Live Projects' },
  { icon: 'devices', text: 'Modern Software' },
  { icon: 'work', text: 'Placement Guidance' },
  { icon: 'record_voice_over', text: 'Interview Coaching' },
  { icon: 'support_agent', text: 'Career Support' },
  { icon: 'payments', text: 'EMI Available' },
  { icon: 'group_work', text: 'Small Batch Size' },
  { icon: 'psychology', text: 'Personal Mentorship' },
  { icon: 'verified', text: 'Certificates' },
  { icon: 'deployed_code', text: 'Real Portfolio' },
]

/* ═══════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════ */

function ComparisonBlock() {
  return (
    <SectionReveal>
      <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50 mb-16">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-surface-container-low/50 to-white/80 backdrop-blur-sm" />
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
              The Difference Is Clear
            </h3>
            <p className="text-sm text-on-surface-variant">
              See what you get with SkillPlace vs. a traditional institute.
            </p>
          </div>

          {/* Comparison grid */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-0">
            {/* Traditional */}
            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-r-none bg-red-50/60 border border-red-100/80">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: '"FILL" 1' }}>
                    school
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Traditional Institute</h4>
                  <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">The old way</span>
                </div>
              </div>
              <ul className="space-y-2.5">
                {comparisonTraditional.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface-variant/80">
                    <span className="material-symbols-outlined text-[16px] text-red-400 mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                      close
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* VS divider (mobile) / vertical divider (desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-secondary/20">
                VS
              </div>
            </div>
            <div className="flex md:hidden items-center justify-center py-2">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary to-accent text-white text-xs font-bold shadow-md">
                VS
              </div>
            </div>

            {/* SkillPlace */}
            <div className="relative p-6 md:p-8 rounded-2xl md:rounded-l-none bg-gradient-to-br from-secondary/[0.04] to-accent/[0.04] border border-secondary/10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    star
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">SkillPlace Academy</h4>
                  <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">The new way</span>
                </div>
              </div>
              <ul className="space-y-2.5">
                {comparisonSkillPlace.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                      check_circle
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  )
}

function AdvantageCard({ advantage, idx }: { advantage: (typeof advantages)[0]; idx: number }) {
  return (
    <SectionReveal direction={idx % 2 === 0 ? 'left' : 'right'}>
      <div className="group relative p-6 md:p-8 rounded-2xl border border-border-subtle bg-white hover:border-secondary/25 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
        {/* Hover gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${advantage.color.from}08, ${advantage.color.to}05)`,
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${advantage.color.from}, ${advantage.color.to})`,
              }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                {advantage.icon}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 font-label-md">
                Category {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{advantage.category}</h3>
          <p className="text-sm text-secondary font-medium mb-5">{advantage.tagline}</p>

          {/* Items */}
          <ul className="space-y-3">
            {advantage.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors duration-300"
                  style={{ background: `${advantage.color.from}12` }}
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ color: advantage.color.from, fontVariationSettings: '"FILL" 1' }}
                  >
                    check
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                  <span className="text-sm text-on-surface-variant ml-1.5">— {item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionReveal>
  )
}

function JourneyFlow() {
  return (
    <SectionReveal>
      <div className="mb-16">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
            Your Transformation Journey
          </h3>
          <p className="text-sm text-on-surface-variant">
            From curious learner to confident professional — every step is designed for your success.
          </p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="absolute top-6 left-[4%] right-[4%] h-0.5 bg-gradient-to-r from-blue-500/20 via-violet-500/30 to-emerald-500/20" />

            {journeySteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center z-10 group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${idx <= 2 ? '#3b82f6' : idx <= 4 ? '#8b5cf6' : '#10b981'}, ${idx <= 2 ? '#2563eb' : idx <= 4 ? '#7c3aed' : '#059669'})`,
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {step.icon}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface mb-0.5">{step.label}</span>
                <span className="text-[10px] text-on-surface-variant text-center max-w-[80px]">{step.sublabel}</span>

                {/* Arrow between steps */}
                {idx < journeySteps.length - 1 && (
                  <span className="material-symbols-outlined absolute top-4 -right-3 text-on-surface-variant/30 text-[16px]">
                    arrow_forward
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: horizontal snap scroll */}
        <div className="md:hidden">
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {journeySteps.map((step, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[28vw] snap-center snap-always"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${idx <= 2 ? '#3b82f6' : idx <= 4 ? '#8b5cf6' : '#10b981'}, ${idx <= 2 ? '#2563eb' : idx <= 4 ? '#7c3aed' : '#059669'})`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {step.icon}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface mb-0.5">{step.label}</span>
                  <span className="text-[10px] text-on-surface-variant">{step.sublabel}</span>

                  {idx < journeySteps.length - 1 && (
                    <span className="material-symbols-outlined mt-2 text-on-surface-variant/30 text-[14px]">
                      arrow_forward
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
            <span>Swipe to see the full journey</span>
          </div>
        </div>
      </div>
    </SectionReveal>
  )
}

function CareerOutcomes() {
  return (
    <SectionReveal>
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
            Careers You Can Launch
          </h3>
          <p className="text-sm text-on-surface-variant">
            Our graduates don&apos;t just get jobs — they launch careers in high-demand engineering roles.
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-5 gap-4 max-w-4xl mx-auto">
          {careerOutcomes.map((career, idx) => (
            <div
              key={idx}
              className="group relative p-4 rounded-2xl border border-border-subtle bg-white text-center hover:border-secondary/25 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${career.color}12` }}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: career.color, fontVariationSettings: '"FILL" 1' }}
                >
                  {career.icon}
                </span>
              </div>
              <span className="text-xs font-semibold text-on-surface leading-tight block">{career.title}</span>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden">
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {careerOutcomes.map((career, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[42vw] snap-center snap-always"
              >
                <div className="p-4 rounded-2xl border border-border-subtle bg-white text-center">
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: `${career.color}12` }}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ color: career.color, fontVariationSettings: '"FILL" 1' }}
                    >
                      {career.icon}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface leading-tight block">{career.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  )
}

function TrustSection() {
  return (
    <SectionReveal stagger>
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
            Everything You Need to Succeed
          </h3>
          <p className="text-sm text-on-surface-variant">
            Every resource, mentor, and tool — designed to get you hired.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {trustSignals.map((signal, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center text-center p-4 rounded-2xl border border-border-subtle bg-white hover:border-secondary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/[0.07] flex items-center justify-center mb-2 group-hover:bg-secondary/[0.12] transition-colors duration-300">
                <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {signal.icon}
                </span>
              </div>
              <span className="text-xs font-semibold text-on-surface leading-tight">{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  )
}

function FinalCTA() {
  return (
    <SectionReveal className="text-center">
      <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-white/80 to-violet-500/[0.04] backdrop-blur-sm" />
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-14">
          <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-3">
            Ready to Build a Career{' '}
            <span className="gradient-text">You Can Be Proud Of?</span>
          </h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
            Join SkillPlace Academy and learn the skills companies actually hire for.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="shimmer-btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                rocket_launch
              </span>
              Start Learning Today
            </Link>
            <Link
              href="/contact"
              className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-secondary/25 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                support_agent
              </span>
              Talk to a Career Mentor
            </Link>
          </div>

          <p className="mt-4 text-sm text-on-surface-variant">
            No commitment required. Get a free career consultation — even if you don&apos;t enroll.
          </p>
        </div>
      </div>
    </SectionReveal>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function WhyChooseUs() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        {/* ═══════════════════════════════════════
            HEADER
            ═══════════════════════════════════════ */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4 font-label-md">
            The SkillPlace Advantage
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
            More Than a Course —{' '}
            <span className="gradient-text">A Complete Career System</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            SkillPlace Academy doesn&apos;t just teach skills. We engineer careers. 
            Every program is designed to take you from learning to earning — with measurable outcomes.
          </p>
        </SectionReveal>

        {/* ═══════════════════════════════════════
            COMPARISON BLOCK
            ═══════════════════════════════════════ */}
        <ComparisonBlock />

        {/* ═══════════════════════════════════════
            ADVANTAGES (4 categories)
            ═══════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {advantages.map((adv, idx) => (
            <AdvantageCard key={idx} advantage={adv} idx={idx} />
          ))}
        </div>

        {/* ═══════════════════════════════════════
            JOURNEY FLOW
            ═══════════════════════════════════════ */}
        <JourneyFlow />

        {/* ═══════════════════════════════════════
            CAREER OUTCOMES
            ═══════════════════════════════════════ */}
        <CareerOutcomes />

        {/* ═══════════════════════════════════════
            TRUST SIGNALS
            ═══════════════════════════════════════ */}
        <TrustSection />

        {/* ═══════════════════════════════════════
            CTA
            ═══════════════════════════════════════ */}
        <FinalCTA />
      </div>
    </section>
  )
}
