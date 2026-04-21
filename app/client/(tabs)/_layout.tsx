import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Главная" }} />
      <Tabs.Screen name="chat" options={{ title: "Чат" }} />
      <Tabs.Screen name="stats" options={{ title: "Статистика" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
      <Tabs.Screen
        name="create"
        options={{
          href: null,
          title: "Создать запись",
        }}
      />
    </Tabs>
  );
}
