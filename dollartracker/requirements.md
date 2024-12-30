# Dollartracker App Requirements Document

## Purpose
The Dollartracker app aims to help users manage their personal finances by providing tools to track daily spending against a monthly budget. The app will motivate users to stay within their budget through stats, history tracking, and incentives like badges.

---

## Features

### 1. Budget Setup
- **Budget Input**: Users can enter their spending budget for custom timeframes (weekly, biweekly, or monthly).
- **Daily Allowance Calculation**: The app calculates a daily spending allowance based on the selected budget period and the number of days in the period.

### 2. Daily Transaction Tracking
- **Transaction Entry**: Users can input multiple daily spending amounts with timestamps.
- **Allowance Adjustment**: If users underspend on a given day, the unspent amount is added to their total allowable spend for the period. The next day’s budget dynamically adjusts.

### 3. History and Stats
- **Transaction History**:
  - Display of past transactions grouped by day, week, or month.
  - Filter and search functionality for easier access.
- **Statistics Dashboard**:
  - Monthly spending progress.
  - Breakdown of spending categories.
  - Visualization (graphs or charts) of spending trends.
  - Export transaction history as a CSV file for external analysis.

### 4. Incentives and Rewards
- **Badges and Levels**: Earn badges and progress through levels for milestones like "Stayed Under Budget for a Week" or "Saved 10% of Monthly Budget."
- **Encouragement Notifications**: Receive positive reinforcement messages, including personalized messages tied to rewards.
- **Levels and Milestones**: Unlock levels or reach milestones for consistent budget adherence.

### 5. User Account
- **Local Storage**: Ensure user data persists between app sessions.
- **Cloud Sync**: Allow for data backup and retrieval through account-based login (e.g., using Google or Apple sign-in).
- **Data Security**: Ensure robust security for financial data.

### 6. Settings and Customization
- **Adjustable Budget Periods**: Option to set budgets for custom timeframes (weekly, biweekly, etc.).
- **Recurring Expenses**: Add recurring transactions like subscriptions or rent for accurate budgeting.
- **Theme Selection**: Dark mode and light mode support.
- **Export Preferences**: Users can choose to export transaction history as a CSV or PDF.
- **Notification Preferences**: Toggle notifications for budget updates, badge achievements, reminders, and email summaries.
---

## Technical Specifications

### 1. Front-End
- **Framework**: React Native with Expo
- **Deployment Platform**: iOS (primary), with Android support planned
- **UI Library**: React Native Paper for Material Design components
- **Navigation**: Expo Router for type-safe navigation
- **Styling**: Custom theme system with light/dark mode support

### 2. Back-End
- **Database**: Supabase for managing user data and transactions
- **Cloud Sync**: Supabase real-time subscriptions for live updates
- **Authentication**: Supabase Auth with social login support

### 3. Tools and Libraries
- **Development Platform**: Expo SDK
- **State Management**: React Context for theming and global state
- **Layout Components**:
  - Container: Safe area and scroll handling
  - Header: Customizable navigation header
  - Screen: Combined container and header
  - BottomBar: Tab navigation
  - FAB: Floating action button
  - Modal: Custom modal dialogs
  - Drawer: Side navigation
  - Toast & Snackbar: User notifications
  - ActionSheet: iOS-style options
  - LoadingOverlay: Loading states
  - EmptyState & ErrorState: Status displays
  - ProgressBar: Visual progress tracking
- **Local Storage**: AsyncStorage for persistent data
- **Development Tools**: 
  - TypeScript for type safety
  - ESLint for code quality
  - Prettier for code formatting

---

## User Flow

### 1. Initial Setup
1. User downloads the app from the iOS App Store.
2. On first launch, the app prompts the user to set a monthly budget.
3. Daily allowance is displayed on the home screen.

### 2. Daily Use
1. User enters multiple daily transaction amounts as they occur.
2. The app recalculates remaining budget and updates the daily allowance.
3. Incentives and badges are displayed when milestones are reached.
4. The app alerts the user when they are nearing their monthly budget limit.

### 3. Stats and History
1. User navigates to the Stats section for insights into their spending.
2. User can view detailed transaction history.
3. Weekly email summaries provide users with updates on their spending progress.

---

## Future Enhancements
- **Cross-Platform Deployment**: Expand to Android.
- **Social Features**: Allow users to share milestones or compare progress with friends.
- **Bank Integration**: Enable automatic import of transactions from linked bank accounts.
- **Overspending Insights**: Provide detailed analysis on spending habits to help users adjust their behavior effectively.

---

## Development Timeline

### Phase 1: MVP (3 Months)
- Core functionality (budget input, daily transactions, allowance adjustments).
- Basic stats and history tracker.
- Cloud sync via Supabase.
- UI/UX for a clean and intuitive user experience.

### Phase 2: Feature Expansion (2 Months)
- Incentives and badges.
- Advanced stats and visualizations.
- CSV export functionality.

### Phase 3: Optimization and Deployment (1 Month)
- Testing and debugging.
- Submission to the iOS App Store.

---

## Success Metrics
- User engagement: Percentage of users logging transactions daily.
- Retention rate: Users actively using the app for at least three months.
- Budget adherence: Percentage of users staying within their budget.

---

## Summary
Dollartracker will provide an intuitive and engaging way for users to manage their finances by focusing on daily spending and long-term tracking. By leveraging React Native, Expo, and Supabase, the app will be scalable and user-friendly, with potential for future enhancements based on user feedback.
