'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import ImageUpload from '@/components/upload/ImageUpload'

// Third Party Imports
import { toast } from 'react-toastify'

// Types
import type { StrapiContact, UpdateContactDTO } from '@/services/contact.service'

// Services
import { contactService } from '@/services/contact.service'

const ContactPage = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<StrapiContact | null>(null)
  const [formData, setFormData] = useState<UpdateContactDTO>({
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    mapLat: 0,
    mapLng: 0,
    facebook: '',
    instagram: '',
    linkedin: '',
    weekdayHours: '',
    weekendHours: '',
    isWeekendOpen: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      metaRobots: 'index, follow',
      canonicalURL: '',
      metaImage: ''
    }
  })

  // Effects
  useEffect(() => {
    loadContact()
  }, [])

  // Handlers
  const loadContact = async () => {
    try {
      const data = await contactService.getContact()
      if (!data) {
        toast.error('İletişim bilgileri bulunamadı')
        return
      }

      setContact(data)
      setFormData({
        companyName: data.companyName || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        mapLat: data.mapLat || 0,
        mapLng: data.mapLng || 0,
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        weekdayHours: data.weekdayHours || '',
        weekendHours: data.weekendHours || '',
        isWeekendOpen: data.isWeekendOpen || false,
        seo: {
          metaTitle: data.seo?.metaTitle || '',
          metaDescription: data.seo?.metaDescription || '',
          metaKeywords: data.seo?.metaKeywords || '',
          metaRobots: data.seo?.metaRobots || 'index, follow',
          canonicalURL: data.seo?.canonicalURL || '',
          metaImage: data.seo?.metaImage?.id || ''
        }
      })
    } catch (error: any) {
      console.error('İletişim bilgileri yüklenirken hata:', error)
      toast.error(error.response?.data?.error?.message || 'İletişim bilgileri yüklenirken bir hata oluştu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await contactService.updateContact(formData)
      toast.success('İletişim bilgileri başarıyla güncellendi')
    } catch (error: any) {
      console.error('Güncelleme hatası:', error)
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
  }

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo!,
        [field]: value
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title='İletişim Bilgileri' />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Şirket Adı'
                value={formData.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Telefon'
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='E-posta'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Adres'
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Şehir'
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Ülke'
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='number'
                label='Harita Enlem'
                value={formData.mapLat}
                onChange={e => handleChange('mapLat', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='number'
                label='Harita Boylam'
                value={formData.mapLng}
                onChange={e => handleChange('mapLng', parseFloat(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4 }}>Sosyal Medya</Typography>
              <Grid container spacing={5}>
                <Grid item xs={12} md={4}>
                  <CustomTextField
                    fullWidth
                    label='Facebook'
                    value={formData.facebook}
                    onChange={e => handleChange('facebook', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CustomTextField
                    fullWidth
                    label='Instagram'
                    value={formData.instagram}
                    onChange={e => handleChange('instagram', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CustomTextField
                    fullWidth
                    label='LinkedIn'
                    value={formData.linkedin}
                    onChange={e => handleChange('linkedin', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4 }}>Çalışma Saatleri</Typography>
              <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                  <CustomTextField
                    fullWidth
                    label='Hafta İçi'
                    value={formData.weekdayHours}
                    onChange={e => handleChange('weekdayHours', e.target.value)}
                    placeholder='09:00 - 18:00'
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomTextField
                    fullWidth
                    label='Hafta Sonu'
                    value={formData.weekendHours}
                    onChange={e => handleChange('weekendHours', e.target.value)}
                    placeholder='10:00 - 17:00'
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isWeekendOpen}
                        onChange={e => handleChange('isWeekendOpen', e.target.checked)}
                      />
                    }
                    label='Hafta Sonu Açık'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 4 }}>SEO Bilgileri</Typography>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Başlık'
                    value={formData.seo?.metaTitle}
                    onChange={e => handleSEOChange('metaTitle', e.target.value)}
                    inputProps={{ maxLength: 60 }}
                    helperText='Maksimum 60 karakter'
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Meta Açıklama'
                    value={formData.seo?.metaDescription}
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
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>Meta Resim</Typography>
                  <ImageUpload
                    value={formData.seo?.metaImage}
                    onChange={value => handleSEOChange('metaImage', value)}
                    currentImageUrl={contact?.seo?.metaImage?.url}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

export default ContactPage
