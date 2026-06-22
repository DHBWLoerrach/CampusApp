import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

// Factory for the canteen day routes. Each (sections) day file is one of these,
// differing only by its index into the Mon–Fri work week. Centralizing the
// weekday lookup keeps the index/offset logic in a single place instead of
// being copy-pasted across five route files.
export function createCanteenDayScreen(dayIndex: number) {
  function CanteenDayScreen() {
    const date = weekdayDates(5)[dayIndex];
    return <CanteenDayView date={date} />;
  }
  CanteenDayScreen.displayName = `CanteenDayScreen(${dayIndex})`;
  return CanteenDayScreen;
}
