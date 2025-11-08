import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { professionsService } from '@/services/professions.service';

interface DeleteProfessionDialogProps {
  open: boolean;
  onClose: () => void;
  professionId: string | null;
  onSuccess: () => void;
}

const DeleteProfessionDialog = ({ open, onClose, professionId, onSuccess }: DeleteProfessionDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!professionId) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      await professionsService.deleteProfession(professionId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Meslek silinirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Meslek silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Mesleği Sil</DialogTitle>
      <DialogContent>
        Bu mesleği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default DeleteProfessionDialog;
