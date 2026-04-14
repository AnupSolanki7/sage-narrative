import Link from 'next/link'
import { Twitter, Mail, ArrowRight, BookOpen } from 'lucide-react'
import NewsletterSection from '@/components/NewsletterSection'
import PostCard from '@/components/PostCard'
import type { Metadata } from 'next'
import type { MockPost } from '@/types'

export const metadata: Metadata = {
  title: 'About — Sage Narrative',
  description:
    'The story behind Sage Narrative and the writers who contribute to it.',
}

const featuredPieces: MockPost[] = [
  {
    id: 'about-1',
    title: 'The Ghost in the Large Language Model',
    slug: 'ghost-in-the-large-language-model',
    excerpt:
      'Questioning the boundaries of consciousness as artificial intelligence begins to mimic human intuition.',
    category: 'Tech',
    categorySlug: 'tech',
    author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' },
    publishedAt: '2026-03-15T00:00:00Z',
    readingTime: 8,
    featured: false,
    postType: 'tech',
    coverGradient: 'from-[#1a2d4a] to-[#0d1a2e]',
  },
  {
    id: 'about-2',
    title: 'Finding Stillness in the Attention Economy',
    slug: 'finding-stillness-attention-economy',
    excerpt:
      'Strategic boredom as a tool for radical creativity and psychological preservation.',
    category: 'Insights',
    categorySlug: 'insights',
    author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' },
    publishedAt: '2026-03-08T00:00:00Z',
    readingTime: 5,
    featured: false,
    postType: 'insight',
    coverGradient: 'from-[#f0d9c2] to-[#c9a878]',
  },
  {
    id: 'about-3',
    title: 'Why We Still Long for Paper in a Screen-Saturated World',
    slug: 'longing-for-paper-screen-saturated-world',
    excerpt:
      'Exploring the tactile permanence of physical media and its quiet resurgence.',
    category: 'Stories',
    categorySlug: 'stories',
    author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' },
    publishedAt: '2026-03-28T00:00:00Z',
    readingTime: 12,
    featured: false,
    postType: 'story',
    coverGradient: 'from-[#d3e056] to-[#a8b040]',
  },
]

const team = [
  {
    name: 'Marcus Webb',
    initials: 'MW',
    role: 'Editor-in-Chief & Senior Writer',
    bio: 'Marcus has been writing about the cultural dimensions of technology for over a decade. Before founding Sage Narrative, he was a contributing editor at several major technology publications. He believes that no technology is neutral, and that the most important work of our time is learning to ask better questions about the systems we build.',
    specialties: ['Artificial Intelligence', 'Platform Ethics', 'Digital Culture'],
    social: [
      { platform: 'twitter', url: 'https://twitter.com', icon: Twitter },
      { platform: 'email', url: 'mailto:marcus@sagenarrative.com', icon: Mail },
    ],
  },
  {
    name: 'Priya Anand',
    initials: 'PA',
    role: 'Contributing Writer — Stories',
    bio: "Priya writes about memory, belonging, and the way contemporary life shapes and misshapes our sense of home. Her essays have appeared in literary magazines across three continents. She brings a novelist's eye for detail and a philosopher's patience for complexity to everything she publishes.",
    specialties: ['Cultural Memory', 'Diaspora & Identity', 'Urban Life'],
    social: [
      { platform: 'twitter', url: 'https://twitter.com', icon: Twitter },
    ],
  },
  {
    name: 'Elena Vasquez',
    initials: 'EV',
    role: 'Essayist — Insights',
    bio: 'Elena\'s background is in cognitive science and philosophy of mind, which she uses to interrogate the assumptions embedded in how we work, rest, and think about thinking. Her essays are known for their rigor and their refusal to offer easy comfort. She is currently completing a book on the attention economy.',
    specialties: ['Cognitive Science', 'Philosophy of Work', 'Creative Process'],
    social: [
      { platform: 'email', url: 'mailto:elena@sagenarrative.com', icon: Mail },
    ],
  },
]

