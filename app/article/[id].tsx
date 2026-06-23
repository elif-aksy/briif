import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORY_COLORS, colors, radius } from '../../lib/theme';
import { getArticleById, markAsRead, toggleSaved } from '../../lib/turso';
import type { Article } from '../../types';

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 150));
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = Number(id);
  const insets = useSafeAreaInsets();

  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    getArticleById(articleId).then(setArticle);
    markAsRead(articleId);
  }, [articleId]);

  if (!article) return null;

  const openSource = () => Linking.openURL(article.original_url);

  const onToggleSaved = async () => {
    await toggleSaved(article.id, !article.is_saved);
    setArticle({ ...article, is_saved: !article.is_saved });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          {article.image_url ? (
            <Image source={{ uri: article.image_url }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, { backgroundColor: colors.surfaceContainerHigh }]} />
          )}
          <LinearGradient
            colors={['transparent', 'transparent', colors.background]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[article.category] }]}>
              <Text style={styles.badgeText}>{article.category}</Text>
            </View>
            <View style={styles.readingTime}>
              <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.readingTimeText}>{estimateReadingMinutes(article.summary)} dk okuma</Text>
            </View>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.sourceRow}>
            <View style={styles.sourceIcon}>
              <MaterialIcons name="article" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sourceText}>
              {article.source_name} ·{' '}
              {new Date(article.published_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ÖZET</Text>
            <Text style={styles.summary}>{article.summary}</Text>
          </View>

          {article.keywords.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabelMuted}>Anahtar Kelimeler</Text>
              <View style={styles.chipRow}>
                {article.keywords.map((kw) => (
                  <View key={kw} style={styles.chip}>
                    <Text style={styles.chipText}>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Pressable style={styles.sourceCard} onPress={openSource}>
            <Text style={styles.sourceCardTitle}>Haberin Kaynağına Git</Text>
            <Text style={styles.sourceCardBody}>
              Bu gelişme hakkında daha fazla detay için orijinal kaynağa göz atabilirsiniz.
            </Text>
            <MaterialIcons
              name="trending-up"
              size={64}
              color={colors.primary}
              style={styles.sourceCardIcon}
            />
          </Pressable>
        </View>
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          { bottom: insets.bottom + 16 },
          article.is_saved && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={onToggleSaved}
      >
        <MaterialIcons
          name={article.is_saved ? 'bookmark' : 'bookmark-border'}
          size={24}
          color={article.is_saved ? colors.onPrimaryContainer : colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroWrap: { width: '100%', height: 280 },
  hero: { width: '100%', height: '100%' },
  content: { paddingHorizontal: 20, marginTop: -40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  badge: { borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: colors.onPrimaryContainer, fontSize: 12, fontWeight: '700' },
  readingTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readingTimeText: { color: colors.onSurfaceVariant, fontSize: 12 },
  title: { color: colors.onSurface, fontSize: 26, fontWeight: '700', lineHeight: 32, marginBottom: 16 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  sourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceText: { color: colors.onSurfaceVariant, fontSize: 12 },
  section: { marginBottom: 24 },
  sectionLabel: { color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  sectionLabelMuted: { color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  summary: { color: colors.onSurfaceVariant, fontSize: 16, lineHeight: 26 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: { color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  sourceCard: {
    padding: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  sourceCardTitle: { color: colors.primary, fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sourceCardBody: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 22 },
  sourceCardIcon: { position: 'absolute', top: 0, right: 8, opacity: 0.12 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
