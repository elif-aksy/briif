import { SOURCES } from '../constants/sources';
import { summarizeArticle } from './claude';
import { fetchFeedItems } from './rss';
import { articleExists, insertArticle } from './turso';

export interface SyncResult {
  added: number;
  skipped: number;
  failed: number;
}

export async function syncNews(): Promise<SyncResult> {
  const result: SyncResult = { added: 0, skipped: 0, failed: 0 };

  for (const source of SOURCES) {
    let items;
    try {
      items = await fetchFeedItems(source);
    } catch {
      continue;
    }

    for (const item of items) {
      try {
        if (await articleExists(item.link)) {
          result.skipped += 1;
          continue;
        }

        const summarized = await summarizeArticle(item.title, item.content);
        if (!summarized) {
          result.failed += 1;
          continue;
        }

        await insertArticle({
          title: item.title,
          summary: summarized.summary,
          original_url: item.link,
          source_name: source.name,
          category: summarized.category,
          keywords: summarized.keywords,
          published_at: item.publishedAt,
          image_url: item.imageUrl,
        });
        result.added += 1;
      } catch {
        result.failed += 1;
      }
    }
  }

  return result;
}
