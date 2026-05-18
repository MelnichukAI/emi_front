import { colors } from "@/constants/colors";
import { StyleSheet, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function CompassCard({
  children,
}: Props) {
  console.log("REAL CompassCard file loaded");
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 40,
    marginTop: 8,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",

    shadowColor: "#2D2A45",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
});