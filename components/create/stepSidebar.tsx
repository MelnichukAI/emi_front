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

export default function StepSidebar({ step, setStep, showStepLabels }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: diaryScreenTopPadding(insets.top) }]}
    >
      {steps.map((item, index) => {
        const currentStep = index + 1;
        const isActive = step === currentStep;
        const Icon = item.Icon;

        return (
          <Pressable
            key={item.label}
            onPress={() => setStep(currentStep)}
            style={[
              styles.item,
              isActive && styles.activeItem,
              !showStepLabels && styles.itemIconOnly,
            ]}
          >
            <Icon
              width={22}
              height={22}
              color={isActive ? "#FFFFFF" : colors.subtext}
            />

            {showStepLabels ? (
              <Text
                style={[styles.text, isActive && styles.activeText]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 82,
    paddingHorizontal: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(75, 69, 150, 0.12)",
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    marginBottom: 10,
  },

  itemIconOnly: {
    paddingVertical: 12,
    marginBottom: 8,
  },

  activeItem: {
    backgroundColor: colors.primary,
  },

  text: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.subtext,
    marginTop: 6,
    textAlign: "center",
  },

  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
