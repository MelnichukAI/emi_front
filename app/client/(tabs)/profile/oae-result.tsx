import { colors } from "@/constants/colors";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import {
  getOaeScore,
  setOaeScore,
  type OaeScoreSummary,
} from "@/lib/oae-score-session";
import { fetchLatestTasScore } from "@/lib/tas-latest-attempt";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function BreakdownRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownTitle}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
  );
}

export default function OaeResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fetchedScore, setFetchedScore] = useState<OaeScoreSummary | null>(null);
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
  const hasParamScore =
    Number.isFinite(identifyFromParam) &&
    Number.isFinite(describeFromParam) &&
    Number.isFinite(externalFromParam) &&
    Number.isFinite(totalFromParam);

  useEffect(() => {
    if (hasParamScore) return;
    if (getOaeScore()) return;
    let cancelled = false;
    void (async () => {
      const token = getAccessToken();
      if (!token) return;
      const fromApi = await fetchLatestTasScore(token);
      if (cancelled || !fromApi) return;
      setOaeScore(fromApi);
      setFetchedScore(fromApi);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasParamScore]);

  const score = hasParamScore
    ? {
        identifyFeelings: identifyFromParam,
        describeFeelings: describeFromParam,
        externalThinking: externalFromParam,
        total: totalFromParam,
      }
    : fetchedScore ?? getOaeScore();

  const hasValidScore = Boolean(score);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom, 24) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}>
        <Text style={styles.title}>Результат теста</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationTitle}>Пояснение по баллам</Text>
          <Text style={styles.interpretationLine}>20-51 — Нормальный результат</Text>
          <Text style={styles.interpretationLine}>52-60 — Повышенный результат</Text>
          <Text style={styles.interpretationLine}>61-100 — Высокий результат</Text>
        </View>

        <View style={styles.breakdownCard}>
          <BreakdownRow
            label="Трудности с определением чувств"
            value={hasValidScore ? score!.identifyFeelings : "—"}
          />
          <BreakdownRow
            label="Трудности с описанием чувств"
            value={hasValidScore ? score!.describeFeelings : "—"}
          />
          <BreakdownRow
            label="Внешне ориентированное мышление"
            value={hasValidScore ? score!.externalThinking : "—"}
          />
        </View>

        <Text style={styles.scoreLabel}>Общая сумма баллов</Text>
        <Text style={styles.scoreValue}>{hasValidScore ? score!.total : "—"}</Text>

        <Pressable
          style={({ pressed }) => [styles.testBtn, pressed && styles.pressed]}
          onPress={() => router.push("/client/profile/oae")}
        >
          <Text style={styles.testBtnText}>Пройти тест</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.replace("/client/profile")}
        >
          <Text style={styles.backBtnText}>К профилю</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  interpretationLine: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginTop: 2,
  },
  breakdownCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  breakdownTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.textThird,
    lineHeight: 20,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    flexShrink: 0,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textThird,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: "700",
    color: colors.primary,
  },
  testBtn: {
    marginTop: 24,
    alignSelf: "stretch",
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
  backBtn: {
    marginTop: 64,
    alignSelf: "stretch",
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
