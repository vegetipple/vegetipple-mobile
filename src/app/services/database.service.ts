import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface Product {
  id: number;
  productname: string;
  boozetype: string;
  redyellowgreen: string;
  companyid: number;
  companyname?: string;
  company_status?: string;
  city?: string;
  country?: string;
  notes?: string;
  url?: string;
  updatedon?: string;
  notesExpanded?: boolean;
}

export interface Company {
  id: number;
  companyname: string;
  redyellowgreen: string;
  city?: string;
  country?: string;
  notes?: string;
  url?: string;
  updatedon?: string;
}

export interface SearchResult {
  productname: string;
  boozetype: string;
  redyellowgreen: string;
  companyname: string;
  type: 'product' | 'company';
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  constructor() {}

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if platform supports SQLite
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative) {
        // For native platforms, copy database from assets
        await this.copyDatabaseFromAssets();
      } else {
        // For web platform, use different approach
        await this.loadDatabaseForWeb();
      }

      this.db = await this.sqlite.createConnection('barnivore', false, 'no-encryption', 1, false);
      await this.db.open();
      
      // Test the connection
      const result = await this.db.query('SELECT COUNT(*) as count FROM product');
      console.log('Database loaded with', result.values?.[0]?.count, 'products');
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async copyDatabaseFromAssets(): Promise<void> {
    // Copy database from assets to app directory
    await this.sqlite.copyFromAssets(true);
  }

  private async loadDatabaseForWeb(): Promise<void> {
    // For web platform, we'll use the HTTP approach similar to original
    // This is a simplified version - you might want to use sql.js like the original
    throw new Error('Web platform database loading not implemented yet');
  }

  async searchSuggestions(query: string): Promise<SearchResult[]> {
    if (!this.db || !this.isInitialized) {
      await this.initializeDatabase();
    }

    const searchTerm = `%${query}%`;
    
    const sql = `
      SELECT DISTINCT 
        p.productname,
        p.boozetype,
        p.redyellowgreen,
        c.companyname,
        'product' as type
      FROM product p
      JOIN company c ON p.companyid = c.id
      WHERE p.productname LIKE ? OR c.companyname LIKE ?
      UNION
      SELECT DISTINCT 
        c.companyname as productname,
        '' as boozetype,
        c.redyellowgreen,
        c.companyname,
        'company' as type
      FROM company c
      WHERE c.companyname LIKE ?
      ORDER BY productname
      LIMIT 8
    `;

    try {
      const result = await this.db!.query(sql, [searchTerm, searchTerm, searchTerm]);
      return result.values || [];
    } catch (error) {
      console.error('Search suggestions failed:', error);
      return [];
    }
  }

  async getDetailedResults(query: string): Promise<Product[]> {
    if (!this.db || !this.isInitialized) {
      await this.initializeDatabase();
    }

    const searchTerm = `%${query}%`;
    
    const sql = `
      SELECT 
        p.id,
        p.productname,
        p.boozetype,
        p.redyellowgreen,
        p.companyid,
        c.companyname,
        c.redyellowgreen as company_status,
        c.city,
        c.country,
        c.notes,
        c.url,
        c.updatedon
      FROM product p
      JOIN company c ON p.companyid = c.id
      WHERE p.productname LIKE ? OR c.companyname LIKE ?
      ORDER BY p.productname
    `;

    try {
      const result = await this.db!.query(sql, [searchTerm, searchTerm]);
      return result.values || [];
    } catch (error) {
      console.error('Detailed search failed:', error);
      return [];
    }
  }

  getStatusText(status: string): string {
    if (!status) return 'Unknown';
    
    switch(status.toLowerCase()) {
      case 'green': return 'Vegan';
      case 'yellow': return 'May Not Be Vegan';
      case 'red': return 'Not Vegan';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    switch(status.toLowerCase()) {
      case 'green': return 'status-green';
      case 'yellow': return 'status-yellow';
      case 'red': return 'status-red';
      default: return 'status-unknown';
    }
  }
}