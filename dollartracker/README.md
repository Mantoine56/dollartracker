# DollarTracker

A personal finance tracking app built with React Native and Expo.

## Features

- Track daily expenses and income
- View transaction history with category filtering
- Analyze spending patterns with interactive charts
- Dark mode first design
- Built with Expo Router for seamless navigation

## Tech Stack

- React Native
- Expo & Expo Router
- React Native Paper for UI components
- Victory Native for charts
- Supabase for backend services

## Getting Started

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:
```bash
npm run ios     # for iOS
npm run android # for Android
```

## Project Structure

- `app/` - Contains all screens and navigation logic
  - `(tabs)/` - Tab-based navigation screens
  - `transaction/` - Transaction-related screens
- `constants/` - Global constants and theme configuration
- `components/` - Reusable UI components
- `services/` - API and database services

## Theme

The app uses a dark theme with the following primary colors:
- Background: #1E1E1E
- Primary: #58A6FF
- Success: #32CD32
- Warning: #FFA500

For more details about the routing system, check out the [Expo Router documentation](https://docs.expo.dev/routing/introduction/).
