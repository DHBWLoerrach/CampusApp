import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { XMLParser } from 'fast-xml-parser';
import { dhbwRed } from '@/constants/Colors';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

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

// RSS parser for detail view that extracts content
function parseRSSItem(xmlString: string, targetId: string) {
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlString);

  // Navigate to RSS items
  const rssItems = result?.rss?.channel?.item || [];
  const itemsArray = Array.isArray(rssItems) ? rssItems : [rssItems];

  const item = itemsArray.find((item: any) => {
    const id = item.guid?.['#text'] || item.guid || item.link;
    return id === targetId;
  });

  if (!item) return null;

  return {
    id: item.guid?.['#text'] || item.guid || item.link,
    title:
      item.title?.['#cdata'] ||
      item.title?.['#text'] ||
      item.title ||
      '',
    content:
      item.description?.['#cdata'] ||
      item.description?.['#text'] ||
      item['content:encoded']?.['#cdata'] ||
      item['content:encoded']?.['#text'] ||
      '',
    enclosures: item.enclosure
      ? [
          {
            url:
              typeof item.enclosure === 'object'
                ? item.enclosure['@_url']
                : item.enclosure,
          },
        ]
      : undefined,
  };
}

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const xml = await fetch(FEED_URL).then((r) => r.text());
      const entry = parseRSSItem(xml, id);
      if (!entry) return;

      // Bildquelle: zuerst enclosure, sonst erstes <img> aus dem Content
      const enclosureImg = entry.enclosures?.[0]?.url;
      const content = entry.content || '';
      const matchImg = content.match(/<img[^>]+src="([^"]+)"/i);
      const firstImg = enclosureImg ?? matchImg?.[1];

      // ggf. doppeltes <h1> aus content entfernen
      const contentWithoutHeading = content.replace(
        /<h\d[^>]*>.*?<\/h\d>/i,
        ''
      );

      const htmlDoc = `
        <!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body{font-family:-apple-system,Roboto,Arial,sans-serif;padding:16px;line-height:1.55}
              h1{color:${dhbwRed};font-size:20px;margin-bottom:16px}
              img{max-width:100%;height:auto;margin:16px 0}
              p{margin:0 0 14px}
            </style>
          </head>
          <body>
            <h1>${entry.title}</h1>
            ${firstImg ? `<img src="${firstImg}"/>` : ''}
            ${contentWithoutHeading}
          </body>
        </html>`;
      setHtml(htmlDoc);
    })();
  }, [id]);

  if (!html) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      startInLoadingState
      style={{ flex: 1 }}
    />
  );
}
