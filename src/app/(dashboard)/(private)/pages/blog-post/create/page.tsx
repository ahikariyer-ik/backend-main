'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Grid, Typography, TextField, Button, CardHeader } from '@mui/material'
import { toast } from 'react-toastify'
import JobEditor from '@/components/editor/JobEditor' // Assuming you reuse JobEditor for blocks
import { blogPostService } from '@/services/blog-post.service'
import type { CreateBlogPostDTO } from '@/services/blog-post.service'
import ImageUpload from '@/components/upload/ImageUpload'
import Link from '@components/Link'

const CreateBlogPostPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    blog_tags: [] as string[],
    releaseDate: new Date(),
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateBlogPostDTO, boolean>>>({})

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    const errors: Partial<Record<keyof CreateBlogPostDTO, boolean>> = {}
    if (!formData.title) errors.title = true
    if (!formData.content) errors.content = true
    if (!formData.image) errors.image = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      await blogPostService.createBlogPost(formData)
      toast.success('Blog başarıyla oluşturuldu')
      router.push('/pages/blog-post/list')
    } catch (error: any) {
      console.error('Blog oluşturulurken hata oluştu:', error)
      toast.error(error.response?.data?.error?.message || 'Blog oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Yeni Blog Ekle'
        action={
          <Button component={Link} href='/pages/blog-post/list' color='secondary' variant='outlined'>
            Geri Dön
          </Button>
        }
      />
      <CardContent>
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

export default CreateBlogPostPage
