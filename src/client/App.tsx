import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AssetGeneratorPage from './pages/AssetGeneratorPage'
import AssetListPage from './pages/AssetListPage'
import AssetDetailPage from './pages/AssetDetailPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generator" element={<AssetGeneratorPage />} />
        <Route path="/assets" element={<AssetListPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
      </Routes>
    </Layout>
  )
}

export default App