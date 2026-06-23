import type { Article, Category } from '../types';

type HranaArg =
  | { type: 'null' }
  | { type: 'integer'; value: string }
  | { type: 'float'; value: number }
  | { type: 'text'; value: string };

type HranaValue = HranaArg | { type: 'blob'; base64: string };

interface HranaCol {
  name: string;
}

interface HranaExecuteResult {
  cols: HranaCol[];
  rows: HranaValue[][];
}

interface PipelineResponse {
  results: Array<{
    type: 'ok' | 'error';
    response?: { type: 'execute'; result: HranaExecuteResult };
    error?: { message: string };
  }>;
}

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_TURSO_URL;
  if (!url) throw new Error('EXPO_PUBLIC_TURSO_URL must be set');
  return url.replace(/^libsql:\/\//, 'https://');
}

function getAuthToken(): string {
  const token = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;
  if (!token) throw new Error('EXPO_PUBLIC_TURSO_AUTH_TOKEN must be set');
  return token;
}

function toArg(value: string | number | null): HranaArg {
  if (value === null) return { type: 'null' };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer', value: String(value) } : { type: 'float', value };
  }
  return { type: 'text', value };
}

function fromValue(value: HranaValue | undefined): string | number | null {
  if (!value) return null;
  switch (value.type) {
    case 'null':
      return null;
    case 'integer':
      return Number(value.value);
    case 'float':
      return value.value;
    case 'text':
      return value.value;
    case 'blob':
      return null;
  }
}

async function execute(sql: string, args: (string | number | null)[] = []): Promise<HranaExecuteResult> {
  const baseUrl = getBaseUrl();
  const authToken = getAuthToken();

  const res = await fetch(`${baseUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toArg) } },
        { type: 'close' },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Turso request failed: ${res.status} ${await res.text()}`);
  }

  const data: PipelineResponse = await res.json();
  const first = data.results[0];
  if (first?.type === 'error') {
    throw new Error(`Turso error: ${first.error?.message ?? 'unknown error'}`);
  }
  if (!first?.response) {
    throw new Error('Turso response missing execute result');
  }

  return first.response.result;
}

function rowsToObjects(result: HranaExecuteResult): Record<string, string | number | null>[] {
  return result.rows.map((row) => {
    const obj: Record<string, string | number | null> = {};
    result.cols.forEach((col, i) => {
      obj[col.name] = fromValue(row[i]);
    });
    return obj;
  });
}

function rowToArticle(row: Record<string, string | number | null>): Article {
  return {
    id: Number(row.id),
    title: String(row.title ?? ''),
    summary: String(row.summary ?? ''),
    original_url: String(row.original_url ?? ''),
    source_name: String(row.source_name ?? ''),
    category: String(row.category ?? 'gündem') as Category,
    keywords: JSON.parse(String(row.keywords ?? '[]')),
    published_at: String(row.published_at ?? ''),
    image_url: row.image_url == null ? null : String(row.image_url),
    is_read: Number(row.is_read) === 1,
    is_saved: Number(row.is_saved) === 1,
    read_at: row.read_at == null ? null : String(row.read_at),
  };
}

const ALL_CATEGORIES: Category[] = [
  'gündem', 'dünya', 'siyaset', 'ekonomi', 'spor', 'teknoloji', 'sağlık', 'kültür',
];

