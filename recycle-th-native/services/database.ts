import * as SQLite from 'expo-sqlite';
import { AnalysisResult } from '../types/navigation';

const db = SQLite.openDatabaseSync('recycle.db');

export interface CachedLocation {
  id: string;
  name: string;
  address: string;
  accepts: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
  lastUpdated: string;
}

export interface CachedScan {
  id: string;
  imageUri?: string;
  barcode?: string;
  analysisJson: string;
  timestamp: string;
}

export class Database {
  static async initialize() {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        accepts TEXT,
        hours TEXT,
        phone TEXT,
        lat REAL,
        lng REAL,
        lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        imageUri TEXT,
        barcode TEXT,
        analysisJson TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recyclable_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        category TEXT,
        is_recyclable INTEGER,
        preparation TEXT,
        notes TEXT,
        lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pending_api_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp);
      CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
      CREATE INDEX IF NOT EXISTS idx_recyclable_items_name ON recyclable_items(item_name);
    `);
  }

  static async cacheLocations(locations: any[]) {
    const stmt = await db.prepareAsync(
      'INSERT OR REPLACE INTO locations (id, name, address, accepts, hours, phone, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    try {
      for (const location of locations) {
        await stmt.executeAsync([
          location.id,
          location.name,
          location.address,
          JSON.stringify(location.accepts),
          location.hours,
          location.phone,
          location.lat,
          location.lng,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  }

  static async getLocations(): Promise<CachedLocation[]> {
    const result = await db.getAllAsync('SELECT * FROM locations ORDER BY name');
    return result.map((row: any) => ({
      ...row,
      accepts: JSON.parse(row.accepts || '[]'),
    }));
  }

  static async cacheScan(scan: {
    imageUri?: string;
    barcode?: string;
    analysis: AnalysisResult;
  }): Promise<string> {
    const id = Date.now().toString();
    await db.runAsync(
      'INSERT INTO scans (id, imageUri, barcode, analysisJson) VALUES (?, ?, ?, ?)',
      [id, scan.imageUri || null, scan.barcode || null, JSON.stringify(scan.analysis)]
    );
    return id;
  }

  static async getRecentScans(limit: number = 100): Promise<CachedScan[]> {
    const result = await db.getAllAsync(
      'SELECT * FROM scans ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return result as CachedScan[];
  }

  static async searchRecyclableItems(query: string) {
    const result = await db.getAllAsync(
      'SELECT * FROM recyclable_items WHERE item_name LIKE ? OR category LIKE ? LIMIT 20',
      [`%${query}%`, `%${query}%`]
    );
    return result;
  }

  static async queueApiCall(endpoint: string, method: string, payload?: any) {
    await db.runAsync(
      'INSERT INTO pending_api_calls (endpoint, method, payload) VALUES (?, ?, ?)',
      [endpoint, method, JSON.stringify(payload)]
    );
  }

  static async getPendingApiCalls() {
    const result = await db.getAllAsync(
      'SELECT * FROM pending_api_calls ORDER BY timestamp ASC'
    );
    return result;
  }

  static async deletePendingApiCall(id: number) {
    await db.runAsync('DELETE FROM pending_api_calls WHERE id = ?', [id]);
  }

  static async syncWithCSV(csvData: string[]) {
    // Parse and insert CSV data into recyclable_items table
    const stmt = await db.prepareAsync(
      'INSERT OR REPLACE INTO recyclable_items (item_name, category, is_recyclable, preparation, notes) VALUES (?, ?, ?, ?, ?)'
    );

    try {
      for (const row of csvData) {
        const [itemName, category, isRecyclable, preparation, notes] = row.split(',');
        await stmt.executeAsync([
          itemName,
          category,
          isRecyclable === 'true' ? 1 : 0,
          preparation,
          notes,
        ]);
      }
    } finally {
      await stmt.finalizeAsync();
    }
  }

  static async clearOldData(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTimestamp = cutoffDate.toISOString();

    await db.runAsync('DELETE FROM scans WHERE timestamp < ?', [cutoffTimestamp]);
  }
}