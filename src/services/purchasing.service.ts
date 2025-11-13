import { axiosClient } from '@/libs/axios';

export interface Purchasing {
  id: number;
  documentId: string;
  itemName: string;
  category?: string;
  supplier?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  purchaseDate?: string;
  deliveryDate?: string;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  invoiceNumber?: string;
  notes?: string;
  invoice?: {
    id: number;
    url: string;
    name: string;
  };
  institution?: {
    id: number;
    documentId: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchasingDTO {
  institution: string;
  itemName: string;
  category?: string;
  supplier?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  purchaseDate?: string;
  deliveryDate?: string;
  status?: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  invoiceNumber?: string;
  notes?: string;
  invoice?: string;
}

class PurchasingService {
  private static instance: PurchasingService;

  private constructor() {}

  public static getInstance(): PurchasingService {
    if (!PurchasingService.instance) {
      PurchasingService.instance = new PurchasingService();
    }
    return PurchasingService.instance;
  }

  public async getAll(institutionId?: string): Promise<Purchasing[]> {
    const params: any = {
      populate: ['institution', 'invoice']
    };
    
    if (institutionId) {
      params['filters[institution][documentId][$eq]'] = institutionId;
    }

    const response = await axiosClient.get('/api/purchasings', { params });
    return response.data.data;
  }

  public async getOne(id: string): Promise<Purchasing> {
    const response = await axiosClient.get(`/api/purchasings/${id}`, {
      params: {
        populate: ['institution', 'invoice']
      }
    });
    return response.data.data;
  }

  public async create(data: CreatePurchasingDTO): Promise<Purchasing> {
    const response = await axiosClient.post('/api/purchasings', { data });
    return response.data.data;
  }

  public async update(id: string, data: Partial<CreatePurchasingDTO>): Promise<Purchasing> {
    const response = await axiosClient.put(`/api/purchasings/${id}`, { data });
    return response.data.data;
  }

  public async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/purchasings/${id}`);
  }
}

export const purchasingService = PurchasingService.getInstance();


