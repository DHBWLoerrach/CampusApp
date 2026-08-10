import { render } from '@testing-library/react-native';
import BlockPlanScreen from '@/app/(tabs)/schedule/block-plan';

// Jest hoists `jest.mock` above these declarations, so the factories may only
// close over variables whose name starts with `mock`.
let mockBlockPlanEnabled = true;

jest.mock('@/constants/FeatureFlags', () => ({
  RIDES_FEATURE_ENABLED: false,
  get BLOCK_PLAN_FEATURE_ENABLED() {
    return mockBlockPlanEnabled;
  },
}));

const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    mockRedirect(props.href);
    return null;
  },
}));

const mockBlockPlanView = jest.fn();

jest.mock('@/components/schedule/BlockPlanView', () => {
  const { Text } = require('react-native');

  return {
    __esModule: true,
    default: () => {
      mockBlockPlanView();
      return <Text>block plan</Text>;
    },
  };
});

describe('BlockPlanScreen', () => {
  beforeEach(() => {
    mockRedirect.mockReset();
    mockBlockPlanView.mockReset();
    mockBlockPlanEnabled = true;
  });

  it('renders the block plan while the feature is enabled', () => {
    const { getByText } = render(<BlockPlanScreen />);

    expect(getByText('block plan')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects away instead of loading a plan while the feature is disabled', () => {
    // The header entry point is hidden, but the route stays addressable by
    // deep link — rendering the view would fire a request regardless.
    mockBlockPlanEnabled = false;

    render(<BlockPlanScreen />);

    expect(mockBlockPlanView).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/schedule');
  });
});