const values = [
  {
    title: 'Depth over velocity',
    description:
      'We publish slowly and deliberately. Every piece goes through multiple drafts. We would rather publish one excellent essay than twelve adequate ones.',
  },
  {
    title: 'Difficulty as respect',
    description:
      'We do not simplify for simplicity\'s sake. We trust our readers to follow complex arguments, to sit with uncertainty, to resist easy conclusions.',
  },
  {
    title: 'Technology is cultural',
    description:
      'We believe that technology questions are always also questions about power, values, history, and what kind of life we want to live.',
  },
  {
    title: 'Long-form as form',
    description:
      'Some ideas cannot survive compression. We are committed to the essay as a genre — long enough to develop, careful enough to matter.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative px-4 md:px-8 py-16 md:py-24 bg-gradient-to-br from-[#f7fce9] to-[#ebf0dd] dark:from-[#181d12] dark:to-[#2d3226]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-4">
              About Sage Narrative
            </p>
            <h1 className="font-serif font-bold text-5xl md:text-7xl text-[#181d12] dark:text-[#f7fce9] leading-tight mb-6">
              We write for readers who prefer depth over speed.
            </h1>
            <p className="text-xl text-[#464841] dark:text-[#c6c7be] leading-relaxed max-w-2xl">
              Sage Narrative is an independent editorial publication founded on the belief that long-form essays still matter — perhaps more than ever — in an era of truncated attention and algorithmic brevity.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#181d12] dark:text-[#f7fce9] mb-5">
              The long story
            </h2>
            <div className="space-y-4 text-[#464841] dark:text-[#c6c7be] leading-relaxed">
              <p>
                Sage Narrative began as a newsletter in 2023, sent to 47 people who had specifically asked for longer, slower, more considered writing about technology and its cultural implications. It was an experiment in whether there was an audience for the kind of writing we wished we could read elsewhere.
              </p>
              <p>
                The answer, it turned out, was yes. Within eighteen months, that newsletter had grown to tens of thousands of subscribers across six continents. We publish three categories — Stories, Tech, and Insights — each approaching the human condition from a different angle, but all sharing the same commitment: to write things worth rereading.
              </p>
              <p>
                We are independently operated. We accept no advertising. We are funded entirely by our readers, which means our incentives are simple: write well, write honestly, and trust that those who value the work will support it.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#181d12] dark:text-[#f7fce9] mb-5">
              What we believe
            </h2>
            <div className="space-y-5">
              {values.map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5b6300] dark:bg-[#c2cf47] shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#181d12] dark:text-[#f7fce9] mb-1">
                      {value.title}
                    </h3>
                    <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 border-t border-[#e0e5d2] dark:border-[#2d3226]">
        <div className="mb-10 md:mb-14">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#181d12] dark:text-[#f7fce9] mb-3">
            The writers
          </h2>
          <p className="text-[#464841] dark:text-[#c6c7be] max-w-xl">
            A small, deliberate team. We prize craft over credentials, and perspective over authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white dark:bg-[#1c2217] rounded-[2rem] border border-[#e0e5d2] dark:border-[#2d3226] p-7"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5b6300] to-[#3d4500] flex items-center justify-center text-white font-bold text-xl font-serif mb-5">
                {member.initials}
              </div>

              <h3 className="font-serif font-bold text-xl text-[#181d12] dark:text-[#f7fce9] mb-0.5">
                {member.name}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-4">
                {member.role}
              </p>

              <p className="text-sm text-[#464841] dark:text-[#c6c7be] leading-relaxed mb-5">
                {member.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-5">
                {member.specialties.map((s) => (
                  <span key={s} className="tag-pill text-xs">
                    {s}
                  </span>
                ))}
              </div>

              {/* Social */}
              <div className="flex items-center gap-2">
                {member.social.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target={url.startsWith('http') ? '_blank' : undefined}
                    rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ebf0dd] dark:bg-[#2d3226] text-[#5b6300] dark:text-[#c2cf47] hover:bg-[#d3e056] dark:hover:bg-[#3d4530] transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured writing */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 border-t border-[#e0e5d2] dark:border-[#2d3226]">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#5b6300] dark:text-[#c2cf47]" />
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#181d12] dark:text-[#f7fce9]">
              Start here
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6300] dark:text-[#c2cf47] hover:gap-2.5 transition-all group"
          >
            All writing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredPieces.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <NewsletterSection />
    </div>
  )
}
