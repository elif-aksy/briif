import Parser from 'rss-parser';
import type { Source } from '../types';

const parser = new Parser();

export interface FeedItem {
  title: string;
  link: string;
  content: string;
  publishedAt: string;
  imageUrl: string | null;
}

export async function fetchFeedItems(source: Pick<Source, 'rss_url'>): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.rss_url);

  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!.trim(),
      link: item.link!.trim(),
      content: (item.contentSnippet || item.content || item.summary || item.title || '').trim(),
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      imageUrl: item.enclosure?.url ?? null,
    }));
}
