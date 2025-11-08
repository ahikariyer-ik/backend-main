import { axiosClient } from '@/libs/axios';

export interface LeaveRequest {
  id: number;
  documentId: string;
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    photo?: {
      url: string;
    };
    department?: {
      name: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    id: number;
    username: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface CreateLeaveRequestDTO {
  worker: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
}

interface StrapiResponse<T> {
  data: T;
  error?: {
    status: number;
    name: string;
    message: string;
  };
}

class LeaveRequestService {
  private static instance: LeaveRequestService;

  private constructor() {}

  public static getInstance(): LeaveRequestService {
    if (!LeaveRequestService.instance) {
      LeaveRequestService.instance = new LeaveRequestService();
    }
    return LeaveRequestService.instance;
  }

  public async getLeaveRequests(): Promise<StrapiResponse<LeaveRequest[]>> {
    const response = await axiosClient.get('/api/leave-requests', {
      params: {
        populate: ['worker', 'worker.photo', 'worker.department', 'reviewedBy'],
        'sort[0]': 'createdAt:desc',
        'pagination[pageSize]': 100
      }
    });
    return response.data;
  }

  public async getMyLeaveRequests(workerId: string): Promise<StrapiResponse<LeaveRequest[]>> {
    const response = await axiosClient.get('/api/leave-requests', {
      params: {
        'filters[worker][documentId]': workerId,
        populate: ['worker', 'reviewedBy'],
        'sort[0]': 'createdAt:desc'
      }
    });
    return response.data;
  }

  public async getRemainingDays(workerId: string): Promise<StrapiResponse<any>> {
    const response = await axiosClient.get(`/api/leave-requests/worker/${workerId}/remaining-days`);
    return response.data;
  }

  public async createLeaveRequest(data: CreateLeaveRequestDTO): Promise<StrapiResponse<LeaveRequest>> {
    const response = await axiosClient.post('/api/leave-requests', { data });
    return response.data;
  }

  public async approveLeaveRequest(documentId: string, reviewNote?: string): Promise<StrapiResponse<LeaveRequest>> {
    const response = await axiosClient.put(`/api/leave-requests/${documentId}/approve`, { reviewNote });
    return response.data;
  }

  public async rejectLeaveRequest(documentId: string, reviewNote?: string): Promise<StrapiResponse<LeaveRequest>> {
    const response = await axiosClient.put(`/api/leave-requests/${documentId}/reject`, { reviewNote });
    return response.data;
  }
}

export const leaveRequestService = LeaveRequestService.getInstance();

