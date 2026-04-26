import { colors } from "@/constants/colors";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

function parseEmotions(raw: string | string[] | undefined): EmotionRow[] {
  const source = Array.isArray(raw) ? raw[0] : raw;
  if (!source) return [];

  try {
    const parsed: unknown = JSON.parse(source);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => item as RawEmotion)
      .map((item) => ({
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
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    diaryEntryId?: string;
    emotionsJson?: string;
  }>();

  const diaryEntryId = Array.isArray(params.diaryEntryId)
    ? params.diaryEntryId[0]
    : params.diaryEntryId;

  const [emotionRows, setEmotionRows] = useState<EmotionRow[]>(() =>
    parseEmotions(params.emotionsJson),
  );
  const [editingEmotions, setEditingEmotions] = useState(false);

  const [stateChange, setStateChange] =
    useState<ReflectionCreateRequest["stateChange"] | null>(null);

  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [otherPlanChecked, setOtherPlanChecked] = useState(false);
  const [otherPlanText, setOtherPlanText] = useState("");

  const [submitting, setSubmitting] = useState(false);

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

  const updateEmotion = (index: number, key: keyof EmotionRow, value: string) => {
    setEmotionRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addEmotion = () => {
    const hasIncomplete = emotionRows.some(
      (row) => row.name.trim().length === 0 || row.percent.trim().length === 0,
    );
    if (hasIncomplete) {
      alert("Сначала заполните текущее поле эмоции и процента.");
      return;
    }
    setEmotionRows((prev) => [...prev, { name: "", percent: "" }]);
  };

  const removeEmotion = (index: number) => {
    setEmotionRows((prev) => prev.filter((_, i) => i !== index));
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
      router.replace("/client");
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
    router.replace("/client");
  };

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Назад</Text>
        </Pressable>
        <Text style={styles.title}>Обратная связь</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionTopRow}>
            <Text style={styles.sectionTitle}>1. Что вы чувствуете после записи?</Text>
            <Pressable
              onPress={() => setEditingEmotions((v) => !v)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            >
              <Text style={styles.actionBtnText}>
                {editingEmotions ? "Подтвердить" : "Изменить"}
              </Text>
            </Pressable>
          </View>

          {emotionRows.length === 0 ? (
            <Text style={styles.emptyText}>Эмоции не указаны.</Text>
          ) : null}

          {emotionRows.map((row, index) => (
            <View key={`${row.name}-${index}`} style={styles.emotionRow}>
              <TextInput
                style={[styles.emotionNameInput, !editingEmotions && styles.inputDisabled]}
                value={row.name}
                editable={editingEmotions}
                placeholder="Эмоция"
                onChangeText={(v) => updateEmotion(index, "name", v)}
              />
              <TextInput
                style={[styles.percentInput, !editingEmotions && styles.inputDisabled]}
                value={row.percent}
                editable={editingEmotions}
                keyboardType="numeric"
                placeholder="%"
                onChangeText={(v) => updateEmotion(index, "percent", v)}
              />
              {editingEmotions && emotionRows.length > 1 ? (
                <Pressable
                  onPress={() => removeEmotion(index)}
                  style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          ))}

          {editingEmotions ? (
            <Pressable
              onPress={addEmotion}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <Text style={styles.addBtnText}>+ Добавить эмоцию</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Стало ли вам легче после записи?</Text>
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
          <Text style={styles.sectionTitle}>3. Что вы планируете делать дальше?</Text>
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
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <Pressable
            onPress={() => {
              if (!submitting) void handleSkip();
            }}
            style={({ pressed }) => [
              styles.skipBtn,
              (pressed || submitting) && styles.pressed,
            ]}
          >
            <Text style={styles.skipBtnText}>Пропустить</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (!submitting) void handleSave();
            }}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || submitting) && styles.pressed,
            ]}
          >
            <Text style={styles.saveBtnText}>
              {submitting ? "Сохранение..." : "Сохранить"}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  back: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    minWidth: 56,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    minWidth: 56,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  sectionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 21,
  },
  actionBtn: {
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 6,
  },
  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  emotionNameInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
  },
  percentInput: {
    width: 76,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: colors.text,
    textAlign: "center",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E35D5D",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 18,
  },
  addBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  optionGroup: {
    marginTop: 8,
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
    paddingTop: 4,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.subtext,
    backgroundColor: colors.background,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  skipBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  skipBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
