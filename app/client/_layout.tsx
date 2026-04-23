import { Stack } from "expo-router";

/**
 * Сегмент /client в корневом Stack. Дочерний маршрут — только (tabs).
 * Отдельный app/client/index.tsx не используем: он ломал сопоставление с /client/index у вкладки «Главная».
 */
export default function ClientLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}