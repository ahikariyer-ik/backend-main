import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { positionsService } from '@/services/positions.service';

interface DeletePositionDialogProps {
  open: boolean;
  onClose: () => void;
  positionId: string | null;
  onSuccess: () => void;
}

const DeletePositionDialog = ({ open, onClose, positionId, onSuccess }: DeletePositionDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!positionId) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      await positionsService.deletePosition(positionId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Pozisyon silinirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Pozisyon silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Pozisyonu Sil</DialogTitle>
      <DialogContent>
        Bu pozisyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default DeletePositionDialog;
