'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/upload/ImageUpload'
import RichTextEditor from '@/components/editor/RichTextEditor'
import Link from '@components/Link'

// Third Party Imports
import { toast } from 'react-toastify'

// Types
import type { StrapiAbout, UpdateAboutDTO, FAQItem } from '@/services/about.service'

// Services
import { aboutService } from '@/services/about.service'

const AboutPage = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [about, setAbout] = useState<StrapiAbout | null>(null)
  const [formData, setFormData] = useState<UpdateAboutDTO>({
    title: '',
    content: '',
    faqs: [],
    contact_title: '',
    contact_description: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: 'index, follow',
      canonicalURL: '',
      metaImage: undefined,
    },
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateAboutDTO | 'faqs', boolean>>>({})
  const [faqErrors, setFaqErrors] = useState<boolean[]>([])
  
  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    loadAbout()
  }, [])

  // Handlers
  const loadAbout = async () => {
    try {
      const data = await aboutService.getAbout()
      if (!data) {
        toast.error('Hakkımızda bilgileri bulunamadı')
        return
      }

      setAbout(data)
      setFormData({
        title: data.title || '',
        content: data.content,
        faqs: data.faqs || [],
        contact_title: data.contact_title || '',
        contact_description: data.contact_description || '',
        seo: {
          metaTitle: data.seo?.metaTitle || '',
          metaDescription: data.seo?.metaDescription || '',
          metaKeywords: data.seo?.metaKeywords || '',
          metaRobots: data.seo?.metaRobots || 'index, follow',
          canonicalURL: data.seo?.canonicalURL || '',
          metaImage: data.seo?.metaImage && typeof data.seo.metaImage === 'object' ? data.seo.metaImage.id : undefined,
        },
      })
      setFaqErrors((data.faqs || []).map(() => false))
    } catch (error: any) {
      console.error('Hakkımızda bilgileri yüklenirken hata:', error)
      toast.error(error.response?.data?.error?.message || 'Hakkımızda bilgileri yüklenirken bir hata oluştu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})
    setFaqErrors(formData.faqs?.map(() => false) || [])

    // Validation
    const errors: Partial<Record<keyof UpdateAboutDTO | 'faqs', boolean>> = {}
    if (!formData.title) errors.title = true
    if (!formData.content) errors.content = true
    if (!formData.contact_title) errors.contact_title = true
    if (!formData.contact_description) errors.contact_description = true
    if (!formData.seo?.metaTitle) errors.seo = true
    if (!formData.seo?.metaDescription) errors.seo = true

    const newFaqErrors = formData.faqs?.map(faq => !faq.question || !faq.answer) || []
    if (newFaqErrors.some(error => error)) errors.faqs = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setFaqErrors(newFaqErrors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      await aboutService.updateAbout(formData)
      toast.success('Hakkımızda bilgileri başarıyla güncellendi')
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
      [field]: value,
    }))
    setFormErrors(prev => ({ ...prev, [field]: false }))
  }

  const handleSEOChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo!,
        [field]: value,
      },
    }))
    if (field === 'metaTitle' || field === 'metaDescription') {
      setFormErrors(prev => ({ ...prev, seo: false }))
    }
  }

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs?.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)) || [],
    }))
    setFaqErrors(prev => prev.map((error, i) => (i === index ? !value : error)))
    setFormErrors(prev => ({ ...prev, faqs: false }))
  }

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }))
    setFaqErrors(prev => [...prev, false])
  }

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs?.filter((_, i) => i !== index),
    }))
    setFaqErrors(prev => prev.filter((_, i) => i !== index))
    setFormErrors(prev => ({ ...prev, faqs: false }))
  }

  if (!about) {
    return <Typography>Yükleniyor...</Typography>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Hakkımızda Bilgileri Düzenle"
          action={
            <Button component={Link} href="/dashboard" color="secondary" variant="outlined">
              Geri Dön
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label="Başlık *"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                error={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                İçerik *
              </Typography>
              <RichTextEditor
                value={formData.content}
                onChange={value => handleChange('content', value)}
                error={formErrors.content}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 4 }}>
                Sıkça Sorulan Sorular
              </Typography>
              {formData.faqs?.map((faq, index) => (
                <Box key={index} sx={{ mb: 4, border: '1px solid #e0e0e0', p: 3, borderRadius: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <CustomTextField
                        fullWidth
                        label="Soru *"
                        value={faq.question}
                        onChange={e => handleFAQChange(index, 'question', e.target.value)}
                        required
                        error={faqErrors[index]}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <CustomTextField
                        fullWidth
                        label="Cevap *"
                        value={faq.answer}
                        onChange={e => handleFAQChange(index, 'answer', e.target.value)}
                        required
                        error={faqErrors[index]}
                      />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => removeFAQ(index)} color="error">
                        <i className="tabler-trash" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button variant="outlined" onClick={addFAQ} startIcon={<i className="tabler-plus" />}>
                Yeni SSS Ekle
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 4 }}>
                İletişim Bölümü
              </Typography>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="İletişim Başlığı *"
                    value={formData.contact_title}
                    onChange={e => handleChange('contact_title', e.target.value)}
                    required
                    error={formErrors.contact_title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="İletişim Açıklaması *"
                    value={formData.contact_description}
                    onChange={e => handleChange('contact_description', e.target.value)}
                    multiline
                    rows={3}
                    required
                    error={formErrors.contact_description}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 4 }}>SEO Bilgileri</Typography>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Meta Başlık *"
                    value={formData.seo?.metaTitle}
                    onChange={e => handleSEOChange('metaTitle', e.target.value)}
                    inputProps={{ maxLength: 60 }}
                    helperText="Maksimum 60 karakter"
                    required
                    error={formErrors.seo}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Meta Açıklama *"
                    value={formData.seo?.metaDescription}
                    onChange={e => handleSEOChange('metaDescription', e.target.value)}
                    multiline
                    rows={2}
                    inputProps={{ maxLength: 160 }}
                    helperText="Maksimum 160 karakter"
                    required
                    error={formErrors.seo}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Meta Anahtar Kelimeler"
                    value={formData.seo?.metaKeywords}
                    onChange={e => handleSEOChange('metaKeywords', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label="Canonical URL"
                    value={formData.seo?.canonicalURL}
                    onChange={e => handleSEOChange('canonicalURL', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>Meta Resim</Typography>
                  <ImageUpload
                    value={formData.seo?.metaImage}
                    onChange={value => handleSEOChange('metaImage', value)}
                    currentImageUrl={about?.seo?.metaImage && typeof about.seo.metaImage === 'object' ? about.seo.metaImage.url : undefined}
                  />
                </Grid>
              </Grid>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Button component={Link} href="/dashboard" color="secondary">
                  İptal
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
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

export default AboutPage
