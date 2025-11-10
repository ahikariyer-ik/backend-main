'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Box, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography } from '@mui/material'
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
      await vehicleService.create(data)
      await loadVehicles()
      setDialogOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Araç oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kurum</TableCell>
                  <TableCell>Plaka</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Muayene Tarihi</TableCell>
                  <TableCell>Sigorta Tarihi</TableCell>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">Henüz araç eklenmemiş</TableCell></TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.institution?.name || '-'}</TableCell>
                      <TableCell>{vehicle.plateNumber}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.inspectionDate ? new Date(vehicle.inspectionDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                      <TableCell>{vehicle.insurancePolicyDate ? new Date(vehicle.insurancePolicyDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                      <TableCell>{vehicle.usedBy || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDelete(vehicle.documentId)}><i className="tabler-trash" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Araç Ekle</DialogTitle>
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
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default VehiclesPage
