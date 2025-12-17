const FEEDS: Record<string, string> = {
  news: 'https://dhbw-loerrach.de/rss-campus-app-aktuell',
  events: 'https://dhbw-loerrach.de/rss-campus-app-termine',
};

type ApiContext = { params?: { key?: string }; key?: string };

export async function GET(req: Request, context: ApiContext) {
  const key = context?.params?.key ?? context?.key;
  const feedUrl = key ? FEEDS[key] : undefined;

  if (!feedUrl) {
    return new Response('Feed not found', { status: 404 });
  }

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) {
      return new Response('Fetch failed', { status: res.status });
    }
    const text = await res.text();

    return new Response(text, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Fetch failed', { status: 500 });
  }
}
