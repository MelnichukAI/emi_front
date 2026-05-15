import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "@/components/common/primaryButton";
import SecondaryButton from "@/components/common/secondaryButton";
import { CREATE_FOOTER_HORIZONTAL_PADDING, CREATE_INFO_RIGHT_INSET } from "@/constants/create-screen-layout";
import { colors } from "../../constants/colors";

type Props = {
  onBack: () => void;
  onNext: () => void;
  /** Подпись правой кнопки (например на последнем шаге формы) */
  nextLabel?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export default function StepFooter({
  onBack,
  onNext,
  nextLabel,
  onLayout,
}: Props) {
  const insets = useSafeAreaInsets();
  const footerBottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={styles.outer} onLayout={onLayout}>
      <View style={[styles.whiteActions, { paddingBottom: footerBottomPad }]}>
        <View style={styles.bottom}>
          <View style={styles.buttonSlot}>
            <SecondaryButton
              title="Назад"
              onPress={onBack}
              flushHorizontal
              flushTop
            />
          </View>
          <View style={styles.buttonSlot}>
            <PrimaryButton
              title={nextLabel ?? "Далее"}
              onPress={onNext}
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
  outer: {
    marginTop: 0,
    marginHorizontal: -CREATE_INFO_RIGHT_INSET,
  },

  whiteActions: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: CREATE_FOOTER_HORIZONTAL_PADDING,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },

  bottom: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },

  buttonSlot: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
});
