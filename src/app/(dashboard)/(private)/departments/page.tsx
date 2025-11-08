'use client'

import { useState, useEffect } from 'react'
import { 
  Card, CardHeader, CardContent, Button, Grid, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Typography, Box, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material'
import { departmentService, type Department, type CreateDepartmentDTO } from '@/services/department.service'
import { authService } from '@/services/auth.service'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState<CreateDepartmentDTO>({
    key: '',
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await departmentService.getDepartments()
      setDepartments(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Departmanlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditMode(true)
      setSelectedDepartment(department)
      setFormData({
        key: department.key,
        name: department.name,
        description: department.description || ''
      })
    } else {
      setEditMode(false)
      setSelectedDepartment(null)
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
    setSelectedDepartment(null)
    setFormData({
      key: '',
      name: '',
      description: ''
    })
  }

  const handleSubmit = async () => {
    try {
      if (editMode && selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.documentId, formData)
      } else {
        await departmentService.createDepartment(formData)
      }

      handleCloseDialog()
      fetchDepartments()
    } catch (error) {
      console.error('Departman kaydedilirken hata:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      try {
        await departmentService.deleteDepartment(documentId)
        fetchDepartments()
      } catch (error) {
        console.error('Departman silinirken hata:', error)
      }
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Departmanlarım'
            action={
              <Button
                variant='contained'
                onClick={() => handleOpenDialog()}
                startIcon={<i className='tabler-plus' />}
              >
                Yeni Departman Ekle
              </Button>
            }
          />
          <CardContent>
            {loading ? (
              <Typography>Yükleniyor...</Typography>
            ) : departments.length === 0 ? (
              <Typography>Henüz departman bulunmamaktadır.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Departman Kodu</TableCell>
                      <TableCell>Departman Adı</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align='right'>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>{department.key}</TableCell>
                        <TableCell>{department.name}</TableCell>
                        <TableCell>{department.description || '-'}</TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleOpenDialog(department)}
                            title='Düzenle'
                          >
                            <i className='tabler-edit' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDelete(department.documentId)}
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
          {editMode ? 'Departman Düzenle' : 'Yeni Departman Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Departman Kodu'
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Departman Adı'
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

