import type { Source } from '../types';

export const SOURCES: Omit<Source, 'id'>[] = [
  { name: 'BBC Türkçe', rss_url: 'https://www.bbc.com/turkce/index.xml', category: 'dünya' },
  { name: 'TRT Haber', rss_url: 'https://www.trthaber.com/sondakika.rss', category: 'gündem' },
  { name: 'Euronews TR', rss_url: 'https://tr.euronews.com/rss', category: 'dünya' },
  { name: 'NTV', rss_url: 'https://www.ntv.com.tr/son-dakika.rss', category: 'gündem' },
  { name: 'CNN Türk', rss_url: 'https://www.cnnturk.com/feed/rss/all/news', category: 'gündem' },
  { name: 'Sözcü', rss_url: 'https://www.sozcu.com.tr/rss.xml', category: 'gündem' },
  { name: 'Webtekno', rss_url: 'https://www.webtekno.com/rss.xml', category: 'teknoloji' },
  { name: 'Bloomberg HT', rss_url: 'https://www.bloomberght.com/rss', category: 'ekonomi' },
  { name: 'AA', rss_url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', category: 'gündem' },
  { name: 'AA Spor', rss_url: 'https://www.aa.com.tr/tr/rss/default?cat=spor', category: 'spor' },
];
