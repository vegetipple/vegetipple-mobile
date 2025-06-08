#!/bin/bash

# Script to generate Android app signing keystore
# Run this script to create a keystore for signing your Android app

set -e

echo "🔐 Android App Keystore Generator"
echo "================================="
echo

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    echo "❌ keytool not found. Please install Java JDK."
    exit 1
fi

# Set default values
DEFAULT_ALIAS="vegetipple"
DEFAULT_VALIDITY="10000"
DEFAULT_KEYSTORE="vegetipple-release-key.keystore"

# Get user input
read -p "Enter key alias (default: $DEFAULT_ALIAS): " KEY_ALIAS
KEY_ALIAS=${KEY_ALIAS:-$DEFAULT_ALIAS}

read -p "Enter keystore filename (default: $DEFAULT_KEYSTORE): " KEYSTORE_NAME
KEYSTORE_NAME=${KEYSTORE_NAME:-$DEFAULT_KEYSTORE}

read -p "Enter validity period in days (default: $DEFAULT_VALIDITY): " VALIDITY
VALIDITY=${VALIDITY:-$DEFAULT_VALIDITY}

read -s -p "Enter keystore password: " KEYSTORE_PASSWORD
echo
read -s -p "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
echo

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

read -s -p "Enter key password (press Enter to use same as keystore): " KEY_PASSWORD
echo
if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD=$KEYSTORE_PASSWORD
fi

echo
echo "📝 Certificate Information"
echo "=========================="
read -p "First and Last Name (CN): " CN
read -p "Organizational Unit (OU): " OU
read -p "Organization (O): " O
read -p "City or Locality (L): " L
read -p "State or Province (ST): " ST
read -p "Country Code (C): " C

# Generate the keystore
echo
echo "🔨 Generating keystore..."

DNAME="CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

keytool -genkey \
    -v \
    -keystore "$KEYSTORE_NAME" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity "$VALIDITY" \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "$DNAME"

echo
echo "✅ Keystore generated successfully!"
echo
echo "📋 Keystore Information:"
echo "========================"
echo "Keystore file: $KEYSTORE_NAME"
echo "Key alias: $KEY_ALIAS"
echo "Validity: $VALIDITY days"
echo
echo "🔐 GitHub Secrets Setup:"
echo "========================"
echo "1. Encode your keystore to base64:"
echo "   base64 -w 0 $KEYSTORE_NAME"
echo
echo "2. Add these secrets to your GitHub repository:"
echo "   KEYSTORE_BASE64: [output from step 1]"
echo "   KEYSTORE_PASSWORD: $KEYSTORE_PASSWORD"
echo "   KEY_ALIAS: $KEY_ALIAS"
echo "   KEY_PASSWORD: $KEY_PASSWORD"
echo
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "============================="
echo "1. Keep your keystore file safe and secure"
echo "2. Backup your keystore - if lost, you cannot update your app"
echo "3. Never commit the keystore file to version control"
echo "4. Store passwords securely (consider using a password manager)"
echo
echo "📱 Next Steps:"
echo "=============="
echo "1. Add the GitHub secrets mentioned above"
echo "2. Commit and push your code"
echo "3. Create a git tag: git tag v1.0.0 && git push origin v1.0.0"
echo "4. GitHub Actions will automatically build and sign your APK"
echo

# Create .gitignore entry for keystore
if [ ! -f ".gitignore" ]; then
    touch .gitignore
fi

if ! grep -q "*.keystore" .gitignore; then
    echo "*.keystore" >> .gitignore
    echo "📁 Added *.keystore to .gitignore"
fi

echo "🎉 Setup complete!"