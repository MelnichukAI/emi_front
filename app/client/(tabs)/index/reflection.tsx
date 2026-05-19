import { colors } from "@/constants/colors";
import PrimaryButton from "@/components/common/primaryButton";
import SecondaryButton from "@/components/common/secondaryButton";
import { isKnownEmotionName } from "@/data/emotions";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";
import type { NavigationProp } from "@react-navigation/native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EmotionRow = {
  id: string;
  name: string;
  percent: string;
};

type ReflectionCreateRequest = {
  diaryEntryId: string;
  emotions: Array<{ name: string; percent: number }>;
  stateChange: "BETTER" | "SLIGHTLY_BETTER" | "NO_CHANGE" | "WORSE";
  plans: string;
};

type RawEmotion = {
  name?: string;
  percent?: number;
};

const STATE_OPTIONS: Array<{
  id: ReflectionCreateRequest["stateChange"];
  label: string;
}> = [
  { id: "BETTER", label: "Легче" },
  { id: "SLIGHTLY_BETTER", label: "Немного легче" },
  { id: "NO_CHANGE", label: "Без изменений" },
  { id: "WORSE", label: "Хуже" },
];

const PLAN_OPTIONS = ["Начать задачу", "Попросить о помощи", "Отложить"] as const;

let emotionRowId = 0;
const createEmotionRow = (name = "", percent = ""): EmotionRow => {
  emotionRowId += 1;
  return { id: `emotion-row-${emotionRowId}`, name, percent };
};

function parseEmotions(raw: string | string[] | undefined): EmotionRow[] {
  const source = Array.isArray(raw) ? raw[0] : raw;
  if (!source) return [];

  try {
    const parsed: unknown = JSON.parse(source);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => item as RawEmotion)
      .map((item) => ({
        id: createEmotionRow().id,
        name: typeof item.name === "string" ? item.name.trim() : "",
        percent:
          typeof item.percent === "number" && Number.isFinite(item.percent)
            ? String(item.percent)
            : "",
      }))
      .filter((item) => item.name.length > 0);
  } catch {
    return [];
  }
}

