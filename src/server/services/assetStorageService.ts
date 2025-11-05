import { AssetRecord, AssetRecordSchema } from '../../shared/types/schemas';
import { v4 as uuidv4 } from 'uuid';

export class AssetStorageService {
  private assets: Map<string, AssetRecord> = new Map();

  public async createAsset(assetData: Omit<AssetRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetRecord> {
    const now = new Date();
    const asset: AssetRecord = {
      id: uuidv4(),
      ...assetData,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the asset
    const validatedAsset = AssetRecordSchema.parse(asset);
    
    this.assets.set(validatedAsset.id, validatedAsset);
    
    return validatedAsset;
  }

  public async updateAsset(id: string, updates: Partial<Omit<AssetRecord, 'id' | 'createdAt'>>): Promise<AssetRecord | null> {
    const existingAsset = this.assets.get(id);
    
    if (!existingAsset) {
      return null;
    }

    const updatedAsset: AssetRecord = {
      ...existingAsset,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate the updated asset
    const validatedAsset = AssetRecordSchema.parse(updatedAsset);
    
    this.assets.set(id, validatedAsset);
    
    return validatedAsset;
  }

  public async deleteAsset(id: string): Promise<boolean> {
    return this.assets.delete(id);
  }

  public async getAsset(id: string): Promise<AssetRecord | null> {
    return this.assets.get(id) || null;
  }

  public async getAllAssets(): Promise<AssetRecord[]> {
    return Array.from(this.assets.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  public async getAssetsByType(type: 'landing_page' | 'email_sequence'): Promise<AssetRecord[]> {
    return Array.from(this.assets.values())
      .filter(asset => asset.type === type)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public async searchAssets(query: string): Promise<AssetRecord[]> {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.assets.values())
      .filter(asset => 
        asset.name.toLowerCase().includes(lowercaseQuery) ||
        asset.description.toLowerCase().includes(lowercaseQuery) ||
        asset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public getAssetCount(): number {
    return this.assets.size;
  }

  public clearAllAssets(): void {
    this.assets.clear();
  }
}