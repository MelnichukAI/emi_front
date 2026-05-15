import AiIcon from "@/assets/icons/aichat.svg";
import CompasIcon from "@/assets/icons/compas.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import StatIcon from "@/assets/icons/stat.svg";
import { colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import { ComponentType } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const tabBarStyle = Platform.select({
    ios: {
      backgroundColor: colors.tabBar,
      borderTopWidth: 2,
      borderTopColor: colors.primary,
      height: 52 + insets.bottom,
      paddingTop: 6,
      paddingBottom: insets.bottom,
    },
    default: {
      backgroundColor: colors.tabBar,
      borderTopWidth: 2,
      borderTopColor: colors.primary,
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom + 8, 18),
      height: 58 + insets.bottom,
    },
  });

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
