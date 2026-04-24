import type { Metadata } from 'next'
import CategoryPageHeader from '@/components/CategoryPageHeader'
import PostCard from '@/components/PostCard'
import SectionHeader from '@/components/SectionHeader'
import NewsletterSection from '@/components/NewsletterSection'
import JsonLd from '@/components/JsonLd'
import { getPostsByCategory } from '@/lib/db/posts'
import { dbPostToMockPost } from '@/types'
import type { DbPostSummary, MockPost } from '@/types'
import {
  getDefaultSeo,
  buildCollectionJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo'

const CATEGORY_DESCRIPTION =
  'Brief reflections and philosophical fragments for the discerning reader who prefers depth over brevity.'

export const metadata: Metadata = getDefaultSeo({
  title: 'Insights — Reflections & Ideas',
  description: CATEGORY_DESCRIPTION,
  path: '/insights',
  type: 'website',
})

const mockInsights: MockPost[] = [
  { id: 'i1', title: 'Finding Stillness in the Attention Economy', slug: 'finding-stillness-attention-economy', excerpt: 'Strategic boredom as a tool for radical creativity and psychological preservation in an age designed to capture every idle moment.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-03-08T00:00:00Z', readingTime: 5, featured: false, postType: 'insight', coverGradient: 'from-[#f0d9c2] to-[#c9a878]' },
  { id: 'i2', title: 'On the Virtue of Unfinished Things', slug: 'virtue-of-unfinished-things', excerpt: 'A philosophical case for the draft, the sketch, and the work that breathes — against the tyranny of completion and polish.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-02-05T00:00:00Z', readingTime: 4, featured: false, postType: 'insight', coverGradient: 'from-[#f0ecf8] to-[#d8d0e8]' },
  { id: 'i3', title: 'The Architecture of Regret', slug: 'architecture-of-regret', excerpt: 'What our greatest professional mistakes reveal about values, identity, and the courage required for genuinely original work.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2026-01-28T00:00:00Z', readingTime: 6, featured: false, postType: 'insight', coverGradient: 'from-[#e8f0d9] to-[#c8dab8]' },
  { id: 'i4', title: 'In Praise of the Unoptimised Life', slug: 'in-praise-of-unoptimised-life', excerpt: 'A counter-argument to the productivity industrial complex: on slack, inefficiency, and the things that flourish only when left alone.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2025-12-14T00:00:00Z', readingTime: 5, featured: false, postType: 'insight', coverGradient: 'from-[#f0e8d9] to-[#e0c8a8]' },
  { id: 'i5', title: 'Against the Summary', slug: 'against-the-summary', excerpt: 'Why the TL;DR is an act of cultural capitulation, and what we lose when we choose the compressed version over the full experience.', category: 'Insights', categorySlug: 'insights', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2025-11-05T00:00:00Z', readingTime: 4, featured: false, postType: 'insight', coverGradient: 'from-[#d9e8f0] to-[#a8c8e0]' },
  { id: 'i6', title: 'The Ethics of Forgetting', slug: 'ethics-of-forgetting', excerpt: 'Memory is selective by design. When we choose what to forget, and what forgetting serves, defines the moral shape of our inner life.', category: 'Insights', categorySlug: 'insights', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2025-10-18T00:00:00Z', readingTime: 7, featured: false, postType: 'insight', coverGradient: 'from-[#ece8f0] to-[#c8c0d8]' },
]

export default async function InsightsPage() {
  let posts: MockPost[] = []
  let dbPosts: DbPostSummary[] = []
  try {
    dbPosts = await getPostsByCategory('insights')
    if (dbPosts.length > 0) posts = dbPosts.map(dbPostToMockPost)
  } catch {}
  const displayPosts = posts.length > 0 ? posts : mockInsights

  const jsonLd = [
    buildCollectionJsonLd({
      path: '/insights',
      name: 'Insights — Reflections & Ideas',
      description: CATEGORY_DESCRIPTION,
      posts: dbPosts,
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home',     path: '/' },
      { name: 'Insights', path: '/insights' },
    ]),
  ]

  return (
    <div>
      <JsonLd data={jsonLd} />
      <CategoryPageHeader category="insights" postCount={displayPosts.length} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader title="All insights" subtitle="Published in chronological order, newest first." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayPosts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
      <NewsletterSection />
    </div>
  )
}
