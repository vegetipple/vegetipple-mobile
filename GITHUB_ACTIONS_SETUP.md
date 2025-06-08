# GitHub Actions Android Build Setup

This guide will help you set up automated Android app building and publishing using GitHub Actions.

## 🚀 Quick Start

1. **Push your code to GitHub**
2. **Generate a signing keystore** (for release builds)
3. **Configure GitHub secrets**
4. **Create a git tag to trigger the build**

## 📋 Detailed Setup

### 1. Push Code to GitHub Repository

```bash
cd vegetipple-mobile
git init
git add .
git commit -m "Initial commit: Vegetipple mobile app"
git branch -M main
git remote add origin https://github.com/yourusername/vegetipple-mobile.git
git push -u origin main
```

### 2. Generate App Signing Keystore

Run the keystore generation script:

```bash
./scripts/generate-keystore.sh
```

This will:
- ✅ Generate a secure keystore for app signing
- ✅ Provide the base64 encoded keystore for GitHub secrets
- ✅ Give you all the information needed for GitHub setup

### 3. Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `KEYSTORE_BASE64` | Base64 encoded keystore file | `MIIEvgIBADANBgkqhkiG9w0BAQ...` |
| `KEYSTORE_PASSWORD` | Password for the keystore | `your-secure-password` |
| `KEY_ALIAS` | Alias name for the signing key | `vegetipple` |
| `KEY_PASSWORD` | Password for the signing key | `your-key-password` |

### 4. Trigger Builds

#### Automatic Build on Tag Creation

Create and push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Manual Build Trigger

1. Go to Actions tab in your GitHub repository
2. Select "Android Build" workflow
3. Click "Run workflow"
4. Enter version number (e.g., v1.0.0)

## 🏗️ What the Workflow Does

### Build Process

1. **Environment Setup**
   - ✅ Ubuntu runner with Node.js 20
   - ✅ Java JDK 17 for Android development
   - ✅ Android SDK with API level 34

2. **Dependencies Installation**
   - ✅ npm ci for fast, reliable dependency installation
   - ✅ Capacitor CLI for mobile app building

3. **App Building**
   - ✅ Ionic production build (`npm run build --prod`)
   - ✅ Capacitor Android platform setup
   - ✅ Asset synchronization to Android project

4. **Version Management**
   - ✅ Automatic version extraction from git tags
   - ✅ Updates package.json version
   - ✅ Updates Android app version code and name

5. **Android Compilation**
   - ✅ Debug APK (for testing)
   - ✅ Release APK (unsigned)
   - ✅ Release AAB (for Google Play Store)
   - ✅ Signed release APK (if keystore secrets provided)

### Artifacts Generated

| Artifact | Description | Use Case |
|----------|-------------|----------|
| **Debug APK** | Development build with debugging enabled | Testing, development |
| **Release APK (unsigned)** | Production build without signature | Manual signing, testing |
| **Release APK (signed)** | Production build ready for distribution | Direct installation, third-party stores |
| **Release AAB** | Android App Bundle for Google Play | Google Play Store submission |

### GitHub Release Creation

When triggered by a tag, the workflow automatically:
- ✅ Creates a GitHub release with the tag name
- ✅ Attaches the release APK as a downloadable asset
- ✅ Includes comprehensive release notes

## 📱 Build Outputs

### Download Locations

1. **GitHub Actions Artifacts**
   - Go to Actions → Your workflow run → Artifacts section
   - Download any of the generated APK/AAB files

2. **GitHub Releases** (for tagged builds)
   - Go to Releases section of your repository
   - Download attached APK files

### File Types Explained

- **`.apk`** - Android application package (direct install)
- **`.aab`** - Android App Bundle (Google Play Store optimized)

## 🔧 Customization

### Modify Build Configuration

Edit `.github/workflows/android-build.yml` to:
- Change Android API levels
- Modify build commands
- Add additional build steps
- Configure different signing approaches

### Environment Variables

The workflow supports these customizable variables:
- Node.js version (default: 20)
- Java version (default: 17)
- Android API level (default: 34)
- Build tools version (default: 34.0.0)

## 🚨 Security Best Practices

### Keystore Management
- ✅ Never commit keystore files to version control
- ✅ Store keystore securely outside of repository
- ✅ Use strong passwords for keystore and key
- ✅ Backup keystore file securely

### GitHub Secrets
- ✅ Only repository admins should have access to secrets
- ✅ Regularly rotate signing credentials
- ✅ Use environment-specific secrets for different deployment stages

## 🐛 Troubleshooting

### Common Issues

**Build fails at npm ci**
- Check Node.js version compatibility
- Verify package-lock.json is committed

**Android build fails**
- Ensure all Android dependencies are properly configured
- Check Java/Android SDK versions

**Signing fails**
- Verify all 4 keystore secrets are correctly set
- Check base64 encoding of keystore file

**Version update fails**
- Ensure tag follows semantic versioning (v1.0.0)
- Check build.gradle file exists and is properly formatted

### Debug Steps

1. **Check workflow logs** in GitHub Actions
2. **Verify secrets** are properly configured
3. **Test locally** with same Node.js/Java versions
4. **Validate keystore** with keytool commands

## 🎯 Next Steps

After successful setup:

1. **Test the workflow** with a test tag
2. **Download and test** generated APKs
3. **Submit AAB to Google Play** Store
4. **Set up additional environments** (staging, production)
5. **Configure automated testing** before builds

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Verify all secrets are properly configured
3. Test the build process locally first
4. Review the generated artifacts for completeness

Happy building! 🚀