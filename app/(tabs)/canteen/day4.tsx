import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

export default function CanteenDay4() {
  const d = weekdayDates(5)[4];
  return <CanteenDayView date={d} />;
}
