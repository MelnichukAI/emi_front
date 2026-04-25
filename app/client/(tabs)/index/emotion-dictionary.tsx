import { colors } from "@/constants/colors";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EmotionDictionaryPlaceholderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.root, { paddingTop: diaryScreenTopPadding(insets.top) }]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backWrap}>
        <Text style={styles.back}>Назад</Text>
      </Pressable>
      <Text style={styles.title}>Словарь</Text>
      <Text style={styles.lead}>
        Здесь позже появится словарь эмоций. Пока заглушка.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  backWrap: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  lead: {
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
  },
});
