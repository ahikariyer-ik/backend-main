import { axiosClient } from '@/libs/axios';

// Worker belgelerinin durumu
export interface WorkerDocuments {
  criminalRecordDoc: boolean;
  populationRegistryDoc: boolean;
  identityDoc: boolean;
  residenceDoc: boolean;
  militaryDoc: boolean;
}

// Çalışan tipi
export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: {
    id: number;
    url: string;
  };
  department?: {
    id: number;
    name: string;
  };
  hireDate: string;
  profession?: string;
  uploadToken?: string;
  tokenExpiresAt?: string;
  documents: WorkerDocuments;
}

// Token oluşturma response
export interface GenerateTokenResponse {
  uploadToken: string;
  uploadUrl: string;
  expiresAt: string;
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface StrapiResponse<T> {
  data: T;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

class WorkersService {
  private static instance: WorkersService;

  private constructor() {}

  public static getInstance(): WorkersService {
    if (!WorkersService.instance) {
      WorkersService.instance = new WorkersService();
    }
    return WorkersService.instance;
  }

  /**
   * Şirketin çalışanlarını ve belge durumlarını getirir
   */
  public async getCompanyWorkers(): Promise<StrapiResponse<Worker[]>> {
    try {
      const response = await axiosClient.get('/api/workers/company-workers');
      return response.data;
    } catch (error: any) {
      console.error('Çalışanlar getirilirken hata:', error);
      return {
        data: [],
        error: {
          status: error.response?.status || 500,
          name: 'WorkersError',
          message: error.response?.data?.error?.message || 'Çalışanlar yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Çalışan için belge yükleme linki oluşturur
   */
  public async generateUploadToken(workerId: string): Promise<StrapiResponse<GenerateTokenResponse>> {
    try {
      const response = await axiosClient.post(`/api/workers/${workerId}/generate-token`);
      return response.data;
    } catch (error: any) {
      console.error('Token oluşturulurken hata:', error);
      return {
        data: {} as GenerateTokenResponse,
        error: {
          status: error.response?.status || 500,
          name: 'TokenError',
          message: error.response?.data?.error?.message || 'Token oluşturulurken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Token ile çalışan bilgilerini getirir (public - token validation)
   */
  public async getWorkerByToken(token: string): Promise<StrapiResponse<Worker>> {
    try {
      const response = await axiosClient.get(`/api/workers/by-token/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Çalışan bilgisi getirilirken hata:', error);
      return {
        data: {} as Worker,
        error: {
          status: error.response?.status || 500,
          name: 'WorkerError',
          message: error.response?.data?.error?.message || 'Çalışan bilgisi yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Belge yükler (public - token validation)
   */
  public async uploadDocument(
    token: string,
    documentType: keyof WorkerDocuments,
    file: File
  ): Promise<StrapiResponse<{ message: string; documentType: string; documents: WorkerDocuments }>> {
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await axiosClient.post('/api/workers/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Belge yüklenirken hata:', error);
      return {
        data: {} as any,
        error: {
          status: error.response?.status || 500,
          name: 'UploadError',
          message: error.response?.data?.error?.message || 'Belge yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * WhatsApp linki oluşturur
   */
  public generateWhatsAppLink(phoneNumber: string, uploadUrl: string, workerName: string): string {
    // Telefon numarasını temizle (+ ve - karakterlerini kaldır, sadece rakamlar)
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // WhatsApp mesaj metni
    const message = `Merhaba ${workerName},\n\nLütfen belgelerinizi yüklemek için aşağıdaki linke tıklayın:\n${uploadUrl}\n\nBu link 30 gün geçerlidir.\n\nTeşekkürler.`;
    
    // WhatsApp API linki
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}

export const workersService = WorkersService.getInstance();

