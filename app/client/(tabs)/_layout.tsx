import AiIcon from "@/assets/icons/aichat.svg";
import CompasIcon from "@/assets/icons/compas.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import StatIcon from "@/assets/icons/stat.svg";
import { colors } from "@/constants/colors";
import { buildTabBarStyle } from "@/lib/tab-bar-style";
import { Tabs, usePathname } from "expo-router";
import { ComponentType, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Экран просмотра/редактирования записи и выбор тегов — без линии над таббаром. */
function shouldHideTabBarTopBorder(pathname: string): boolean {
  return /\/profile\/entry\/[^/]+(\/tags)?$/.test(pathname);
}

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

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const hideTabBarTopBorder = shouldHideTabBarTopBorder(pathname);

  const tabBarStyle = useMemo(
    () =>
      buildTabBarStyle({
        bottomInset: insets.bottom,
        hideTopBorder: hideTabBarTopBorder,
        backgroundColor: colors.tabBar,
      }),
    [hideTabBarTopBorder, insets.bottom],
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
          title: "Главная",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={HomeIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: "Справочники",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={CompasIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={AiIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
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
