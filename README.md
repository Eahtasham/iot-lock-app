# IoT Lock App

A React Native app for managing smart door lock visitors with real-time photo capture and accept/reject functionality..

## Features

### 🏠 Home Tab
- **Visitor History**: View all visitor requests with status indicators
- **Real-time Requests**: Accept/reject modal appears when visitors arrive
- **Status Tracking**: Green checkmark for accepted, red X for rejected visitors
- **Pagination**: "See More" button to load additional entries (10 at a time)

### 📸 Memorize Tab
- **Photo Management**: Add multiple photos of people to memorize
- **Horizontal Scroll**: Side-scrollable photo gallery
- **Name Input**: Text field for entering person's name
- **Memorize Button**: Save person to the system

### 👤 Profile Tab
- **Account Settings**: Change password, email settings
- **App Information**: Version, about us, terms of service
- **Security**: Privacy settings and logout functionality
- **Support**: Help and support options

### 🚪 Accept/Reject Modal
- **Photo Gallery**: Horizontal scroll through webcam captures
- **Material Design**: Modern UI with proper spacing and shadows
- **Action Buttons**: Large accept (green) and reject (red) buttons
- **Visitor Info**: Display visitor name and timestamp

## Project Structure

```
app/
├── (tabs)/
│   ├── home.tsx          # Visitor history and real-time requests
│   ├── memorize.tsx      # Photo management and person registration
│   └── profile.tsx       # User settings and app information
├── _layout.tsx           # Main navigation with bottom tabs
└── globals.css           # Global styles

components/
├── AcceptRejectModal.tsx # Modal for visitor requests
└── VisitorCard.tsx      # Individual visitor history card

constants/
└── theme.ts             # App theme configuration
```

## Key Components

### AcceptRejectModal
- Full-screen modal with photo carousel
- Material design buttons with icons
- Timestamp display
- Responsive image sizing

### VisitorCard
- Circular profile image
- Name and timestamp in grid layout
- Status icon (green/red)
- Clean card design with shadows

### Navigation
- Bottom tab navigation with icons
- Home, Camera, and Profile tabs
- Theme-aware styling

## Technologies Used

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS)
- **React Navigation** for tab navigation
- **Expo Image Picker** for photo selection
- **React Native Paper** for Material Design components
- **Ionicons** for consistent iconography

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Open the app in:
   - Expo Go app on your phone
   - iOS Simulator
   - Android Emulator

## Demo Features

- **Auto Demo**: Modal appears 3 seconds after opening the home tab
- **Manual Demo**: "Demo Request" button in home header
- **Mock Data**: Pre-populated visitor history for testing

## Future Enhancements

- Real webcam integration
- Push notifications for visitor requests
- Face recognition for memorized people
- Cloud storage for photos and data
- Multi-language support
