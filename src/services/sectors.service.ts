// sectors.service.ts
import { axiosClient } from '@/libs/axios';

export interface StrapiSector {
  documentId: string;
  key: string;
  name: string;
  description?: string;
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

class SectorsService {
  private static instance: SectorsService;

  private constructor() {}

  public static getInstance(): SectorsService {
    if (!SectorsService.instance) {
      SectorsService.instance = new SectorsService();
    }
    return SectorsService.instance;
  }

  public async getSectors(): Promise<StrapiResponse<StrapiSector[]>> {
    const response = await axiosClient.get('/api/sectors');
    return response.data;
  }

  public async getSector(documentId: string): Promise<StrapiResponse<StrapiSector>> {
    const response = await axiosClient.get(`/api/sectors/${documentId}`);
    return response.data;
  }

  public async createSector(sector: Omit<StrapiSector, 'documentId'>): Promise<StrapiResponse<StrapiSector>> {
    const response = await axiosClient.post('/api/sectors', { data: sector });
    return response.data;
  }

  public async updateSector(documentId: string, sector: Partial<StrapiSector>): Promise<StrapiResponse<StrapiSector>> {
    const response = await axiosClient.put(`/api/sectors/${documentId}`, { data: sector });
    return response.data;
  }

  public async deleteSector(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/sectors/${documentId}`);
  }
}

export const sectorsService = SectorsService.getInstance();
