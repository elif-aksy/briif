import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { CATEGORY_COLORS, colors } from '../lib/theme';
import { syncNews } from '../lib/sync';
import { getArticles } from '../lib/turso';
import type { Article, Category } from '../types';

const CATEGORIES: Category[] = ['gündem', 'dünya', 'siyaset', 'ekonomi', 'spor', 'teknoloji', 'sağlık', 'kültür'];

export default function HomeScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getArticles(selectedCategory ?? undefined)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  useFocusEffect(load);

  useEffect(() => {
    setSyncing(true);
    syncNews()
      .then(load)
      .finally(() => setSyncing(false));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        <Pressable
          style={[styles.pill, selectedCategory === null && styles.pillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.pillText, selectedCategory === null && styles.pillTextActive]}>Tümü</Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.pill, selectedCategory === cat && styles.pillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.pillText, selectedCategory === cat && styles.pillTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {syncing && (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.syncText}>Haberler güncelleniyor...</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.accent} />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/article/${item.id}`)}>
              {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[item.category] }]}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.summary} numberOfLines={2}>
                  {item.summary}
                </Text>
                <Text style={styles.meta}>
                  {item.source_name} · {new Date(item.published_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Henüz haber yok</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 0 },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  pillActive: { backgroundColor: colors.accent },
  pillText: { color: colors.subtext, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: colors.text },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  syncText: { color: colors.subtext, fontSize: 12 },
  list: { paddingBottom: 32 },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  card: { flexDirection: 'row', gap: 12, padding: 16 },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.surface },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  title: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  summary: { color: colors.subtext, fontSize: 13, marginBottom: 6 },
  meta: { color: colors.subtext, fontSize: 11 },
  empty: { textAlign: 'center', color: colors.subtext, marginTop: 32 },
});
