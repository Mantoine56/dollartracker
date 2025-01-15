# Dollartracker App - UI/UX Design Guidelines

## Design Philosophy
The Dollartracker app will adhere to a **minimalist yet visually engaging design philosophy**. It will prioritize usability, clarity, and a clean aesthetic, ensuring users can focus on managing their finances without distractions. The design will be adaptable for iOS first, and eventually Android, maintaining a consistent experience across platforms.

---

## General UI Guidelines
- **Color Palette**:
  - Primary Colors: Soft blue (#1E90FF) and white (#FFFFFF) for a clean and calming interface.
  - Accent Colors: Subtle green (#32CD32) for positive actions and warnings in amber (#FFA500).
  - Background: Light gray (#F8F9FA) for balance.
  - Dark Mode: Replace white with dark gray (#1E1E1E) and soft blue with muted cyan (#58A6FF).

- **Typography**:
  - Use **San Francisco** (iOS) and **Roboto** (Android) for system consistency.
  - Font Sizes:
    - Title: 24px, bold.
    - Subtitles: 18px, medium.
    - Body Text: 16px, regular.
    - Hints/Descriptions: 14px, regular, slightly muted.

- **Iconography**:
  - Use a minimalist line-style icon set (e.g., Feather or Material Icons).
  - Consistently sized icons at 24px.

- **Spacing and Alignment**:
  - Maintain 8px and 16px increments for paddings and margins.
  - Align components to a grid for a structured and harmonious layout.

---

## Home Screen
- **Budget Circle**:
  - Large circular progress indicator with animated fill
  - Thick border (10px) with gradient colors (success: #4CAF50 to #45A049, error: #FF5252 to #FF1744)
  - Inner shadow for depth (elevation: 4)
  - Centered amount display with remaining balance below
  - Smooth animation on progress updates

- **Date Display**:
  - Light card with subtle shadow
  - Calendar icon with date text
  - Rounded corners (8px)
  - White background with slight elevation

- **Transaction Cards**:
  - Clean white cards with consistent spacing
  - Gradient icon containers (#E3F2FD to #BBDEFB)
  - Proper shadow elevation (3) with no clipping
  - Category icon with text
  - Amount aligned to the right
  - Vertical spacing between cards (16px)
  - Rounded corners (12px)

- **Layout Spacing**:
  - Minimal top padding (8px) to maximize screen space
  - Centered section titles
  - Proper margins to prevent shadow clipping
  - Consistent padding (16px) for content sections

---

## Budget Setup Screen
- **Flow**:
  1. Step-by-step setup wizard:
      - Step 1: Enter total budget and select period (weekly/biweekly/monthly).
      - Step 2: Confirm or adjust calculated daily allowance.
  2. Use a progress bar to indicate completion.

- **UI Elements**:
  - Numeric input fields with clear labels.
  - Period selection via pill-shaped buttons (highlighted when selected).
  - "Save and Continue" CTA at the bottom.

---

## Stats Dashboard
- **Overview**:
  - Use a card layout for:
    - Monthly Spending Progress: Bar chart.
    - Spending Categories: Pie chart.
    - Trends: Line graph.

- **Interactions**:
  - Allow users to toggle between "This Week," "This Month," and "Custom Range" via segmented controls.
  - Provide a download button to export data (CSV/PDF).

---

## Incentives and Rewards
- **Badge Showcase**:
  - Carousel of earned badges, each with:
    - Icon.
    - Title.
    - Short description (e.g., "Under Budget for 7 Days").

- **Level Progress**:
  - Horizontal progress bar to show user’s level progression.
  - Use motivational labels like "Keep it up!" or "Almost there!"

---

## History and Transactions
- **Filter Options**:
  - Sticky filter bar at the top with dropdowns for day, week, month, or category.

- **Transaction List**:
  - Group transactions by day, with date headers.
  - Provide search functionality with an input field and search icon.

---

## User Account and Sync
- **Login/Signup**:
  - Display branded splash screen on app launch.
  - Allow login via Google and Apple with large, tappable buttons.

- **Account Settings**:
  - Sections for:
    - Theme: Toggle between light and dark modes.
    - Notification Preferences: Enable/disable budget reminders and badges.
    - Export Preferences: Choose CSV or PDF.

---

## Error Handling
- **Empty States**:
  - Use playful illustrations and motivating messages (e.g., "No transactions yet! Start adding to track your progress.").

- **Error Messages**:
  - Use friendly, actionable text (e.g., "Oops, something went wrong. Try again later.").

---

## Accessibility
- Ensure full VoiceOver and TalkBack support.
- Maintain contrast ratios for all text and interactive elements.
- Provide haptic feedback for major interactions (e.g., adding a transaction, completing a budget setup).

---

## Future Considerations
- Add support for Android Material Design elements (e.g., FloatingActionButton, Snackbar).
- Include animations for transitions between screens.
- Introduce gamification elements (e.g., animations for earning badges).