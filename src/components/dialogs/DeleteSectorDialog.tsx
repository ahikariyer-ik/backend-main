import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { sectorsService } from '@/services/sectors.service';

interface DeleteSectorDialogProps {
  open: boolean;
  onClose: () => void;
  sectorId: string | null;
  onSuccess: () => void;
}

const DeleteSectorDialog = ({ open, onClose, sectorId, onSuccess }: DeleteSectorDialogProps) => {
  const [loading, setLoading] = useState(false);

  if(!sectorId) return;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await sectorsService.deleteSector(sectorId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Sektör silinirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Sektör silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sektörü Sil</DialogTitle>
      <DialogContent>
        Bu sektörü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default DeleteSectorDialog;
