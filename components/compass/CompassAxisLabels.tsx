import { colors } from "@/constants/colors";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CompassAxisLabels() {
  return (
    <>
      <View style={styles.horizontal}>
        <Text style={styles.label}>
          Негативные
        </Text>

        <Text style={styles.label}>
          Позитивные
        </Text>
      </View>

      <View style={styles.vertical}>
        <Text
          style={[
            styles.label,
            styles.verticalLabel,
          ]}
        >
          Высокая энергия
        </Text>

        <Text
          style={[
            styles.label,
            styles.verticalLabel,
          ]}
        >
          Низкая энергия
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",

    marginTop: 12,

    flexDirection: "row",

    justifyContent:
      "space-between",
  },

  vertical: {
    position: "absolute",

    left: -30,

    top: 0,
    bottom: 0,

    justifyContent:
      "space-between",

    paddingVertical: 20,
  },

  label: {
    fontSize: 13,

    fontWeight: "600",

    color: colors.subtext,
  },

  verticalLabel: {
    transform: [
      {
        rotate: "-90deg",
      },
    ],

    width: 120,

    textAlign: "center",
  },
});