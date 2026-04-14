import { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/db/posts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sagenarrative.com'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${siteUrl}/stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${siteUrl}/tech`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${siteUrl}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    const slugs = await getAllPublishedSlugs()
    dynamicRoutes = slugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB not configured
  }

  return [...staticRoutes, ...dynamicRoutes]
}
