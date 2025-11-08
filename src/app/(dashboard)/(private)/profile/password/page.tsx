"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

// ** MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import {axiosClient} from '@/libs/axios'

export default function PasswordChangePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor!");

return;
    }

    try {
      setIsLoading(true);

      await axiosClient.post("/api/auth/change-password", {
        password: newPassword,
        passwordConfirmation: confirmPassword,
        currentPassword
      });

      setSuccess("Şifreniz başarıyla değiştirildi");
      router.refresh();
    } catch (err: any) {
      if (err.response?.data?.error) {
        const errorData = err.response.data.error;

        // Hata mesajını Türkçeleştir
        let errorMessage = 'Şifre değiştirilirken bir hata oluştu';

        if (errorData.message === 'Invalid current password') {
          errorMessage = 'Mevcut şifre yanlış';
        } else if (errorData.message === 'New password must be different from current password') {
          errorMessage = 'Yeni şifre mevcut şifreden farklı olmalıdır';
        } else if (errorData.message === '3 errors occurred') {
          errorMessage = 'Lütfen tüm alanları doldurun';
        }

        setError(errorMessage);
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Şifre Değiştir"
            titleTypographyProps={{ variant: 'h5' }}
            avatar={<i className="mdi-lock-outline" />}
          />
          <CardContent>
            {error && (
              <Alert
                severity="error"
                variant="filled"
                sx={{ mb: 4 }}
                onClose={() => setError("")}
              >
                <AlertTitle>Hata</AlertTitle>
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                variant="filled"
                sx={{ mb: 4 }}
                onClose={() => setSuccess("")}
              >
                <AlertTitle>Başarılı</AlertTitle>
                {success}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Mevcut Şifre"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Yeni Şifre"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Yeni Şifre (Tekrar)"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="tonal"
                    color="primary"
                    disabled={isLoading}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <i className="mdi-content-save" />
                      )
                    }
                  >
                    {isLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
