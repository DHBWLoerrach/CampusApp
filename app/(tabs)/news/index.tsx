import { Platform } from 'react-native';
import RSSFeedList from '@/components/news/RSSFeedList';

const feedUrl =
  Platform.OS === 'web'
    ? '/rss/news'
    : 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

export default function News() {
  return <RSSFeedList feedUrl={feedUrl} />;
}
