import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Главная" }} />
      <Tabs.Screen name="explore" options={{ title: "Статистика" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
      <Tabs.Screen name="settings" options={{ title: "Настройки" }} />
    </Tabs>
  );
}
