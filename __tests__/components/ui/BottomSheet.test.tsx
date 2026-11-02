import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';

const mockOnDismissProps: { isPresented?: boolean; onDismiss?: () => void } =
  {};

// The native sheet stays in the tree while hidden; the mock records its
// props and renders its children like the native views do.
jest.mock('@expo/ui', () => {
  const { View } = require('react-native');

  return {
    BottomSheet: ({ isPresented, onDismiss, children }: any) => {
      mockOnDismissProps.isPresented = isPresented;
      mockOnDismissProps.onDismiss = onDismiss;
      return <View>{children}</View>;
    },
    RNHostView: ({ children }: any) => children,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#ffffff',
}));

describe('BottomSheet', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not mount its content while closed', async () => {
    const { queryByText } = await render(
      <BottomSheet visible={false} title="Titel" onClose={jest.fn()}>
        <Text>Inhalt</Text>
      </BottomSheet>
    );

    expect(mockOnDismissProps.isPresented).toBe(false);
    expect(queryByText('Titel')).toBeNull();
    expect(queryByText('Inhalt')).toBeNull();
  });

  it('shows the title and content while open', async () => {
    const { getByText } = await render(
      <BottomSheet visible title="Titel" onClose={jest.fn()}>
        <Text>Inhalt</Text>
      </BottomSheet>
    );

    expect(mockOnDismissProps.isPresented).toBe(true);
    expect(getByText('Titel')).toBeTruthy();
    expect(getByText('Inhalt')).toBeTruthy();
  });

  it('keeps the content during the dismiss animation, then unmounts it', async () => {
    const { queryByText, rerender } = await render(
      <BottomSheet visible title="Titel" onClose={jest.fn()}>
        <Text>Inhalt</Text>
      </BottomSheet>
    );

    await rerender(
      <BottomSheet visible={false} title="Titel" onClose={jest.fn()}>
        <Text>Inhalt</Text>
      </BottomSheet>
    );
    expect(queryByText('Inhalt')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(queryByText('Inhalt')).toBeNull();
  });

  it('forwards a native dismiss to onClose', async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet visible title="Titel" onClose={onClose}>
        <Text>Inhalt</Text>
      </BottomSheet>
    );

    mockOnDismissProps.onDismiss?.();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
