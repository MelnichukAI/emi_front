import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

export default function ReferenceCompassScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Компас</Text>
      <Text style={styles.lead}>
        Здесь позже появится инструмент «компас эмоций». Пока заглушка.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  lead: {
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
  },
});
