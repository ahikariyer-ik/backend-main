import { axiosClient } from '@/libs/axios';

export interface QRCodeSession {
  id: string;
  documentId: string;
  sessionToken: string;
  sessionName: string;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
  maxUsageCount?: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationRadius: number;
  allowedIpAddresses?: string;
  notes?: string;
  qrCodeData: string;
  company?: {
    id: string;
    companyName: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  sessionName?: string;
  branchId?: string;
  expirationMinutes?: number;
  maxUsageCount?: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationRadius?: number;
  allowedIpAddresses?: string;
  notes?: string;
}

export interface ValidateSessionRequest {
  sessionToken: string;
  latitude?: number;
  longitude?: number;
}

export interface ValidateSessionResponse {
  valid: boolean;
  error?: string;
  data?: {
    sessionId: string;
    company: any;
    branch?: any;
    expiresAt: string;
    remainingUsages?: number;
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

class QRCodeSessionService {
  private static instance: QRCodeSessionService;

  private constructor() {}

  public static getInstance(): QRCodeSessionService {
    if (!QRCodeSessionService.instance) {
      QRCodeSessionService.instance = new QRCodeSessionService();
    }
    return QRCodeSessionService.instance;
  }

  /**
   * Yeni QR kod oturumu oluşturur (Company)
   */
  public async createSession(data: CreateSessionRequest): Promise<StrapiResponse<QRCodeSession>> {
    try {
      const response = await axiosClient.post('/api/qr-code-sessions/create', data);
      return response.data;
    } catch (error: any) {
      console.error('Create session error:', error);
      return {
        data: {} as QRCodeSession,
        error: {
          status: error.response?.status || 500,
          name: 'CreateSessionError',
          message: error.response?.data?.error?.message || 'QR kod oluşturulurken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Aktif QR kod oturumlarını getirir (Company)
   */
  public async getMySessions(): Promise<StrapiResponse<QRCodeSession[]>> {
    try {
      const response = await axiosClient.get('/api/qr-code-sessions/my-sessions');
      return response.data;
    } catch (error: any) {
      console.error('Get sessions error:', error);
      return {
        data: [],
        error: {
          status: error.response?.status || 500,
          name: 'GetSessionsError',
          message: error.response?.data?.error?.message || 'QR kodları yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * QR kod oturumunu devre dışı bırakır (Company)
   */
  public async deactivateSession(id: string): Promise<StrapiResponse<{ message: string; success: boolean }>> {
    try {
      const response = await axiosClient.post(`/api/qr-code-sessions/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      console.error('Deactivate session error:', error);
      return {
        data: { message: '', success: false },
        error: {
          status: error.response?.status || 500,
          name: 'DeactivateError',
          message: error.response?.data?.error?.message || 'QR kod devre dışı bırakılırken bir hata oluştu'
        }
      };
    }
  }

  /**
   * QR kod oturumunu doğrular (Worker - Public)
   */
  public async validateSession(data: ValidateSessionRequest): Promise<ValidateSessionResponse> {
    try {
      const response = await axiosClient.post('/api/qr-code-sessions/validate', data);
      return response.data;
    } catch (error: any) {
      console.error('Validate session error:', error);
      return {
        valid: false,
        error: error.response?.data?.error?.message || 'QR kod doğrulanırken bir hata oluştu'
      };
    }
  }
}

export const qrCodeSessionService = QRCodeSessionService.getInstance();

