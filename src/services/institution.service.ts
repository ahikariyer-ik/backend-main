import { axiosClient } from '@/libs/axios'

export interface Institution {
  id: number
  documentId: string
  name: string
  address: string
  foundationDate: string
  taxNumber: string
  sgkRegistrationNumber?: string
  itoRegistrationNumber?: string
  activityReport?: {
    id: number
    url: string
    name: string
  }
  foundationDeed?: {
    id: number
    url: string
    name: string
  }
  internalAuditReports?: Array<{
    id: number
    url: string
    name: string
  }>
  signatureCircular?: {
    id: number
    url: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export const institutionService = {
  async getAll(): Promise<Institution[]> {
    const response = await axiosClient.get('/api/institutions', {
      params: {
        populate: ['activityReport', 'foundationDeed', 'internalAuditReports', 'signatureCircular']
      }
    })
    return response.data.data
  },

  async getById(id: string): Promise<Institution> {
    const response = await axiosClient.get(`/api/institutions/${id}`, {
      params: {
        populate: ['activityReport', 'foundationDeed', 'internalAuditReports', 'signatureCircular']
      }
    })
    return response.data.data
  },

  async create(data: Partial<Institution>): Promise<Institution> {
    const response = await axiosClient.post('/api/institutions', { data })
    return response.data.data
  },

  async update(id: string, data: Partial<Institution>): Promise<Institution> {
    const response = await axiosClient.put(`/api/institutions/${id}`, { data })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/institutions/${id}`)
  }
}



