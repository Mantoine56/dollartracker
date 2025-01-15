# DollarTracker Settings Page Plan and Implementation

## Overview

The settings page will serve as a centralized hub where users can customize their DollarTracker app experience. Located in `/app/(tabs)/settings.tsx`, it will provide comprehensive control over app preferences while maintaining performance through React Native Paper components and proper state management.

---

## Functional Requirements

### Budget Management

- **Budget Configuration**:
  - Set budget period (weekly, biweekly, monthly) using segmented control
  - Configure recurring expenses with date and amount
  - Set daily spending limits with validation
- **Visual Feedback**:
  - Display current budget overview using `StatCard` component
  - Show remaining balance with circular progress

### Theme Management

- **Theme Controls**:
  - System/Light/Dark mode selection via segmented control
  - Uses React Native Paper's MD3 theming
  - Instant preview with animation transitions
- **Safe Area Handling**:
  - Proper inset management using `SafeAreaView`
  - Consistent spacing across devices

### Notification Preferences

- **Push Notifications**:
  - Daily budget updates and reminders
  - Achievement unlocks and level progression
  - Approaching budget limit alerts
- **Email Preferences**:
  - Weekly spending summaries
  - Monthly budget reports
  - Account activity alerts

### Data Management

- **Export Options**:
  - Transaction history export (CSV/PDF)
  - Custom date range selection
  - Export progress indicator
- **Data Sync**:
  - Supabase sync status indicator
  - Manual sync trigger option
  - Last sync timestamp display

### Account Settings

- **Profile Management**:
  - Update display name and email
  - Change password with Zod validation
  - Delete account with confirmation modal
- **Security**:
  - Biometric authentication toggle
  - App lock timeout selection
  - Session management

### App Information

- **App Details**:
  - Version number and build
  - Acknowledgments and licenses
  - Support contact information

---

## Technical Implementation

### Component Structure

```typescript
// app/(tabs)/settings.tsx
export function SettingsScreen() {
  return (
    <Screen>
      <ScrollView>
        <BudgetSection />
        <ThemeSection />
        <NotificationSection />
        <DataSection />
        <AccountSection />
        <AppInfoSection />
      </ScrollView>
    </Screen>
  );
}
```

### State Management

- **Settings Context**:
  ```typescript
  interface SettingsState {
    budgetPeriod: 'weekly' | 'biweekly' | 'monthly';
    theme: 'system' | 'light' | 'dark';
    notifications: {
      pushEnabled: boolean;
      emailDigest: boolean;
      achievements: boolean;
      budgetAlerts: boolean;
    };
    security: {
      biometricEnabled: boolean;
      lockTimeout: number;
    };
  }
  ```

### Database Schema

- **settings Table**:
  ```sql
  create table public.settings (
    id uuid references auth.users primary key,
    budget_period text not null,
    theme text not null,
    notifications jsonb not null,
    security jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  ```

### UI Components

- **Section Components**:
  - Use `Card` from React Native Paper
  - Consistent padding and spacing
  - Proper accessibility labels
  - Loading states with skeletons

### Navigation

- **Modal Screens**:
  - Export options modal
  - Delete account confirmation
  - Advanced settings

### Performance Optimization

- Memoized section components
- Debounced settings updates
- Lazy-loaded modals
- Optimistic UI updates

---

## Implementation Steps

1. **Core Structure**:
   - Create settings screen and sections
   - Implement settings context
   - Set up Supabase tables

2. **UI Components**:
   - Build reusable section components
   - Implement form controls
   - Add loading states

3. **State Management**:
   - Settings persistence logic
   - Real-time sync with Supabase
   - Offline support

4. **Features**:
   - Theme switching
   - Export functionality
   - Notification management
   - Account operations

5. **Testing & Optimization**:
   - Performance testing
   - Accessibility audit
   - Cross-device testing

---

## Success Metrics

- Settings changes persist correctly
- Theme switches are smooth
- Export completes within 3 seconds
- UI remains responsive
- No unnecessary re-renders

---

## Current Status (Jan 6, 2025)

### Completed
- ✅ Created settings context with state management
- ✅ Implemented settings screen UI with all required components
- ✅ Set up Supabase table for settings storage
- ✅ Fixed authentication and context provider issues
- ✅ Integrated with theme system
- ✅ Added export functionality structure

### In Progress
- 🔄 Settings functionality implementation
- 🔄 Data persistence with Supabase
- 🔄 Real-time settings updates

### Technical Implementation

#### Context Structure
```typescript
interface SettingsState {
  budgetPeriod: 'weekly' | 'biweekly' | 'monthly';
  theme: 'system' | 'light' | 'dark';
  notifications: {
    pushEnabled: boolean;
    emailDigest: boolean;
    achievements: boolean;
    budgetAlerts: boolean;
  };
  security: {
    biometricEnabled: boolean;
    lockTimeout: number;
  };
}
```

