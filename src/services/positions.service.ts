import { axiosClient } from '@/libs/axios';

export interface StrapiPosition {
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

class PositionsService {
  private static instance: PositionsService;

  private constructor() {}

  public static getInstance(): PositionsService {
    if (!PositionsService.instance) {
      PositionsService.instance = new PositionsService();
    }
    return PositionsService.instance;
  }

  public async getPositions(): Promise<StrapiResponse<StrapiPosition[]>> {
    const response = await axiosClient.get('/api/positions');
    return response.data;
  }

  public async getPosition(documentId: string): Promise<StrapiResponse<StrapiPosition>> {
    const response = await axiosClient.get(`/api/positions/${documentId}`);
    return response.data;
  }

  public async createPosition(position: Omit<StrapiPosition, 'documentId'>): Promise<StrapiResponse<StrapiPosition>> {
    const response = await axiosClient.post('/api/positions', { data: position });
    return response.data;
  }

  public async updatePosition(documentId: string, position: Partial<StrapiPosition>): Promise<StrapiResponse<StrapiPosition>> {
    const response = await axiosClient.put(`/api/positions/${documentId}`, { data: position });
    return response.data;
  }

  public async deletePosition(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/positions/${documentId}`);
  }
}

export const positionsService = PositionsService.getInstance();
