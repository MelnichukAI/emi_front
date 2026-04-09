import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  title: string;
  onPress?: () => void;
};

export default function SecondaryButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  text: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "500",
  },
});
