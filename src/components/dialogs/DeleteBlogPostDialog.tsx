import { useState } from 'react'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'
import { blogPostService } from '@/services/blog-post.service'

interface DeleteBlogPostDialogProps {
  open: boolean
  onClose: () => void
  blogPostId: string | null
  onSuccess: () => void
}

const DeleteBlogPostDialog = ({ open, onClose, blogPostId, onSuccess }: DeleteBlogPostDialogProps) => {
  const [loading, setLoading] = useState(false)

  if (!blogPostId) return

  const handleDelete = async () => {
    setLoading(true)
    try {
      await blogPostService.deleteBlogPost(blogPostId)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Blog Post silinirken hata oluştu:', error)
      toast.error(error.response?.data?.error?.message || 'Blog Post  silinirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Blog Post u Sil</DialogTitle>
      <DialogContent>Bu Blog Post u silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button onClick={handleDelete} color='error' disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteBlogPostDialog
