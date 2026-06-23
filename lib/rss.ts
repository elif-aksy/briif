import type { Source } from '../types';

export interface FeedItem {
  title: string;
  link: string;
  content: string;
  publishedAt: string;
  imageUrl: string | null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripCdata(text: string): string {
  const match = text.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return match ? match[1] : text;
}

function extractTagRaw(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return null;
  return stripCdata(match[1].trim());
}

function extractTag(block: string, tag: string): string | null {
  const raw = extractTagRaw(block, tag);
  if (raw === null) return null;
  return decodeEntities(raw.replace(/<[^>]+>/g, '').trim());
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*\\/?>`, 'i'));
  return match ? decodeEntities(match[1]) : null;
}

function extractFirstImgSrc(html: string): string | null {
  const match = html.match(/<img[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? decodeEntities(match[1]) : null;
}

function extractImageUrl(block: string): string | null {
  return (
    extractAttr(block, 'enclosure', 'url') ??
    extractAttr(block, 'media:content', 'url') ??
    extractAttr(block, 'media:thumbnail', 'url') ??
    extractTag(block, 'imageUrl') ??
    extractTag(block, 'image') ??
    extractFirstImgSrc(block)
  );
}

function parseRssItem(block: string): FeedItem | null {
  const title = extractTag(block, 'title');
  const link = extractTag(block, 'link') ?? extractAttr(block, 'link', 'href');
  if (!title || !link) return null;

  const descriptionRaw = extractTagRaw(block, 'description') ?? extractTagRaw(block, 'content:encoded');
  const description = descriptionRaw
    ? decodeEntities(descriptionRaw.replace(/<[^>]+>/g, '').trim())
    : title;
  const pubDate = extractTag(block, 'pubDate') ?? extractTag(block, 'dc:date');
  const imageUrl = extractImageUrl(block) ?? (descriptionRaw ? extractFirstImgSrc(descriptionRaw) : null);
  const publishedAt =
    pubDate && !Number.isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : new Date().toISOString();

  return { title, link: link.trim(), content: description, publishedAt, imageUrl };
}

function parseAtomEntry(block: string): FeedItem | null {
  const title = extractTag(block, 'title');
  const link =
    extractAttr(block, 'link', 'href') ??
    block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
    null;
  if (!title || !link) return null;

  const contentRaw = extractTagRaw(block, 'content') ?? extractTagRaw(block, 'summary');
  const description = contentRaw ? decodeEntities(contentRaw.replace(/<[^>]+>/g, '').trim()) : title;
  const pubDate = extractTag(block, 'published') ?? extractTag(block, 'updated');
  const imageUrl = extractImageUrl(block) ?? (contentRaw ? extractFirstImgSrc(contentRaw) : null);
  const publishedAt =
    pubDate && !Number.isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : new Date().toISOString();

  return { title, link: decodeEntities(link).trim(), content: description, publishedAt, imageUrl };
}

export async function fetchFeedItems(source: Pick<Source, 'rss_url'>): Promise<FeedItem[]> {
  const res = await fetch(source.rss_url);
  const xml = await res.text();

  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  if (itemBlocks.length > 0) {
    return itemBlocks.map(parseRssItem).filter((item): item is FeedItem => item !== null);
  }

  const entryBlocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  return entryBlocks.map(parseAtomEntry).filter((item): item is FeedItem => item !== null);
}
