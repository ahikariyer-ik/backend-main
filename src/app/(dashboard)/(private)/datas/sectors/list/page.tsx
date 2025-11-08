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
import { sectorsService, StrapiSector } from '@/services/sectors.service';

// Dialog for delete confirmation
import DeleteSectorDialog from '@/components/dialogs/DeleteSectorDialog';

const SectorListPage = () => {
  const router = useRouter();
  const [sectors, setSectors] = useState<StrapiSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await sectorsService.getSectors();
        setSectors(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Sektörler yüklenirken hata oluştu:', error);
        setError('Sektörler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  const handleDeleteClick = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const response = await sectorsService.getSectors();
      setSectors(response.data);
      toast.success('Sektör başarıyla silindi');
    } catch (error: any) {
      console.error('Sektörler yüklenirken hata oluştu:', error);
      toast.error('Sektörler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
    }
  };

  const handleEdit = (sectorId: string) => {
    router.push(`/datas/sectors/update/${sectorId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Sektörler yükleniyor, lütfen bekleyiniz...
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

  if (sectors.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Henüz hiç sektör bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/datas/sectors/create' sx={{ mt: 2 }}>
            Yeni Sektör Ekle
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
              Sektörler
            </Typography>
            <Button variant='contained' color='primary' href='/datas/sectors/create'>
              Yeni Sektör Ekle
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
                  {sectors.map((sector, index) => (
                    <TableRow key={index}>
                      <TableCell>{sector.key}</TableCell>
                      <TableCell>{sector.name}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(sector.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(sector.documentId)}>
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
      <DeleteSectorDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sectorId={selectedSectorId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
};

export default SectorListPage;
