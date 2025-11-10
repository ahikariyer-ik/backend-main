'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

// Services
import { propertyService, type Property } from '@/services/property.service'
import { institutionService, type Institution } from '@/services/institution.service'
import { axiosClient } from '@/libs/axios'

const PropertiesPage = () => {
  // States
  const [properties, setProperties] = useState<Property[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    institution: '',
    usageType: 'rented' as 'rented' | 'foundation_use' | 'usufruct',
    address: ''
  })
  const [files, setFiles] = useState({
    photo: null as File | null,
    daskPolicy: null as File | null,
    titleDeed: null as File | null
  })

  // Effects
  useEffect(() => {
    loadInstitutions()
  }, [])

  useEffect(() => {
    loadProperties()
  }, [selectedInstitution])

  // Handlers
  const loadInstitutions = async () => {
    try {
      const data = await institutionService.getAll()
      setInstitutions(data)
    } catch (err: any) {
      console.error('Load institutions error:', err)
    }
  }

  const loadProperties = async () => {
    try {
      setLoading(true)
      const data = await propertyService.getAll(selectedInstitution)
      setProperties(data)
      setError(null)
    } catch (err: any) {
      console.error('Load properties error:', err)
      setError(err.response?.data?.error?.message || 'Konutlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      institution: '',
      usageType: 'rented',
      address: ''
    })
    setFiles({
      photo: null,
      daskPolicy: null,
      titleDeed: null
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)

    const response = await axiosClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data[0].id
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)

      const data: any = { ...formData }

      if (files.photo) {
        data.photo = await uploadFile(files.photo)
      }
      if (files.daskPolicy) {
        data.daskPolicy = await uploadFile(files.daskPolicy)
      }
      if (files.titleDeed) {
        data.titleDeed = await uploadFile(files.titleDeed)
      }

      await propertyService.create(data)
      await loadProperties()
      handleCloseDialog()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Konut oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu konutu silmek istediğinize emin misiniz?')) return

    try {
      await propertyService.delete(id)
      await loadProperties()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Konut silinirken bir hata oluştu')
    }
  }

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rented: 'Kirada',
      foundation_use: 'Vakıf Kullanımında',
      usufruct: 'İntifada'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Konutlarım"
          action={
            <Box display="flex" gap={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Kurum Seç</InputLabel>
                <Select
                  value={selectedInstitution}
                  label="Kurum Seç"
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {institutions.map((inst) => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                + Yeni Konut
              </Button>
            </Box>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {properties.length === 0 ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={5}>
                  <Typography variant="body1" color="text.secondary">
                    Henüz konut eklenmemiş
                  </Typography>
                </Box>
              </Grid>
            ) : (
              properties.map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <Card>
                    {property.photo && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`${process.env.NEXT_PUBLIC_API_URL}${property.photo.url}`}
                        alt={property.address || 'Konut'}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {property.institution?.name || 'Kurum Belirtilmemiş'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {property.address || 'Adres belirtilmemiş'}
                      </Typography>
                      <Box mt={2}>
                        <Chip label={getUsageTypeLabel(property.usageType)} color="primary" size="small" />
                      </Box>
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <IconButton size="small" color="error" onClick={() => handleDelete(property.documentId)}>
                          <i className="tabler-trash" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Konut Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Kurum</InputLabel>
                <Select
                  value={formData.institution}
                  label="Kurum"
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                >
                  {institutions.map((inst) => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Kullanım Tipi</InputLabel>
                <Select
                  value={formData.usageType}
                  label="Kullanım Tipi"
                  onChange={(e) => setFormData({ ...formData, usageType: e.target.value as any })}
                >
                  <MenuItem value="rented">Kirada</MenuItem>
                  <MenuItem value="foundation_use">Vakıf Kullanımında</MenuItem>
                  <MenuItem value="usufruct">İntifada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Gayrimenkul Fotoğrafı
              </Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, photo: e.target.files?.[0] || null })}
                />
              </Button>
              {files.photo && <Typography variant="caption" sx={{ ml: 2 }}>{files.photo.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                DASK Poliçesi (PDF)
              </Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => setFiles({ ...files, daskPolicy: e.target.files?.[0] || null })}
                />
              </Button>
              {files.daskPolicy && <Typography variant="caption" sx={{ ml: 2 }}>{files.daskPolicy.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tapu (PDF)
              </Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => setFiles({ ...files, titleDeed: e.target.files?.[0] || null })}
                />
              </Button>
              {files.titleDeed && <Typography variant="caption" sx={{ ml: 2 }}>{files.titleDeed.name}</Typography>}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            İptal
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PropertiesPage
