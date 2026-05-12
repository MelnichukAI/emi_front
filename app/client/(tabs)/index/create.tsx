import StepContent from "@/components/create/StepContent";
import StepFooter from "@/components/create/stepFooter";
import StepSidebar from "@/components/create/stepSidebar";
import { colors } from "@/constants/colors";
import { isKnownEmotionName } from "@/data/emotions";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDiaryDraft } from "@/lib/diary-draft-context";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NavigationProp<HomeTabStackParamList>>();
  const {
    form,
    setForm,
    items,
    setItems,
    selectedTags,
    setSelectedTags,
    step,
    setStep,
  } = useDiaryDraft();

  const validateEmotionStepBeforeLeave = () => {
    if (step !== 4) return true;

    const hasIncomplete = items.some(
      (item) => item.text.trim().length === 0 || item.percent.trim().length === 0,
    );
    if (hasIncomplete) {
      alert("Сначала заполните текущие поля эмоции и процента.");
      return false;
    }

    const hasUnknownEmotion = items.some((item) => !isKnownEmotionName(item.text));
    if (hasUnknownEmotion) {
      alert("Выберите эмоции только из выпадающего списка.");
      return false;
    }

    const seen = new Set<string>();
    for (const item of items) {
      const normalized = item.text.trim().toLocaleLowerCase("ru");
      if (seen.has(normalized)) {
        alert("Нельзя выбрать одну и ту же эмоцию дважды.");
        return false;
      }
      seen.add(normalized);
    }

    return true;
  };

  const trySetStep = (targetStep: number) => {
    if (targetStep === step) return;
    if (!validateEmotionStepBeforeLeave()) return;
    setStep(targetStep);
  };

  return (
    <View style={styles.container}>
      <StepSidebar step={step} setStep={trySetStep} />

      <View
        style={[
          styles.content,
          { paddingTop: diaryScreenTopPadding(insets.top) },
        ]}
      >
        <Text style={styles.title}>Шаг {step}</Text>

        <View style={styles.stepBody}>
          <StepContent
            step={step}
            form={form}
            setForm={setForm}
            items={items}
            setItems={setItems}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </View>

        <StepFooter
          step={step}
          nextLabel="Далее"
          onBack={() => {
            if (step === 1) {
              router.back();
            } else {
              trySetStep(step - 1);
            }
          }}
          onNext={() => {
            if (step === 6) {
              // Имя экрана из confirm.tsx; router.push("./confirm") даёт unmatched в этом стеке.
              navigation.navigate("confirm");
            } else {
              trySetStep(step + 1);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  stepBody: {
    flex: 1,
    minHeight: 0,
    marginTop: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.subtext,
    letterSpacing: 0.2,
  },
});
