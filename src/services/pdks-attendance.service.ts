import { axiosClient } from '@/libs/axios';

export interface PDKSAttendance {
  id: string;
  documentId: string;
  checkType: 'in' | 'out';
  checkTime: string;
  locationLatitude?: number;
  locationLongitude?: number;
  ipAddress?: string;
  userAgent?: string;
  isManual: boolean;
  worker?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    companyName: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  qrCodeSession?: {
    id: string;
    sessionName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckInOutRequest {
  sessionToken: string;
  checkType: 'in' | 'out';
  latitude?: number;
  longitude?: number;
}

export interface ManualEntryRequest {
  workerId: string;
  checkType: 'in' | 'out';
  checkTime: string;
  branchId?: string;
  notes?: string;
}

export interface MonthlyReportData {
  workerId: string;
  workerName: string;
  month: string;
  year: number;
  totalHours: number;
  totalDays: number;
  records: PDKSAttendance[];
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

class PDKSAttendanceService {
  private static instance: PDKSAttendanceService;

  private constructor() {}

  public static getInstance(): PDKSAttendanceService {
    if (!PDKSAttendanceService.instance) {
      PDKSAttendanceService.instance = new PDKSAttendanceService();
    }
    return PDKSAttendanceService.instance;
  }

  /**
   * Çalışan giriş-çıkış yapar (Worker)
   */
  public async checkInOut(data: CheckInOutRequest): Promise<StrapiResponse<PDKSAttendance>> {
    try {
      const response = await axiosClient.post('/api/pdks-attendances/check', data);
      return response.data;
    } catch (error: any) {
      console.error('PDKS check error:', error);
      return {
        data: {} as PDKSAttendance,
        error: {
          status: error.response?.status || 500,
          name: 'CheckError',
          message: error.response?.data?.error?.message || 'Giriş-çıkış işlemi sırasında bir hata oluştu'
        }
      };
    }
  }

  /**
   * Çalışanın kendi kayıtlarını getirir (Worker)
   */
  public async getMyRecords(params?: {
    startDate?: string;
    endDate?: string;
    checkType?: 'in' | 'out';
  }): Promise<StrapiResponse<PDKSAttendance[]>> {
    try {
      const response = await axiosClient.get('/api/pdks-attendances/my-records', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get my records error:', error);
      return {
        data: [],
        error: {
          status: error.response?.status || 500,
          name: 'RecordsError',
          message: error.response?.data?.error?.message || 'Kayıtlar yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Şirketin tüm kayıtlarını getirir (Company)
   */
  public async getCompanyRecords(params?: {
    startDate?: string;
    endDate?: string;
    workerId?: string;
    branchId?: string;
    checkType?: 'in' | 'out';
  }): Promise<StrapiResponse<PDKSAttendance[]>> {
    try {
      const response = await axiosClient.get('/api/pdks-attendances/company-records', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get company records error:', error);
      return {
        data: [],
        error: {
          status: error.response?.status || 500,
          name: 'RecordsError',
          message: error.response?.data?.error?.message || 'Kayıtlar yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Aylık rapor getirir (Company)
   */
  public async getMonthlyReport(params: {
    month: number;
    year: number;
    workerId?: string;
  }): Promise<StrapiResponse<MonthlyReportData[]>> {
    try {
      const response = await axiosClient.get('/api/pdks-attendances/monthly-report', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get monthly report error:', error);
      return {
        data: [],
        error: {
          status: error.response?.status || 500,
          name: 'ReportError',
          message: error.response?.data?.error?.message || 'Rapor yüklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Manuel kayıt ekler (Company)
   */
  public async manualEntry(data: ManualEntryRequest): Promise<StrapiResponse<PDKSAttendance>> {
    try {
      const response = await axiosClient.post('/api/pdks-attendances/manual-entry', data);
      return response.data;
    } catch (error: any) {
      console.error('Manual entry error:', error);
      return {
        data: {} as PDKSAttendance,
        error: {
          status: error.response?.status || 500,
          name: 'ManualEntryError',
          message: error.response?.data?.error?.message || 'Manuel kayıt eklenirken bir hata oluştu'
        }
      };
    }
  }

  /**
   * Kayıt siler (Company)
   */
  public async deleteRecord(id: string): Promise<StrapiResponse<{ message: string }>> {
    try {
      const response = await axiosClient.delete(`/api/pdks-attendances/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete record error:', error);
      return {
        data: { message: '' },
        error: {
          status: error.response?.status || 500,
          name: 'DeleteError',
          message: error.response?.data?.error?.message || 'Kayıt silinirken bir hata oluştu'
        }
      };
    }
  }
}

export const pdksAttendanceService = PDKSAttendanceService.getInstance();



