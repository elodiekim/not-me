import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';

export default function TabsLayout() {
  // react-navigation's own BottomTabBar normally adds insets.bottom to the
  // tab bar's height/paddingBottom itself — but it does that by putting its
  // computed style ahead of tabBarStyle in the same style array, so any
  // height/paddingBottom we set here overrides that computed value instead
  // of combining with it. The fixed 64/10/8 below were chosen to fix a
  // web-only label-clipping bug (web's insets.bottom is always 0, so there
  // was nothing to override there) — but applied as-is to every platform,
  // they silently wiped out the real safe-area bottom inset on native,
  // sinking the bar down into the home-indicator area. Adding insets.bottom
  // back in restores native's clearance while leaving web (insets.bottom
  // already 0) exactly as the earlier fix intended.
  const insets = useSafeAreaInsets();

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
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          minHeight: 16,
          fontFamily: 'Poppins_500Medium',
        },
        tabBarStyle: {
          borderTopColor: COLORS.surface,
          height: 64 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 8,
        },
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
