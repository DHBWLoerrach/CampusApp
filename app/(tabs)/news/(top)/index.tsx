import RSSFeedList from '@/components/RSSFeedList';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

export default function NewsList() {
  return (
    <RSSFeedList feedUrl={FEED_URL} linkPath="/(tabs)/news/[id]" />
  );
}
