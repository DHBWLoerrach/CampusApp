import { fireEvent, render, within } from '@testing-library/react-native';
import { SectionList, StyleSheet } from 'react-native';
import BlockPlanView from '@/components/schedule/BlockPlanView';
import { parseBlockPlan } from '@/lib/blockPlanParser';
import type { BlockPlanResult } from '@/hooks/useBlockPlan';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const createAnimationBuilder = () => {
    const builder = {
      duration: () => builder,
      reduceMotion: () => builder,
    };
    return builder;
  };

  return {
    __esModule: true,
    default: { View },
    Easing: { cubic: () => 0, out: (easing: unknown) => easing },
    FadeInDown: createAnimationBuilder(),
    FadeOutUp: createAnimationBuilder(),
    ReduceMotion: { System: 'system' },
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useReducedMotion: () => false,
    withTiming: (value: unknown) => value,
  };
});

const mockUseBlockPlan = jest.fn();
const mockUseCourseContext = jest.fn();

jest.mock('@/hooks/useBlockPlan', () => ({
  useBlockPlan: (...args: unknown[]) => mockUseBlockPlan(...args),
}));

jest.mock('@/context/CourseContext', () => ({
  useCourseContext: () => mockUseCourseContext(),
}));

const mockUseOnlineStatus = jest.fn();

jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: (_props: unknown, colorName: string) =>
    (
      ({
        background: '#ffffff',
        border: '#d0d0d0',
        icon: '#687076',
        text: '#11181c',
        tint: '#e2001a',
        dayNumberContainer: '#e9e9e9',
      }) as Record<string, string>
    )[colorName] ?? '#11181c',
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');

  return {
    IconSymbol: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

const PLAN = parseBlockPlan({
  course: { code: 'TIF26A' },
  semesters: [
    {
      number: 1,
      phases: [
        { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
        { type: 'PRACTICE', startDate: '2026-12-21', endDate: '2027-04-18' },
      ],
    },
    {
      number: 2,
      phases: [
        { type: 'THEORY', startDate: '2027-04-19', endDate: '2027-07-11' },
      ],
    },
  ],
});

// Two phases with a gap in between, so "no phase running" is not the same as
// "the programme has not started".
const GAP_PLAN = parseBlockPlan({
  course: { code: 'TIF26A' },
  semesters: [
    {
      number: 1,
      phases: [
        { type: 'THEORY', startDate: '2026-10-01', endDate: '2026-12-20' },
      ],
    },
    {
      number: 2,
      phases: [
        { type: 'THEORY', startDate: '2027-04-01', endDate: '2027-06-30' },
      ],
    },
  ],
});

function mockQuery(overrides?: Partial<Record<string, unknown>>) {
  mockUseBlockPlan.mockReturnValue({
    data: { plan: PLAN, fromCache: false } as BlockPlanResult,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isFetching: false,
    ...overrides,
  });
}

describe('BlockPlanView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Inside the first theory phase.
    jest.setSystemTime(new Date('2026-11-02T10:00:00Z'));
    mockUseBlockPlan.mockReset();
    mockUseCourseContext.mockReset();
    mockUseCourseContext.mockReturnValue({ selectedCourse: 'TIF26A' });
    mockUseOnlineStatus.mockReset();
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      isReady: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('renders every semester with its phases', () => {
    mockQuery();

    const { getByTestId, getByText, getAllByText } = render(<BlockPlanView />);

    expect(getByText('1. Semester')).toBeTruthy();
    expect(getByText('2. Semester')).toBeTruthy();
    expect(getAllByText('Theoriephase').length).toBeGreaterThanOrEqual(2);
    expect(getByText('Praxisphase')).toBeTruthy();
    expect(
      StyleSheet.flatten(getByText('1. Okt. – 20. Dez. 2026').props.style).color
    ).toBe('#11181c');
    const firstSemesterHeader = StyleSheet.flatten(
      getByTestId('block-plan-section-TIF26A-semester-1').props.style
    );
    expect(firstSemesterHeader).toMatchObject({
      marginTop: 16,
      marginBottom: 8,
    });
  });

  it('groups past semesters in one expandable archive', () => {
    jest.setSystemTime(new Date('2027-05-02T10:00:00Z'));
    mockQuery();
    const scrollTo = jest.fn();
    jest
      .spyOn(SectionList.prototype, 'getScrollResponder')
      .mockReturnValue({ scrollTo } as never);

    const {
      UNSAFE_getByType,
      getByLabelText,
      getByTestId,
      getByText,
      queryByText,
    } = render(<BlockPlanView />);

    const expandButton = getByLabelText('Vergangene Semester (1) aufklappen');
    expect(expandButton.props.accessibilityState).toEqual({ expanded: false });
    expect(StyleSheet.flatten(expandButton.props.style)).toMatchObject({
      minHeight: 48,
      borderWidth: 1,
      backgroundColor: 'transparent',
      marginTop: 24,
    });
    expect(queryByText('1. Semester')).toBeNull();
    expect(queryByText('1. Okt. – 20. Dez. 2026')).toBeNull();
    expect(getByText('2. Semester')).toBeTruthy();
    expect(getByText('19. Apr. – 11. Juli 2027')).toBeTruthy();
    expect(
      UNSAFE_getByType(SectionList).props.sections.map(
        (section: { key: string }) => section.key
      )
    ).toEqual(['TIF26A-semester-2', 'TIF26A-past-archive']);

    UNSAFE_getByType(SectionList).props.onScroll({
      nativeEvent: { contentOffset: { y: 240 } },
    });
    fireEvent.press(expandButton);

    const collapseButton = getByLabelText('Vergangene Semester (1) einklappen');
    expect(collapseButton.props.accessibilityState).toEqual({ expanded: true });
    expect(getByText('1. Semester')).toBeTruthy();
    expect(getByText('Theoriephase · 1. Okt. – 20. Dez. 2026')).toBeTruthy();
    expect(
      StyleSheet.flatten(
        getByTestId('block-plan-section-TIF26A-semester-1').props.style
      ).marginTop
    ).toBe(8);
    const pastPhaseRow = getByLabelText(
      'Theoriephase, 1. Okt. – 20. Dez. 2026, 12 Wochen, Abgeschlossen'
    );
    expect(StyleSheet.flatten(pastPhaseRow.props.style)).toMatchObject({
      paddingVertical: 6,
      borderBottomColor: '#d0d0d0',
      borderBottomWidth: StyleSheet.hairlineWidth,
    });
    expect(
      StyleSheet.flatten(pastPhaseRow.props.style).borderLeftWidth
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(
        within(pastPhaseRow).getByText('Theoriephase').props.style
      )
    ).toMatchObject({ color: '#687076', fontWeight: '500' });
    expect(
      StyleSheet.flatten(
        within(pastPhaseRow).getByText('Theoriephase · 1. Okt. – 20. Dez. 2026')
          .props.style
      ).color
    ).toBe('#11181c');
    UNSAFE_getByType(SectionList).props.onContentSizeChange(320, 1200);
    expect(scrollTo).toHaveBeenCalledWith({
      animated: true,
      y: 400,
    });

    fireEvent.press(collapseButton);

    expect(getByLabelText('Vergangene Semester (1) aufklappen')).toBeTruthy();
    expect(queryByText('1. Semester')).toBeNull();
    expect(queryByText('1. Okt. – 20. Dez. 2026')).toBeNull();
    UNSAFE_getByType(SectionList).props.onContentSizeChange(320, 800);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('keeps a completed plan accessible through the archive', () => {
    jest.setSystemTime(new Date('2027-08-02T10:00:00Z'));
    mockQuery();

    const { getByLabelText, getByTestId, getByText, queryByText } = render(
      <BlockPlanView />
    );

    expect(getByText('Der Blockplan ist abgeschlossen')).toBeTruthy();
    expect(
      queryByText('Für diesen Kurs ist kein Blockplan hinterlegt.')
    ).toBeNull();

    fireEvent.press(getByLabelText('Vergangene Semester (2) aufklappen'));

    expect(getByText('1. Semester')).toBeTruthy();
    expect(getByText('2. Semester')).toBeTruthy();
    expect(
      StyleSheet.flatten(
        getByTestId('block-plan-section-TIF26A-semester-1').props.style
      ).marginTop
    ).toBe(8);
    expect(
      StyleSheet.flatten(
        getByTestId('block-plan-section-TIF26A-semester-2').props.style
      ).marginTop
    ).toBe(16);
  });

  it('marks the phase containing today as current', () => {
    mockQuery();

    const {
      getAllByText,
      getByLabelText,
      getByTestId,
      getByText,
      queryByText,
    } = render(<BlockPlanView />);

    expect(getByText('Aktuell')).toBeTruthy();
    const currentPhaseCard = getByLabelText(
      'Theoriephase, 1. Okt. – 20. Dez. 2026, 12 Wochen, Aktuell'
    );
    expect(
      StyleSheet.flatten(currentPhaseCard.props.style).borderLeftColor
    ).toBe('#e2001a');
    expect(StyleSheet.flatten(currentPhaseCard.props.style)).toMatchObject({
      borderLeftWidth: 4,
    });
    expect(
      StyleSheet.flatten(currentPhaseCard.props.style).boxShadow
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(
        within(currentPhaseCard).getByText('Theoriephase').props.style
      ).marginRight
    ).toBe(12);
    expect(
      StyleSheet.flatten(getByText('Aktuell').parent?.parent?.props.style)
        .marginLeft
    ).toBe('auto');
    const upcomingPhaseCard = getByLabelText(
      'Praxisphase, 21. Dez. 2026 – 18. Apr. 2027, 17 Wochen'
    );
    expect(
      StyleSheet.flatten(upcomingPhaseCard.props.style).borderLeftColor
    ).toBe('#d0d0d0');
    expect(StyleSheet.flatten(upcomingPhaseCard.props.style)).toMatchObject({
      borderLeftWidth: 1,
    });
    expect(
      StyleSheet.flatten(getByTestId('block-plan-summary').props.style)
    ).toMatchObject({
      backgroundColor: '#ffffff',
      borderLeftColor: '#e2001a',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
    });
    const progressBar = getByLabelText('Fortschritt der aktuellen Phase');
    expect(progressBar.props.accessibilityRole).toBe('progressbar');
    expect(StyleSheet.flatten(progressBar.props.style).height).toBe(3);
    expect(progressBar.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 41,
      text: '41 Prozent',
    });
    const progressFillStyle = StyleSheet.flatten(
      getByTestId('block-plan-progress-fill').props.style
    );
    expect(progressFillStyle.backgroundColor).toBe('#e2001a');
    expect(Number.parseFloat(progressFillStyle.width)).toBeCloseTo(40.74, 2);
    expect(getAllByText(/noch 7 Wochen/)).toHaveLength(1);
    expect(queryByText('12 Wochen · noch 7 Wochen')).toBeNull();
    // Summary headline for the running phase.
    expect(getByText('1. Semester · Theoriephase')).toBeTruthy();
  });

  it('announces the upcoming phase before the study period starts', () => {
    jest.setSystemTime(new Date('2026-09-15T10:00:00Z'));
    mockQuery();

    const { getByText, queryByLabelText, queryByText } = render(
      <BlockPlanView />
    );

    expect(getByText('Das Studium hat noch nicht begonnen')).toBeTruthy();
    expect(getByText('Start: 1. Okt. 2026')).toBeTruthy();
    expect(queryByText('Aktuell')).toBeNull();
    expect(queryByLabelText('Fortschritt der aktuellen Phase')).toBeNull();
  });

  it('shows a stale-data banner when the cached plan is used', () => {
    mockQuery({ data: { plan: PLAN, fromCache: true } });

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Nicht aktualisiert')).toBeTruthy();
  });

  it('keeps the stale-data banner hidden while the request is still running', () => {
    // Cold start with a cached plan: the request has not failed yet, so the
    // banner must not flash up before the response arrives.
    mockQuery({ data: { plan: PLAN, fromCache: true }, isFetching: true });

    const { queryByText, getByText } = render(<BlockPlanView />);

    expect(queryByText('Nicht aktualisiert')).toBeNull();
    expect(getByText('1. Semester')).toBeTruthy();
  });

  it('shows the stale-data banner when a refresh failed', () => {
    mockQuery({
      data: { plan: PLAN, fromCache: true },
      isError: true,
      error: new Error('boom'),
      isFetching: false,
    });

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Nicht aktualisiert')).toBeTruthy();
  });

  it('warns when the payload was only partially readable', () => {
    mockQuery({
      data: { plan: { ...PLAN, isPartial: true }, fromCache: false },
    });

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Unvollständig')).toBeTruthy();
  });

  it('stays silent about completeness for an intact plan', () => {
    mockQuery();

    const { queryByText } = render(<BlockPlanView />);

    expect(queryByText('Unvollständig')).toBeNull();
  });

  it('does not claim the programme has not started during a gap between phases', () => {
    // The gap between the first and the second phase of GAP_PLAN.
    jest.setSystemTime(new Date('2027-02-15T10:00:00Z'));
    mockQuery({ data: { plan: GAP_PLAN, fromCache: false } });

    const { getByText, queryByText } = render(<BlockPlanView />);

    expect(queryByText('Das Studium hat noch nicht begonnen')).toBeNull();
    expect(getByText('Zurzeit läuft keine Phase')).toBeTruthy();
    expect(getByText(/Weiter ab 1\. Apr\. 2027/)).toBeTruthy();
  });

  it('still announces the start before the very first phase', () => {
    jest.setSystemTime(new Date('2026-09-15T10:00:00Z'));
    mockQuery({ data: { plan: GAP_PLAN, fromCache: false } });

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Das Studium hat noch nicht begonnen')).toBeTruthy();
  });

  it('shows the offline state immediately instead of a spinner', () => {
    // networkMode 'always' keeps the request running while offline; the UI must
    // not wait for it to time out before saying so.
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      isReady: true,
    });
    mockQuery({ data: undefined, isLoading: true });

    const { getByText, queryByText } = render(<BlockPlanView />);

    expect(getByText('Keine Internetverbindung')).toBeTruthy();
    expect(queryByText('Blockplan wird geladen...')).toBeNull();
  });

  it('marks a cached plan as stale right away while offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      isReady: true,
    });
    mockQuery({ data: { plan: PLAN, fromCache: true }, isFetching: true });

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Offline')).toBeTruthy();
  });

  it('asks for a course when none is selected', () => {
    mockUseCourseContext.mockReturnValue({ selectedCourse: null });
    mockQuery({ data: undefined });

    const { getByText } = render(<BlockPlanView />);

    expect(
      getByText('Bitte wähle zuerst einen Kurs aus, um den Blockplan zu sehen.')
    ).toBeTruthy();
  });
});
