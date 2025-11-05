import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '../utils/api'
import { AssetRecord } from '../../shared/types/schemas'
import { ArrowLeft, Edit, Save, X, Calendar, Tag, FileText } from 'lucide-react'

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedAsset, setEditedAsset] = useState<Partial<AssetRecord>>({})

  const { data: assetResponse, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetsApi.getAsset(id!),
    enabled: !!id,
  })

  const asset = assetResponse?.data

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AssetRecord> }) =>
      assetsApi.updateAsset(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: assetsApi.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      navigate('/assets')
    },
  })

  const handleEdit = () => {
    if (asset) {
      setEditedAsset({
        name: asset.name,
        description: asset.description,
        status: asset.status,
        tags: asset.tags,
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (id && editedAsset) {
      updateMutation.mutate({ id, updates: editedAsset })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedAsset({})
  }

  const handleDelete = () => {
    if (id && asset && window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const renderLandingPageContent = (content: any) => (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
        <p className="text-gray-600 mt-2">{content.description}</p>
      </div>
      
      <div className="space-y-4">
        {content.sections?.map((section: any, index: number) => (
          <div key={section.id || index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {section.type}
              </span>
            </div>
            {section.subtitle && (
              <p className="text-gray-700 font-medium mb-2">{section.subtitle}</p>
            )}
            <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderEmailSequenceContent = (content: any) => (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{content.name}</h2>
        <p className="text-gray-600 mt-2">{content.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
            Audience: {content.targetAudience}
          </span>
          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
            Goal: {content.goal}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {content.steps?.map((step: any, index: number) => (
          <div key={step.id || index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Step {step.stepNumber}: {step.purpose.replace('_', ' ')}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {step.purpose}
                </span>
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Day {step.sendDelayDays}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700">Subject:</label>
              <p className="text-gray-900 font-medium">{step.subject}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Body:</label>
              <div className="mt-1 p-3 bg-gray-50 rounded border">
                <p className="text-gray-700 whitespace-pre-wrap">{step.body}</p>
              </div>
            </div>
            
            {step.personalizationTokens?.length > 0 && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700">Personalization Tokens:</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {step.personalizationTokens.map((token: string, i: number) => (
                    <span key={i} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="card p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading asset...</p>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="card p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Asset Not Found</h3>
        <p className="text-red-700 mb-4">
          The requested asset could not be found or an error occurred.
        </p>
        <Link to="/assets" className="btn btn-primary">
          Back to Assets
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/assets" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`text-sm px-2 py-1 rounded ${
                asset.type === 'landing_page' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {asset.type === 'landing_page' ? 'Landing Page' : 'Email Sequence'}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                asset.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : asset.status === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {asset.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button onClick={handleEdit} className="btn btn-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSave} 
                disabled={updateMutation.isLoading}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Asset Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            {isEditing ? (
              <textarea
                value={editedAsset.description || ''}
                onChange={(e) => setEditedAsset({ ...editedAsset, description: e.target.value })}
                className="textarea"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">
                {asset.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FileText className="w-5 h-5 mr-2 inline" />
              Content
            </h2>
            {asset.type === 'landing_page' 
              ? renderLandingPageContent(asset.content)
              : renderEmailSequenceContent(asset.content)
            }
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            {isEditing ? (
              <select
                value={editedAsset.status || asset.status}
                onChange={(e) => setEditedAsset({ ...editedAsset, status: e.target.value as any })}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                asset.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : asset.status === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {asset.status}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Tag className="w-5 h-5 mr-2 inline" />
              Tags
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={editedAsset.tags?.join(', ') || asset.tags.join(', ')}
                onChange={(e) => setEditedAsset({ 
                  ...editedAsset, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                placeholder="Enter tags separated by commas"
                className="input"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {asset.tags.length > 0 ? (
                  asset.tags.map((tag, index) => (
                    <span key={index} className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No tags</p>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="w-5 h-5 mr-2 inline" />
              Dates
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="text-gray-900">
                  {new Date(asset.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <p className="text-gray-900">
                  {new Date(asset.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}