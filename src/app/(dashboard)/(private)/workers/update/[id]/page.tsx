'use client'

import { use, useState, useEffect } from 'react'
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
  changePassword: boolean
  newPassword: string
  confirmPassword: string
}

const UpdateWorkerPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)

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
    salary: '',
    changePassword: false,
    newPassword: '',
    confirmPassword: ''
  })

  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [workerResponse, departmentsResponse, branchesResponse] = await Promise.all([
        axiosClient.get(`/api/workers/${resolvedParams.id}`, {
          params: {
            populate: ['photo', 'department', 'branch', 'user', 'company']
          }
        }),
        axiosClient.get('/api/departments'),
        axiosClient.get('/api/branches')
      ])

      const worker = workerResponse.data.data
      setDepartments(departmentsResponse.data.data || [])
      setBranches(branchesResponse.data.data || [])

      if (worker) {
        setFormData({
          firstName: worker.firstName || '',
          lastName: worker.lastName || '',
          email: worker.email || '',
          phone: worker.phone || '',
          birthDate: worker.birthDate ? worker.birthDate.split('T')[0] : '',
          hireDate: worker.hireDate ? worker.hireDate.split('T')[0] : '',
          profession: worker.profession || '',
          department: worker.department?.id?.toString() || '',
          branch: worker.branch?.id?.toString() || '',
          isRetired: worker.isRetired || false,
          isDisabled: worker.isDisabled || false,
          isForeigner: worker.isForeigner || false,
          salary: worker.salary?.toString() || ''
        })

        if (worker.photo) {
          setCurrentPhotoUrl(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${worker.photo.url}`)
        }
      }
    } catch (error: any) {
      console.error('Veri yüklenirken hata:', error)
      setError('Veri yüklenirken bir hata oluştu')
    } finally {
      setLoadingData(false)
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

    // Şifre değiştirme kontrolü
    if (formData.changePassword) {
      if (!formData.newPassword || !formData.confirmPassword) {
        setError('Lütfen yeni şifre ve şifre tekrarını girin')
        setLoading(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor')
        setLoading(false)
        return
      }
      if (formData.newPassword.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır')
        setLoading(false)
        return
      }
    }

    try {
      // 1. Photo upload if new photo
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

      // 2. Update worker
      const workerPayload: any = {
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          birthDate: formData.birthDate || undefined,
          hireDate: formData.hireDate,
          profession: formData.profession || undefined,
          branch: formData.branch || undefined,
          isRetired: formData.isRetired,
          isDisabled: formData.isDisabled,
          isForeigner: formData.isForeigner,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          department: formData.department || undefined,
          photo: photoId || undefined,
          // Şifre değiştirme
          changePassword: formData.changePassword,
          newPassword: formData.changePassword ? formData.newPassword : undefined
        }
      }

      await axiosClient.put(`/api/workers/${resolvedParams.id}`, workerPayload)
      router.push('/workers/list')
    } catch (error: any) {
      console.error('Çalışan güncelleme hatası:', error)
      setError(error.response?.data?.error?.message || 'Çalışan güncellenirken bir hata oluştu')
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

  if (loadingData) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Çalışan Düzenle'
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
                  src={photoPreview || currentPhotoUrl || undefined}
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
                    Fotoğraf Değiştir
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
                disabled
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

            {/* Şifre Değiştirme Bölümü */}
            <Grid item xs={12}>
              <Box sx={{ 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1, 
                p: 3, 
                mt: 2,
                backgroundColor: 'action.hover'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.changePassword}
                      onChange={e => handleChange('changePassword', e.target.checked)}
                      color='warning'
                    />
                  }
                  label='Şifre Değiştir (Çalışan şifresini unuttuğunda kullanın)'
                />

                {formData.changePassword && (
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        fullWidth
                        type='password'
                        label='Yeni Şifre'
                        value={formData.newPassword}
                        onChange={e => handleChange('newPassword', e.target.value)}
                        helperText='Minimum 6 karakter'
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        fullWidth
                        type='password'
                        label='Yeni Şifre Tekrar'
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
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
                  {loading ? <CircularProgress size={24} /> : 'Güncelle'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default UpdateWorkerPage

