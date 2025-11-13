import { axiosClient } from '@/libs/axios'

export interface Reminder {
  id: number
  documentId: string
  title: string
  description?: string
  reminderDate: string
  reminderType: 'dask_policy' | 'vehicle_insurance' | 'vehicle_inspection' | 'custom'
  phoneNumber?: string
  message?: string
  isSent: boolean
  sentAt?: string
  status: 'pending' | 'sent' | 'failed'
  relatedProperty?: {
    id: number
    address?: string
    institution?: {
      id: number
      name: string
    }
  }
  relatedVehicle?: {
    id: number
    plateNumber: string
    model: string
    institution?: {
      id: number
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

export const reminderService = {
  async getAll(): Promise<Reminder[]> {
    const response = await axiosClient.get('/api/reminders', {
      params: {
        populate: ['relatedProperty', 'relatedVehicle', 'relatedProperty.institution', 'relatedVehicle.institution']
      }
    })
    return response.data.data
  },

  async getById(id: string): Promise<Reminder> {
    const response = await axiosClient.get(`/api/reminders/${id}`, {
      params: {
        populate: ['relatedProperty', 'relatedVehicle', 'relatedProperty.institution', 'relatedVehicle.institution']
      }
    })
    return response.data.data
  },

  async create(data: Partial<Reminder>): Promise<Reminder> {
    const response = await axiosClient.post('/api/reminders', { data })
    return response.data.data
  },

  async update(id: string, data: Partial<Reminder>): Promise<Reminder> {
    const response = await axiosClient.put(`/api/reminders/${id}`, { data })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/reminders/${id}`)
  },

  async sendWhatsApp(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosClient.post(`/api/reminders/${id}/send-whatsapp`)
    return response.data
  },

  async syncReminders(): Promise<{ success: boolean; message: string; createdCount: number }> {
    const response = await axiosClient.post('/api/reminders/sync')
    return response.data
  }
}


