'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  IconButton,
  Button,
  Alert
} from '@mui/material'
import { toast } from 'react-toastify'
import { sectorsService, StrapiSector } from '@/services/sectors.service'

// Dialog for delete confirmation
import DeleteSectorDialog from '@/components/dialogs/DeleteSectorDialog'
import { blogPostService, StrapiBlogPost } from '@/services/blog-post.service'
import DeleteBlogPostDialog from '@/components/dialogs/DeleteBlogPostDialog'

const SectorListPage = () => {
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<StrapiBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await blogPostService.getBlogPosts()
        setBlogPosts(response.data)
        setError(null)
      } catch (error: any) {
        console.error('Bloglar yüklenirken hata oluştu:', error)
        setError('Bloglar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const handleDeleteClick = (sectorId: string) => {
    setSelectedBlogPostId(sectorId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = async () => {
    try {
      const response = await blogPostService.deleteBlogPost(selectedBlogPostId!)
      setBlogPosts(prev => prev.filter(service => service.documentId !== selectedBlogPostId))
      toast.success('Blog Post başarıyla silindi')
    } catch (error: any) {
      console.error('Blog Post yüklenirken hata oluştu:', error)
      toast.error('Blog Post yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.')
    }
  }

  const handleEdit = (blogId: string) => {
    router.push(`/pages/blog-post/update/${blogId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity='info' icon={<i className='tabler-info-circle' />}>
            Bloglar yükleniyor, lütfen bekleyiniz...
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error' icon={<i className='tabler-alert-circle' />}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (blogPosts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity='info' icon={<i className='tabler-info-circle' />}>
            Henüz hiç Blog bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/pages/blog-post/create' sx={{ mt: 2 }}>
            Yeni Blog Ekle
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' color='text.primary'>
              Bloglar
            </Typography>
            <Button variant='contained' color='primary' href='/pages/blog-post/create'>
              Yeni Blog Ekle
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* <TableCell>ID</TableCell> */}
                    <TableCell>İsim</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blogPosts.map((blog, index) => (
                    <TableRow key={index}>
                      {/* <TableCell>{blog.}</TableCell> */}
                      <TableCell>{blog.title}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(blog.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(blog.documentId)}>
                          <i className='tabler-trash' />
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
      <DeleteBlogPostDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        blogPostId={selectedBlogPostId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  )
}

export default SectorListPage
