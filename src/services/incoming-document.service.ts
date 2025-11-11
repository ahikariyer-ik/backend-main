import { axiosClient } from '@/libs/axios'

export interface IncomingDocument {
  id: number
  documentId: string
  institution?: {
    id: number
    name: string
  }
  title: string
  receivedFrom: string
  receivedDate?: string
  document?: {
    id: number
    url: string
    name: string
  }
  description?: string
  createdAt: string
  updatedAt: string
}

export const incomingDocumentService = {
  async getAll(institutionId?: string): Promise<IncomingDocument[]> {
    const params: any = {
      populate: ['institution', 'document']
    }
    if (institutionId) {
      params.institutionId = institutionId
    }
    const response = await axiosClient.get('/api/incoming-documents', { params })
    return response.data.data
  },

  async getById(id: string): Promise<IncomingDocument> {
    const response = await axiosClient.get(`/api/incoming-documents/${id}`, {
      params: {
        populate: ['institution', 'document']
      }
    })
    return response.data.data
  },

  async create(data: Partial<IncomingDocument>): Promise<IncomingDocument> {
    const response = await axiosClient.post('/api/incoming-documents', { data })
    return response.data.data
  },

  async update(id: string, data: Partial<IncomingDocument>): Promise<IncomingDocument> {
    const response = await axiosClient.put(`/api/incoming-documents/${id}`, { data })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/incoming-documents/${id}`)
  }
}




