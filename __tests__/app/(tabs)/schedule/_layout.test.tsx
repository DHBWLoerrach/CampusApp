import { render } from '@testing-library/react-native';
import ScheduleStackLayout from '@/app/(tabs)/schedule/_layout';

const mockUseCourseContext = jest.fn();
const mockUseBlockPlan = jest.fn();

// Renders the header buttons a Stack.Screen declares so they can be asserted on.
jest.mock('expo-router', () => {
  const { View } = require('react-native');

  const Stack = ({ children }: any) => <View>{children}</View>;
  Stack.Screen = ({ options }: any) => (
    <View>
      {options?.headerRight ? options.headerRight() : null}
      {options?.headerTitle ? options.headerTitle() : null}
    </View>
  );

  return { Stack, router: { push: jest.fn() } };
});

jest.mock('@/context/CourseContext', () => ({
  useCourseContext: () => mockUseCourseContext(),
}));

jest.mock('@/hooks/useBlockPlan', () => ({
  useBlockPlan: (...args: unknown[]) => mockUseBlockPlan(...args),
}));

// Exposed as a getter so a single test can flip the flag without reloading the
// module graph, which would give the test a second React instance.
let mockBlockPlanEnabled = true;

jest.mock('@/constants/FeatureFlags', () => ({
  RIDES_FEATURE_ENABLED: false,
  get BLOCK_PLAN_FEATURE_ENABLED() {
    return mockBlockPlanEnabled;
  },
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#11181c',
}));

jest.mock('@/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');

  return { IconSymbol: ({ name }: { name: string }) => <Text>{name}</Text> };
});

jest.mock('@/components/ui/BottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/schedule/RideMatchSheetContent', () => ({
  __esModule: true,
  default: () => null,
}));

const PLAN_RESULT = {
  plan: {
    course: { code: 'TIF26A' },
    semesters: [
      {
        number: 1,
        phases: [
          { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
        ],
      },
    ],
  },
  fromCache: false,
};

describe('ScheduleStackLayout block plan entry point', () => {
  beforeEach(() => {
    mockUseCourseContext.mockReset();
    mockUseBlockPlan.mockReset();
    mockBlockPlanEnabled = true;
    mockUseCourseContext.mockReturnValue({
      selectedCourse: 'TIF26A',
      setSelectedCourse: jest.fn(),
      previousCourses: [],
    });
  });

  it('shows the block plan icon when the course has a plan', () => {
    mockUseBlockPlan.mockReturnValue({ data: PLAN_RESULT });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(queryByLabelText('Blockplan öffnen')).toBeTruthy();
  });

  it('hides the icon when the API reports no plan for the course', () => {
    mockUseBlockPlan.mockReturnValue({
      data: { plan: null, fromCache: false },
    });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(queryByLabelText('Blockplan öffnen')).toBeNull();
  });

  it('hides the icon while the plan is still loading', () => {
    mockUseBlockPlan.mockReturnValue({ data: undefined, isLoading: true });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(queryByLabelText('Blockplan öffnen')).toBeNull();
  });

  it('hides the block plan icon after a loading error without cached data', () => {
    mockUseBlockPlan.mockReturnValue({
      data: undefined,
      isError: true,
      error: new Error('Network request failed'),
    });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(queryByLabelText('Blockplan öffnen')).toBeNull();
  });

  it('shows the block plan icon when a cached plan is available', () => {
    mockUseBlockPlan.mockReturnValue({
      data: { ...PLAN_RESULT, fromCache: true },
      isError: true,
      error: new Error('Network request failed'),
    });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(queryByLabelText('Blockplan öffnen')).toBeTruthy();
  });

  it('queries the block plan for the selected course', () => {
    mockUseBlockPlan.mockReturnValue({ data: PLAN_RESULT });

    render(<ScheduleStackLayout />);

    expect(mockUseBlockPlan).toHaveBeenCalledWith('TIF26A');
  });

  it('spends no request on the block plan while the feature is disabled', () => {
    // The plan API is not live yet, so a disabled flag has to cost nothing —
    // passing no course keeps the query disabled instead of merely hiding it.
    mockBlockPlanEnabled = false;
    mockUseBlockPlan.mockReturnValue({ data: PLAN_RESULT });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(mockUseBlockPlan).toHaveBeenCalledWith(undefined);
    expect(queryByLabelText('Blockplan öffnen')).toBeNull();
  });

  it('does not query without a selected course', () => {
    mockUseCourseContext.mockReturnValue({
      selectedCourse: null,
      setSelectedCourse: jest.fn(),
      previousCourses: [],
    });
    mockUseBlockPlan.mockReturnValue({ data: undefined });

    const { queryByLabelText } = render(<ScheduleStackLayout />);

    expect(mockUseBlockPlan).toHaveBeenCalledWith(undefined);
    expect(queryByLabelText('Blockplan öffnen')).toBeNull();
  });
});
