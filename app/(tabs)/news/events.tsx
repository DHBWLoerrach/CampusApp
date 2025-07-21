import RSSFeedList from '@/components/RSSFeedList';

const EVENTS_FEED_URL =
  'https://dhbw-loerrach.de/rss-campus-app-termine';

export default function Events() {
  return <RSSFeedList feedUrl={EVENTS_FEED_URL} />;
}
