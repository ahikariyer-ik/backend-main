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
import { professionsService, StrapiProfession } from '@/services/professions.service';
import DeleteProfessionDialog from '@/components/dialogs/DeleteProfessionDialog';

const ProfessionListPage = () => {
  const router = useRouter();
  const [professions, setProfessions] = useState<StrapiProfession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfessionId, setSelectedProfessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const response = await professionsService.getProfessions();
        setProfessions(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Meslekler yüklenirken hata oluştu:', error);
        setError('Meslekler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  const handleDeleteClick = (professionId: string) => {
    setSelectedProfessionId(professionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const response = await professionsService.getProfessions();
      setProfessions(response.data);
      toast.success('Meslek başarıyla silindi');
    } catch (error: any) {
      console.error('Meslekler yüklenirken hata oluştu:', error);
      toast.error('Meslekler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
    }
  };

  const handleEdit = (professionId: string) => {
    router.push(`/datas/professions/update/${professionId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Meslekler yükleniyor, lütfen bekleyiniz...
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

  if (professions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Henüz hiç meslek bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/datas/professions/create' sx={{ mt: 2 }}>
            Yeni Meslek Ekle
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
              Meslekler
            </Typography>
            <Button variant='contained' color='primary' href='/datas/professions/create'>
              Yeni Meslek Ekle
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
                  {professions.map(profession => (
                    <TableRow key={profession.documentId}>
                      <TableCell>{profession.key}</TableCell>
                      <TableCell>{profession.name}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(profession.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(profession.documentId)}>
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
      <DeleteProfessionDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        professionId={selectedProfessionId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
};

export default ProfessionListPage;
