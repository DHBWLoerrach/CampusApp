import CanteenDayView from '@/components/canteen/CanteenDayView';
import { weekdayDates } from '@/lib/canteenService';

export default function CanteenScreen() {
  const [first] = weekdayDates(5);
  return <CanteenDayView date={first} />;
}
