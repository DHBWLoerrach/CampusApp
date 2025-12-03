import { render, fireEvent } from '@testing-library/react-native';
import ErrorWithReloadButton from '@/components/ui/ErrorWithReloadButton';

// Mock useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#E2001A',
}));

describe('ErrorWithReloadButton', () => {
  const mockRefetch = jest.fn();
  const testError = new Error('Netzwerkfehler');

  beforeEach(() => {
    mockRefetch.mockClear();
  });

  it('displays error message', () => {
    const { getByText } = render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Ein Fehler ist aufgetreten:')).toBeTruthy();
    expect(getByText('Netzwerkfehler')).toBeTruthy();
  });

  it('shows "Neu laden" button when not fetching', () => {
    const { getByText } = render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Neu laden')).toBeTruthy();
  });

  it('shows "Wird neu geladen…" button when fetching', () => {
    const { getByText } = render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={true}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Wird neu geladen…')).toBeTruthy();
  });

  it('calls refetch when button is pressed', () => {
    const { getByText } = render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    fireEvent.press(getByText('Neu laden'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByLabelText('Erneut laden')).toBeTruthy();
  });
});
