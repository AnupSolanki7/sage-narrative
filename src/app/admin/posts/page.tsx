import Link from 'next/link'
import { PenSquare, Trash2, Eye, EyeOff } from 'lucide-react'
import { getAllPostsAdmin } from '@/lib/db/posts'
import { formatDate } from '@/lib/utils'
import AdminPostActions from '@/components/admin/AdminPostActions'

export default async function AdminPostsPage() {
  let posts: Awaited<ReturnType<typeof getAllPostsAdmin>> = []

  try {
    posts = await getAllPostsAdmin()
  } catch {}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#181d12] dark:text-[#f7fce9]">
            All Posts
          </h1>
          <p className="text-sm text-[#767870] dark:text-[#464841] mt-1">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
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

      <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] overflow-hidden">
        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif italic text-xl text-[#767870] dark:text-[#464841] mb-3">
              No posts yet.
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 bg-[#5b6300] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#4a5100] transition-colors"
            >
              Upload your first post
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e5d2] dark:border-[#2d3226]">
                <th className="text-left px-6 py-4 font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest text-xs">
                  Title
                </th>
                <th className="text-left px-4 py-4 font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest text-xs hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-4 font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest text-xs hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-4 font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest text-xs">
                  Status
                </th>
                <th className="text-right px-6 py-4 font-semibold text-[#767870] dark:text-[#464841] uppercase tracking-widest text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5d2] dark:divide-[#2d3226]">
              {posts.map((post) => (
                <tr
                  key={post._id}
                  className="hover:bg-[#f7fce9] dark:hover:bg-[#2d3226]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[#181d12] dark:text-[#f7fce9] line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-xs text-[#767870] dark:text-[#464841] mt-0.5 font-mono">
                        /{post.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="capitalize text-[#464841] dark:text-[#c6c7be]">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-[#767870] dark:text-[#464841]">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <AdminPostActions postId={post._id} status={post.status} slug={post.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
