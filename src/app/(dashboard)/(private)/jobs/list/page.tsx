'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Component Imports
import Link from '@components/Link'
import DeleteJobDialog from '@/components/dialogs/DeleteJobDialog'

// Third-party Imports
import { toast } from 'react-toastify'

// Services
import { jobListingService } from '@/services/job-listing.service'
import { authService } from '@/services/auth.service'

// Types
import type { StrapiJobListing } from '@/services/job-listing.service'

const JobListPage = () => {
  const router = useRouter()

  // States
  const [jobs, setJobs] = useState<StrapiJobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkUserRoleAndFetchJobs = async () => {
      try {
        const isEmployee = authService.isEmployee()
        setIsAdmin(isEmployee)

        const jobsData = await jobListingService.getJobListings()
        setJobs(jobsData)
        setError(null)
      } catch (error: any) {
        console.error('İlanlar yüklenirken hata oluştu:', error)
        setError('İlanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.')
      } finally {
        setLoading(false)
      }
    }

    checkUserRoleAndFetchJobs()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Expired':
        return 'error'
      case 'Pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Aktif'
      case 'Expired':
        return 'Süresi Doldu'
      case 'Pending':
        return 'Beklemede'
      default:
        return 'Bilinmiyor'
    }
  }

  const handleDeleteClick = (jobId: number) => {
    setSelectedJobId(jobId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = async () => {
    try {
      const jobsData = await jobListingService.getJobListings()
      setJobs(jobsData)
    } catch (error: any) {
      console.error('İlanlar yüklenirken hata oluştu:', error)
      toast.error('İlanlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.')
    }
  }

  const handleEdit = (jobId: string) => {
    router.push(`/jobs/update/${jobId}`)
  }

  const handleStatusChange = async (jobId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Pending' : 'Active'
      await jobListingService.updateJobStatus(jobId, newStatus)
      const jobsData = await jobListingService.getJobListings()
      setJobs(jobsData)
      toast.success(`İlan durumu başarıyla ${newStatus === 'Active' ? 'aktif' : 'beklemede'} olarak güncellendi`)
    } catch (error: any) {
      console.error('Durum güncellenirken hata oluştu:', error)
      toast.error('Durum güncellenirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className="tabler-info-circle" />}>
            İlanlar yükleniyor, lütfen bekleyiniz...
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" icon={<i className="tabler-alert-circle" />}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className="tabler-info-circle" />}>
            Henüz hiç ilanınız bulunmamaktadır.
          </Alert>
          <Button variant="contained" color="primary" href="/jobs/create" sx={{ mt: 2 }}>
            Yeni İlan Ver
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="İlanlarım"
        action={
          <Button variant="contained" color="primary" href="/jobs/create">
            Yeni İlan Ver
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İlan Başlığı</TableCell>
                    {isAdmin && <TableCell>Şirket</TableCell>}
                    <TableCell>Departman</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Bitiş Tarihi</TableCell>
                    <TableCell>Başvuru Sayısı</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell>{job.title}</TableCell>
                      {isAdmin && <TableCell>{job.company?.companyName || '-'}</TableCell>}
                      <TableCell>{job.department?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(job.jobStatus)}
                          color={getStatusColor(job.jobStatus)}
                          size="small"
                          onClick={() => handleStatusChange(job.id, job.jobStatus)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>{new Date(job.publicationEndDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{job.applicationCount}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(job.documentId)}>
                          <i className="tabler-edit" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(job.id)}>
                          <i className="tabler-trash" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
      <DeleteJobDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        jobId={selectedJobId || 0}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  )
}

export default JobListPage
