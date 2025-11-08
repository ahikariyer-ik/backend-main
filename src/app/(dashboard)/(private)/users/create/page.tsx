// path: src/app/users/create/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'

import type { CreateUserDTO } from '@/services/users.service'
import type { StrapiRole } from '@/services/roles.service'

import { usersService } from '@/services/users.service'
import { rolesService } from '@/services/roles.service'

interface ExtendedCreateUserDTO extends CreateUserDTO {
  companyName?: string
  postingQuota?: number
}

const CreateUserPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<StrapiRole[]>([])

  const [formData, setFormData] = useState<ExtendedCreateUserDTO>({
    username: '',
    email: '',
    password: '',
    role: '',
    confirmed: true,
    blocked: false,
    ahiIkMember: false, // Yeni kullanıcılar AHİ-İK'ya tanımlı değil
    companyName: undefined,
    postingQuota: 0  // undefined yerine 0

  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExtendedCreateUserDTO, boolean>>>({})

  const router = useRouter()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const response = await rolesService.getRoles()
      if (response.error) throw response.error
      const filteredRoles = response.data.filter((role: StrapiRole) => role.name === 'Authenticated')
      setRoles(filteredRoles)
      if (filteredRoles.length > 0) {
        setFormData(prev => ({
          ...prev,
          role: filteredRoles[0].id
        }))
      }
    } catch (error: any) {
      console.error('Roller yüklenirken hata:', error)
      setError(error.message || 'Roller yüklenirken bir hata oluştu')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    const errors: Partial<Record<keyof ExtendedCreateUserDTO, boolean>> = {}
    if (!formData.username) errors.username = true
    if (!formData.email) errors.email = true
    if (!formData.password) errors.password = true
    if (!formData.role) errors.role = true

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        data: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmed: formData.confirmed,
          blocked: formData.blocked,
          ahiIkMember: false, // Yeni kullanıcılar AHİ-İK'ya tanımlı değil
          role: formData.role,
          companyName: formData.companyName || formData.username,
          postingRights: 0  // Her zaman 0
        }
      }

      await usersService.createUser(payload)
      router.push('/users/list')
    } catch (error: any) {
      console.error('Kullanıcı oluşturma hatası:', error)
      setError(error.response?.data?.error?.message || 'Kullanıcı oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof ExtendedCreateUserDTO, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Yeni Kullanıcı Oluştur'
          action={
            <Button component={Link} href='/users/list' color='secondary' variant='outlined'>
              Geri Dön
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Kullanıcı Adı'
                value={formData.username}
                onChange={e => handleChange('username', e.target.value)}
                required
                error={formErrors.username}
              />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='password'
                label='Şifre'
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                required
                error={formErrors.password}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={formErrors.role}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label='Rol'
                  onChange={e => handleChange('role', e.target.value)}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name === 'Authenticated' ? 'Normal Kullanıcı' : role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <CustomTextField
                  fullWidth
                  label='Şirket Adı'
                  value={formData.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='number'
                label='İlan Kotası'
                value={0}
                disabled
                helperText='Yeni kullanıcılar 0 kota ile oluşturulur. Kullanıcı düzenleme sayfasından kotayı artırabilirsiniz.'
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={formData.confirmed} onChange={e => handleChange('confirmed', e.target.checked)} />
                }
                label='E-posta Onaylı'
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={formData.blocked} onChange={e => handleChange('blocked', e.target.checked)} />
                }
                label='AHİ-İK'
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity='error'>{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                <Button component={Link} href='/users/list' color='secondary'>
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

export default CreateUserPage
