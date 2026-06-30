import SectionReveal from './SectionReveal'

const whyChooseCards = [
  {
    icon: 'precision_manufacturing',
    title: 'Practical Learning',
    desc: '70% hands-on training with real-world tools and workflows — not just theory.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: 'rocket_launch',
    title: 'Live Projects',
    desc: 'Work on actual client projects during your training to build real experience.',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    icon: 'build',
    title: 'Industry Tools',
    desc: 'Master AutoCAD, Revit, SolidWorks, PLC, SCADA, and other industry-standard software.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: 'folder_special',
    title: 'Portfolio Building',
    desc: 'Graduate with a professional portfolio that showcases your skills to employers.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: 'description',
    title: 'Resume Preparation',
    desc: 'Get your resume reviewed and optimized by industry professionals.',
    gradient: 'from-rose-500 to-rose-600',
  },
  {
    icon: 'record_voice_over',
    title: 'Interview Preparation',
    desc: 'Mock interviews, common questions, and confidence-building sessions.',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: 'trending_up',
    title: 'Career Mentorship',
    desc: '1-on-1 guidance from mentors who know the industry inside out.',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: 'payments',
    title: 'Affordable Learning',
    desc: 'Quality education that doesn\'t break the bank. EMI options available.',
    gradient: 'from-pink-500 to-pink-600',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-violet-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Why Us</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Why Choose SkillPlace Academy?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We don't just teach — we prepare you for a successful career. Here's what makes us different.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyChooseCards.map((card, idx) => (
              <div
                key={idx}
                className="hover-lift relative p-6 rounded-2xl bg-white border border-border-subtle group overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-violet-500/5 transition-all duration-500" />

                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {card.icon}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{card.title}</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
