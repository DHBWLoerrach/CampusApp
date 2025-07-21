import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { dhbwRed, Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchRSSItem } from '@/lib/rssParser';

const NEWS_FEED_URL =
  'https://dhbw-loerrach.de/rss-campus-app-aktuell';

export default function NewsDetail() {
  const { id, feedUrl } = useLocalSearchParams<{
    id: string;
    feedUrl?: string;
  }>();
  const [html, setHtml] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Fallback to default feed URL if none provided
  const actualFeedUrl = feedUrl || NEWS_FEED_URL;

  useEffect(() => {
    (async () => {
      const entry = await fetchRSSItem(actualFeedUrl, id); // uses XML and feed caching
      if (!entry) return;

      // image source: first enclosure, otherwise first <img> from content
      const enclosureImg = entry.enclosures?.[0]?.url;
      const meta =
        actualFeedUrl === NEWS_FEED_URL
          ? `Veröffentlicht am ${format(
              entry.published,
              'dd.MM.yyyy',
              {
                locale: de,
              }
            )}`
          : format(entry.published, 'EEEE, dd.MM.yyyy', {
              locale: de,
            });
      const description = entry.description || '';
      const content = entry.content || '';
      const matchImg = content.match(/<img[^>]+src="([^"]+)"/i);
      const firstImg = enclosureImg ?? matchImg?.[1];

      // remove duplicate <h1> from content
      const contentWithoutHeading = content.replace(
        /<h\d[^>]*>.*?<\/h\d>/i,
        ''
      );

      const htmlDoc = `
        <!doctype html>
        <html lang="de">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charset="utf-8" />
            <style>
              body{font-family:-apple-system,Roboto,Arial,sans-serif;padding:16px;line-height:1.6;color:${
                colors.text
              };background-color:${
        colors.background
      }}                            
              h1{color:${dhbwRed};font-size:20px;margin-bottom:16px;line-height:1.3}
              h2,h3,h4,h5,h6{color:${
                colorScheme === 'dark' ? '#CCCCCC' : '#444444'
              };margin-top:20px;margin-bottom:10px}
              img{max-width:100%;height:auto;margin:16px 0;border-radius:8px;}
              p{margin:0 0 16px;text-align:left;hyphens:auto;}
              a{color:${dhbwRed};text-decoration:none}
              a:hover{text-decoration:underline}
              blockquote{border-left:4px solid ${dhbwRed};margin:16px 0;padding-left:16px;font-style:italic;color:${
        colorScheme === 'dark' ? '#BBBBBB' : 'inherit'
      }}
              ul,ol{margin:16px 0;padding-left:20px}
              li{margin-bottom:8px}
              strong{font-weight:600}
              em{font-style:italic}
              .meta{color:${
                colorScheme === 'dark' ? '#7a7a7a' : '#6e6e6e)'
              };font-style:italic}
              .desc{font-weight:600}
            </style>
          </head>
          <body>
            <h1>${entry.title}</h1>
            <p class="meta">${meta}</p>            
            <p class="desc">${description}</p>
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
  }, [id, colorScheme, actualFeedUrl]);

  if (!html)
    return (
      <ActivityIndicator
        style={{ flex: 1, backgroundColor: colors.background }}
        size="large"
        color={colors.tint}
      />
    );

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      androidHardwareAccelerationDisabled={true}
      overScrollMode="never"
      style={{ flex: 1, backgroundColor: colors.background }}
      backgroundColor={colors.background}
    />
  );
}
