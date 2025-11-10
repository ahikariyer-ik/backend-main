import { axiosClient } from '@/libs/axios';

export interface Task {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  assignedTo: {
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
  assignedBy?: {
    id: number;
    username: string;
  };
  company?: {
    id: number;
    companyName: string;
  };
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'not_completed';
  statusNote?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  completedAt?: string;
  createdAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  priority?: 'low' | 'medium' | 'high';
}

interface StrapiResponse<T> {
  data: T;
  error?: {
    status: number;
    name: string;
    message: string;
  };
}

class TaskService {
  private static instance: TaskService;

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async getTasks(): Promise<StrapiResponse<Task[]>> {
    const response = await axiosClient.get('/api/tasks', {
      params: {
        populate: ['assignedTo', 'assignedTo.photo', 'assignedTo.department', 'assignedBy', 'company'],
        'sort[0]': 'dueDate:asc',
        'pagination[pageSize]': 100
      }
    });
    return response.data;
  }

  public async getMyTasks(): Promise<StrapiResponse<Task[]>> {
    const response = await axiosClient.get('/api/tasks/my-tasks', {
      params: {
        populate: ['assignedBy', 'company']
      }
    });
    return response.data;
  }

  public async createTask(data: CreateTaskDTO): Promise<StrapiResponse<Task>> {
    const response = await axiosClient.post('/api/tasks', { data });
    return response.data;
  }

  public async updateTask(documentId: string, data: Partial<CreateTaskDTO>): Promise<StrapiResponse<Task>> {
    const response = await axiosClient.put(`/api/tasks/${documentId}`, { data });
    return response.data;
  }

  public async updateTaskStatus(documentId: string, status: string, statusNote?: string): Promise<StrapiResponse<Task>> {
    const response = await axiosClient.put(`/api/tasks/${documentId}/status`, { status, statusNote });
    return response.data;
  }

  public async deleteTask(documentId: string): Promise<void> {
    await axiosClient.delete(`/api/tasks/${documentId}`);
  }
}

export const taskService = TaskService.getInstance();

