'use client'
import { useState, useRef } from 'react'
import SectionReveal from './SectionReveal'
import { getSupabaseImageUrl } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'

const mentors = [
  {
    name: 'Prakash Dev',
    position: 'CEO',
    company: 'Dozert AI',
    expertise: 'AI & Automation',
    bio: 'Visionary leader building AI solutions for industry. Passionate about practical engineering education.',
    initials: 'PD',
    color: 'bg-violet-600',
    image: getSupabaseImageUrl('mentor-prakash.png'),
  },
  {
    name: 'Gopal Krishn Sahu',
    position: 'Director',
    company: 'Autommensor Automation Pvt Ltd',
    expertise: 'Industrial Automation',
    bio: '20+ years in automation & control systems. Dedicated to bridging the gap between academia and industry.',
    initials: 'GS',
    color: 'bg-blue-600',
    image: getSupabaseImageUrl('mentor-gopal.png'),
  },
]

function MentorPhoto({ mentor }: { mentor: typeof mentors[0] }) {
  if (!mentor.image) {
    return (
      <div className={`w-24 h-24 rounded-full ${mentor.color} flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        {mentor.initials}
      </div>
    )
  }

  return (
    <div className="w-24 h-24 rounded-full bg-white mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-border-subtle overflow-hidden relative">
      <SafeImg
        src={mentor.image}
        alt={`${mentor.name} photo`}
        className="w-full h-full object-cover"
        fallback={
          <div className={`w-24 h-24 rounded-full ${mentor.color} flex items-center justify-center text-white text-2xl font-bold`}>
            {mentor.initials}
          </div>
        }
      />
    </div>
  )
}

export default function MeetMentors() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveIndex(index)
  }

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Meet Our Mentors
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Learn from industry leaders who bring decades of real-world experience to every session.
          </p>
        </SectionReveal>

        {/* DESKTOP: 2-column grid */}
        <SectionReveal stagger>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow hover:border-secondary/30 transition-all duration-300 group"
              >
                <div className="p-8 flex flex-col items-center text-center">
                  <MentorPhoto mentor={mentor} />
                  <h3 className="font-headline-md text-headline-md text-on-surface">{mentor.name}</h3>
                  <p className="text-secondary font-bold text-sm mt-1">{mentor.position}</p>
                  <p className="text-on-surface-variant text-sm">{mentor.company}</p>
                  <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    {mentor.expertise}
                  </span>
                  <p className="text-body-md text-on-surface-variant mt-4">{mentor.bio}</p>
                  <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-on-surface hover:border-secondary/30 hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    View LinkedIn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* MOBILE: Horizontal scroll carousel */}
        <div className="block md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow"
              >
                <div className="p-8 flex flex-col items-center text-center">
                  <MentorPhoto mentor={mentor} />
                  <h3 className="font-headline-md text-headline-md text-on-surface">{mentor.name}</h3>
                  <p className="text-secondary font-bold text-sm mt-1">{mentor.position}</p>
                  <p className="text-on-surface-variant text-sm">{mentor.company}</p>
                  <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    {mentor.expertise}
                  </span>
                  <p className="text-body-md text-on-surface-variant mt-4">{mentor.bio}</p>
                  <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-on-surface hover:border-secondary/30 hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    View LinkedIn
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {mentors.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to mentor ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 h-2 bg-secondary' : 'w-2 h-2 bg-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-2 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">swipe</span>
            Swipe to meet all mentors
          </p>
        </div>

      </div>
    </section>
  )
}
