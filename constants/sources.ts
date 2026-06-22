import type { Source } from '../types';

export const SOURCES: Omit<Source, 'id'>[] = [
  { name: 'BBC Türkçe', rss_url: 'http://feeds.bbci.co.uk/turkish/rss.xml', category: 'dünya' },
  { name: 'TRT Haber', rss_url: 'https://www.trthaber.com/sondakika.rss', category: 'gündem' },
  { name: 'Euronews TR', rss_url: 'https://tr.euronews.com/rss', category: 'dünya' },
  { name: 'NTV', rss_url: 'https://www.ntv.com.tr/son-dakika.rss', category: 'gündem' },
];
