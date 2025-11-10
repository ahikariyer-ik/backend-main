'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography, Tooltip } from '@mui/material'
import { institutionService, type Institution } from '@/services/institution.service'
import { axiosClient } from '@/libs/axios'

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '', foundationDate: '', taxNumber: '', sgkRegistrationNumber: '', itoRegistrationNumber: '' })
  const [files, setFiles] = useState({ activityReport: null as File | null, foundationDeed: null as File | null, internalAuditReports: [] as File[], signatureCircular: null as File | null })
  const [viewDocumentDialog, setViewDocumentDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ file: any; label: string; institutionId: string; fieldName: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadInstitutions() }, [])

  const loadInstitutions = async () => {
    try {
      setLoading(true)
      setInstitutions(await institutionService.getAll())
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Kurumlar yüklenirken bir hata oluştu')
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
      if (files.activityReport) data.activityReport = await uploadFile(files.activityReport)
      if (files.foundationDeed) data.foundationDeed = await uploadFile(files.foundationDeed)
      if (files.signatureCircular) data.signatureCircular = await uploadFile(files.signatureCircular)
      if (files.internalAuditReports.length > 0) {
        const uploadPromises = files.internalAuditReports.map(file => uploadFile(file))
        data.internalAuditReports = await Promise.all(uploadPromises)
      }
      await institutionService.create(data)
      await loadInstitutions()
      setDialogOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Kurum oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleViewDocument = (doc: any, label: string, institutionId: string, fieldName: string) => {
    setSelectedDocument({ file: doc, label, institutionId, fieldName })
    setViewDocumentDialog(true)
  }

  const handleDownloadDocument = () => {
    if (selectedDocument?.file) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`
      const link = document.createElement('a')
      link.href = url
      link.download = selectedDocument.file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleViewDocumentInNewTab = () => {
    if (selectedDocument?.file) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`, '_blank')
    }
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return
    if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return
    try {
      setDeleting(true)
      const updateData: any = {}
      updateData[selectedDocument.fieldName] = null
      await axiosClient.put(`/api/institutions/${selectedDocument.institutionId}`, { data: updateData })
      setViewDocumentDialog(false)
      await loadInstitutions()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Belge silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kurumu silmek istediğinize emin misiniz?')) return
    try {
      await institutionService.delete(id)
      await loadInstitutions()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Kurum silinirken bir hata oluştu')
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>

  return (
    <>
      <Card>
        <CardHeader title="Kurumlarım" action={<Button variant="contained" color="primary" onClick={() => { setFormData({ name: '', address: '', foundationDate: '', taxNumber: '', sgkRegistrationNumber: '', itoRegistrationNumber: '' }); setFiles({ activityReport: null, foundationDeed: null, internalAuditReports: [], signatureCircular: null }); setDialogOpen(true) }}>+ Yeni Kurum</Button>} />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kurum Adı</TableCell>
                  <TableCell>Belgeler</TableCell>
                  <TableCell>Kuruluş Tarihi</TableCell>
                  <TableCell>Vergi No</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {institutions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Henüz kurum eklenmemiş</TableCell></TableRow>
                ) : (
                  institutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.name}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {inst.activityReport && (
                            <Tooltip title="Faaliyet Raporu">
                              <IconButton size="small" onClick={() => handleViewDocument(inst.activityReport, 'Faaliyet Raporu', inst.documentId, 'activityReport')}>
                                <i className="tabler-file-text" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {inst.foundationDeed && (
                            <Tooltip title="Vakıf Senedi">
                              <IconButton size="small" onClick={() => handleViewDocument(inst.foundationDeed, 'Vakıf Senedi', inst.documentId, 'foundationDeed')}>
                                <i className="tabler-file-text" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {inst.signatureCircular && (
                            <Tooltip title="İmza Sirküleri">
                              <IconButton size="small" onClick={() => handleViewDocument(inst.signatureCircular, 'İmza Sirküleri', inst.documentId, 'signatureCircular')}>
                                <i className="tabler-file-text" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(inst.foundationDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{inst.taxNumber}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDelete(inst.documentId)}><i className="tabler-trash" /></IconButton>
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
        <DialogTitle>Yeni Kurum Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Kurumun Adı" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Kurumun Adresi" required multiline rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Kuruluş Tarihi" type="date" required InputLabelProps={{ shrink: true }} value={formData.foundationDate} onChange={(e) => setFormData({ ...formData, foundationDate: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Vergi Numarası" required value={formData.taxNumber} onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="SGK Sicil Numarası" value={formData.sgkRegistrationNumber} onChange={(e) => setFormData({ ...formData, sgkRegistrationNumber: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="İTO Sicil Numarası" value={formData.itoRegistrationNumber} onChange={(e) => setFormData({ ...formData, itoRegistrationNumber: e.target.value })} /></Grid>
            <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>Faaliyet Raporu (PDF)</Typography><Button variant="outlined" component="label">Dosya Seç<input type="file" hidden accept=".pdf" onChange={(e) => setFiles({ ...files, activityReport: e.target.files?.[0] || null })} /></Button>{files.activityReport && <Typography variant="caption" sx={{ ml: 2 }}>{files.activityReport.name}</Typography>}</Grid>
            <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>Vakıf Senedi (PDF)</Typography><Button variant="outlined" component="label">Dosya Seç<input type="file" hidden accept=".pdf" onChange={(e) => setFiles({ ...files, foundationDeed: e.target.files?.[0] || null })} /></Button>{files.foundationDeed && <Typography variant="caption" sx={{ ml: 2 }}>{files.foundationDeed.name}</Typography>}</Grid>
            <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>İmza Sirküleri (PDF)</Typography><Button variant="outlined" component="label">Dosya Seç<input type="file" hidden accept=".pdf" onChange={(e) => setFiles({ ...files, signatureCircular: e.target.files?.[0] || null })} /></Button>{files.signatureCircular && <Typography variant="caption" sx={{ ml: 2 }}>{files.signatureCircular.name}</Typography>}</Grid>
            <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>İç Denetim Raporları (PDF - Çoklu)</Typography><Button variant="outlined" component="label">Dosyalar Seç<input type="file" hidden multiple accept=".pdf" onChange={(e) => setFiles({ ...files, internalAuditReports: Array.from(e.target.files || []) })} /></Button>{files.internalAuditReports.length > 0 && <Typography variant="caption" sx={{ ml: 2 }}>{files.internalAuditReports.length} dosya seçildi</Typography>}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDocumentDialog} onClose={() => setViewDocumentDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>{selectedDocument?.label}</DialogTitle>
        <DialogContent>
          {selectedDocument?.file && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
              <Alert severity='info'><Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>📄 {selectedDocument.file.name}</Typography><Typography variant='caption' color='textSecondary'>Boyut: {(selectedDocument.file.size / 1024).toFixed(2)} KB</Typography></Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 6, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'error.main', borderRadius: 3, boxShadow: 3 }}><i className='tabler-file-type-pdf' style={{ fontSize: 80, color: 'white' }} /></Box>
                <Box sx={{ textAlign: 'center' }}><Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>{selectedDocument.label}</Typography><Typography variant='body2' color='textSecondary'>PDF belgesini görüntülemek için aşağıdaki butonları kullanın</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant='contained' color='primary' size='large' startIcon={<i className='tabler-eye' />} onClick={handleViewDocumentInNewTab} sx={{ minWidth: 200 }}>Görüntüle</Button>
                <Button variant='outlined' color='primary' size='large' startIcon={<i className='tabler-download' />} onClick={handleDownloadDocument} sx={{ minWidth: 200 }}>İndir</Button>
                <Button variant='outlined' color='error' size='large' startIcon={deleting ? <CircularProgress size={20} /> : <i className='tabler-trash' />} onClick={handleDeleteDocument} disabled={deleting} sx={{ minWidth: 200 }}>{deleting ? 'Siliniyor...' : 'Sil'}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewDocumentDialog(false)} disabled={deleting}>Kapat</Button></DialogActions>
      </Dialog>
    </>
  )
}

export default InstitutionsPage
