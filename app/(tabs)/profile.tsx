import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '../../lib/theme';
import { getReadingStats, type ReadingStats } from '../../lib/turso';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<ReadingStats>({ readCount: 0, savedCount: 0 });

  useFocusEffect(
    useCallback(() => {
      getReadingStats().then(setStats);
    }, [])
  );

  const menuItems = [
    { icon: 'history', label: 'Okuma Geçmişi', onPress: () => router.push('/history') },
    { icon: 'interests', label: 'İlgi Alanlarını Yönet', onPress: () => router.push('/interests') },
    { icon: 'notifications', label: 'Bildirim Ayarları', onPress: () => {} },
    { icon: 'info', label: 'Hakkında', onPress: () => {} },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.readCount}</Text>
            <Text style={styles.statLabel}>Okunan</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.savedCount}</Text>
            <Text style={styles.statLabel}>Kaydedilen</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable key={item.label} style={styles.menuRow} onPress={item.onPress}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <MaterialIcons name={item.icon} size={20} color={colors.onSurfaceVariant} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>Briif v1.0.0</Text>
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
  scrollContent: { padding: 20, gap: 24 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  statLabel: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4, opacity: 0.7 },
  menu: { gap: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.xl,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { color: colors.onSurface, fontSize: 14, fontWeight: '600' },
  version: { textAlign: 'center', color: colors.onSurfaceVariant, opacity: 0.4, fontSize: 12 },
});
