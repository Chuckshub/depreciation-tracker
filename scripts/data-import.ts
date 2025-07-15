import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { Asset } from '../types/asset';
import { CSVParser } from './csv-parser';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration - these should match your .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export class DataImporter {
  private static async clearCollection(collectionName: string): Promise<number> {
    console.log(`Clearing collection: ${collectionName}`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, collectionName, docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${snapshot.docs.length} documents from ${collectionName}`);
    return snapshot.docs.length;
  }
  
  private static async importAssets(assets: Asset[]): Promise<number> {
    console.log(`Importing ${assets.length} assets...`);
    
    const collectionRef = collection(db, 'assets');
    let imported = 0;
    
    // Import in batches to avoid overwhelming Firestore
    const batchSize = 10;
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      
      const importPromises = batch.map(async (asset) => {
        try {
          await addDoc(collectionRef, asset);
          imported++;
          console.log(`Imported: ${asset.asset}`);
        } catch (error) {
          console.error(`Failed to import asset: ${asset.asset}`, error);
        }
      });
      
      await Promise.all(importPromises);
      
      // Small delay between batches
      if (i + batchSize < assets.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Successfully imported ${imported} assets`);
    return imported;
  }
  
  public static async importFromCSV(csvPath: string, clearExisting: boolean = true): Promise<void> {
    try {
      console.log('Starting data import process...');
      
      // Validate Firebase configuration
      if (!firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your environment variables.');
      }
      
      console.log(`Connected to Firebase project: ${firebaseConfig.projectId}`);
      
      // Clear existing data if requested
      if (clearExisting) {
        await this.clearCollection('assets');
      }
      
      // Parse CSV file
      console.log(`\nParsing CSV file: ${csvPath}`);
      const assets = CSVParser.parseCSVToAssets(csvPath);
      
      if (assets.length === 0) {
        console.log('No assets found in CSV file.');
        return;
      }
      
      // Validate assets
      console.log('\nValidating assets...');
      const { valid, invalid } = CSVParser.validateAssets(assets);
      
      if (invalid.length > 0) {
        console.log(`\nWarning: Found ${invalid.length} invalid assets that will be skipped:`);
        invalid.forEach(item => {
          console.log(`  - Row ${item.index + 2}: ${item.errors.join(', ')}`);
        });
      }
      
      if (valid.length === 0) {
        console.log('No valid assets to import.');
        return;
      }
      
      // Import valid assets
      console.log(`\nImporting ${valid.length} valid assets...`);
      const imported = await this.importAssets(valid);
      
      console.log('\n=== Import Summary ===');
      console.log(`Total rows processed: ${assets.length}`);
      console.log(`Valid assets: ${valid.length}`);
      console.log(`Invalid assets: ${invalid.length}`);
      console.log(`Successfully imported: ${imported}`);
      console.log('Import process completed!');
      
    } catch (error) {
      console.error('Import process failed:', error);
      throw error;
    }
  }
  
  public static async importFromJSON(jsonPath: string, clearExisting: boolean = true): Promise<void> {
    try {
      console.log('Starting JSON import process...');
      
      // Validate Firebase configuration
      if (!firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your environment variables.');
      }
      
      console.log(`Connected to Firebase project: ${firebaseConfig.projectId}`);
      
      // Clear existing data if requested
      if (clearExisting) {
        await this.clearCollection('assets');
      }
      
      // Read JSON file
      console.log(`\nReading JSON file: ${jsonPath}`);
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(jsonContent);
      
      let assets: Asset[];
      if (Array.isArray(data)) {
        assets = data;
      } else if (data.assets && Array.isArray(data.assets)) {
        assets = data.assets;
      } else {
        throw new Error('Invalid JSON format. Expected array of assets or object with assets property.');
      }
      
      if (assets.length === 0) {
        console.log('No assets found in JSON file.');
        return;
      }
      
      // Validate assets
      console.log('\nValidating assets...');
      const { valid, invalid } = CSVParser.validateAssets(assets);
      
      if (invalid.length > 0) {
        console.log(`\nWarning: Found ${invalid.length} invalid assets that will be skipped:`);
        invalid.forEach(item => {
          console.log(`  - Asset ${item.index + 1}: ${item.errors.join(', ')}`);
        });
      }
      
      if (valid.length === 0) {
        console.log('No valid assets to import.');
        return;
      }
      
      // Import valid assets
      console.log(`\nImporting ${valid.length} valid assets...`);
      const imported = await this.importAssets(valid);
      
      console.log('\n=== Import Summary ===');
      console.log(`Total assets processed: ${assets.length}`);
      console.log(`Valid assets: ${valid.length}`);
      console.log(`Invalid assets: ${invalid.length}`);
      console.log(`Successfully imported: ${imported}`);
      console.log('Import process completed!');
      
    } catch (error) {
      console.error('Import process failed:', error);
      throw error;
    }
  }
  
  public static async getCollectionStats(): Promise<void> {
    try {
      const collectionRef = collection(db, 'assets');
      const snapshot = await getDocs(collectionRef);
      
      console.log('\n=== Current Database Stats ===');
      console.log(`Total assets in database: ${snapshot.docs.length}`);
      
      if (snapshot.docs.length > 0) {
        console.log('\nSample assets:');
        snapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`  ${index + 1}. ${data.asset} (${data.department})`);
        });
        
        if (snapshot.docs.length > 3) {
          console.log(`  ... and ${snapshot.docs.length - 3} more`);
        }
      }
    } catch (error) {
      console.error('Failed to get collection stats:', error);
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage:');
    console.log('  ts-node data-import.ts <csv-file-path> [--keep-existing]');
    console.log('  ts-node data-import.ts --json <json-file-path> [--keep-existing]');
    console.log('  ts-node data-import.ts --stats');
    console.log('');
    console.log('Options:');
    console.log('  --keep-existing  Do not clear existing data before import');
    console.log('  --stats         Show current database statistics');
    process.exit(1);
  }
  
  async function main() {
    try {
      // Load environment variables
      require('dotenv').config({ path: '.env.local' });
      
      if (args[0] === '--stats') {
        await DataImporter.getCollectionStats();
        return;
      }
      
      const clearExisting = !args.includes('--keep-existing');
      
      if (args[0] === '--json') {
        if (args.length < 2) {
          console.error('JSON file path is required when using --json flag');
          process.exit(1);
        }
        await DataImporter.importFromJSON(args[1], clearExisting);
      } else {
        await DataImporter.importFromCSV(args[0], clearExisting);
      }
    } catch (error) {
      console.error('Import failed:', error);
      process.exit(1);
    }
  }
  
  main();
}
