import { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/db/posts'
import { getAllAuthorsForSitemap } from '@/lib/db/users'
import { SITE_URL } from '@/lib/seo'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${SITE_URL}/blog`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${SITE_URL}/stories`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${SITE_URL}/tech`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${SITE_URL}/insights`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${SITE_URL}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let postRoutes: MetadataRoute.Sitemap = []
  let authorRoutes: MetadataRoute.Sitemap = []

  try {
    // getPublishedPosts already filters status: 'published' — drafts are never included.
    const posts = await getPublishedPosts()
    postRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? p.publishedAt ?? p.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB unavailable — static routes still ship.
  }

  try {
    const authors = await getAllAuthorsForSitemap()
    authorRoutes = authors.map((a) => ({
      url: `${SITE_URL}/author/${a.username}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {}

  return [...staticRoutes, ...postRoutes, ...authorRoutes]
}
