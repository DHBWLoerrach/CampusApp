import { Redirect } from 'expo-router';
import BlockPlanView from '@/components/schedule/BlockPlanView';
import { BLOCK_PLAN_FEATURE_ENABLED } from '@/constants/FeatureFlags';

export default function BlockPlanScreen() {
  // Hiding the header entry point is not enough: the route stays addressable
  // by deep link, and rendering the view would fire a request against an API
  // that is not live yet. The flag has to hold here too.
  if (!BLOCK_PLAN_FEATURE_ENABLED) {
    return <Redirect href="/schedule" />;
  }

  return <BlockPlanView />;
}