export async function initDB(): Promise<void> {
  await execute(`
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
      is_read INTEGER NOT NULL DEFAULT 0,
      is_saved INTEGER NOT NULL DEFAULT 0,
      read_at TEXT
    )
  `);
  try {
    await execute('ALTER TABLE articles ADD COLUMN read_at TEXT');
  } catch {
    // column already exists
  }
  try {
    await execute('ALTER TABLE articles ADD COLUMN is_saved INTEGER NOT NULL DEFAULT 0');
  } catch {
    // column already exists
  }
  await execute(`
    CREATE TABLE IF NOT EXISTS preferences (
      category_id TEXT PRIMARY KEY,
      priority_order INTEGER NOT NULL,
      is_enabled INTEGER NOT NULL DEFAULT 1
    )
  `);
  for (let i = 0; i < ALL_CATEGORIES.length; i += 1) {
    await execute(
      'INSERT OR IGNORE INTO preferences (category_id, priority_order, is_enabled) VALUES (?, ?, 1)',
      [ALL_CATEGORIES[i], i]
    );
  }
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
  await execute(
    `INSERT OR IGNORE INTO articles
       (title, summary, original_url, source_name, category, keywords, published_at, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.summary,
      input.original_url,
      input.source_name,
      input.category,
      JSON.stringify(input.keywords),
      input.published_at,
      input.image_url,
    ]
  );
}

export async function getArticles(category?: Category): Promise<Article[]> {
  try {
    const result = category
      ? await execute('SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC', [category])
      : await execute('SELECT * FROM articles ORDER BY published_at DESC');
    return rowsToObjects(result).map(rowToArticle);
  } catch {
    return [];
  }
}

export async function getArticleById(id: number): Promise<Article | null> {
  try {
    const result = await execute('SELECT * FROM articles WHERE id = ?', [id]);
    const rows = rowsToObjects(result);
    return rows[0] ? rowToArticle(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function markAsRead(id: number): Promise<void> {
  await execute('UPDATE articles SET is_read = 1, read_at = ? WHERE id = ?', [new Date().toISOString(), id]);
}

export async function getReadHistory(): Promise<Article[]> {
  try {
    const result = await execute('SELECT * FROM articles WHERE is_read = 1 ORDER BY read_at DESC');
    return rowsToObjects(result).map(rowToArticle);
  } catch {
    return [];
  }
}

export async function toggleSaved(id: number, saved: boolean): Promise<void> {
  await execute('UPDATE articles SET is_saved = ? WHERE id = ?', [saved ? 1 : 0, id]);
}

export async function getSavedArticles(): Promise<Article[]> {
  try {
    const result = await execute('SELECT * FROM articles WHERE is_saved = 1 ORDER BY published_at DESC');
    return rowsToObjects(result).map(rowToArticle);
  } catch {
    return [];
  }
}

export async function articleExists(originalUrl: string): Promise<boolean> {
  try {
    const result = await execute('SELECT id FROM articles WHERE original_url = ?', [originalUrl]);
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

export async function backfillImageIfMissing(originalUrl: string, imageUrl: string | null): Promise<void> {
  if (!imageUrl) return;
  try {
    await execute(
      'UPDATE articles SET image_url = ? WHERE original_url = ? AND (image_url IS NULL OR image_url = \'\')',
      [imageUrl, originalUrl]
    );
  } catch {
    // ignore
  }
}

export interface ReadingStats {
  readCount: number;
  savedCount: number;
}

export async function getReadingStats(): Promise<ReadingStats> {
  try {
    const result = await execute(
      'SELECT (SELECT COUNT(*) FROM articles WHERE is_read = 1) AS read_count, (SELECT COUNT(*) FROM articles WHERE is_saved = 1) AS saved_count'
    );
    const row = rowsToObjects(result)[0];
    return { readCount: Number(row?.read_count ?? 0), savedCount: Number(row?.saved_count ?? 0) };
  } catch {
    return { readCount: 0, savedCount: 0 };
  }
}

export interface Preference {
  category: Category;
  priorityOrder: number;
  isEnabled: boolean;
}

export async function getPreferences(): Promise<Preference[]> {
  try {
    const result = await execute('SELECT * FROM preferences ORDER BY priority_order ASC');
    return rowsToObjects(result).map((row) => ({
      category: String(row.category_id) as Category,
      priorityOrder: Number(row.priority_order),
      isEnabled: Number(row.is_enabled) === 1,
    }));
  } catch {
    return [];
  }
}

export async function setPreferenceEnabled(category: Category, enabled: boolean): Promise<void> {
  await execute('UPDATE preferences SET is_enabled = ? WHERE category_id = ?', [enabled ? 1 : 0, category]);
}

export async function getFilteredFeed(): Promise<Article[]> {
  try {
    const prefs = await getPreferences();
    const enabled = prefs.filter((p) => p.isEnabled).map((p) => p.category);
    if (enabled.length === 0) return [];
    const placeholders = enabled.map(() => '?').join(', ');
    const result = await execute(
      `SELECT * FROM articles WHERE category IN (${placeholders}) ORDER BY published_at DESC`,
      enabled
    );
    return rowsToObjects(result).map(rowToArticle);
  } catch {
    return [];
  }
}
