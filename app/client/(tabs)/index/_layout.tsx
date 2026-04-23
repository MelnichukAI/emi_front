import { Stack } from "expo-router";

import { DiaryDraftProvider } from "@/lib/diary-draft-context";

export default function HomeStackLayout() {
  return (
    <DiaryDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DiaryDraftProvider>
  );
}
