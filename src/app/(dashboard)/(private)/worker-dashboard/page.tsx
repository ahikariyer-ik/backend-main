'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { Card, CardContent, Grid, Typography, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Button, CircularProgress, Alert } from '@mui/material'

// Hook Imports
import { formatNumber } from '@core/utils/format'

// Axios Import
import { axiosClient } from '@/libs/axios'

// Auth Service
import { authService } from '@/services'

// Services
import { taskService } from '@/services/task.service'
import { leaveRequestService } from '@/services/leave-request.service'
import { type WorkerDocuments } from '@/services/workers.service'

// Belge türü etiketleri
const documentTypeLabels: Record<string, string> = {
  criminalRecordDoc: 'Adli Sicil',
  populationRegistryDoc: 'Nüfus Kaydı',
  identityDoc: 'Kimlik',
  residenceDoc: 'İkametgah',
  militaryDoc: 'Askerlik',
  employmentStartDoc: 'İşe Giriş Belgesi'
}

const WorkerDashboardPage = () => {
  // States
  const [workerData, setWorkerData] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [remainingLeave, setRemainingLeave] = useState<any>(null)
  const [documents, setDocuments] = useState<WorkerDocuments | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authService.getUser()
        if (!user) return

        // Worker bilgilerini çek
        const workerResponse = await axiosClient.get('/api/workers', {
          params: {
            'filters[user][id]': user.id,
            'populate[0]': 'user',
            'populate[1]': 'company',
            'populate[2]': 'department',
            'populate[3]': 'branch',
            'populate[4]': 'position',
            'populate[5]': 'criminalRecordDoc',
            'populate[6]': 'populationRegistryDoc',
            'populate[7]': 'identityDoc',
            'populate[8]': 'residenceDoc',
            'populate[9]': 'militaryDoc',
            'populate[10]': 'employmentStartDoc'
          }
        })

        if (workerResponse.data.data?.[0]) {
          const worker = workerResponse.data.data[0]
          setWorkerData(worker)
          
          // Belgeleri ayarla
          setDocuments({
            criminalRecordDoc: worker.criminalRecordDoc || null,
            populationRegistryDoc: worker.populationRegistryDoc || null,
            identityDoc: worker.identityDoc || null,
            residenceDoc: worker.residenceDoc || null,
            militaryDoc: worker.militaryDoc || null,
            employmentStartDoc: worker.employmentStartDoc || null
          })

          // Görevlerimi çek
          const tasksResponse = await taskService.getMyTasks()
          if (!tasksResponse.error) {
            setTasks(tasksResponse.data)
          }

          // İzin taleplerimi çek
          const leaveResponse = await leaveRequestService.getMyLeaveRequests(worker.documentId)
          if (!leaveResponse.error) {
            setLeaveRequests(leaveResponse.data)
          }

          // Kalan izin günlerimi çek
          const remainingResponse = await leaveRequestService.getRemainingDays(worker.documentId)
          if (!remainingResponse.error) {
            setRemainingLeave(remainingResponse.data)
          }
        }
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'in_progress': return 'info'
      case 'completed': return 'success'
      case 'not_completed': return 'error'
      default: return 'default'
    }
  }

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const handleViewDocument = (url: string, name: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`
    window.open(fullUrl, '_blank')
  }

  const handleDownloadDocument = (url: string, name: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateDocumentCompletionPercentage = () => {
    if (!documents) return 0
    const totalDocs = 5
    const uploadedDocs = Object.values(documents).filter((doc) => doc !== null).length
    return Math.round((uploadedDocs / totalDocs) * 100)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ mb: 2 }}>
              Hoş Geldiniz, {workerData ? `${workerData.firstName} ${workerData.lastName}` : 'Çalışan'}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Çalışan paneline hoş geldiniz. Görevlerinizi, izinlerinizi ve kişisel bilgilerinizi buradan takip edebilirsiniz.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* İstatistikler */}
      {workerData && (
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant='h6' color='text.secondary'>Görevlerim</Typography>
                      <Typography variant='h4'>{tasks.length}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {tasks.filter(t => t.status === 'pending').length} bekliyor
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'primary.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-clipboard-list' style={{ fontSize: 24, color: 'white' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant='h6' color='text.secondary'>İzin Taleplerim</Typography>
                      <Typography variant='h4'>{leaveRequests.length}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {leaveRequests.filter(l => l.status === 'pending').length} bekliyor
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'success.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-calendar' style={{ fontSize: 24, color: 'white' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant='h6' color='text.secondary'>Kalan İzin</Typography>
                      <Typography variant='h4'>{remainingLeave?.remainingDays || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {remainingLeave?.totalEntitledDays || 0} günlük hak
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'warning.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-clock' style={{ fontSize: 24, color: 'white' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant='h6' color='text.secondary'>Çalışma Süresi</Typography>
                      <Typography variant='h4'>{remainingLeave?.yearsOfService || 0}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Yıl
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'info.main', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className='tabler-briefcase' style={{ fontSize: 24, color: 'white' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Görevlerim */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>Görevlerim</Typography>
            {tasks.length > 0 ? (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Görev</TableCell>
                      <TableCell>Son Tarih</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.slice(0, 5).map((task) => (
                      <TableRow key={task.documentId}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status} 
                            color={getTaskStatusColor(task.status) as any}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body2' color='text.secondary'>Henüz görev bulunmuyor</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* İzin Taleplerim */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>İzin Taleplerim</Typography>
            {leaveRequests.length > 0 ? (
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Gün</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests.slice(0, 5).map((leave) => (
                      <TableRow key={leave.documentId}>
                        <TableCell>
                          {new Date(leave.startDate).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>{leave.totalDays}</TableCell>
                        <TableCell>
                          <Chip 
                            label={leave.status} 
                            color={getLeaveStatusColor(leave.status) as any}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body2' color='text.secondary'>Henüz izin talebi bulunmuyor</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Kişisel ve İş Bilgileri */}
      {workerData && (
        <>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='text.primary' sx={{ mb: 2 }}>
                  Kişisel Bilgiler
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Ad Soyad:</strong> {workerData.firstName} {workerData.lastName}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Email:</strong> {workerData.email}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Telefon:</strong> {workerData.phone || 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Doğum Tarihi:</strong> {workerData.birthDate ? new Date(workerData.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='text.primary' sx={{ mb: 2 }}>
                  İş Bilgileri
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Meslek:</strong> {workerData.profession || 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Pozisyon:</strong> {workerData.position?.name || 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Departman:</strong> {workerData.department?.name || 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Şube:</strong> {workerData.branch?.name || 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>İşe Giriş Tarihi:</strong> {workerData.hireDate ? new Date(workerData.hireDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  <strong>Durum:</strong> {workerData.isActive ? 'Aktif' : 'Pasif'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}

      {/* Özlük Belgeleri */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h6'>Özlük Belgelerim</Typography>
              {documents && (
                <Chip 
                  label={`%${calculateDocumentCompletionPercentage()} Tamamlandı`}
                  color={calculateDocumentCompletionPercentage() === 100 ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {documents ? (
              <Grid container spacing={3}>
                {Object.entries(documentTypeLabels).map(([docType, label]) => {
                  const doc = documents[docType as keyof WorkerDocuments]
                  const uploaded = !!doc

                  return (
                    <Grid item xs={12} sm={6} md={4} key={docType}>
                      <Card 
                        variant='outlined' 
                        sx={{ 
                          borderColor: uploaded ? 'success.main' : 'error.main',
                          borderWidth: 2
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                              {label}
                            </Typography>
                            <Box
                              sx={{
                                bgcolor: uploaded ? 'success.main' : 'error.main',
                                color: 'white',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <i className={uploaded ? 'tabler-check' : 'tabler-x'} style={{ fontSize: 18 }} />
                            </Box>
                          </Box>

                          {uploaded && doc ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant='outlined'
                                size='small'
                                fullWidth
                                startIcon={<i className='tabler-eye' />}
                                onClick={() => handleViewDocument(doc.url, doc.name)}
                              >
                                Görüntüle
                              </Button>
                              <Button
                                variant='outlined'
                                size='small'
                                fullWidth
                                startIcon={<i className='tabler-download' />}
                                onClick={() => handleDownloadDocument(doc.url, doc.name)}
                              >
                                İndir
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant='body2' color='text.secondary' align='center'>
                              Henüz yüklenmemiş
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Belge bilgisi yüklenemedi
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default WorkerDashboardPage

