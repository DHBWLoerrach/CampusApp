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

  it('displays error message', async () => {
    const { getByText } = await render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Ein Fehler ist aufgetreten:')).toBeTruthy();
    expect(getByText('Netzwerkfehler')).toBeTruthy();
  });

  it('uses a fallback when the error message is empty', async () => {
    const { getByText } = await render(
      <ErrorWithReloadButton
        error={new Error('')}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Bitte versuche es später erneut.')).toBeTruthy();
  });

  it('shows "Neu laden" button when not fetching', async () => {
    const { getByText } = await render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Neu laden')).toBeTruthy();
  });

  it('shows "Wird neu geladen…" button when fetching', async () => {
    const { getByText } = await render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={true}
        refetch={mockRefetch}
      />
    );

    expect(getByText('Wird neu geladen…')).toBeTruthy();
  });

  it('calls refetch when button is pressed', async () => {
    const { getByText } = await render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    await fireEvent.press(getByText('Neu laden'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label', async () => {
    const { getByLabelText } = await render(
      <ErrorWithReloadButton
        error={testError}
        isFetching={false}
        refetch={mockRefetch}
      />
    );

    expect(getByLabelText('Erneut laden')).toBeTruthy();
  });
});
