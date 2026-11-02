/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const dhbwRed = '#E2001A';
// Lighter red for text and links on dark surfaces; dhbwRed only reaches
// about 2.6:1 contrast on dark cards (WCAG AA requires 4.5:1)
const dhbwRedOnDark = '#FF7A85';
const dhbwGray = '#5C6971';
const lightGray = '#DADADA';
const veryLightGray = 'rgb(233,233,233)';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: dhbwRed,
    accentText: dhbwRed,
    icon: dhbwGray,
    tabIconDefault: dhbwGray,
    tabIconSelected: dhbwRed,
    border: lightGray,
    dayNumberContainer: veryLightGray,
    dayTextColor: dhbwGray,
    eventBackground: '#E0E0E0',
    eventTextColor: '#212121',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: dhbwRed,
    accentText: dhbwRedOnDark,
    icon: lightGray,
    tabIconDefault: lightGray,
    tabIconSelected: dhbwRed,
    border: dhbwGray,
    dayNumberContainer: 'rgb(64, 62, 62)',
    dayTextColor: lightGray,
    eventBackground: '#2E2E2E',
    eventTextColor: '#E0E0E0',
  },
};
