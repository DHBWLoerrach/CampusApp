import { render, waitFor } from "@testing-library/react-native";
import ScheduleLayout from "@/app/(tabs)/schedule/_layout";

const mockStorageGetItem = jest.fn();
const mockUseCourseContext = jest.fn();
const mockGetDismissed = jest.fn();
const mockGetSeenCount = jest.fn();
const mockIncrementSeenCount = jest.fn();

jest.mock("expo-sqlite/kv-store", () => ({
  getItem: (...args: unknown[]) => mockStorageGetItem(...args),
  setItem: jest.fn(),
}));

jest.mock("expo-router", () => ({
  withLayoutContext: (Navigator: any) => Navigator,
}));

jest.mock("@react-navigation/material-top-tabs", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MaterialTopTabBar = () => <Text>TopTabBar</Text>;
  const Navigator = ({ children, tabBar }: any) => (
    <View>
      {tabBar
        ? tabBar({
            state: {} as any,
            descriptors: {} as any,
            navigation: {} as any,
            position: {} as any,
          })
        : null}
      {children}
    </View>
  );

  Navigator.Screen = ({ children }: any) => <View>{children}</View>;

  return {
    createMaterialTopTabNavigator: () => ({ Navigator }),
    MaterialTopTabBar,
  };
});

jest.mock("@/hooks/useThemeColor", () => ({
  useThemeColor: (_props: unknown, colorName: string) =>
    (
      {
        background: "#ffffff",
        border: "#d0d0d0",
        dayNumberContainer: "#eef5ff",
        text: "#11181c",
      } as Record<string, string>
    )[colorName] ?? "#11181c",
}));

jest.mock("@/context/CourseContext", () => ({
  useCourseContext: () => mockUseCourseContext(),
}));

jest.mock("@/lib/codeCompanionPromo", () => {
  const actual = jest.requireActual("@/lib/codeCompanionPromo");
  return {
    ...actual,
    getCodeCompanionPromoDismissed: (...args: unknown[]) =>
      mockGetDismissed(...args),
    getCodeCompanionPromoSeenCount: (...args: unknown[]) =>
      mockGetSeenCount(...args),
    incrementCodeCompanionPromoSeenCount: (...args: unknown[]) =>
      mockIncrementSeenCount(...args),
    dismissCodeCompanionPromo: jest.fn(),
  };
});

jest.mock("@/components/ui/BottomSheet", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    __esModule: true,
    default: ({ visible, title, children }: any) =>
      visible ? (
        <View>
          <Text>{title}</Text>
          {children}
        </View>
      ) : null,
  };
});

jest.mock("@/components/schedule/CourseSetup", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/ui/TopTabLabel", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("ScheduleLayout CodeCompanion promo", () => {
  beforeEach(() => {
    mockStorageGetItem.mockReset();
    mockUseCourseContext.mockReset();
    mockGetDismissed.mockReset();
    mockGetSeenCount.mockReset();
    mockIncrementSeenCount.mockReset();

    mockStorageGetItem.mockResolvedValue("index");
    mockUseCourseContext.mockReturnValue({
      selectedCourse: "TIF24A",
      setSelectedCourse: jest.fn(),
      isLoading: false,
    });
    mockGetDismissed.mockResolvedValue(false);
    mockGetSeenCount.mockResolvedValue(0);
    mockIncrementSeenCount.mockResolvedValue(1);
  });

  it("shows the promo for an existing eligible course when promo keys are still missing", async () => {
    const { getByText } = render(<ScheduleLayout />);

    await waitFor(() => {
      expect(getByText("DHBW CodeCompanion")).toBeTruthy();
    });

    expect(mockIncrementSeenCount).toHaveBeenCalledTimes(1);
  });
});
