# 📱 VoyaGen Mobile — AI-Powered Travel App

VoyaGen Mobile is the cross-platform mobile application companion for the VoyaGen ecosystem, built with React Native and Expo. It offers a premium, intuitive user interface for travelers to socialize, explore, and plan their journeys using AI.

## ✨ Key Features
- **Social Feed & Profiles:** Browse travel posts, follow friends, and manage your personalized profile.
- **AI Trip Planner:** Generate smart, personalized travel routes using Google Gemini AI.
- **Interactive Maps & Locations:** Discover new places and view detailed travel routes.
- **Direct Messaging:** Chat securely with other travelers.
- **Smart Travel Notes:** Jot down and organize thoughts during your trips.
- **Sleek UI/UX:** Built with a modern, dark-mode ready design system.

## 🛠 Tech Stack
- **Framework:** React Native, Expo
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **Networking:** Axios
- **Storage:** AsyncStorage & Expo Secure Store
- **Styling:** Custom StyleSheet / Theme Provider

## 🚀 Quick Start

### 1. Requirements
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device (or Android Studio / Xcode for emulators)

### 2. Clone & Install
```bash
git clone https://github.com/muharremtavli/voyagen-mobile.git
cd voyagenMobile
npm install
```

### 3. Configure API Connection
Ensure your backend API is running. Update the IP configuration in `src/api/client.js` to match your local network IP (if running on a physical device) or `localhost` (for iOS simulator).

```javascript
// src/api/client.js
const LOCAL_IP = '192.168.1.X'; // Replace with your IP
```

### 4. Run the App
```bash
# Start the Metro Bundler
npm start

# Or start directly on emulators:
npm run android
npm run ios
```
Scan the QR code displayed in your terminal using the **Expo Go** app on your phone to start exploring!

## 🏗 Project Structure
- `src/api/`: Axios client setup and API endpoint functions.
- `src/components/`: Reusable UI components (Cards, Buttons, Spinners).
- `src/navigation/`: App routing and stack configurations.
- `src/screens/`: Main application screens (Feed, Profile, AI Route, etc.).
- `src/theme/`: Centralized design system (colors, typography).