export default function ReflectionScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<HomeTabStackParamList>>();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    diaryEntryId?: string;
    emotionsJson?: string;
  }>();

  const diaryEntryId = Array.isArray(params.diaryEntryId)
    ? params.diaryEntryId[0]
    : params.diaryEntryId;

  const emotionRows = useMemo(
    () => parseEmotions(params.emotionsJson),
    [params.emotionsJson],
  );

  const [stateChange, setStateChange] =
    useState<ReflectionCreateRequest["stateChange"] | null>(null);

  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [otherPlanChecked, setOtherPlanChecked] = useState(false);
  const [otherPlanText, setOtherPlanText] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /** Сброс стека «Главная» вместо `replace("/client")`, чтобы не рвать корневой клиентский Stack на Android (APK). */
  const goToClientHome = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "index" }],
      }),
    );
  }, [navigation]);

  const normalizedEmotionRows = useMemo(
    () =>
      emotionRows.map((row) => ({
        name: row.name.trim(),
        percent: Number(row.percent),
      })),
    [emotionRows],
  );

  const reflectionEmotions = normalizedEmotionRows.filter(
    (row) => row.name.length > 0 && Number.isFinite(row.percent),
  );

  const togglePlan = (value: string) => {
    setSelectedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

    if (!diaryEntryId) {
      alert("Не удалось определить запись для сохранения обратной связи.");
      return;
    }

    if (!stateChange) {
      alert("Выберите, стало ли вам легче после записи.");
      return;
    }

    const unknownEmotion = emotionRows.find(
      (row) => row.name.trim().length > 0 && !isKnownEmotionName(row.name),
    );
    if (unknownEmotion) {
      alert("Выберите эмоцию из выпадающего списка.");
      return;
    }
    const seen = new Set<string>();
    for (const row of emotionRows) {
      const normalized = row.name.trim().toLocaleLowerCase("ru");
      if (normalized.length === 0) continue;
      if (seen.has(normalized)) {
        alert("Нельзя выбрать одну и ту же эмоцию дважды.");
        return;
      }
      seen.add(normalized);
    }

    const otherTrimmed = otherPlanText.trim();
    const safeOther = otherPlanChecked ? otherTrimmed : "";
    if (!otherPlanChecked && otherTrimmed.length > 0) {
      setOtherPlanText("");
    }

    const plans = [
      ...Array.from(selectedPlans),
      ...(safeOther.length > 0 ? [safeOther] : []),
    ].join(", ");

    try {
      setSubmitting(true);
      await apiRequest("/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diaryEntryId,
          emotions: reflectionEmotions,
          stateChange,
          plans,
        } satisfies ReflectionCreateRequest),
      });

      alert("Обратная связь сохранена");
      goToClientHome();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить обратную связь",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

    if (!diaryEntryId) {
      alert("Не удалось определить запись для сохранения обратной связи.");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest("/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diaryEntryId,
          emotions: [{ name: "SKIPPED", percent: 100 }],
          // Пробуем сначала как просили (если бэк поддерживает SKIPPED).
          stateChange: "SKIPPED",
          plans: "SKIPPED",
        }),
      });
    } catch {
      // Fallback для текущего enum stateChange на бэке.
      try {
        await apiRequest("/reflections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            diaryEntryId,
            emotions: [{ name: "SKIPPED", percent: 100 }],
            stateChange: "NO_CHANGE",
            plans: "SKIPPED",
          } satisfies ReflectionCreateRequest),
        });
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Не удалось пропустить обратную связь",
        );
        return;
      }
    } finally {
      setSubmitting(false);
    }
    goToClientHome();
  };

  const footerBottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Text style={styles.title}>Обратная связь</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Стало ли вам легче после записи?</Text>
          <View style={styles.optionGroup}>
            {STATE_OPTIONS.map((option) => {
              const active = stateChange === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setStateChange(option.id)}
                  style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                >
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Что вы планируете делать дальше?</Text>
          <View style={styles.optionGroup}>
            {PLAN_OPTIONS.map((plan) => {
              const active = selectedPlans.has(plan);
              return (
                <Pressable
                  key={plan}
                  onPress={() => togglePlan(plan)}
                  style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                >
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active ? <Text style={styles.checkboxTick}>✓</Text> : null}
                  </View>
                  <Text style={styles.optionText}>{plan}</Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setOtherPlanChecked((v) => !v)}
              style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, otherPlanChecked && styles.checkboxActive]}>
                {otherPlanChecked ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
              <Text style={styles.optionText}>Другое</Text>
            </Pressable>

            <TextInput
              style={[styles.otherInput, !otherPlanChecked && styles.inputDisabled]}
              editable={otherPlanChecked}
              value={otherPlanText}
              onChangeText={setOtherPlanText}
              placeholder="Укажите свой вариант"
              placeholderTextColor={colors.textThird}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: footerBottomPad }]}
        pointerEvents={submitting ? "none" : "auto"}
      >
        <View style={styles.footerRow}>
          <View style={styles.footerButtonSlot}>
            <SecondaryButton
              title="Пропустить"
              onPress={() => void handleSkip()}
              flushHorizontal
              flushTop
            />
          </View>
          <View style={styles.footerButtonSlot}>
            <PrimaryButton
              title={submitting ? "Сохранение..." : "Сохранить"}
              onPress={() => void handleSave()}
              disabled={submitting}
              flushHorizontal
              flushTop
              titleFontWeight="500"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  /** Как «Проверьте запись» на экране `confirm`. */
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 21,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  optionGroup: {
    marginTop: 10,
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.subtext,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.subtext,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxTick: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  otherInput: {
    marginTop: 4,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.subtext,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  footerButtonSlot: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
