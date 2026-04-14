'use client'

import { useState, useEffect } from 'react'
import PostCard from '@/components/PostCard'
import type { MockPost, PostType } from '@/types'

const fallbackPosts: MockPost[] = [
  { id: 'post-1', title: 'Why We Still Long for Paper in a Screen-Saturated World', slug: 'longing-for-paper-screen-saturated-world', excerpt: 'Exploring the tactile permanence of physical media and its quiet resurgence among those who sense something essential has been lost.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-03-28T00:00:00Z', readingTime: 12, featured: false, postType: 'story' },
  { id: 'post-2', title: 'The Ghost in the Large Language Model', slug: 'ghost-in-the-large-language-model', excerpt: 'Questioning the boundaries of consciousness as artificial intelligence begins to mimic human intuition with unsettling accuracy.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-03-15T00:00:00Z', readingTime: 8, featured: false, postType: 'tech' },
  { id: 'post-3', title: 'Finding Stillness in the Attention Economy', slug: 'finding-stillness-attention-economy', excerpt: 'Strategic boredom as a tool for radical creativity and psychological preservation in an age designed to capture every idle moment.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-03-08T00:00:00Z', readingTime: 5, featured: false, postType: 'insight' },
  { id: 'post-4', title: 'The Quiet Displacement of Analog Intimacy', slug: 'quiet-displacement-analog-intimacy', excerpt: 'How digital intermediaries are reshaping the fundamental human need for closeness, and what we risk losing in the process.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-02-22T00:00:00Z', readingTime: 10, featured: false, postType: 'story' },
  { id: 'post-5', title: 'Building for the Post-Attention Era', slug: 'building-post-attention-era', excerpt: 'What software looks like when engagement metrics no longer govern design decisions, and a new ethic of restraint takes hold.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-02-14T00:00:00Z', readingTime: 7, featured: false, postType: 'tech' },
  { id: 'post-6', title: 'On the Virtue of Unfinished Things', slug: 'virtue-of-unfinished-things', excerpt: 'A philosophical case for the draft, the sketch, and the work that breathes — against the tyranny of completion and polish.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-02-05T00:00:00Z', readingTime: 4, featured: false, postType: 'insight' },
  { id: 'post-7', title: 'The Architecture of Regret', slug: 'architecture-of-regret', excerpt: 'What our greatest professional mistakes reveal about values, identity, and the courage required for genuinely original work.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-01-28T00:00:00Z', readingTime: 6, featured: false, postType: 'insight' },
  { id: 'post-8', title: 'Open Source and the Commons of Ideas', slug: 'open-source-commons-of-ideas', excerpt: 'How the ethos of collaborative software development is reshaping science, art, and the very concept of intellectual ownership.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-01-20T00:00:00Z', readingTime: 9, featured: false, postType: 'tech' },
  { id: 'post-9', title: 'Letters to a City I No Longer Know', slug: 'letters-to-a-city', excerpt: 'A meditation on urban transformation, belonging, and the grief of watching the places that shaped you become unrecognizable.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-01-12T00:00:00Z', readingTime: 11, featured: false, postType: 'story' },
]

type FilterType = 'all' | PostType

const filters: { label: string; value: FilterType }[] = [
  { label: 'All Writing', value: 'all' },
  { label: 'Stories', value: 'story' },
  { label: 'Tech', value: 'tech' },
  { label: 'Insights', value: 'insight' },
]

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [allPosts, setAllPosts] = useState<MockPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.posts?.length > 0) setAllPosts(data.posts)
        else setAllPosts(fallbackPosts)
      })
      .catch(() => setAllPosts(fallbackPosts))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeFilter === 'all' ? allPosts : allPosts.filter((p) => p.postType === activeFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="max-w-2xl mb-10 md:mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] mb-3">
          The full archive
        </p>
        <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-[#181d12] dark:text-[#f7fce9] leading-tight mb-4">
          All Writing
        </h1>
        <p className="text-lg text-[#464841] dark:text-[#c6c7be] leading-relaxed">
          Every essay, reflection, and investigation — sorted by recency. Filter by category or
          scroll through the full archive.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-10">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === value
                ? 'bg-[#5b6300] text-white'
                : 'bg-white dark:bg-[#1c2217] text-[#464841] dark:text-[#c6c7be] border border-[#e0e5d2] dark:border-[#2d3226] hover:border-[#5b6300] dark:hover:border-[#c2cf47] hover:text-[#5b6300] dark:hover:text-[#c2cf47]'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#767870] dark:text-[#464841]">
          {filtered.length} {filtered.length === 1 ? 'essay' : 'essays'}
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] rounded-[1rem] bg-[#e0e5d2] dark:bg-[#2d3226] mb-4" />
              <div className="h-3 bg-[#e0e5d2] dark:bg-[#2d3226] rounded w-1/3 mb-3" />
              <div className="h-5 bg-[#e0e5d2] dark:bg-[#2d3226] rounded mb-2" />
              <div className="h-4 bg-[#e0e5d2] dark:bg-[#2d3226] rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 rounded-[2rem] bg-white dark:bg-[#1c2217] border border-[#e0e5d2] dark:border-[#2d3226]">
          <p className="font-serif italic text-2xl text-[#767870] dark:text-[#464841] mb-2">
            Nothing here yet.
          </p>
          <p className="text-sm text-[#767870] dark:text-[#464841]">
            Essays in this category are forthcoming.
          </p>
        </div>
      )}
    </div>
  )
}
