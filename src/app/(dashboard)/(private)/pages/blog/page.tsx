'use client'

import CustomTextField from '@/@core/components/mui/TextField'
import ImageUpload from '@/components/upload/ImageUpload'
import { blogService, StrapiBlog, UpdateBlogDTO } from '@/services/blog.service'
import { Typography, Card, CardContent, Grid, CardHeader, Button, Link, Alert, Box } from '@mui/material'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const BlogPage = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [about, setAbout] = useState<StrapiBlog | null>(null)
  const [formData, setFormData] = useState<UpdateBlogDTO>({
    title: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: 'index, follow',
      canonicalURL: '',
      metaImage: undefined
    }
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateBlogDTO, boolean>>>({})

  // Effects
  useEffect(() => {
    loadBlog()
  }, [])

  // Handlers
  const loadBlog = async () => {
    try {
      const data = await blogService.getBlog()
      if (!data) {
        toast.error('Blog bilgileri bulunamadı')
        return
      }

      setAbout(data)
      setFormData({
        title: data.title || '',
        seo: {
          metaTitle: data.seo?.metaTitle || '',
          metaDescription: data.seo?.metaDescription || '',
          metaKeywords: data.seo?.metaKeywords || '',
          metaRobots: data.seo?.metaRobots || 'index, follow',
          canonicalURL: data.seo?.canonicalURL || '',
          metaImage: data.seo?.metaImage && typeof data.seo.metaImage === 'object' ? data.seo.metaImage.id : undefined
        }
      })
    } catch (error: any) {
      console.error('Blog bilgileri yüklenirken hata:', error)
      toast.error(error.response?.data?.error?.message || 'Hakkımızda bilgileri yüklenirken bir hata oluştu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    // Validation
    const errors: Partial<Record<keyof UpdateBlogDTO, boolean>> = {}
    if (!formData.title) errors.title = true
    if (!formData.seo?.metaTitle) errors.seo = true
    if (!formData.seo?.metaDescription) errors.seo = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      await blogService.updateBlog(formData)
      toast.success('Blog bilgileri başarıyla güncellendi')
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Bir hata oluştu')
      toast.error(error.response?.data?.error?.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setFormErrors(prev => ({ ...prev, [field]: false }))
  }

  const handleSEOChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo!,
        [field]: value
      }
    }))
    if (field === 'metaTitle' || field === 'metaDescription') {
      setFormErrors(prev => ({ ...prev, seo: false }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Blog Bilgileri Düzenle'
          action={
            <Button component={Link} href='/dashboard' color='secondary' variant='outlined'>
              Geri Dön
            </Button>
          }
        />

        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Başlık *'
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                error={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4 }}>
                SEO Bilgileri
              </Typography>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Başlık *'
                    value={formData.seo?.metaTitle}
                    onChange={e => handleSEOChange('metaTitle', e.target.value)}
                    inputProps={{ maxLength: 60 }}
                    helperText='Maksimum 60 karakter'
                    required
                    error={formErrors.seo}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Açıklama *'
                    value={formData.seo?.metaDescription}
                    onChange={e => handleSEOChange('metaDescription', e.target.value)}
                    multiline
                    rows={2}
                    inputProps={{ maxLength: 160 }}
                    helperText='Maksimum 160 karakter'
                    required
                    error={formErrors.seo}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Anahtar Kelimeler'
                    value={formData.seo?.metaKeywords}
                    onChange={e => handleSEOChange('metaKeywords', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Canonical URL'
                    value={formData.seo?.canonicalURL}
                    onChange={e => handleSEOChange('canonicalURL', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    Meta Resim
                  </Typography>
                  <ImageUpload
                    value={formData.seo?.metaImage}
                    onChange={value => handleSEOChange('metaImage', value)}
                    currentImageUrl={
                      about?.seo?.metaImage && typeof about.seo.metaImage === 'object'
                        ? about.seo.metaImage.url
                        : undefined
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity='error'>{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Button component={Link} href='/dashboard' color='secondary'>
                  İptal
                </Button>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default BlogPage
