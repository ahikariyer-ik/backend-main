'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Slider,
  Box
} from '@mui/material'

// Third-party Imports
import { toast } from 'react-toastify'

// API Import
import { axiosClient } from '@/libs/axios'

// Components Import
import JobEditor from '@/components/editor/JobEditor'

// Types
interface ReferenceData {
  id: number
  key: string
  name: string
}

interface JobData {
  id: string
  title: string
  description: string
  profession: string
  city: string
  district: string
  requiredQualifications: string
  jobNature: string
  department: string
  work_mode: string
  position: string
  employmentType: string
  disabilityFriendly: boolean
  ageRange: [number, number]
  educationRequirement: string
  publicationEndDate: string
  jobStatus: 'Active' | 'Expired' | 'Pending'
  gender: string
  contactEmail: string
  contactPhone: string
}

const UpdateJobPage = () => {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<JobData>({
    id: '',
    title: '',
    description: '',
    profession: '',
    city: '',
    district: '',
    requiredQualifications: '',
    jobNature: '',
    department: '',
    work_mode: '',
    position: '',
    employmentType: '',
    disabilityFriendly: false,
    ageRange: [18, 65],
    educationRequirement: '',
    publicationEndDate: '',
    jobStatus: 'Pending',
    gender: '',
    contactEmail: '',
    contactPhone: ''
  })

  // Referans data states
  const [positions, setPositions] = useState<ReferenceData[]>([])
  const [departments, setDepartments] = useState<ReferenceData[]>([])
  const [workModes, setWorkModes] = useState<ReferenceData[]>([])
  const [professions, setProfessions] = useState<ReferenceData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, positionsRes, departmentsRes, workModesRes, professionsRes] = await Promise.all([
          axiosClient.get(`/api/job-listings/${id}?populate=*`),
          axiosClient.get('/api/positions'),
          axiosClient.get('/api/departments'),
          axiosClient.get('/api/work-modes'),
          axiosClient.get('/api/professions')
        ])

        const jobData = jobRes.data.data

        // Tarih formatını düzenle
        const formattedDate = jobData.publicationEndDate
          ? new Date(jobData.publicationEndDate).toISOString().slice(0, 16)
          : ''

        const newFormData: JobData = {
          id: jobData.id,
          title: jobData.title || '',
          description: jobData.description || '',
          profession: jobData.profession?.id?.toString() || '',
          city: jobData.city || '',
          district: jobData.district || '',
          requiredQualifications: jobData.requiredQualifications || '',
          jobNature: jobData.jobNature || '',
          department: jobData.department?.id?.toString() || '',
          work_mode: jobData.work_mode?.id?.toString() || '',
          position: jobData.position?.id?.toString() || '',
          employmentType: jobData.employmentType || '',
          disabilityFriendly: jobData.disabilityFriendly || false,
          ageRange: [jobData.minAge || 18, jobData.maxAge || 65],
          educationRequirement: jobData.educationRequirement || '',
          publicationEndDate: formattedDate,
          jobStatus: jobData.jobStatus || 'Pending',
          gender: jobData.gender || '',
          contactEmail: jobData.contactEmail || '',
          contactPhone: jobData.contactPhone || ''
        }

        setFormData(newFormData)
        setPositions(positionsRes.data.data)
        setDepartments(departmentsRes.data.data)
        setWorkModes(workModesRes.data.data)
        setProfessions(professionsRes.data.data)
      } catch (error: any) {
        console.error('Veriler yüklenirken hata oluştu:', error)
        toast.error(error.response?.data?.error?.message || 'Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.')
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobListingData = {
        data: {
          title: formData.title,
          description: formData.description,
          profession: formData.profession,
          city: formData.city,
          district: formData.district,
          requiredQualifications: formData.requiredQualifications,
          jobNature: formData.jobNature,
          department: formData.department,
          work_mode: formData.work_mode,
          position: formData.position,
          employmentType: formData.employmentType,
          disabilityFriendly: formData.disabilityFriendly,
          minAge: formData.ageRange[0],
          maxAge: formData.ageRange[1],
          educationRequirement: formData.educationRequirement,
          publicationEndDate: formData.publicationEndDate,
          jobStatus: formData.jobStatus,
          gender: formData.gender,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone
        }
      }

      const promise = axiosClient.put(`/api/job-listings/${formData.id}`, jobListingData)

      await toast.promise(promise, {
        pending: {
          render: () => (
            <div className='flex items-center'>
              <span>İlan güncelleniyor...</span>
            </div>
          )
        },
        success: {
          render: () => (
            <div className='flex items-center'>
              <span>İlan başarıyla güncellendi!</span>
            </div>
          )
        },
        error: {
          render: ({ data }: any) => (
            <div className='flex items-center'>
              <span>{data?.response?.data?.error?.message || 'İlan güncellenirken bir hata oluştu'}</span>
            </div>
          )
        }
      })

      router.push('/jobs/list')
    } catch (error) {
      // Hata toast.promise içinde gösteriliyor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' color='text.primary' sx={{ mb: 4 }}>
          İlanı Güncelle
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='İlan Başlığı'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>İş Tanımı</Typography>
              <JobEditor
                content={formData.description}
                placeholder="İş tanımını detaylı bir şekilde yazın..."
                onChange={html => setFormData({ ...formData, description: html })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Meslek</InputLabel>
                <Select
                  value={formData.profession}
                  label='Meslek'
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                >
                  {professions.map(profession => (
                    <MenuItem key={profession.key} value={profession.id}>
                      {profession.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label='Şehir'
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label='İlçe'
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Aranan Nitelikler</Typography>
              <JobEditor
                content={formData.requiredQualifications}
                placeholder="Adaylarda aradığınız nitelikleri yazın..."
                onChange={html => setFormData({ ...formData, requiredQualifications: html })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Yapılacak İş Tanımı</Typography>
              <JobEditor
                content={formData.jobNature}
                placeholder="Yapılacak işin detaylarını yazın..."
                onChange={html => setFormData({ ...formData, jobNature: html })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.department}
                  label='Departman'
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map(department => (
                    <MenuItem key={department.key} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Çalışma Şekli</InputLabel>
                <Select
                  value={formData.work_mode}
                  label='Çalışma Şekli'
                  onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
                >
                  {workModes.map(workMode => (
                    <MenuItem key={workMode.key} value={workMode.id}>
                      {workMode.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Pozisyon</InputLabel>
                <Select
                  value={formData.position}
                  label='Pozisyon'
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                >
                  {positions.map(position => (
                    <MenuItem key={position.key} value={position.id}>
                      {position.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>İstihdam Türü</InputLabel>
                <Select
                  value={formData.employmentType}
                  label='İstihdam Türü'
                  onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                >
                  <MenuItem value='Tam Zamanlı'>Tam Zamanlı</MenuItem>
                  <MenuItem value='Dönemsel'>Dönemsel</MenuItem>
                  <MenuItem value='Yarı Zamanlı'>Yarı Zamanlı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.gender}
                  label='Cinsiyet'
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value='Erkek'>Erkek</MenuItem>
                  <MenuItem value='Kadın'>Kadın</MenuItem>
                  <MenuItem value='Farketmez'>Farketmez</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.disabilityFriendly}
                    onChange={e => setFormData({ ...formData, disabilityFriendly: e.target.checked })}
                  />
                }
                label='Engelli Aday Aranıyor'
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Yaş Aralığı</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={formData.ageRange}
                  onChange={(_, newValue) => setFormData({ ...formData, ageRange: newValue as [number, number] })}
                  valueLabelDisplay="auto"
                  min={18}
                  max={65}
                  marks={[
                    { value: 18, label: '18' },
                    { value: 65, label: '65' }
                  ]}
                  sx={{ mt: 2 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                <Typography variant="body2">{formData.ageRange[0]} yaş</Typography>
                <Typography variant="body2">{formData.ageRange[1]} yaş</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Eğitim Seviyesi</InputLabel>
                <Select
                  value={formData.educationRequirement}
                  label='Eğitim Seviyesi'
                  onChange={e => setFormData({ ...formData, educationRequirement: e.target.value })}
                >
                  <MenuItem value='İlköğretim'>İlköğretim</MenuItem>
                  <MenuItem value='Ortaöğretim'>Ortaöğretim</MenuItem>
                  <MenuItem value='Lise'>Lise</MenuItem>
                  <MenuItem value='Lisans'>Lisans</MenuItem>
                  <MenuItem value='Yüksek Lisans'>Yüksek Lisans</MenuItem>
                  <MenuItem value='Doktora'>Doktora</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label='İlan Bitiş Tarihi'
                value={formData.publicationEndDate}
                onChange={e => setFormData({ ...formData, publicationEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label='İletişim E-posta'
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label='İletişim Telefon'
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                fullWidth
                disabled={loading}
              >
                {loading ? 'İlan Güncelleniyor...' : 'İlanı Güncelle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default UpdateJobPage
