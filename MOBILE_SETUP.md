# Vegetipple Mobile App Setup Guide

## Current Status ✅

The Ionic + Capacitor app has been successfully created with:

- ✅ **Ionic Angular project** initialized
- ✅ **SQLite plugin** installed (@capacitor-community/sqlite)
- ✅ **Browser plugin** for external URLs
- ✅ **Database** copied to assets (barnivore.db)
- ✅ **Search functionality** implemented
- ✅ **UI components** migrated from web version
- ✅ **Styling** adapted for mobile
- ✅ **App builds successfully**

## Required: Complete Android Setup

### 1. Activate Node.js 20 (Required)
```bash
# If using NVM, activate Node.js 20
nvm use 20

# Verify Node.js version
node --version  # Should show v20.x.x

# If Node.js 20 is not active, try:
source ~/.bashrc
# or restart your terminal
```

### 2. Add Android Platform
```bash
cd vegetipple-mobile
npx cap add android
```

### 3. Sync Assets and Plugins
```bash
npx cap sync android
```

### 4. Configure Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 5. Build and Run
```bash
# Build the web assets
npm run build

# Open in Android Studio
npx cap open android
```

## Features Implemented

### 🔍 Search Functionality
- Real-time search suggestions
- Product and company search
- Fuzzy text matching
- Autocomplete dropdown

### 🎨 Mobile UI
- Native Ionic components
- Gradient background matching web version
- Color-coded vegan status badges
- Responsive card layouts
- Loading states and error handling

### 📱 Native Features
- SQLite database integration
- External URL opening via Browser plugin
- Mobile-optimized touch interactions
- Native Android styling

### 🗄️ Database Integration
- Local SQLite database (barnivore.db)
- Product and company queries
- Vegan status classification
- Company cross-referencing

## File Structure

```
vegetipple-mobile/
├── src/
│   ├── app/
│   │   ├── home/           # Main search page
│   │   └── services/       # Database service
│   └── assets/
│       └── barnivore.db    # SQLite database
├── capacitor.config.ts     # Capacitor configuration
└── MOBILE_SETUP.md        # This guide
```

## Development Commands

```bash
# Start development server
ionic serve

# Build for production
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync changes
npx cap sync

# Open in IDE
npx cap open android
npx cap open ios
```

## Next Steps After Android Setup

1. **Test the app** in Android emulator or device
2. **Customize app icon** and splash screen
3. **Configure app signing** for release
4. **Add iOS platform** if needed
5. **Publish to Google Play Store**

The app is ready to run once the Android platform is properly added with Node.js 20+!