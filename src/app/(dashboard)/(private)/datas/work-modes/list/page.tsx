'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import { toast } from 'react-toastify';
import { workModesService, StrapiWorkMode } from '@/services/work-modes.service';
import DeleteWorkModeDialog from '@/components/dialogs/DeleteWorkModeDialog';

const WorkModeListPage = () => {
  const router = useRouter();
  const [workModes, setWorkModes] = useState<StrapiWorkMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkModeId, setSelectedWorkModeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkModes = async () => {
      try {
        const response = await workModesService.getWorkModes();
        setWorkModes(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Çalışma türleri yüklenirken hata oluştu:', error);
        setError('Çalışma türleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkModes();
  }, []);

  const handleDeleteClick = (workModeId: string) => {
    setSelectedWorkModeId(workModeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const response = await workModesService.getWorkModes();
      setWorkModes(response.data);
      toast.success('Çalışma türü başarıyla silindi');
    } catch (error: any) {
      console.error('Çalışma türleri yüklenirken hata oluştu:', error);
      toast.error('Çalışma türleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
    }
  };

  const handleEdit = (workModeId: string) => {
    router.push(`/datas/work-modes/update/${workModeId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Çalışma türleri yükleniyor, lütfen bekleyiniz...
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" icon={<i className='tabler-alert-circle' />}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (workModes.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Henüz hiç Çalışma türü bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/datas/work-modes/create' sx={{ mt: 2 }}>
            Yeni Çalışma Türü Ekle
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' color='text.primary'>
              Çalışma Türleri
            </Typography>
            <Button variant='contained' color='primary' href='/datas/work-modes/create'>
              Yeni Çalışma Türü Ekle
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Anahtar</TableCell>
                    <TableCell>İsim</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workModes.map(workMode => (
                    <TableRow key={workMode.documentId}>
                      <TableCell>{workMode.key}</TableCell>
                      <TableCell>{workMode.name}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(workMode.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(workMode.documentId)}>
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
      <DeleteWorkModeDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        workModeId={selectedWorkModeId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
};

export default WorkModeListPage;
