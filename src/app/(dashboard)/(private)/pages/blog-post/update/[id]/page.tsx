'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, Grid, Typography, TextField, Button } from '@mui/material'
import { toast } from 'react-toastify'
import JobEditor from '@/components/editor/JobEditor'
import type { CreateBlogPostDTO } from '@/services/blog-post.service'
import { blogPostService } from '@/services/blog-post.service'
import ImageUpload from '@/components/upload/ImageUpload'

const UpdateBlogPostPage = () => {
  const router = useRouter()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    blog_tags: [] as string[],
    releaseDate: new Date(),
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateBlogPostDTO, boolean>>>({})

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await blogPostService.getBlogPostById(id as string)
        const blogPost = response.data
        if (blogPost) {
          setFormData({
            title: blogPost.title,
            image: blogPost.image,
            content: blogPost.content,
            releaseDate: blogPost.releaseDate ? new Date(blogPost.releaseDate) : new Date(),
            blog_tags: blogPost.blog_tags ?? []
          })
        } else {
          toast.error('Blog bulunamadı')
          router.push('/pages/blog-post/list')
        }
      } catch (error: any) {
        console.error('Blog yüklenirken hata oluştu:', error)
        toast.error(error.response?.data?.error?.message || 'Blog yüklenirken bir hata oluştu')
      }
    }

    if (id) {
      fetchBlogPosts()
    }
  }, [id, router])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await blogPostService.updateBlogPost(id as string, formData)
      toast.success('Blog başarıyla güncellendi')
      router.push('/pages/blog-post/list')
    } catch (error: any) {
      console.error('Blog güncellenirken hata oluştu:', error)
      toast.error(error.response?.data?.error?.message || 'Blog güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          Blog Güncelle
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Başlık'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                Resim *
              </Typography>
              <ImageUpload
                value={formData.image}
                onChange={value => handleChange('image', value)}
                error={formErrors.image}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle2' gutterBottom>
                Blog içeriği *
              </Typography>
              <JobEditor
                content={formData.content}
                placeholder='Blog içeriğini yazın...'
                onChange={html => setFormData({ ...formData, content: html })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading}>
                {loading ? 'Blog Oluşturuluyor...' : 'Blogu Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default UpdateBlogPostPage
