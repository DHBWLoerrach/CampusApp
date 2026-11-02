import RSSFeedList from '@/components/news/RSSFeedList';

const feedUrl = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

export default function News() {
  return <RSSFeedList feedUrl={feedUrl} />;
}
