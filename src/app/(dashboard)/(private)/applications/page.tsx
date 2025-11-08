'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material'

// Axios Import
import { axiosClient } from '@/libs/axios'

interface JobListing {
  id: number;
  documentId: string;
  title: string;
  description: string;
  city: string;
  district: string;
  requiredQualifications: string;
  jobNature: string;
  employmentType: string;
  disabilityFriendly: boolean;
  minAge: number;
  maxAge: number;
  educationRequirement: string;
  publicationEndDate: string;
  jobStatus: string;
  applicationCount: number;
  gender: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface ApplicationLog {
  id: number;
  documentId: string;
  applicantIP: string;
  additionalData: {
    data: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  job_listing: JobListing;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

const ApplicationListPage = () => {
  // States
  const [applications, setApplications] = useState<ApplicationLog[]>([])
  const [loading, setLoading] = useState(true)

  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0
  })

  // Fetch applications
  const fetchApplications = async (page: number, pageSize: number) => {
    try {
      const response = await axiosClient.get('/api/application-logs', {
        params: {
          populate: ['job_listing'],
          'sort[0]': 'createdAt:desc',
          'pagination[page]': page + 1,
          'pagination[pageSize]': pageSize
        }
      })

      setApplications(response.data.data)
      setPagination({
        ...response.data.meta.pagination,
        page: response.data.meta.pagination.page - 1 // Strapi'den gelen sayfa numarasını 0-based'e çeviriyoruz
      })
    } catch (error) {
      console.error('Başvurular yüklenirken hata oluştu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications(pagination.page, pagination.pageSize)
  }, [pagination.page, pagination.pageSize])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      page: 0
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Yükleniyor...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant='h6' color='text.primary'>
              Başvurular
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İlan</TableCell>
                    <TableCell>IP Adresi</TableCell>
                    <TableCell>Ek Veri</TableCell>
                    <TableCell>Başvuru Tarihi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map(application => (
                    <TableRow key={application.id}>
                      <TableCell>{application.job_listing.title}</TableCell>
                      <TableCell>{application.applicantIP}</TableCell>
                      <TableCell>{application.additionalData.data}</TableCell>
                      <TableCell>{new Date(application.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pagination.total}
                rowsPerPage={pagination.pageSize}
                page={pagination.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Sayfa başına satır:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ApplicationListPage
