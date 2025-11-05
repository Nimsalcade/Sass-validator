import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { assetsApi } from '../utils/api'
import { AssetGenerationResponse, AssetGenerationRequest } from '../../shared/types/schemas'
import { CheckCircle, RefreshCw, Save } from 'lucide-react'

interface GeneratedAssetViewerProps {
  data: AssetGenerationResponse
  request: AssetGenerationRequest
  onRegenerate: () => void
}

export default function GeneratedAssetViewer({ data, request, onRegenerate }: GeneratedAssetViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(data.data)
  const [assetName, setAssetName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')

  const saveMutation = useMutation({
    mutationFn: assetsApi.saveAsset,
    onSuccess: () => {
      setIsEditing(false)
      setAssetName('')
      setAssetDescription('')
    },
  })

  const handleSave = () => {
    if (!assetName.trim()) {
      alert('Please enter a name for the asset')
      return
    }

    saveMutation.mutate({
      name: assetName,
      description: assetDescription,
      type: request.type,
      content: editedContent,
      tags: [request.parameters.industry, request.parameters.targetAudience],
    })
  }

  const renderLandingPage = (content: any) => (
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

  const renderEmailSequence = (content: any) => (
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">
              {data.cached ? 'Loaded from cache' : 'Generated successfully'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRegenerate}
              className="btn btn-secondary text-sm"
              disabled={saveMutation.isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate
            </button>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary text-sm"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Asset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Content */}
      <div className="card p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Enter a descriptive name"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                placeholder="Brief description of this asset"
                rows={2}
                className="textarea"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saveMutation.isLoading || !assetName.trim()}
                className="btn btn-primary"
              >
                {saveMutation.isLoading ? 'Saving...' : 'Save to Assets'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setAssetName('')
                  setAssetDescription('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {request.type === 'landing_page' ? 'Landing Page' : 'Email Sequence'}
              </h3>
              <button
                onClick={() => setEditedContent(data.data)}
                className="btn btn-secondary text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset Changes
              </button>
            </div>
            
            {request.type === 'landing_page' 
              ? renderLandingPage(editedContent)
              : renderEmailSequence(editedContent)
            }
          </div>
        )}
      </div>

      {saveMutation.data && (
        <div className="card p-4 border-green-200 bg-green-50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-900 font-medium">
              Asset saved successfully! 
            </span>
            <a href="/assets" className="text-blue-600 hover:underline ml-2">
              View all assets
            </a>
          </div>
        </div>
      )}
    </div>
  )
}