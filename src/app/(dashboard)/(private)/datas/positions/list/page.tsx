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
import { positionsService, StrapiPosition } from '@/services/positions.service';
import DeletePositionDialog from '@/components/dialogs/DeletePositionDialog';

const PositionListPage = () => {
  const router = useRouter();
  const [positions, setPositions] = useState<StrapiPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await positionsService.getPositions();
        setPositions(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Pozisyonlar yüklenirken hata oluştu:', error);
        setError('Pozisyonlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const handleDeleteClick = (positionId: string) => {
    setSelectedPositionId(positionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const response = await positionsService.getPositions();
      setPositions(response.data);
      toast.success('Pozisyon başarıyla silindi');
    } catch (error: any) {
      console.error('Pozisyonlar yüklenirken hata oluştu:', error);
      toast.error('Pozisyonlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
    }
  };

  const handleEdit = (positionId: string) => {
    router.push(`/datas/positions/update/${positionId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Pozisyonlar yükleniyor, lütfen bekleyiniz...
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

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Henüz hiç pozisyon bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/datas/positions/create' sx={{ mt: 2 }}>
            Yeni Pozisyon Ekle
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
              Pozisyonlar
            </Typography>
            <Button variant='contained' color='primary' href='/datas/positions/create'>
              Yeni Pozisyon Ekle
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
                  {positions.map(position => (
                    <TableRow key={position.documentId}>
                      <TableCell>{position.key}</TableCell>
                      <TableCell>{position.name}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(position.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(position.documentId)}>
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
      <DeletePositionDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        positionId={selectedPositionId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
};

export default PositionListPage;