#### Provider Chain
```tsx
<SafeAreaProvider>
  <PaperProvider>
    <NavigationThemeProvider>
      <QueryClientProvider>
        <AuthProvider>
          <UserProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NavigationThemeProvider>
  </PaperProvider>
</SafeAreaProvider>
```

## Next Steps

### 1. Settings Persistence
- [ ] Implement proper error handling in settings context
- [ ] Add loading states for settings operations
- [ ] Create Supabase RLS policies for settings table
- [ ] Add optimistic updates for better UX
- [ ] Implement retry logic for failed operations

### 2. Theme Management
- [ ] Connect theme selection to React Native Paper theme
- [ ] Implement proper system theme detection
- [ ] Add theme preview in settings
- [ ] Persist theme preference in Supabase

### 3. Security Features
- [ ] Implement biometric authentication using expo-local-authentication
- [ ] Add auto-lock timeout functionality
- [ ] Create secure storage for sensitive settings
- [ ] Add session management features

### 4. Notifications
- [ ] Set up expo-notifications
- [ ] Implement notification permission handling
- [ ] Create notification scheduling system
- [ ] Add notification preferences sync

### 5. Export Functionality
- [ ] Complete CSV export implementation
- [ ] Add PDF export with proper formatting
- [ ] Implement progress tracking for exports
- [ ] Add export history

### 6. Testing & Validation
- [ ] Add unit tests for settings context
- [ ] Create integration tests for settings persistence
- [ ] Test all settings combinations
- [ ] Validate proper error handling

## Known Issues
1. Settings functions not working after initial setup
2. Theme changes not reflecting immediately
3. Export modal needs proper error handling
4. Settings state not persisting after app restart

## Dependencies
- @react-native-async-storage/async-storage
- @supabase/supabase-js
- expo-secure-store
- expo-local-authentication
- expo-notifications
- react-native-paper
- expo-file-system
- expo-sharing

## Security Considerations
- All settings mutations must go through RLS policies
- Sensitive settings should be stored in secure storage
- Biometric authentication should be properly validated
- Export functionality should respect user permissions

## Performance Optimizations
- Implement settings caching
- Use optimistic updates for better UX
- Batch settings updates when possible
- Lazy load export functionality

---

## Navigation Structure

The app uses Expo Router for file-based navigation with the following structure:

```
app/
├── _layout.tsx              # Root navigation layout
├── (auth)/                 # Authentication routes
│   ├── _layout.tsx         # Auth navigation layout
│   └── login.tsx           # Login screen
├── (tabs)/                 # Main app tabs
│   ├── _layout.tsx         # Tab navigation layout
│   ├── index.tsx           # Home screen
│   └── settings.tsx        # Settings screen
└── modals/                 # Modal screens
    └── _layout.tsx         # Modal navigation layout
```

### Navigation Flow
- Unauthenticated users are redirected to `/(auth)/login`
- Authenticated users are redirected to `/(tabs)`
- Modal screens are available in both states

## Theme System

### Theme Configuration
The app uses React Native Paper's theming system with support for:
- Light mode
- Dark mode
- System preference (default)

Theme preferences are:
1. Stored in Supabase `settings` table
2. Managed through the `SettingsProvider`
3. Applied via `useAppTheme` hook

### Theme Structure
```typescript
interface ThemeConfig {
  paperTheme: MD3Theme;
  navigationTheme: Theme;
}

// Colors follow Material Design 3 guidelines
interface ThemeColors {
  primary: string;
  secondary: string;
  error: string;
  background: string;
  surface: string;
  text: string;
}
```

### Provider Hierarchy
```tsx
<GestureHandlerRootView>
  <QueryClientProvider>
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <SettingsProvider>
            <ThemedApp>
              <NavigationContent />
            </ThemedApp>
          </SettingsProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
</GestureHandlerRootView>
```

## Settings Management

### Database Schema
```sql
create table public.settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  theme text default 'system',
  notifications_enabled boolean default true,
  email_notifications_enabled boolean default true,
  custom_budget_period text,
  export_preferences jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Settings Context
The `SettingsProvider` manages:
1. Theme preferences
2. Notification settings
3. Budget period customization
4. Export preferences

### Usage Example
```typescript
function SettingsScreen() {
  const { state, updateSettings } = useSettings();
  
  return (
    <View>
      <SegmentedButtons
        value={state.theme}
        onValueChange={theme => 
          updateSettings({ theme })
        }
        buttons={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]}
      />
    </View>
  );
}
```

## Safe Area Handling
- Uses `react-native-safe-area-context`
- Automatically handles notches and system bars
- Consistent spacing across different devices

## Performance Considerations
- Theme changes are persisted to Supabase
- Uses React Query for efficient data fetching
- Implements proper provider memoization
- Avoids unnecessary re-renders

## Future Improvements
- [ ] Add theme preview in settings
- [ ] Support custom color schemes
- [ ] Add animation preferences
- [ ] Implement theme scheduling
