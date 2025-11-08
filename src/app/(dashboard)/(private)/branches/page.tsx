'use client'

import { useState, useEffect } from 'react'
import { 
  Card, CardHeader, CardContent, Button, Grid, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Typography, Box, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material'
import { branchService, type Branch, type CreateBranchDTO } from '@/services/branch.service'
import { authService } from '@/services/auth.service'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<CreateBranchDTO>({
    key: '',
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await branchService.getBranches()
      setBranches(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Şubeler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditMode(true)
      setSelectedBranch(branch)
      setFormData({
        key: branch.key,
        name: branch.name,
        description: branch.description || ''
      })
    } else {
      setEditMode(false)
      setSelectedBranch(null)
      setFormData({
        key: '',
        name: '',
        description: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setSelectedBranch(null)
    setFormData({
      key: '',
      name: '',
      description: ''
    })
  }

  const handleSubmit = async () => {
    try {
      if (editMode && selectedBranch) {
        await branchService.updateBranch(selectedBranch.documentId, formData)
      } else {
        await branchService.createBranch(formData)
      }

      handleCloseDialog()
      fetchBranches()
    } catch (error) {
      console.error('Şube kaydedilirken hata:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) {
      try {
        await branchService.deleteBranch(documentId)
        fetchBranches()
      } catch (error) {
        console.error('Şube silinirken hata:', error)
      }
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Şubelerim'
            action={
              <Button
                variant='contained'
                onClick={() => handleOpenDialog()}
                startIcon={<i className='tabler-plus' />}
              >
                Yeni Şube Ekle
              </Button>
            }
          />
          <CardContent>
            {loading ? (
              <Typography>Yükleniyor...</Typography>
            ) : branches.length === 0 ? (
              <Typography>Henüz şube bulunmamaktadır.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Şube Kodu</TableCell>
                      <TableCell>Şube Adı</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align='right'>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>{branch.key}</TableCell>
                        <TableCell>{branch.name}</TableCell>
                        <TableCell>{branch.description || '-'}</TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleOpenDialog(branch)}
                            title='Düzenle'
                          >
                            <i className='tabler-edit' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(branch.documentId)}
                            title='Sil'
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          {editMode ? 'Şube Düzenle' : 'Yeni Şube Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Şube Kodu'
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Şube Adı'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Açıklama'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant='contained'>
            {editMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

