import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL || 'https://rentbuddy.netlify.app'

  return [
    { url: base,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/demo`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/pitch`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/research`,lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
  ]
}
