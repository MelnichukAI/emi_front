import { colors } from "@/constants/colors";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { getOaeScore } from "@/lib/oae-score-session";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OaeResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    identify?: string;
    describe?: string;
    external?: string;
    total?: string;
  }>();
  const identifyParam = Array.isArray(params.identify)
    ? params.identify[0]
    : params.identify;
  const describeParam = Array.isArray(params.describe)
    ? params.describe[0]
    : params.describe;
  const externalParam = Array.isArray(params.external)
    ? params.external[0]
    : params.external;
  const totalParam = Array.isArray(params.total) ? params.total[0] : params.total;

  const identifyFromParam = Number(identifyParam);
  const describeFromParam = Number(describeParam);
  const externalFromParam = Number(externalParam);
  const totalFromParam = Number(totalParam);
  const scoreFromSession = getOaeScore();
  const hasParamScore =
    Number.isFinite(identifyFromParam) &&
    Number.isFinite(describeFromParam) &&
    Number.isFinite(externalFromParam) &&
    Number.isFinite(totalFromParam);

  const score = hasParamScore
    ? {
        identifyFeelings: identifyFromParam,
        describeFeelings: describeFromParam,
        externalThinking: externalFromParam,
        total: totalFromParam,
      }
    : scoreFromSession;

  const hasValidScore = Boolean(score);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}>
        <Text style={styles.title}>Результат теста</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationTitle}>Пояснение по баллам</Text>
          <Text style={styles.interpretationLine}>20-51 — Отсутствие алекситимии</Text>
          <Text style={styles.interpretationLine}>52-60 — Возможная алекситимия</Text>
          <Text style={styles.interpretationLine}>61-100 — Присутствие алекситимии</Text>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Трудности с определением чувств</Text>
          <Text style={styles.breakdownValue}>
            {hasValidScore ? score.identifyFeelings : "—"}
          </Text>

          <Text style={styles.breakdownTitle}>Трудности с описанием чувств</Text>
          <Text style={styles.breakdownValue}>
            {hasValidScore ? score.describeFeelings : "—"}
          </Text>

          <Text style={styles.breakdownTitle}>Внешне ориентированное мышление</Text>
          <Text style={styles.breakdownValue}>
            {hasValidScore ? score.externalThinking : "—"}
          </Text>
        </View>

        <Text style={styles.scoreLabel}>Общая сумма баллов</Text>
        <Text style={styles.scoreValue}>{hasValidScore ? score.total : "—"}</Text>
        <Pressable
          style={({ pressed }) => [styles.testBtn, pressed && styles.pressed]}
          onPress={() => router.push("/client/profile/oae")}
        >
          <Text style={styles.testBtnText}>Пройти тест</Text>
        </Pressable>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.replace("/client/profile")}
        >
          <Text style={styles.backBtnText}>К профилю</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  interpretationCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },
  interpretationLine: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 2,
  },
  breakdownCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 8,
  },
  breakdownValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: "700",
    color: colors.primary,
  },
  testBtn: {
    marginTop: 24,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  testBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.subtext,
    backgroundColor: colors.background,
  },
  backBtn: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
