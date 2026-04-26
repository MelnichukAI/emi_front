import { colors } from "@/constants/colors";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { setOaeScore } from "@/lib/oae-score-session";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QUESTIONS = [
  "Мне часто бывает трудно разобраться, какое чувство я испытываю.",
  "Мне трудно подбирать верные слова для своих чувств.",
  "У меня бывают такие ощущения в теле, в которых не могут разобраться даже врачи.",
  "Я легко могу описать свои чувства.",
  "Я предпочитаю анализировать проблемы, а не просто о них рассказывать.",
  "Когда я расстроен, я не знаю - то ли мне грустно, то ли я испуган, то ли злюсь.",
  "Ощущения в моем теле часто вызывают у меня недоумение.",
  "Скорее, я предпочту, чтобы все шло своим чередом, чем буду разбираться, почему вышло именно так.",
  "У меня бывают чувства, которые я не могу точно назвать.",
  "Очень важно отдавать себе отчет в своих эмоциях.",
  "Мне трудно описывать, какие чувства я испытываю к другим людям.",
  "Люди советуют мне больше говорить о своих чувствах.",
  "Я не знаю, что творится внутри меня.",
  "Часто я не знаю, почему злюсь.",
  "Я предпочитаю разговаривать с людьми об их повседневных делах, а не об их чувствах.",
  "Я предпочитаю смотреть легкие, развлекательные программы, а не психологические драмы.",
  "Мне трудно раскрывать свои самые сокровенные чувства, даже близким друзьям.",
  "Я могу чувствовать близость к другому человеку, даже когда мы молчим.",
  "При решении личных проблем я считаю полезным разобраться в своих чувствах.",
  "Поиск скрытого смысла в фильмах или пьесах мешает получать удовольствие от них.",
] as const;

const SCALE_HINTS = [
  "Совершенно не согласен",
  "Скорее не согласен",
  "Ни то, ни другое",
  "Скорее согласен",
  "Совершенно согласен",
] as const;

const REVERSED_SCORE_QUESTION_NUMBERS = new Set([4, 5, 10, 18, 19]);
const IDENTIFY_FEELINGS_QUESTIONS = new Set([1, 3, 6, 7, 9, 13, 14]);
const DESCRIBE_FEELINGS_QUESTIONS = new Set([2, 4, 11, 12, 17]);
const EXTERNAL_THINKING_QUESTIONS = new Set([5, 8, 10, 15, 16, 18, 19, 20]);

type AnswerMap = Record<number, 1 | 2 | 3 | 4 | 5 | undefined>;

export default function OaeQuestionnaireScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState<AnswerMap>({});

  const setAnswer = (questionIndex: number, value: 1 | 2 | 3 | 4 | 5) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSave = () => {
    const answeredCount = Object.values(answers).filter(Boolean).length;
    if (answeredCount < QUESTIONS.length) {
      alert("Пожалуйста, ответьте на все вопросы теста.");
      return;
    }

    let identifyFeelings = 0;
    let describeFeelings = 0;
    let externalThinking = 0;

    QUESTIONS.forEach((_question, index) => {
      const questionNumber = index + 1;
      const selected = answers[index];
      if (!selected) return;

      const mappedScore = REVERSED_SCORE_QUESTION_NUMBERS.has(questionNumber)
        ? (6 - selected)
        : selected;

      if (IDENTIFY_FEELINGS_QUESTIONS.has(questionNumber)) {
        identifyFeelings += mappedScore;
      }
      if (DESCRIBE_FEELINGS_QUESTIONS.has(questionNumber)) {
        describeFeelings += mappedScore;
      }
      if (EXTERNAL_THINKING_QUESTIONS.has(questionNumber)) {
        externalThinking += mappedScore;
      }
    });

    const total = identifyFeelings + describeFeelings + externalThinking;

    setOaeScore({
      identifyFeelings,
      describeFeelings,
      externalThinking,
      total,
    });
    router.push(
      `/client/profile/oae-result?identify=${identifyFeelings}&describe=${describeFeelings}&external=${externalThinking}&total=${total}`,
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}>
        <Text style={styles.title}>Тест на алекситимию</Text>
        <View style={styles.legendCard}>
          <Text style={styles.legendLine}>1 — Совершенно не согласен</Text>
          <Text style={styles.legendLine}>2 — Скорее не согласен</Text>
          <Text style={styles.legendLine}>3 — Ни то, ни другое</Text>
          <Text style={styles.legendLine}>4 — Скорее согласен</Text>
          <Text style={styles.legendLine}>5 — Совершенно согласен</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {QUESTIONS.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionText}>
              {index + 1}. {question}
            </Text>

            <View style={styles.radioRow}>
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = answers[index] === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setAnswer(index, value as 1 | 2 | 3 | 4 | 5)}
                    style={styles.radioPressable}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${SCALE_HINTS[value - 1]}`}
                  >
                    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.radioNumber}>{value}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={() => router.replace("/client/profile")}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnText}>Вернуться</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
        >
          <Text style={styles.saveBtnText}>Сохранить</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  legendCard: {
    paddingTop: 8,
  },
  legendLine: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
    marginTop: 2,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
  },
  questionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  radioRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioPressable: {
    alignItems: "center",
    width: 52,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
  radioNumber: {
    marginTop: 6,
    fontSize: 12,
    color: colors.subtext,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.subtext,
    backgroundColor: colors.background,
  },
  backBtn: {
    flex: 1,
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
  saveBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
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
