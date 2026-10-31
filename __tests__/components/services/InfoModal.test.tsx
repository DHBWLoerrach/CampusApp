import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import InfoModal from '@/components/services/InfoModal';

let mockInsets = { top: 0, right: 0, bottom: 0, left: 0 };

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets,
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#ffffff',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

async function renderBackdropStyle() {
  await render(
    <InfoModal visible title="Impressum" onClose={() => {}}>
      <Text>Inhalt</Text>
    </InfoModal>
  );

  return StyleSheet.flatten(
    screen.getByTestId('info-modal-backdrop').props.style
  );
}

describe('InfoModal', () => {
  it('keeps the default padding when the insets are smaller', async () => {
    mockInsets = { top: 0, right: 0, bottom: 8, left: 0 };

    expect(await renderBackdropStyle()).toMatchObject({
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
    });
  });

  it('keeps its content clear of larger insets', async () => {
    // Folded iPhone Duo: the status bar column runs along the right edge.
    mockInsets = { top: 0, right: 84, bottom: 34, left: 0 };

    expect(await renderBackdropStyle()).toMatchObject({
      paddingTop: 16,
      paddingRight: 84,
      paddingBottom: 34,
      paddingLeft: 16,
    });
  });
});
