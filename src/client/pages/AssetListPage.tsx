import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { assetsApi } from '../utils/api'
import { AssetRecord } from '../../shared/types/schemas'
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react'

export default function AssetListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'landing_page' | 'email_sequence'>('all')

  const { data: assetsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['assets', filterType, searchTerm],
    queryFn: () => {
      const params: any = {}
      if (filterType !== 'all') params.type = filterType
      if (searchTerm) params.search = searchTerm
      return assetsApi.getAssets(params)
    },
  })

  const assets = assetsResponse?.data || []

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'landing_page' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800'
  }

  if (error) {
    return (
      <div className="card p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Assets</h3>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Failed to load assets'}
        </p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-2">
            Manage your generated landing pages and email sequences
          </p>
        </div>
        <Link to="/generator" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Generate New
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="landing_page">Landing Pages</option>
              <option value="email_sequence">Email Sequences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading assets...</p>
        </div>
      )}

      {/* Assets List */}
      {!isLoading && assets.length === 0 && (
        <div className="card p-12 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Generate your first asset to get started'
            }
          </p>
          <Link to="/generator" className="btn btn-primary">
            Generate Your First Asset
          </Link>
        </div>
      )}

      {!isLoading && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset: AssetRecord) => (
            <div key={asset.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {asset.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(asset.type)}`}>
                    {asset.type === 'landing_page' ? 'Landing Page' : 'Email Sequence'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>

                {/* Asset Tags */}
                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{asset.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Updated {formatDate(asset.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Link
                    to={`/assets/${asset.id}`}
                    className="flex-1 btn btn-secondary text-sm justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <button className="btn btn-secondary text-sm">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="btn btn-danger text-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}