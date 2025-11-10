import { axiosClient } from '@/libs/axios'

export interface OutgoingDocument {
  id: number
  documentId: string
  institution?: {
    id: number
    name: string
  }
  title: string
  sentTo: string
  sentDate?: string
  document?: {
    id: number
    url: string
    name: string
  }
  description?: string
  createdAt: string
  updatedAt: string
}

export const outgoingDocumentService = {
  async getAll(institutionId?: string): Promise<OutgoingDocument[]> {
    const params: any = {
      populate: ['institution', 'document']
    }
    if (institutionId) {
      params.institutionId = institutionId
    }
    const response = await axiosClient.get('/api/outgoing-documents', { params })
    return response.data.data
  },

  async getById(id: string): Promise<OutgoingDocument> {
    const response = await axiosClient.get(`/api/outgoing-documents/${id}`, {
      params: {
        populate: ['institution', 'document']
      }
    })
    return response.data.data
  },

  async create(data: Partial<OutgoingDocument>): Promise<OutgoingDocument> {
    const response = await axiosClient.post('/api/outgoing-documents', { data })
    return response.data.data
  },

  async update(id: string, data: Partial<OutgoingDocument>): Promise<OutgoingDocument> {
    const response = await axiosClient.put(`/api/outgoing-documents/${id}`, { data })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/api/outgoing-documents/${id}`)
  }
}



