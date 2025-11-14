'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Box, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography, Chip } from '@mui/material'
import { purchasingService, type Purchasing, type CreatePurchasingDTO } from '@/services/purchasing.service'
import { institutionService, type Institution } from '@/services/institution.service'
import { axiosClient } from '@/libs/axios'

const PurchasingsPage = () => {
  const [purchasings, setPurchasings] = useState<Purchasing[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreatePurchasingDTO>({ 
    institution: '', 
    itemName: '', 
    category: '',
    supplier: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    purchaseDate: '',
    deliveryDate: '',
    status: 'pending',
    invoiceNumber: '',
    notes: ''
  })
  const [invoice, setInvoice] = useState<File | null>(null)

  useEffect(() => { loadInstitutions() }, [])
  useEffect(() => { loadPurchasings() }, [selectedInstitution])

  const loadInstitutions = async () => {
    try {
      const data = await institutionService.getAll()
      setInstitutions(data)
    } catch (err: any) {
      console.error('Load institutions error:', err)
    }
  }

  const loadPurchasings = async () => {
    try {
      setLoading(true)
      const data = await purchasingService.getAll(selectedInstitution)
      setPurchasings(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Satın alımlar yüklenirken bir hata oluştu')
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
      if (invoice) data.invoice = await uploadFile(invoice)
      
      if (editingId) {
        await purchasingService.update(editingId, data)
      } else {
        await purchasingService.create(data)
      }
      
      await loadPurchasings()
      setDialogOpen(false)
      setEditingId(null)
      setFormData({ 
        institution: '', 
        itemName: '', 
        category: '',
        supplier: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        purchaseDate: '',
        deliveryDate: '',
        status: 'pending',
        invoiceNumber: '',
        notes: ''
      })
      setInvoice(null)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Satın alım oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }
  
  const handleEdit = (purchasing: Purchasing) => {
    setEditingId(purchasing.documentId)
    setFormData({
      institution: purchasing.institution?.id?.toString() || '',
      itemName: purchasing.itemName,
      category: purchasing.category || '',
      supplier: purchasing.supplier || '',
      quantity: purchasing.quantity || 1,
      unitPrice: purchasing.unitPrice || 0,
      totalPrice: purchasing.totalPrice || 0,
      purchaseDate: purchasing.purchaseDate || '',
      deliveryDate: purchasing.deliveryDate || '',
      status: purchasing.status || 'pending',
      invoiceNumber: purchasing.invoiceNumber || '',
      notes: purchasing.notes || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu satın alımı silmek istediğinize emin misiniz?')) return
    try {
      await purchasingService.delete(id)
      await loadPurchasings()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Satın alım silinirken bir hata oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'ordered': return 'info'
      case 'delivered': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede'
      case 'ordered': return 'Sipariş Verildi'
      case 'delivered': return 'Teslim Edildi'
      case 'cancelled': return 'İptal Edildi'
      default: return status
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>

  return (
    <>
      <Card>
        <CardHeader title="Satın Alma" action={
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kurum Seç</InputLabel>
              <Select value={selectedInstitution} label="Kurum Seç" onChange={(e) => setSelectedInstitution(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {institutions.map((inst) => <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>+ Yeni Satın Alma</Button>
          </Box>
        } />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kurum</TableCell>
                  <TableCell>Ürün/Hizmet</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Tedarikçi</TableCell>
                  <TableCell align="right">Miktar</TableCell>
                  <TableCell align="right">Toplam Fiyat</TableCell>
                  <TableCell>Satın Alma Tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchasings.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center">Henüz satın alım eklenmemiş</TableCell></TableRow>
                ) : (
                  purchasings.map((purchasing) => (
                    <TableRow key={purchasing.id}>
                      <TableCell>{purchasing.institution?.name || '-'}</TableCell>
                      <TableCell>{purchasing.itemName}</TableCell>
                      <TableCell>{purchasing.category || '-'}</TableCell>
                      <TableCell>{purchasing.supplier || '-'}</TableCell>
                      <TableCell align="right">{purchasing.quantity}</TableCell>
                      <TableCell align="right">{purchasing.totalPrice ? `${purchasing.totalPrice.toLocaleString('tr-TR')} ₺` : '-'}</TableCell>
                      <TableCell>{purchasing.purchaseDate ? new Date(purchasing.purchaseDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                      <TableCell><Chip label={getStatusLabel(purchasing.status)} color={getStatusColor(purchasing.status)} size="small" /></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(purchasing)}><i className="tabler-edit" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(purchasing.documentId)}><i className="tabler-trash" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingId(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Satın Alma Düzenle' : 'Yeni Satın Alma Ekle'}</DialogTitle>
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
              <TextField fullWidth required label="Ürün/Hizmet Adı" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Kategori" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tedarikçi" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Miktar" type="number" value={formData.quantity} onChange={(e) => {
                const qty = parseInt(e.target.value) || 1
                const total = qty * (formData.unitPrice || 0)
                setFormData({ ...formData, quantity: qty, totalPrice: total })
              }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Birim Fiyat" type="number" value={formData.unitPrice} onChange={(e) => {
                const price = parseFloat(e.target.value) || 0
                const total = price * (formData.quantity || 1)
                setFormData({ ...formData, unitPrice: price, totalPrice: total })
              }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Toplam Fiyat" type="number" value={formData.totalPrice} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Satın Alma Tarihi" type="date" InputLabelProps={{ shrink: true }} value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teslim Tarihi" type="date" InputLabelProps={{ shrink: true }} value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select value={formData.status} label="Durum" onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                  <MenuItem value="pending">Beklemede</MenuItem>
                  <MenuItem value="ordered">Sipariş Verildi</MenuItem>
                  <MenuItem value="delivered">Teslim Edildi</MenuItem>
                  <MenuItem value="cancelled">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fatura Numarası" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Notlar" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Fatura Dosyası</Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input type="file" hidden onChange={(e) => setInvoice(e.target.files?.[0] || null)} />
              </Button>
              {invoice && <Typography variant="caption" sx={{ ml: 2 }}>{invoice.name}</Typography>}
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

export default PurchasingsPage


