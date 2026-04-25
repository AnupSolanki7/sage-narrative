import { Lightbulb, Sparkles, Eye, Users } from 'lucide-react'
import SectionHeader from './SectionHeader'

const STEPS = [
  {
    icon: Lightbulb,
    title: 'Bring your idea',
    body:  'Start with a rough note, Markdown file, or simple thought. No professional writing experience required.',
  },
  {
    icon: Sparkles,
    title: 'Improve with AI',
    body:  'Get help with structure, wording, SEO, titles, and image ideas — you stay in control of every change.',
  },
  {
    icon: Eye,
    title: 'Preview and publish',
    body:  'Review your final post exactly as readers will see it, then publish when it feels right.',
  },
  {
    icon: Users,
    title: 'Reach more readers',
    body:  'Build your author profile and share your writing with a growing audience.',
  },
] as const

export default function HowItWorks() {
  return (
    <section className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
      <SectionHeader
        title="From idea to published, in four steps"
        subtitle="Sage Narrative helps anyone turn ideas into thoughtful, publish-ready writing — even if you've never written a blog before."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="relative bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6 shadow-card hover:shadow-premium transition-shadow"
            >
              <span className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-[#5b6300] text-white text-xs font-bold flex items-center justify-center shadow-card">
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-[#d3e056]/30 dark:bg-[#d3e056]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#5b6300] dark:text-[#c2cf47]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#181d12] dark:text-[#f7fce9] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed">
                {step.body}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
