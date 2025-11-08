import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { workModesService } from '@/services/work-modes.service';

interface DeleteWorkModeDialogProps {
  open: boolean;
  onClose: () => void;
  workModeId: string | null;
  onSuccess: () => void;
}

const DeleteWorkModeDialog = ({ open, onClose, workModeId, onSuccess }: DeleteWorkModeDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!workModeId) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      await workModesService.deleteWorkMode(workModeId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Çalışma türü silinirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Çalışma türü silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Çalışma Türünu Sil</DialogTitle>
      <DialogContent>
        Bu çalışma türünu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button onClick={handleDelete} color='error' disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteWorkModeDialog;
