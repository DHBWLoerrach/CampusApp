import { XMLParser } from 'fast-xml-parser';

// In-Memory Cache für RSS Feeds
const feedCache = new Map<
  string,
  { data: RSSFeed; timestamp: number }
>();
const xmlCache = new Map<
  string,
  { xml: string; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
 * Fetch RSS XML with caching
 */
export async function fetchRSSXML(feedUrl: string): Promise<string> {
  // check XML-Cache
  const cachedXml = xmlCache.get(feedUrl);
  if (
    cachedXml &&
    Date.now() - cachedXml.timestamp < CACHE_DURATION
  ) {
    console.log('📋 Using cached XML for:', feedUrl);
    return cachedXml.xml;
  }

  // Fetch new XML data
  console.log('🌐 Fetching fresh XML from:', feedUrl);
  const xml = await fetch(feedUrl).then((r) => r.text());

  // Cache the XML response
  xmlCache.set(feedUrl, { xml, timestamp: Date.now() });

  return xml;
}

/**
 * Parse RSS feed XML and return structured data with caching
 */
function parseRSSFeed(xmlString: string, feedUrl?: string): RSSFeed {
  // Check feed cache if feedUrl is provided
  if (feedUrl) {
    const cached = feedCache.get(feedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Using cached feed data for:', feedUrl);
      return cached.data;
    }
  }

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

  const feed = { items };

  // Cache the parsed feed data if feedUrl is provided
  if (feedUrl) {
    console.log('💾 Caching feed data for:', feedUrl);
    feedCache.set(feedUrl, { data: feed, timestamp: Date.now() });
  }

  return feed;
}

/**
 * Fetch and parse RSS feed with full caching
 */
export async function fetchAndParseRSSFeed(
  feedUrl: string
): Promise<RSSFeed> {
  const xml = await fetchRSSXML(feedUrl);
  return parseRSSFeed(xml, feedUrl);
}

/**
 * Find a specific RSS item by ID with caching
 */
export async function fetchRSSItem(
  feedUrl: string,
  targetId: string
): Promise<RSSItem | null> {
  const xml = await fetchRSSXML(feedUrl);
  const feed = parseRSSFeed(xml, feedUrl);
  return feed.items.find((item) => item.id === targetId) || null;
}
