import StepContent from "@/components/create/StepContent";
import StepFooter from "@/components/create/stepFooter";
import StepSidebar from "@/components/create/stepSidebar";
import { colors } from "@/constants/colors";
import { CREATE_INFO_RIGHT_INSET } from "@/constants/create-screen-layout";
import { isKnownEmotionName } from "@/data/emotions";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDiaryDraft } from "@/lib/diary-draft-context";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";

const CREATE_STEP_HINTS: Record<number, string> = {
  1: "Введите ситуацию, которая с вами произошла. Рекомендуется к заполнению. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой в верхнем правом углу экрана, но учтите, что если у вас есть история в чате, рекомендуем перейти через нижнее меню, потому что после нажатия на кнопку история сотрётся",
  2: "Введите ваши мысли по поводу ситуации. Рекомендуется к заполнению. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой в верхнем правом углу экрана, но учтите, что если у вас есть история в чате, рекомендуем перейти через нижнее меню, потому что после нажатия на кнопку история сотрётся",
  3: "Введите испытываемые ощущения в теле. Не обязательно к заполнению. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой в верхнем правом углу экрана, но учтите, что если у вас есть история в чате, рекомендуем перейти через нижнее меню, потому что после нажатия на кнопку история сотрётся",
  4: "Введите эмоции, которые вы считаете, что испытываете. Рядом с эмоциями можно указать степень уверенности в эмоции в процентах. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой в верхнем правом углу экрана, но учтите, что если у вас есть история в чате, рекомендуем перейти через нижнее меню, потому что после нажатия на кнопку история сотрётся",
  5: "Введите описание вашего поведения и как хотели бы поступить в будущем. Не обязательно к заполнению. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой в верхнем правом углу экрана, но учтите, что если у вас есть история в чате, рекомендуем перейти через нижнее меню, потому что после нажатия на кнопку история сотрётся",
  6: "Добавьте теги которые по вашему мнению подходят к записи (опционально) ",
};

/** Расстояние от верха белого футера до нижнего края блока с «i» (меньше — кнопка ближе к границе). */
const CREATE_INFO_BUTTON_BOTTOM_OFFSET = 5;

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

  /** Подсказка «i» и подписи шагов в сайдбаре показываются вместе. */
  const [createHintOpen, setCreateHintOpen] = useState(false);
  const [footerBlockHeight, setFooterBlockHeight] = useState(96);

  const validateEmotionStepBeforeLeave = () => {
    if (step !== 4) return true;

    const hasTextNoPercent = items.some(
      (item) => item.text.trim().length > 0 && item.percent.trim().length === 0,
    );
    if (hasTextNoPercent) {
      alert("Сначала заполните текущие поля эмоции и процента.");
      return false;
    }

    const hasUnknownEmotion = items.some(
      (item) =>
        item.text.trim().length > 0 && !isKnownEmotionName(item.text),
    );
    if (hasUnknownEmotion) {
      alert("Выберите эмоции только из выпадающего списка.");
      return false;
    }

    const seen = new Set<string>();
    for (const item of items) {
      const normalized = item.text.trim().toLocaleLowerCase("ru");
      if (normalized.length === 0) continue;
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
      <StepSidebar
        step={step}
        setStep={trySetStep}
        showStepLabels={createHintOpen}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: diaryScreenTopPadding(insets.top),
            paddingHorizontal: CREATE_INFO_RIGHT_INSET,
          },
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
          nextLabel="Далее"
          onLayout={(e: LayoutChangeEvent) => {
            setFooterBlockHeight(e.nativeEvent.layout.height);
          }}
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

        <View
          pointerEvents="box-none"
          style={styles.hintFloatingLayer}
        >
          <View
            pointerEvents="box-none"
            style={[
              styles.hintFloatingAnchor,
              {
                bottom:
                  footerBlockHeight + CREATE_INFO_BUTTON_BOTTOM_OFFSET,
              },
            ]}
          >
            {createHintOpen ? (
              <View style={styles.hintShell}>
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>
                    {CREATE_STEP_HINTS[step] ?? ""}
                  </Text>
                </View>
              </View>
            ) : null}
            <View style={styles.infoOuter}>
              <Pressable
                style={styles.info}
                onPress={() => setCreateHintOpen((v) => !v)}
              >
                <Text style={styles.infoText}>i</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    position: "relative",
    paddingBottom: 0,
    backgroundColor: colors.background,
  },

  hintFloatingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },

  hintFloatingAnchor: {
    position: "absolute",
    left: -CREATE_INFO_RIGHT_INSET,
    right: -CREATE_INFO_RIGHT_INSET,
    paddingHorizontal: CREATE_INFO_RIGHT_INSET,
    alignItems: "flex-end",
  },

  infoOuter: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 22,
    alignSelf: "flex-end",
  },

  info: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  infoText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },

  /** Растягивается на ширину колонки; paddingRight отодвигает карточку от правого края экрана. */
  hintShell: {
    alignSelf: "stretch",
    paddingRight: 18,
    marginBottom: 10,
  },

  hintBox: {
    alignSelf: "flex-end",
    maxWidth: "92%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  hintText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
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
