import Link from 'next/link'
import { FileText, CheckCircle, Clock, PenSquare } from 'lucide-react'
import { getPostStats, getAllPostsAdmin } from '@/lib/db/posts'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  let stats = { total: 0, published: 0, drafts: 0 }
  let recentPosts: Awaited<ReturnType<typeof getAllPostsAdmin>> = []

  try {
    ;[stats, recentPosts] = await Promise.all([getPostStats(), getAllPostsAdmin()])
    recentPosts = recentPosts.slice(0, 5)
  } catch {}

  const statCards = [
    { label: 'Total posts', value: stats.total, icon: FileText, color: 'text-[#5b6300] dark:text-[#c2cf47]', bg: 'bg-[#ebf0dd] dark:bg-[#2d3226]' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#181d12] dark:text-[#f7fce9]">
            Dashboard
          </h1>
          <p className="text-sm text-[#767870] dark:text-[#464841] mt-1">
            Welcome back. Here&apos;s what&apos;s happening.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-[#5b6300] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#4a5100] transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          New post
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] p-6">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-serif font-bold text-[#181d12] dark:text-[#f7fce9]">
              {value}
            </p>
            <p className="text-sm text-[#767870] dark:text-[#464841] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e5d2] dark:border-[#2d3226]">
          <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9]">Recent posts</h2>
          <Link href="/admin/posts" className="text-xs text-[#5b6300] dark:text-[#c2cf47] font-medium hover:underline">
            View all
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-serif italic text-[#767870] dark:text-[#464841]">No posts yet.</p>
            <Link href="/admin/posts/new" className="mt-3 inline-block text-sm text-[#5b6300] dark:text-[#c2cf47] hover:underline">
              Upload your first post →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#e0e5d2] dark:divide-[#2d3226]">
            {recentPosts.map((post) => (
              <li key={post._id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f7fce9] dark:hover:bg-[#2d3226]/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#181d12] dark:text-[#f7fce9] truncate">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[#767870] dark:text-[#464841] capitalize">{post.category}</span>
                    <span className="text-xs text-[#767870] dark:text-[#464841]">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  post.status === 'published'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {post.status}
                </span>
                <Link
                  href={`/admin/posts/${post._id}/edit`}
                  className="text-xs text-[#5b6300] dark:text-[#c2cf47] hover:underline shrink-0"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
