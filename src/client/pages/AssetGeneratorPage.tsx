import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { assetsApi } from '../utils/api'
import { AssetGenerationRequest } from '../../shared/types/schemas'
import GeneratedAssetViewer from '../components/GeneratedAssetViewer'
import { Loader2, Wand2 } from 'lucide-react'

export default function AssetGeneratorPage() {
  const [request, setRequest] = useState<AssetGenerationRequest>({
    type: 'landing_page',
    parameters: {
      targetAudience: '',
      industry: '',
      tone: 'professional',
      keywords: [],
      specificRequirements: '',
    },
  })

  const [keywordsInput, setKeywordsInput] = useState('')

  const generateMutation = useMutation({
    mutationFn: assetsApi.generateAsset,
    onSuccess: (data) => {
      console.log('Generated asset:', data)
    },
    onError: (error) => {
      console.error('Generation failed:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    const finalRequest = {
      ...request,
      parameters: {
        ...request.parameters,
        keywords,
      },
    }

    generateMutation.mutate(finalRequest)
  }

  const isLoading = generateMutation.isLoading

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate New Asset</h1>
        <p className="text-gray-600 mt-2">
          Create AI-powered landing pages or email sequences tailored to your needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <select
                value={request.type}
                onChange={(e) => setRequest({ ...request, type: e.target.value as 'landing_page' | 'email_sequence' })}
                className="input"
              >
                <option value="landing_page">Landing Page</option>
                <option value="email_sequence">Email Sequence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                value={request.parameters.targetAudience}
                onChange={(e) => setRequest({
                  ...request,
                  parameters: { ...request.parameters, targetAudience: e.target.value }
                })}
                placeholder="e.g., Small business owners, B2B SaaS companies"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <input
                type="text"
                value={request.parameters.industry}
                onChange={(e) => setRequest({
                  ...request,
                  parameters: { ...request.parameters, industry: e.target.value }
                })}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={request.parameters.tone}
                onChange={(e) => setRequest({
                  ...request,
                  parameters: { ...request.parameters, tone: e.target.value as any }
                })}
                className="input"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g., conversion, sales, marketing, growth"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Requirements
              </label>
              <textarea
                value={request.parameters.specificRequirements}
                onChange={(e) => setRequest({
                  ...request,
                  parameters: { ...request.parameters, specificRequirements: e.target.value }
                })}
                placeholder="Any specific features, constraints, or requirements..."
                rows={3}
                className="textarea"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !request.parameters.targetAudience || !request.parameters.industry}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Asset
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {generateMutation.data && (
            <GeneratedAssetViewer
              data={generateMutation.data}
              request={request}
              onRegenerate={() => generateMutation.mutate(request)}
            />
          )}

          {generateMutation.error && (
            <div className="card p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Generation Failed</h3>
              <p className="text-red-700">
                {generateMutation.error instanceof Error 
                  ? generateMutation.error.message 
                  : 'An unknown error occurred'
                }
              </p>
              <button
                onClick={() => generateMutation.mutate(request)}
                className="btn btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          )}

          {!generateMutation.data && !generateMutation.error && !isLoading && (
            <div className="card p-12 text-center">
              <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600">
                Fill out the form and click &quot;Generate Asset&quot; to create your AI-powered content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}