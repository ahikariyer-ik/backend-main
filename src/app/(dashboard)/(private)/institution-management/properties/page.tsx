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
    usageType: '',
    address: '',
    uavtAddress: '',
    daskPolicyNumber: '',
    daskPolicyDate: '',
    acquisitionMethod: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [files, setFiles] = useState({
    photo: null as File | null,
    daskPolicy: null as File | null,
    titleDeed: null as File | null
  })
  const [daskQueryDialog, setDaskQueryDialog] = useState(false)
  const [selectedPropertyForDask, setSelectedPropertyForDask] = useState<Property | null>(null)

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
    setEditMode(false)
    setEditingId(null)
    setFormData({
      institution: '',
      usageType: '',
      address: '',
      uavtAddress: '',
      daskPolicyNumber: '',
      daskPolicyDate: '',
      acquisitionMethod: ''
    })
    setFiles({
      photo: null,
      daskPolicy: null,
      titleDeed: null
    })
    setDialogOpen(true)
  }

  const handleEdit = (property: Property) => {
    setEditMode(true)
    setEditingId(property.documentId)
    setFormData({
      institution: property.institution?.id.toString() || '',
      usageType: property.usageType || '',
      address: property.address || '',
      uavtAddress: property.uavtAddress || '',
      daskPolicyNumber: property.daskPolicyNumber || '',
      daskPolicyDate: property.daskPolicyDate || '',
      acquisitionMethod: property.acquisitionMethod || ''
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

      if (editMode && editingId) {
        await propertyService.update(editingId, data)
      } else {
        await propertyService.create(data)
      }
      
      await loadProperties()
      handleCloseDialog()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || (editMode ? 'Konut güncellenirken bir hata oluştu' : 'Konut oluşturulurken bir hata oluştu'))
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

  const handleDaskQuery = (property: Property) => {
    const taxNumber = property.institution?.taxNumber
    const daskPolicyNumber = property.daskPolicyNumber
    
    if (!taxNumber || !daskPolicyNumber) {
      alert('DASK sorgulaması için Vergi No ve DASK Poliçe No gereklidir.')
      return
    }
    
    setSelectedPropertyForDask(property)
    setDaskQueryDialog(true)
  }

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} panoya kopyalandı!`)
    }).catch(() => {
      alert('Kopyalama başarısız oldu.')
    })
  }

  const handleOpenDaskSite = () => {
    window.open('https://dask.gov.tr/tr/police-sorgulama', '_blank')
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
                      {property.usageType && (
                        <Box mt={2}>
                          <Chip label={getUsageTypeLabel(property.usageType)} color="primary" size="small" />
                        </Box>
                      )}
                      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(property)}>
                          <i className="tabler-edit" />
                        </IconButton>
                        <IconButton size="small" color="info" onClick={() => handleDaskQuery(property)}>
                          <i className="tabler-search" />
                        </IconButton>
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
        <DialogTitle>{editMode ? 'Konut Düzenle' : 'Yeni Konut Ekle'}</DialogTitle>
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
              <TextField
                fullWidth
                label="UAVT Adresi"
                value={formData.uavtAddress}
                onChange={(e) => setFormData({ ...formData, uavtAddress: e.target.value })}
                placeholder="UAVT adresini giriniz"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DASK Poliçe Numarası"
                value={formData.daskPolicyNumber}
                onChange={(e) => setFormData({ ...formData, daskPolicyNumber: e.target.value })}
                placeholder="DASK poliçe numarasını giriniz"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DASK Poliçe Tarihi"
                type="date"
                value={formData.daskPolicyDate}
                onChange={(e) => setFormData({ ...formData, daskPolicyDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Edinme Şekli"
                value={formData.acquisitionMethod}
                onChange={(e) => setFormData({ ...formData, acquisitionMethod: e.target.value })}
                placeholder="Edinme şeklini yazınız (örn: Satın Alma, Bağış, Miras)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kullanım Tipi"
                value={formData.usageType}
                onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
                placeholder="Kullanım tipini yazınız (örn: Kirada, Vakıf Kullanımında, İntifada)"
              />
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
            {saving ? (editMode ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editMode ? 'Güncelle' : 'Kaydet')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={daskQueryDialog} onClose={() => setDaskQueryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <i className="tabler-building" style={{ fontSize: 24 }} />
            <Typography variant="h6">DASK Poliçe Sorgulama</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPropertyForDask && (
            <Box sx={{ py: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  📋 Sorgulama Adımları:
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
                  <li>Aşağıdaki bilgileri kopyalayın</li>
                  <li>&quot;DASK Sitesini Aç&quot; butonuna tıklayın</li>
                  <li>Açılan sayfada &quot;Sorgulama Tipi&quot; olarak <strong>&quot;Vergi No / DASK Poliçe No&quot;</strong> seçin</li>
                  <li>Kopyaladığınız bilgileri yapıştırın ve sorgulayın</li>
                </Typography>
              </Alert>

              <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Kurum Adı
                </Typography>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {selectedPropertyForDask.institution?.name}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Vergi Numarası
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={selectedPropertyForDask.institution?.taxNumber || ''}
                        InputProps={{ readOnly: true }}
                        sx={{ bgcolor: 'background.paper' }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCopyToClipboard(selectedPropertyForDask.institution?.taxNumber || '', 'Vergi No')}
                        sx={{ minWidth: 100 }}
                      >
                        <i className="tabler-copy" style={{ marginRight: 4 }} /> Kopyala
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      DASK Poliçe Numarası
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={selectedPropertyForDask.daskPolicyNumber || ''}
                        InputProps={{ readOnly: true }}
                        sx={{ bgcolor: 'background.paper' }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCopyToClipboard(selectedPropertyForDask.daskPolicyNumber || '', 'DASK Poliçe No')}
                        sx={{ minWidth: 100 }}
                      >
                        <i className="tabler-copy" style={{ marginRight: 4 }} /> Kopyala
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {selectedPropertyForDask.address && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Konut Adresi
                  </Typography>
                  <Typography variant="body2">
                    {selectedPropertyForDask.address}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDaskQueryDialog(false)}>
            Kapat
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDaskSite}
            startIcon={<i className="tabler-external-link" />}
            size="large"
          >
            DASK Sitesini Aç
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PropertiesPage
