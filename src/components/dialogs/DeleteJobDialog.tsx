import * as React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { toast } from 'react-toastify'

import { axiosClient } from '@/libs/axios'

interface DeleteJobDialogProps {
  open: boolean
  onClose: () => void
  jobId: number
  onSuccess: () => void
}

export default function DeleteJobDialog({ open, onClose, jobId, onSuccess }: DeleteJobDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const promise = axiosClient.delete(`/api/job-listings/${jobId}`)

      await toast.promise(promise, {
        pending: {
          render: () => (
            <div className='flex items-center'>
              <span>İlan siliniyor...</span>
            </div>
          )
        },
        success: {
          render: () => (
            <div className='flex items-center'>
              <span>İlan başarıyla silindi!</span>
            </div>
          )
        },
        error: {
          render: ({ data }: any) => (
            <div className='flex items-center'>
              <span>{data?.response?.data?.error?.message || 'İlan silinirken bir hata oluştu'}</span>
            </div>
          )
        }
      })

      onSuccess()
      onClose()
    } catch (error) {
      // Hata toast.promise içinde gösteriliyor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"İlanı Sil"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>İptal</Button>
        <Button onClick={handleDelete} color="error" disabled={loading} autoFocus>
          {loading ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
