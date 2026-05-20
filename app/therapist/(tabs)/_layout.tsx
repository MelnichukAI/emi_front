import AiIcon from "@/assets/icons/ai.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import StatIcon from "@/assets/icons/stat.svg";
import { colors } from "@/constants/colors";
import { buildTabBarStyle } from "@/lib/tab-bar-style";
import { Tabs } from "expo-router";
import { ComponentType, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THERAPIST_TAB_BAR_BG = "#F8F8F8";

const TAB_ICON_SIZE = 22;

type SvgIconProps = {
  width: number;
  height: number;
  color: string;
};

function TabIconSlot({
  focused,
  Icon,
}: {
  focused: boolean;
  Icon: ComponentType<SvgIconProps>;
}) {
  return (
    <View style={[styles.iconSlot, focused && styles.iconSlotActive]}>
      <Icon
        width={TAB_ICON_SIZE}
        height={TAB_ICON_SIZE}
        color={focused ? "#FFFFFF" : colors.subtext}
      />
    </View>
  );
}

export default function TherapistTabsLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(
    () =>
      buildTabBarStyle({
        bottomInset: insets.bottom,
        backgroundColor: THERAPIST_TAB_BAR_BG,
      }),
    [insets.bottom],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Дашборд",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={HomeIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: "Записи",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={AiIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="client"
        options={{
          title: "Статистика",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={StatIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={ProfileIcon} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconSlot: {
    minWidth: 44,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconSlotActive: {
    backgroundColor: colors.primary,
  },
});
