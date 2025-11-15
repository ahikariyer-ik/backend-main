'use client'

import { useState, useEffect } from 'react'

import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem
} from '@mui/material'

import { authService } from '@/services'
import type { StrapiCompanyProfile } from '@/services/auth.service'
import { axiosClient, axiosFileClient } from '@/libs/axios'

const CompanyProfilePage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [companyData, setCompanyData] = useState<StrapiCompanyProfile | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      
      try {
        // Önce auth check yap
        await authService.checkAuth()
        
        const profile = authService.getCompanyProfile()

        if (profile) {
          setCompanyData(profile)

          if (profile.logo) {
            setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${profile.logo.url}`)
          }

          if (profile.companyGallery) {
            const previews = profile.companyGallery.map(
              (image: any) => `${process.env.NEXT_PUBLIC_API_URL}${image.url}`
            )

            setGalleryPreviews(previews)
          }
        } else {
          setError('Şirket profili bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.')
        }
      } catch (error) {
        console.error('Profile load error:', error)
        setError('Profil yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]

      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files)

      if (files.length + galleryFiles.length > 4) {
        setError('En fazla 4 fotoğraf yükleyebilirsiniz')

return
      }

      setGalleryFiles([...galleryFiles, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))

      setGalleryPreviews([...galleryPreviews, ...newPreviews])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyData) return

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      let logoId = companyData.logo?.id
      let galleryIds: number[] = []

      if (logoFile) {
        const formData = new FormData()

        formData.append('files', logoFile)
        const uploadResponse = await axiosFileClient.post('/api/upload', formData)

        logoId = uploadResponse.data[0].id
      }

      if (galleryFiles.length > 0) {
        const formData = new FormData()

        galleryFiles.forEach(file => {
          formData.append('files', file)
        })
        const uploadResponse = await axiosFileClient.post('/api/upload', formData)

        galleryIds = uploadResponse.data.map((item: any) => item.id)
      }

      // Şirket profilini güncelle
      const response = await axiosClient.put(`/api/company-profiles/${companyData.id}`, {
        data: {
          companyName: companyData.companyName,
          addressFull: companyData.addressFull,
          city: companyData.city,
          district: companyData.district,
          phone: companyData.phone,
          email: companyData.email,
          logo: logoId,
          companyGallery: galleryIds,
          companyAbout: companyData.companyAbout
        }
      })

      if (response.data) {
        setSuccess('Şirket bilgileri başarıyla güncellendi')
        await authService.checkAuth()
        const profile = authService.getCompanyProfile()

        if (profile) {
          setCompanyData(profile)

          if (profile.logo) {
            setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${profile.logo.url}`)
          }

          if (profile.companyGallery) {
            const previews = profile.companyGallery.map(
              (image: any) => `${process.env.NEXT_PUBLIC_API_URL}${image.url}`
            )

            setGalleryPreviews(previews)
          }
        }
      }
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err)
      setError(err.response?.data?.error?.message || 'Profil güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error && !companyData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Şirket profili yüklenemedi. Lütfen sayfayı yenileyin veya sistem yöneticisi ile iletişime geçin.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (!companyData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Şirket profili bulunamadı
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant='h6' color='text.primary' mb={1}>
                Kurum Bilgileri
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Kurum bilgilerinizi güncelleyebilirsiniz.
              </Typography>
            </Grid>

            {(error || success) && (
              <Grid item xs={12}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
              </Grid>
            )}

            <Grid item xs={12} display='flex' justifyContent='center'>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={logoPreview || '/images/company-logo.png'}
                  alt='Şirket Logosu'
                  sx={{ width: 120, height: 120, mb: 4 }}
                />
                <Button
                  variant='contained'
                  component='label'
                  size='small'
                  sx={{
                    position: 'absolute',
                    bottom: 32,
                    right: -10
                  }}
                >
                  <input hidden accept='image/*' type='file' onChange={handleLogoChange} />
                  <i className='tabler-camera' />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Kurum Adı'
                value={companyData.companyName}
                onChange={e => setCompanyData({ ...companyData, companyName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='E-posta'
                type='email'
                value={companyData.email}
                onChange={e => setCompanyData({ ...companyData, email: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Telefon'
                value={companyData.phone}
                onChange={e => setCompanyData({ ...companyData, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Şehir'
                value={companyData.city}
                onChange={e => setCompanyData({ ...companyData, city: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='İlçe'
                value={companyData.district || ''}
                onChange={e => setCompanyData({ ...companyData, district: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Adres'
                value={companyData.addressFull}
                onChange={e => setCompanyData({ ...companyData, addressFull: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Kurum Hakkında'
                value={companyData.companyAbout || ''}
                onChange={e => setCompanyData({ ...companyData, companyAbout: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle1' mb={2}>
                Kurum Galerisi (En fazla 4 fotoğraf)
              </Typography>
              <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={120}>
                {galleryPreviews.map((preview, index) => (
                  <ImageListItem key={index} sx={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Galeri ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
                        const updatedFiles = galleryFiles.filter((_, i) => i !== index);

                        setGalleryPreviews(updatedPreviews);
                        setGalleryFiles(updatedFiles);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        minWidth: 'unset',
                        padding: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                      }}
                    >
                      <i className='tabler-x' style={{ fontSize: '1rem' }} />
                    </Button>
                  </ImageListItem>
                ))}
                {galleryPreviews.length < 4 && (
                  <ImageListItem>
                    <Button
                      variant='outlined'
                      component='label'
                      sx={{
                        width: '100%',
                        height: '100%',
                        minHeight: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className='tabler-plus' style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                      <span>Fotoğraf Ekle</span>
                      <input
                        hidden
                        accept='image/*'
                        type='file'
                        multiple
                        onChange={handleGalleryChange}
                      />
                    </Button>
                  </ImageListItem>
                )}
              </ImageList>
            </Grid>

            <Grid item xs={12} display='flex' justifyContent='flex-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default CompanyProfilePage
