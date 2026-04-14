import HeroSection from '@/components/HeroSection'
import CategoryCard from '@/components/CategoryCard'
import PostCard from '@/components/PostCard'
import SectionHeader from '@/components/SectionHeader'
import NewsletterSection from '@/components/NewsletterSection'
import { getPublishedPosts, getFeaturedPost } from '@/lib/db/posts'
import { dbPostToMockPost } from '@/types'
import type { MockPost } from '@/types'

const mockFeaturedPost: MockPost = {
  id: 'featured-1',
  title: 'The Ghost in the Large Language Model',
  subtitle: 'On consciousness, intuition, and the uncanny valley of machine intelligence',
  slug: 'ghost-in-the-large-language-model',
  excerpt:
    'Questioning the boundaries of consciousness as artificial intelligence begins to mimic human intuition with unsettling accuracy.',
  category: 'Tech',
  categorySlug: 'tech',
  author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' },
  publishedAt: '2026-03-15T00:00:00Z',
  readingTime: 12,
  featured: true,
  postType: 'tech',
  coverGradient: 'from-[#2d3226] to-[#1a2015]',
}

const mockLatestPosts: MockPost[] = [
  {
    id: 'post-1',
    title: 'Why We Still Long for Paper in a Screen-Saturated World',
    slug: 'longing-for-paper-screen-saturated-world',
    excerpt: 'Exploring the tactile permanence of physical media and its quiet resurgence among those who sense something essential has been lost.',
    category: 'Stories', categorySlug: 'stories',
    author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' },
    publishedAt: '2026-03-28T00:00:00Z', readingTime: 12, featured: false, postType: 'story',
    coverGradient: 'from-[#d3e056] to-[#a8b040]',
  },
  {
    id: 'post-2',
    title: 'The Ghost in the Large Language Model',
    slug: 'ghost-in-the-large-language-model',
    excerpt: 'Questioning the boundaries of consciousness as artificial intelligence begins to mimic human intuition with unsettling accuracy.',
    category: 'Tech', categorySlug: 'tech',
    author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' },
    publishedAt: '2026-03-15T00:00:00Z', readingTime: 8, featured: false, postType: 'tech',
    coverGradient: 'from-[#1a2d4a] to-[#0d1a2e]',
  },
  {
    id: 'post-3',
    title: 'Finding Stillness in the Attention Economy',
    slug: 'finding-stillness-attention-economy',
    excerpt: 'Strategic boredom as a tool for radical creativity and psychological preservation in an age designed to capture every idle moment.',
    category: 'Insights', categorySlug: 'insights',
    author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' },
    publishedAt: '2026-03-08T00:00:00Z', readingTime: 5, featured: false, postType: 'insight',
    coverGradient: 'from-[#f0d9c2] to-[#c9a878]',
  },
  {
    id: 'post-4',
    title: 'The Quiet Displacement of Analog Intimacy',
    slug: 'quiet-displacement-analog-intimacy',
    excerpt: 'How digital intermediaries are reshaping the fundamental human need for closeness, and what we risk losing in the process.',
    category: 'Stories', categorySlug: 'stories',
    author: { name: 'Priya Anand', role: 'Contributing Writer', initials: 'PA' },
    publishedAt: '2026-02-22T00:00:00Z', readingTime: 10, featured: false, postType: 'story',
    coverGradient: 'from-[#ebf0dd] to-[#c5cba8]',
  },
  {
    id: 'post-5',
    title: 'Building for the Post-Attention Era',
    slug: 'building-post-attention-era',
    excerpt: 'What software looks like when engagement metrics no longer govern design decisions, and a new ethic of restraint takes hold.',
    category: 'Tech', categorySlug: 'tech',
    author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' },
    publishedAt: '2026-02-14T00:00:00Z', readingTime: 7, featured: false, postType: 'tech',
    coverGradient: 'from-[#2d3226] to-[#181d12]',
  },
  {
    id: 'post-6',
    title: 'On the Virtue of Unfinished Things',
    slug: 'virtue-of-unfinished-things',
    excerpt: 'A philosophical case for the draft, the sketch, and the work that breathes — against the tyranny of completion and polish.',
    category: 'Insights', categorySlug: 'insights',
    author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' },
    publishedAt: '2026-02-05T00:00:00Z', readingTime: 4, featured: false, postType: 'insight',
    coverGradient: 'from-[#f0ecf8] to-[#d8d0e8]',
  },
]

export default async function HomePage() {
  let featuredPost: MockPost | null = null
  let latestPosts: MockPost[] = []

  try {
    const [dbFeatured, dbLatest] = await Promise.all([
      getFeaturedPost(),
      getPublishedPosts(6),
    ])
    if (dbFeatured) featuredPost = dbPostToMockPost(dbFeatured)
    if (dbLatest.length > 0) latestPosts = dbLatest.map(dbPostToMockPost)
  } catch {
    // DB not configured — fall through to mock data
  }

  const displayFeatured = featuredPost ?? mockFeaturedPost
  const displayLatest = latestPosts.length > 0 ? latestPosts : mockLatestPosts

  return (
    <div>
      <HeroSection featuredPost={displayFeatured} />

      <section className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
        <SectionHeader
          title="Explore by category"
          subtitle="Three distinct lenses for understanding our world."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <CategoryCard type="stories" postCount={18} />
          <CategoryCard type="tech" postCount={24} />
          <CategoryCard type="insights" postCount={12} />
        </div>
      </section>

      <section className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
        <SectionHeader
          title="Latest writing"
          subtitle="Fresh essays and reflections, published weekly."
          action={{ label: 'View all writing', href: '/blog' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayLatest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <NewsletterSection />
    </div>
  )
}
