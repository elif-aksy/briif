import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_COLORS, colors, radius } from '../../lib/theme';
import { syncNews } from '../../lib/sync';
import { getFilteredFeed, toggleSaved } from '../../lib/turso';
import type { Article } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(() => {
    getFilteredFeed().then(setArticles);
  }, []);

  const sync = useCallback(() => {
    setSyncing(true);
    syncNews()
      .then(load)
      .finally(() => setSyncing(false));
  }, [load]);

  useFocusEffect(load);
  useEffect(() => { sync(); }, []);

  const onToggleSaved = async (item: Article) => {
    await toggleSaved(item.id, !item.is_saved);
    load();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
        <Text style={styles.headerTitle}>Briif</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerStatus}>{syncing ? 'Güncelleniyor...' : 'Az önce güncellendi'}</Text>
          <Pressable hitSlop={8} onPress={sync}>
            <MaterialIcons name="sync" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={sync} tintColor={colors.primary} />}
      >
        {articles.length === 0 ? (
          <Text style={styles.empty}>
            Henüz haber yok. İlgi alanlarını "Profil &gt; İlgi Alanları" üzerinden ayarlayabilirsin.
          </Text>
        ) : (
          <View style={styles.feed}>
            {articles.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.card, item.is_read && styles.cardRead]}
                onPress={() => router.push(`/article/${item.id}`)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardBody}>
                    <View style={styles.categoryRowSmall}>
                      <Text style={[styles.categoryLabel, { color: CATEGORY_COLORS[item.category] }]}>
                        {item.category.toUpperCase()}
                      </Text>
                      <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.summary} numberOfLines={2}>
                      {item.summary}
                    </Text>
                    {item.keywords.length > 0 && (
                      <View style={styles.chipRow}>
                        {item.keywords.slice(0, 3).map((kw) => (
                          <View key={kw} style={styles.chip}>
                            <Text style={styles.chipText}>#{kw}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: CATEGORY_COLORS[item.category] + '22' }]}>
                      <MaterialIcons name="article" size={28} color={CATEGORY_COLORS[item.category]} />
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.meta}>
                    {item.source_name} · {new Date(item.published_at).toLocaleDateString('tr-TR')}
                  </Text>
                  <View style={styles.cardActions}>
                    <Pressable hitSlop={6} onPress={() => onToggleSaved(item)}>
                      <MaterialIcons
                        name={item.is_saved ? 'bookmark' : 'bookmark-border'}
                        size={20}
                        color={item.is_saved ? colors.primary : colors.onSurfaceVariant}
                      />
                    </Pressable>
                    <MaterialIcons name="share" size={20} color={colors.onSurfaceVariant} />
                  </View>
                </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: { color: colors.onSurface, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerStatus: { color: colors.onSurfaceVariant, fontSize: 12, opacity: 0.7 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 32 },
  feed: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  cardRead: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', gap: 16, padding: 16 },
  cardBody: { flex: 1, gap: 8 },
  categoryRowSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  title: { color: colors.onSurface, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  summary: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 20, opacity: 0.8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { backgroundColor: colors.surfaceContainerHighest, borderRadius: radius.lg, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { color: colors.onSurfaceVariant, fontSize: 10 },
  thumb: { width: 96, height: 96, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  meta: { color: colors.onSurfaceVariant, fontSize: 11, opacity: 0.6 },
  cardActions: { flexDirection: 'row', gap: 16 },
  empty: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 32, paddingHorizontal: 32 },
});
