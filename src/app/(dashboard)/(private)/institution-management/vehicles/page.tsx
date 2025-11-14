'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Alert, CircularProgress, Box, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography, CardMedia, Chip } from '@mui/material'
import { vehicleService, type Vehicle } from '@/services/vehicle.service'
import { institutionService, type Institution } from '@/services/institution.service'
import { axiosClient } from '@/libs/axios'

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ institution: '', plateNumber: '', model: '', inspectionDate: '', insurancePolicyDate: '', usedBy: '' })
  const [photo, setPhoto] = useState<File | null>(null)

  useEffect(() => { loadInstitutions() }, [])
  useEffect(() => { loadVehicles() }, [selectedInstitution])

  const loadInstitutions = async () => {
    try {
      const data = await institutionService.getAll()
      setInstitutions(data)
    } catch (err: any) {
      console.error('Load institutions error:', err)
    }
  }

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleService.getAll(selectedInstitution)
      setVehicles(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Araçlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)
    const response = await axiosClient.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data[0].id
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      const data: any = { ...formData }
      if (photo) data.photo = await uploadFile(photo)
      
      if (editingId) {
        await vehicleService.update(editingId, data)
      } else {
        await vehicleService.create(data)
      }
      
      await loadVehicles()
      setDialogOpen(false)
      setEditingId(null)
      setFormData({ institution: '', plateNumber: '', model: '', inspectionDate: '', insurancePolicyDate: '', usedBy: '' })
      setPhoto(null)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Araç oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }
  
  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.documentId)
    setFormData({
      institution: vehicle.institution?.id?.toString() || '',
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      inspectionDate: vehicle.inspectionDate || '',
      insurancePolicyDate: vehicle.insurancePolicyDate || '',
      usedBy: vehicle.usedBy || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return
    try {
      await vehicleService.delete(id)
      await loadVehicles()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Araç silinirken bir hata oluştu')
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>

  return (
    <>
      <Card>
        <CardHeader title="Araçlarım" action={
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kurum Seç</InputLabel>
              <Select value={selectedInstitution} label="Kurum Seç" onChange={(e) => setSelectedInstitution(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {institutions.map((inst) => <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>+ Yeni Araç</Button>
          </Box>
        } />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Grid container spacing={3}>
            {vehicles.length === 0 ? (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <Typography color="text.secondary">Henüz araç eklenmemiş</Typography>
                </Box>
              </Grid>
            ) : (
              vehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {vehicle.photo?.url && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${vehicle.photo.url}`}
                        alt={vehicle.plateNumber}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" component="div">
                          {vehicle.plateNumber}
                        </Typography>
                        <Chip label={vehicle.model} color="primary" size="small" />
                      </Box>
                      <Box mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Kurum:</strong> {vehicle.institution?.name || '-'}
                        </Typography>
                      </Box>
                      {vehicle.usedBy && (
                        <Box mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Kullanan:</strong> {vehicle.usedBy}
                          </Typography>
                        </Box>
                      )}
                      {vehicle.inspectionDate && (
                        <Box mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Muayene:</strong> {new Date(vehicle.inspectionDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      )}
                      {vehicle.insurancePolicyDate && (
                        <Box mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Sigorta:</strong> {new Date(vehicle.insurancePolicyDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      )}
                      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(vehicle)}>
                          <i className="tabler-edit" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(vehicle.documentId)}>
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingId(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Araç Düzenle' : 'Yeni Araç Ekle'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Kurum</InputLabel>
                <Select value={formData.institution} label="Kurum" onChange={(e) => setFormData({ ...formData, institution: e.target.value })}>
                  {institutions.map((inst) => <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Plaka" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Muayene Tarihi" type="date" InputLabelProps={{ shrink: true }} value={formData.inspectionDate} onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sigorta Poliçe Tarihi" type="date" InputLabelProps={{ shrink: true }} value={formData.insurancePolicyDate} onChange={(e) => setFormData({ ...formData, insurancePolicyDate: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Kimin Tarafından Kullanıldığı" value={formData.usedBy} onChange={(e) => setFormData({ ...formData, usedBy: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Araç Fotoğrafı</Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </Button>
              {photo && <Typography variant="caption" sx={{ ml: 2 }}>{photo.name}</Typography>}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditingId(null); }} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default VehiclesPage
