'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Slider,
  Box,
  CardHeader,
  Alert,
  TextField
} from '@mui/material'

// Component Imports
import RichTextEditor from '@/components/editor/RichTextEditor'
import Link from '@components/Link'

// Third Party Imports
import { toast } from 'react-toastify'

// Services
import { jobListingService } from '@/services/job-listing.service'
import { authService } from '@/services/auth.service'

// Types
import type { UpdateJobListingDTO, ReferenceData, StrapiCompany } from '@/services/job-listing.service'

const CreateJobPage = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState<UpdateJobListingDTO>({
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
    minAge: 18,
    maxAge: 65,
    educationRequirement: '',
    publicationEndDate: '',
    jobStatus: 'Pending',
    gender: '',
    contactEmail: '',
    contactPhone: '',
    company: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateJobListingDTO, boolean>>>({})
  const [positions, setPositions] = useState<ReferenceData[]>([])
  const [departments, setDepartments] = useState<ReferenceData[]>([])
  const [workModes, setWorkModes] = useState<ReferenceData[]>([])
  const [professions, setProfessions] = useState<ReferenceData[]>([])
  const [companies, setCompanies] = useState<StrapiCompany[]>([])

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isEmployee = authService.isEmployee()
        setIsAdmin(isEmployee)

        const referenceData = await jobListingService.getReferenceData()
        setPositions(referenceData.positions)
        setDepartments(referenceData.departments)
        setWorkModes(referenceData.workModes)
        setProfessions(referenceData.professions)

        if (isEmployee) {
          const companiesData = await jobListingService.getCompanies()
          setCompanies(companiesData)
        }
      } catch (error: any) {
        console.error('Veriler çekilirken hata oluştu:', error)
        toast.error(error.response?.data?.error?.message || 'Veriler yüklenirken bir hata oluştu.')
      }
    }

    fetchData()
  }, [])

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    // Validation
    const errors: Partial<Record<keyof UpdateJobListingDTO, boolean>> = {}
    if (!formData.title) errors.title = true
    if (!formData.description) errors.description = true
    if (!formData.profession) errors.profession = true
    if (!formData.city) errors.city = true
    if (!formData.district) errors.district = true
    if (!formData.requiredQualifications) errors.requiredQualifications = true
    if (!formData.jobNature) errors.jobNature = true
    if (!formData.department) errors.department = true
    if (!formData.work_mode) errors.work_mode = true
    if (!formData.position) errors.position = true
    if (!formData.employmentType) errors.employmentType = true
    if (!formData.educationRequirement) errors.educationRequirement = true
    if (!formData.publicationEndDate) errors.publicationEndDate = true
    if (!formData.contactEmail) errors.contactEmail = true
    if (!formData.contactPhone) errors.contactPhone = true
    if (isAdmin && !formData.company) errors.company = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      await jobListingService.createJobListing(formData)
      toast.success('İlan başarıyla oluşturuldu')
      router.push('/jobs/list')
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'İlan oluşturulurken bir hata oluştu')
      toast.error(error.response?.data?.error?.message || 'İlan oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateJobListingDTO, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    setFormErrors(prev => ({ ...prev, [field]: false }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Yeni İlan Ver"
          action={
            <Button component={Link} href="/jobs/list" color="secondary" variant="outlined">
              Geri Dön
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            {isAdmin && (
              <Grid item xs={12}>
                <FormControl fullWidth required error={formErrors.company}>
                  <InputLabel>Şirket *</InputLabel>
                  <Select
                    value={formData.company}
                    label="Şirket *"
                    onChange={e => handleChange('company', e.target.value)}
                  >
                    {companies.map(company => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.companyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="İlan Başlığı *"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                error={formErrors.title}
                helperText={formErrors.title ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                İş Tanımı *
              </Typography>
              <RichTextEditor
                value={formData.description}
                onChange={value => handleChange('description', value)}
                error={formErrors.description}
                helperText={formErrors.description ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={formErrors.profession}>
                <InputLabel>Meslek *</InputLabel>
                <Select
                  value={formData.profession}
                  label="Meslek *"
                  onChange={e => handleChange('profession', e.target.value)}
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
                label="Şehir *"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                required
                error={formErrors.city}
                helperText={formErrors.city ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İlçe *"
                value={formData.district}
                onChange={e => handleChange('district', e.target.value)}
                required
                error={formErrors.district}
                helperText={formErrors.district ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Aranan Nitelikler *
              </Typography>
              <RichTextEditor
                value={formData.requiredQualifications}
                onChange={value => handleChange('requiredQualifications', value)}
                error={formErrors.requiredQualifications}
                helperText={formErrors.requiredQualifications ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Yapılacak İş Tanımı *
              </Typography>
              <RichTextEditor
                value={formData.jobNature}
                onChange={value => handleChange('jobNature', value)}
                error={formErrors.jobNature}
                helperText={formErrors.jobNature ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={formErrors.department}>
                <InputLabel>Departman *</InputLabel>
                <Select
                  value={formData.department}
                  label="Departman *"
                  onChange={e => handleChange('department', e.target.value)}
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
              <FormControl fullWidth required error={formErrors.work_mode}>
                <InputLabel>Çalışma Şekli *</InputLabel>
                <Select
                  value={formData.work_mode}
                  label="Çalışma Şekli *"
                  onChange={e => handleChange('work_mode', e.target.value)}
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
              <FormControl fullWidth required error={formErrors.position}>
                <InputLabel>Pozisyon *</InputLabel>
                <Select
                  value={formData.position}
                  label="Pozisyon *"
                  onChange={e => handleChange('position', e.target.value)}
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
              <FormControl fullWidth required error={formErrors.employmentType}>
                <InputLabel>İstihdam Türü *</InputLabel>
                <Select
                  value={formData.employmentType}
                  label="İstihdam Türü *"
                  onChange={e => handleChange('employmentType', e.target.value)}
                >
                  <MenuItem value="Tam Zamanlı">Tam Zamanlı</MenuItem>
                  <MenuItem value="Dönemsel">Dönemsel</MenuItem>
                  <MenuItem value="Yarı Zamanlı">Yarı Zamanlı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formErrors.gender}>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.gender}
                  label="Cinsiyet"
                  onChange={e => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="Erkek">Erkek</MenuItem>
                  <MenuItem value="Kadın">Kadın</MenuItem>
                  <MenuItem value="Farketmez">Farketmez</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.disabilityFriendly}
                    onChange={e => handleChange('disabilityFriendly', e.target.checked)}
                  />
                }
                label="Engelli Aday Aranıyor"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Yaş Aralığı *
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[formData.minAge, formData.maxAge]}
                  onChange={(_, newValue) => {
                    handleChange('minAge', (newValue as number[])[0])
                    handleChange('maxAge', (newValue as number[])[1])
                  }}
                  valueLabelDisplay="auto"
                  min={18}
                  max={65}
                  marks={[
                    { value: 18, label: '18' },
                    { value: 65, label: '65' },
                  ]}
                  sx={{ mt: 2 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                <Typography variant="body2">{formData.minAge} yaş</Typography>
                <Typography variant="body2">{formData.maxAge} yaş</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={formErrors.educationRequirement}>
                <InputLabel>Eğitim Seviyesi *</InputLabel>
                <Select
                  value={formData.educationRequirement}
                  label="Eğitim Seviyesi *"
                  onChange={e => handleChange('educationRequirement', e.target.value)}
                >
                  <MenuItem value="İlköğretim">İlköğretim</MenuItem>
                  <MenuItem value="Ortaöğretim">Ortaöğretim</MenuItem>
                  <MenuItem value="Lise">Lise</MenuItem>
                  <MenuItem value="Lisans">Lisans</MenuItem>
                  <MenuItem value="Yüksek Lisans">Yüksek Lisans</MenuItem>
                  <MenuItem value="Doktora">Doktora</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="İlan Bitiş Tarihi *"
                value={formData.publicationEndDate}
                onChange={e => handleChange('publicationEndDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={formErrors.publicationEndDate}
                helperText={formErrors.publicationEndDate ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="İletişim E-posta *"
                value={formData.contactEmail}
                onChange={e => handleChange('contactEmail', e.target.value)}
                required
                error={formErrors.contactEmail}
                helperText={formErrors.contactEmail ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İletişim Telefon *"
                value={formData.contactPhone}
                onChange={e => handleChange('contactPhone', e.target.value)}
                required
                error={formErrors.contactPhone}
                helperText={formErrors.contactPhone ? 'Bu alan zorunludur' : ''}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Button component={Link} href="/jobs/list" color="secondary">
                  İptal
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default CreateJobPage
