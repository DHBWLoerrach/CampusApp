import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

export default function CanteenDay1() {
  const d = weekdayDates(5)[1];
  return <CanteenDayView date={d} />;
}
