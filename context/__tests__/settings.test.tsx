import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { SettingsProvider, useSettings } from '../settings';

// Mock data
const mockUserSettings = {
  theme: 'system',
  notificationsEnabled: true,
  emailNotificationsEnabled: true,
  customBudgetPeriod: null,
  dailyBudget: 50,
  exportPreferences: null,
};

// Create mock functions
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();
const mockEq = jest.fn();

// Mock dependencies
jest.mock('../supabase', () => ({
  useSupabase: () => ({
    supabase: {
      from: (table: string) => {
        mockFrom(table);
        return {
          select: (query: string) => {
            mockSelect(query);
            return {
              eq: (field: string, value: any) => {
                mockEq(field, value);
                return {
                  single: () => mockSingle(),
                };
              },
            };
          },
          update: (data: any) => {
            mockUpdate(data);
            return {
              eq: (field: string, value: any) => {
                return mockEq(field, value);
              },
            };
          },
        };
      },
    },
  }),
}));

jest.mock('../user', () => ({
  useUser: () => ({
    profile: { id: 'test-user-id' },
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '',
}));

describe('Settings Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockResolvedValue({ data: mockUserSettings, error: null });
    mockEq.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  });

  it('should provide default settings and load user settings', async () => {
    // Render hook
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    });

    // Initial state should be loading
    expect(result.current.state.isLoading).toBe(true);

    // Wait for loadSettings to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify mock calls
    expect(mockFrom).toHaveBeenCalledWith('user_settings');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');

    // Verify the settings were loaded
    expect(result.current.state).toMatchObject({
      ...mockUserSettings,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  it('should update settings successfully', async () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const newSettings = {
      theme: 'dark' as const,
      notificationsEnabled: false,
    };

    // Update settings
    await act(async () => {
      await result.current.updateSettings(newSettings);
    });

    // Verify mock calls
    expect(mockFrom).toHaveBeenCalledWith('user_settings');
    expect(mockUpdate).toHaveBeenCalledWith(newSettings);
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');

    // Verify the update was successful
    expect(result.current.state).toMatchObject({
      ...mockUserSettings,
      ...newSettings,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  it('should handle errors when loading settings', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Failed to load settings') });

    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    });

    // Initial state should be loading
    expect(result.current.state.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.state.error).toBe('Failed to load settings');
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should handle errors when updating settings', async () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    });

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Mock update error
    mockEq.mockImplementationOnce(() => Promise.resolve({ data: null, error: new Error('Failed to update settings') }));

    // Attempt to update settings
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

  it('should reset error state', async () => {
    // Mock an error during initial load
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Test error') });

    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    });

    // Wait for error to be set
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.state.error).toBe('Test error');

    // Reset error
    act(() => {
      result.current.resetError();
    });

    expect(result.current.state.error).toBeNull();
  });
});
