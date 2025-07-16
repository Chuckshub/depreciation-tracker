// Local storage utility for development when Firebase is not configured
import { Asset } from '../types/asset';

const ASSETS_KEY = 'depreciation-tracker-assets';

export class LocalStorageDB {
  static saveAssets(assets: Asset[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    }
  }

  static getAssets(): Asset[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ASSETS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored assets:', error);
        }
      }
    }
    return [];
  }

  static clearAssets(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ASSETS_KEY);
    }
  }

  static addAssets(newAssets: Asset[]): void {
    const existing = this.getAssets();
    const combined = [...existing, ...newAssets];
    this.saveAssets(combined);
  }
}
