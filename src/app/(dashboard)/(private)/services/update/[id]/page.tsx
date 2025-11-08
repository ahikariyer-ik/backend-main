'use client'

import { useEffect, useState , use } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'
import ImageUpload from '@/components/upload/ImageUpload'
import RichTextEditor from '@/components/editor/RichTextEditor'

// Types
import type { StrapiService, UpdateServiceDTO } from '@/services/services.service'

// Services
import { servicesService } from '@/services/services.service'

const UpdateServicePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params)

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<StrapiService | null>(null)
  const [formData, setFormData] = useState<Required<UpdateServiceDTO>>({
    documentId: resolvedParams.id,
    title: '',
    description: '',
    content: '',
    icon: '',
    isActive: true,
    displayOrder: 1,
    image: '',
    slug: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: 'index, follow',
      canonicalURL: '',
      metaImage: {
        id: '',
        url: ''
      }
    }
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateServiceDTO, boolean>>>({})

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadService()
  }, [])

  // Handlers
  const loadService = async () => {
    try {
      const data = await servicesService.getService(resolvedParams.id)
      if (!data) {
        setError('Hizmet bulunamadı')
        return
      }

      setService(data)
      setFormData({
        documentId: data.documentId,
        title: data.title,
        description: data.description,
        content: data.content,
        icon: data.icon,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
        image: data.image?.id || '',
        slug: data.slug,
        seo: {
          metaTitle: data.seo?.metaTitle || '',
          metaDescription: data.seo?.metaDescription || '',
          metaKeywords: data.seo?.metaKeywords || '',
          metaRobots: data.seo?.metaRobots || 'index, follow',
          canonicalURL: data.seo?.canonicalURL || '',
          metaImage: data.seo?.metaImage || { id: '', url: '' }
        }
      })
    } catch (error: any) {
      console.error('Hizmet yüklenirken hata:', error)
      if (error.response?.status === 404) {
        setError('Hizmet bulunamadı')
      } else if (error.response?.status === 500) {
        setError('Sunucu hatası oluştu')
      } else if (!error.response) {
        setError('Sunucuya bağlanılamadı')
      } else {
        setError(error.response?.data?.error?.message || 'Hizmet yüklenirken bir hata oluştu')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    // Validation
    const errors: Partial<Record<keyof UpdateServiceDTO, boolean>> = {}
    if (!formData.title) errors.title = true
    if (!formData.description) errors.description = true
    if (!formData.content) errors.content = true
    if (!formData.icon) errors.icon = true
    if (!formData.image) errors.image = true
    if (!formData.seo.metaTitle) errors.seo = true
    if (!formData.seo.metaDescription) errors.seo = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      await servicesService.updateService(formData)
      router.push('/services/list')
    } catch (error: any) {
      console.error('Güncelleme hatası:', error)
      setError(error.response?.data?.error?.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSEOChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: field === 'metaImage' && typeof value === 'string'
          ? { id: value, url: '' }
          : value
      }
    }))
  }

  if (!service) {
    return <Typography>Yükleniyor...</Typography>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Hizmet Düzenle'
          action={
            <Button component={Link} href='/services/list' color='secondary' variant='outlined'>
              Geri Dön
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Başlık'
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                error={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='URL Adresi'
                value={formData.slug}
                onChange={e => handleChange('slug', e.target.value)}
                required
                error={formErrors.slug}
                helperText='Otomatik oluşturulur, gerekirse düzenleyebilirsiniz'
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Açıklama'
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                multiline
                rows={3}
                required
                error={formErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>İçerik *</Typography>
              <RichTextEditor
                value={formData.content}
                onChange={value => handleChange('content', value)}
                error={formErrors.content}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>Resim *</Typography>
              <ImageUpload
                value={formData.image}
                onChange={value => handleChange('image', value)}
                error={formErrors.image}
                required
                currentImageUrl={service.image.url}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='İkon'
                value={formData.icon}
                onChange={e => handleChange('icon', e.target.value)}
                required
                error={formErrors.icon}
                helperText='Tabler Icons kodu (örn: tabler-home)'
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='number'
                label='Sıralama'
                value={formData.displayOrder}
                onChange={e => handleChange('displayOrder', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={e => handleChange('isActive', e.target.checked)}
                  />
                }
                label='Aktif'
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4 }}>SEO Bilgileri</Typography>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Başlık'
                    value={formData.seo.metaTitle}
                    onChange={e => handleSEOChange('metaTitle', e.target.value)}
                    inputProps={{ maxLength: 60 }}
                    helperText='Maksimum 60 karakter'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Açıklama'
                    value={formData.seo.metaDescription}
                    onChange={e => handleSEOChange('metaDescription', e.target.value)}
                    multiline
                    rows={2}
                    inputProps={{ maxLength: 160 }}
                    helperText='Maksimum 160 karakter'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Anahtar Kelimeler'
                    value={formData.seo.metaKeywords}
                    onChange={e => handleSEOChange('metaKeywords', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Canonical URL'
                    value={formData.seo.canonicalURL}
                    onChange={e => handleSEOChange('canonicalURL', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>Meta Resim</Typography>
                  <ImageUpload
                    value={formData.seo.metaImage?.id || ''}
                    onChange={value => handleSEOChange('metaImage', value)}
                    currentImageUrl={service?.seo?.metaImage?.url}
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
                <Button component={Link} href='/services/list' color='secondary'>
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

export default UpdateServicePage
