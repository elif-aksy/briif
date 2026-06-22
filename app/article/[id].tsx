import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { CATEGORY_COLORS, colors } from '../../lib/theme';
import { getArticleById, markAsRead } from '../../lib/turso';
import type { Article } from '../../types';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = Number(id);

  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    getArticleById(articleId).then(setArticle);
    markAsRead(articleId);
  }, [articleId]);

  if (!article) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {article.image_url && <Image source={{ uri: article.image_url }} style={styles.image} />}

      <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[article.category] }]}>
        <Text style={styles.badgeText}>{article.category}</Text>
      </View>

      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.meta}>
        {article.source_name} · {new Date(article.published_at).toLocaleDateString('tr-TR')}
      </Text>

      <Text style={styles.summary}>{article.summary}</Text>

      {article.keywords.length > 0 && (
        <View style={styles.keywordWrap}>
          {article.keywords.map((kw) => (
            <View key={kw} style={styles.chip}>
              <Text style={styles.chipText}>{kw}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.button} onPress={() => Linking.openURL(article.original_url)}>
        <Text style={styles.buttonText}>Haberin tamamını oku</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: colors.surface, marginBottom: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.subtext, fontSize: 12, marginBottom: 16 },
  summary: { color: colors.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  keywordWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.subtext, fontSize: 12, fontWeight: '600' },
  button: { backgroundColor: colors.accent, borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
