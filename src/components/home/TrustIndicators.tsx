import SectionReveal from './SectionReveal'

const trustItems = [
  { icon: 'workspace_premium', title: 'Practical Training', desc: '70% hands-on learning', color: 'from-blue-500 to-blue-600' },
  { icon: 'diversity_3', title: 'Industry Mentors', desc: 'Learn from experts', color: 'from-violet-500 to-violet-600' },
  { icon: 'engineering', title: 'Real Projects', desc: 'Build live projects', color: 'from-emerald-500 to-emerald-600' },
  { icon: 'support_agent', title: 'Career Guidance', desc: 'Personal mentorship', color: 'from-amber-500 to-amber-600' },
  { icon: 'handshake', title: 'Placement Support', desc: 'Direct recruiter connections', color: 'from-rose-500 to-rose-600' },
  { icon: 'verified', title: 'Certificates', desc: 'Recognized credentials', color: 'from-cyan-500 to-cyan-600' },
  { icon: 'history', title: 'Lifetime Learning', desc: 'Access anytime', color: 'from-indigo-500 to-indigo-600' },
  { icon: 'agent', title: 'Community Support', desc: '2,000+ members', color: 'from-pink-500 to-pink-600' },
]

export default function TrustIndicators() {
  return (
    <section className="relative py-8 px-margin-mobile md:px-margin-desktop bg-surface border-b border-border-subtle overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal stagger>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {trustItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-border-subtle hover:border-secondary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block leading-tight">{item.title}</span>
                  <span className="text-[11px] text-on-surface-variant">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
