import { render } from '@testing-library/react-native';
import BlockPlanView from '@/components/schedule/BlockPlanView';
import { parseBlockPlan } from '@/lib/blockPlanParser';
import type { BlockPlanResult } from '@/hooks/useBlockPlan';

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
    jest.useRealTimers();
  });

  it('renders every semester with its phases', () => {
    mockQuery();

    const { getByText, getAllByText } = render(<BlockPlanView />);

    expect(getByText('1. Semester')).toBeTruthy();
    expect(getByText('2. Semester')).toBeTruthy();
    expect(getAllByText('Theoriephase').length).toBeGreaterThanOrEqual(2);
    expect(getByText('Praxisphase')).toBeTruthy();
    expect(getByText('1. Okt. – 20. Dez. 2026')).toBeTruthy();
  });

  it('marks the phase containing today as current', () => {
    mockQuery();

    const { getByText } = render(<BlockPlanView />);

    expect(getByText('Aktuell')).toBeTruthy();
    // Summary headline for the running phase.
    expect(getByText('1. Semester · Theoriephase')).toBeTruthy();
  });

  it('announces the upcoming phase before the study period starts', () => {
    jest.setSystemTime(new Date('2026-09-15T10:00:00Z'));
    mockQuery();

    const { getByText, queryByText } = render(<BlockPlanView />);

    expect(getByText('Das Studium hat noch nicht begonnen')).toBeTruthy();
    expect(getByText('Start: 1. Okt. 2026')).toBeTruthy();
    expect(queryByText('Aktuell')).toBeNull();
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
