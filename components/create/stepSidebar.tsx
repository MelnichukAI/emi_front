import { Pressable, StyleSheet, Text, View } from "react-native";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

import BehaviorIcon from "@/assets/icons/action.svg";
import BodyIcon from "@/assets/icons/body.svg";
import EmotionIcon from "@/assets/icons/emotions.svg";
import SituationIcon from "@/assets/icons/situation.svg";
import TagsIcon from "@/assets/icons/tag.svg";
import ThoughtIcon from "@/assets/icons/thought.svg";

type Props = {
  step: number;
  setStep: (step: number) => void;
  /** Подписи под иконками — только когда открыта подсказка «i». */
  showStepLabels: boolean;
};

const steps = [
  { label: "Ситуация", Icon: SituationIcon },
  { label: "Мысли", Icon: ThoughtIcon },
  { label: "Тело", Icon: BodyIcon },
  { label: "Эмоции", Icon: EmotionIcon },
  { label: "Поведение", Icon: BehaviorIcon },
  { label: "Теги", Icon: TagsIcon },
];

/** Высота зоны подписи (фикс.) — иконки не смещаются при переключении «i». */
const STEP_LABEL_SLOT_HEIGHT = 40;

export default function StepSidebar({ step, setStep, showStepLabels }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: diaryScreenTopPadding(insets.top) }]}
    >
      <View style={styles.stepsColumn}>
        <View style={styles.stepsInner}>
          {steps.map((item, index) => {
            const currentStep = index + 1;
            const isActive = step === currentStep;
            const Icon = item.Icon;

            return (
              <Pressable
                key={item.label}
                onPress={() => setStep(currentStep)}
                style={styles.item}
              >
                <View
                  style={[
                    styles.track,
                    isActive && showStepLabels && styles.activeItem,
                  ]}
                >
                  <View
                    style={[
                      styles.iconLane,
                      isActive && !showStepLabels && styles.activeItem,
                      isActive && !showStepLabels && styles.iconLanePill,
                    ]}
                  >
                    <Icon
                      width={22}
                      height={22}
                      color={isActive ? "#FFFFFF" : colors.subtext}
                    />
                  </View>
                  <View
                    style={[
                      styles.labelArea,
                      { height: STEP_LABEL_SLOT_HEIGHT },
                    ]}
                  >
                    {showStepLabels ? (
                      <Text
                        style={[styles.text, isActive && styles.activeText]}
                        numberOfLines={2}
                      >
                        {item.label}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 82,
    alignSelf: "stretch",
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.primary,
  },

  stepsColumn: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    paddingVertical: 8,
  },

  /** Компактная колонка: одинаковый зазор только между шагами, блок по центру сайдбара. */
  stepsInner: {
    alignSelf: "stretch",
    gap: 10,
  },

  item: {
    alignSelf: "stretch",
  },

  /** Одна ширина для всех шагов; подсветка с подписями — вся дорожка, без подписей — только полоса иконки. */
  /** Без overflow — иначе при подсветке только иконки фон режется по границе со слотом подписи. */
  track: {
    alignSelf: "stretch",
    borderRadius: 14,
  },

  iconLane: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  /** Замкнутая «таблетка» вокруг иконки, когда фон не на всём track. */
  iconLanePill: {
    borderRadius: 14,
  },

  /** Текст прижат к иконке сверху слота, без «плавания» по центру пустоты. */
  labelArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },

  activeItem: {
    backgroundColor: colors.primary,
  },

  text: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    color: colors.subtext,
    textAlign: "center",
  },

  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
