import PostCard from './PostCard'
import SectionHeader from './SectionHeader'
import type { MockPost } from '@/types'

interface RelatedPostsProps {
  posts?: MockPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <section className="mt-16 md:mt-20">
      <SectionHeader
        title="Continuing the Narrative"
        subtitle="Other pieces you may find equally resonant."
        action={{ label: 'View all writing', href: '/blog' }}
      />

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-[2rem] bg-white dark:bg-[#1c2217] border border-[#e0e5d2] dark:border-[#2d3226]">
          <p className="font-serif italic text-xl text-[#767870] dark:text-[#464841]">
            More essays coming soon.
          </p>
          <p className="text-sm text-[#767870] dark:text-[#464841] mt-2">
            Subscribe to be notified when new pieces are published.
          </p>
        </div>
      )}
    </section>
  )
}
