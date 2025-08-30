import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

export default function CanteenDay3() {
  const d = weekdayDates(5)[3];
  return <CanteenDayView date={d} />;
}
