import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '../lib/theme';
import { SOURCES } from '../constants/sources';
import { getPreferences, setPreferenceEnabled } from '../lib/turso';
import type { Category } from '../types';

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [enabled, setEnabled] = useState<Record<Category, boolean>>({} as Record<Category, boolean>);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>(
    SOURCES.reduce((acc, s) => ({ ...acc, [s.name]: true }), {} as Record<string, boolean>)
  );

  useEffect(() => {
    getPreferences().then((prefs) => {
      setCategories(prefs.map((p) => p.category));
      setEnabled(prefs.reduce((acc, p) => ({ ...acc, [p.category]: p.isEnabled }), {} as Record<Category, boolean>));
    });
  }, []);

  const toggleCategory = (cat: Category) => {
    const next = !enabled[cat];
    setEnabled((prev) => ({ ...prev, [cat]: next }));
    setPreferenceEnabled(cat, next);
  };
  const toggleSource = (name: string) => setSubscribed((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Briif</Text>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Text style={styles.saveText}>Kaydet</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.title}>İlgi Alanları ve Kaynaklar</Text>
          <Text style={styles.subtitle}>
            Haber akışını kişiselleştirmek için kategorileri ve kaynakları yönetin.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favori Kategoriler</Text>
          <View style={styles.list}>
            {categories.map((cat) => (
              <View key={cat} style={styles.categoryRow}>
                <Text style={styles.categoryText}>{cat}</Text>
                <Pressable
                  style={[styles.toggleTrack, enabled[cat] && styles.toggleTrackOn]}
                  onPress={() => toggleCategory(cat)}
                >
                  <View style={[styles.toggleDot, enabled[cat] && styles.toggleDotOn]} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Takip Edilen Kaynaklar</Text>
          <View style={styles.sourceGrid}>
            {SOURCES.map((source) => (
              <View key={source.name} style={styles.sourceCard}>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceIcon}>
                    <MaterialIcons name="newspaper" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceCategory}>{source.category}</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.subscribeButton, subscribed[source.name] && styles.subscribedButton]}
                  onPress={() => toggleSource(source.name)}
                >
                  {subscribed[source.name] && (
                    <MaterialIcons name="check" size={16} color={colors.onSecondary} />
                  )}
                  <Text
                    style={[
                      styles.subscribeText,
                      subscribed[source.name] && styles.subscribedText,
                    ]}
                  >
                    {subscribed[source.name] ? 'Takipte' : 'Abone Ol'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
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
  headerTitle: { color: colors.onSurface, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  saveText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 48, gap: 32 },
  intro: { gap: 8 },
  title: { color: colors.onSurface, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.onSurfaceVariant, fontSize: 14, lineHeight: 20 },
  section: { gap: 16 },
  sectionTitle: { color: colors.onSurface, fontSize: 16, fontWeight: '600' },
  list: { gap: 8 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  categoryText: { color: colors.onSurface, fontSize: 16, textTransform: 'capitalize' },
  toggleTrack: {
    width: 40,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: { backgroundColor: colors.primary },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.outline,
  },
  toggleDotOn: {
    backgroundColor: colors.onPrimaryContainer,
    alignSelf: 'flex-end',
  },
  sourceGrid: { gap: 12 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  sourceInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceName: { color: colors.onSurface, fontSize: 14, fontWeight: '600' },
  sourceCategory: { color: colors.outline, fontSize: 12, textTransform: 'capitalize' },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  subscribedButton: { borderColor: colors.secondary, backgroundColor: colors.secondary },
  subscribeText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  subscribedText: { color: colors.onSecondary },
});
