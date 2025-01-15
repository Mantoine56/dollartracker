# Dollartracker App - Screens and User Workflows

## 1. Home Screen 
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
*Completed: December 30, 2024 12:22 PM EST*

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
*Completed: December 30, 2024 12:22 PM EST*

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
**Status**: Completed on December 30, 2023

### Components
- **Form Fields**:
  - Amount (with currency symbol).
  - Category selection with icons (Food, Transport, Shopping, Entertainment, Other).
  - Notes field (optional, multiline).
  - Timestamp (auto-filled with current time, editable via date picker).
- Beautiful Material Design 3 UI with proper theming.
- Input validation for required fields.
- "Save Transaction" button.

### Workflow
1. User taps the "+" button on the Home screen.
2. User enters transaction details:
   - Enters amount with decimal support
   - Selects category via icon grid
   - Optionally adds notes
   - Can modify date/time if needed
3. User saves the transaction.
4. App updates daily and overall budget stats.

---

## 5. History Screen 
### Description
Allows users to view and filter their transaction history by timeframes or categories.
**Status**: Completed on December 30, 2023

### Components
- **Filter Bar**:
  - Time frame selector (Today, This Week, This Month, Custom)
  - Category filter with icon menu
  - Search bar for transactions
- **Transaction List**:
  - Grouped by date with daily totals
  - Category icons and colors
  - Transaction details including:
    - Amount
    - Category with icon
    - Notes (if any)
    - Time of transaction
  - Material Design 3 surfaces and elevation

### Workflow
1. User navigates to the History screen
2. User can:
   - Search for specific transactions
   - Filter by time frame using segmented buttons
   - Filter by category using the category menu
   - View transactions grouped by date
   - See daily spending totals
3. Transactions show full details including time and notes

---

## 6. Incentives and Rewards Screen 
### Description
Displays badges, levels, and progress to motivate users to stay within their budget.
**Status**: Completed on December 30, 2023

### Components
- **Level Progress**:
  - Current level display with icon and description
  - Progress bar to next level
  - Points tracking and remaining points display
- **Badge Showcase**:
  - Interactive carousel of badges
  - Badge status (earned/in-progress)
  - Progress tracking for unearned badges
  - Earned date for completed badges
- **Achievements Summary**:
  - Total badges earned
  - Current level
  - Total points earned
- **Visual Elements**:
  - Beautiful Material Design 3 surfaces
  - Animated progress bars
  - Interactive carousel with pagination
  - Custom icons for levels and badges

### Workflow
1. User views their current level and progress
2. User can:
   - Browse badges in the carousel
   - Check progress on unearned badges
   - View achievement statistics
   - Track points needed for next level
3. App provides visual feedback for progress
4. Notifications for new achievements (to be implemented)

---

## 7. Settings Screen 
### Description
Provides users with options to customize their experience and manage preferences.

**Status**: Completed on December 30, 2023

### Components
- **Budget Setup**:
  - Quick access to budget configuration
  - Daily and monthly budget limits
  - Visual feedback with wallet icon
- **Theme**:
  - Toggle between light and dark mode
  - Theme preview and customization
  - Material Design 3 integration
- **Notifications**:
  - Budget updates toggle
  - Achievement notifications toggle
  - Granular control over notification types
- **App Info**:
  - Version information
  - About section
- **Visual Elements**:
  - Material Design 3 surfaces
  - Consistent iconography
  - Interactive switches and buttons
  - Clean section dividers

### Workflow
1. User navigates to the Settings screen
2. User can:
   - Access budget setup
   - Toggle dark mode
   - Configure notification preferences
   - View app information
3. Changes are applied immediately
4. Settings persist across app restarts

---

## 8. Login/Signup Screen 
### Description
Handles user authentication and data synchronization with a beautiful and modern interface.

**Status**: Completed on December 30, 2023

### Components
- **Branded Splash Screen**:
  - Custom logo animation
  - Gradient background
  - App title and tagline
- **Authentication Buttons**:
  - Google Sign-In with official branding
  - Apple Sign-In (iOS only) with system button
  - Material Design 3 styling
- **Error Handling**:
  - Friendly error messages
  - Visual error indicators
  - Clear recovery actions
- **Visual Elements**:
  - Linear gradient background
  - Elevated surfaces
  - Consistent iconography
  - Platform-specific adaptations
  - Proper spacing and typography

### Workflow
1. User opens the app for the first time
2. User is presented with:
   - App branding and value proposition
   - Authentication options
   - Terms of service notice
3. User selects a login option:
   - Google Sign-In for all platforms
   - Apple Sign-In for iOS devices
4. App handles authentication:
   - Shows loading state
   - Displays errors if they occur
   - Redirects to main app on success
5. Data syncs automatically after login

---

## 9. Empty States and Error Handling 
### Description
Provides feedback when no data is available or errors occur, with a reusable component that can be used throughout the app.
**Status**: Completed on December 30, 2023

### Components
- **EmptyState Component**:
  - Customizable icon from MaterialCommunityIcons
  - Title and description text
  - Optional action button
  - Error state styling
  - Responsive layout
- **Example States**:
  - No Transactions
  - No Budget Set
  - No Badges
  - Network Error
  - Session Expired
- **Visual Elements**:
  - Large, clear icons
  - Clear typography hierarchy
  - Action buttons for recovery
  - Error-specific styling
  - Consistent spacing and layout

### Workflow
1. Component detects empty state or error condition
2. Displays appropriate illustration and message:
   - Uses relevant icon for the context
   - Shows clear, actionable message
   - Provides recovery action when applicable
3. User can:
   - Understand the current state
   - Take action to resolve the situation
   - Navigate to relevant screens

### Implementation Notes
- Created reusable EmptyState component in `/components/feedback/EmptyState.tsx`
- Added example screen in `/app/examples/empty-states.tsx`
- Uses Material Design 3 theming
- Supports both light and dark modes
- Follows accessibility guidelines
