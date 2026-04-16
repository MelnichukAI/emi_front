import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function TherapistHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ветка терапевта в разработке</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
  },
});
