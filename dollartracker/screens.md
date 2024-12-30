# Dollartracker App - Screens and User Workflows

## 1. Home Screen ✅
### Description
The Home Screen serves as the primary interface for users to track their daily spending and monitor their remaining allowance. It prominently displays today’s budget status and recent transactions.
*Completed: December 30, 2024 11:39 AM EST*

### Components
- **Header**:
  - Display "Today’s Allowance" with a dynamic color-coded progress ring (green, amber, red based on spending status).
  - Calendar dropdown to navigate to other days.
- **Daily Transactions**:
  - Scrollable list of transactions, each showing:
    - Category icon.
    - Timestamp.
    - Amount.
    - Optional notes.
  - Floating "+" button to add new transactions.
- **Footer Navigation Bar**:
  - Icons for Home, History, Stats, and Settings.

### Workflow
1. User opens the app and sees their daily allowance status.
2. User views recent transactions in the list.
3. User adds a transaction by tapping the "+" button.
4. The app updates the daily allowance dynamically.

---

## 2. Budget Setup Screen
### Description
Allows users to define their budget for a chosen timeframe and calculates their daily allowance based on this input.

### Components
- **Step 1**: Budget input (numeric fields).
- **Step 2**: Budget period selection (weekly, biweekly, monthly).
- **Step 3**: Daily allowance confirmation with auto-calculation.
- Progress bar for setup completion.
- "Save and Continue" button.

### Workflow
1. User selects a budget amount.
2. User chooses a budget period.
3. App calculates and displays daily allowance.
4. User confirms and saves settings to start tracking.

---

## 3. Stats Dashboard
### Description
Provides an overview of the user’s financial stats with visualizations to track trends and analyze spending.

### Components
- **Monthly Spending Progress**: Bar chart.
- **Spending Patterns**: Heatmap to visualize high and low spending periods across the month.
- **Trends**: Line graph.
- Toggle options for "This Week," "This Month," and "Custom Range."
- Export button for CSV/PDF.

### Workflow
1. User navigates to the Stats screen.
2. User toggles the timeframe for viewing trends.
3. User exports the data for offline analysis if needed.

---

## 4. Daily Transaction Entry
### Description
Screen for users to enter details about a transaction.

### Components
- **Form Fields**:
  - Amount.
  - Category (dropdown).
  - Notes (optional).
  - Timestamp (auto-filled, editable).
- "Save Transaction" button.

### Workflow
1. User taps the "+" button on the Home screen.
2. User enters transaction details.
3. User saves the transaction.
4. App updates daily and overall budget stats.

---

## 5. History Screen
### Description
Allows users to view and filter their transaction history by timeframes or categories.

### Components
- **Filter Bar**:
  - Dropdowns for day, week, month, and category.
- **Transaction List**:
  - Grouped by date.
  - Includes search functionality.

### Workflow
1. User navigates to the History screen.
2. User selects filters to narrow the displayed transactions.
3. User views transaction details.

---

## 6. Incentives and Rewards Screen
### Description
Displays badges, levels, and progress to motivate users to stay within their budget.

### Components
- **Badge Showcase**:
  - Carousel of earned badges with icons and descriptions.
- **Level Progress**:
  - Horizontal progress bar with motivational labels.

### Workflow
1. User views badges and progress.
2. App sends notifications when milestones are achieved.

---

## 7. Settings Screen
### Description
Provides users with options to customize their experience and manage preferences.

### Components
- **Theme**: Toggle between light and dark mode.
- **Notifications**: Toggle for budget updates and achievements.
- **Export Preferences**: Select CSV or PDF format.
- **Account Management**: Log in/log out, manage linked accounts.

### Workflow
1. User navigates to the Settings screen.
2. User adjusts preferences as needed.
3. User logs out or updates account information if necessary.

---

## 8. Login/Signup Screen
### Description
Handles user authentication and data synchronization.

### Components
- **Branded Splash Screen**.
- **Authentication Buttons**:
  - Google Sign-In.
  - Apple Sign-In.
- **Error Handling**: Friendly messages for failed login attempts.

### Workflow
1. User opens the app for the first time.
2. User selects a login option.
3. App authenticates the user and syncs data.

---

## 9. Empty States and Error Handling
### Description
Provides feedback when no data is available or errors occur.

### Components
- **Empty State Illustrations** with motivational text.
- **Error Messages** with actionable suggestions.

### Workflow
1. User encounters an empty state or error.
2. App displays relevant illustration and message.
3. User takes action based on suggested steps.

---
