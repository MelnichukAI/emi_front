import AiIcon from "@/assets/icons/ai.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import StatIcon from "@/assets/icons/stat.svg";
import { colors } from "@/constants/colors";
import { HomeRecentEntriesProvider } from "@/lib/home-recent-entries-context";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICON_SIZE = 24;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = Platform.select({
    ios: {
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(47, 74, 125, 0.12)",
      /** Компактнее стандартного Expo/RN, чтобы не было лишнего пустого поля под иконками */
      height: 52 + insets.bottom,
      paddingTop: 4,
      paddingBottom: insets.bottom,
    },
    default: {
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(47, 74, 125, 0.12)",
      /** Запас над системной навигацией (жесты / трёхкнопочная панель) */
      paddingTop: 6,
      paddingBottom: Math.max(insets.bottom + 12, 26),
    },
  });

  return (
    <HomeRecentEntriesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle,
          tabBarLabelStyle: {
            fontSize: Platform.OS === "ios" ? 10 : 11,
            fontWeight: "500",
            marginBottom: Platform.OS === "ios" ? 2 : 4,
          },
          tabBarItemStyle: {
            paddingTop: Platform.OS === "ios" ? 2 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Главная",
            tabBarIcon: ({ color }) => (
              <HomeIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Чат",
            tabBarIcon: ({ color }) => (
              <AiIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Статистика",
            tabBarIcon: ({ color }) => (
              <StatIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Профиль",
            tabBarIcon: ({ color }) => (
              <ProfileIcon
                width={TAB_ICON_SIZE}
                height={TAB_ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </HomeRecentEntriesProvider>
  );
}
