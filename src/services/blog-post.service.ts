import { axiosClient } from '@/libs/axios'

export interface StrapiBlogPost {
  image: string
  blog_tags: string[] | null | undefined
  documentId: string
  title: string
  releaseDate: Date | null
  content: string
}

// Sorunun şu sen arakaya boş göndermen gereke ndahga hazırlamadığın tag ve relase date objesini dolu type olarak yolluyorsun yani varmış gibi
// O yüzden backend hata veriyor. O alanları opsiyonel yapman lazım
// hmm eyvallah oyle bir durum olacagini analyamadim tamamdir dikakt ederim
// type scriptte opsiyonel yaparsan backend e boş göndermezsin
// Ama dikkat et ben mesela string[] dedim ancak arkadan gelirken obje array gelecek bu yani şöyle bir tanımlaman olmalı
// önce ekleme ve güncelleme yertlerine bu verileri ekle düzgfüncve sonra string yeriner alttakini kullan

//tamamdir henuz daha orayai yapmamistim teşekkürler tamamdır kaçtım ;) :DD

// export interface StrapiBlogTag {
//   id: string
//   title: string
// }

export interface UpdateBlogPostDTO {
  title?: string
}

interface StrapiResponse<T> {
  data: T
  error?: {
    status: number
    name: string
    message: string
    details?: any
  }
}

export interface CreateBlogPostDTO {
  blog_tags: string[] | null | undefined
  title: string
  content: string
  image: string
}

class BlogPostService {
  private static instance: BlogPostService

  private constructor() {}

  public static getInstance(): BlogPostService {
    if (!BlogPostService.instance) {
      BlogPostService.instance = new BlogPostService()
    }
    return BlogPostService.instance
  }

  public async getBlogPost(): Promise<StrapiBlogPost> {
    const response = await axiosClient.get('/api/blog-posts')
    return response.data.data
  }

  public async getBlogPosts(): Promise<StrapiResponse<StrapiBlogPost[]>> {
    const response = await axiosClient.get('/api/blog-posts')
    return response.data
  }

  public async createBlogPost(sector: Omit<StrapiBlogPost, 'documentId'>): Promise<StrapiResponse<StrapiBlogPost>> {
    const response = await axiosClient.post('/api/blog-posts', { data: sector })
    return response.data
  }

  public async getBlogPostById(documentId: string): Promise<StrapiResponse<StrapiBlogPost>> {
    const response = await axiosClient.get(`/api/blog-posts/${documentId}`)
    return response.data
  }

  public async updateBlogPost(
    documentId: string,
    sector: Partial<StrapiBlogPost>
  ): Promise<StrapiResponse<StrapiBlogPost>> {
    const response = await axiosClient.put(`/api/blog-posts/${documentId}`, { data: sector })
    return response.data
  }

  public async deleteBlogPost(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/blog-posts/${documentId}`)
  }
}

export const blogPostService = BlogPostService.getInstance()
