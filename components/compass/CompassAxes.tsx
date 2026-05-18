import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  size: number;
};

export default function CompassAxes({ size }: Props) {
  return (
    <>
      <View
        style={[
          styles.horizontalAxis,
          {
            width: size + 24,
            top: size / 2,
          },
        ]}
      />

      <View
        style={[
          styles.verticalAxis,
          {
            height: size + 24,
            left: size / 2,
          },
        ]}
      />

      <Text style={styles.leftLabel}>
        Негативные
      </Text>

      <Text style={styles.rightLabel}>
        Позитивные
      </Text>

      <Text style={styles.topLabel}>
        Высокая{"\n"}энергия
      </Text>

      <Text style={styles.bottomLabel}>
        Низкая{"\n"}энергия
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  horizontalAxis: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.text,
    left: -12,
    zIndex: 10,
  },

  verticalAxis: {
    position: "absolute",
    width: 2,
    backgroundColor: colors.text,
    top: -12,
    zIndex: 10,
  },

  leftLabel: {
    position: "absolute",
    left: -4,
    top: "50%",
    transform: [{ translateY: -10 }],
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  rightLabel: {
    position: "absolute",
    right: -10,
    top: "50%",
    transform: [{ translateY: -10 }],
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
  },

  topLabel: {
    position: "absolute",
    top: -42,
    left: "50%",
    transform: [{ translateX: -38 }],
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },

  bottomLabel: {
    position: "absolute",
    bottom: -46,
    left: "50%",
    transform: [{ translateX: -34 }],
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
});