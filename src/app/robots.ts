import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-place/', '/student/', '/api/'],
    },
    sitemap: 'https://skillplaceacademy.com/sitemap.xml',
  }
}
