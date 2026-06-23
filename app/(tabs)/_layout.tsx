import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.outlineVariant,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="explore" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Kaydedilenler',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
