'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardHeader, CardContent, Grid, Box, Typography, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material'

// Services
import { taskService, Task, CreateTaskDTO } from '@/services/task.service'
import { axiosClient } from '@/libs/axios'

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    isRecurring: false,
    priority: 'medium'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksResponse, workersResponse] = await Promise.all([
        taskService.getTasks(),
        axiosClient.get('/api/workers', {
          params: {
            'filters[isActive]': true,
            populate: ['department'],
            'pagination[pageSize]': 100
          }
        })
      ])

      if (tasksResponse.error) throw tasksResponse.error
      
      setTasks(tasksResponse.data)
      setWorkers(workersResponse.data.data || [])
    } catch (error: any) {
      console.error('Veriler yüklenirken hata:', error)
      setError(error.message || 'Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      await taskService.createTask(formData)
      await loadData()
      setCreateDialogOpen(false)
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        isRecurring: false,
        priority: 'medium'
      })
    } catch (error: any) {
      console.error('Görev oluşturulurken hata:', error)
      setError(error.message || 'Görev oluşturulurken bir hata oluştu')
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
      case 'in_progress': return 'Yapılıyor'
      case 'completed': return 'Tamamlandı'
      case 'not_completed': return 'Yapılmadı'
      default: return status
    }
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    notCompleted: tasks.filter(t => t.status === 'not_completed').length
  }

  if (loading) {
    return <Typography>Yükleniyor...</Typography>
  }

  return (
    <Box>
      {/* İstatistikler */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Toplam Görev</Typography>
              <Typography variant='h4'>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'grey.500' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Bekliyor</Typography>
              <Typography variant='h4'>{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Yapılıyor</Typography>
              <Typography variant='h4' color='info.main'>{stats.inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Tamamlandı</Typography>
              <Typography variant='h4' color='success.main'>{stats.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant='h6' color='text.secondary'>Yapılmadı</Typography>
              <Typography variant='h4' color='error.main'>{stats.notCompleted}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Görevler Tablosu */}
      <Card>
        <CardHeader 
          title='Görevler'
          action={
            <Button 
              variant='contained' 
              startIcon={<i className='tabler-plus' />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Yeni Görev
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity='error' sx={{ mb: 4 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Görev</TableCell>
                  <TableCell>Atanan Kişi</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Son Tarih</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Tekrar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.documentId}>
                    <TableCell>
                      <Typography variant='subtitle2'>{task.title}</Typography>
                      {task.description && (
                        <Typography variant='caption' color='text.secondary'>
                          {task.description.substring(0, 50)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                    </TableCell>
                    <TableCell>
                      {task.assignedTo.department?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getPriorityLabel(task.priority)} 
                        color={getPriorityColor(task.priority) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(task.status)} 
                        color={getStatusColor(task.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {task.isRecurring ? (
                        <Chip 
                          label={task.recurringInterval || 'Evet'} 
                          size='small'
                          variant='outlined'
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Görev Oluşturma Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Yeni Görev Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Görev Başlığı'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Açıklama'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Atanacak Çalışan</InputLabel>
              <Select
                value={formData.assignedTo}
                label='Atanacak Çalışan'
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                {workers.map((worker) => (
                  <MenuItem key={worker.documentId} value={worker.documentId}>
                    {worker.firstName} {worker.lastName} {worker.department && `- ${worker.department.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type='datetime-local'
              label='Teslim Tarihi'
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={formData.priority}
                label='Öncelik'
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <MenuItem value='low'>Düşük</MenuItem>
                <MenuItem value='medium'>Orta</MenuItem>
                <MenuItem value='high'>Yüksek</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
              }
              label='Tekrarlayan Görev'
            />
            {formData.isRecurring && (
              <FormControl fullWidth>
                <InputLabel>Tekrar Aralığı</InputLabel>
                <Select
                  value={formData.recurringInterval || ''}
                  label='Tekrar Aralığı'
                  onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value as any })}
                >
                  <MenuItem value='daily'>Günlük</MenuItem>
                  <MenuItem value='weekly'>Haftalık</MenuItem>
                  <MenuItem value='monthly'>Aylık</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>İptal</Button>
          <Button
            variant='contained'
            onClick={handleCreateTask}
            disabled={!formData.title || !formData.assignedTo || !formData.dueDate}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TasksPage

