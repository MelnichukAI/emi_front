import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  title: string;
  onPress?: () => void;
  icon?: ReactNode;
};

export default function SecondaryButton({ title, onPress, icon }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.inner}>
        {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 14,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconSlot: {
    marginRight: -2,
  },
  text: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
});
