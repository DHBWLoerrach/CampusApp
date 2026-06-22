import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

export default function CanteenDay2() {
  const d = weekdayDates(5)[2];
  return <CanteenDayView date={d} />;
}
