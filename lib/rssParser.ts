import { XMLParser } from 'fast-xml-parser';

// XML parser configuration
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  parseNodeValue: true,
  parseTagValue: true,
  textNodeName: '#text',
  cdataPropName: '#cdata',
};

export interface RSSItem {
  id: string;
  title: string;
  published: string;
  content?: string;
  description?: string;
  enclosures?: { url: string }[];
  link?: string; // optional link field
}

export interface RSSFeed {
  items: RSSItem[];
}

// Helper function to extract text from XML parser result
function extractText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value['#cdata'] || value['#text'] || value || '';
}

// Helper function to extract content from various RSS fields
function extractContent(item: any): string {
  return extractText(item['content:encoded']).trim();
}

// Helper function to extract description from item
function extractDescription(item: any): string {
  return extractText(item.description).trim();
}

// Helper function to extract ID from item
function extractId(item: any): string {
  return item.guid?.['#text'] || item.guid || item.link || '';
}

// Helper function to extract enclosures
function extractEnclosures(item: any): { url: string }[] | undefined {
  if (!item.enclosure) return undefined;

  const url =
    typeof item.enclosure === 'object'
      ? item.enclosure['@_url']
      : item.enclosure;

  return url ? [{ url }] : undefined;
}

/**
 * Parse RSS feed XML and return structured data with
 */
function parseRSSFeed(xmlString: string, feedUrl?: string): RSSFeed {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlString);

  // Navigate to RSS items
  const rssItems = result?.rss?.channel?.item || [];
  const itemsArray = Array.isArray(rssItems) ? rssItems : [rssItems];

  const items: RSSItem[] = itemsArray
    .filter(
      (item: any) =>
        item && extractText(item.title) && extractId(item)
    )
    .map((item: any) => ({
      id: extractId(item),
      title: extractText(item.title),
      published: item.pubDate || '',
      content: extractContent(item),
      description: extractDescription(item),
      enclosures: extractEnclosures(item),
      link: item.link || '',
    }));

  const feed = { items };
  return feed;
}

/**
 * Fetch and parse RSS feed
 */
export async function fetchAndParseRSSFeed(
  feedUrl: string
): Promise<RSSFeed> {
  const xml = await fetch(feedUrl).then((r) => r.text());
  return parseRSSFeed(xml, feedUrl);
}
