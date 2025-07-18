import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { dhbwRed } from '@/constants/Colors';
import { parseRSSItem } from '@/lib/rssParser';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

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
            <meta charset="utf-8" />
            <style>
              body{font-family:-apple-system,Roboto,Arial,sans-serif;padding:16px;line-height:1.6;color:#333}
              h1{color:${dhbwRed};font-size:20px;margin-bottom:16px;line-height:1.3}
              h2,h3,h4,h5,h6{color:#444;margin-top:20px;margin-bottom:10px}
              img{max-width:100%;height:auto;margin:16px 0;border-radius:8px}
              p{margin:0 0 16px;text-align:justify}
              a{color:${dhbwRed};text-decoration:none}
              a:hover{text-decoration:underline}
              blockquote{border-left:4px solid ${dhbwRed};margin:16px 0;padding-left:16px;font-style:italic}
              ul,ol{margin:16px 0;padding-left:20px}
              li{margin-bottom:8px}
              strong{font-weight:600}
              em{font-style:italic}
            </style>
          </head>
          <body>
            <h1>${entry.title}</h1>
            ${
              firstImg
                ? `<img src="${firstImg}" alt="${entry.title}"/>`
                : ''
            }
            <div class="content">
              ${contentWithoutHeading}
            </div>
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
