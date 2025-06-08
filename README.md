# 🌱 Vegetipple Mobile

**Discover if your drinks are vegan-friendly**

A mobile application that helps users determine whether alcoholic beverages are vegan by searching through a comprehensive database of products and companies with their vegan status classifications.

<div align="center">

![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

</div>

## 🚀 Features

### 🔍 **Smart Search**
- **Real-time suggestions** with autocomplete dropdown
- **Fuzzy text matching** for products and companies
- **Instant filtering** as you type

### 🌿 **Vegan Classification**
- **Color-coded status indicators**:
  - 🟢 **Green**: Vegan
  - 🟡 **Yellow**: May Not Be Vegan
  - 🔴 **Red**: Not Vegan
- **Detailed product information** with company details

### 📱 **Native Mobile Experience**
- **Fast SQLite database** with 11.83MB of vegan data
- **Offline functionality** - works without internet
- **Native Android performance** with Capacitor
- **Beautiful mobile UI** with Ionic components

### 🏢 **Company Information**
- **Company profiles** with contact details
- **Website links** opening in native browser
- **Location information** with country flags
- **Cross-reference products** by company

### 📝 **Additional Details**
- **Expandable notes** sections with additional information
- **Last updated dates** for data freshness
- **Product type classification** (Beer, Wine, Spirits, etc.)

## 🏗️ Technology Stack

- **Framework**: Ionic 7 + Angular 19
- **Mobile Runtime**: Capacitor 7
- **Database**: SQLite with @capacitor-community/sqlite
- **Language**: TypeScript
- **Styling**: SCSS with Ionic CSS Variables
- **Build System**: Angular CLI + Capacitor CLI
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
vegetipple-mobile/
├── 📁 .github/
│   └── 📁 workflows/
│       ├── android-build.yml      # 🚀 Production build pipeline
│       └── ci.yml                 # 🧪 Continuous integration
├── 📁 android/                    # 📱 Native Android project
│   ├── 📁 app/
│   │   ├── 📁 src/main/assets/    # 📦 App assets & database
│   │   └── build.gradle           # 🔧 Android build config
│   └── variables.gradle           # 📋 Android dependencies
├── 📁 scripts/
│   └── generate-keystore.sh       # 🔐 App signing keystore generator
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 home/               # 🏠 Main search page
│   │   │   ├── home.page.html     # 🎨 Search UI template
│   │   │   ├── home.page.ts       # 🧠 Search logic & state
│   │   │   ├── home.page.scss     # 💅 Mobile-optimized styles
│   │   │   └── home.module.ts     # 📦 Page module
│   │   ├── 📁 services/
│   │   │   └── database.service.ts # 🗄️ SQLite database service
│   │   ├── app.component.*        # 🏗️ Root app component
│   │   └── app.module.ts          # 📦 Main app module
│   ├── 📁 assets/
│   │   ├── barnivore.db          # 🗄️ Vegan drinks database (11.83MB)
│   │   └── 📁 icon/              # 🎯 App icons
│   ├── 📁 environments/          # ⚙️ Environment configs
│   ├── global.scss               # 🌍 Global styles
│   ├── index.html                # 📄 App entry point
│   └── main.ts                   # 🚀 App bootstrap
├── 📁 www/                       # 📦 Built web assets (generated)
├── angular.json                  # ⚙️ Angular CLI configuration
├── capacitor.config.ts           # 📱 Capacitor configuration
├── ionic.config.json             # ⚡ Ionic project config
├── package.json                  # 📋 Dependencies & scripts
├── tsconfig.json                 # 🔧 TypeScript configuration
├── 📚 GITHUB_ACTIONS_SETUP.md    # 🚀 CI/CD setup guide
├── 📚 MOBILE_SETUP.md            # 📱 Mobile development guide
└── 📖 README.md                  # 📚 This file
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js 20+** (required for Capacitor CLI)
- **npm** or **yarn**
- **Java JDK 17** (for Android development)
- **Android Studio** (for device testing)

### 1. Clone & Install

```bash
git clone <repository-url>
cd vegetipple-mobile
npm install
```

### 2. Development Server

```bash
# Start Ionic development server
npm start
# or
ionic serve
```

Navigate to `http://localhost:8100` to see the app running in your browser.

### 3. Mobile Development

```bash
# Build web assets
npm run build

# Add Android platform (if not already added)
npx cap add android

# Sync changes to native project
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🔨 Build Commands

### Development

```bash
npm start                    # Start dev server with live reload
npm run build               # Build for production
npm run lint                # Lint TypeScript and templates
npm test                    # Run unit tests
```

### Mobile Platform

```bash
npx cap add android         # Add Android platform
npx cap add ios             # Add iOS platform (macOS only)
npx cap sync                # Sync web assets to native projects
npx cap run android         # Build and run on Android device
npx cap open android        # Open Android project in Android Studio
```

### Production Builds

```bash
npm run build --prod        # Production web build
npx cap sync android        # Sync to Android
# Then build APK/AAB in Android Studio or via Gradle
```

## 📱 Platform Support

### ✅ **Currently Supported**
- **Android 6.0+** (API level 22+)
- **Modern web browsers** (Chrome, Firefox, Safari, Edge)

### 🔮 **Future Support**
- **iOS 12+** (requires macOS development environment)
- **Progressive Web App** (PWA) capabilities

## 🗄️ Database

### **Source Data**
- **Database**: barnivore.db (SQLite format)
- **Size**: 11.83MB
- **Content**: Vegan status for alcoholic beverages
- **Tables**: `company`, `product`

### **Status Classifications**
- **Green**: Confirmed vegan-friendly
- **Yellow**: May contain non-vegan ingredients
- **Red**: Contains non-vegan ingredients
- **Unknown**: Status not determined

### **Data Structure**
```sql
-- Companies table
company (
  id, companyname, redyellowgreen, city, country, 
  notes, url, updatedon, ...
)

-- Products table  
product (
  id, productname, boozetype, redyellowgreen, 
  companyid, ...
)
```

## 🚀 Deployment

### **Automated Deployment (Recommended)**

The project includes GitHub Actions workflows for automated building:

1. **Create a release**: `git tag v1.0.0 && git push origin v1.0.0`
2. **GitHub Actions automatically**:
   - Builds the app
   - Generates APK and AAB files
   - Creates a GitHub release
   - Uploads build artifacts

See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for detailed setup instructions.

### **Manual Deployment**

```bash
# 1. Build the app
npm run build --prod
npx cap sync android

# 2. Generate signed APK
cd android
./gradlew assembleRelease

# 3. Generate AAB for Play Store
./gradlew bundleRelease
```

### **Publishing Options**

- **📱 Direct Installation**: Share APK file directly
- **🏪 Google Play Store**: Upload AAB file via Play Console
- **🌐 Alternative Stores**: F-Droid, Amazon Appstore, Samsung Galaxy Store

## 🧪 Testing

### **Unit Testing**
```bash
npm test                    # Run unit tests
npm run test:coverage       # Run with coverage report
```

### **E2E Testing**
```bash
npm run e2e                 # End-to-end tests (when configured)
```

### **Device Testing**
```bash
npx cap run android --target=device    # Run on connected Android device
npx cap run android --target=emulator  # Run on Android emulator
```

## 🔧 Configuration

### **Environment Variables**
Edit `src/environments/environment.ts` for development settings:
```typescript
export const environment = {
  production: false,
  // Add your environment-specific settings
};
```

### **App Configuration**
Modify `capacitor.config.ts` for native app settings:
```typescript
const config: CapacitorConfig = {
  appId: 'io.ionic.vegetipple',
  appName: 'vegetipple-mobile',
  // Customize your app configuration
};
```

### **Styling Customization**
Global styles in `src/global.scss` and theme variables in `src/theme/variables.scss`.

## 🐛 Troubleshooting

### **Common Issues**

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Android Build Issues**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

**Database Not Loading**
- Ensure `barnivore.db` is in `src/assets/`
- Check file permissions and size (should be ~11.83MB)
- Verify SQLite plugin installation

**Capacitor Sync Fails**
```bash
# Ensure Node.js 20+ is active
node --version
npx cap doctor    # Check Capacitor environment
```

### **Debug Mode**
```bash
# Run with debug output
DEBUG=capacitor:* npx cap run android
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and patterns
- Write tests for new features
- Update documentation for significant changes
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **[Barnivore](https://www.barnivore.com/)** - Vegan alcohol database
- **[Ionic Framework](https://ionicframework.com/)** - Mobile app framework
- **[Capacitor](https://capacitorjs.com/)** - Native runtime
- **[Angular](https://angular.io/)** - Web framework

## 📞 Support

- 📧 **Issues**: [GitHub Issues](../../issues)
- 📚 **Documentation**: See additional `.md` files in project root
- 🚀 **Deployment**: [GitHub Actions Setup Guide](GITHUB_ACTIONS_SETUP.md)
- 📱 **Mobile Setup**: [Mobile Development Guide](MOBILE_SETUP.md)

---

<div align="center">

**Made with ❤️ for the vegan community**

*Helping you make informed choices about your drinks* 🌱

</div>