# Sabi Mobile

A React Native app built with Expo Router for the Sabi platform.

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or later)
- **npm** or **pnpm** (project uses pnpm based on lock file)
- **Expo CLI**: `npm install -g @expo/cli`

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
# Clone the repository
cd sabi-mobile

# Install dependencies (using pnpm as per project setup)
pnpm install
```

### 2. Set Up Environment

The app uses Supabase and Firebase. You'll need to configure:

- **Supabase**: Update configuration in `lib/supabase.ts`
- **Firebase**: Configure for push notifications (see `src/api/NOTIFICATION_USAGE.md`)

### 3. Start Development Server

```bash
# Start the Expo development server
pnpm start
```

## 📱 Running on Your Phone

### Install Expo Go App

1. **Download Expo Go** on your phone:
   - **iOS**: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Connect Your Phone

2. **Make sure your phone and computer are on the same WiFi network**

3. **Scan the QR Code**:
   - After running `pnpm start`, a QR code will appear in your terminal
   - **iPhone**: Open the Camera app and point it at the QR code, then tap the notification
   - **Android**: Open the Expo Go app and tap "Scan QR Code"

4. **Wait for the app to load** - The first time may take a few minutes to build and load

### Alternative Running Options

```bash
# Run specific platforms during development:
pnpm run ios     # Open in iOS Simulator (macOS only)
pnpm run android # Open in Android Emulator
pnpm run web     # Open in web browser
```

## 🧪 Testing

```bash
# Run tests in watch mode
pnpm test
```

## 📁 Project Structure

```
├── app/                    # App Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── login.tsx          # Authentication screen
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
│   └── home/             # Home screen components
├── src/
│   ├── api/              # API utilities and configuration
│   ├── hooks/            # Custom React hooks
│   └── stores/           # State management (Zustand)
├── constants/            # App constants and themes
└── assets/              # Images, fonts, and static assets
```

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Supabase
- **Push Notifications**: Firebase Cloud Messaging
- **UI**: Custom components with React Native Reanimated
- **Testing**: Jest with Expo preset

## 🚨 Troubleshooting

### Common Issues

**Can't scan QR code**:
- Make sure your phone and computer are on the same WiFi network
- Try using the Expo Go app's "Enter URL manually" option and type the URL shown in terminal

**App won't load on phone**:
- Check that both devices are on the same network
- Try restarting the development server: `pnpm start --clear`

**Metro bundler issues**:
```bash
# Clear Metro cache
npx expo start --clear
```

**Dependencies issues**:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Need Help?

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://expo.github.io/router/docs/)

## 📄 License

This project is private and proprietary.