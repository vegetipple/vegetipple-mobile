# Database Configuration

Vegetipple Mobile automatically downloads the latest Barnivore database from the [grab_barnivore](https://github.com/vegetipple/grab_barnivore) repository during the build process.

## Version Configuration

### 1. Package.json Configuration (Default)
```json
{
  "databaseVersion": "latest"
}
```

### 2. Environment Variable
```bash
DB_VERSION=v2025.06.10 npm run build
```

### 3. Direct Script Usage
```bash
# Download latest version
npm run download-db

# Download specific version
DB_VERSION=v2025.06.10 npm run download-db

# Download latest (explicit)
npm run download-db:latest
```

## Docker Builds

### Local Docker Build
```bash
# Use latest database
./build-docker.sh

# Use specific database version
./build-docker.sh v2025.06.10
```

### Docker Build Command
```bash
# Build with latest database
docker build --build-arg DB_VERSION=latest -t vegetipple-mobile .

# Build with specific database version
docker build --build-arg DB_VERSION=v2025.06.10 -t vegetipple-mobile .
```

## GitHub Actions

The GitHub Actions workflow supports database version configuration:

### Manual Trigger
1. Go to Actions tab in GitHub
2. Select "Docker Build Vegetipple Mobile" workflow
3. Click "Run workflow"
4. Enter desired database version (e.g., `v2025.06.10` or `latest`)

### Automatic Builds
- Push to `main` or `develop` uses `latest` database version
- Pull requests use `latest` database version

## Available Database Versions

Check available versions at: https://github.com/vegetipple/grab_barnivore/releases

Version format: `vYYYY.MM.DD` (e.g., `v2025.06.10`)

## Database Information

After download, database metadata is stored in:
- `src/assets/databases/databases.json` - Full metadata
- `build-output/database-info.json` - Build artifact metadata

### Metadata Structure
```json
{
  "version": "v2025.06.10",
  "name": "Barnivore Data v2025.06.10",
  "downloadDate": "2025-06-11T10:00:00.000Z",
  "publishedAt": "2025-06-10T12:00:00.000Z",
  "downloadUrl": "https://github.com/vegetipple/grab_barnivore/releases/tag/v2025.06.10",
  "size": 12345678
}
```

## Troubleshooting

### Database Download Fails
1. Check internet connectivity
2. Verify the version exists: https://github.com/vegetipple/grab_barnivore/releases
3. Check GitHub API rate limits
4. Use `latest` instead of specific version

### Version Not Found
```bash
# List available versions
curl -s https://api.github.com/repos/vegetipple/grab_barnivore/releases | grep '"tag_name"'
```

### Manual Download
If automatic download fails, manually download from:
https://github.com/vegetipple/grab_barnivore/releases

Place the file at:
- `src/assets/barnivore.db`
- `src/assets/databases/barnivore.db`

## NPM Scripts

```json
{
  "scripts": {
    "build": "npm run download-db && ng build",
    "build:prod": "npm run download-db && ng build --configuration production",
    "build:no-db": "ng build",
    "download-db": "node scripts/download-database.js",
    "download-db:latest": "DB_VERSION=latest node scripts/download-database.js",
    "download-db:version": "node scripts/download-database.js"
  }
}
```