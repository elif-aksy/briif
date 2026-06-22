import Anthropic from '@anthropic-ai/sdk';
import type { SummaryResult } from '../types';

const VALID_CATEGORIES = ['siyaset', 'ekonomi', 'spor', 'teknoloji', 'dünya', 'sağlık', 'kültür', 'gündem'];

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY must be set');
  }
  // NOTE: bundling the API key into the client app means anyone can extract
  // and reuse it. Fine for personal/local use, not for a public release.
  client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  return client;
}

export async function summarizeArticle(title: string, content: string): Promise<SummaryResult | null> {
  try {
    const anthropic = getClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Aşağıdaki haberi Türkçe olarak özetle. Sadece şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"summary": "2-3 cümle Türkçe özet", "category": "siyaset|ekonomi|spor|teknoloji|dünya|sağlık|kültür|gündem", "keywords": ["kelime1", "kelime2", "kelime3"]}

Başlık: ${title}

İçerik: ${content}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return null;

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (
      typeof parsed.summary !== 'string' ||
      typeof parsed.category !== 'string' ||
      !VALID_CATEGORIES.includes(parsed.category) ||
      !Array.isArray(parsed.keywords)
    ) {
      return null;
    }

    return {
      summary: parsed.summary,
      category: parsed.category,
      keywords: parsed.keywords.map(String),
    };
  } catch {
    return null;
  }
}
