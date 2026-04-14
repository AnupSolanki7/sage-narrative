import type { Metadata } from 'next'
import CategoryPageHeader from '@/components/CategoryPageHeader'
import PostCard from '@/components/PostCard'
import SectionHeader from '@/components/SectionHeader'
import NewsletterSection from '@/components/NewsletterSection'
import { getPostsByCategory } from '@/lib/db/posts'
import { dbPostToMockPost } from '@/types'
import type { MockPost } from '@/types'

export const metadata: Metadata = {
  title: 'Tech — Technology & Culture | Sage Narrative',
  description: 'Deep investigations into software, AI, digital culture, and the human implications of the systems we build and inhabit.',
}

const mockTechPosts: MockPost[] = [
  { id: 't1', title: 'The Ghost in the Large Language Model', slug: 'ghost-in-the-large-language-model', excerpt: 'Questioning the boundaries of consciousness as artificial intelligence begins to mimic human intuition with unsettling accuracy.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-03-15T00:00:00Z', readingTime: 8, featured: true, postType: 'tech', coverGradient: 'from-[#1a2d4a] to-[#0d1a2e]' },
  { id: 't2', title: 'Building for the Post-Attention Era', slug: 'building-post-attention-era', excerpt: 'What software looks like when engagement metrics no longer govern design decisions, and a new ethic of restraint takes hold.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-02-14T00:00:00Z', readingTime: 7, featured: false, postType: 'tech', coverGradient: 'from-[#2d3226] to-[#181d12]' },
  { id: 't3', title: 'Open Source and the Commons of Ideas', slug: 'open-source-commons-of-ideas', excerpt: 'How the ethos of collaborative software development is reshaping science, art, and the very concept of intellectual ownership.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2026-01-20T00:00:00Z', readingTime: 9, featured: false, postType: 'tech', coverGradient: 'from-[#1a3a2a] to-[#0d2a1a]' },
  { id: 't4', title: 'The Quiet Revolution of Minimal Computing', slug: 'quiet-revolution-of-minimal-computing', excerpt: 'In a world of cognitive surplus, some engineers are building machines that refuse to demand more from you than they need.', category: 'Tech', categorySlug: 'tech', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2025-12-10T00:00:00Z', readingTime: 11, featured: false, postType: 'tech', coverGradient: 'from-[#ebf0dd] to-[#c5cba8]' },
  { id: 't5', title: 'What Your Recommender System Thinks You Are', slug: 'what-recommender-system-thinks-you-are', excerpt: 'Platform algorithms construct a model of you from your behaviour. That model is not you. But it is increasingly shaping who you become.', category: 'Tech', categorySlug: 'tech', author: { name: 'Marcus Webb', role: 'Senior Writer', initials: 'MW' }, publishedAt: '2025-11-22T00:00:00Z', readingTime: 10, featured: false, postType: 'tech', coverGradient: 'from-[#2a1a3a] to-[#1a0d2a]' },
  { id: 't6', title: 'The Moral Philosophy of the Delete Button', slug: 'moral-philosophy-delete-button', excerpt: 'What does it mean to erase something in a world where nothing truly disappears? On permanence, forgetting, and digital memory.', category: 'Tech', categorySlug: 'tech', author: { name: 'Elena Vasquez', role: 'Essayist', initials: 'EV' }, publishedAt: '2025-10-30T00:00:00Z', readingTime: 6, featured: false, postType: 'tech', coverGradient: 'from-[#1a1a2a] to-[#0d0d1a]' },
]

export default async function TechPage() {
  let posts: MockPost[] = []
  try {
    const dbPosts = await getPostsByCategory('tech')
    if (dbPosts.length > 0) posts = dbPosts.map(dbPostToMockPost)
  } catch {}
  const displayPosts = posts.length > 0 ? posts : mockTechPosts

  return (
    <div>
      <CategoryPageHeader category="tech" postCount={displayPosts.length} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader title="All tech essays" subtitle="Published in chronological order, newest first." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayPosts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
      <NewsletterSection />
    </div>
  )
}
