import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { textMedium } from "../../constants/typography";

type Props = {
  question: string;
  action: string;
  onPress: () => void;
};

/** Ссылка «вопрос + действие» на экранах входа/регистрации (стили как у SecondaryButton twoLine). */
export default function AuthFormNavLink({ question, action, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${question} ${action}`}
    >
      <View style={styles.column}>
        <Text style={styles.questionLine}>{question}</Text>
        <Text style={styles.actionLine}>{action}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  column: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  questionLine: {
    ...textMedium,
    fontSize: 14,
    color: colors.subtext,
    textAlign: "center",
  },
  actionLine: {
    ...textMedium,
    fontSize: 17,
    color: colors.primary,
    textAlign: "center",
  },
});
