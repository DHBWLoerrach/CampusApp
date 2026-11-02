import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { RoleProvider, useRoleContext } from '@/context/RoleContext';

const ROLE_KEY = 'userRole';
const TERMS_KEY = 'acceptedTerms';

// In-memory storage that survives remounts, like the real KV store
const mockStore = new Map<string, string>();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <RoleProvider>{children}</RoleProvider>
);

async function renderLoadedRoleContext() {
  const hook = await renderHook(() => useRoleContext(), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('RoleProvider', () => {
  beforeEach(() => {
    mockStore.clear();
    mockGetItem.mockImplementation(async (key: string) =>
      mockStore.has(key) ? mockStore.get(key) : null
    );
    mockSetItem.mockImplementation(async (key: string, value: string) => {
      mockStore.set(key, value);
    });
    mockRemoveItem.mockImplementation(async (key: string) => {
      mockStore.delete(key);
    });
  });

  it('starts without role and consent on first launch', async () => {
    const { result } = await renderLoadedRoleContext();

    expect(result.current.selectedRole).toBeNull();
    expect(result.current.acceptedTerms).toBe(false);
  });

  it('restores the stored role and consent', async () => {
    mockStore.set(ROLE_KEY, 'Mitarbeitende');
    mockStore.set(TERMS_KEY, '1');

    const { result } = await renderLoadedRoleContext();

    expect(result.current.selectedRole).toBe('Mitarbeitende');
    expect(result.current.acceptedTerms).toBe(true);
  });

  it('stays loading until both role and consent are loaded', async () => {
    let resolveTerms: (value: string | null) => void = () => {};
    mockGetItem.mockImplementation(async (key: string) => {
      if (key === TERMS_KEY) {
        return new Promise((resolve) => (resolveTerms = resolve));
      }
      return 'Gast';
    });

    const { result } = await renderHook(() => useRoleContext(), { wrapper });
    await waitFor(() => expect(result.current.selectedRole).toBe('Gast'));
    expect(result.current.isLoading).toBe(true);

    await act(async () => resolveTerms('1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.acceptedTerms).toBe(true);
  });

  it('persists role and consent changes across remounts', async () => {
    const { result, unmount } = await renderLoadedRoleContext();

    await act(() => result.current.setSelectedRole('Lehrbeauftragte'));
    await act(() => result.current.setAcceptedTerms(true));

    await unmount();
    const remounted = await renderLoadedRoleContext();

    expect(remounted.result.current.selectedRole).toBe('Lehrbeauftragte');
    expect(remounted.result.current.acceptedTerms).toBe(true);
  });

  it('removes role and consent from storage when cleared', async () => {
    mockStore.set(ROLE_KEY, 'Studierende');
    mockStore.set(TERMS_KEY, '1');
    const { result, unmount } = await renderLoadedRoleContext();

    await act(() => result.current.setSelectedRole(null));
    await act(() => result.current.setAcceptedTerms(false));

    expect(mockStore.has(ROLE_KEY)).toBe(false);
    expect(mockStore.has(TERMS_KEY)).toBe(false);

    await unmount();
    const remounted = await renderLoadedRoleContext();

    expect(remounted.result.current.selectedRole).toBeNull();
    expect(remounted.result.current.acceptedTerms).toBe(false);
  });

  it('falls back to defaults when storage fails', async () => {
    mockGetItem.mockRejectedValue(new Error('storage unavailable'));

    const { result } = await renderLoadedRoleContext();

    expect(result.current.selectedRole).toBeNull();
    expect(result.current.acceptedTerms).toBe(false);
  });

  it('keeps changes in memory when saving fails', async () => {
    const { result } = await renderLoadedRoleContext();
    mockSetItem.mockRejectedValue(new Error('disk full'));

    await act(() => result.current.setSelectedRole('Gast'));
    await act(() => result.current.setAcceptedTerms(true));

    expect(result.current.selectedRole).toBe('Gast');
    expect(result.current.acceptedTerms).toBe(true);
  });
});
