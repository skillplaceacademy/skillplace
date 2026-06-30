import SectionReveal from './SectionReveal'
import { getHomepageStats } from '@/lib/home-data'

const statConfig: Record<string, { icon: string; gradient: string }> = {
  studentsTrained: { icon: 'groups', gradient: 'from-blue-400 to-blue-600' },
  projectsBuilt: { icon: 'build_circle', gradient: 'from-violet-400 to-violet-600' },
  hoursOfLearning: { icon: 'schedule', gradient: 'from-emerald-400 to-emerald-600' },
  industryMentors: { icon: 'school', gradient: 'from-amber-400 to-amber-600' },
  placementAssistance: { icon: 'handshake', gradient: 'from-rose-400 to-rose-600' },
  communityMembers: { icon: 'diversity_3', gradient: 'from-cyan-400 to-cyan-600' },
}

const statLabels: Record<string, string> = {
  studentsTrained: 'Students Trained',
  projectsBuilt: 'Projects Built',
  hoursOfLearning: 'Hours of Learning',
  industryMentors: 'Industry Mentors',
  placementAssistance: 'Placement Support',
  communityMembers: 'Community Members',
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`
  return `${n}+`
}

export default async function WhyTrustUs() {
  const stats = await getHomepageStats()
  const statEntries = Object.entries(stats) as [keyof typeof stats, number][]

  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0f1a30]" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Decorative orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Our Impact</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white mb-4">
            Why Students Trust Us
          </h2>
          <p className="font-body-md text-body-md text-blue-200/70">
            Numbers don't lie. Here's the impact SkillPlace Academy has made on engineering careers.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {statEntries.map(([key, value], idx) => {
              const config = statConfig[key]
              return (
                <div
                  key={key}
                  className="relative group"
                >
                  <div className="glass rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 border border-white/10 hover:border-white/20">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>
                        {config.icon}
                      </span>
                    </div>
                    <span className="text-2xl md:text-3xl font-extrabold text-white block mb-1 animate-count-up">
                      {key === 'placementAssistance' ? '100%' : formatNumber(value)}
                    </span>
                    <span className="text-[11px] text-blue-300 uppercase tracking-wider font-semibold leading-tight block">
                      {statLabels[key]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
