import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_COLORS, colors, radius } from '../lib/theme';
import { getReadHistory } from '../lib/turso';
import type { Article } from '../types';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);

  useFocusEffect(
    useCallback(() => {
      getReadHistory().then(setArticles);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Okuma Geçmişi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {articles.length === 0 ? (
          <Text style={styles.empty}>Henüz hiçbir haberi açmadın</Text>
        ) : (
          <View style={styles.feed}>
            {articles.map((item) => (
              <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/article/${item.id}`)}>
                <View style={styles.cardBody}>
                  <Text style={[styles.categoryLabel, { color: CATEGORY_COLORS[item.category] }]}>
                    {item.category.toUpperCase()}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.meta}>
                    {item.source_name}
                    {item.read_at ? ` · ${new Date(item.read_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Text>
                </View>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: CATEGORY_COLORS[item.category] + '22' }]}>
                    <MaterialIcons name="article" size={22} color={CATEGORY_COLORS[item.category]} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: { color: colors.onSurface, fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, gap: 12 },
  feed: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  thumb: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 32 },
});
