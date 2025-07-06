# Kingly Cash Chess Mobile App

Expo React Native mobile version of the Game Hub with AdMob integration.

## Setup

1. Install Expo CLI globally:

```bash
npm install -g expo-cli
```

2. Install dependencies:

```bash
cd mobile-app
npm install
```

3. Start the development server:

```bash
npm start
```

## AdMob Configuration

The app is configured with AdMob using your app ID: `ca-app-pub-7196290945919417~2175417759`

### Important: Update Ad Unit IDs

Before publishing, you need to create ad units in your AdMob dashboard and update the ad unit IDs in `src/config/admob.ts`:

1. Go to [AdMob Console](https://apps.admob.com/)
2. Create ad units for:
   - Banner ads
   - Interstitial ads
   - Rewarded ads
3. Replace the placeholder ad unit IDs in the config file

### Test Mode

The app runs in test mode during development (`__DEV__ = true`), which shows test ads. This prevents invalid clicks on your account.

## Features

- 🎮 Cross-platform mobile gaming
- 📱 Native mobile UI/UX
- 💰 AdMob monetization (banner, interstitial, rewarded ads)
- 🎯 Chess and Ludo games
- 🔄 Navigation between screens
- 🎨 Beautiful gradient designs

## Building for Production

### Android:

```bash
expo build:android
```

### iOS:

```bash
expo build:ios
```

## App Store Deployment

1. Update version in `app.json`
2. Build production APK/IPA
3. Upload to Google Play Console / App Store Connect
4. Set AdMob to production mode by ensuring test mode is disabled

## Ad Types Implemented

- **Banner Ads**: Top/bottom of screens
- **Interstitial Ads**: Between game transitions
- **Medium Rectangle**: In-content ads

## Development Notes

- Test ads are shown during development
- Real ads will show in production builds
- AdMob revenue requires app store approval
- Follow AdMob policies for ad placement
