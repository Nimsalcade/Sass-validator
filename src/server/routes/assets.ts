import { Router, Request, Response } from 'express';
import { WriteAssetService } from '../services/writeAssetService';
import { AssetStorageService } from '../services/assetStorageService';
import { AssetGenerationRequestSchema } from '../../shared/types/schemas';

const router = Router();
const writeAssetService = new WriteAssetService();
const assetStorageService = new AssetStorageService();

// Generate new asset
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const request = AssetGenerationRequestSchema.parse(req.body);
    const result = await writeAssetService.generateAsset(request);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(400).json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Invalid request format',
    });
  }
});

// Save generated asset as a record
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { name, description, type, content, tags = [] } = req.body;
    
    if (!name || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, content',
      });
    }

    const asset = await assetStorageService.createAsset({
      name,
      description,
      type,
      content,
      status: 'draft',
      tags,
    });

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error('Error in /save:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save asset',
    });
  }
});

// Get all assets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    
    let assets;
    if (type && (type === 'landing_page' || type === 'email_sequence')) {
      assets = await assetStorageService.getAssetsByType(type);
    } else if (search && typeof search === 'string') {
      assets = await assetStorageService.searchAssets(search);
    } else {
      assets = await assetStorageService.getAllAssets();
    }

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error('Error in GET /:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assets',
    });
  }
});

// Get single asset
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await assetStorageService.getAsset(id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error('Error in GET /:id:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch asset',
    });
  }
});

// Update asset
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const asset = await assetStorageService.updateAsset(id, updates);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error('Error in PUT /:id:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update asset',
    });
  }
});

// Delete asset
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await assetStorageService.deleteAsset(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Error in DELETE /:id:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete asset',
    });
  }
});

// Get cache stats
router.get('/cache/stats', async (_req: Request, res: Response) => {
  try {
    const stats = writeAssetService.getCacheStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /cache/stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cache stats',
    });
  }
});

// Clear cache
router.post('/cache/clear', async (_req: Request, res: Response) => {
  try {
    writeAssetService.clearCache();
    res.json({
      success: true,
      data: { message: 'Cache cleared successfully' },
    });
  } catch (error) {
    console.error('Error in POST /cache/clear:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cache',
    });
  }
});

export default router;