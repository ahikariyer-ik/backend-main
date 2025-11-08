import { axiosClient } from '@/libs/axios'

export interface SEO {
  metaTitle: string
  metaDescription: string
  metaKeywords?: string
  metaRobots: string
  canonicalURL?: string
  metaImage?: {
    id: string
    url: string
  } | null
}

export interface StrapiBlog {
  id: number
  documentId: string
  title: string
  seo?: SEO
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface UpdateBlogDTO {
  title?: string
  seo?: {
    metaTitle: string
    metaDescription: string
    metaKeywords?: string
    metaRobots: string
    canonicalURL?: string
    metaImage?: string | undefined
  }
}

class BlogService {
  private static instance: BlogService

  private constructor() {}

  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService()
    }
    return BlogService.instance
  }

  public async getBlog(): Promise<StrapiBlog> {
    const response = await axiosClient.get('/api/blog', {
      params: {
        populate: ['seo', 'seo.metaImage']
      }
    })
    return response.data.data
  }

  public async updateBlog(data: UpdateBlogDTO): Promise<StrapiBlog> {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (key === 'seo' && value) {
        const cleanSeo = Object.entries(value).reduce((seoAcc, [seoKey, seoValue]) => {
          if (seoValue !== '' && seoValue !== undefined && seoValue !== null) {
            return { ...seoAcc, [seoKey]: seoValue }
          }
          return seoAcc
        }, {})

        if (Object.keys(cleanSeo).length > 0) {
          return { ...acc, [key]: cleanSeo }
        }
        return acc
      }

      if (value !== '' && value !== undefined && value !== null) {
        return { ...acc, [key]: value }
      }
      return acc
    }, {})

    const response = await axiosClient.put('/api/blog-page', {
      data: cleanData
    })
    return response.data.data
  }
}

export const blogService = BlogService.getInstance()
