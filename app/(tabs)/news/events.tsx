import { Platform } from 'react-native';
import RSSFeedList from '@/components/news/RSSFeedList';

const feedUrl =
  Platform.OS === 'web'
    ? '/rss/events'
    : 'https://dhbw-loerrach.de/rss-campus-app-termine';

export default function Events() {
  return <RSSFeedList feedUrl={feedUrl} />;
}
