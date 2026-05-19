import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  filtersActive: boolean;
  onOpenFilters: () => void;
  onResetFilters: () => void;
};

export default function CompassFilterToolbar({
  filtersActive,
  onOpenFilters,
  onResetFilters,
}: Props) {
  return (
    <View style={styles.toolbar}>
      <Pressable
        onPress={onOpenFilters}
        style={({ pressed }) => [
          styles.button,
          filtersActive &&
            styles.buttonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="funnel-outline"
          size={20}
          color={
            filtersActive
              ? colors.surface
              : colors.primary
          }
        />

        <Text
          style={[
            styles.buttonText,
            filtersActive &&
              styles.buttonTextActive,
          ]}
        >
          Фильтр
        </Text>
      </Pressable>

      {filtersActive ? (
        <Pressable
          onPress={onResetFilters}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.resetText}>
            Сбросить
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 18,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    paddingVertical: 12,
    paddingHorizontal: 18,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: colors.primary,

    backgroundColor: colors.surface,
  },

  buttonActive: {
    backgroundColor: colors.primary,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },

  buttonTextActive: {
    color: colors.surface,
  },

  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: colors.primary,

    backgroundColor: colors.surface,
  },

  resetText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },

  pressed: {
    opacity: 0.9,
  },
});