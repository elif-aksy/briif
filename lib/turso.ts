import { createClient, type Client } from '@libsql/client';
import type { Article, Category } from '../types';

let client: Client | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_TURSO_URL;
  const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error('EXPO_PUBLIC_TURSO_URL and EXPO_PUBLIC_TURSO_AUTH_TOKEN must be set');
  }

  client = createClient({ url, authToken });
  return client;
}

export async function initDB(): Promise<void> {
  const db = getClient();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      original_url TEXT NOT NULL UNIQUE,
      source_name TEXT NOT NULL,
      category TEXT NOT NULL,
      keywords TEXT NOT NULL DEFAULT '[]',
      published_at TEXT NOT NULL,
      image_url TEXT,
      is_read INTEGER NOT NULL DEFAULT 0
    )
  `);
}

function rowToArticle(row: Record<string, unknown>): Article {
  return {
    id: Number(row.id),
    title: String(row.title),
    summary: String(row.summary),
    original_url: String(row.original_url),
    source_name: String(row.source_name),
    category: row.category as Category,
    keywords: JSON.parse(String(row.keywords ?? '[]')),
    published_at: String(row.published_at),
    image_url: row.image_url == null ? null : String(row.image_url),
    is_read: Boolean(row.is_read),
  };
}

export interface InsertArticleInput {
  title: string;
  summary: string;
  original_url: string;
  source_name: string;
  category: Category;
  keywords: string[];
  published_at: string;
  image_url: string | null;
}

export async function insertArticle(input: InsertArticleInput): Promise<void> {
  const db = getClient();
  await db.execute({
    sql: `INSERT OR IGNORE INTO articles
            (title, summary, original_url, source_name, category, keywords, published_at, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.title,
      input.summary,
      input.original_url,
      input.source_name,
      input.category,
      JSON.stringify(input.keywords),
      input.published_at,
      input.image_url,
    ],
  });
}

export async function getArticles(category?: Category): Promise<Article[]> {
  const db = getClient();
  const result = category
    ? await db.execute({
        sql: 'SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC',
        args: [category],
      })
    : await db.execute('SELECT * FROM articles ORDER BY published_at DESC');
  return result.rows.map((row) => rowToArticle(row as Record<string, unknown>));
}

export async function getArticleById(id: number): Promise<Article | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM articles WHERE id = ?',
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToArticle(row as Record<string, unknown>) : null;
}

export async function markAsRead(id: number): Promise<void> {
  const db = getClient();
  await db.execute({
    sql: 'UPDATE articles SET is_read = 1 WHERE id = ?',
    args: [id],
  });
}

export async function articleExists(originalUrl: string): Promise<boolean> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id FROM articles WHERE original_url = ?',
    args: [originalUrl],
  });
  return result.rows.length > 0;
}
