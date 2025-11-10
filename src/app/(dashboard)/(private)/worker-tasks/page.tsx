'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Grid, 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material'

// Services
import { taskService, Task } from '@/services/task.service'

const WorkerTasksPage = () => {
  // States
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await taskService.getMyTasks()
      if (response.error) {
        throw response.error
      }
      
      setTasks(response.data)
    } catch (error: any) {
      console.error('Görevler yüklenirken hata:', error)
      setError(error.message || 'Görevler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenStatusDialog = (task: Task) => {
    setSelectedTask(task)
    setNewStatus(task.status)
    setStatusNote('')
    setStatusDialogOpen(true)
  }

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false)
    setSelectedTask(null)
    setNewStatus('')
    setStatusNote('')
  }

  const handleUpdateStatus = async () => {
    if (!selectedTask) return

    try {
      setSubmitting(true)
      setError(null)

      await taskService.updateTaskStatus(selectedTask.documentId, newStatus, statusNote || undefined)
      
      setSuccess('Görev durumu başarıyla güncellendi')
      setStatusDialogOpen(false)
      await loadTasks()

      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error: any) {
      console.error('Görev durumu güncellenirken hata:', error)
      setError(error.message || 'Görev durumu güncellenirken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
      default: return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'in_progress': return 'info'
      case 'completed': return 'success'
      case 'not_completed': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor'
      case 'in_progress': return 'Devam Ediyor'
      case 'completed': return 'Tamamlandı'
      case 'not_completed': return 'Tamamlanamadı'
      default: return status
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !['completed', 'not_completed'].includes(selectedTask?.status || '')
  }

  // Görevleri duruma göre filtrele
  const getFilteredTasks = () => {
    switch (tabValue) {
      case 0: // Tüm Görevler
        return tasks
      case 1: // Bekleyen
        return tasks.filter(t => t.status === 'pending')
      case 2: // Devam Eden
        return tasks.filter(t => t.status === 'in_progress')
      case 3: // Tamamlanan
        return tasks.filter(t => t.status === 'completed')
      default:
        return tasks
    }
  }

  // İstatistikler
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate)).length
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  const filteredTasks = getFilteredTasks()

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box>
          <Typography variant='h4' sx={{ mb: 1 }}>
            Görevlerim
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Size atanan görevleri görüntüleyin ve durumlarını güncelleyin
          </Typography>
        </Box>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {success && (
        <Grid item xs={12}>
          <Alert severity='success' onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* İstatistikler */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: 'primary.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <i className='tabler-clipboard-list' style={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant='h4'>{stats.total}</Typography>
                  <Typography variant='body2' color='text.secondary'>Toplam Görev</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: 'warning.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <i className='tabler-clock' style={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant='h4'>{stats.pending}</Typography>
                  <Typography variant='body2' color='text.secondary'>Bekleyen</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: 'info.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <i className='tabler-progress' style={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant='h4'>{stats.inProgress}</Typography>
                  <Typography variant='body2' color='text.secondary'>Devam Eden</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <i className='tabler-check' style={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant='h4'>{stats.completed}</Typography>
                  <Typography variant='body2' color='text.secondary'>Tamamlanan</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: 'error.main', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <i className='tabler-alert-circle' style={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography variant='h4'>{stats.overdue}</Typography>
                  <Typography variant='body2' color='text.secondary'>Gecikmiş</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Görevler Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Görevlerim'
            action={
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label='Tümü' />
                <Tab label='Bekleyen' />
                <Tab label='Devam Eden' />
                <Tab label='Tamamlanan' />
              </Tabs>
            }
          />
          <CardContent>
            {filteredTasks.length > 0 ? (
              <TableContainer component={Paper} variant='outlined'>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Görev</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Son Tarih</TableCell>
                      <TableCell align='center'>Öncelik</TableCell>
                      <TableCell align='center'>Durum</TableCell>
                      <TableCell>Tekrarlayan</TableCell>
                      <TableCell align='center'>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.map((task) => {
                      const overdueTask = isOverdue(task.dueDate)
                      
                      return (
                        <TableRow 
                          key={task.documentId}
                          sx={{ 
                            backgroundColor: overdueTask ? 'error.lighter' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                {task.title}
                              </Typography>
                              {overdueTask && (
                                <Chip 
                                  label='GECİKMİŞ' 
                                  color='error' 
                                  size='small' 
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {task.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell align='center'>
                            <Chip 
                              label={getPriorityLabel(task.priority)}
                              color={getPriorityColor(task.priority) as any}
                              size='small'
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <Chip 
                              label={getStatusLabel(task.status)}
                              color={getStatusColor(task.status) as any}
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            {task.isRecurring ? (
                              <Chip 
                                icon={<i className='tabler-repeat' style={{ fontSize: 16 }} />}
                                label={task.recurringInterval}
                                size='small'
                                variant='outlined'
                              />
                            ) : (
                              <Typography variant='body2' color='text.secondary'>-</Typography>
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            <Button
                              variant='outlined'
                              size='small'
                              onClick={() => handleOpenStatusDialog(task)}
                            >
                              Durum Güncelle
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body1' color='text.secondary'>
                  {tabValue === 0 ? 'Henüz göreviniz bulunmuyor' : 'Bu durumda görev bulunmuyor'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Durum Güncelleme Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={handleCloseStatusDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Görev Durumunu Güncelle</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Görev
                </Typography>
                <Typography variant='h6'>{selectedTask.title}</Typography>
              </Box>

              {selectedTask.description && (
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Açıklama
                  </Typography>
                  <Typography variant='body2'>{selectedTask.description}</Typography>
                </Box>
              )}

              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={newStatus}
                  label='Durum'
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value='pending'>Bekliyor</MenuItem>
                  <MenuItem value='in_progress'>Devam Ediyor</MenuItem>
                  <MenuItem value='completed'>Tamamlandı</MenuItem>
                  <MenuItem value='not_completed'>Tamamlanamadı</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label='Not (İsteğe Bağlı)'
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder='Durum değişikliği hakkında not...'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={submitting}>
            İptal
          </Button>
          <Button 
            variant='contained' 
            onClick={handleUpdateStatus}
            disabled={submitting || !newStatus}
          >
            {submitting ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default WorkerTasksPage

