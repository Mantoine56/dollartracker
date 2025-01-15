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
|   |-- examples/                     # Example components and screens
|   |   `-- empty-states.tsx          # Empty state examples
|   |-- modals/                       # Modal screens and overlays
|   |   |-- budget-wizard/            # Budget setup wizard
|   |   |   |-- components/           # Wizard-specific UI components
|   |   |   |-- context/              # Wizard state management
|   |   |   `-- index.tsx             # Main wizard screen
|   |   `-- _layout.tsx               # Modal navigation layout
|   |-- transaction/                  # Transaction management screens
|   |   `-- new.tsx                   # New transaction creation screen
|   `-- _layout.tsx                   # Root navigation layout
|-- assets/                           # Static assets directory
|   |-- error.png                     # Error state illustration
|   |-- file.png                      # File icon
|   |-- forward.png                   # Forward navigation icon
|   |-- icon.png                      # App icon
|   |-- logotype.png                  # App logotype
|   |-- pkg.png                       # Package icon
|   |-- sitemap.png                   # Sitemap illustration
|   |-- splash.png                    # App splash screen
|   `-- unmatched.png                 # Unmatched state illustration
|-- components/                       # Reusable UI components
|   |-- budget/                       # Budget-related components
|   |   `-- BudgetDashboard.tsx       # Main budget overview component
|   |-- feedback/                     # User feedback components
|   |   `-- EmptyState.tsx            # Empty state display component
|   |-- layout/                       # Core layout components
|   |   |-- ActionSheet.tsx           # Bottom action sheet
|   |   |-- BottomBar.tsx            # Navigation bar
|   |   |-- Container.tsx            # Layout wrapper
|   |   |-- Drawer.tsx               # Side navigation drawer
|   |   |-- EmptyState.tsx           # Empty state handler
|   |   |-- ErrorState.tsx           # Error display
|   |   |-- FAB.tsx                  # Floating action button
|   |   |-- Header.tsx               # App header
|   |   |-- LoadingOverlay.tsx       # Loading indicator
|   |   |-- Modal.tsx                # Modal dialog
|   |   |-- ProgressBar.tsx          # Progress indicator
|   |   |-- Screen.tsx               # Screen container
|   |   |-- Snackbar.tsx             # Notification snackbar
|   |   |-- Toast.tsx                # Toast messages
|   |   `-- index.ts                 # Layout components exports
|   |-- transactions/                # Transaction-related components
|   |   |-- AddTransactionButton.tsx  # Transaction creation button
|   |   `-- TransactionForm.tsx       # Transaction input form
|   `-- ui/                          # Common UI elements
|       |-- utils/                    # UI utilities
|       |   `-- animations.ts         # Animation utilities
|       |-- AchievementCard.tsx       # Achievement display component
|       |-- AchievementUnlock.tsx     # Achievement unlock modal
|       |-- AchievementProgress.tsx   # Achievement progress display
|       |-- Badge.tsx                 # Badge component
|       |-- BudgetInput.tsx           # Budget input component
|       |-- Button.tsx                # Button component
|       |-- Card.tsx                  # Card container component
|       |-- CategoryPicker.tsx        # Category selection component
|       |-- CircularProgress.tsx      # Progress indicator component
|       |-- ConfettiExplosion.tsx     # Celebration animation
|       |-- DatePicker.tsx            # Date selection component
|       |-- Input.tsx                 # Text input component
|       |-- ProgressRing.tsx          # Circular progress indicator
|       |-- RecurringTransactionInput.tsx  # Recurring transaction form
|       |-- RewardBadge.tsx           # Achievement badge component
|       |-- Screen.tsx                # Screen component
|       |-- SegmentedControl.tsx      # Segmented control component
|       |-- StatCard.tsx              # Statistics card component
|       |-- TransactionCard.tsx       # Transaction display component
|       `-- index.ts                  # UI components exports
|-- constants/                       # Application constants
|   |-- theme.ts                     # Theme constants and configurations
|   |-- achievements.ts              # Achievement definitions
|   `-- categories.ts               # Transaction categories
|-- context/                        # React Context Providers
|   |-- auth.tsx                    # Authentication context provider
|   |-- supabase.tsx               # Supabase context provider
|   `-- user.tsx                   # User context provider
|-- lib/                           # Core application logic
|   |-- hooks/                     # Custom React Hooks
|   |   |-- useCategories.ts        # Category management hook
|   |   |-- useAchievementProgress.ts # Achievement tracking hook
|   |   |-- useTransactions.ts      # Transaction management hook
|   |   |-- useSpendingStats.ts     # Spending analytics hook
|   |   |-- useBudgetProgress.ts    # Budget tracking hook
|   |   `-- useRewards.ts          # Rewards system hook
|   |-- services/                  # Business logic services
|   |   |-- budget-service.ts       # Budget management service
|   |   |-- rewards-service.ts      # Rewards system service
|   |   `-- transaction.service.ts  # Transaction management service
|   |-- types/                     # TypeScript type definitions
|   |   `-- budget.ts               # Budget-related types
|   |-- utils/                     # Utility functions
|   |   `-- currency.ts             # Currency formatting utilities
|   |-- validation/                # Data validation
|   |   `-- budget-schema.ts        # Budget data validation schemas
|   |-- cache.ts                   # Caching implementation
|   |-- database.ts                # Database operations
|   |-- enhanced-hooks.ts          # Enhanced React hooks
|   |-- hooks.ts                   # Common hooks
|   |-- query-client.ts            # React Query configuration
|   `-- supabase.ts               # Supabase client configuration
|-- link/                         # Deep linking configuration
|   |-- index.d.ts                # Deep linking type definitions
|   `-- index.js                  # Deep linking implementation
|-- node/                         # Node.js specific utilities
|   |-- getExpoConstantsManifest.js  # Expo constants helper
|   `-- render.js                 # Server-side rendering utility
|-- plugin/                       # Expo plugin configuration
|   |-- src/                      # Plugin source code
|   |   `-- index.ts              # Plugin entry point
|   |-- jest.config.js            # Jest test configuration
|   |-- options.json              # Plugin options
|   `-- tsconfig.json             # TypeScript configuration for plugin
|-- rsc/                         # React Server Components
|   |-- entry.js                  # RSC entry point
|   |-- headers.d.ts              # Header type definitions
|   |-- headers.js                # Header utilities
|   |-- index.js                  # RSC exports
|   `-- internal.js               # Internal RSC utilities
|-- supabase/                    # Supabase backend configuration
|   |-- functions/               # Serverless functions
|   |   |-- create-default-categories/  # Category initialization
|   |   |   `-- index.ts          # Function implementation
|   |   |-- calculate-achievements/   # Achievement processing
|   |   |   `-- index.ts          # Achievement calculation
|   |   `-- spending-analytics/      # Spending analysis
|   |       `-- index.ts          # Analytics processing
|   |-- migrations/              # Database migrations
|   |   |-- 20231230_initial_schema.sql      # Initial schema
|   |   |-- 20250102_add_default_categories.sql  # Add categories
|   |   `-- 20250102_rollback_categories.sql    # Rollback script
|   |-- scripts/                # Database management scripts
|   |   |-- RLsec.md            # Security documentation
|   |   |-- dbtest.md           # Database testing guide
|   |   `-- schema.md           # Schema documentation
|   `-- config.toml             # Supabase configuration
|-- theme/                      # Theme configuration
|   |-- ThemeProvider.tsx       # Theme context provider
|   |-- index.ts               # Theme exports
|   `-- theme.config.ts        # Theme configuration
|-- types/                     # Global TypeScript types
|   |-- database.ts            # Database types
|   |-- expect.d.ts            # Test expectation types
|   |-- index.d.ts             # Global type declarations
|   `-- transactions.ts        # Transaction types
|-- README.md                  # Project documentation and setup instructions
|-- _async-server-import.js    # Async server import utility
|-- _ctx-html.js              # HTML context utilities
|-- _ctx-shared.js            # Shared context utilities
|-- _ctx.android.js           # Android-specific context
|-- _ctx.d.ts                 # Context type definitions
|-- _ctx.ios.js               # iOS-specific context
|-- _ctx.js                   # Base context implementation
|-- _ctx.web.js               # Web-specific context
|-- _error.js                 # Error handling utilities
|-- app.js                    # Main application entry point
|-- app.json                  # Expo application configuration
|-- app.plugin.js             # Expo plugin configuration
|-- babel.config.js           # Babel configuration
|-- babel.js                  # Babel utilities
|-- budget.md                 # Budget feature documentation
|-- dbschema.md              # Database schema documentation
|-- doctor.js                # Development diagnostics utility
|-- drawer.d.ts              # Drawer navigation types
|-- drawer.js                # Drawer navigation implementation
|-- entry-classic.js         # Classic entry point
|-- entry.js                 # Modern entry point
|-- expo-module.config.json  # Expo module configuration
|-- head.d.ts                # Head component types
|-- head.js                  # Head component implementation
|-- html.d.ts                # HTML utility types
|-- html.js                  # HTML utilities
|-- implementation.md        # Implementation documentation
|-- index.d.ts              # Root type definitions
|-- index.js                # Root entry point
|-- metro.config.js         # Metro bundler configuration
|-- package-lock.json       # Dependency lock file
|-- package.json            # Project dependencies and scripts
|-- requirements.md         # Project requirements documentation
|-- rewards.md              # Rewards system documentation
|-- analytics.md            # Analytics system documentation
|-- screens.md             # Screen documentation
|-- server.d.ts            # Server types
|-- server.js              # Server implementation
|-- stack.d.ts             # Stack navigation types
|-- stack.js               # Stack navigation implementation
|-- tabs.d.ts             # Tab navigation types
|-- tabs.js               # Tab navigation implementation
|-- testing-library.d.ts  # Testing utility types
|-- testing-library.js    # Testing utilities
|-- tree.md              # Project structure documentation
|-- tsconfig.json        # TypeScript configuration
|-- ui.d.ts             # UI component types
|-- ui.js               # UI utilities
|-- uiinstructions.md   # UI development guidelines
`-- userstories.md      # User stories documentation
