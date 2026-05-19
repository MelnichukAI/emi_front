import { colors } from "@/constants/colors";
import type { Emotion } from "@/data/emotions";
import {
  getEmotionCompassDescription,
} from "./utils/labels";

import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type Props = {
  emotion: Emotion;
};

export default function SuggestedEmotionCard({
  emotion,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.title}>
        {emotion.name}
      </Text>

      <Text style={styles.subtitle}>
        {getEmotionCompassDescription(
          emotion.energy,
          emotion.valence,
        )}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: colors.subtext,
  },

  pressed: {
    opacity: 0.9,
  },
});