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
  'Long-form explorations of contemporary life, memory, culture, and the spaces between people.'

export const metadata: Metadata = getDefaultSeo({
  title: 'Stories — Human Narratives',
  description: CATEGORY_DESCRIPTION,
  path: '/stories',
  type: 'website',
})

const mockStories: MockPost[] = [
  { id: 's1', title: 'Why We Still Long for Paper in a Screen-Saturated World', slug: 'longing-for-paper-screen-saturated-world', excerpt: 'Exploring the tactile permanence of physical media and its quiet resurgence among those who sense something essential has been lost.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-03-28T00:00:00Z', readingTime: 12, featured: false, postType: 'story', coverGradient: 'from-[#d3e056] to-[#a8b040]' },
  { id: 's2', title: 'The Quiet Displacement of Analog Intimacy', slug: 'quiet-displacement-analog-intimacy', excerpt: 'How digital intermediaries are reshaping the fundamental human need for closeness, and what we risk losing as every interaction becomes mediated.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-02-22T00:00:00Z', readingTime: 10, featured: false, postType: 'story', coverGradient: 'from-[#ebf0dd] to-[#c5cba8]' },
  { id: 's3', title: 'Letters to a City I No Longer Know', slug: 'letters-to-a-city', excerpt: 'A meditation on urban transformation, belonging, and the grief of watching the places that shaped you become unrecognizable strangers.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2026-01-12T00:00:00Z', readingTime: 11, featured: false, postType: 'story', coverGradient: 'from-[#f0d9c2] to-[#c9a878]' },
  { id: 's4', title: 'On the Weight of Inherited Languages', slug: 'weight-of-inherited-languages', excerpt: 'Growing up between two tongues, two cultures, two versions of self. A personal reckoning with linguistic identity and belonging.', category: 'Stories', categorySlug: 'stories', author: { name: 'Sasha Kim', role: 'Guest Writer', initials: 'SK' }, publishedAt: '2025-12-18T00:00:00Z', readingTime: 8, featured: false, postType: 'story', coverGradient: 'from-[#f0ecf8] to-[#d8d0e8]' },
  { id: 's5', title: 'The Last Bookstore on a Street Being Erased', slug: 'last-bookstore-street-being-erased', excerpt: 'A portrait of a neighbourhood institution in its final months, and what its closure reveals about the economics of culture and community.', category: 'Stories', categorySlug: 'stories', author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' }, publishedAt: '2025-11-30T00:00:00Z', readingTime: 14, featured: false, postType: 'story', coverGradient: 'from-[#ebf0dd] to-[#d3e056]' },
  { id: 's6', title: 'What the Mountains Taught Me About Deadlines', slug: 'mountains-taught-me-about-deadlines', excerpt: "A writer's retreat into wilderness and the unexpected lessons geological time has for those obsessed with productivity and output.", category: 'Stories', categorySlug: 'stories', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2025-11-10T00:00:00Z', readingTime: 7, featured: false, postType: 'story', coverGradient: 'from-[#c5d4e8] to-[#8fa8cc]' },
]

export default async function StoriesPage() {
  let posts: MockPost[] = []
  let dbPosts: DbPostSummary[] = []
  try {
    dbPosts = await getPostsByCategory('stories')
    if (dbPosts.length > 0) posts = dbPosts.map(dbPostToMockPost)
  } catch {}
  const displayPosts = posts.length > 0 ? posts : mockStories

  const jsonLd = [
    buildCollectionJsonLd({
      path: '/stories',
      name: 'Stories — Human Narratives',
      description: CATEGORY_DESCRIPTION,
      posts: dbPosts,
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home',    path: '/' },
      { name: 'Stories', path: '/stories' },
    ]),
  ]

  return (
    <div>
      <JsonLd data={jsonLd} />
      <CategoryPageHeader category="stories" postCount={displayPosts.length} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader title="All stories" subtitle="Published in chronological order, newest first." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayPosts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
      <NewsletterSection />
    </div>
  )
}
