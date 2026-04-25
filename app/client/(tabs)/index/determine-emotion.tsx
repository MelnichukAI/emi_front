import { colors } from "@/constants/colors";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DetermineEmotionScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<HomeTabStackParamList>>();
  const insets = useSafeAreaInsets();
  const topPad = diaryScreenTopPadding(insets.top);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Назад</Text>
        </Pressable>
        <Text style={styles.title}>Определить эмоцию</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => navigation.navigate("emotion-compass")}
            accessibilityRole="button"
            accessibilityLabel="Компас"
          >
            <Ionicons name="compass-outline" size={40} color={colors.primary} />
            <Text style={styles.tileLabel}>Компас</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => navigation.navigate("emotion-dictionary")}
            accessibilityRole="button"
            accessibilityLabel="Словарь"
          >
            <Ionicons name="book-outline" size={40} color={colors.primary} />
            <Text style={styles.tileLabel}>Словарь</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.emiTile, pressed && styles.pressed]}
          onPress={() => router.navigate("/client/chat")}
          accessibilityRole="button"
          accessibilityLabel="Обсудить с Эми"
        >
          <Ionicons
            name="chatbubbles-outline"
            size={44}
            color={colors.primary}
          />
          <Text style={styles.emiTitle}>Обсудить с Эми</Text>
          <Text style={styles.emiHint}>
            Перейти в чат с Эми во вкладке «Чат»
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    minWidth: 56,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  topSpacer: {
    minWidth: 56,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  topRow: {
    flexDirection: "row",
    gap: 14,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 200,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(47, 74, 125, 0.15)",
  },
  tileLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  emiTile: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(47, 74, 125, 0.15)",
  },
  emiTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emiHint: {
    marginTop: 8,
    fontSize: 14,
    color: colors.subtext,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
