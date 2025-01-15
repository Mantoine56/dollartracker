# DollarTracker Project Structure

.
|-- app/                                # Main application directory containing all routes and screens
|   |-- (auth)/                        # Authentication related screens and routes
|   |   |-- _layout.tsx               # Authentication navigation layout configuration
|   |   |-- confirm.tsx               # Email/Phone confirmation screen
|   |   `-- login.tsx                 # User login screen
|   |-- (tabs)/                       # Main tab navigation screens
|   |   |-- _layout.tsx               # Tab navigation configuration
|   |   |-- history.tsx               # Transaction history view
|   |   |-- incentives.tsx            # User rewards and achievements screen
|   |   |-- index.tsx                 # Main dashboard/home screen
|   |   |-- settings.tsx              # Application settings screen
|   |   `-- stats.tsx                 # Financial statistics and analytics
|   |-- auth/                         # Additional auth screens
|   |   |-- _layout.tsx               # Auth navigation layout
|   |   |-- forgot-password.tsx       # Password recovery screen
|   |   |-- sign-in.tsx              # Sign in screen
|   |   `-- sign-up.tsx              # Sign up screen
|   |-- context/                      # App-level context providers
|   |   |-- settings-context.tsx      # Settings management context
|   |   |-- supabase-context.tsx      # Supabase client context
|   |   `-- user-context.tsx          # User state management context
|   |-- examples/                     # Example components and screens
|   |   `-- empty-states.tsx          # Empty state examples
|   |-- modals/                       # Modal screens and overlays
|   |   |-- budget-wizard/            # Budget setup wizard
|   |   |   |-- components/           # Wizard-specific UI components
|   |   |   |   |-- budget-review.tsx # Budget review step
|   |   |   |   |-- income-setup.tsx  # Income setup step
|   |   |   |   `-- spending-setup.tsx # Spending setup step
|   |   |   |-- context/             # Wizard state management
|   |   |   |   `-- budget-context.tsx # Budget wizard context
|   |   |   `-- index.tsx             # Main wizard screen
|   |   |-- _layout.tsx               # Modal navigation layout
|   |   |-- export.tsx                # Export data modal
|   |   |-- privacy.tsx               # Privacy policy modal
|   |   `-- terms.tsx                 # Terms of service modal
|   |-- transaction/                  # Transaction management screens
|   |   |-- _layout.tsx               # Transaction navigation layout
|   |   `-- new.tsx                   # New transaction creation screen
|   |-- +html.tsx                     # HTML document configuration
|   |-- +not-found.tsx               # 404 error page
|   |-- _layout.tsx                   # Root navigation layout
|   |-- modal.tsx                     # Modal screen wrapper
|   `-- reset-password.tsx            # Password reset screen
|-- assets/                           # Static assets directory
|   |-- fonts/                        # Custom fonts
|   |   `-- SpaceMono-Regular.ttf     # Space Mono font
|   |-- images/                       # App images
|   |   |-- adaptive-icon.png         # Adaptive app icon
|   |   |-- favicon.png               # Web favicon
|   |   |-- icon.png                  # App icon
|   |   `-- splash-icon.png           # Splash screen icon
|   |-- error.png                     # Error state illustration
|   |-- file.png                      # File icon
|   |-- forward.png                   # Forward navigation icon
|   |-- icon.png                      # App icon
|   |-- logotype.png                  # App logotype
|   |-- pkg.png                       # Package icon
|   |-- sitemap.png                   # Sitemap illustration
|   |-- splash.png                    # Splash screen
|   `-- unmatched.png                 # Unmatched state illustration
|-- components/                       # Reusable UI components
|   |-- budget/                       # Budget-related components
|   |   |-- BudgetCircle.tsx          # Budget progress circle
|   |   `-- BudgetDashboard.tsx       # Main budget overview component
|   |-- calendar/                     # Calendar components
|   |   `-- TransactionCalendar.tsx   # Transaction calendar view
|   |-- feedback/                     # User feedback components
|   |   |-- ErrorState.tsx            # Error state component with error handling
|   |   `-- EmptyState.tsx            # Empty state display component
|   |-- layout/                       # Core layout components
|   |   |-- ActionSheet.tsx           # Bottom action sheet
|   |   |-- BottomBar.tsx            # Navigation bar
|   |   |-- Container.tsx            # Layout wrapper
|   |   |-- Drawer.tsx               # Side navigation drawer
|   |   |-- EmptyState.tsx           # Empty state handler
|   |   |-- FAB.tsx                  # Floating action button
|   |   |-- Header.tsx               # App header
|   |   |-- LoadingOverlay.tsx       # Loading indicator
|   |   |-- Modal.tsx                # Modal dialog
|   |   |-- ProgressBar.tsx          # Progress indicator
|   |   |-- Snackbar.tsx             # Notification snackbar
|   |   |-- Toast.tsx                # Toast messages
|   |   `-- index.ts                 # Layout components exports
|   |-- transactions/                # Transaction-related components
|   |   |-- AddTransactionButton.tsx  # Transaction creation button
|   |   `-- TransactionForm.tsx       # Transaction input form
|   |-- ui/                          # Common UI elements
|   |   |-- utils/                    # UI utilities
|   |   |   `-- animations.ts         # Animation utilities
|   |   |-- AchievementCard.tsx       # Achievement display component
|   |   |-- AchievementUnlock.tsx     # Achievement unlock modal
|   |   |-- Badge.tsx                 # Badge component
|   |   |-- BudgetInput.tsx           # Budget input component
|   |   |-- Button.tsx               # Reusable button component
|   |   |-- Card.tsx                 # Card component for displaying content
|   |   |-- CategoryPicker.tsx        # Category selection component
|   |   |-- CircularProgress.tsx      # Progress indicator component
|   |   |-- ConfettiExplosion.tsx     # Celebration animation
|   |   |-- DatePicker.tsx            # Date selection component
|   |   |-- Input.tsx                # Input component with validation
|   |   |-- RecurringTransactionInput.tsx  # Recurring transaction form
|   |   |-- SegmentedControl.tsx      # Segmented control component
|   |   |-- StatCard.tsx              # Statistics card component
|   |   |-- TransactionCard.tsx       # Transaction display component
|   |   |-- TransactionList.tsx       # Transaction list component
|   |   `-- index.ts                  # UI components exports
|   |-- EditScreenInfo.tsx            # Screen info editor
|   |-- ExternalLink.tsx              # External link component
|   |-- StyledText.tsx               # Text styling component
|   |-- Themed.tsx                   # Theme-aware components
|   |-- __tests__/                   # Test files
|   |   `-- StyledText-test.js       # Text component tests
|   |-- useClientOnlyValue.ts        # Client-side value hook
|   |-- useClientOnlyValue.web.ts    # Web-specific client value hook
|   |-- useColorScheme.ts            # Color scheme hook
|   `-- useColorScheme.web.ts        # Web-specific color scheme hook
|-- constants/                       # Application constants
|   `-- Colors.ts                    # Color definitions
|-- context/                        # Global context providers
|   |-- auth.tsx                    # Authentication context
|   |-- settings-context.tsx        # Settings context
|   |-- settings.tsx                # Settings provider
|   |-- supabase-context.tsx        # Supabase context
|   |-- supabase.tsx                # Supabase provider
|   |-- user-context.tsx            # User context
|   `-- user.tsx                    # User provider
|-- android/                       # Android native code
|-- ios/                          # iOS native code
|-- app.config.ts                 # Expo configuration
|-- app.json                      # App metadata
|-- expo-env.d.ts                 # Expo environment types
|-- implementation.md             # Implementation documentation
|-- requirements.md               # Project requirements
|-- tree.md                      # Project structure documentation
`-- tsconfig.json                # TypeScript configuration
