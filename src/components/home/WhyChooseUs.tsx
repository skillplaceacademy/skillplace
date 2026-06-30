'use client'
import SectionReveal from './SectionReveal'

const whyChooseCards = [
  {
    image: '/images/course-electronics-automation.jpg',
    title: 'Practical Learning',
    desc: '70% hands-on training with real-world equipment and laboratory tools — not just theory.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    image: '/images/course-mechanical-engineering.jpg',
    title: 'Live Projects',
    desc: 'Work on actual client projects during your training to build real industry experience.',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    image: '/images/course-civil-engineering.jpg',
    title: 'Industry Tools',
    desc: 'Master AutoCAD, Revit, SolidWorks, PLC, SCADA, and other industry-standard software.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    image: '/images/home-engineering-students.jpg',
    title: 'Career Mentorship',
    desc: '1-on-1 guidance from core industry mentors who know the placement market inside out.',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    image: '/images/program-detail.jpg',
    title: 'Portfolio Building',
    desc: 'Graduate with a professional portfolio that showcases your designs and automation codes.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    image: '/images/courses-hero-bg.jpg',
    title: 'Resume Preparation',
    desc: 'Get your resume reviewed and optimized by HR managers and industry professionals.',
    gradient: 'from-rose-500 to-rose-600',
  },
  {
    image: '/images/programs-hero-bg.jpg',
    title: 'Interview Training',
    desc: 'Mock interview rounds, communication tips, and confidence-boosting group sessions.',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    image: '/images/about-hero-bg.jpg',
    title: 'Affordable Learning',
    desc: 'Quality education that doesn\'t break the bank. Flexible EMI payment modes available.',
    gradient: 'from-pink-500 to-pink-600',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Why Us</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Why Choose SkillPlace Academy?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We don&apos;t just teach — we prepare you for a successful career. Here&apos;s what makes us different.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          {/* Mobile: Horizontal side scroll container, Desktop: Grid layout */}
          <div 
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {whyChooseCards.map((card, idx) => (
              <div
                key={idx}
                className="hover-lift relative flex flex-col rounded-2xl bg-white border border-border-subtle group overflow-hidden min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Visual Image Thumbnail instead of Icon */}
                <div className="relative h-40 w-full overflow-hidden shrink-0">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Styled mini colored tag */}
                  <span className={`absolute top-3 left-3 bg-gradient-to-br ${card.gradient} w-2.5 h-2.5 rounded-full ring-4 ring-white/30`} />
                </div>

                {/* Card Content */}
                <div className="p-5 flex-grow flex flex-col justify-between relative bg-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-violet-500/5 transition-all duration-500 pointer-events-none" />
                  
                  <div className="relative">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2 group-hover:text-secondary transition-colors">{card.title}</h3>
                    <p className="text-body-md text-on-surface-variant leading-relaxed text-sm">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Mobile Swipe Cue */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
          <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
          <span>Swipe to see all benefits</span>
        </div>
      </div>
    </section>
  )
}
