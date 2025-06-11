const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Downloads the barnivore database from GitHub releases
 * Supports version configuration via environment variables or package.json
 */
class DatabaseDownloader {
  constructor() {
    this.repoOwner = 'vegetipple';
    this.repoName = 'grab_barnivore';
    this.assetName = 'barnivore.db';
    this.outputDir = path.join(__dirname, '..', 'src', 'assets');
    this.databasesDir = path.join(this.outputDir, 'databases');
    
    // Version can be configured via:
    // 1. Environment variable: DB_VERSION=v2025.06.10
    // 2. Package.json field: "databaseVersion": "v2025.06.10"
    // 3. Default: "latest" (gets the most recent release)
    this.version = this.getConfiguredVersion();
  }

  getConfiguredVersion() {
    // Check environment variable first
    if (process.env.DB_VERSION) {
      console.log(`Using database version from environment: ${process.env.DB_VERSION}`);
      return process.env.DB_VERSION;
    }

    // Check package.json
    try {
      const packageJson = require('../package.json');
      if (packageJson.databaseVersion) {
        console.log(`Using database version from package.json: ${packageJson.databaseVersion}`);
        return packageJson.databaseVersion;
      }
    } catch (error) {
      console.warn('Could not read package.json for database version');
    }

    console.log('Using latest database version');
    return 'latest';
  }

  async downloadDatabase() {
    try {
      console.log(`Downloading database from ${this.repoOwner}/${this.repoName}...`);
      
      // Get release information
      const releaseInfo = await this.getReleaseInfo();
      console.log(`Found release: ${releaseInfo.tag_name} (${releaseInfo.name})`);
      
      // Find the database asset (may include version in filename)
      console.log(`Available assets: ${releaseInfo.assets.map(a => a.name).join(', ')}`);
      
      let asset = releaseInfo.assets.find(asset => asset.name === this.assetName);
      
      // If exact name not found, look for .db files
      if (!asset) {
        asset = releaseInfo.assets.find(asset => asset.name.endsWith('.db'));
      }
      
      if (!asset) {
        throw new Error(`No database asset found in release ${releaseInfo.tag_name}. Available assets: ${releaseInfo.assets.map(a => a.name).join(', ')}`);
      }
      
      console.log(`Using asset: ${asset.name}`);

      // Ensure output directories exist
      this.ensureDirectories();

      // Download the database file
      await this.downloadFile(asset.browser_download_url, path.join(this.outputDir, this.assetName));
      await this.downloadFile(asset.browser_download_url, path.join(this.databasesDir, this.assetName));

      // Update databases.json with metadata
      await this.updateDatabasesJson(releaseInfo);

      console.log(`✅ Database downloaded successfully: ${releaseInfo.tag_name}`);
      console.log(`📅 Published: ${new Date(releaseInfo.published_at).toLocaleDateString()}`);
      console.log(`📍 Location: ${this.outputDir}/${this.assetName}`);
      console.log(`📊 Size: ${Math.round(releaseInfo.assets.find(a => a.name.endsWith('.db'))?.size / 1024 / 1024 * 100) / 100} MB`);
      console.log(`🔗 Release URL: ${releaseInfo.html_url}`);
      
    } catch (error) {
      console.error('❌ Failed to download database:', error.message);
      process.exit(1);
    }
  }

  async getReleaseInfo() {
    const apiUrl = this.version === 'latest' 
      ? `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`
      : `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/tags/${this.version}`;

    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Vegetipple-Mobile-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      https.get(apiUrl, options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            try {
              const releaseInfo = JSON.parse(data);
              resolve(releaseInfo);
            } catch (error) {
              reject(new Error(`Failed to parse GitHub API response: ${error.message}`));
            }
          } else {
            reject(new Error(`GitHub API request failed with status ${response.statusCode}: ${data}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
    });
  }

  async downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return this.downloadFile(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });

        file.on('error', (error) => {
          fs.unlink(outputPath, () => {}); // Delete partial file
          reject(error);
        });
      }).on('error', (error) => {
        reject(new Error(`Download request failed: ${error.message}`));
      });
    });
  }

  ensureDirectories() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.databasesDir)) {
      fs.mkdirSync(this.databasesDir, { recursive: true });
    }
  }

  async updateDatabasesJson(releaseInfo) {
    const databasesJsonPath = path.join(this.databasesDir, 'databases.json');
    const metadata = {
      version: releaseInfo.tag_name,
      name: releaseInfo.name,
      downloadDate: new Date().toISOString(),
      publishedAt: releaseInfo.published_at,
      downloadUrl: releaseInfo.html_url,
      size: releaseInfo.assets.find(a => a.name === this.assetName)?.size || 0
    };

    fs.writeFileSync(databasesJsonPath, JSON.stringify(metadata, null, 2));
    console.log(`📝 Updated databases.json with metadata`);
  }
}

// Run the downloader
if (require.main === module) {
  const downloader = new DatabaseDownloader();
  downloader.downloadDatabase();
}

module.exports = DatabaseDownloader;