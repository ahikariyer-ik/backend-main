import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { departmentsService } from '@/services/departments.service';

interface DeleteDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  departmentId: string | null;
  onSuccess: () => void;
}

const DeleteDepartmentDialog = ({ open, onClose, departmentId, onSuccess }: DeleteDepartmentDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!departmentId) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      await departmentsService.deleteDepartment(departmentId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Departman silinirken hata oluştu:', error);
      toast.error(error.response?.data?.error?.message || 'Departman silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Departmanı Sil</DialogTitle>
      <DialogContent>
        Bu departmanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default DeleteDepartmentDialog;
