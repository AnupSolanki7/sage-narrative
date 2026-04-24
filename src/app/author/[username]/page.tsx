import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Twitter, Github, Globe, Linkedin, User, FileText } from 'lucide-react'
import { getUserByUsername } from '@/lib/db/users'
import { getPostsByAuthor } from '@/lib/db/posts'
import { dbPostToMockPost } from '@/types'
import PostCard from '@/components/PostCard'
import JsonLd from '@/components/JsonLd'
import type { DbPostSummary } from '@/types'
import {
  SITE_NAME,
  getDefaultSeo,
  NOINDEX_METADATA,
  buildAuthorJsonLd,
  buildProfilePageJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserByUsername(params.username).catch(() => null)
  if (!user) {
    return {
      title: 'Author not found',
      ...NOINDEX_METADATA,
    }
  }
  return getDefaultSeo({
    title: `${user.name} — ${SITE_NAME}`,
    description: user.bio ?? `Read posts by ${user.name} on ${SITE_NAME}.`,
    path: `/author/${user.username}`,
    image: user.avatar || null,
    type: 'profile',
  })
}

export default async function AuthorPage({ params }: Props) {
  let user   = null
  let posts: DbPostSummary[] = []

  try {
    user = await getUserByUsername(params.username)
    if (user) {
      posts = await getPostsByAuthor(user._id)
    }
  } catch {}

  if (!user) notFound()

  const socialLinks = user.socialLinks ?? {}
  const hasSocial = Object.values(socialLinks).some(Boolean)
  const publishedCount = posts.length

  const authorJsonLd = buildAuthorJsonLd(user)
  const profileJsonLd = buildProfilePageJsonLd(user, publishedCount)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home',    path: '/' },
    { name: user.name, path: `/author/${user.username}` },
  ])

  return (
    <div className="min-h-screen bg-[#f7fce9] dark:bg-[#181d12]">
      <JsonLd data={[profileJsonLd, authorJsonLd, breadcrumbJsonLd]} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20">

        {/* Author hero header */}
        <div className="relative rounded-[2rem] p-8 md:p-12 mb-10 overflow-hidden bg-gradient-to-br from-[#f0f5dc] to-[#f7fce9] dark:from-[#1c2217] dark:to-[#181d12] border border-[#e0e5d2] dark:border-[#2d3226]">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#d3e056]/20 dark:bg-[#d3e056]/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#ebf0dd]/60 dark:bg-[#2d3226]/40 blur-xl" />

          <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-7 md:gap-10">
            {/* Avatar */}
            <div className="shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-[#2d3226] shadow-xl hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#5b6300] to-[#3d4500] border-4 border-white dark:border-[#2d3226] shadow-xl flex items-center justify-center hover:scale-105 transition-transform duration-300">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#181d12] dark:text-[#f7fce9] leading-tight">
                {user.name}
              </h1>
              <p className="text-sm md:text-base text-[#767870] dark:text-[#464841] mt-1 opacity-80">
                @{user.username}
              </p>

              {user.bio && (
                <p className="mt-3 text-base md:text-lg text-[#464841] dark:text-[#c6c7be] leading-relaxed max-w-2xl">
                  {user.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-center sm:justify-start gap-6 mt-5 text-sm text-[#767870] dark:text-[#464841]">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <strong className="text-[#181d12] dark:text-[#f7fce9] font-semibold">{publishedCount}</strong>
                  &nbsp;{publishedCount === 1 ? 'Post' : 'Posts'}
                </span>
              </div>

              {/* Social links */}
              {hasSocial && (
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-5">
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2d3226] border border-[#e0e5d2] dark:border-[#3a4030] text-[#767870] dark:text-[#c6c7be] hover:text-[#181d12] dark:hover:text-[#f7fce9] hover:scale-105 hover:shadow-md transition-all duration-200"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2d3226] border border-[#e0e5d2] dark:border-[#3a4030] text-[#767870] dark:text-[#c6c7be] hover:text-[#181d12] dark:hover:text-[#f7fce9] hover:scale-105 hover:shadow-md transition-all duration-200"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2d3226] border border-[#e0e5d2] dark:border-[#3a4030] text-[#767870] dark:text-[#c6c7be] hover:text-[#181d12] dark:hover:text-[#f7fce9] hover:scale-105 hover:shadow-md transition-all duration-200"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Website"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2d3226] border border-[#e0e5d2] dark:border-[#3a4030] text-[#767870] dark:text-[#c6c7be] hover:text-[#181d12] dark:hover:text-[#f7fce9] hover:scale-105 hover:shadow-md transition-all duration-200"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-[#e0e5d2] dark:border-[#2d3226]" />

        {/* Posts section */}
        <div>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#181d12] dark:text-[#f7fce9] mb-8">
            {posts.length > 0 ? 'Writing' : 'No posts yet'}
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white dark:bg-[#1c2217] rounded-[1.5rem] border border-[#e0e5d2] dark:border-[#2d3226] px-8 py-20 text-center">
              <FileText className="w-10 h-10 text-[#c6c7be] dark:text-[#464841] mx-auto mb-4" />
              <p className="font-serif italic text-lg text-[#767870] dark:text-[#464841] opacity-70">
                {user.name} hasn&apos;t published any posts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={dbPostToMockPost(post)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
