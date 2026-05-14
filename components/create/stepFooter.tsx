import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

type Props = {
  step: number;
  onBack: () => void;
  onNext: () => void;
  /** Подсказка по кнопке «i» (управляется с экрана создания записи). */
  hintOpen: boolean;
  onToggleHint: () => void;
  /** Подпись правой кнопки (например на последнем шаге формы) */
  nextLabel?: string;
};

export default function StepFooter({
  step,
  onBack,
  onNext,
  hintOpen,
  onToggleHint,
  nextLabel,
}: Props) {
  const insets = useSafeAreaInsets();

  const hints: Record<number, string> = {
    1: "Введите в поле произошедшую ситуацию. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    2: "Введите в поле ваши мысли по поводу произошедшей ситуации. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    3: "Введите в поле испытываемые ощущения в теле. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    4: "Введите в поле эмоцию, которую как вам кажется вы испытываете. Рядом с полем можете указать насколько процентов вам кажется вы испытываете эту эмоцию. Если вы испытываете несколько эмоций нажмите кнопку +Добавить. Если самостоятельно тяжело сформулировать, воспользуйтесь кнопкой над текстовым полем :3",
    5: "пасхалка для любознательных, вам полагается вкусняшка от разработчика",
    6: "Добавьте теги которые по вашему мнению подходят к записи",
  };

  const footerBottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={styles.outer}>
      <View style={styles.infoStrip}>
        <View style={styles.top}>
          {hintOpen && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{hints[step]}</Text>
            </View>
          )}

          <View style={styles.infoOuter}>
            <Pressable
              style={styles.info}
              onPress={onToggleHint}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.whiteActions, { paddingBottom: footerBottomPad }]}>
        <View style={styles.bottom}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backPressed,
            ]}
          >
            <Text style={styles.backBtnText}>Назад</Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextBtn,
              pressed && styles.nextPressed,
            ]}
          >
            <Text style={styles.nextBtnText}>
              {nextLabel ?? "Следующий шаг"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: 16,
    marginHorizontal: -20,
  },

  /** Лавандовая зона над белым футером — кнопка «i» визуально не в белой панели */
  infoStrip: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },

  top: {
    alignItems: "flex-end",
    minHeight: 36,
    position: "relative",
  },

  infoOuter: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 22,
    alignSelf: "flex-end",
  },

  whiteActions: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(75, 69, 150, 0.1)",
  },

  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backBtn: {
    flex: 1,
    backgroundColor: "#E4E9F7",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  backBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  nextBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  nextPressed: {
    opacity: 0.88,
  },

  backPressed: {
    opacity: 0.88,
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

  hintBox: {
    position: "absolute",
    bottom: 44,
    right: 0,
    left: 0,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    maxWidth: "100%",
    zIndex: 2,
  },

  hintText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
