# DollarTracker Testing Guide

## Overview
This guide explains how to write and run tests for the DollarTracker application using Jest and React Testing Library.

## Test Structure

### 1. Unit Tests Location
```
/context/__tests__/          # Context tests
/components/__tests__/       # Component tests
/lib/__tests__/             # Utility function tests
```

### 2. Test File Naming
- Test files should be named `[component-name].test.tsx`
- Test files should be placed in `__tests__` directory adjacent to the code they're testing

## Writing Tests

### 1. Context Testing

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { YourContext } from '../your-context';

describe('YourContext', () => {
  // 1. Setup wrapper
  const wrapper = ({ children }) => (
    <YourContext>{children}</YourContext>
  );

  // 2. Test initial state
  it('provides default values', () => {
    const { result } = renderHook(() => useYourContext(), { wrapper });
    expect(result.current).toEqual(expect.objectContaining({
      // expected values
    }));
  });

  // 3. Test state updates
  it('updates state correctly', async () => {
    const { result } = renderHook(() => useYourContext(), { wrapper });
    
    await act(async () => {
      await result.current.updateSomething();
    });
    
    expect(result.current.state).toEqual(/* expected state */);
  });

  // 4. Test error handling
  it('handles errors appropriately', async () => {
    // Setup error condition
    const { result } = renderHook(() => useYourContext(), { wrapper });
    
    await act(async () => {
      await result.current.someMethodThatMightFail();
    });
    
    expect(result.current.error).toBeTruthy();
  });
});
```

### 2. Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  // 1. Test rendering
  it('renders correctly', () => {
    const { getByText } = render(<YourComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });

  // 2. Test user interactions
  it('handles user interaction', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <YourComponent onPress={onPress} />
    );
    
    fireEvent.press(getByText('Button Text'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Testing React Context Components

### Settings Context Testing

The Settings Context (`context/settings.tsx`) demonstrates best practices for testing React Context components that interact with external services (Supabase):

1. **Mock Setup**
   ```typescript
   // Create individual mock functions for granular control
   const mockSelect = jest.fn();
   const mockUpdate = jest.fn();
   const mockSingle = jest.fn();
   const mockFrom = jest.fn();
   const mockEq = jest.fn();
   ```

2. **Supabase Mock Implementation**
   ```typescript
   jest.mock('../supabase', () => ({
     useSupabase: () => ({
       supabase: {
         from: (table) => ({
           select: (query) => ({
             eq: (field, value) => ({
               single: () => mockSingle()
             })
           }),
           update: (data) => ({
             eq: (field, value) => mockEq(field, value)
           })
         })
       }
     })
   }));
   ```

3. **Testing Async Operations**
   - Use `act()` to wrap async operations
   - Wait for state updates using `Promise` resolution
   - Test both success and error cases
   - Verify loading states during async operations

4. **Common Pitfalls and Solutions**
   - Mock chained method calls properly (e.g., `from().select().eq().single()`)
   - Return Supabase-style responses: `{ data, error }` instead of rejected promises
   - Reset mocks between tests using `beforeEach`
   - Test error handling using both Supabase errors and rejected promises

5. **Example Test Cases**
   ```typescript
   it('should handle errors when updating settings', async () => {
     // Mock error response
     mockEq.mockImplementationOnce(() => 
       Promise.resolve({ 
         data: null, 
         error: new Error('Failed to update settings') 
       })
     );

     // Attempt update and verify error state
     await act(async () => {
       try {
         await result.current.updateSettings({ theme: 'dark' });
       } catch (error) {
         // Expected error
       }
     });

     expect(result.current.state.error).toBe('Failed to update settings');
     expect(result.current.state.isSaving).toBe(false);
   });
   ```

### Key Testing Principles
- Test initial state
- Test loading states
- Test successful operations
- Test error handling
- Test cleanup/reset functionality
- Verify state transitions
- Mock external dependencies

## Running Tests

### 1. Run All Tests
```bash
npm test
```

### 2. Run Specific Tests
```bash
npm test context/settings  # Run settings context tests
npm test -- --watch       # Watch mode
```

### 3. Update Snapshots
```bash
npm test -- -u
```

## Best Practices

### 1. Test Setup
- Use `beforeEach` to reset state
- Mock external dependencies
- Use test utilities for common operations

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset any other state
});
```

### 2. Mocking
- Mock external services (Supabase, etc.)
- Use consistent mock data
- Keep mocks close to tests

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signIn: jest.fn(),
      // other methods
    }
  })
}));
```

### 3. Assertions
- Test component behavior, not implementation
- Use meaningful assertions
- Test error states
- Test loading states

### 4. Context Testing Tips
1. Always wrap tests in context providers
2. Test context updates
3. Test error handling
4. Test loading states
5. Test integration with other contexts

Example:
```typescript
const AllTheProviders = ({ children }) => (
  <SupabaseProvider>
    <AuthProvider>
      <UserProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </UserProvider>
    </AuthProvider>
  </SupabaseProvider>
);

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });
```

## Common Patterns

### 1. Testing Async Operations
```typescript
it('handles async operations', async () => {
  const { result } = renderHook(() => useYourHook(), { wrapper });
  
  await act(async () => {
    await result.current.asyncOperation();
  });
  
  expect(result.current.state).toBe('expected');
});
```

### 2. Testing Error Boundaries
```typescript
it('catches and handles errors', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation();
  
  render(
    <ErrorBoundary>
      <ComponentThatThrows />
    </ErrorBoundary>
  );
  
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
```

### 3. Testing Navigation
```typescript
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

it('navigates correctly', () => {
  const { getByText } = render(<YourComponent />);
  fireEvent.press(getByText('Navigate'));
  expect(mockNavigate).toHaveBeenCalledWith('/expected-route');
});
```

## Troubleshooting

### Common Issues
1. **Test not running**: Check file naming and location
2. **Async tests failing**: Ensure proper use of `act` and `async/await`
3. **Context not available**: Check provider wrapper
4. **Mocks not working**: Check mock implementation and location

### Solutions
1. Use `debug()` to inspect component output
2. Check Jest configuration
3. Verify mock implementations
4. Ensure proper test setup

## Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
