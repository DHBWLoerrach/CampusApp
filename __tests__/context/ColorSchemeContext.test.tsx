import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';
import {
  ColorSchemeProvider,
  useColorSchemeOverride,
} from '@/context/ColorSchemeContext';

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorSchemeProvider>{children}</ColorSchemeProvider>
);

describe('ColorSchemeProvider', () => {
  const originalOS = Platform.OS;
  let setColorScheme: jest.SpyInstance;

  beforeEach(() => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    setColorScheme = jest
      .spyOn(Appearance, 'setColorScheme')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('forces the native scheme when dark mode was stored', async () => {
    mockGetItem.mockResolvedValue('1');
    await renderHook(() => useColorSchemeOverride(), { wrapper });

    expect(setColorScheme).toHaveBeenCalledTimes(1);
    expect(setColorScheme).toHaveBeenCalledWith('dark');
  });

  it('follows the system by default', async () => {
    await renderHook(() => useColorSchemeOverride(), { wrapper });

    expect(setColorScheme).toHaveBeenCalledTimes(1);
    expect(setColorScheme).toHaveBeenCalledWith('auto');
  });

  it('updates the native scheme when the setting changes', async () => {
    const { result } = await renderHook(() => useColorSchemeOverride(), {
      wrapper,
    });

    await act(() => result.current.setAlwaysDark(true));
    expect(setColorScheme).toHaveBeenLastCalledWith('dark');

    await act(() => result.current.setAlwaysDark(false));
    expect(setColorScheme).toHaveBeenLastCalledWith('auto');
  });

  it('skips the native scheme on web', async () => {
    Platform.OS = 'web';
    mockGetItem.mockResolvedValue('1');
    const { result } = await renderHook(() => useColorSchemeOverride(), {
      wrapper,
    });

    expect(result.current.alwaysDark).toBe(true);
    expect(setColorScheme).not.toHaveBeenCalled();
  });
});
