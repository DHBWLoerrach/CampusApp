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
  if (value == null) return '';

  if (Array.isArray(value)) {
    for (const entry of value) {
      const text = extractText(entry);
      if (text) return text;
    }
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    const candidate =
      value['#cdata'] ?? value['#text'] ?? value['@_value'] ?? null;
    return extractText(candidate);
  }

  return '';
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
  const raw = item.enclosure;
  if (!raw) return undefined;

  const entries = Array.isArray(raw) ? raw : [raw];
  const urls = entries
    .map((entry) => {
      if (!entry) return '';
      if (typeof entry === 'string' || typeof entry === 'number') {
        return String(entry).trim();
      }
      if (typeof entry === 'object') {
        const candidate =
          entry['@_url'] ?? entry.url ?? entry['#text'] ?? entry['@_href'];
        return typeof candidate === 'string'
          ? candidate.trim()
          : candidate != null
          ? String(candidate).trim()
          : '';
      }
      return '';
    })
    .filter((url): url is string => url.length > 0)
    .map((url) => ({ url }));

  return urls.length ? urls : undefined;
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
