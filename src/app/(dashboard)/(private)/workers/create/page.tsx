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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'

// Services
import { axiosClient } from '@/libs/axios'
import { authService } from '@/services'

interface WorkerFormData {
  photo?: File | null
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  hireDate: string
  profession: string
  department: string
  branch: string
  isRetired: boolean
  isDisabled: boolean
  isForeigner: boolean
  salary: string
}

const CreateWorkerPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<WorkerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    hireDate: '',
    profession: '',
    department: '',
    branch: '',
    isRetired: false,
    isDisabled: false,
    isForeigner: false,
    salary: ''
  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof WorkerFormData, boolean>>>({})

  const router = useRouter()

  useEffect(() => {
    loadDepartments()
    loadBranches()
  }, [])

  const loadDepartments = async () => {
    try {
      const response = await axiosClient.get('/api/departments')
      setDepartments(response.data.data || [])
    } catch (error: any) {
      console.error('Departmanlar yüklenirken hata:', error)
    }
  }

  const loadBranches = async () => {
    try {
      const response = await axiosClient.get('/api/branches')
      setBranches(response.data.data || [])
    } catch (error: any) {
      console.error('Şubeler yüklenirken hata:', error)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    // Validation
    console.log('Form data before validation:', formData)
    console.log('Form data email:', formData.email, 'type:', typeof formData.email)
    
    const errors: Partial<Record<keyof WorkerFormData, boolean>> = {}
    if (!formData.firstName) errors.firstName = true
    if (!formData.lastName) errors.lastName = true
    if (!formData.email) errors.email = true
    if (!formData.hireDate) errors.hireDate = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun: ' + Object.keys(errors).join(', '))
      setLoading(false)
      return
    }

    console.log('Validation passed! Email:', formData.email)

    try {
      const companyProfile = authService.getCompanyProfile()
      if (!companyProfile) {
        throw new Error('Şirket profili bulunamadı')
      }

      console.log('Company profile found:', companyProfile.id)
      
      // NOT: User account oluşturma şimdilik devre dışı - şifre sistemi için farklı yöntem uygulanacak
      let userId: number | null = null

      // 2. Photo upload
      let photoId: number | null = null
      if (formData.photo) {
        const formDataUpload = new FormData()
        formDataUpload.append('files', formData.photo)
        const uploadResponse = await axiosClient.post('/api/upload', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        photoId = uploadResponse.data[0].id
      }

      // 2. Worker oluştur
      const workerPayload: any = {
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          birthDate: formData.birthDate || undefined,
          hireDate: formData.hireDate,
          profession: formData.profession || undefined,
          department: formData.department || undefined,
          branch: formData.branch || undefined,
          isRetired: formData.isRetired,
          isDisabled: formData.isDisabled,
          isForeigner: formData.isForeigner,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          isActive: true,
          company: companyProfile.id,
          photo: photoId || undefined
          // NOT: user ilişkisi kaldırıldı - şifre sistemi için farklı yöntem uygulanacak
        }
      }

     await axiosClient.post('/api/workers', workerPayload)


      router.push('/workers/list')
    } catch (error: any) {
      console.error('Çalışan oluşturma hatası:', error)
      console.error('Error details:', error.response?.data)
      setError(error.message || error.response?.data?.error?.message || 'Çalışan oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof WorkerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Yeni Çalışan Ekle'
          action={
            <Button component={Link} href='/workers/list' color='secondary' variant='outlined'>
              Geri Dön
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            {/* Fotoğraf */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={photoPreview || undefined}
                  sx={{ width: 120, height: 120 }}
                >
                  {formData.firstName.charAt(0).toUpperCase()}
                </Avatar>
                <input
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='photo-upload'
                  type='file'
                  onChange={handlePhotoChange}
                />
                <label htmlFor='photo-upload'>
                  <Button variant='outlined' component='span'>
                    Fotoğraf Yükle
                  </Button>
                </label>
              </Box>
            </Grid>

            {/* Ad */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Ad'
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                required
                error={formErrors.firstName}
              />
            </Grid>

            {/* Soyad */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Soyad'
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                required
                error={formErrors.lastName}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='email'
                label='E-posta'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                error={formErrors.email}
              />
            </Grid>

            {/* Telefon */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Telefon'
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </Grid>

            {/* Doğum Tarihi */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='date'
                label='Doğum Tarihi'
                value={formData.birthDate}
                onChange={e => handleChange('birthDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* İşe Giriş Tarihi */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='date'
                label='İşe Giriş Tarihi'
                value={formData.hireDate}
                onChange={e => handleChange('hireDate', e.target.value)}
                required
                error={formErrors.hireDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Meslek */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Meslek'
                value={formData.profession}
                onChange={e => handleChange('profession', e.target.value)}
              />
            </Grid>

            {/* Departman */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.department}
                  label='Departman'
                  onChange={e => handleChange('department', e.target.value)}
                >
                  <MenuItem value=''>Seçiniz</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Şube */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Şube</InputLabel>
                <Select
                  value={formData.branch}
                  onChange={e => handleChange('branch', e.target.value as string)}
                  label='Şube'
                >
                  <MenuItem value=''>Seçiniz</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Maaş */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                type='number'
                label='Maaş'
                value={formData.salary}
                onChange={e => handleChange('salary', e.target.value)}
              />
            </Grid>


            {/* Emekli */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRetired}
                    onChange={e => handleChange('isRetired', e.target.checked)}
                  />
                }
                label='Emekli'
              />
            </Grid>

            {/* Engelli */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDisabled}
                    onChange={e => handleChange('isDisabled', e.target.checked)}
                  />
                }
                label='Engelli'
              />
            </Grid>

            {/* Yabancı */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isForeigner}
                    onChange={e => handleChange('isForeigner', e.target.checked)}
                  />
                }
                label='Yabancı'
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity='error'>{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Button component={Link} href='/workers/list' color='secondary'>
                  İptal
                </Button>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Oluştur'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default CreateWorkerPage

