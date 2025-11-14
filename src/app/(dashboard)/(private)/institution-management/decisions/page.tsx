'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress, Box, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography, Tooltip } from '@mui/material'
import { decisionService, type Decision } from '@/services/decision.service'
import { institutionService, type Institution } from '@/services/institution.service'
import { axiosClient } from '@/libs/axios'

const DecisionsPage = () => {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ institution: '', title: '', decisionDate: '', description: '' })
  const [document, setDocument] = useState<File | null>(null)
  const [viewDocumentDialog, setViewDocumentDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{ file: any; label: string; decisionId: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadInstitutions() }, [])
  useEffect(() => { loadDecisions() }, [selectedInstitution])

  const loadInstitutions = async () => {
    try {
      setInstitutions(await institutionService.getAll())
    } catch (err) { console.error(err) }
  }

  const loadDecisions = async () => {
    try {
      setLoading(true)
      setDecisions(await decisionService.getAll(selectedInstitution))
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Kararlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File) => {
    const fd = new FormData()
    fd.append('files', file)
    const res = await axiosClient.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data[0].id
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      const data: any = { ...formData }
      if (document) data.document = await uploadFile(document)
      
      if (editingId) {
        await decisionService.update(editingId, data)
      } else {
        await decisionService.create(data)
      }
      
      await loadDecisions()
      setDialogOpen(false)
      setEditingId(null)
      setFormData({ institution: '', title: '', decisionDate: '', description: '' })
      setDocument(null)
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Karar oluşturulurken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }
  
  const handleEdit = (decision: Decision) => {
    setEditingId(decision.documentId)
    setFormData({
      institution: decision.institution?.id?.toString() || '',
      title: decision.title,
      decisionDate: decision.decisionDate || '',
      description: decision.description || ''
    })
    setDialogOpen(true)
  }

  const handleViewDocument = (doc: any, label: string, decisionId: string) => {
    setSelectedDocument({ file: doc, label, decisionId })
    setViewDocumentDialog(true)
  }

  const handleDownloadDocument = () => {
    if (selectedDocument?.file) {
      const link = document.createElement('a')
      link.href = `${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`
      link.download = selectedDocument.file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleViewDocumentInNewTab = () => {
    if (selectedDocument?.file) window.open(`${process.env.NEXT_PUBLIC_API_URL}${selectedDocument.file.url}`, '_blank')
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument || !confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return
    try {
      setDeleting(true)
      await axiosClient.put(`/api/decisions/${selectedDocument.decisionId}`, { data: { document: null } })
      setViewDocumentDialog(false)
      await loadDecisions()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Belge silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kararı silmek istediğinize emin misiniz?')) return
    try {
      await decisionService.delete(id)
      await loadDecisions()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Karar silinirken bir hata oluştu')
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>

  return (
    <>
      <Card>
        <CardHeader title="Kararlar" action={
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Kurum Seç</InputLabel>
              <Select value={selectedInstitution} label="Kurum Seç" onChange={(e) => setSelectedInstitution(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {institutions.map((inst) => <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>+ Yeni Karar</Button>
          </Box>
        } />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kurum</TableCell>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Karar Tarihi</TableCell>
                  <TableCell>Belge</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decisions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Henüz karar eklenmemiş</TableCell></TableRow>
                ) : (
                  decisions.map((dec) => (
                    <TableRow key={dec.id}>
                      <TableCell>{dec.institution?.name || '-'}</TableCell>
                      <TableCell>{dec.title}</TableCell>
                      <TableCell>{dec.decisionDate ? new Date(dec.decisionDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                      <TableCell>
                        {dec.document ? (
                          <Tooltip title="Belgeyi Görüntüle">
                            <IconButton size="small" onClick={() => handleViewDocument(dec.document, dec.title, dec.documentId)}><i className="tabler-file-text" /></IconButton>
                          </Tooltip>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(dec)}><i className="tabler-edit" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(dec.documentId)}><i className="tabler-trash" /></IconButton>
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
        <DialogTitle>{editingId ? 'Karar Düzenle' : 'Yeni Karar Ekle'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}><FormControl fullWidth required><InputLabel>Kurum</InputLabel><Select value={formData.institution} label="Kurum" onChange={(e) => setFormData({ ...formData, institution: e.target.value })}>{institutions.map((inst) => <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><TextField fullWidth required label="Kararın İsmi" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Karar Tarihi" type="date" InputLabelProps={{ shrink: true }} value={formData.decisionDate} onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Açıklama" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></Grid>
            <Grid item xs={12}><Typography variant="subtitle2" gutterBottom>Karar PDF Dosyası</Typography><Button variant="outlined" component="label">Dosya Seç<input type="file" hidden accept=".pdf" onChange={(e) => setDocument(e.target.files?.[0] || null)} /></Button>{document && <Typography variant="caption" sx={{ ml: 2 }}>{document.name}</Typography>}</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditingId(null); }} disabled={saving}>İptal</Button>
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

export default DecisionsPage
