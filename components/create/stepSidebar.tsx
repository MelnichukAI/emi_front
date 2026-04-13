import { Pressable, StyleSheet, Text, View } from "react-native";
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
};

const steps = [
  { label: "Ситуация", Icon: SituationIcon },
  { label: "Мысли", Icon: ThoughtIcon },
  { label: "Тело", Icon: BodyIcon },
  { label: "Эмоции", Icon: EmotionIcon },
  { label: "Поведение", Icon: BehaviorIcon },
  { label: "Теги", Icon: TagsIcon },
];

export default function StepSidebar({ step, setStep }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((item, index) => {
        const currentStep = index + 1;
        const isActive = step === currentStep;
        const Icon = item.Icon;

        return (
          <Pressable
            key={item.label}
            onPress={() => setStep(currentStep)}
            style={[styles.item, isActive && styles.activeItem]}
          >
            <Icon
              width={20}
              height={20}
              fill={isActive ? colors.primary : colors.subtext}
            />

            <Text style={[styles.text, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 75,
    paddingTop: 60,
    paddingLeft: 5,
    backgroundColor: colors.background,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 10,
    marginBottom: 12,
  },

  activeItem: {
    backgroundColor: colors.secondary,
  },

  text: {
    fontSize: 13,
    color: colors.subtext,
  },

  activeText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
