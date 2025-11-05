import { Link } from 'react-router-dom'
import { PenTool, FolderOpen, Zap, Shield, Database, RefreshCw } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          AI-Powered Asset Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Generate high-converting landing pages and email outreach sequences with the power of AI. 
          Save time, maintain consistency, and scale your content creation.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/generator" className="btn btn-primary">
            <PenTool className="w-4 h-4 mr-2" />
            Start Generating
          </Link>
          <Link to="/assets" className="btn btn-secondary">
            <FolderOpen className="w-4 h-4 mr-2" />
            View Assets
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Generation</h3>
          <p className="text-gray-600">
            Leverage OpenAI&apos;s advanced models to generate compelling landing page sections 
            and personalized email sequences tailored to your audience.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Caching</h3>
          <p className="text-gray-600">
            Automatic caching of repeated requests improves performance and reduces API costs. 
            Cache statistics and management included.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Error Handling & Retries</h3>
          <p className="text-gray-600">
            Robust error handling with automatic retries for invalid JSON responses and API failures. 
            Your content generation is reliable and consistent.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Easy Editing</h3>
          <p className="text-gray-600">
            View generated assets in a clean interface, edit content as needed, and save directly 
            to your project document area.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <PenTool className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Structured Output</h3>
          <p className="text-gray-600">
            All generated content follows structured schemas for landing pages and email sequences, 
            ensuring consistency and easy integration.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Asset Management</h3>
          <p className="text-gray-600">
            Organize generated assets with tags, search functionality, and status tracking. 
            Keep your content library organized and accessible.
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-6">
          Generate your first landing page or email sequence in minutes. Just provide your target audience, 
          industry, and preferences, and let AI do the rest.
        </p>
        <Link to="/generator" className="btn btn-primary">
          Generate Your First Asset
        </Link>
      </div>
    </div>
  )
}