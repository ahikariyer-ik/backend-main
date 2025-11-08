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
import { departmentsService, StrapiDepartment } from '@/services/departments.service';
import DeleteDepartmentDialog from '@/components/dialogs/DeleteDepartmentDialog';

const DepartmentListPage = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState<StrapiDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentsService.getDepartments();
        setDepartments(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Departmanlar yüklenirken hata oluştu:', error);
        setError('Departmanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleDeleteClick = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    try {
      const response = await departmentsService.getDepartments();
      setDepartments(response.data);
      toast.success('Departman başarıyla silindi');
    } catch (error: any) {
      console.error('Departmanlar yüklenirken hata oluştu:', error);
      toast.error('Departmanlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
    }
  };

  const handleEdit = (departmentId: string) => {
    router.push(`/datas/departments/update/${departmentId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Departmanlar yükleniyor, lütfen bekleyiniz...
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

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" icon={<i className='tabler-info-circle' />}>
            Henüz hiç departman bulunmamaktadır.
          </Alert>
          <Button variant='contained' color='primary' href='/datas/departments/create' sx={{ mt: 2 }}>
            Yeni Departman Ekle
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
              Departmanlar
            </Typography>
            <Button variant='contained' color='primary' href='/datas/departments/create'>
              Yeni Departman Ekle
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
                  {departments.map(department => (
                    <TableRow key={department.documentId}>
                      <TableCell>{department.key}</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleEdit(department.documentId)}>
                          <i className='tabler-edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteClick(department.documentId)}>
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
      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        departmentId={selectedDepartmentId}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
};

export default DepartmentListPage;
