import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_COLORS, colors, radius } from '../../lib/theme';
import { getArticles } from '../../lib/turso';
import type { Article, Category } from '../../types';

const CATEGORIES: Category[] = ['gündem', 'dünya', 'siyaset', 'ekonomi', 'spor', 'teknoloji', 'sağlık', 'kültür'];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    getArticles(selectedCategory ?? undefined).then(setArticles);
  }, [selectedCategory]);

  useFocusEffect(load);

  const filtered = useMemo(() => {
    if (!query.trim()) return articles;
    const q = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source_name.toLowerCase().includes(q)
    );
  }, [articles, query]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
        <Text style={styles.headerTitle}>Briif</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Keşfet</Text>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Haber, konu veya kaynak ara..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.searchInput}
          />
        </View>

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

        {filtered.length === 0 ? (
          <Text style={styles.empty}>Sonuç bulunamadı</Text>
        ) : (
          <View style={styles.feed}>
            {filtered.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => router.push(`/article/${item.id}`)}
              >
                <View style={styles.cardBody}>
                  <Text style={[styles.categoryLabel, { color: CATEGORY_COLORS[item.category] }]}>
                    {item.category.toUpperCase()}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.meta}>
                    {item.source_name} · {new Date(item.published_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: CATEGORY_COLORS[item.category] + '22' }]}>
                    <MaterialIcons name="article" size={24} color={CATEGORY_COLORS[item.category]} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },
  title: { color: colors.onSurface, fontSize: 24, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14 },
  categoryRow: { flexGrow: 0 },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginRight: 8,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: colors.onPrimaryContainer },
  feed: { gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 16,
  },
  cardBody: { flex: 1, gap: 6 },
  categoryLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '600', lineHeight: 21 },
  meta: { color: colors.onSurfaceVariant, fontSize: 11, opacity: 0.6 },
  thumb: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 32 },
});
