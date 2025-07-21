import RSSFeedList from '@/components/RSSFeedList';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

export default function News() {
  return <RSSFeedList feedUrl={FEED_URL} />;
}
