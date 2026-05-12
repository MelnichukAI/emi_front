import Header from "@/components/common/header";
import { colors } from "@/constants/colors";
import { useDiaryDraft } from "@/lib/diary-draft-context";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const TILE_BORDER = "rgba(75, 69, 150, 0.15)";

export default function DetermineEmotionScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<HomeTabStackParamList>>();
  const { resetDraft, setStep } = useDiaryDraft();

  const goCreateManual = () => {
    resetDraft();
    setStep(4);
    navigation.navigate("create");
  };

  return (
    <View style={styles.root}>
      <Header
        title="Определить эмоцию"
        leadingPlacement="below"
        leading={
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Назад"
            style={({ pressed }) => [
              styles.backChip,
              pressed && styles.backChipPressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.surface}
            />
            <Text style={styles.backChipLabel}>Назад</Text>
          </Pressable>
        }
      />

      <View style={styles.body}>
        <View style={styles.gridRow}>
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

        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => router.navigate("/client/chat")}
            accessibilityRole="button"
            accessibilityLabel="Обсудить с Эми. Перейти в чат во вкладке «Чат»"
          >
            <Ionicons
              name="chatbubbles-outline"
              size={40}
              color={colors.primary}
            />
            <Text style={styles.tileLabel}>Обсудить с Эми</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={goCreateManual}
            accessibilityRole="button"
            accessibilityLabel="Ввести эмоцию самостоятельно"
          >
            <Ionicons
              name="create-outline"
              size={40}
              color={colors.primary}
            />
            <Text style={[styles.tileLabel, styles.tileLabelTight]}>
              Ввести самостоятельно
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 24,
  },
  backChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 14,
    gap: 2,
  },
  backChipPressed: {
    opacity: 0.88,
  },
  backChipLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  gridRow: {
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
    borderColor: TILE_BORDER,
  },
  tileLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  tileLabelTight: {
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
});
