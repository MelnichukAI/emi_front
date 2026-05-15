import { colors } from "@/constants/colors";
import { StyleSheet, View } from "react-native";

export default function ReferenceCompassScreen() {
  return <View style={styles.root}></View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
