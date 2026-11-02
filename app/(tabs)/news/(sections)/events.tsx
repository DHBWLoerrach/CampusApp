import RSSFeedList from '@/components/news/RSSFeedList';

const feedUrl = 'https://dhbw-loerrach.de/rss-campus-app-termine';

export default function Events() {
  return <RSSFeedList feedUrl={feedUrl} />;
}
