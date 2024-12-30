# DollarTracker Project Structure

## Root Directory
The root directory contains configuration files and the main application structure.

- `README.md` - Project documentation and setup instructions
- `app.json` - Expo application configuration file
- `babel.config.js` - Babel configuration for JavaScript/TypeScript transpilation
- `app.js` - Main application entry point

## Core Application (`/app`)
The main application code organized using the new Expo Router file-system based routing.

### Tabs Navigation (`/app/(tabs)`)
Contains the main tab-based navigation structure:
- `_layout.tsx` - Tab navigation layout configuration
- `index.tsx` - Home/main tab screen
- `history.tsx` - Transaction history view
- `stats.tsx` - Statistics and analytics view

### Transaction Management (`/app/transaction`)
Handles transaction-related functionality:
- `new.tsx` - New transaction creation interface

## Assets Directory (`/assets`)
Contains static assets used throughout the application:
- `error.png` - Error state illustration
- `logotype.png` - Application logo
- `forward.png`, `file.png`, `pkg.png`, `sitemap.png`, `unmatched.png` - UI icons and elements

## Build Directory (`/build`)
Contains compiled files and build artifacts:

### Navigation Related
- `ExpoRoot.js/ts` - Expo router root configuration
- `LocationProvider.js/ts` - Navigation location provider
- `Route.js/ts` - Route handling utilities

### Fork Directory (`/build/fork`)
Contains navigation-related utilities and components:
- Navigation container implementations
- Path and state management utilities
- Back button handling
- Document title management
- Deep linking functionality

### Doctor Directory (`/build/doctor`)
Contains diagnostic and debugging utilities

## Context Files (Root Level)
Various context-specific implementations:
- `_ctx.android.js` - Android-specific context
- `_ctx.ios.js` - iOS-specific context
- `_ctx.web.js` - Web-specific context
- `_ctx-shared.js` - Shared context functionality
- `_ctx-html.js` - HTML-specific context handling

This project appears to be a React Native/Expo application with a focus on tracking financial transactions, featuring a tab-based navigation system and cross-platform compatibility.
