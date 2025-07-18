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
  enclosures?: { url: string }[];
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
  // Try multiple content fields in order of preference
  const contentFields = [
    item['content:encoded'],
    item.content,
    item.description,
    item.summary,
  ];

  // Find the longest content (most complete)
  let bestContent = '';
  for (const field of contentFields) {
    const text = extractText(field);
    if (text && text.trim().length > bestContent.length) {
      bestContent = text.trim();
    }
  }

  return bestContent;
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
 * Parse RSS feed XML and return structured data
 */
export function parseRSSFeed(xmlString: string): RSSFeed {
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
      enclosures: extractEnclosures(item),
    }));

  return { items };
}

/**
 * Find a specific RSS item by ID
 */
export function parseRSSItem(
  xmlString: string,
  targetId: string
): RSSItem | null {
  const feed = parseRSSFeed(xmlString);
  return feed.items.find((item) => item.id === targetId) || null;
}
