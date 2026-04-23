import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function OaeQuestionnaireScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Назад</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Опросник на алекситимию (ОАЭ)</Text>
      <Text style={styles.subtitle}>
        Содержание опросника будет добавлено позже.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 16,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
  },
});
