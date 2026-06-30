import SectionReveal from './SectionReveal'

const journeySteps = [
  { icon: 'visibility', label: 'Visitor', desc: 'Discover SkillPlace' },
  { icon: 'app_registration', label: 'Enroll', desc: 'Join a program' },
  { icon: 'school', label: 'Learn Skills', desc: 'Master tools' },
  { icon: 'fitness_center', label: 'Practice', desc: 'Hands-on exercises' },
  { icon: 'build_circle', label: 'Build Projects', desc: 'Real deliverables' },
  { icon: 'badge', label: 'Portfolio', desc: 'Showcase work' },
  { icon: 'co_present', label: 'Interview Prep', desc: 'Mock sessions' },
  { icon: 'work', label: 'Get Job', desc: 'Dream role' },
  { icon: 'monitoring', label: 'Grow Career', desc: 'Advancement' },
]

const stepColors = [
  'from-blue-500 to-blue-600',
  'from-blue-600 to-indigo-600',
  'from-indigo-500 to-violet-600',
  'from-violet-500 to-violet-600',
  'from-violet-600 to-purple-600',
  'from-purple-500 to-fuchsia-600',
  'from-fuchsia-500 to-pink-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-emerald-600',
]

export default function StudentJourney() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Your Path</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            From Visitor to Engineer
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Every step is designed to take you closer to your dream career. No shortcuts, just proven methods.
          </p>
        </SectionReveal>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-[52px] left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-blue-500/20 via-secondary to-emerald-500/20 rounded-full" />

          <div className="grid grid-cols-9 gap-2">
            {journeySteps.map((step, idx) => (
              <SectionReveal key={idx} direction="up">
                <div className="flex flex-col items-center text-center relative">
                  {/* Circle */}
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${stepColors[idx]} flex items-center justify-center text-white shadow-lg relative z-10 ring-4 ring-white`}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {step.icon}
                    </span>
                  </div>
                  {/* Label */}
                  <div className="mt-4">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Step {idx + 1}</span>
                    <h4 className="font-bold text-sm text-on-surface mt-0.5">{step.label}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{step.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden relative pl-14">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-secondary to-emerald-500 rounded-full" />
          <div className="space-y-6">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-14 top-0 w-10 h-10 rounded-full bg-gradient-to-br ${stepColors[idx]} flex items-center justify-center text-white shadow-lg ring-4 ring-white`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {step.icon}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Step {idx + 1}</span>
                  <h4 className="font-bold text-sm text-on-surface">{step.label}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
