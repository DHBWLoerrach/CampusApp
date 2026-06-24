import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';
import NfcButton from '@/components/canteen/NfcButton.android';

const mockIsSupported = jest.fn();
const mockIsEnabled = jest.fn();

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    isSupported: (...args: unknown[]) => mockIsSupported(...args),
    isEnabled: (...args: unknown[]) => mockIsEnabled(...args),
    start: jest.fn().mockResolvedValue(undefined),
  },
  NfcTech: { IsoDep: 'IsoDep' },
}));

const renderTrigger = ({ onPress }: { onPress: () => void }) => (
  <Text onPress={onPress}>scan</Text>
);

beforeEach(() => {
  jest.clearAllMocks();
});

it('navigates to the sheet when NFC is available', async () => {
  mockIsSupported.mockResolvedValue(true);
  mockIsEnabled.mockResolvedValue(true);

  const { getByText } = render(<NfcButton render={renderTrigger} />);
  fireEvent.press(getByText('scan'));

  await waitFor(() =>
    expect(router.push).toHaveBeenCalledWith('/canteen/nfc-sheet')
  );
});

it('shows an alert and does not navigate when NFC is unavailable', async () => {
  mockIsSupported.mockResolvedValue(true);
  mockIsEnabled.mockResolvedValue(false);
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const { getByText } = render(<NfcButton render={renderTrigger} />);
  fireEvent.press(getByText('scan'));

  await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  expect(router.push).not.toHaveBeenCalled();
});
