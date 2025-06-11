import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import initSqlJs, { Database } from 'sql.js';

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
  private webDb: Database | null = null;
  private isInitialized = false;
  private useFallbackData = false;
  private isWebPlatform = false;
  
  // Fallback data for web when SQLite fails
  private fallbackCompanies = [
    { id: 1, companyname: 'Guinness', redyellowgreen: 'green', city: 'Dublin', country: 'Ireland', notes: 'All Guinness products are vegan friendly.', url: 'guinness.com', updatedon: '2024-01-01' },
    { id: 2, companyname: 'Heineken', redyellowgreen: 'green', city: 'Amsterdam', country: 'Netherlands', notes: 'Heineken products are vegan.', url: 'heineken.com', updatedon: '2024-01-01' },
    { id: 3, companyname: 'Corona', redyellowgreen: 'yellow', city: 'Mexico City', country: 'Mexico', notes: 'Some Corona products may contain animal-derived ingredients.', url: 'corona.com', updatedon: '2024-01-01' },
    { id: 4, companyname: 'Budweiser', redyellowgreen: 'red', city: 'St. Louis', country: 'USA', notes: 'Contains isinglass (fish bladder) for clarification.', url: 'budweiser.com', updatedon: '2024-01-01' }
  ];
  
  private fallbackProducts = [
    { id: 1, productname: 'Guinness Draught', boozetype: 'Stout', redyellowgreen: 'green', companyid: 1 },
    { id: 2, productname: 'Guinness Extra Stout', boozetype: 'Stout', redyellowgreen: 'green', companyid: 1 },
    { id: 3, productname: 'Heineken Lager', boozetype: 'Lager', redyellowgreen: 'green', companyid: 2 },
    { id: 4, productname: 'Heineken 0.0', boozetype: 'Non-Alcoholic', redyellowgreen: 'green', companyid: 2 },
    { id: 5, productname: 'Corona Extra', boozetype: 'Lager', redyellowgreen: 'yellow', companyid: 3 },
    { id: 6, productname: 'Corona Light', boozetype: 'Light Beer', redyellowgreen: 'yellow', companyid: 3 },
    { id: 7, productname: 'Budweiser', boozetype: 'Lager', redyellowgreen: 'red', companyid: 4 },
    { id: 8, productname: 'Bud Light', boozetype: 'Light Beer', redyellowgreen: 'red', companyid: 4 }
  ];

  constructor() {}

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Starting database initialization...');
      
      // Check if platform supports SQLite
      const isNative = Capacitor.isNativePlatform();
      console.log('Platform is native:', isNative);
      this.isWebPlatform = !isNative;
      
      if (isNative) {
        // For native platforms, copy database from assets
        await this.copyDatabaseFromAssets();
        
        console.log('Creating database connection...');
        this.db = await this.sqlite.createConnection('barnivore.db', false, 'no-encryption', 1, false);
        
        console.log('Opening database...');
        await this.db.open();
        
        // Test the connection
        console.log('Testing database connection...');
        const result = await this.db.query('SELECT COUNT(*) as count FROM product');
        console.log('Database loaded with', result.values?.[0]?.count, 'products');
      } else {
        // For web platform, use sql.js
        console.log('Web platform detected, loading SQLite database with sql.js');
        await this.loadWebDatabase();
        
        // Test the connection
        console.log('Testing web database connection...');
        const result = this.webDb!.exec('SELECT COUNT(*) as count FROM product');
        const count = result.length > 0 ? result[0].values[0][0] : 0;
        console.log('Database loaded with', count, 'products');
      }
      
      this.isInitialized = true;
      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Database initialization failed, falling back to sample data:', error);
      // Always fall back to sample data on any error
      this.useFallbackData = true;
      this.isInitialized = true;
      console.log('Using fallback data with', this.fallbackProducts.length, 'products');
    }
  }

  private async copyDatabaseFromAssets(): Promise<void> {
    try {
      console.log('Attempting to copy database from assets...');
      
      // Simple copy from assets
      await this.sqlite.copyFromAssets(true);
      console.log('Database copied successfully from assets');
    } catch (error) {
      console.error('Failed to copy database from assets:', error);
      throw error;
    }
  }

  private async loadWebDatabase(): Promise<void> {
    try {
      console.log('Loading database for web platform with sql.js...');
      
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => `assets/${file}`
      });
      console.log('sql.js initialized');
      
      // Fetch the database file
      console.log('Fetching database file...');
      const response = await fetch('assets/barnivore.db');
      if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.status}`);
      }
      
      const dbData = await response.arrayBuffer();
      console.log('Database file loaded, size:', dbData.byteLength);
      
      // Create database instance
      this.webDb = new SQL.Database(new Uint8Array(dbData));
      console.log('Database instance created successfully');
      
    } catch (error) {
      console.error('Failed to load web database:', error);
      throw error;
    }
  }

  private async createTablesAndSampleData(): Promise<void> {
    try {
      console.log('Creating tables and sample data for web...');
      
      // Create company table
      await this.db!.execute(`
        CREATE TABLE IF NOT EXISTS company (
          id INTEGER PRIMARY KEY,
          companyname TEXT,
          redyellowgreen TEXT,
          city TEXT,
          country TEXT,
          notes TEXT,
          url TEXT,
          updatedon TEXT
        )
      `);
      
      // Create product table
      await this.db!.execute(`
        CREATE TABLE IF NOT EXISTS product (
          id INTEGER PRIMARY KEY,
          productname TEXT,
          boozetype TEXT,
          redyellowgreen TEXT,
          companyid INTEGER,
          FOREIGN KEY (companyid) REFERENCES company (id)
        )
      `);
      
      // Insert sample company data
      await this.db!.execute(`
        INSERT OR REPLACE INTO company (id, companyname, redyellowgreen, city, country, notes, url, updatedon) VALUES
        (1, 'Guinness', 'green', 'Dublin', 'Ireland', 'All Guinness products are vegan friendly.', 'guinness.com', '2024-01-01'),
        (2, 'Heineken', 'green', 'Amsterdam', 'Netherlands', 'Heineken products are vegan.', 'heineken.com', '2024-01-01'),
        (3, 'Corona', 'yellow', 'Mexico City', 'Mexico', 'Some Corona products may contain animal-derived ingredients.', 'corona.com', '2024-01-01'),
        (4, 'Budweiser', 'red', 'St. Louis', 'USA', 'Contains isinglass (fish bladder) for clarification.', 'budweiser.com', '2024-01-01')
      `);
      
      // Insert sample product data
      await this.db!.execute(`
        INSERT OR REPLACE INTO product (id, productname, boozetype, redyellowgreen, companyid) VALUES
        (1, 'Guinness Draught', 'Stout', 'green', 1),
        (2, 'Guinness Extra Stout', 'Stout', 'green', 1),
        (3, 'Heineken Lager', 'Lager', 'green', 2),
        (4, 'Heineken 0.0', 'Non-Alcoholic', 'green', 2),
        (5, 'Corona Extra', 'Lager', 'yellow', 3),
        (6, 'Corona Light', 'Light Beer', 'yellow', 3),
        (7, 'Budweiser', 'Lager', 'red', 4),
        (8, 'Bud Light', 'Light Beer', 'red', 4)
      `);
      
      console.log('Sample data inserted successfully');
      
    } catch (error) {
      console.error('Failed to create tables and sample data:', error);
      throw error;
    }
  }

  async searchSuggestions(query: string, filter: 'all' | 'beer' | 'wine' | 'liquor' = 'all'): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }

    if (this.useFallbackData) {
      return this.searchFallbackSuggestions(query, filter);
    }

    const searchTerm = `%${query}%`;
    const typeFilter = this.getBeverageTypeFilter(filter);
    
    let sql = `
      SELECT DISTINCT 
        p.productname,
        p.boozetype,
        p.redyellowgreen,
        c.companyname,
        'product' as type
      FROM product p
      JOIN company c ON p.companyid = c.id
      WHERE (p.productname LIKE ? OR c.companyname LIKE ?)
    `;
    
    if (typeFilter) {
      sql += ` AND (${typeFilter})`;
    }
    
    sql += `
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
      if (this.isWebPlatform && this.webDb) {
        // Use sql.js for web
        const stmt = this.webDb.prepare(sql);
        stmt.bind([searchTerm, searchTerm, searchTerm]);
        
        // Convert sql.js result to our format
        const results: SearchResult[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          results.push({
            productname: row['productname'] as string,
            boozetype: row['boozetype'] as string,
            redyellowgreen: row['redyellowgreen'] as string,
            companyname: row['companyname'] as string,
            type: row['type'] as 'product' | 'company'
          });
        }
        stmt.free();
        return results;
      } else {
        // Use native SQLite
        const result = await this.db!.query(sql, [searchTerm, searchTerm, searchTerm]);
        return result.values || [];
      }
    } catch (error) {
      console.error('Search suggestions failed:', error);
      return [];
    }
  }

  private searchFallbackSuggestions(query: string, filter: 'all' | 'beer' | 'wine' | 'liquor' = 'all'): SearchResult[] {
    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search products
    this.fallbackProducts.forEach(product => {
      const company = this.fallbackCompanies.find(c => c.id === product.companyid);
      if (company && (
        product.productname.toLowerCase().includes(searchTerm) ||
        company.companyname.toLowerCase().includes(searchTerm)
      )) {
        // Apply filter
        if (filter !== 'all' && !this.matchesBeverageType(product.boozetype, filter)) {
          return;
        }
        
        results.push({
          productname: product.productname,
          boozetype: product.boozetype,
          redyellowgreen: product.redyellowgreen,
          companyname: company.companyname,
          type: 'product'
        });
      }
    });

    // Search companies
    this.fallbackCompanies.forEach(company => {
      if (company.companyname.toLowerCase().includes(searchTerm)) {
        results.push({
          productname: company.companyname,
          boozetype: '',
          redyellowgreen: company.redyellowgreen,
          companyname: company.companyname,
          type: 'company'
        });
      }
    });

    return results.slice(0, 8);
  }

  async getDetailedResults(query: string, filter: 'all' | 'beer' | 'wine' | 'liquor' = 'all'): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }

    if (this.useFallbackData) {
      return this.getFallbackDetailedResults(query, filter);
    }

    const searchTerm = `%${query}%`;
    const typeFilter = this.getBeverageTypeFilter(filter);
    
    let sql = `
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
      WHERE (p.productname LIKE ? OR c.companyname LIKE ?)
    `;
    
    if (typeFilter) {
      sql += ` AND (${typeFilter})`;
    }
    
    sql += ` ORDER BY p.productname`;

    try {
      if (this.isWebPlatform && this.webDb) {
        // Use sql.js for web
        const stmt = this.webDb.prepare(sql);
        stmt.bind([searchTerm, searchTerm]);
        
        const results: Product[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          results.push({
            id: row['id'] as number,
            productname: row['productname'] as string,
            boozetype: row['boozetype'] as string,
            redyellowgreen: row['redyellowgreen'] as string,
            companyid: row['companyid'] as number,
            companyname: row['companyname'] as string,
            company_status: row['company_status'] as string,
            city: row['city'] as string,
            country: row['country'] as string,
            notes: row['notes'] as string,
            url: row['url'] as string,
            updatedon: row['updatedon'] as string
          });
        }
        stmt.free();
        return results;
      } else {
        // Use native SQLite
        const result = await this.db!.query(sql, [searchTerm, searchTerm]);
        return result.values || [];
      }
    } catch (error) {
      console.error('Detailed search failed:', error);
      return [];
    }
  }

  private getFallbackDetailedResults(query: string, filter: 'all' | 'beer' | 'wine' | 'liquor' = 'all'): Product[] {
    const searchTerm = query.toLowerCase();
    const results: Product[] = [];

    this.fallbackProducts.forEach(product => {
      const company = this.fallbackCompanies.find(c => c.id === product.companyid);
      if (company && (
        product.productname.toLowerCase().includes(searchTerm) ||
        company.companyname.toLowerCase().includes(searchTerm)
      )) {
        // Apply filter
        if (filter !== 'all' && !this.matchesBeverageType(product.boozetype, filter)) {
          return;
        }
        
        results.push({
          id: product.id,
          productname: product.productname,
          boozetype: product.boozetype,
          redyellowgreen: product.redyellowgreen,
          companyid: product.companyid,
          companyname: company.companyname,
          company_status: company.redyellowgreen,
          city: company.city,
          country: company.country,
          notes: company.notes,
          url: company.url,
          updatedon: company.updatedon
        });
      }
    });

    return results;
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

  async getDatabaseInfo(): Promise<{downloadDate: string, totalProducts: number, totalCompanies: number}> {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }

    if (this.useFallbackData) {
      return {
        downloadDate: '2024-01-01',
        totalProducts: this.fallbackProducts.length,
        totalCompanies: this.fallbackCompanies.length
      };
    }

    try {
      let downloadDate = '';
      let totalProducts = 0;
      let totalCompanies = 0;

      if (this.isWebPlatform && this.webDb) {
        // Get the most recent update date from companies
        const dateResult = this.webDb.exec('SELECT MAX(updatedon) as latest_update FROM company WHERE updatedon IS NOT NULL AND updatedon != ""');
        downloadDate = dateResult.length > 0 && dateResult[0].values.length > 0 ? dateResult[0].values[0][0] as string : '';

        // Get product count
        const productResult = this.webDb.exec('SELECT COUNT(*) as count FROM product');
        totalProducts = productResult.length > 0 ? productResult[0].values[0][0] as number : 0;

        // Get company count
        const companyResult = this.webDb.exec('SELECT COUNT(*) as count FROM company');
        totalCompanies = companyResult.length > 0 ? companyResult[0].values[0][0] as number : 0;
      } else if (this.db) {
        // Get the most recent update date from companies
        const dateResult = await this.db.query('SELECT MAX(updatedon) as latest_update FROM company WHERE updatedon IS NOT NULL AND updatedon != ""');
        downloadDate = dateResult.values && dateResult.values.length > 0 ? dateResult.values[0]['latest_update'] || '' : '';

        // Get product count
        const productResult = await this.db.query('SELECT COUNT(*) as count FROM product');
        totalProducts = productResult.values && productResult.values.length > 0 ? productResult.values[0]['count'] || 0 : 0;

        // Get company count
        const companyResult = await this.db.query('SELECT COUNT(*) as count FROM company');
        totalCompanies = companyResult.values && companyResult.values.length > 0 ? companyResult.values[0]['count'] || 0 : 0;
      }

      return {
        downloadDate: downloadDate || '2024-01-01',
        totalProducts,
        totalCompanies
      };
    } catch (error) {
      console.error('Failed to get database info:', error);
      return {
        downloadDate: '2024-01-01',
        totalProducts: 0,
        totalCompanies: 0
      };
    }
  }

  private getBeverageTypeFilter(filter: 'all' | 'beer' | 'wine' | 'liquor'): string {
    if (filter === 'all') return '';
    
    switch (filter) {
      case 'beer':
        return `LOWER(p.boozetype) LIKE '%beer%' OR 
                LOWER(p.boozetype) LIKE '%lager%' OR 
                LOWER(p.boozetype) LIKE '%ale%' OR 
                LOWER(p.boozetype) LIKE '%stout%' OR 
                LOWER(p.boozetype) LIKE '%porter%' OR 
                LOWER(p.boozetype) LIKE '%ipa%' OR 
                LOWER(p.boozetype) LIKE '%pilsner%' OR 
                LOWER(p.boozetype) LIKE '%wheat%' OR 
                LOWER(p.boozetype) LIKE '%bock%' OR 
                LOWER(p.boozetype) LIKE '%saison%'`;
      case 'wine':
        return `LOWER(p.boozetype) LIKE '%wine%' OR 
                LOWER(p.boozetype) LIKE '%champagne%' OR 
                LOWER(p.boozetype) LIKE '%prosecco%' OR 
                LOWER(p.boozetype) LIKE '%cava%' OR 
                LOWER(p.boozetype) LIKE '%sherry%' OR 
                LOWER(p.boozetype) LIKE '%port%' OR 
                LOWER(p.boozetype) LIKE '%madeira%' OR 
                LOWER(p.boozetype) LIKE '%vermouth%' OR 
                LOWER(p.boozetype) LIKE '%sake%' OR 
                LOWER(p.boozetype) LIKE '%mead%'`;
      case 'liquor':
        return `LOWER(p.boozetype) LIKE '%whiskey%' OR 
                LOWER(p.boozetype) LIKE '%whisky%' OR 
                LOWER(p.boozetype) LIKE '%vodka%' OR 
                LOWER(p.boozetype) LIKE '%gin%' OR 
                LOWER(p.boozetype) LIKE '%rum%' OR 
                LOWER(p.boozetype) LIKE '%tequila%' OR 
                LOWER(p.boozetype) LIKE '%brandy%' OR 
                LOWER(p.boozetype) LIKE '%cognac%' OR 
                LOWER(p.boozetype) LIKE '%bourbon%' OR 
                LOWER(p.boozetype) LIKE '%scotch%' OR 
                LOWER(p.boozetype) LIKE '%liqueur%' OR 
                LOWER(p.boozetype) LIKE '%absinthe%' OR 
                LOWER(p.boozetype) LIKE '%mezcal%'`;
      default:
        return '';
    }
  }

  private matchesBeverageType(boozetype: string, filter: 'beer' | 'wine' | 'liquor'): boolean {
    if (!boozetype) return false;
    
    const type = boozetype.toLowerCase();
    
    switch (filter) {
      case 'beer':
        return type.includes('beer') || type.includes('lager') || type.includes('ale') || 
               type.includes('stout') || type.includes('porter') || type.includes('ipa') || 
               type.includes('pilsner') || type.includes('wheat') || type.includes('bock') || 
               type.includes('saison');
      case 'wine':
        return type.includes('wine') || type.includes('champagne') || type.includes('prosecco') || 
               type.includes('cava') || type.includes('sherry') || type.includes('port') || 
               type.includes('madeira') || type.includes('vermouth') || type.includes('sake') || 
               type.includes('mead');
      case 'liquor':
        return type.includes('whiskey') || type.includes('whisky') || type.includes('vodka') || 
               type.includes('gin') || type.includes('rum') || type.includes('tequila') || 
               type.includes('brandy') || type.includes('cognac') || type.includes('bourbon') || 
               type.includes('scotch') || type.includes('liqueur') || type.includes('absinthe') || 
               type.includes('mezcal');
      default:
        return false;
    }
  }
}