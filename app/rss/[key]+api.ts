const FEEDS: Record<string, string> = {
  news: 'https://dhbw-loerrach.de/rss-campus-app-aktuell',
  events: 'https://dhbw-loerrach.de/rss-campus-app-termine',
};

export async function GET(req: Request, context: { key: string }) {
  const feedUrl = FEEDS[context.key];

  if (!feedUrl) {
    return new Response('Feed not found', { status: 404 });
  }

  try {
    const res = await fetch(feedUrl);
    const text = await res.text();

    return new Response(text, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response('Fetch failed', { status: 500 });
  }
}
