import axios from 'axios'
import { 
  AssetGenerationRequest, 
  AssetGenerationResponse,
  AssetRecord,
  AssetListResponse
} from '../../shared/types/schemas'

const api = axios.create({
  baseURL: '/api/assets',
  timeout: 120000, // 2 minutes timeout for AI generation
})

export const assetsApi = {
  // Generate new asset
  generateAsset: async (request: AssetGenerationRequest): Promise<AssetGenerationResponse> => {
    const response = await api.post('/generate', request)
    return response.data
  },

  // Save generated asset
  saveAsset: async (assetData: {
    name: string
    description: string
    type: 'landing_page' | 'email_sequence'
    content: any
    tags?: string[]
  }): Promise<{ success: boolean; data: AssetRecord }> => {
    const response = await api.post('/save', assetData)
    return response.data
  },

  // Get all assets
  getAssets: async (params?: {
    type?: 'landing_page' | 'email_sequence'
    search?: string
  }): Promise<AssetListResponse> => {
    const response = await api.get('/', { params })
    return response.data
  },

  // Get single asset
  getAsset: async (id: string): Promise<{ success: boolean; data: AssetRecord }> => {
    const response = await api.get(`/${id}`)
    return response.data
  },

  // Update asset
  updateAsset: async (id: string, updates: Partial<AssetRecord>): Promise<{ success: boolean; data: AssetRecord }> => {
    const response = await api.put(`/${id}`, updates)
    return response.data
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<{ success: boolean; data: { id: string } }> => {
    const response = await api.delete(`/${id}`)
    return response.data
  },

  // Get cache stats
  getCacheStats: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/cache/stats')
    return response.data
  },

  // Clear cache
  clearCache: async (): Promise<{ success: boolean; data: { message: string } }> => {
    const response = await api.post('/cache/clear')
    return response.data
  },
}