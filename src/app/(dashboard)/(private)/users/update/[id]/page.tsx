'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Card, CardHeader, CardContent, Button, Grid, Box, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch,
  Alert, Typography, Divider, Avatar, CircularProgress
} from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import Link from '@components/Link'
import ImageUpload from '@/components/upload/ImageUpload'

import type { StrapiUser, UpdateUserDTO } from '@/services/users.service'
import type { StrapiRole } from '@/services/roles.service'
import type { StrapiSector } from '@/services/sectors.service'

import { usersService } from '@/services/users.service'
import { rolesService } from '@/services/roles.service'
import { sectorsService } from '@/services/sectors.service'

interface ExtendedUpdateUserDTO extends Omit<UpdateUserDTO, 'documentId'> {
  id: string;
  ahiIkMember?: boolean; // AHİ-İK sistemine kayıtlı mı?
  companyProfile?: {
    companyName?: string;
    logo?: {
      id: number;
      documentId: string;
      url: string;
    };
    sector?: number;
    ahiIkEnabled?: boolean;
    ahiIkStartDate?: string;
    ahiIkEndDate?: string;
  };
  postingRights?: {
    postingQuota?: number;
  };
}

const UpdateUserPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<StrapiUser | null>(null)
  const [roles, setRoles] = useState<StrapiRole[]>([])
  const [sectors, setSectors] = useState<StrapiSector[]>([])
  const [imageBaseUrl, setImageBaseUrl] = useState<string>('')
  const [formData, setFormData] = useState<ExtendedUpdateUserDTO>({
    id: resolvedParams.id,
    username: '',
    email: '',
    role: '',
    confirmed: true,
    blocked: false,
    ahiIkMember: false,
    companyProfile: {
      companyName: '',
      logo: undefined,
      sector: undefined,
      ahiIkEnabled: false,
      ahiIkStartDate: '',
      ahiIkEndDate: ''
    },
    postingRights: {
      postingQuota: 0
    }
  })

  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [userResponse, rolesResponse, sectorsResponse] = await Promise.all([
        usersService.getUser(resolvedParams.id),
        rolesService.getRoles(),
        sectorsService.getSectors()
      ])

      if (userResponse.error) throw userResponse.error
      if (rolesResponse.error) throw rolesResponse.error
      if (sectorsResponse.error) throw sectorsResponse.error

      const userData = userResponse.data

      const authenticatedRole = rolesResponse.data.find((role: StrapiRole) => role.name === 'Authenticated')

      setUser(userData)
      setRoles(authenticatedRole ? [authenticatedRole] : [])
      setSectors(sectorsResponse.data)

      setFormData({
        id: userData.documentId.toString(),
        username: userData.username,
        email: userData.email,
        role: userData.role?.id || '',
        confirmed: userData.confirmed,
        blocked: userData.blocked,
        ahiIkMember: userData.ahiIkMember || false,
        companyProfile: userData.companyProfile ? {
          companyName: userData.companyProfile.companyName,
          logo: userData.companyProfile.logo ?? undefined,
          sector: userData.companyProfile.sector?.id,
          ahiIkEnabled: userData.companyProfile.ahiIkEnabled || false,
          ahiIkStartDate: userData.companyProfile.ahiIkStartDate || '',
          ahiIkEndDate: userData.companyProfile.ahiIkEndDate || ''
        } : {
          companyName: '',
          logo: undefined,
          sector: undefined,
          ahiIkEnabled: false,
          ahiIkStartDate: '',
          ahiIkEndDate: ''
        },
        postingRights: userData.postingRights ? {
          postingQuota: userData.postingRights.postingQuota
        } : {
          postingQuota: 0
        }
      })
    } catch (error: any) {
      console.error('Veri yüklenirken hata:', error)
      setError(error.message || 'Veriler yüklenirken bir hata oluştu')
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        const parentValue = prev[parent as keyof ExtendedUpdateUserDTO] as any
        return {
          ...prev,
          [parent]: {
            ...(parentValue || {}),
            [child]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.username || !formData.email || !formData.role) {
      setError('Lütfen zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      // companyProfile'ı her zaman gönder (API'de varsa güncellenecek)
      // postingRights güncellenmesi için updatedCompanyProfile gerekli
      const payload: UpdateUserDTO = {
        documentId: formData.id,
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: formData.role,
        confirmed: formData.confirmed,
        blocked: formData.blocked,
        ahiIkMember: formData.ahiIkMember || false,
        companyProfile: {
          companyName: formData.companyProfile?.companyName || null,
          logo: formData.companyProfile?.logo && typeof formData.companyProfile.logo === 'object' && formData.companyProfile.logo?.id 
            ? formData.companyProfile.logo.id 
            : formData.companyProfile?.logo && (typeof formData.companyProfile.logo === 'number' || typeof formData.companyProfile.logo === 'string')
              ? (typeof formData.companyProfile.logo === 'number' ? formData.companyProfile.logo : Number(formData.companyProfile.logo))
              : null,
          sector: formData.companyProfile?.sector || null,
          ahiIkEnabled: formData.companyProfile?.ahiIkEnabled || false,
          ahiIkStartDate: formData.companyProfile?.ahiIkStartDate || null,
          ahiIkEndDate: formData.companyProfile?.ahiIkEndDate || null
        },
        postingRights: {
          postingQuota: formData.postingRights?.postingQuota ?? 0
        }
      }

      await usersService.updateUser(payload)
      router.push('/users/list')
    } catch (error: any) {
      console.error('Kullanıcı güncelleme hatası:', error)
      setError(error.message || 'Kullanıcı güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!user || roles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Kullanıcı Düzenle'
          action={<Button component={Link} href='/users/list' color='secondary' variant='outlined'>Geri Dön</Button>}
        />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='h6'>Temel Bilgiler</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Kullanıcı Adı'
                    value={formData.username}
                    onChange={e => handleChange('username', e.target.value)}
                    required
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    type='password'
                    label='Şifre'
                    value={formData.password || ''}
                    onChange={e => handleChange('password', e.target.value)}
                    helperText='Boş bırakırsanız şifre değişmeyecektir'
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={formData.role}
                      label='Rol'
                      onChange={e => handleChange('role', e.target.value)}
                    >
                      {roles.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          Normal Kullanıcı
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={<Switch checked={formData.confirmed} onChange={e => handleChange('confirmed', e.target.checked)} />}
                    label='E-posta Onaylı'
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={<Switch checked={formData.blocked} onChange={e => handleChange('blocked', e.target.checked)} />}
                    label='Engelli (Giriş Yapamaz)'
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={formData.companyProfile?.ahiIkEnabled || false} onChange={e => handleChange('companyProfile.ahiIkEnabled', e.target.checked)} />}
                    label='AHİ-İK Sistemi Aktif'
                  />
                </Grid>

                {formData.companyProfile?.ahiIkEnabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        fullWidth
                        type='date'
                        label='AHİ-İK Başlangıç Tarihi'
                        value={formData.companyProfile?.ahiIkStartDate || ''}
                        onChange={e => handleChange('companyProfile.ahiIkStartDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomTextField
                        fullWidth
                        type='date'
                        label='AHİ-İK Bitiş Tarihi'
                        value={formData.companyProfile?.ahiIkEndDate || ''}
                        onChange={e => handleChange('companyProfile.ahiIkEndDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>

            {/* Şirket Bilgileri */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant='h6'>Şirket Bilgileri</Typography>
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Şirket Adı'
                value={formData.companyProfile?.companyName || ''}
                onChange={e => handleChange('companyProfile.companyName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle2'>Şirket Logosu</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {formData.companyProfile?.logo && (
                  <Avatar src={process.env.NEXT_PUBLIC_IMAGE_BASE_URL + formData.companyProfile.logo.url} sx={{ width: 100, height: 100 }} />
                )}
                <ImageUpload
                  value={formData.companyProfile?.logo?.url || ''}
                  onChange={value => {
                    // ImageUpload id gönderiyor, formData'da logo objesi tutuyoruz
                    // Yeni logo yüklendiğinde sadece id'yi güncelle, url yoksa undefined olacak
                    if (value) {
                      handleChange('companyProfile.logo', { id: Number(value) })
                    } else {
                      handleChange('companyProfile.logo', null)
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sektör</InputLabel>
                <Select
                  value={formData.companyProfile?.sector || ''}
                  label='Sektör'
                  onChange={e => handleChange('companyProfile.sector', e.target.value)}
                >
                  {sectors.map(sector => (
                    <MenuItem key={sector.documentId} value={sector.documentId}>
                      {sector.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default UpdateUserPage
