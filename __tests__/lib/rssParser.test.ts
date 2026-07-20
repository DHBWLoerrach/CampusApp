import { parseRSSFeed } from '@/lib/rssParser';

describe('parseRSSFeed', () => {
  it('parses a standard feed with a single item', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <title>DHBW News</title>',
      '    <item>',
      '      <title>Welcome Week</title>',
      '      <guid>https://dhbw.example/news/1</guid>',
      '      <link>https://dhbw.example/news/1</link>',
      '      <pubDate>Mon, 23 Jun 2025 10:00:00 +0000</pubDate>',
      '      <description>Kick-off for the new semester.</description>',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(1);
    const item = feed.items[0];
    expect(item.id).toBe('https://dhbw.example/news/1');
    expect(item.title).toBe('Welcome Week');
    expect(item.published).toBe('Mon, 23 Jun 2025 10:00:00 +0000');
    expect(item.link).toBe('https://dhbw.example/news/1');
    expect(item.description).toBe('Kick-off for the new semester.');
  });

  it('extracts CDATA-wrapped content:encoded', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <item>',
      '      <title>Article</title>',
      '      <guid>abc-123</guid>',
      '      <content:encoded><![CDATA[<p>Hello world</p>]]></content:encoded>',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].content).toBe('<p>Hello world</p>');
  });

  it('reads the enclosure url attribute', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <item>',
      '      <title>With Image</title>',
      '      <guid>img-1</guid>',
      '      <enclosure url="https://example.org/img.jpg" />',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].enclosures?.[0]?.url).toBe(
      'https://example.org/img.jpg'
    );
  });

  it('parses an item that only has a title and guid', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <item>',
      '      <title>Minimal</title>',
      '      <guid>minimal-1</guid>',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(1);
    const item = feed.items[0];
    expect(item.enclosures).toBeUndefined();
    expect(item.content).toBe('');
    expect(item.description).toBe('');
  });

  it('drops items without a title or id', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <item>',
      '      <title>Valid</title>',
      '      <guid>valid-1</guid>',
      '    </item>',
      '    <item>',
      '      <guid>no-title-1</guid>',
      '      <description>Missing a title.</description>',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].title).toBe('Valid');
  });

  it('parses multiple items as an array', () => {
    const xml = [
      '<rss version="2.0">',
      '  <channel>',
      '    <item>',
      '      <title>First</title>',
      '      <guid>first-1</guid>',
      '    </item>',
      '    <item>',
      '      <title>Second</title>',
      '      <guid>second-1</guid>',
      '    </item>',
      '  </channel>',
      '</rss>',
    ].join('\n');

    const feed = parseRSSFeed(xml);
    expect(feed.items).toHaveLength(2);
    expect(feed.items.map((i) => i.title)).toEqual(['First', 'Second']);
  });
});
