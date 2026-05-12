import AiIcon from "@/assets/icons/ai.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import StatIcon from "@/assets/icons/stat.svg";
import { colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import { ComponentType } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
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

function makeTabBarLabel(title: string) {
  function TabBarLabel({
    focused,
    color,
  }: {
    focused: boolean;
    color: string;
  }) {
    return (
      <Text
        style={[
          styles.tabLabel,
          Platform.OS === "ios" ? styles.tabLabelIos : styles.tabLabelAndroid,
          { color },
          focused && styles.tabLabelFocused,
        ]}
      >
        {title}
      </Text>
    );
  }
  TabBarLabel.displayName = `TabBarLabel(${title})`;
  return TabBarLabel;
}

const tabBarLabelHome = makeTabBarLabel("Главная");
const tabBarLabelChat = makeTabBarLabel("Чат");
const tabBarLabelStats = makeTabBarLabel("Статистика");
const tabBarLabelProfile = makeTabBarLabel("Профиль");

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = Platform.select({
    ios: {
      backgroundColor: colors.tabBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(75, 69, 150, 0.12)",
      height: 54 + insets.bottom,
      paddingTop: 6,
      paddingBottom: insets.bottom,
    },
    default: {
      backgroundColor: colors.tabBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(75, 69, 150, 0.12)",
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom + 8, 20),
      height: 62 + insets.bottom,
    },
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle,
        tabBarItemStyle: {
          paddingTop: Platform.OS === "ios" ? 0 : 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarLabel: tabBarLabelHome,
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={HomeIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",
          tabBarLabel: tabBarLabelChat,
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={AiIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Статистика",
          tabBarLabel: tabBarLabelStats,
          tabBarIcon: ({ focused }) => (
            <TabIconSlot focused={focused} Icon={StatIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarLabel: tabBarLabelProfile,
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
  tabLabel: {
    fontWeight: "500",
    marginTop: 2,
  },
  tabLabelFocused: {
    fontWeight: "700",
  },
  tabLabelIos: {
    fontSize: 10,
    marginBottom: 2,
  },
  tabLabelAndroid: {
    fontSize: 11,
    marginBottom: 2,
  },
});
