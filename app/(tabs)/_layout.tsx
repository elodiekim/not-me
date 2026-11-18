import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDisabled,
        // minHeight stops the label row from being flex-shrunk below its own
        // line-height — on web, the tab item's icon+label column has no
        // slack to spare (no safe-area bottom inset to pad it out the way
        // native gets), so without this the label's box shrinks under the
        // 16px it needs and overflow:hidden clips the bottom of the glyphs.
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, minHeight: 16, fontFamily: 'Poppins_500Medium' },
        tabBarStyle: { borderTopColor: COLORS.surface, height: 64, paddingBottom: 10, paddingTop: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: 'Mission',
          tabBarIcon: ({ color, size }) => <Feather name="clipboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Feather name="inbox" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
